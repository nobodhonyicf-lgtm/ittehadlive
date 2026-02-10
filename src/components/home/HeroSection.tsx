import { useSiteSettings } from "@/hooks/useData";
import { Link } from "react-router-dom";
import { Search, Users, GraduationCap, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroPattern from "@/assets/hero-pattern.jpg";

const HeroSection = () => {
  const { data: settings } = useSiteSettings();

  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroPattern})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/70 to-primary/90" />
      
      <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24 text-center text-primary-foreground">
        <h1 className="text-3xl md:text-5xl font-bold mb-4 drop-shadow-lg">
          {settings?.site_name || "ইত্তেহাদুল মাদারিসিল খুসুসিয়্যাহ"}
        </h1>
        <p className="text-lg md:text-xl opacity-90 mb-8 max-w-2xl mx-auto">
          {settings?.site_description || "প্রাইভেট মাদরাসাগুলোর একটি সমন্বিত সংগঠন"}
        </p>
        
        <div className="flex flex-wrap justify-center gap-3 md:gap-4">
          <Link to="/result">
            <Button size="lg" variant="secondary" className="gap-2 text-base shadow-lg hover:shadow-xl transition-all">
              <GraduationCap size={20} /> রেজাল্ট দেখুন
            </Button>
          </Link>
          <Link to="/students">
            <Button size="lg" variant="outline" className="gap-2 text-base bg-white/10 border-white/30 text-white hover:bg-white/20 shadow-lg">
              <Users size={20} /> শিক্ষার্থী ডিরেক্টরি
            </Button>
          </Link>
          <Link to="/branches">
            <Button size="lg" variant="outline" className="gap-2 text-base bg-white/10 border-white/30 text-white hover:bg-white/20 shadow-lg">
              <Building2 size={20} /> শাখা সমূহ
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
