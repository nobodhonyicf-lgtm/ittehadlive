import { useSiteSettings } from "@/hooks/useData";
import { Link } from "react-router-dom";
import { Users, GraduationCap, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  const { data: settings } = useSiteSettings();

  return (
    <section className="bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground">
      <div className="px-4 py-14 md:py-20 text-center">
        <h1 className="text-2xl md:text-4xl font-bold mb-3">
          {settings?.site_name || "ইত্তেহাদুল মাদারিসিল খুসুসিয়্যাহ"}
        </h1>
        <p className="text-base md:text-lg opacity-90 mb-8 max-w-xl mx-auto">
          {settings?.site_description || "প্রাইভেট মাদরাসাগুলোর একটি সমন্বিত সংগঠন"}
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/result">
            <Button size="lg" variant="secondary" className="gap-2 shadow-md">
              <GraduationCap size={18} /> রেজাল্ট দেখুন
            </Button>
          </Link>
          <Link to="/students">
            <Button size="lg" variant="outline" className="gap-2 bg-white/10 border-white/30 text-white hover:bg-white/20 shadow-md">
              <Users size={18} /> শিক্ষার্থী ডিরেক্টরি
            </Button>
          </Link>
          <Link to="/branches">
            <Button size="lg" variant="outline" className="gap-2 bg-white/10 border-white/30 text-white hover:bg-white/20 shadow-md">
              <Building2 size={18} /> শাখা সমূহ
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
