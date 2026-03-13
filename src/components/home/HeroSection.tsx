import { useSiteSettings } from "@/hooks/useData";
import { Link } from "react-router-dom";
import { GraduationCap, Users, Building2, Phone, Search, ArrowRight, Shield, BookOpen } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toBengali } from "@/lib/bengali";
import logoImg from "@/assets/logo.png";

const HeroSection = () => {
  const { data: settings } = useSiteSettings();

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
  const { data: studentCount } = useQuery({
    queryKey: ["student_count"],
    queryFn: async () => {
      const { count } = await supabase.from("students").select("id", { count: "exact", head: true }).eq("is_active", true);
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
    { icon: GraduationCap, label: "রেজাল্ট দেখুন", desc: "পরীক্ষার ফলাফল চেক করুন", path: "/result" },
    { icon: Search, label: "শিক্ষার্থী খুঁজুন", desc: "নাম বা রোল দিয়ে অনুসন্ধান", path: "/students" },
    { icon: Building2, label: "শাখা সমূহ", desc: "অনুমোদিত শাখা খুঁজুন", path: "/branches" },
    { icon: Phone, label: "যোগাযোগ করুন", desc: "সরাসরি যোগাযোগ", path: "/contact" },
  ];

  const stats = [
    { value: branchCount || 0, label: "অনুমোদিত শাখা", icon: Building2 },
    { value: studentCount || 0, label: "নিবন্ধিত শিক্ষার্থী", icon: Users },
    { value: teacherCount || 0, label: "নিবন্ধিত শিক্ষক", icon: GraduationCap },
    { value: noticeCount || 0, label: "সক্রিয় নোটিশ", icon: BookOpen },
  ];

  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/90" />
      <div className="absolute inset-0 islamic-pattern opacity-20" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-foreground/[0.02] rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary-foreground/[0.02] rounded-full translate-y-1/2 -translate-x-1/3 blur-3xl" />

      <div className="relative max-w-[1200px] mx-auto px-4">
        {/* Hero Content */}
        <div className="pt-12 pb-6 md:pt-16 md:pb-8 text-center text-primary-foreground">
          <div className="inline-flex items-center gap-2 bg-primary-foreground/[0.08] backdrop-blur-sm border border-primary-foreground/10 rounded-full px-4 py-1.5 mb-5 text-xs">
            <Shield size={12} className="opacity-70" />
            <span className="opacity-80">বিশ্বস্ত শিক্ষা সমন্বয় প্ল্যাটফর্ম</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold leading-snug mb-3 max-w-xl mx-auto">
            {settings?.site_name || "ইত্তেহাদুল মাদারিসিল খুসুসিয়্যাহ"}
          </h2>
          <p className="text-sm md:text-base opacity-70 max-w-md mx-auto leading-relaxed mb-8">
            {settings?.site_description || "প্রাইভেট মাদরাসাগুলোর একটি সমন্বিত সংগঠন"}
          </p>

          {/* 4 Primary Action Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto mb-10">
            {primaryActions.map((action) => (
              <Link
                key={action.path}
                to={action.path}
                className="group bg-primary-foreground/[0.07] hover:bg-primary-foreground/[0.14] border border-primary-foreground/10 hover:border-primary-foreground/20 backdrop-blur-sm rounded-xl p-4 md:p-5 text-center transition-all duration-300 hover:-translate-y-0.5"
              >
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary-foreground/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-primary-foreground/15 transition-colors">
                  <action.icon size={22} className="opacity-90" />
                </div>
                <p className="font-bold text-sm mb-0.5">{action.label}</p>
                <p className="text-[10px] opacity-50 hidden md:block">{action.desc}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Trust Stats Bar */}
        <div className="relative z-10 pb-6">
          <div className="bg-card rounded-2xl shadow-xl shadow-black/5 border border-border/50 p-5 md:p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {stats.map((stat, i) => (
                <div key={i} className="text-center group">
                  <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center mx-auto mb-2">
                    <stat.icon size={18} className="text-primary" />
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-foreground">{toBengali(stat.value)}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
