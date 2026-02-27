import { useSiteSettings } from "@/hooks/useData";
import { Link } from "react-router-dom";
import { Users, GraduationCap, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  const { data: settings } = useSiteSettings();

  return (
    <section className="relative bg-primary text-primary-foreground overflow-hidden">
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-[0.05]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/3" />
      </div>

      <div className="relative px-4 py-12 md:py-16 text-center max-w-2xl mx-auto">
        <p className="text-sm opacity-70 mb-4 animate-fade-in">
          {settings?.site_description || "প্রাইভেট মাদরাসাগুলোর একটি সমন্বিত সংগঠন"}
        </p>

        <div className="flex flex-wrap justify-center gap-2.5 animate-fade-in">
          <Link to="/result">
            <Button size="sm" variant="secondary" className="gap-1.5 font-semibold shadow-md">
              <GraduationCap size={16} /> রেজাল্ট দেখুন
            </Button>
          </Link>
          <Link to="/students">
            <Button size="sm" variant="outline" className="gap-1.5 bg-white/10 border-white/20 text-white hover:bg-white/20 shadow-md font-semibold">
              <Users size={16} /> শিক্ষার্থী তালিকা
            </Button>
          </Link>
          <Link to="/branches">
            <Button size="sm" variant="outline" className="gap-1.5 bg-white/10 border-white/20 text-white hover:bg-white/20 shadow-md font-semibold">
              <Building2 size={16} /> শাখা সমূহ
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
