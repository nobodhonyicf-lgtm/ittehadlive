import { useSiteSettings } from "@/hooks/useData";
import { Link } from "react-router-dom";
import { Users, GraduationCap, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  const { data: settings } = useSiteSettings();

  return (
    <section className="relative bg-gradient-to-br from-primary via-primary/95 to-primary/85 text-primary-foreground overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-[0.04]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-white rounded-full translate-y-1/2 -translate-x-1/3" />
      </div>

      <div className="relative px-4 py-16 md:py-24 text-center max-w-3xl mx-auto">
        {settings?.logo_url && (
          <img src={settings.logo_url} alt="" className="h-16 md:h-20 mx-auto mb-4 object-contain drop-shadow-lg opacity-90" />
        )}
        <h1 className="text-2xl md:text-4xl font-bold mb-3 tracking-tight">
          {settings?.site_name || "ইত্তেহাদুল মাদারিসিল খুসুসিয়্যাহ"}
        </h1>
        <p className="text-base md:text-lg opacity-80 mb-10 max-w-xl mx-auto leading-relaxed">
          {settings?.site_description || "প্রাইভেট মাদরাসাগুলোর একটি সমন্বিত সংগঠন"}
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/result">
            <Button size="lg" variant="secondary" className="gap-2 shadow-lg font-semibold">
              <GraduationCap size={18} /> রেজাল্ট দেখুন
            </Button>
          </Link>
          <Link to="/students">
            <Button size="lg" variant="outline" className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20 shadow-lg backdrop-blur-sm font-semibold">
              <Users size={18} /> শিক্ষার্থী ডিরেক্টরি
            </Button>
          </Link>
          <Link to="/branches">
            <Button size="lg" variant="outline" className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20 shadow-lg backdrop-blur-sm font-semibold">
              <Building2 size={18} /> শাখা সমূহ
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
