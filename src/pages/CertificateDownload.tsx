import { useState, useRef } from "react";
import Layout from "@/components/layout/Layout";
import AppLayout from "@/components/app/AppLayout";
import SEOHead from "@/components/SEOHead";
import { useIsApp } from "@/hooks/useIsApp";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileText, Search, Download, Loader2, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toBengali } from "@/lib/bengali";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface CertificateData {
  studentName: string;
  fatherName: string;
  rollNumber: string;
  registrationNumber: string;
  className: string;
  examName: string;
  examYear: number;
  gpa: number;
  grade: string;
  branchName: string;
  certificateNumber: string;
  issueDate: string;
  verificationCode: string;
}

const CertificateDownload = () => {
  const isApp = useIsApp();
  const [roll, setRoll] = useState("");
  const [regNo, setRegNo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [certData, setCertData] = useState<CertificateData | null>(null);
  const certRef = useRef<HTMLDivElement>(null);

  const handleSearch = async () => {
    if (!roll.trim() || !regNo.trim()) {
      setError("রোল নম্বর এবং রেজিস্ট্রেশন নম্বর উভয়ই দিন।");
      return;
    }
    setLoading(true);
    setError("");
    setCertData(null);

    try {
      // Find student
      const { data: student } = await supabase
        .from("students")
        .select("id, name, father_name, roll_number, registration_number, class_name, branch_id")
        .eq("roll_number", roll.trim())
        .eq("registration_number", regNo.trim())
        .eq("is_active", true)
        .maybeSingle();

      if (!student) {
        setError("এই রোল ও রেজিস্ট্রেশন নম্বরে কোনো শিক্ষার্থী পাওয়া যায়নি।");
        setLoading(false);
        return;
      }

      // Find certificate
      const { data: cert } = await supabase
        .from("certificates")
        .select("id, certificate_number, verification_code, issue_date, status, exam_id, exams(name, year)")
        .eq("student_id", student.id)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!cert) {
        setError("এই শিক্ষার্থীর জন্য কোনো সনদপত্র প্রস্তুত নেই। অফিসে যোগাযোগ করুন।");
        setLoading(false);
        return;
      }

      // Get results for GPA
      const { data: results } = await supabase
        .from("results")
        .select("marks_obtained, gpa, grade, subjects(full_marks, pass_marks)")
        .eq("student_id", student.id)
        .eq("exam_id", cert.exam_id);

      const totalGpa = results && results.length > 0
        ? Number((results.reduce((sum, r) => sum + (Number(r.gpa) || 0), 0) / results.length).toFixed(2))
        : 0;
      const overallGrade = totalGpa >= 5 ? "A+" : totalGpa >= 4 ? "A" : totalGpa >= 3.5 ? "A-" : totalGpa >= 3 ? "B" : totalGpa >= 2 ? "C" : totalGpa >= 1 ? "D" : "F";

      // Get branch name
      let branchName = "—";
      if (student.branch_id) {
        const { data: branch } = await supabase
          .from("branches")
          .select("name")
          .eq("id", student.branch_id)
          .maybeSingle();
        branchName = branch?.name || "—";
      }

      setCertData({
        studentName: student.name,
        fatherName: student.father_name || "—",
        rollNumber: student.roll_number,
        registrationNumber: student.registration_number || "—",
        className: student.class_name,
        examName: (cert as any).exams?.name || "—",
        examYear: (cert as any).exams?.year || 0,
        gpa: totalGpa,
        grade: overallGrade,
        branchName,
        certificateNumber: cert.certificate_number,
        issueDate: cert.issue_date,
        verificationCode: cert.verification_code,
      });
    } catch {
      setError("তথ্য লোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    if (!certRef.current) return;
    const canvas = await html2canvas(certRef.current, { scale: 2, useCORS: true, backgroundColor: "#FFFDF5" });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`সনদপত্র-${certData?.certificateNumber || "certificate"}.pdf`);
  };

  const PageContent = () => (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
      <SEOHead title="সনদপত্র ডাউনলোড | ইত্তেহাদুল মাদারিস" description="আপনার সনদপত্র ডাউনলোড করুন।" />

      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Award className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">সনদপত্র ডাউনলোড</h1>
        <p className="text-muted-foreground text-sm">আপনার রোল ও রেজিস্ট্রেশন নম্বর দিয়ে সনদপত্র বের করুন এবং ডাউনলোড করুন।</p>
      </div>

      {!certData && (
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">রোল নম্বর</label>
              <Input placeholder="রোল নম্বর লিখুন" value={roll} onChange={(e) => setRoll(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">রেজিস্ট্রেশন নম্বর</label>
              <Input placeholder="রেজিস্ট্রেশন নম্বর লিখুন" value={regNo} onChange={(e) => setRegNo(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()} />
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
            <Button onClick={handleSearch} disabled={loading} className="w-full gap-2">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
              সনদপত্র খুঁজুন
            </Button>
          </CardContent>
        </Card>
      )}

      {certData && (
        <div className="space-y-4">
          <div className="flex justify-center gap-3">
            <Button onClick={downloadPDF} className="gap-2"><Download size={16} /> PDF ডাউনলোড</Button>
            <Button variant="outline" onClick={() => { setCertData(null); setRoll(""); setRegNo(""); }}>নতুন অনুসন্ধান</Button>
          </div>

          {/* Certificate Preview */}
          <div className="overflow-x-auto">
            <div
              ref={certRef}
              className="mx-auto"
              style={{
                width: "297mm",
                height: "210mm",
                background: "linear-gradient(135deg, #FFFDF5 0%, #FFF8E7 100%)",
                position: "relative",
                fontFamily: "'Noto Sans Bengali', sans-serif",
                overflow: "hidden",
              }}
            >
              {/* Decorative border */}
              <div style={{
                position: "absolute", inset: "8mm",
                border: "3px double #B8860B",
                borderRadius: "4px",
              }} />
              <div style={{
                position: "absolute", inset: "11mm",
                border: "1px solid #DAA520",
                borderRadius: "2px",
              }} />

              {/* Content */}
              <div style={{ position: "relative", padding: "18mm 28mm", textAlign: "center" }}>
                {/* Header */}
                <div style={{ marginBottom: "6mm" }}>
                  <img
                    src="/images/ittehad-logo.png"
                    alt="Logo"
                    style={{ width: "22mm", height: "22mm", objectFit: "contain", margin: "0 auto 3mm" }}
                    crossOrigin="anonymous"
                  />
                  <h2 style={{ fontSize: "14pt", color: "#1a365d", fontWeight: 700, margin: 0, letterSpacing: "0.5px" }}>
                    ইত্তেহাদুল মাদারিসিল খুসুসিয়্যাহ বাংলাদেশ
                  </h2>
                  <p style={{ fontSize: "8pt", color: "#666", margin: "1mm 0" }}>
                    Ittehadul Madarisil Khususiyah Bangladesh
                  </p>
                  <p style={{ fontSize: "7pt", color: "#888", margin: 0 }}>
                    ২১১/১ আরামবাগ, গোদনাইল, সিদ্ধিরগঞ্জ, নারায়ণগঞ্জ
                  </p>
                </div>

                {/* Divider */}
                <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, #B8860B, transparent)", margin: "4mm auto", width: "70%" }} />

                {/* Title */}
                <h1 style={{ fontSize: "22pt", color: "#B8860B", fontWeight: 700, margin: "4mm 0 2mm", letterSpacing: "1px" }}>
                  সনদপত্র
                </h1>
                <p style={{ fontSize: "10pt", color: "#555", margin: "0 0 6mm" }}>CERTIFICATE</p>

                {/* Body */}
                <p style={{ fontSize: "11pt", lineHeight: "2.2", color: "#333", maxWidth: "200mm", margin: "0 auto" }}>
                  এই মর্মে প্রত্যয়ন করা যাচ্ছে যে, <strong style={{ color: "#1a365d", fontSize: "12pt" }}>{certData.studentName}</strong>,
                  পিতা: <strong>{certData.fatherName}</strong>,
                  রোল নং: <strong>{toBengali(certData.rollNumber)}</strong>,
                  রেজি. নং: <strong>{toBengali(certData.registrationNumber)}</strong>,
                  শ্রেণি: <strong>{certData.className}</strong>,
                  শাখা: <strong>{certData.branchName}</strong>,
                  {toBengali(certData.examYear)} সালের <strong>{certData.examName}</strong> পরীক্ষায় অংশগ্রহণ করে
                  জিপিএ <strong style={{ fontSize: "13pt", color: "#B8860B" }}>{toBengali(certData.gpa.toFixed(2))}</strong> ({certData.grade})
                  প্রাপ্ত হয়ে উত্তীর্ণ হয়েছে।
                </p>

                <p style={{ fontSize: "9pt", color: "#777", marginTop: "5mm" }}>
                  আমরা তার উজ্জ্বল ভবিষ্যৎ কামনা করি।
                </p>

                {/* Footer */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "18mm", padding: "0 10mm" }}>
                  <div style={{ textAlign: "left", fontSize: "7pt", color: "#999" }}>
                    <p style={{ margin: 0 }}>সনদ নং: {certData.certificateNumber}</p>
                    <p style={{ margin: 0 }}>ইস্যু: {certData.issueDate}</p>
                    <p style={{ margin: 0 }}>যাচাই: ittehad.bd/verify?type=certificate</p>
                    <p style={{ margin: 0, fontFamily: "monospace", fontSize: "8pt", fontWeight: 600 }}>{certData.verificationCode}</p>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ width: "50mm", borderTop: "1px solid #333", paddingTop: "2mm" }}>
                      <p style={{ margin: 0, fontSize: "9pt", fontWeight: 600 }}>সভাপতি</p>
                      <p style={{ margin: 0, fontSize: "7pt", color: "#666" }}>ইত্তেহাদুল মাদারিসিল খুসুসিয়্যাহ</p>
                    </div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ width: "50mm", borderTop: "1px solid #333", paddingTop: "2mm" }}>
                      <p style={{ margin: 0, fontSize: "9pt", fontWeight: 600 }}>পরীক্ষা নিয়ন্ত্রক</p>
                      <p style={{ margin: 0, fontSize: "7pt", color: "#666" }}>ইত্তেহাদুল মাদারিসিল খুসুসিয়্যাহ</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return isApp ? <AppLayout><PageContent /></AppLayout> : <Layout><PageContent /></Layout>;
};

export default CertificateDownload;
