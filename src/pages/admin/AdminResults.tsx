import { useState } from "react";
import { useExams, useAllStudents, useAllSubjects } from "@/hooks/useBoardData";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { GraduationCap, Save } from "lucide-react";
import { getGradeFromMarks, getOverallGPA, getOverallGrade } from "@/lib/grading";
import { toBengali } from "@/lib/bengali";

const AdminResults = () => {
  const { data: exams } = useExams();
  const { data: students } = useAllStudents();
  const { data: subjects } = useAllSubjects();
  const qc = useQueryClient();
  const [examId, setExamId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [marks, setMarks] = useState<Record<string, { marks_obtained: string; grade: string; gpa: string }>>({});

  const { data: existingResults } = useQuery({
    queryKey: ["admin_results", studentId, examId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("results")
        .select("*")
        .eq("student_id", studentId)
        .eq("exam_id", examId);
      if (error) throw error;
      return data;
    },
    enabled: !!studentId && !!examId,
  });

  const selectedStudent = students?.find(s => s.id === studentId);
  const relevantSubjects = subjects?.filter(s => !s.class_name || s.class_name === selectedStudent?.class_name);

  // Auto-load when existingResults change
  if (existingResults && Object.keys(marks).length === 0 && existingResults.length > 0) {
    const m: typeof marks = {};
    existingResults.forEach(r => {
      m[r.subject_id] = { marks_obtained: String(r.marks_obtained || ""), grade: r.grade || "", gpa: String(r.gpa || "") };
    });
    setTimeout(() => setMarks(m), 0);
  }

  // Auto-calculate grade when marks change
  const updateMarks = (subjectId: string, value: string, sub: { full_marks: number }) => {
    const num = Number(value);
    const gradeInfo = value && !isNaN(num) ? getGradeFromMarks(num, sub.full_marks) : { grade: "", gpa: 0 };
    setMarks({
      ...marks,
      [subjectId]: {
        marks_obtained: value,
        grade: gradeInfo.grade,
        gpa: gradeInfo.gpa ? gradeInfo.gpa.toFixed(2) : "",
      },
    });
  };

  // Calculate totals
  const filledEntries = relevantSubjects?.filter(s => marks[s.id]?.marks_obtained) || [];
  const totalObtained = filledEntries.reduce((sum, s) => sum + (Number(marks[s.id]?.marks_obtained) || 0), 0);
  const totalFull = filledEntries.reduce((sum, s) => sum + s.full_marks, 0);
  const resultsForGpa = filledEntries.map(s => ({
    marks_obtained: Number(marks[s.id]?.marks_obtained) || 0,
    gpa: Number(marks[s.id]?.gpa) || 0,
    subjects: { pass_marks: s.pass_marks, full_marks: s.full_marks },
  }));
  const overallGPA = getOverallGPA(resultsForGpa);
  const overallGrade = getOverallGrade(overallGPA);

  const handleSave = async () => {
    if (!examId || !studentId) return toast.error("পরীক্ষা ও শিক্ষার্থী নির্বাচন করুন");
    
    const entries = Object.entries(marks).filter(([_, v]) => v.marks_obtained);
    if (entries.length === 0) return toast.error("কমপক্ষে একটি বিষয়ের নম্বর দিন");

    await supabase.from("results").delete().eq("student_id", studentId).eq("exam_id", examId);
    
    const rows = entries.map(([subjectId, v]) => ({
      student_id: studentId,
      exam_id: examId,
      subject_id: subjectId,
      marks_obtained: Number(v.marks_obtained) || 0,
      grade: v.grade || null,
      gpa: Number(v.gpa) || null,
    }));

    const { error } = await supabase.from("results").insert(rows);
    if (error) return toast.error(error.message);
    toast.success("রেজাল্ট সংরক্ষিত হয়েছে");
    qc.invalidateQueries({ queryKey: ["admin_results"] });
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-primary flex items-center gap-2 mb-6"><GraduationCap size={22} /> রেজাল্ট এন্ট্রি</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <Label>পরীক্ষা নির্বাচন *</Label>
          <Select value={examId} onValueChange={v => { setExamId(v); setMarks({}); }}>
            <SelectTrigger><SelectValue placeholder="পরীক্ষা" /></SelectTrigger>
            <SelectContent>{exams?.map(e => <SelectItem key={e.id} value={e.id}>{e.name} ({e.year})</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label>শিক্ষার্থী নির্বাচন *</Label>
          <Select value={studentId} onValueChange={v => { setStudentId(v); setMarks({}); }}>
            <SelectTrigger><SelectValue placeholder="শিক্ষার্থী" /></SelectTrigger>
            <SelectContent>
              {students?.map(s => <SelectItem key={s.id} value={s.id}>{s.name} ({s.roll_number}) — {s.class_name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {examId && studentId && relevantSubjects && (
        <Card>
          <CardContent className="p-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-right p-2">বিষয়</th>
                    <th className="p-2 text-center">পূর্ণমান</th>
                    <th className="p-2 text-center">পাশ নম্বর</th>
                    <th className="p-2 text-center">প্রাপ্ত নম্বর</th>
                    <th className="p-2 text-center">গ্রেড</th>
                    <th className="p-2 text-center">জিপিএ</th>
                  </tr>
                </thead>
                <tbody>
                  {relevantSubjects.map(sub => {
                    const m = marks[sub.id];
                    const failed = m?.marks_obtained && Number(m.marks_obtained) < sub.pass_marks;
                    return (
                      <tr key={sub.id} className={`border-b ${failed ? "bg-destructive/10" : ""}`}>
                        <td className="p-2 font-medium">{sub.name}</td>
                        <td className="p-2 text-center text-muted-foreground">{toBengali(sub.full_marks)}</td>
                        <td className="p-2 text-center text-muted-foreground">{toBengali(sub.pass_marks)}</td>
                        <td className="p-2">
                          <Input
                            type="number"
                            className="w-20 mx-auto text-center"
                            value={m?.marks_obtained || ""}
                            onChange={e => updateMarks(sub.id, e.target.value, sub)}
                          />
                        </td>
                        <td className="p-2 text-center font-semibold">{m?.grade || "—"}</td>
                        <td className="p-2 text-center">{m?.gpa ? toBengali(m.gpa) : "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
                {filledEntries.length > 0 && (
                  <tfoot>
                    <tr className="border-t-2 font-bold bg-primary/5">
                      <td className="p-2">মোট</td>
                      <td className="p-2 text-center">{toBengali(totalFull)}</td>
                      <td className="p-2 text-center">—</td>
                      <td className="p-2 text-center text-primary">{toBengali(totalObtained)}</td>
                      <td className="p-2 text-center text-primary">{overallGrade}</td>
                      <td className="p-2 text-center text-primary">{toBengali(overallGPA.toFixed(2))}</td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
            <Button onClick={handleSave} className="mt-4 w-full gap-2"><Save size={16} /> রেজাল্ট সংরক্ষণ করুন</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminResults;
