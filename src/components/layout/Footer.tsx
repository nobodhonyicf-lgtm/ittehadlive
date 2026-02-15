import { useSiteSettings } from "@/hooks/useData";
import { Phone, Mail, MapPin } from "lucide-react";
import logoImg from "@/assets/logo.png";
import { toBengali } from "@/lib/bengali";

const Footer = () => {
  const { data: settings } = useSiteSettings();

  return (
    <footer className="bg-primary text-primary-foreground mt-8">
      <div className="max-w-[1200px] mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <img src={logoImg} alt="Logo" className="h-16 mb-3 object-contain" />
            <h3 className="text-lg font-bold mb-2">
              {settings?.site_name || "ইত্তেহাদুল মাদারিসিল খুসুসিয়্যাহ"}
            </h3>
            <p className="text-sm opacity-80 leading-relaxed">
              {settings?.site_description || "প্রাইভেট মাদরাসাগুলোর একটি সমন্বিত সংগঠন"}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-3">গুরুত্বপূর্ণ লিংক</h3>
            <ul className="text-sm opacity-80 space-y-2">
              <li><a href="/page/about" className="hover:underline hover:opacity-100 transition-opacity">আমাদের সম্পর্কে</a></li>
              <li><a href="/posts" className="hover:underline hover:opacity-100 transition-opacity">সাম্প্রতিক খবর</a></li>
              <li><a href="/result" className="hover:underline hover:opacity-100 transition-opacity">রেজাল্ট দেখুন</a></li>
              <li><a href="/branches" className="hover:underline hover:opacity-100 transition-opacity">শাখা সমূহ</a></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-bold mb-3">সেবা সমূহ</h3>
            <ul className="text-sm opacity-80 space-y-2">
              <li><a href="/students" className="hover:underline hover:opacity-100 transition-opacity">শিক্ষার্থী ডিরেক্টরি</a></li>
              <li><a href="/contact" className="hover:underline hover:opacity-100 transition-opacity">যোগাযোগ</a></li>
              
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold mb-3">যোগাযোগ</h3>
            <ul className="text-sm opacity-80 space-y-2">
              <li className="flex items-center gap-2">
                <Phone size={14} className="shrink-0" />
                {toBengali(settings?.contact_phone || "০১৯২৬-৪২৮৯৮৮")}
              </li>
              <li className="flex items-center gap-2">
                <Mail size={14} className="shrink-0" />
                {settings?.contact_email || "info@ittehad.bd"}
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={14} className="shrink-0 mt-0.5" />
                <span>{settings?.contact_address || "মারকাযুস সুন্নাহ ক্যাডেট মাদরাসা, ওয়াবদারপুল তালতলা বাজার, ফতুল্লা, নারায়ণগঞ্জ"}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-4 text-center text-sm opacity-60">
          {toBengali(settings?.copyright_text || "© ২০২৪ ইত্তেহাদুল মাদারিসিল খুসুসিয়্যাহ। সর্বস্বত্ব সংরক্ষিত।")}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
