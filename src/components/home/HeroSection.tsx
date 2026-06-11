import { useSiteSettings } from "@/hooks/useData";
import { Link } from "react-router-dom";
import {
  GraduationCap,
  Users,
  Building2,
  Phone,
  Search,
  ArrowUpRight,
  Shield,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toBengali } from "@/lib/bengali";

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

  return (
    <section className="relative overflow-hidden bg-background">
      <div className="absolute inset-0 islamic-pattern opacity-[0.04] text-primary" />
      <div className="absolute -top-32 -right-32 w-[480px] h-[480px] bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-32 -left-32 w-[420px] h-[420px] bg-[hsl(var(--gold))]/10 rounded-full blur-3xl" />

      <div className="relative max-w-[1200px] mx-auto px-4 pt-10 pb-8 md:pt-14">
        {/* Brand strip */}
        <div className="flex items-center justify-center mb-6">
          <div className="inline-flex items-center gap-2 bg-card border border-border rounded-full px-3.5 py-1.5 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[hsl(var(--gold))] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[hsl(var(--gold))]" />
            </span>
            <Shield size={13} className="text-primary" />
            <span className="text-[11px] font-semibold text-foreground tracking-wide">
              বিশ্বস্ত শিক্ষা সমন্বয় প্ল্যাটফর্ম
            </span>
          </div>
        </div>

        {/* Headline */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight text-foreground leading-[1.05] mb-4">
            {settings?.site_name || "ইত্তেহাদুল মাদারিসিল খুসুসিয়্যাহ"}
          </h1>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
            {settings?.site_description || "প্রাইভেট মাদরাসাগুলোর একটি সমন্বিত সংগঠন"}
          </p>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-6 md:grid-cols-12 auto-rows-[110px] md:auto-rows-[130px] gap-3 md:gap-4">
          {/* Featured result card */}
          <Link
            to="/result"
            className="bento-card bento-gradient col-span-6 md:col-span-7 row-span-2 p-6 md:p-7 flex flex-col justify-between group"
          >
            <div className="flex items-start justify-between">
              <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider rounded-full px-2.5 py-1">
                <Sparkles size={11} />
                ফিচার্ড
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center group-hover:scale-110 transition-transform">
                <ArrowUpRight size={18} />
              </div>
            </div>
            <div>
              <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-1.5">
                পরীক্ষার রেজাল্ট দেখুন
              </h3>
              <p className="text-sm text-muted-foreground">
                রোল বা নাম দিয়ে দ্রুত ফলাফল ও মার্কশিট ডাউনলোড করুন
              </p>
            </div>
          </Link>

          {/* Stat: students */}
          <div className="bento-card col-span-3 md:col-span-3 p-4 md:p-5 flex flex-col justify-between">
            <Users size={20} className="text-primary" />
            <div>
              <p className="font-display text-2xl md:text-3xl font-bold text-foreground leading-none">
                {toBengali(studentCount || 0)}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1 font-medium">নিবন্ধিত শিক্ষার্থী</p>
            </div>
          </div>

          {/* Stat: teachers */}
          <div className="bento-card col-span-3 md:col-span-2 p-4 md:p-5 flex flex-col justify-between">
            <GraduationCap size={20} className="text-[hsl(var(--gold))]" />
            <div>
              <p className="font-display text-2xl md:text-3xl font-bold text-foreground leading-none">
                {toBengali(teacherCount || 0)}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1 font-medium">শিক্ষক</p>
            </div>
          </div>

          {/* Search students */}
          <Link
            to="/students"
            className="bento-card col-span-3 md:col-span-3 p-4 md:p-5 flex flex-col justify-between group hover:bg-primary hover:text-primary-foreground"
          >
            <Search size={20} className="text-primary group-hover:text-primary-foreground transition-colors" />
            <div>
              <p className="font-display text-base font-bold leading-tight">শিক্ষার্থী খুঁজুন</p>
              <p className="text-[11px] opacity-70 mt-0.5">নাম বা রোল</p>
            </div>
          </Link>

          {/* Stat: notices */}
          <div className="bento-card col-span-3 md:col-span-2 p-4 md:p-5 flex flex-col justify-between">
            <BookOpen size={20} className="text-primary" />
            <div>
              <p className="font-display text-2xl md:text-3xl font-bold text-foreground leading-none">
                {toBengali(noticeCount || 0)}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1 font-medium">সক্রিয় নোটিশ</p>
            </div>
          </div>

          {/* Branches feature */}
          <Link
            to="/branches"
            className="bento-card col-span-6 md:col-span-5 row-span-2 p-5 md:p-6 flex flex-col justify-between group relative overflow-hidden"
          >
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-[hsl(var(--gold))]/10 rounded-full blur-2xl" />
            <div className="relative flex items-start justify-between">
              <div className="w-11 h-11 rounded-xl bg-[hsl(var(--gold))]/15 text-[hsl(var(--gold))] flex items-center justify-center">
                <Building2 size={22} />
              </div>
              <span className="font-display text-2xl font-bold text-foreground">
                {toBengali(branchCount || 0)}
              </span>
            </div>
            <div className="relative">
              <h3 className="font-display text-xl font-bold text-foreground mb-1">শাখা সমূহ</h3>
              <p className="text-xs text-muted-foreground mb-3">অনুমোদিত শাখা ও তাদের বিস্তারিত তথ্য</p>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary group-hover:gap-2 transition-all">
                দেখুন <ArrowUpRight size={12} />
              </span>
            </div>
          </Link>

          {/* Contact */}
          <Link
            to="/contact"
            className="bento-card col-span-3 md:col-span-4 p-4 md:p-5 flex items-center gap-3 group bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <div className="w-10 h-10 rounded-xl bg-primary-foreground/15 flex items-center justify-center shrink-0">
              <Phone size={18} />
            </div>
            <div className="min-w-0">
              <p className="font-display text-sm font-bold">যোগাযোগ করুন</p>
              <p className="text-[11px] opacity-75 truncate">সরাসরি কথা বলুন</p>
            </div>
            <ArrowUpRight size={16} className="ml-auto opacity-70 group-hover:opacity-100 group-hover:rotate-12 transition-all" />
          </Link>

          {/* Books / extra */}
          <Link
            to="/books"
            className="bento-card col-span-3 md:col-span-3 p-4 md:p-5 flex flex-col justify-between group"
          >
            <BookOpen size={20} className="text-primary" />
            <div>
              <p className="font-display text-sm font-bold text-foreground">বুকশপ</p>
              <p className="text-[11px] text-muted-foreground">পাঠ্যপুস্তক ও বই</p>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
