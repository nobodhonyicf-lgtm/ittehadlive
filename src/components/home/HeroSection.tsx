import { useSiteSettings } from "@/hooks/useData";
import { Link } from "react-router-dom";
import { GraduationCap, Users, Building2, Phone, ChevronRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toBengali } from "@/lib/bengali";
import logoImg from "@/assets/logo.png";

const HeroSection = () => {
  const { data: settings } = useSiteSettings();

  // Trust stats
  const { data: branchCount } = useQuery({
    queryKey: ["branch_count"],
    queryFn: async () => {
      const { count } = await supabase.from("branches").select("id", { count: "exact", head: true }).eq("is_active", true);
      return count || 0;
    },
  });
  const { data: teacherCount } = useQuery({
    queryKey: ["teacher_count"],
    queryFn: async () => {
      const { count } = await supabase.from("teachers").select("id", { count: "exact", head: true }).eq("is_active", true);
      return count || 0;
    },
  });
  const { data: noticeCount } = useQuery({
    queryKey: ["notice_count"],
    queryFn: async () => {
      const { count } = await supabase.from("notices").select("id", { count: "exact", head: true }).eq("is_active", true);
      return count || 0;
    },
  });

  const primaryActions = [
    { icon: GraduationCap, label: "রেজাল্ট দেখুন", sub: "পরীক্ষার ফলাফল", path: "/result", color: "bg-white/15 hover:bg-white/25 border-white/20" },
    { icon: Search, label: "শিক্ষার্থী খুঁজুন", sub: "ডিরেক্টরি", path: "/students", color: "bg-white/15 hover:bg-white/25 border-white/20" },
    { icon: Building2, label: "শাখা সমূহ", sub: "সকল শাখা", path: "/branches", color: "bg-white/15 hover:bg-white/25 border-white/20" },
    { icon: Phone, label: "যোগাযোগ", sub: "সরাসরি যোগাযোগ", path: "/contact", color: "bg-white/15 hover:bg-white/25 border-white/20" },
  ];

  const stats = [
    { value: branchCount || 0, label: "অনুমোদিত শাখা" },
    { value: teacherCount || 0, label: "নিবন্ধিত শিক্ষক" },
    { value: noticeCount || 0, label: "সক্রিয় নোটিশ" },
  ];

  return (
    <section className="relative bg-gradient-to-br from-primary via-primary/95 to-primary/85 text-primary-foreground overflow-hidden">
      {/* Subtle geometric pattern */}
      <div className="absolute inset-0 islamic-pattern opacity-30" />
      {/* Gradient orbs */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary-foreground/[0.03] rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-primary-foreground/[0.03] rounded-full translate-y-1/2 -translate-x-1/3 blur-3xl" />

      <div className="relative max-w-[1200px] mx-auto px-4 py-10 md:py-14">
        {/* Main content */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-4 py-1.5 mb-4 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            সমন্বিত শিক্ষা প্ল্যাটফর্ম
          </div>
          <h2 className="text-xl md:text-2xl font-bold leading-tight mb-2">
            {settings?.site_name || "ইত্তেহাদুল মাদারিসিল খুসুসিয়্যাহ"}
          </h2>
          <p className="text-sm opacity-75 max-w-md mx-auto leading-relaxed">
            {settings?.site_description || "প্রাইভেট মাদরাসাগুলোর একটি সমন্বিত সংগঠন"}
          </p>
        </div>

        {/* 4 Primary Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto mb-8">
          {primaryActions.map((action) => (
            <Link
              key={action.path}
              to={action.path}
              className={`${action.color} border backdrop-blur-sm rounded-xl p-4 text-center transition-all duration-200 hover:scale-[1.02] group`}
            >
              <action.icon size={24} className="mx-auto mb-2 opacity-90 group-hover:opacity-100" />
              <p className="font-bold text-sm">{action.label}</p>
              <p className="text-[10px] opacity-60 mt-0.5">{action.sub}</p>
            </Link>
          ))}
        </div>

        {/* Trust Stats Bar */}
        <div className="flex items-center justify-center gap-6 md:gap-10">
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-2xl md:text-3xl font-bold">{toBengali(stat.value)}</p>
              <p className="text-[11px] opacity-60 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
