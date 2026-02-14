// Bangladesh Qawmi Board Grading System
export interface GradeInfo {
  grade: string;
  gpa: number;
}

export const getGradeFromMarks = (marks: number, fullMarks: number): GradeInfo => {
  const percentage = (marks / fullMarks) * 100;
  
  if (percentage >= 80) return { grade: "A+", gpa: 5.00 };
  if (percentage >= 70) return { grade: "A", gpa: 4.00 };
  if (percentage >= 60) return { grade: "A-", gpa: 3.50 };
  if (percentage >= 50) return { grade: "B", gpa: 3.00 };
  if (percentage >= 40) return { grade: "C", gpa: 2.00 };
  if (percentage >= 33) return { grade: "D", gpa: 1.00 };
  return { grade: "F", gpa: 0.00 };
};

export const getOverallGPA = (results: { marks_obtained: number | null; gpa: number | null; subjects?: { full_marks?: number; pass_marks?: number } | null }[]): number => {
  if (!results || results.length === 0) return 0;
  
  // Check if any subject failed
  const hasFailed = results.some(r => {
    const marks = Number(r.marks_obtained) || 0;
    const passMark = r.subjects?.pass_marks || 33;
    return marks < passMark;
  });
  
  if (hasFailed) return 0;
  
  const totalGpa = results.reduce((sum, r) => sum + (Number(r.gpa) || 0), 0);
  return Number((totalGpa / results.length).toFixed(2));
};

export const getOverallGrade = (gpa: number): string => {
  if (gpa >= 5.00) return "A+";
  if (gpa >= 4.00) return "A";
  if (gpa >= 3.50) return "A-";
  if (gpa >= 3.00) return "B";
  if (gpa >= 2.00) return "C";
  if (gpa >= 1.00) return "D";
  return "F";
};
