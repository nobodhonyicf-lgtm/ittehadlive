import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useExams, useResultByRoll, useBranches } from "@/hooks/useBoardData";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { GraduationCap, Search, User, Printer } from "lucide-react";
import { getGradeFromMarks, getOverallGPA, getOverallGrade } from "@/lib/grading";
import { toBengali } from "@/lib/bengali";

const ResultCheck = () => {
  const [roll, setRoll] = useState("");
  const [reg, setReg] = useState("");
  const [examId, setExamId] = useState("");
  const [searchRoll, setSearchRoll] = useState("");
  const [searchReg, setSearchReg] = useState("");
  const [searchExam, setSearchExam] = useState("");
  const { data: exams } = useExams();
  const { data: result, isLoading } = useResultByRoll(searchRoll, searchExam, searchReg);
  const { data: branches } = useBranches();

  const { data: settings } = useQuery({
    queryKey: ["site_settings"],
    queryFn: async () => {
      const { data } = await supabase.from("site_settings").select("*");
      return data || [];
    },
  });

  const getSetting = (key: string) => settings?.find((s: any) => s.key === key)?.value || "";

  const publishedExams = exams?.filter(e => e.is_published);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchRoll(roll);
    setSearchReg(reg);
    setSearchExam(examId);
  };

  const selectedExam = exams?.find(e => e.id === searchExam);
  const studentBranch = branches?.find(b => b.id === result?.student?.branch_id);

  const resultsWithGrade = result?.results?.map(r => {
    const marks = Number(r.marks_obtained) || 0;
    const fullMarks = r.subjects?.full_marks || 100;
    const computed = getGradeFromMarks(marks, fullMarks);
    return {
      ...r,
      computed_grade: r.grade || computed.grade,
      computed_gpa: Number(r.gpa) || computed.gpa,
    };
  });

  const totalMarks = resultsWithGrade?.reduce((sum, r) => sum + (Number(r.marks_obtained) || 0), 0) || 0;
  const totalFull = resultsWithGrade?.reduce((sum, r) => sum + (r.subjects?.full_marks || 100), 0) || 0;
  const overallGPA = resultsWithGrade ? getOverallGPA(resultsWithGrade.map(r => ({ ...r, gpa: r.computed_gpa }))) : 0;
  const overallGrade = getOverallGrade(overallGPA);
  const passed = resultsWithGrade?.every(r => (Number(r.marks_obtained) || 0) >= (r.subjects?.pass_marks || 33));

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8 print:hidden">
          <h1 className="text-3xl font-bold text-primary flex items-center justify-center gap-3">
            <GraduationCap size={32} />
            রেজাল্ট চেক করুন
          </h1>
          <p className="text-muted-foreground mt-2">রোল নম্বর, রেজিস্ট্রেশন নম্বর ও পরীক্ষা দিয়ে রেজাল্ট দেখুন</p>
        </div>

        <Card className="mb-8 border-t-4 border-t-accent print:hidden">
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input placeholder="রোল নম্বর লিখুন *" value={roll} onChange={e => setRoll(e.target.value)} required />
              <Input placeholder="রেজিস্ট্রেশন নম্বর লিখুন *" value={reg} onChange={e => setReg(e.target.value)} required />
              <Select value={examId} onValueChange={setExamId}>
                <SelectTrigger><SelectValue placeholder="পরীক্ষা নির্বাচন" /></SelectTrigger>
                <SelectContent>
                  {publishedExams?.map(e => (
                    <SelectItem key={e.id} value={e.id}>{e.name} ({e.year})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="submit" disabled={!roll || !reg || !examId || isLoading} className="gap-2">
                <Search size={16} />
                {isLoading ? "খোঁজা হচ্ছে..." : "রেজাল্ট দেখুন"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {searchRoll && searchExam && !isLoading && (
          <div>
            {result ? (
              <div>
                <div id="printable-marksheet">
                  <Card className="border-2 border-primary/30 print:border-black print:shadow-none" id="result-card">
                    <CardHeader className="bg-primary/5 print:bg-white text-center border-b-2 border-primary/20 print:border-black">
                      <div className="flex flex-col items-center gap-1">
                        {getSetting("logo_url") && (
                          <img src={getSetting("logo_url")} alt="Logo" className="h-16 mb-1" />
                        )}
                        <CardTitle className="text-primary print:text-black text-xl">{getSetting("site_name") || "ইত্তেহাদুল মাদারিস"}</CardTitle>
                        <p className="text-sm text-muted-foreground print:text-black">{selectedExam?.name} — {selectedExam?.year}</p>
                        <h2 className="text-lg font-bold mt-1">মার্কশিট</h2>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 print:p-4">
                      <div className="flex items-start gap-4 mb-6 p-4 bg-secondary/50 print:bg-white rounded-lg border border-border print:border-black">
                        <div className="w-24 h-28 rounded border-2 border-primary/20 print:border-black flex items-center justify-center overflow-hidden shrink-0">
                          {result.student.photo_url ? (
                            <img src={result.student.photo_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <User className="text-primary print:text-black" size={32} />
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 text-sm flex-1">
                          <p><strong>নাম:</strong> {result.student.name}</p>
                          <p><strong>রোল:</strong> {result.student.roll_number}</p>
                          <p><strong>রেজিস্ট্রেশন:</strong> {result.student.registration_number || "—"}</p>
                          <p><strong>শ্রেণি:</strong> {result.student.class_name}</p>
                          <p><strong>পিতার নাম:</strong> {result.student.father_name || "—"}</p>
                          <p><strong>মাতার নাম:</strong> {result.student.mother_name || "—"}</p>
                          <p><strong>প্রতিষ্ঠান:</strong> {studentBranch?.name || "—"}</p>
                          <p><strong>ঠিকানা:</strong> {result.student.address || "—"}</p>
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm border-2 border-primary/30 print:border-black">
                          <thead>
                            <tr className="bg-primary text-primary-foreground print:bg-muted print:text-foreground">
                              <th className="border border-primary/30 print:border-black px-3 py-2 text-right">বিষয়</th>
                              <th className="border border-primary/30 print:border-black px-3 py-2 text-center">পূর্ণমান</th>
                              <th className="border border-primary/30 print:border-black px-3 py-2 text-center">পাশ নম্বর</th>
                              <th className="border border-primary/30 print:border-black px-3 py-2 text-center">প্রাপ্ত নম্বর</th>
                            </tr>
                          </thead>
                          <tbody>
                            {resultsWithGrade?.map((r, i) => {
                              const failed = (Number(r.marks_obtained) || 0) < (r.subjects?.pass_marks || 33);
                              return (
                                <tr key={r.id} className={`${i % 2 === 0 ? "bg-card" : "bg-secondary/30"} ${failed ? "text-destructive" : ""}`}>
                                  <td className="border border-border print:border-black px-3 py-2">{r.subjects?.name}</td>
                                  <td className="border border-border print:border-black px-3 py-2 text-center">{toBengali(r.subjects?.full_marks || 100)}</td>
                                  <td className="border border-border print:border-black px-3 py-2 text-center">{toBengali(r.subjects?.pass_marks || 33)}</td>
                                  <td className="border border-border print:border-black px-3 py-2 text-center font-bold">{toBengali(r.marks_obtained || 0)}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                          <tfoot>
                            <tr className="bg-primary/10 font-bold">
                              <td className="border border-border print:border-black px-3 py-2">মোট</td>
                              <td className="border border-border print:border-black px-3 py-2 text-center">{toBengali(totalFull)}</td>
                              <td className="border border-border print:border-black px-3 py-2 text-center">—</td>
                              <td className="border border-border print:border-black px-3 py-2 text-center">{toBengali(totalMarks)}</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>

                      <div className="mt-4 grid grid-cols-3 gap-4 text-center text-sm">
                        <div className="p-3 bg-secondary/50 print:bg-card rounded border">
                          <p className="text-muted-foreground">মোট নম্বর</p>
                          <p className="text-xl font-bold text-primary">{toBengali(totalMarks)} / {toBengali(totalFull)}</p>
                        </div>
                        <div className="p-3 bg-secondary/50 print:bg-card rounded border">
                          <p className="text-muted-foreground">জিপিএ</p>
                          <p className="text-xl font-bold text-primary">{toBengali(overallGPA.toFixed(2))}</p>
                        </div>
                        <div className={`p-3 rounded border ${passed ? "bg-secondary/50" : "bg-destructive/10"}`}>
                          <p className="text-muted-foreground">ফলাফল</p>
                          <p className={`text-xl font-bold ${passed ? "text-primary" : "text-destructive"}`}>
                            {passed ? `পাস (${overallGrade})` : "অকৃতকার্য (F)"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-6 text-xs">
                        <p className="font-bold mb-1">গ্রেডিং স্কেল:</p>
                        <div className="grid grid-cols-7 gap-1 text-center">
                          {[
                            { range: "৮০-১০০", grade: "A+", gpa: "৫.০০" },
                            { range: "৭০-৭৯", grade: "A", gpa: "৪.০০" },
                            { range: "৬০-৬৯", grade: "A-", gpa: "৩.৫০" },
                            { range: "৫০-৫৯", grade: "B", gpa: "৩.০০" },
                            { range: "৪০-৪৯", grade: "C", gpa: "২.০০" },
                            { range: "৩৩-৩৯", grade: "D", gpa: "১.০০" },
                            { range: "০-৩২", grade: "F", gpa: "০.০০" },
                          ].map(g => (
                            <div key={g.grade} className="border border-border print:border-black p-1 rounded">
                              <p className="font-bold">{g.grade}</p>
                              <p>{g.range}</p>
                              <p>জিপিএ {g.gpa}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-12 flex justify-between items-end px-4">
                        <div className="text-center">
                          {getSetting("signature_controller") && (
                            <img src={getSetting("signature_controller")} alt="স্বাক্ষর" className="h-12 mx-auto mb-1" />
                          )}
                          <div className="border-t-2 border-foreground pt-1 min-w-[150px]">
                            <p className="text-sm font-semibold">পরীক্ষা নিয়ন্ত্রক</p>
                          </div>
                        </div>
                        <div className="text-center">
                          {getSetting("signature_principal") && (
                            <img src={getSetting("signature_principal")} alt="স্বাক্ষর" className="h-12 mx-auto mb-1" />
                          )}
                          <div className="border-t-2 border-foreground pt-1 min-w-[150px]">
                            <p className="text-sm font-semibold">প্রধান শিক্ষক / মুহতামিম</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-4 text-center print:hidden">
                  <Button variant="outline" className="gap-2" onClick={() => window.print()}>
                    <Printer size={16} /> প্রিন্ট করুন
                  </Button>
                </div>
              </div>
            ) : (
              <Card className="print:hidden">
                <CardContent className="p-12 text-center text-muted-foreground">
                  <GraduationCap className="mx-auto mb-4" size={48} />
                  <p>এই রোল/রেজিস্ট্রেশন নম্বরের কোনো রেজাল্ট পাওয়া যায়নি</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ResultCheck;
