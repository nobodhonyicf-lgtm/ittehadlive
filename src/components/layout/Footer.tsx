import { useSiteSettings } from "@/hooks/useData";

const Footer = () => {
  const { data: settings } = useSiteSettings();

  return (
    <footer className="bg-primary text-primary-foreground mt-8">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-3">
              {settings?.site_name || "ইত্তেহাদুল মাদারিসিল খুসুসিয়্যাহ"}
            </h3>
            <p className="text-sm opacity-80">
              {settings?.site_description || "প্রাইভেট মাদরাসাগুলোর একটি সমন্বিত সংগঠন"}
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-3">যোগাযোগ</h3>
            <p className="text-sm opacity-80">ফোন: {settings?.contact_phone || "০১৯২৬-৪২৮৯৮৮"}</p>
            <p className="text-sm opacity-80">ইমেইল: {settings?.contact_email || "info@ittehad.bd"}</p>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-3">গুরুত্বপূর্ণ লিংক</h3>
            <ul className="text-sm opacity-80 space-y-1">
              <li><a href="/page/about" className="hover:underline">আমাদের সম্পর্কে</a></li>
              <li><a href="/contact" className="hover:underline">যোগাযোগ</a></li>
              <li><a href="/posts" className="hover:underline">সাম্প্রতিক খবর</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-primary-foreground/20 mt-6 pt-4 text-center text-sm opacity-70">
          {settings?.copyright_text || "© ২০২৪ ইত্তেহাদুল মাদারিসিল খুসুসিয়্যাহ। সর্বস্বত্ব সংরক্ষিত।"}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
