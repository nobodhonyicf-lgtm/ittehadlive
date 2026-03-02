import jsPDF from "jspdf";
import html2canvas from "html2canvas";
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
  photo_url?: string | null;
  exam_result?: string | null;
  grade_obtained?: string | null;
  previous_institution?: string | null;
}

export const generateTeacherCV = async (teacher: TeacherData) => {
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-9999px";
  container.style.top = "0";
  container.style.width = "794px";
  container.style.backgroundColor = "#fff";
  container.style.fontFamily = "'Noto Sans Bengali', 'SolaimanLipi', 'Kalpurush', sans-serif";
  container.style.color = "#111";
  container.style.padding = "0";

  const field = (label: string, value: string | null | undefined) => {
    if (!value) return "";
    return `<tr><td style="padding:8px 14px;color:#555;font-size:13px;width:170px;vertical-align:top;border-bottom:1px solid #f0f0f0">${label}</td><td style="padding:8px 14px;font-size:14px;font-weight:500;border-bottom:1px solid #f0f0f0">${value}</td></tr>`;
  };

  const starHtml = (rating: number) => {
    let stars = "";
    for (let i = 1; i <= 5; i++) {
      stars += `<span style="color:${i <= rating ? '#f59e0b' : '#ddd'};font-size:16px">★</span>`;
    }
    return stars;
  };

  // Use site logo
  const logoUrl = document.querySelector<HTMLImageElement>('.site-logo-img')?.src || '';

  container.innerHTML = `
    <div style="background:linear-gradient(135deg,#164e63,#0e7490);color:#fff;padding:24px 32px">
      <div style="display:flex;align-items:center;justify-content:space-between">
        <div style="display:flex;align-items:center;gap:14px">
          ${logoUrl ? `<img src="${logoUrl}" crossorigin="anonymous" style="width:50px;height:50px;border-radius:10px;object-fit:contain;background:white;padding:4px" />` : ''}
          <div>
            <h1 style="font-size:18px;margin:0;font-weight:700">ইত্তেহাদুল মাদারিসিল খুসুসিয়্যাহ</h1>
            <p style="font-size:11px;margin:2px 0 0;opacity:0.8">শিক্ষক সার্ভিস সেন্টার — জীবনবৃত্তান্ত</p>
          </div>
        </div>
        <div style="text-align:right;opacity:0.7;font-size:11px">
          <p style="margin:0">তারিখ: ${new Date().toLocaleDateString("bn-BD")}</p>
        </div>
      </div>
    </div>
    
    <div style="padding:24px 32px">
      <div style="display:flex;align-items:center;gap:18px;margin-bottom:22px;padding-bottom:18px;border-bottom:2px solid #e5e7eb">
        ${teacher.photo_url ? `<img src="${teacher.photo_url}" crossorigin="anonymous" style="width:85px;height:85px;border-radius:14px;object-fit:cover;border:3px solid #e5e7eb" />` : `<div style="width:85px;height:85px;border-radius:14px;background:#f0f9ff;display:flex;align-items:center;justify-content:center;font-size:40px">👨‍🏫</div>`}
        <div>
          <h2 style="font-size:22px;margin:0 0 4px 0;font-weight:700">${teacher.name} ${teacher.is_verified ? '<span style="color:#3b82f6;font-size:13px">✓ যাচাইকৃত</span>' : ''}</h2>
          <p style="font-size:15px;color:#555;margin:0">${teacher.subject}</p>
          ${teacher.rating && teacher.rating > 0 ? `<div style="margin-top:6px">${starHtml(Math.round(teacher.rating))} <span style="font-size:12px;color:#666">(${toBengaliNumber(teacher.rating.toFixed(1))})</span></div>` : ''}
        </div>
      </div>

      <div style="background:#f8fafc;border-radius:10px;padding:4px 0;margin-bottom:18px;border:1px solid #e5e7eb">
        <h3 style="font-size:14px;color:#164e63;padding:10px 14px;margin:0;border-bottom:1px solid #e5e7eb;font-weight:700">ব্যক্তিগত তথ্য</h3>
        <table style="width:100%;border-collapse:collapse">
          ${field("নাম", teacher.name)}
          ${field("বিষয়", teacher.subject)}
          ${field("জেলা", teacher.district)}
          ${field("ঠিকানা", teacher.address)}
          ${field("ফোন", teacher.phone ? toBengali(teacher.phone) : null)}
          ${field("ইমেইল", teacher.email)}
        </table>
      </div>

      <div style="background:#f8fafc;border-radius:10px;padding:4px 0;margin-bottom:18px;border:1px solid #e5e7eb">
        <h3 style="font-size:14px;color:#164e63;padding:10px 14px;margin:0;border-bottom:1px solid #e5e7eb;font-weight:700">শিক্ষাগত যোগ্যতা ও অভিজ্ঞতা</h3>
        <table style="width:100%;border-collapse:collapse">
          ${field("যোগ্যতা", teacher.qualification)}
          ${field("বিশেষ দক্ষতা", teacher.specialization)}
          ${field("সার্টিফিকেশন", teacher.certification)}
          ${field("পরীক্ষার ফলাফল", teacher.exam_result)}
          ${field("গ্রেড", teacher.grade_obtained)}
          ${field("অভিজ্ঞতা", teacher.experience_years ? `${toBengaliNumber(teacher.experience_years)} বছর` : null)}
          ${field("পূর্ববর্তী প্রতিষ্ঠান", teacher.previous_institution)}
          ${field("প্রত্যাশিত বেতন", teacher.expected_salary)}
          ${field("পছন্দের এলাকা", teacher.preferred_area)}
        </table>
      </div>

      ${teacher.bio ? `
      <div style="background:#f8fafc;border-radius:10px;padding:4px 0;margin-bottom:18px;border:1px solid #e5e7eb">
        <h3 style="font-size:14px;color:#164e63;padding:10px 14px;margin:0;border-bottom:1px solid #e5e7eb;font-weight:700">জীবনবৃত্তান্ত</h3>
        <p style="padding:12px 14px;font-size:13px;line-height:1.7;color:#444;margin:0;white-space:pre-wrap">${teacher.bio}</p>
      </div>
      ` : ''}

      ${teacher.is_verified ? `
      <div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:10px;padding:12px 18px;margin-bottom:18px;display:flex;align-items:center;gap:10px">
        <span style="font-size:20px">✅</span>
        <span style="font-size:13px;color:#166534;font-weight:600">ইত্তেহাদুল মাদারিসিল খুসুসিয়্যাহ কর্তৃক যাচাইকৃত ও বিশ্বস্ত শিক্ষক</span>
      </div>
      ` : ''}

      <div style="text-align:center;padding-top:18px;border-top:2px solid #e5e7eb;color:#999;font-size:11px">
        <p style="margin:0">ইত্তেহাদুল মাদারিসিল খুসুসিয়্যাহ — শিক্ষক সার্ভিস সেন্টার থেকে তৈরি</p>
        <p style="margin:4px 0 0 0;font-size:10px">এই সিভি স্বয়ংক্রিয়ভাবে তৈরি করা হয়েছে</p>
      </div>
    </div>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.95);
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pdfWidth = 210;
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, Math.min(pdfHeight, 297));
    pdf.save(`সিভি_${teacher.name.replace(/\s+/g, "_")}.pdf`);
  } finally {
    document.body.removeChild(container);
  }
};
