import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useBranches = () =>
  useQuery({
    queryKey: ["branches"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_branches_public");
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
      const { data, error } = await supabase.rpc("get_students_public");
      if (error) throw error;
      let filtered = data || [];
      if (branchId) filtered = filtered.filter((s: any) => s.branch_id === branchId);
      if (className) filtered = filtered.filter((s: any) => s.class_name === className);
      return filtered;
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

// Convert Bengali numerals to English for matching
const toEnglishDigits = (str: string) =>
  str.replace(/[০-৯]/g, d => String("০১২৩৪৫৬৭৮৯".indexOf(d)));

export const useResultByRoll = (rollNumber: string, examId: string, regNumber?: string) =>
  useQuery({
    queryKey: ["result_by_roll", rollNumber, examId, regNumber],
    queryFn: async () => {
      const trimmedRoll = toEnglishDigits(rollNumber.trim());
      const trimmedReg = regNumber ? toEnglishDigits(regNumber.trim()) : "";
      
      const { data: students, error: sErr } = await supabase.rpc("get_students_public");
      if (sErr) throw sErr;
      const student = students?.find((s: any) => {
        const sRoll = toEnglishDigits((s.roll_number || "").trim());
        const sReg = toEnglishDigits((s.registration_number || "").trim());
        return sRoll === trimmedRoll && (!trimmedReg || sReg === trimmedReg);
      });
      if (!student) return null;

      // Get additional details via secure RPC
      const { data: details } = await supabase.rpc("get_student_details_for_result", { p_student_id: student.id });
      const detail = details?.[0];

      const { data: results, error: rErr } = await supabase
        .from("results")
        .select("*, subjects(name, code, full_marks, pass_marks)")
        .eq("student_id", student.id)
        .eq("exam_id", examId);
      if (rErr) throw rErr;
      return { 
        student: { 
          ...student, 
          father_name: detail?.father_name || null,
          mother_name: detail?.mother_name || null,
          address: detail?.address || null,
        }, 
        results 
      };
    },
    enabled: !!rollNumber && !!examId,
  });
