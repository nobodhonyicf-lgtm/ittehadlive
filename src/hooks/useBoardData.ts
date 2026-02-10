import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useBranches = () =>
  useQuery({
    queryKey: ["branches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("branches")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

export const useAllBranches = () =>
  useQuery({
    queryKey: ["all_branches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("branches")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

export const useStudents = (branchId?: string, className?: string) =>
  useQuery({
    queryKey: ["students", branchId, className],
    queryFn: async () => {
      let query = supabase
        .from("students")
        .select("*, branches(name)")
        .eq("is_active", true)
        .order("roll_number");
      if (branchId) query = query.eq("branch_id", branchId);
      if (className) query = query.eq("class_name", className);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

export const useAllStudents = () =>
  useQuery({
    queryKey: ["all_students"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("*, branches(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

export const useExams = () =>
  useQuery({
    queryKey: ["exams"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("exams")
        .select("*")
        .order("year", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

export const useSubjects = (className?: string) =>
  useQuery({
    queryKey: ["subjects", className],
    queryFn: async () => {
      let query = supabase.from("subjects").select("*").order("sort_order");
      if (className) query = query.eq("class_name", className);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

export const useAllSubjects = () =>
  useQuery({
    queryKey: ["all_subjects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subjects")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

export const useResults = (studentId?: string, examId?: string) =>
  useQuery({
    queryKey: ["results", studentId, examId],
    queryFn: async () => {
      let query = supabase
        .from("results")
        .select("*, subjects(name, code, full_marks, pass_marks), exams(name, year), students(name, roll_number, registration_number, class_name, branches(name))");
      if (studentId) query = query.eq("student_id", studentId);
      if (examId) query = query.eq("exam_id", examId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!(studentId || examId),
  });

export const useResultByRoll = (rollNumber: string, examId: string) =>
  useQuery({
    queryKey: ["result_by_roll", rollNumber, examId],
    queryFn: async () => {
      // First find student
      const { data: students, error: sErr } = await supabase
        .from("students")
        .select("id, name, roll_number, registration_number, class_name, father_name, photo_url, branches(name)")
        .eq("roll_number", rollNumber)
        .limit(1);
      if (sErr) throw sErr;
      if (!students || students.length === 0) return null;

      const student = students[0];
      const { data: results, error: rErr } = await supabase
        .from("results")
        .select("*, subjects(name, code, full_marks, pass_marks)")
        .eq("student_id", student.id)
        .eq("exam_id", examId);
      if (rErr) throw rErr;
      return { student, results };
    },
    enabled: !!rollNumber && !!examId,
  });
