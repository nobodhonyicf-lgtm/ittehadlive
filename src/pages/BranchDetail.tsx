import { useParams, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { useBranches, useStudents } from "@/hooks/useBoardData";
import { Building2, MapPin, User, Phone, Mail, Users, ArrowLeft, Globe, GraduationCap, BookOpen, Bell, ChevronRight, ExternalLink, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toBengali } from "@/lib/bengali";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useIsApp } from "@/hooks/useIsApp";
import SEOHead from "@/components/SEOHead";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Breadcrumbs from "@/components/Breadcrumbs";

const BranchDetail = () => {
  const { id } = useParams<{ id: string }>();
  const isApp = useIsApp();
  const { data: branches } = useBranches();
  const branch = branches?.find((b: any) => b.id === id);
  const { data: students } = useStudents(id, undefined);

  // Fetch latest notices
  const { data: notices } = useQuery({
    queryKey: ["notices_latest"],
    queryFn: async () => {
      const { data } = await supabase.from("notices").select("id, title, created_at").eq("is_active", true).order("created_at", { ascending: false }).limit(5);
      return data || [];
    },
  });

  // Fetch affiliated teachers
  const { data: affiliatedTeachers } = useQuery({
    queryKey: ["affiliated_teachers", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("teachers")
        .select("id, name, subject, photo_url, is_verified, rating, experience_years, institution_logo_url")
        .eq("institution_id", id!)
        .eq("is_active", true)
        .order("sort_order");
      return data || [];
    },
    enabled: !!id,
  });

  if (!branch) {
    return (
      <Layout>
        <div className="px-4 py-12 text-center text-muted-foreground">শাখা পাওয়া যায়নি</div>
      </Layout>
    );
  }

  return (
    <Layout fullWidth>
      <SEOHead title={`${branch.name} | ইত্তেহাদুল মাদারিস`} description={branch.address || branch.name} />
      <div className="px-4 pt-4">
        <Breadcrumbs items={[{ label: "শাখা সমূহ", href: "/branches" }, { label: branch.name }]} />
      </div>

      {/* Large Hero Banner - inspired by uqicm.com */}
      <div className="relative w-full bg-gradient-to-b from-[hsl(var(--primary))] to-[hsl(var(--primary)/0.85)] overflow-hidden">
        {/* Decorative pattern overlay */}
        <div className="absolute inset-0 opacity-[0.06]" style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
        }} />
        
        <div className="max-w-[1200px] mx-auto px-4 py-8 md:py-12 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
            {/* Logo / Image */}
            <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center shrink-0 border border-white/20 shadow-lg">
              {branch.image_url ? (
                <img src={branch.image_url} alt={branch.name} className="max-w-[90px] md:max-w-[110px] max-h-[90px] md:max-h-[110px] object-contain" />
              ) : (
                <Building2 className="text-white/40" size={60} />
              )}
            </div>
            
            {/* Text */}
            <div className="text-center md:text-right flex-1">
              <h1 className="text-2xl md:text-4xl font-bold text-primary-foreground leading-tight mb-2">
                {branch.name}
              </h1>
              {branch.address && (
                <p className="text-primary-foreground/80 text-sm md:text-base flex items-center justify-center md:justify-end gap-2 mb-1">
                  <MapPin size={15} className="shrink-0" /> {branch.address}
                </p>
              )}
              {branch.phone && (
                <p className="text-primary-foreground/80 text-sm md:text-base flex items-center justify-center md:justify-end gap-2">
                  <Phone size={15} className="shrink-0" /> মোবা: {toBengali(branch.phone)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation bar */}
      <div className="bg-primary/95 border-t border-primary-foreground/10 sticky top-0 z-20">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
            <Link to="/branches">
              <Button variant="ghost" size="sm" className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/10 text-xs whitespace-nowrap gap-1">
                <ArrowLeft size={13} /> সকল শাখা
              </Button>
            </Link>
            <Link to={`/students?branch=${branch.id}`}>
              <Button variant="ghost" size="sm" className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/10 text-xs whitespace-nowrap gap-1">
                <Users size={13} /> শিক্ষার্থী
              </Button>
            </Link>
            <Link to="/result">
              <Button variant="ghost" size="sm" className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/10 text-xs whitespace-nowrap gap-1">
                <GraduationCap size={13} /> রেজাল্ট
              </Button>
            </Link>
            {branch.website && (
              <a href={branch.website} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="sm" className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/10 text-xs whitespace-nowrap gap-1">
                  <Globe size={13} /> ওয়েবসাইট
                </Button>
              </a>
            )}
            {branch.email && (
              <a href={`mailto:${branch.email}`}>
                <Button variant="ghost" size="sm" className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/10 text-xs whitespace-nowrap gap-1">
                  <Mail size={13} /> যোগাযোগ
                </Button>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Main Content - 2 column like uqicm */}
      <div className="max-w-[1200px] mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Main content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Notice Board */}
            <Card className="border-border/60 overflow-hidden">
              <div className="bg-primary/10 dark:bg-primary/20 px-5 py-3 border-b border-border/50">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Bell size={18} className="text-primary" /> নোটিশ বোর্ড
                </h2>
              </div>
              <CardContent className="p-5">
                {notices && notices.length > 0 ? (
                  <ul className="space-y-3">
                    {notices.map((n: any) => (
                      <li key={n.id}>
                        <Link to={`/notice/${n.id}`} className="flex items-start gap-3 group hover:bg-muted/50 rounded-lg p-2 -m-2 transition-colors">
                          <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
                          <span className="text-sm text-foreground group-hover:text-primary transition-colors leading-relaxed">{n.title}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">কোনো নোটিশ নেই</p>
                )}
                <div className="mt-4 text-center">
                  <Link to="/">
                    <Button variant="outline" size="sm" className="gap-2 text-xs">
                      নোটিশ বোর্ড <ChevronRight size={14} />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* About Section */}
            <Card className="border-border/60 overflow-hidden">
              <div className="bg-primary/10 dark:bg-primary/20 px-5 py-3 border-b border-border/50">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <BookOpen size={18} className="text-primary" /> আমাদের সম্পর্কে
                </h2>
              </div>
              <CardContent className="p-5">
                <div className="flex flex-col md:flex-row gap-5">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      মানব জীবনকে সুন্দর, আলোকিত ও উন্নত করতে শিক্ষার বিকল্প নেই। একজন মুসলমানের জন্য সর্বোত্তম শিক্ষা হলো দ্বীনি শিক্ষা। দুনিয়া-আখিরাতের সার্বিক কল্যাণ লাভ এবং ব্যক্তি, পরিবার ও সমাজকে আল্লাহর রঙে রঙিন করতে হলে দ্বীনি ইলম অর্জন ও জীবনে বাস্তবায়ন করা প্রয়োজন।
                    </p>
                  </div>
                  {branch.image_url && (
                    <div className="w-full md:w-48 h-36 rounded-xl overflow-hidden bg-muted shrink-0">
                      <img src={branch.image_url} alt={branch.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Students preview */}
            {students && students.length > 0 && (
              <Card className="border-border/60 overflow-hidden">
                <div className="bg-primary/10 dark:bg-primary/20 px-5 py-3 border-b border-border/50">
                  <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Users size={18} className="text-primary" /> শিক্ষার্থী তালিকা
                    <span className="text-xs text-muted-foreground font-normal ml-1">({toBengali(students.length)} জন)</span>
                  </h2>
                </div>
                <CardContent className="p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {students.slice(0, 6).map((student: any) => (
                      <div key={student.id} className="flex gap-3 items-center p-3 rounded-xl bg-muted/40 border border-border/40">
                        <div className="w-11 h-11 rounded-xl bg-background flex items-center justify-center shrink-0 overflow-hidden border border-border">
                          {student.photo_url ? (
                            <img src={student.photo_url} alt={student.name} className="w-full h-full object-cover" />
                          ) : (
                            <User className="text-muted-foreground" size={18} />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-sm truncate text-foreground">{student.name}</h3>
                          <p className="text-[11px] text-muted-foreground">{student.class_name} | রোল: {toBengali(student.roll_number)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {students.length > 6 && (
                    <div className="text-center mt-4">
                      <Link to={`/students?branch=${branch.id}`}>
                        <Button variant="outline" size="sm" className="gap-2 text-xs">
                          সকল শিক্ষার্থী দেখুন ({toBengali(students.length)} জন) <ChevronRight size={14} />
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Affiliated Teachers */}
            {affiliatedTeachers && affiliatedTeachers.length > 0 && (
              <Card className="border-border/60 overflow-hidden">
                <div className="bg-emerald-500/10 dark:bg-emerald-500/20 px-5 py-3 border-b border-border/50">
                  <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <GraduationCap size={18} className="text-emerald-600" /> এফিলিয়েটেড শিক্ষক
                    <span className="text-xs text-muted-foreground font-normal ml-1">({toBengali(affiliatedTeachers.length)} জন)</span>
                  </h2>
                </div>
                <CardContent className="p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {affiliatedTeachers.map((teacher: any) => (
                      <Link key={teacher.id} to={`/teachers?highlight=${teacher.id}`} className="flex gap-3 items-center p-3 rounded-xl bg-muted/40 border border-border/40 hover:border-primary/30 transition-all group">
                        <div className="w-11 h-11 rounded-xl bg-background flex items-center justify-center shrink-0 overflow-hidden border border-border">
                          {teacher.photo_url ? (
                            <img src={teacher.photo_url} alt={teacher.name} className="w-full h-full object-cover" />
                          ) : (
                            <User className="text-muted-foreground" size={18} />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-sm truncate text-foreground flex items-center gap-1">
                            {teacher.name}
                            {teacher.is_verified && (
                              <TooltipProvider delayDuration={0}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="inline-flex"><BadgeCheck size={14} className="text-blue-500 fill-blue-500 stroke-white shrink-0" /></span>
                                  </TooltipTrigger>
                                  <TooltipContent className="bg-[#1c1e21] text-white text-[10px] border-0 shadow-lg px-2 py-1 rounded-md">
                                    যাচাইকৃত শিক্ষক
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                            {/* Institution logo badge */}
                            {teacher.institution_logo_url && (
                              <TooltipProvider delayDuration={0}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <img src={teacher.institution_logo_url} alt="" className="w-3.5 h-3.5 rounded-sm object-contain shrink-0" />
                                  </TooltipTrigger>
                                  <TooltipContent className="bg-[#1c1e21] text-white text-[10px] border-0 shadow-lg px-2 py-1 rounded-md">
                                    {branch.name} এর শিক্ষক
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </h3>
                          <p className="text-[11px] text-muted-foreground">{teacher.subject}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-5">

            {/* Head Teacher Card */}
            {branch.head_name && (
              <Card className="border-border/60 overflow-hidden">
                <div className="bg-primary/10 dark:bg-primary/20 px-4 py-2.5 border-b border-border/50">
                  <h3 className="text-sm font-bold text-foreground">মুহতামিম / প্রধান শিক্ষক</h3>
                </div>
                <CardContent className="p-4 text-center">
                  <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-3 overflow-hidden border-2 border-primary/20">
                    {branch.head_photo_url ? (
                      <img src={branch.head_photo_url} alt={branch.head_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="text-muted-foreground" size={32} />
                      </div>
                    )}
                  </div>
                  <h4 className="font-bold text-foreground mb-1">{branch.head_name}</h4>
                  <p className="text-xs text-muted-foreground mb-3">প্রধান শিক্ষক</p>
                  <div className="space-y-1.5 text-xs">
                    {branch.phone && (
                      <p className="flex items-center justify-center gap-1.5 text-muted-foreground">
                        <Phone size={12} className="text-primary/70" /> {toBengali(branch.phone)}
                      </p>
                    )}
                    {branch.email && (
                      <p className="flex items-center justify-center gap-1.5 text-muted-foreground">
                        <Mail size={12} className="text-primary/70" /> {branch.email}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Stats */}
            <Card className="border-border/60 overflow-hidden">
              <div className="bg-primary/10 dark:bg-primary/20 px-4 py-2.5 border-b border-border/50">
                <h3 className="text-sm font-bold text-foreground">পরিসংখ্যান</h3>
              </div>
              <CardContent className="p-4 space-y-3">
                {(branch.total_teachers ?? 0) > 0 && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border/40">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <GraduationCap size={18} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-primary">{toBengali(branch.total_teachers)}</p>
                      <p className="text-[11px] text-muted-foreground">মোট শিক্ষক</p>
                    </div>
                  </div>
                )}
                {(branch.total_students ?? 0) > 0 && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border/40">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                      <Users size={18} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-primary">{toBengali(branch.total_students)}</p>
                      <p className="text-[11px] text-muted-foreground">মোট শিক্ষার্থী</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card className="border-border/60 overflow-hidden">
              <div className="bg-primary/10 dark:bg-primary/20 px-4 py-2.5 border-b border-border/50">
                <h3 className="text-sm font-bold text-foreground">দ্রুত লিংক</h3>
              </div>
              <CardContent className="p-3 space-y-1">
                <Link to={`/students?branch=${branch.id}`} className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-muted/60 transition-colors text-sm text-foreground">
                  <Users size={15} className="text-primary" /> শিক্ষার্থী তালিকা
                </Link>
                <Link to="/result" className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-muted/60 transition-colors text-sm text-foreground">
                  <GraduationCap size={15} className="text-primary" /> রেজাল্ট দেখুন
                </Link>
                <Link to="/contact" className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-muted/60 transition-colors text-sm text-foreground">
                  <Mail size={15} className="text-primary" /> যোগাযোগ করুন
                </Link>
                {branch.website && (
                  <a href={branch.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-muted/60 transition-colors text-sm text-foreground">
                    <ExternalLink size={15} className="text-primary" /> ওয়েবসাইট দেখুন
                  </a>
                )}
              </CardContent>
            </Card>

            {/* Admission Banner */}
            <Card className="border-primary/30 overflow-hidden bg-gradient-to-br from-primary/5 to-accent/5">
              <CardContent className="p-5 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-3">
                  <BookOpen size={22} className="text-primary" />
                </div>
                <h3 className="font-bold text-foreground mb-1">ভর্তি চলছে</h3>
                <p className="text-xs text-muted-foreground mb-3">প্লে-গ্রুপ থেকে দ্বাদশ শ্রেণী পর্যন্ত</p>
                {branch.phone && (
                  <a href={`tel:${branch.phone}`}>
                    <Button size="sm" className="gap-2 text-xs w-full">
                      <Phone size={13} /> যোগাযোগ করুন
                    </Button>
                  </a>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BranchDetail;
