import jsPDF from "jspdf";
import { toBengali, toBengaliNumber } from "@/lib/bengali";

interface TeacherData {
  name: string;
  subject: string;
  phone?: string | null;
  email?: string | null;
  district?: string | null;
  address?: string | null;
  qualification?: string | null;
  specialization?: string | null;
  certification?: string | null;
  experience_years?: number | null;
  expected_salary?: string | null;
  preferred_area?: string | null;
  bio?: string | null;
  is_verified?: boolean | null;
  rating?: number | null;
}

export const generateTeacherCV = (teacher: TeacherData) => {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  // Use built-in Helvetica (no Bengali font in jsPDF by default)
  // We'll use unicode text rendering
  const pageWidth = 210;
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  // Header bar
  doc.setFillColor(22, 78, 99); // primary-ish color
  doc.rect(0, 0, pageWidth, 35, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.text("Teacher CV / Resume", pageWidth / 2, 15, { align: "center" });
  doc.setFontSize(10);
  doc.text("Ittehad ul Madarisil Khususiyyah", pageWidth / 2, 23, { align: "center" });
  doc.text("Teacher Service Center", pageWidth / 2, 29, { align: "center" });

  y = 45;
  doc.setTextColor(0, 0, 0);

  const addField = (label: string, value: string) => {
    if (!value) return;
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(label, margin, y);
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(value, margin + 45, y);
    y += 8;
  };

  const addSection = (title: string) => {
    y += 4;
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, y - 4, contentWidth, 8, "F");
    doc.setFontSize(11);
    doc.setTextColor(22, 78, 99);
    doc.text(title, margin + 3, y + 1);
    doc.setTextColor(0, 0, 0);
    y += 10;
  };

  // Personal Info
  addSection("Personal Information");
  addField("Name:", teacher.name);
  addField("Subject:", teacher.subject);
  if (teacher.district) addField("District:", teacher.district);
  if (teacher.address) addField("Address:", teacher.address);
  if (teacher.phone) addField("Phone:", teacher.phone);
  if (teacher.email) addField("Email:", teacher.email);

  // Qualifications
  addSection("Qualifications & Experience");
  if (teacher.qualification) addField("Qualification:", teacher.qualification);
  if (teacher.specialization) addField("Specialization:", teacher.specialization);
  if (teacher.certification) addField("Certification:", teacher.certification);
  if (teacher.experience_years) addField("Experience:", `${teacher.experience_years} years`);
  if (teacher.expected_salary) addField("Expected Salary:", teacher.expected_salary);
  if (teacher.preferred_area) addField("Preferred Area:", teacher.preferred_area);

  // Verification
  if (teacher.is_verified) {
    addSection("Verification Status");
    doc.setFontSize(10);
    doc.setTextColor(22, 128, 22);
    doc.text("Verified by Ittehad ul Madarisil Khususiyyah", margin, y);
    doc.setTextColor(0, 0, 0);
    y += 8;
  }

  if (teacher.rating && teacher.rating > 0) {
    addField("Rating:", `${teacher.rating.toFixed(1)} / 5.0`);
  }

  // Bio
  if (teacher.bio) {
    addSection("About / Bio");
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(teacher.bio, contentWidth);
    doc.text(lines, margin, y);
    y += lines.length * 5;
  }

  // Footer
  y = 280;
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text("Generated from Ittehad ul Madarisil Khususiyyah - Teacher Service Center", pageWidth / 2, y, { align: "center" });
  doc.text(`Date: ${new Date().toLocaleDateString("en-GB")}`, pageWidth / 2, y + 4, { align: "center" });

  doc.save(`CV_${teacher.name.replace(/\s+/g, "_")}.pdf`);
};
