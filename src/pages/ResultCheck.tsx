import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useExams, useResultByRoll } from "@/hooks/useBoardData";
import { GraduationCap, Search, User, Printer } from "lucide-react";

const ResultCheck = () => {
  const [roll, setRoll] = useState("");
  const [examId, setExamId] = useState("");
  const [searchRoll, setSearchRoll] = useState("");
  const [searchExam, setSearchExam] = useState("");
  const { data: exams } = useExams();
  const { data: result, isLoading } = useResultByRoll(searchRoll, searchExam);

  const publishedExams = exams?.filter(e => e.is_published);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchRoll(roll);
    setSearchExam(examId);
  };

  const totalMarks = result?.results?.reduce((sum, r) => sum + (Number(r.marks_obtained) || 0), 0) || 0;
  const totalFull = result?.results?.reduce((sum, r) => sum + (r.subjects?.full_marks || 100), 0) || 0;
  const totalGpa = result?.results?.length
    ? (result.results.reduce((sum, r) => sum + (Number(r.gpa) || 0), 0) / result.results.length).toFixed(2)
    : "0.00";
  const passed = result?.results?.every(r => (Number(r.marks_obtained) || 0) >= (r.subjects?.pass_marks || 33));

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary flex items-center justify-center gap-3">
            <GraduationCap size={32} />
            রেজাল্ট চেক করুন
          </h1>
          <p className="text-muted-foreground mt-2">রোল নম্বর ও পরীক্ষা দিয়ে রেজাল্ট দেখুন</p>
        </div>

        {/* Search Form */}
        <Card className="mb-8 border-t-4 border-t-accent">
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="রোল নম্বর লিখুন"
                value={roll}
                onChange={e => setRoll(e.target.value)}
                required
              />
              <Select value={examId} onValueChange={setExamId} required>
                <SelectTrigger><SelectValue placeholder="পরীক্ষা নির্বাচন" /></SelectTrigger>
                <SelectContent>
                  {publishedExams?.map(e => (
                    <SelectItem key={e.id} value={e.id}>{e.name} ({e.year})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="submit" disabled={!roll || !examId || isLoading} className="gap-2">
                <Search size={16} />
                {isLoading ? "খোঁজা হচ্ছে..." : "রেজাল্ট দেখুন"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Result Display */}
        {searchRoll && searchExam && !isLoading && (
          <>
            {result ? (
              <Card className="border-t-4 border-t-primary" id="result-card">
                <CardHeader className="bg-primary/5">
                  <CardTitle className="text-primary text-center">মার্কশিট</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {/* Student Info */}
                  <div className="flex items-start gap-4 mb-6 p-4 bg-secondary/50 rounded-lg">
                    <div className="w-20 h-20 rounded-lg bg-card border-2 border-primary/20 flex items-center justify-center overflow-hidden shrink-0">
                      {result.student.photo_url ? (
                        <img src={result.student.photo_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User className="text-primary" size={32} />
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm flex-1">
                      <p><strong>নাম:</strong> {result.student.name}</p>
                      <p><strong>রোল:</strong> {result.student.roll_number}</p>
                      <p><strong>রেজিস্ট্রেশন:</strong> {result.student.registration_number || "—"}</p>
                      <p><strong>ক্লাস:</strong> {result.student.class_name}</p>
                    </div>
                  </div>

                  {/* Marks Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className="bg-primary text-primary-foreground">
                          <th className="border border-primary/30 px-3 py-2 text-right">বিষয়</th>
                          <th className="border border-primary/30 px-3 py-2 text-center">পূর্ণমান</th>
                          <th className="border border-primary/30 px-3 py-2 text-center">প্রাপ্ত নম্বর</th>
                          <th className="border border-primary/30 px-3 py-2 text-center">গ্রেড</th>
                          <th className="border border-primary/30 px-3 py-2 text-center">জিপিএ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.results?.map((r, i) => {
                          const failed = (Number(r.marks_obtained) || 0) < (r.subjects?.pass_marks || 33);
                          return (
                            <tr key={r.id} className={`${i % 2 === 0 ? "bg-card" : "bg-secondary/30"} ${failed ? "text-destructive" : ""}`}>
                              <td className="border border-border px-3 py-2">{r.subjects?.name}</td>
                              <td className="border border-border px-3 py-2 text-center">{r.subjects?.full_marks}</td>
                              <td className="border border-border px-3 py-2 text-center font-bold">{r.marks_obtained}</td>
                              <td className="border border-border px-3 py-2 text-center">{r.grade || "—"}</td>
                              <td className="border border-border px-3 py-2 text-center">{r.gpa || "—"}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="bg-primary/10 font-bold">
                          <td className="border border-border px-3 py-2">মোট</td>
                          <td className="border border-border px-3 py-2 text-center">{totalFull}</td>
                          <td className="border border-border px-3 py-2 text-center">{totalMarks}</td>
                          <td className="border border-border px-3 py-2 text-center">{passed ? "পাস" : "ফেল"}</td>
                          <td className="border border-border px-3 py-2 text-center">{totalGpa}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  <div className="mt-4 text-center">
                    <Button variant="outline" className="gap-2" onClick={() => window.print()}>
                      <Printer size={16} /> প্রিন্ট করুন
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-12 text-center text-muted-foreground">
                  <GraduationCap className="mx-auto mb-4" size={48} />
                  <p>এই রোল নম্বরের কোনো রেজাল্ট পাওয়া যায়নি</p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default ResultCheck;
