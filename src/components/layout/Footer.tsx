import { useSiteSettings } from "@/hooks/useData";
import { Phone, Mail, MapPin, Download, Smartphone, Facebook, Youtube, ChevronUp, Send, Shield, GraduationCap, Building2 } from "lucide-react";
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
      <footer className="relative bg-primary text-primary-foreground mt-16 overflow-hidden">
        <div className="absolute inset-0 islamic-pattern opacity-15" />
        <div className="h-0.5 bg-gradient-to-r from-transparent via-[hsl(var(--gold))] to-transparent opacity-30" />

        <div className="relative max-w-[1200px] mx-auto px-4 pt-12 pb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* About */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-1 bg-white/10 rounded-xl">
                  <img src={settings?.logo_url || logoImg} alt="Logo" className="h-10 object-contain" />
                </div>
              </div>
              <h3 className="text-base font-bold leading-snug">
                {settings?.site_name || "ইত্তেহাদুল মাদারিসিল খুসুসিয়্যাহ"}
              </h3>
              <p className="text-sm opacity-50 leading-relaxed">
                {settings?.site_description || "প্রাইভেট মাদরাসাগুলোর একটি সমন্বিত সংগঠন"}
              </p>
              <div className="flex items-center gap-2 pt-1">
                <a href={settings?.facebook_url || "https://www.facebook.com/ittehadbd"} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-all" aria-label="Facebook">
                  <Facebook size={15} />
                </a>
                <a href={settings?.youtube_url || "https://www.youtube.com/@ittehadbd"} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-all" aria-label="YouTube">
                  <Youtube size={15} />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-xs font-bold mb-4 uppercase tracking-wider opacity-60">গুরুত্বপূর্ণ লিংক</h3>
              <ul className="text-sm space-y-2">
                {[
                  { href: "/page/about", label: "আমাদের সম্পর্কে" },
                  { href: "/result", label: "রেজাল্ট দেখুন" },
                  { href: "/branches", label: "শাখা সমূহ" },
                  { href: "/verify", label: "যাচাই কেন্দ্র" },
                  { href: "/documents", label: "দলিলপত্র" },
                  { href: "/books", label: "প্রকাশনা" },
                  { href: "/posts", label: "খবর ও নিবন্ধ" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link to={link.href} className="opacity-50 hover:opacity-100 transition-opacity inline-flex items-center gap-1.5 text-[13px]">
                      <span className="w-1 h-1 rounded-full bg-primary-foreground/30" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <h3 className="text-xs font-bold mb-4 uppercase tracking-wider opacity-60">সেবা সমূহ</h3>
              <ul className="text-sm space-y-2">
                {[
                  { href: "/students", label: "শিক্ষার্থী ডিরেক্টরি" },
                  { href: "/teachers", label: "শিক্ষক সার্ভিস সেন্টার" },
                  { href: "/certificate", label: "সনদ ডাউনলোড" },
                  { href: "/institution-register", label: "প্রতিষ্ঠান নিবন্ধন" },
                  { href: "/support", label: "সহায়তা কেন্দ্র" },
                  { href: "/contact", label: "যোগাযোগ" },
                  { href: "/faq", label: "জিজ্ঞাসা (FAQ)" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link to={link.href} className="opacity-50 hover:opacity-100 transition-opacity inline-flex items-center gap-1.5 text-[13px]">
                      <span className="w-1 h-1 rounded-full bg-primary-foreground/30" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-5 pt-4 border-t border-primary-foreground/10">
                <Link to="/install" className="inline-flex items-center gap-2.5 px-4 py-2.5 bg-white/10 hover:bg-white/15 rounded-xl transition-all text-sm font-medium">
                  <Smartphone size={15} className="opacity-70" />
                  <div>
                    <div className="text-[9px] opacity-40">মোবাইল অ্যাপ</div>
                    <div className="font-semibold text-xs -mt-0.5">ডাউনলোড করুন</div>
                  </div>
                  <Download size={11} className="opacity-40 ml-1" />
                </Link>
              </div>
            </div>

            {/* Contact + Newsletter */}
            <div>
              <h3 className="text-xs font-bold mb-4 uppercase tracking-wider opacity-60">যোগাযোগ</h3>
              <ul className="text-sm space-y-3">
                <li className="flex items-center gap-2.5 opacity-60">
                  <div className="p-1.5 rounded-lg bg-white/10 shrink-0"><Phone size={11} /></div>
                  {toBengali(settings?.contact_phone || "০১৯২৬-৪২৮৯৮৮")}
                </li>
                <li className="flex items-center gap-2.5 opacity-60">
                  <div className="p-1.5 rounded-lg bg-white/10 shrink-0"><Mail size={11} /></div>
                  {settings?.contact_email || "info@ittehad.bd"}
                </li>
                <li className="flex items-start gap-2.5 opacity-60">
                  <div className="p-1.5 rounded-lg bg-white/10 shrink-0 mt-0.5"><MapPin size={11} /></div>
                  <span className="leading-relaxed text-[12px]">{settings?.contact_address || "মারকাযুস সুন্নাহ ক্যাডেট মাদরাসা, ফতুল্লা, নারায়ণগঞ্জ"}</span>
                </li>
              </ul>
              {/* Newsletter */}
              <div className="mt-5 pt-4 border-t border-primary-foreground/10">
                <h4 className="text-xs font-medium mb-2 opacity-60">আপডেট পেতে সংযুক্ত থাকুন</h4>
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
                        if (error.code === "23505") toast.info("এই ইমেইল আগেই সাবস্ক্রাইব করা আছে!");
                        else throw error;
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
                  <input type="email" placeholder="ইমেইল দিন..." required className="flex-1 px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-sm text-primary-foreground placeholder:text-primary-foreground/25 focus:outline-none focus:border-white/25 transition-colors" />
                  <button type="submit" className="p-2 rounded-lg bg-white/15 hover:bg-white/20 transition-colors" aria-label="Subscribe">
                    <Send size={13} />
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-primary-foreground/10 mt-10 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] opacity-35">
            <p>{toBengali(settings?.copyright_text || "© ২০২৪ ইত্তেহাদুল মাদারিসিল খুসুসিয়্যাহ। সর্বস্বত্ব সংরক্ষিত।")}</p>
            <div className="flex items-center gap-3">
              <Link to="/terms" className="hover:opacity-100 transition-opacity underline">শর্তাবলী</Link>
              <span>•</span>
              <Link to="/privacy" className="hover:opacity-100 transition-opacity underline">গোপনীয়তা নীতি</Link>
            </div>
            <p>
              কারিগরি সহায়তায়:{" "}
              <a href="https://www.facebook.com/hasanprofile/" target="_blank" rel="noopener noreferrer" className="underline hover:opacity-100 transition-opacity">
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
