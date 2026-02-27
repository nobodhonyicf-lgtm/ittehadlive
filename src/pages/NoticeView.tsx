import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import Sidebar from "@/components/home/Sidebar";
import { Download, Share2, FileImage, FileText } from "lucide-react";
import { useIsApp } from "@/hooks/useIsApp";
import { useSiteSettings } from "@/hooks/useData";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toBengali } from "@/lib/bengali";
import { toast } from "@/components/ui/sonner";

const NoticeView = () => {
  const isApp = useIsApp();
  const { id } = useParams<{ id: string }>();
  const padRef = useRef<HTMLDivElement>(null);
  const [dlOpen, setDlOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const { data: settings } = useSiteSettings();

  const { data: notice, isLoading } = useQuery({
    queryKey: ["notice", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("notices").select("*").eq("id", id!).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const day = toBengali(d.getDate());
    const months = ["জানুয়ারি","ফেব্রুয়ারি","মার্চ","এপ্রিল","মে","জুন","জুলাই","আগস্ট","সেপ্টেম্বর","অক্টোবর","নভেম্বর","ডিসেম্বর"];
    const month = months[d.getMonth()];
    const year = toBengali(d.getFullYear());
    return `${day} ${month}, ${year}`;
  };

  const handleDownloadImage = async () => {
    if (!padRef.current) return;
    setDownloading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(padRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: "#ffffff",
        width: 794,
        height: 1123,
      });
      const link = document.createElement("a");
      link.download = `notice-${notice?.title || "pad"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("ইমেজ ডাউনলোড হয়েছে");
    } catch (e) {
      toast.error("ডাউনলোড ব্যর্থ হয়েছে");
    } finally {
      setDownloading(false);
      setDlOpen(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!padRef.current) return;
    setDownloading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");
      const canvas = await html2canvas(padRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: "#ffffff",
        width: 794,
        height: 1123,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      pdf.addImage(imgData, "PNG", 0, 0, 210, 297);
      pdf.save(`notice-${notice?.title || "pad"}.pdf`);
      toast.success("পিডিএফ ডাউনলোড হয়েছে");
    } catch (e) {
      toast.error("ডাউনলোড ব্যর্থ হয়েছে");
    } finally {
      setDownloading(false);
      setDlOpen(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: notice?.title || "নোটিশ", url });
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("লিংক কপি হয়েছে");
    }
  };

  const orgPhone = settings?.phone || "০১৯১৯-৯২৯১৯৯";
  const orgAddress = settings?.address || "শাহ সুজা জামে মসজিদ, মোগলটুলী, কুমিল্লা।";

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className={`grid grid-cols-1 ${isApp ? "" : "lg:grid-cols-3"} gap-6`}>
          <div className={isApp ? "" : "lg:col-span-2"}>
            {isLoading ? (
              <div className="animate-pulse bg-muted h-96 rounded" />
            ) : notice ? (
              <>
                {/* The Notice Pad */}
                <div
                  ref={padRef}
                  className="bg-white mx-auto shadow-xl border border-border"
                  style={{ width: "794px", maxWidth: "100%", minHeight: "1123px", position: "relative", fontFamily: "'Noto Sans Bengali', 'SolaimanLipi', sans-serif" }}
                >
                  {/* Decorative top border */}
                  <div style={{ height: "8px", background: "linear-gradient(90deg, #0d7a3e, #1a9e52, #0d7a3e)" }} />

                  {/* Islamic border pattern top */}
                  <div className="flex justify-center pt-3 pb-1">
                    <p className="text-xs text-gray-500" style={{ fontFamily: "'Scheherazade New', serif" }}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
                  </div>

                  {/* Header / Position 1 */}
                  <div className="text-center px-8 pb-2">
                    <p className="text-sm text-gray-600 leading-relaxed" dir="rtl" style={{ fontFamily: "'Scheherazade New', serif", fontSize: "16px" }}>
                      اِتِّحَادُ الْمَدَارِسِ الْخُصُوصِيَّة
                    </p>
                    <h1 className="text-xl font-bold text-gray-900 mt-1" style={{ fontSize: "22px" }}>
                      ইত্তেহাদুল মাদারিসিল খুসুসিয়্যাহ
                    </h1>
                    <p className="text-xs text-gray-500 mt-0.5">(প্রাইভেট মাদরাসাগুলোর একটি সমন্বিত সংগঠন)</p>

                    {/* Divider */}
                    <div className="mt-3 mb-2 border-b-2 border-emerald-700" />

                    {/* সূত্র ও তারিখ */}
                    <div className="flex justify-between text-sm text-gray-700 px-2">
                      <span>সূত্র:</span>
                      <span>তারিখ: {formatDate(notice.created_at)}</span>
                    </div>
                  </div>

                  {/* Position 2 - Title */}
                  <div className="text-center px-12 pt-6 pb-4">
                    <h2 className="text-lg font-bold text-gray-900 underline underline-offset-4" style={{ fontSize: "20px" }}>
                      {notice.title}
                    </h2>
                  </div>

                  {/* Content - Middle */}
                  <div className="px-12 pb-16" style={{ minHeight: "500px" }}>
                    <div className="text-base text-gray-800 whitespace-pre-wrap leading-8 text-justify" style={{ fontSize: "15px" }}>
                      {notice.content}
                    </div>
                  </div>

                  {/* Position 4 - Signature (right aligned) */}
                  <div className="px-12 pb-6 flex justify-end">
                    <div className="text-center">
                      {(notice as any).signature_url && (
                        <img
                          src={(notice as any).signature_url}
                          alt="স্বাক্ষর"
                          className="h-16 mx-auto mb-1"
                          crossOrigin="anonymous"
                          style={{ objectFit: "contain" }}
                        />
                      )}
                      <p className="text-sm font-semibold text-gray-800 border-t border-gray-400 pt-1 px-4">সভাপতি</p>
                    </div>
                  </div>

                  {/* Position 3 - Footer */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: "linear-gradient(90deg, #0d7a3e, #1a9e52)",
                      padding: "8px 24px",
                    }}
                  >
                    <p className="text-center text-white text-xs leading-5">
                      স্থায়ী কার্যালয়: {orgAddress}
                      <br />
                      মোবাইল: {orgPhone}
                    </p>
                  </div>
                </div>

                {/* Action buttons below pad */}
                <div className="flex items-center justify-center gap-3 mt-4">
                  <Button variant="outline" className="gap-2" onClick={handleShare}>
                    <Share2 size={16} /> শেয়ার করুন
                  </Button>
                  <Button className="gap-2" onClick={() => setDlOpen(true)}>
                    <Download size={16} /> ডাউনলোড করুন
                  </Button>
                </div>

                {/* Download popup */}
                <Dialog open={dlOpen} onOpenChange={setDlOpen}>
                  <DialogContent className="max-w-xs">
                    <DialogHeader>
                      <DialogTitle>ডাউনলোড ফরম্যাট</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-3 pt-2">
                      <Button
                        variant="outline"
                        className="gap-2 justify-start h-12"
                        onClick={handleDownloadImage}
                        disabled={downloading}
                      >
                        <FileImage size={18} className="text-blue-600" />
                        ইমেজ ডাউনলোড (PNG)
                      </Button>
                      <Button
                        variant="outline"
                        className="gap-2 justify-start h-12"
                        onClick={handleDownloadPdf}
                        disabled={downloading}
                      >
                        <FileText size={18} className="text-red-600" />
                        পিডিএফ ডাউনলোড (PDF)
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </>
            ) : (
              <div className="text-center py-12 text-muted-foreground">নোটিশ পাওয়া যায়নি</div>
            )}
          </div>
          {!isApp && (
            <div className="lg:col-span-1">
              <Sidebar />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default NoticeView;
