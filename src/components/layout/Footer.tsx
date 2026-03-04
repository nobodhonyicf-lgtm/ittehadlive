import { useSiteSettings } from "@/hooks/useData";
import { Phone, Mail, MapPin, Download, Smartphone, Facebook, Youtube, ChevronUp, Send } from "lucide-react";
import { Link } from "react-router-dom";
import logoImg from "@/assets/logo.png";
import { toBengali } from "@/lib/bengali";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

const BackToTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-20 right-4 z-50 p-3 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in"
      aria-label="Back to top"
    >
      <ChevronUp size={20} />
    </button>
  );
};

const Footer = () => {
  const { data: settings } = useSiteSettings();

  return (
    <>
      <BackToTop />
      <footer className="relative bg-primary text-primary-foreground mt-12 overflow-hidden">
        {/* Islamic geometric pattern overlay */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23fff' stroke-width='1'%3E%3Cpath d='M0 0l40 40L0 80zM80 0L40 40l40 40z'/%3E%3Cpath d='M40 0L0 40l40 40 40-40z'/%3E%3Ccircle cx='40' cy='40' r='20'/%3E%3Ccircle cx='40' cy='40' r='10'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '80px 80px'
        }} />

        {/* Top decorative border */}
        <div className="h-1 bg-gradient-to-r from-transparent via-primary-foreground/30 to-transparent" />

        <div className="relative max-w-[1200px] mx-auto px-4 pt-12 pb-6">
          {/* Main content grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* About */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-foreground/10 rounded-xl backdrop-blur-sm">
                  <img src={logoImg} alt="Logo" className="h-14 object-contain" />
                </div>
              </div>
              <h3 className="text-lg font-bold leading-snug">
                {settings?.site_name || "ইত্তেহাদুল মাদারিসিল খুসুসিয়্যাহ"}
              </h3>
              <p className="text-sm opacity-70 leading-relaxed">
                {settings?.site_description || "প্রাইভেট মাদরাসাগুলোর একটি সমন্বিত সংগঠন"}
              </p>

              {/* Social icons */}
              <div className="flex items-center gap-2 pt-2">
                <a
                  href={settings?.facebook_url || "https://www.facebook.com/ittehadbd"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-all duration-300 hover:scale-110"
                  aria-label="Facebook"
                >
                  <Facebook size={18} />
                </a>
                <a
                  href={settings?.youtube_url || "https://www.youtube.com/@ittehadbd"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-all duration-300 hover:scale-110"
                  aria-label="YouTube"
                >
                  <Youtube size={18} />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-base font-bold mb-4 flex items-center gap-2">
                <span className="w-8 h-0.5 bg-primary-foreground/40 rounded-full" />
                গুরুত্বপূর্ণ লিংক
              </h3>
              <ul className="text-sm space-y-2.5">
                {[
                  { href: "/page/about", label: "আমাদের সম্পর্কে" },
                  { href: "/posts", label: "সাম্প্রতিক খবর" },
                  { href: "/result", label: "রেজাল্ট দেখুন" },
                  { href: "/branches", label: "শাখা সমূহ" },
                  { href: "/books", label: "প্রকাশনা" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="opacity-70 hover:opacity-100 transition-all duration-200 hover:translate-x-1 inline-flex items-center gap-1.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-foreground/40" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services + App */}
            <div>
              <h3 className="text-base font-bold mb-4 flex items-center gap-2">
                <span className="w-8 h-0.5 bg-primary-foreground/40 rounded-full" />
                সেবা সমূহ
              </h3>
              <ul className="text-sm space-y-2.5">
                {[
                  { href: "/students", label: "শিক্ষার্থী ডিরেক্টরি" },
                  { href: "/teachers", label: "শিক্ষক সার্ভিস সেন্টার" },
                  { href: "/institution-register", label: "প্রতিষ্ঠান নিবন্ধন" },
                  { href: "/advertise", label: "বিজ্ঞাপন দিন" },
                  { href: "/contact", label: "যোগাযোগ" },
                  { href: "/quran", label: "কুরআন পাঠ" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="opacity-70 hover:opacity-100 transition-all duration-200 hover:translate-x-1 inline-flex items-center gap-1.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-foreground/40" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>

              {/* App download */}
              <div className="mt-5 pt-4 border-t border-primary-foreground/10">
                <Link
                  to="/install"
                  className="inline-flex items-center gap-2.5 px-4 py-2.5 bg-primary-foreground/10 hover:bg-primary-foreground/20 rounded-xl transition-all duration-300 text-sm font-medium group"
                >
                  <Smartphone size={18} className="group-hover:animate-pulse" />
                  <div>
                    <div className="text-xs opacity-60">মোবাইল অ্যাপ</div>
                    <div className="font-semibold -mt-0.5">ডাউনলোড করুন</div>
                  </div>
                  <Download size={14} className="opacity-60 ml-1" />
                </Link>
              </div>
            </div>

            {/* Contact + Newsletter */}
            <div>
              <h3 className="text-base font-bold mb-4 flex items-center gap-2">
                <span className="w-8 h-0.5 bg-primary-foreground/40 rounded-full" />
                যোগাযোগ
              </h3>
              <ul className="text-sm space-y-3">
                <li className="flex items-center gap-2.5 opacity-80">
                  <div className="p-1.5 rounded-lg bg-primary-foreground/10 shrink-0">
                    <Phone size={14} />
                  </div>
                  {toBengali(settings?.contact_phone || "০১৯২৬-৪২৮৯৮৮")}
                </li>
                <li className="flex items-center gap-2.5 opacity-80">
                  <div className="p-1.5 rounded-lg bg-primary-foreground/10 shrink-0">
                    <Mail size={14} />
                  </div>
                  {settings?.contact_email || "info@ittehad.bd"}
                </li>
                <li className="flex items-start gap-2.5 opacity-80">
                  <div className="p-1.5 rounded-lg bg-primary-foreground/10 shrink-0 mt-0.5">
                    <MapPin size={14} />
                  </div>
                  <span className="leading-relaxed">{settings?.contact_address || "মারকাযুস সুন্নাহ ক্যাডেট মাদরাসা, ওয়াবদারপুল তালতলা বাজার, ফতুল্লা, নারায়ণগঞ্জ"}</span>
                </li>
              </ul>

              {/* Newsletter */}
              <div className="mt-5 pt-4 border-t border-primary-foreground/10">
                <h4 className="text-sm font-semibold mb-2.5">আপডেট পেতে সংযুক্ত থাকুন</h4>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const form = e.currentTarget;
                    const emailInput = form.querySelector('input[type="email"]') as HTMLInputElement;
                    const email = emailInput?.value?.trim();
                    if (!email) return;
                    try {
                      const { error } = await supabase.from("newsletter_subscribers").insert({ email });
                      if (error) {
                        if (error.code === "23505") {
                          toast.info("এই ইমেইল আগেই সাবস্ক্রাইব করা আছে!");
                        } else {
                          throw error;
                        }
                      } else {
                        toast.success("সাবস্ক্রিপশন সফল হয়েছে!");
                      }
                      emailInput.value = "";
                    } catch {
                      toast.error("সাবস্ক্রিপশন ব্যর্থ হয়েছে");
                    }
                  }}
                  className="flex gap-1.5"
                >
                  <input
                    type="email"
                    placeholder="ইমেইল দিন..."
                    required
                    className="flex-1 px-3 py-2 rounded-lg bg-primary-foreground/10 border border-primary-foreground/10 text-sm text-primary-foreground placeholder:text-primary-foreground/40 focus:outline-none focus:border-primary-foreground/30 transition-colors"
                  />
                  <button
                    type="submit"
                    className="p-2 rounded-lg bg-primary-foreground/15 hover:bg-primary-foreground/25 transition-colors"
                    aria-label="Subscribe"
                  >
                    <Send size={16} />
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-primary-foreground/10 mt-10 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm opacity-50">
            <p>{toBengali(settings?.copyright_text || "© ২০২৪ ইত্তেহাদুল মাদারিসিল খুসুসিয়্যাহ। সর্বস্বত্ব সংরক্ষিত।")}</p>
            <p>
              কারিগরি সহায়তায়:{" "}
              <a
                href="https://www.facebook.com/hasanprofile/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:opacity-100 transition-opacity"
              >
                মাহমুদুল হাসান
              </a>
            </p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
