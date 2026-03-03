import { useState } from "react";
import SEOHead from "@/components/SEOHead";
import Layout from "@/components/layout/Layout";
import AppLayout from "@/components/app/AppLayout";
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
import { useIsApp } from "@/hooks/useIsApp";

const ResultCheck = () => {
  const isApp = useIsApp();
  const [roll, setRoll] = useState("");
  const [reg, setReg] = useState("");
  const [examId, setExamId] = useState("");
  const [searchRoll, setSearchRoll] = useState("");
  const [searchReg, setSearchReg] = useState("");
  const [searchExam, setSearchExam] = useState("");
  const { data: exams } = useExams();
  const { data: result, isLoading } = useResultByRoll(searchRoll, searchExam, searchReg);
  const { data: branches } = useBranches();

  const { data: settingsMap } = useQuery({
    queryKey: ["site_settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("*");
      if (error) throw error;
      const settings: Record<string, string> = {};
      data?.forEach((s) => {
        settings[s.key] = s.value || "";
      });
      return settings;
    },
  });

  const getSetting = (key: string) => {
    return settingsMap?.[key] || "";
  };

  // Fetch all results for this exam to calculate positions
  const { data: allExamResults } = useQuery({
    queryKey: ["all_exam_results", searchExam],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("results")
        .select("student_id, marks_obtained, subjects(full_marks, pass_marks), students(class_name, branch_id)")
        .eq("exam_id", searchExam);
      if (error) throw error;
      return data;
    },
    enabled: !!searchExam && !!result,
  });

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

  // Calculate board position and class position
  const positions = (() => {
    if (!allExamResults || !result?.student) return { boardPosition: 0, classPosition: 0, totalBoard: 0, totalClass: 0 };
    
    // Group by student and sum total marks
    const studentTotals: Record<string, { total: number; className: string; branchId: string; allPassed: boolean }> = {};
    allExamResults.forEach((r: any) => {
      const sid = r.student_id;
      if (!studentTotals[sid]) {
        studentTotals[sid] = { total: 0, className: r.students?.class_name || "", branchId: r.students?.branch_id || "", allPassed: true };
      }
      const marks = Number(r.marks_obtained) || 0;
      studentTotals[sid].total += marks;
      if (marks < (r.subjects?.pass_marks || 33)) {
        studentTotals[sid].allPassed = false;
      }
    });

    const currentStudentId = result.student.id;
    const currentClass = result.student.class_name;

    // Board position (all students in this exam who passed)
    const allStudents = Object.entries(studentTotals)
      .filter(([, v]) => v.allPassed)
      .sort((a, b) => b[1].total - a[1].total);
    const boardPosition = allStudents.findIndex(([id]) => id === currentStudentId) + 1;

    // Class position (students in same class who passed)
    const classStudents = Object.entries(studentTotals)
      .filter(([, v]) => v.className === currentClass && v.allPassed)
      .sort((a, b) => b[1].total - a[1].total);
    const classPosition = classStudents.findIndex(([id]) => id === currentStudentId) + 1;

    return { 
      boardPosition: passed ? boardPosition : 0, 
      classPosition: passed ? classPosition : 0, 
      totalBoard: allStudents.length, 
      totalClass: classStudents.length 
    };
  })();

  const logoUrl = getSetting("logo_url");

  const Wrapper = isApp ? AppLayout : Layout;

  return (
    <Wrapper>
      <SEOHead title="রেজাল্ট চেক করুন" description="ইত্তেহাদুল মাদারিসের পরীক্ষার ফলাফল — রোল ও রেজিস্ট্রেশন নম্বর দিয়ে রেজাল্ট দেখুন।" keywords="রেজাল্ট, পরীক্ষা, মাদরাসা, ফলাফল" />
      <div className={`max-w-4xl mx-auto px-4 ${isApp ? 'py-4' : 'py-8'}`}>
        <div className="text-center mb-6 print:hidden">
          {isApp ? (
            <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-2xl p-6 mb-4 shadow-lg">
              <div className="h-14 w-14 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
                <GraduationCap size={28} />
              </div>
              <h1 className="text-xl font-bold">রেজাল্ট চেক করুন</h1>
              <p className="text-sm opacity-80 mt-1">রোল ও রেজিস্ট্রেশন নম্বর দিয়ে খুঁজুন</p>
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-primary flex items-center justify-center gap-3">
                <GraduationCap size={32} />
                রেজাল্ট চেক করুন
              </h1>
              <p className="text-muted-foreground mt-2">রোল নম্বর, রেজিস্ট্রেশন নম্বর ও পরীক্ষা দিয়ে রেজাল্ট দেখুন</p>
            </>
          )}
        </div>

        <Card className={`mb-6 print:hidden ${isApp ? 'border-0 shadow-md rounded-2xl' : 'border-t-4 border-t-accent'}`}>
          <CardContent className={isApp ? 'p-4' : 'p-6'}>
            <form onSubmit={handleSearch} className="space-y-3">
              <Input placeholder="রোল নম্বর লিখুন *" value={roll} onChange={e => setRoll(e.target.value)} required className={isApp ? 'rounded-xl h-11' : ''} />
              <Input placeholder="রেজিস্ট্রেশন নম্বর লিখুন *" value={reg} onChange={e => setReg(e.target.value)} required className={isApp ? 'rounded-xl h-11' : ''} />
              <Select value={examId} onValueChange={setExamId}>
                <SelectTrigger className={isApp ? 'rounded-xl h-11' : ''}><SelectValue placeholder="পরীক্ষা নির্বাচন" /></SelectTrigger>
                <SelectContent>
                  {publishedExams?.map(e => (
                    <SelectItem key={e.id} value={e.id}>{e.name} ({toBengali(e.year)})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="submit" disabled={!roll || !reg || !examId || isLoading} className={`gap-2 w-full ${isApp ? 'rounded-xl h-11' : ''}`}>
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
                  <Card className="border-2 border-primary/30 print:border-black print:shadow-none relative overflow-hidden" id="result-card">
                    {/* Watermark */}
                    {logoUrl && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                        <img src={logoUrl} alt="" className="w-72 h-72 object-contain opacity-[0.06] print:opacity-[0.04]" />
                      </div>
                    )}
                    
                    <CardHeader className="bg-primary/5 print:bg-white text-center border-b-2 border-primary/20 print:border-black relative z-10">
                      <div className="flex flex-col items-center gap-1">
                        {logoUrl && (
                          <img src={logoUrl} alt="Logo" className="h-20 mb-1" />
                        )}
                        <CardTitle className="text-primary print:text-black text-2xl font-bold">
                          ইত্তেহাদুল মাদারিসিল খুসুসিয়্যাহ
                        </CardTitle>
                        <p className="text-sm text-muted-foreground print:text-black">{selectedExam?.name} — {toBengali(selectedExam?.year || "")}</p>
                        <h2 className="text-lg font-bold mt-1 border-b-2 border-primary/30 pb-1 px-8">মার্কশিট</h2>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 print:p-4 relative z-10">
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
                          <p><strong>রোল:</strong> {toBengali(result.student.roll_number)}</p>
                          <p><strong>রেজিস্ট্রেশন:</strong> {result.student.registration_number ? toBengali(result.student.registration_number) : "—"}</p>
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

                      {/* Board & Class Position */}
                      {passed && positions.boardPosition > 0 && (
                        <div className="mt-4 grid grid-cols-2 gap-4 text-center text-sm">
                          <div className="p-3 bg-primary/5 print:bg-card rounded border-2 border-primary/20">
                            <p className="text-muted-foreground">বোর্ড অবস্থান</p>
                            <p className="text-2xl font-bold text-primary">
                              {toBengali(positions.boardPosition)} / {toBengali(positions.totalBoard)}
                            </p>
                          </div>
                          <div className="p-3 bg-primary/5 print:bg-card rounded border-2 border-primary/20">
                            <p className="text-muted-foreground">শ্রেণি অবস্থান</p>
                            <p className="text-2xl font-bold text-primary">
                              {toBengali(positions.classPosition)} / {toBengali(positions.totalClass)}
                            </p>
                          </div>
                        </div>
                      )}

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
    </Wrapper>
  );
};

export default ResultCheck;
