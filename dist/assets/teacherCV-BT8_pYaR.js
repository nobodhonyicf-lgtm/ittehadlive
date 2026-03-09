import{h as g,E as f}from"./pdf-D3Qs2eho.js";import{ai as a,h as b}from"./index-xc9bb4NJ.js";const c=async i=>{var s;const e=document.createElement("div");e.style.position="fixed",e.style.left="-9999px",e.style.top="0",e.style.width="794px",e.style.backgroundColor="#fff",e.style.fontFamily="'Noto Sans Bengali', 'SolaimanLipi', 'Kalpurush', sans-serif",e.style.color="#111",e.style.padding="0";const t=(o,n)=>n?`<tr><td style="padding:8px 14px;color:#555;font-size:13px;width:170px;vertical-align:top;border-bottom:1px solid #f0f0f0">${o}</td><td style="padding:8px 14px;font-size:14px;font-weight:500;border-bottom:1px solid #f0f0f0">${n}</td></tr>`:"",l=o=>{let n="";for(let p=1;p<=5;p++)n+=`<span style="color:${p<=o?"#f59e0b":"#ddd"};font-size:16px">★</span>`;return n},d=((s=document.querySelector(".site-logo-img"))==null?void 0:s.src)||"";e.innerHTML=`
    <div style="background:linear-gradient(135deg,#164e63,#0e7490);color:#fff;padding:24px 32px">
      <div style="display:flex;align-items:center;justify-content:space-between">
        <div style="display:flex;align-items:center;gap:14px">
          ${d?`<img src="${d}" crossorigin="anonymous" style="width:50px;height:50px;border-radius:10px;object-fit:contain;background:white;padding:4px" />`:""}
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
        ${i.photo_url?`<img src="${i.photo_url}" crossorigin="anonymous" style="width:85px;height:85px;border-radius:14px;object-fit:cover;border:3px solid #e5e7eb" />`:'<div style="width:85px;height:85px;border-radius:14px;background:#f0f9ff;display:flex;align-items:center;justify-content:center;font-size:40px">👨‍🏫</div>'}
        <div>
          <h2 style="font-size:22px;margin:0 0 4px 0;font-weight:700">${i.name} ${i.is_verified?'<span style="color:#3b82f6;font-size:13px">✓ যাচাইকৃত</span>':""}</h2>
          <p style="font-size:15px;color:#555;margin:0">${i.subject}</p>
          ${i.rating&&i.rating>0?`<div style="margin-top:6px">${l(Math.round(i.rating))} <span style="font-size:12px;color:#666">(${a(i.rating.toFixed(1))})</span></div>`:""}
        </div>
      </div>

      <div style="background:#f8fafc;border-radius:10px;padding:4px 0;margin-bottom:18px;border:1px solid #e5e7eb">
        <h3 style="font-size:14px;color:#164e63;padding:10px 14px;margin:0;border-bottom:1px solid #e5e7eb;font-weight:700">ব্যক্তিগত তথ্য</h3>
        <table style="width:100%;border-collapse:collapse">
          ${t("নাম",i.name)}
          ${t("বিষয়",i.subject)}
          ${t("জেলা",i.district)}
          ${t("ঠিকানা",i.address)}
          ${t("ফোন",i.phone?b(i.phone):null)}
          ${t("ইমেইল",i.email)}
        </table>
      </div>

      <div style="background:#f8fafc;border-radius:10px;padding:4px 0;margin-bottom:18px;border:1px solid #e5e7eb">
        <h3 style="font-size:14px;color:#164e63;padding:10px 14px;margin:0;border-bottom:1px solid #e5e7eb;font-weight:700">শিক্ষাগত যোগ্যতা ও অভিজ্ঞতা</h3>
        <table style="width:100%;border-collapse:collapse">
          ${t("যোগ্যতা",i.qualification)}
          ${t("বিশেষ দক্ষতা",i.specialization)}
          ${t("সার্টিফিকেশন",i.certification)}
          ${t("পরীক্ষার ফলাফল",i.exam_result)}
          ${t("গ্রেড",i.grade_obtained)}
          ${t("অভিজ্ঞতা",i.experience_years?`${a(i.experience_years)} বছর`:null)}
          ${t("পূর্ববর্তী প্রতিষ্ঠান",i.previous_institution)}
          ${t("প্রত্যাশিত বেতন",i.expected_salary)}
          ${t("পছন্দের এলাকা",i.preferred_area)}
        </table>
      </div>

      ${i.bio?`
      <div style="background:#f8fafc;border-radius:10px;padding:4px 0;margin-bottom:18px;border:1px solid #e5e7eb">
        <h3 style="font-size:14px;color:#164e63;padding:10px 14px;margin:0;border-bottom:1px solid #e5e7eb;font-weight:700">জীবনবৃত্তান্ত</h3>
        <p style="padding:12px 14px;font-size:13px;line-height:1.7;color:#444;margin:0;white-space:pre-wrap">${i.bio}</p>
      </div>
      `:""}

      ${i.is_verified?`
      <div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:10px;padding:12px 18px;margin-bottom:18px;display:flex;align-items:center;gap:10px">
        <span style="font-size:20px">✅</span>
        <span style="font-size:13px;color:#166534;font-weight:600">ইত্তেহাদুল মাদারিসিল খুসুসিয়্যাহ কর্তৃক যাচাইকৃত ও বিশ্বস্ত শিক্ষক</span>
      </div>
      `:""}

      <div style="text-align:center;padding-top:18px;border-top:2px solid #e5e7eb;color:#999;font-size:11px">
        <p style="margin:0">ইত্তেহাদুল মাদারিসিল খুসুসিয়্যাহ — শিক্ষক সার্ভিস সেন্টার থেকে তৈরি</p>
        <p style="margin:4px 0 0 0;font-size:10px">এই সিভি স্বয়ংক্রিয়ভাবে তৈরি করা হয়েছে</p>
      </div>
    </div>
  `,document.body.appendChild(e);try{const o=await g(e,{scale:2,useCORS:!0,allowTaint:!0,backgroundColor:"#ffffff"}),n=o.toDataURL("image/jpeg",.95),p=new f({orientation:"portrait",unit:"mm",format:"a4"}),r=210,x=o.height*r/o.width;p.addImage(n,"JPEG",0,0,r,Math.min(x,297)),p.save(`সিভি_${i.name.replace(/\s+/g,"_")}.pdf`)}finally{document.body.removeChild(e)}};export{c as g};
