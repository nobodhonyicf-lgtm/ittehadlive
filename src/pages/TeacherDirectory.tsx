import { useState, useCallback, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toBengali, toBengaliNumber } from "@/lib/bengali";
import { generateTeacherCV } from "@/lib/teacherCV";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { Search, MapPin, BookOpen, Award, Phone, Mail, Star, Filter, ChevronDown, GraduationCap, Users, Briefcase, Clock, MessageSquare, Send, BadgeCheck, Eye, Building2, Download, DollarSign, FileText, CalendarDays, UserCircle, Share2, Bookmark, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "@/components/ui/sonner";

const PAGE_SIZE = 12;

/* ─── Experience Badge Helper ─── */
const getExperienceBadge = (years: number) => {
  if (years >= 10) return { label: "সিনিয়র", color: "bg-amber-500/10 text-amber-700 border-amber-200" };
  if (years >= 5) return { label: "অভিজ্ঞ", color: "bg-blue-500/10 text-blue-700 border-blue-200" };
  if (years >= 2) return { label: "মধ্যম", color: "bg-green-500/10 text-green-700 border-green-200" };
  return null;
};

/* ─── Job Postings Section with Detail View ─── */
const JobPostingsSection = ({ jobs, branches, highlightJobId, jobHighlightRef }: { jobs: any[]; branches: any[]; highlightJobId?: string | null; jobHighlightRef?: React.RefObject<HTMLDivElement> }) => {
  const [selectedJob, setSelectedJob] = useState<any>(null);

  const getBranch = (branchId: string | null) => branches?.find(b => b.id === branchId);

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-6 bg-primary rounded-full" />
        <h2 className="text-lg font-bold">শিক্ষক প্রয়োজন</h2>
        <Badge variant="secondary" className="text-[10px]">{toBengaliNumber(jobs.length)}টি সক্রিয়</Badge>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {jobs.map(j => {
          const branch = getBranch(j.branch_id);
          return (
            <Card key={j.id} ref={highlightJobId === j.id ? jobHighlightRef : undefined} className={`border-primary/20 hover:border-primary/40 transition-colors group ${highlightJobId === j.id ? "ring-2 ring-primary shadow-lg" : ""}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">{j.title}</h3>
                    {j.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{j.description}</p>}
                  </div>
                  {j.deadline && (
                    <div className="shrink-0 text-right">
                      <div className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock size={10} /> শেষ তারিখ</div>
                      <div className="text-xs font-medium text-destructive">{new Date(j.deadline).toLocaleDateString("bn-BD")}</div>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3 text-[10px] text-muted-foreground">
                  {j.subject && <span className="bg-muted px-2 py-0.5 rounded-full flex items-center gap-1"><BookOpen size={10} /> {j.subject}</span>}
                  {j.location && <span className="bg-muted px-2 py-0.5 rounded-full flex items-center gap-1"><MapPin size={10} /> {j.location}</span>}
                  {j.salary_range && <span className="bg-muted px-2 py-0.5 rounded-full flex items-center gap-1"><DollarSign size={10} /> {j.salary_range}</span>}
                </div>
                {branch && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <Popover>
                      <PopoverTrigger asChild>
                        <div className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 rounded-md p-1.5 -m-1.5 transition-colors">
                          {branch.image_url ? (
                            <img src={branch.image_url} alt="" className="w-5 h-5 rounded object-contain bg-muted" />
                          ) : (
                            <Building2 size={14} className="text-primary" />
                          )}
                          <span className="text-[11px] text-primary font-semibold">{branch.name}</span>
                        </div>
                      </PopoverTrigger>
                      <PopoverContent className="w-72 p-0" side="bottom" align="start">
                        <div className="p-3 space-y-2">
                          <div className="flex items-center gap-2">
                            {branch.image_url ? (
                              <img src={branch.image_url} alt="" className="w-10 h-10 rounded-lg object-contain bg-muted border" />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Building2 size={20} className="text-primary" /></div>
                            )}
                            <div>
                              <h4 className="text-sm font-semibold">{branch.name}</h4>
                              {branch.code && <p className="text-[10px] text-muted-foreground">কোড: {branch.code}</p>}
                            </div>
                          </div>
                          {branch.address && (
                            <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                              <MapPin size={11} className="shrink-0 mt-0.5" /> {branch.address}
                            </p>
                          )}
                          {branch.head_name && (
                            <div className="flex items-center gap-2 bg-muted/50 rounded-md p-2">
                              {branch.head_photo_url ? (
                                <img src={branch.head_photo_url} alt="" className="w-7 h-7 rounded-full object-cover" />
                              ) : (
                                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center"><UserCircle size={14} className="text-primary" /></div>
                              )}
                              <div>
                                <div className="text-[10px] text-muted-foreground">প্রধান</div>
                                <div className="text-xs font-medium">{branch.head_name}</div>
                              </div>
                            </div>
                          )}
                          <div className="flex gap-3 text-[10px] text-muted-foreground">
                            {branch.phone && <span className="flex items-center gap-1"><Phone size={10} /> {branch.phone}</span>}
                            {branch.email && <span className="flex items-center gap-1"><Mail size={10} /> {branch.email}</span>}
                          </div>
                          <div className="flex gap-3 text-[10px]">
                            {branch.total_teachers > 0 && <span className="flex items-center gap-1"><GraduationCap size={10} /> {toBengaliNumber(branch.total_teachers)} জন শিক্ষক</span>}
                            {branch.total_students > 0 && <span className="flex items-center gap-1"><Users size={10} /> {toBengaliNumber(branch.total_students)} জন ছাত্র</span>}
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={() => setSelectedJob(j)}>
                    <Eye size={12} /> বিস্তারিত দেখুন
                  </Button>
                  <Link to={`/job-apply/${j.id}`}>
                    <Button size="sm" variant="outline" className="h-7 text-xs">আবেদন করুন →</Button>
                  </Link>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0 ml-auto" onClick={(e) => {
                    e.preventDefault();
                    const shareUrl = `https://ittehad.bd/share/job/${j.id}`;
                    const directUrl = `${window.location.origin}/job-apply/${j.id}`;
                    if (typeof navigator.share === "function") {
                      navigator.share({ title: j.title, text: `নিয়োগ বিজ্ঞপ্তি: ${j.title}`, url: shareUrl });
                    } else {
                      navigator.clipboard.writeText(directUrl);
                      toast.success("লিংক কপি হয়েছে!");
                    }
                  }}>
                    <Share2 size={13} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Job Detail Dialog */}
      <Dialog open={!!selectedJob} onOpenChange={o => !o && setSelectedJob(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>নিয়োগ বিজ্ঞপ্তি বিস্তারিত</DialogTitle></DialogHeader>
          {selectedJob && (() => {
            const branch = getBranch(selectedJob.branch_id);
            return (
              <div className="space-y-4">
                <h2 className="text-lg font-bold">{selectedJob.title}</h2>
                {branch && (
                  <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-3">
                    {branch.image_url ? (
                      <img src={branch.image_url} alt="" className="w-8 h-8 rounded object-contain bg-white" />
                    ) : (
                      <Building2 size={20} className="text-primary" />
                    )}
                    <div>
                      <div className="text-[10px] text-muted-foreground">প্রতিষ্ঠান</div>
                      <div className="text-sm font-medium">{branch.name}</div>
                    </div>
                  </div>
                )}
                {selectedJob.description && <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedJob.description}</p>}
                <div className="grid grid-cols-2 gap-3">
                  {selectedJob.subject && (
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="text-[10px] text-muted-foreground">বিষয়</div>
                      <div className="text-sm font-medium flex items-center gap-1"><BookOpen size={14} /> {selectedJob.subject}</div>
                    </div>
                  )}
                  {selectedJob.qualification_required && (
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="text-[10px] text-muted-foreground">শিক্ষাগত যোগ্যতা</div>
                      <div className="text-sm font-medium flex items-center gap-1"><GraduationCap size={14} /> {selectedJob.qualification_required}</div>
                    </div>
                  )}
                  {selectedJob.experience_required && (
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="text-[10px] text-muted-foreground">অভিজ্ঞতা</div>
                      <div className="text-sm font-medium flex items-center gap-1"><FileText size={14} /> {selectedJob.experience_required}</div>
                    </div>
                  )}
                  {selectedJob.salary_range && (
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="text-[10px] text-muted-foreground">বেতন</div>
                      <div className="text-sm font-medium flex items-center gap-1"><DollarSign size={14} /> {selectedJob.salary_range}</div>
                    </div>
                  )}
                  {selectedJob.location && (
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="text-[10px] text-muted-foreground">অবস্থান</div>
                      <div className="text-sm font-medium flex items-center gap-1"><MapPin size={14} /> {selectedJob.location}</div>
                    </div>
                  )}
                  {selectedJob.deadline && (
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="text-[10px] text-muted-foreground">আবেদনের শেষ তারিখ</div>
                      <div className="text-sm font-medium text-destructive flex items-center gap-1"><CalendarDays size={14} /> {new Date(selectedJob.deadline).toLocaleDateString("bn-BD")}</div>
                    </div>
                  )}
                </div>
                <Link to={`/job-apply/${selectedJob.id}`} className="block">
                  <Button className="w-full gap-2"><Briefcase size={16} /> এই পদে আবেদন করুন</Button>
                </Link>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const TeacherDirectory = () => {
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get("highlight");
  const jobId = searchParams.get("job");
  
  const [search, setSearch] = useState("");
  const [districtFilter, setDistrictFilter] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("");
  const [experienceFilter, setExperienceFilter] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [activeTab, setActiveTab] = useState<"available" | "assigned">("available");
  const loaderRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const jobHighlightRef = useRef<HTMLDivElement>(null);

  const { data: teachers, isLoading } = useQuery({
    queryKey: ["public_teachers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("teachers").select("*").eq("is_active", true).order("sort_order");
      if (error) throw error;
      // Fetch branch names for teachers with institution_id
      const branchIds = [...new Set(data?.filter(t => t.institution_id).map(t => t.institution_id) || [])];
      let branchMap: Record<string, string> = {};
      if (branchIds.length > 0) {
        const { data: branchData } = await supabase.from("branches").select("id, name").in("id", branchIds);
        branchData?.forEach(b => { branchMap[b.id] = b.name; });
      }
      return data?.map(t => ({ ...t, _institution_name: t.institution_id ? branchMap[t.institution_id] || null : null })) || [];
    },
  });

  const { data: jobs } = useQuery({
    queryKey: ["public_job_postings"],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase.from("job_postings").select("*").eq("is_active", true).or(`deadline.is.null,deadline.gte.${today}`).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: branches } = useQuery({
    queryKey: ["public_branches_for_jobs"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_branches_public");
      if (error) throw error;
      return data;
    },
  });

  // Split teachers into available and assigned
  const availableTeachersList = teachers?.filter(t => !t.institution_id) || [];
  const assignedTeachersList = teachers?.filter(t => t.institution_id) || [];
  const currentTabTeachers = activeTab === "available" ? availableTeachersList : assignedTeachersList;

  const districts = [...new Set(currentTabTeachers.map(t => t.district).filter(Boolean))];
  const subjects = [...new Set(currentTabTeachers.map(t => t.subject).filter(Boolean))];

  const filtered = currentTabTeachers.filter(t => {
    if (search && !t.name.toLowerCase().includes(search.toLowerCase()) && !t.subject.toLowerCase().includes(search.toLowerCase())) return false;
    if (districtFilter && t.district !== districtFilter) return false;
    if (subjectFilter && t.subject !== subjectFilter) return false;
    if (activeTab === "available") {
      if (availabilityFilter === "available" && !t.is_available) return false;
      if (availabilityFilter === "unavailable" && t.is_available) return false;
    }
    if (experienceFilter === "1-3" && (t.experience_years < 1 || t.experience_years > 3)) return false;
    if (experienceFilter === "3-5" && (t.experience_years < 3 || t.experience_years > 5)) return false;
    if (experienceFilter === "5+" && t.experience_years < 5) return false;
    return true;
  });

  const visibleTeachers = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  // Infinite scroll observer
  useEffect(() => {
    if (!loaderRef.current || !hasMore) return;
    const observer = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting) setVisibleCount(prev => prev + PAGE_SIZE); },
      { threshold: 0.1 }
    );
    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore, filtered.length]);

  // Reset visible count when filters change
  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [search, districtFilter, subjectFilter, availabilityFilter, experienceFilter]);

  // Scroll to highlighted teacher
  useEffect(() => {
    if (highlightId && teachers?.length) {
      const idx = filtered.findIndex(t => t.id === highlightId);
      if (idx >= 0 && idx >= visibleCount) {
        setVisibleCount(idx + PAGE_SIZE);
      }
      setTimeout(() => {
        highlightRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);
    }
  }, [highlightId, teachers]);

  // Scroll to highlighted job
  useEffect(() => {
    if (jobId && jobs?.length) {
      setTimeout(() => {
        jobHighlightRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);
    }
  }, [jobId, jobs]);

  const renderStars = (rating: number | null) => {
    const r = rating || 0;
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
          <Star key={i} size={12} className={i <= r ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"} />
        ))}
        {r > 0 && <span className="text-[10px] text-muted-foreground ml-1">({toBengaliNumber(r.toFixed(1))})</span>}
      </div>
    );
  };

  const totalTeachers = teachers?.length || 0;
  const availableTeachers = teachers?.filter(t => t.is_available)?.length || 0;

  return (
    <Layout>
      <SEOHead title="খেদমত প্রয়োজন - শিক্ষক সার্ভিস সেন্টার" description="যোগ্য শিক্ষক খুঁজুন এবং শিক্ষক হিসেবে আবেদন করুন" />
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-background rounded-2xl p-6 md:p-10 mb-8 overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-medium px-3 py-1.5 rounded-full mb-3">
              <GraduationCap size={14} /> খেদমত প্রয়োজন
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">যোগ্য শিক্ষক খুঁজুন</h1>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">কুরআন, হাদিস ও ইসলামী শিক্ষায় অভিজ্ঞ শিক্ষক খুঁজে নিন আপনার প্রতিষ্ঠানের জন্য</p>

            {/* Stats */}
            <div className="flex justify-center gap-6 mt-5">
              <div className="text-center">
                <div className="text-xl font-bold text-primary">{toBengaliNumber(totalTeachers)}</div>
                <div className="text-[10px] text-muted-foreground">মোট শিক্ষক</div>
              </div>
              <div className="w-px bg-border" />
              <div className="text-center">
                <div className="text-xl font-bold text-primary">{toBengaliNumber(availableTeachers)}</div>
                <div className="text-[10px] text-muted-foreground">উপলব্ধ</div>
              </div>
              <div className="w-px bg-border" />
              <div className="text-center">
                <div className="text-xl font-bold text-primary">{toBengaliNumber(districts.length)}</div>
                <div className="text-[10px] text-muted-foreground">জেলা</div>
              </div>
            </div>

            <div className="flex gap-3 justify-center mt-5">
              <Link to="/teacher-apply">
                <Button className="gap-2 shadow-md"><Briefcase size={16} /> শিক্ষক হিসেবে আবেদন</Button>
              </Link>
              <Link to="/assigned-teachers">
                <Button variant="outline" className="gap-2"><BadgeCheck size={16} /> খেদমতপ্রাপ্ত</Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Active Job Postings */}
        {jobs && jobs.length > 0 && (
          <JobPostingsSection jobs={jobs} branches={branches || []} highlightJobId={jobId} jobHighlightRef={jobHighlightRef as React.RefObject<HTMLDivElement>} />
        )}

        {/* Filters */}
        <div className="bg-card border border-border rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Filter size={14} className="text-primary" />
            <span className="text-sm font-medium">শিক্ষক খুঁজুন</span>
            {filtered.length !== (teachers?.length || 0) && (
              <Badge variant="outline" className="text-[10px] ml-auto">{toBengaliNumber(filtered.length)} জন পাওয়া গেছে</Badge>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="relative sm:col-span-2 lg:col-span-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
              <Input placeholder="নাম বা বিষয়..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
            </div>
            <select className="border border-input rounded-md px-3 py-2 text-xs bg-background h-9" value={districtFilter} onChange={e => setDistrictFilter(e.target.value)}>
              <option value="">সকল জেলা</option>
              {districts.map(d => <option key={d} value={d!}>{d}</option>)}
            </select>
            <select className="border border-input rounded-md px-3 py-2 text-xs bg-background h-9" value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)}>
              <option value="">সকল বিষয়</option>
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select className="border border-input rounded-md px-3 py-2 text-xs bg-background h-9" value={availabilityFilter} onChange={e => setAvailabilityFilter(e.target.value)}>
              <option value="">সকল অবস্থা</option>
              <option value="available">উপলব্ধ</option>
              <option value="unavailable">অনুপলব্ধ</option>
            </select>
            <select className="border border-input rounded-md px-3 py-2 text-xs bg-background h-9" value={experienceFilter} onChange={e => setExperienceFilter(e.target.value)}>
              <option value="">সকল অভিজ্ঞতা</option>
              <option value="1-3">১-৩ বছর</option>
              <option value="3-5">৩-৫ বছর</option>
              <option value="5+">৫+ বছর</option>
            </select>
          </div>
        </div>

        {/* Teacher Grid */}
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-16 rounded-xl bg-muted shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                      <div className="h-3 bg-muted rounded w-2/3" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Users size={48} className="mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground font-medium">কোনো শিক্ষক পাওয়া যায়নি</p>
            <p className="text-xs text-muted-foreground mt-1">অনুগ্রহ করে ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন</p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visibleTeachers.map(t => {
                const expBadge = getExperienceBadge(t.experience_years || 0);
                return (
                  <Card
                    key={t.id}
                    ref={highlightId === t.id ? highlightRef as React.RefObject<HTMLDivElement> : undefined}
                    className={`group hover:shadow-lg hover:border-primary/20 transition-all duration-300 cursor-pointer overflow-hidden ${highlightId === t.id ? "ring-2 ring-primary shadow-lg" : ""}`}
                    onClick={() => setSelectedTeacher(t)}
                  >
                    <CardContent className="p-0">
                      <div className="p-4">
                        <div className="flex items-start gap-3">
                          {t.photo_url ? (
                            <img src={t.photo_url} alt={t.name} className="w-16 h-16 rounded-xl object-cover shrink-0 ring-2 ring-muted group-hover:ring-primary/20 transition-colors" />
                          ) : (
                            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-primary shrink-0">
                              <UserCircle size={32} />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm group-hover:text-primary transition-colors flex items-center gap-1">
                              {t.name}
                              {(t as any).is_verified && (
                                <TooltipProvider delayDuration={0}>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="inline-flex"><BadgeCheck size={14} className="text-blue-500 shrink-0 fill-blue-500 stroke-white" /></span>
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-[#1c1e21] text-white text-[11px] border-0 shadow-lg px-2.5 py-1.5 rounded-lg max-w-[220px]">
                                      <p>এই শিক্ষক ইত্তেহাদুল মাদারিসিল খুসুসিয়্যাহ কর্তৃক যাচাইকৃত ও বিশ্বস্ত</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                              {(t as any).institution_logo_url && (
                                <TooltipProvider delayDuration={0}>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <img src={(t as any).institution_logo_url} alt="" className="w-4 h-4 rounded-sm object-contain shrink-0 ring-1 ring-border" />
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-[#1c1e21] text-white text-[10px] border-0 shadow-lg px-2 py-1 rounded-md max-w-[250px]">
                                      এই শিক্ষক {(t as any)._institution_name || "একটি প্রতিষ্ঠান"} এর সাথে যুক্ত
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </h3>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <BookOpen size={11} className="shrink-0" /> {t.subject}
                            </p>
                            {t.district && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                <MapPin size={11} className="shrink-0" /> {t.district}
                              </p>
                            )}
                            {renderStars(t.rating)}
                          </div>
                        </div>
                      </div>
                      <div className="px-4 pb-3 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <Badge
                            variant={t.institution_id ? "default" : t.is_available ? "default" : "secondary"}
                            className={`text-[10px] ${t.institution_id ? "bg-blue-500/10 text-blue-700 border-blue-200" : t.is_available ? "bg-green-500/10 text-green-700 border-green-200" : ""}`}
                          >
                            {t.institution_id ? "✓ নিয়োগপ্রাপ্ত" : t.is_available ? "✓ উপলব্ধ" : "অনুপলব্ধ"}
                          </Badge>
                          {expBadge && (
                            <Badge variant="outline" className={`text-[10px] ${expBadge.color}`}>
                              <Briefcase size={9} className="mr-0.5" /> {expBadge.label}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={(e) => {
                            e.stopPropagation();
                            const saved = JSON.parse(localStorage.getItem("saved_teachers") || "[]");
                            const exists = saved.includes(t.id);
                            if (exists) {
                              localStorage.setItem("saved_teachers", JSON.stringify(saved.filter((id: string) => id !== t.id)));
                              toast.success("সেভ তালিকা থেকে সরানো হয়েছে");
                            } else {
                              localStorage.setItem("saved_teachers", JSON.stringify([...saved, t.id]));
                              toast.success("সেভ করা হয়েছে!");
                            }
                          }}>
                            <Bookmark size={13} className={JSON.parse(localStorage.getItem("saved_teachers") || "[]").includes(t.id) ? "fill-primary text-primary" : ""} />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={(e) => {
                            e.stopPropagation();
                            const shareUrl = `https://ittehad.bd/share/teacher/${t.id}`;
                            if (typeof navigator.share === "function") {
                              navigator.share({ title: t.name, text: `শিক্ষক: ${t.name} - ${t.subject}`, url: shareUrl });
                            } else {
                              navigator.clipboard.writeText(shareUrl);
                              toast.success("লিংক কপি হয়েছে!");
                            }
                          }}>
                            <Share2 size={13} />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Infinite Scroll Loader */}
            {hasMore && (
              <div ref={loaderRef} className="flex justify-center py-8">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  আরও লোড হচ্ছে...
                </div>
              </div>
            )}

            {!hasMore && filtered.length > PAGE_SIZE && (
              <p className="text-center text-xs text-muted-foreground py-6">
                মোট {toBengaliNumber(filtered.length)} জন শিক্ষক দেখানো হয়েছে
              </p>
            )}
          </>
        )}

        {/* Teacher Detail Dialog */}
        <Dialog open={!!selectedTeacher} onOpenChange={o => !o && setSelectedTeacher(null)}>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>শিক্ষক প্রোফাইল</DialogTitle></DialogHeader>
            {selectedTeacher && (() => {
              const expBadge = getExperienceBadge(selectedTeacher.experience_years || 0);
              return (
                <div className="space-y-5">
                  {/* Profile header */}
                  <div className="flex items-center gap-4">
                    {selectedTeacher.photo_url ? (
                      <img src={selectedTeacher.photo_url} alt="" className="w-20 h-20 rounded-xl object-cover ring-2 ring-primary/10" />
                    ) : (
                      <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center"><UserCircle size={40} className="text-primary" /></div>
                    )}
                    <div>
                      <h2 className="text-lg font-bold flex items-center gap-1">
                        {selectedTeacher.name}
                        {(selectedTeacher as any).is_verified && (
                          <TooltipProvider delayDuration={0}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="inline-flex"><BadgeCheck size={16} className="text-blue-500 fill-blue-500 stroke-white" /></span>
                              </TooltipTrigger>
                              <TooltipContent className="bg-[#1c1e21] text-white text-[11px] border-0 shadow-lg px-2.5 py-1.5 rounded-lg max-w-[220px]">
                                <p>এই শিক্ষক ইত্তেহাদুল মাদারিসিল খুসুসিয়্যাহ কর্তৃক যাচাইকৃত ও বিশ্বস্ত</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        {(selectedTeacher as any).institution_logo_url && (
                          <TooltipProvider delayDuration={0}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <img src={(selectedTeacher as any).institution_logo_url} alt="" className="w-5 h-5 rounded-sm object-contain shrink-0 ring-1 ring-border" />
                              </TooltipTrigger>
                              <TooltipContent className="bg-[#1c1e21] text-white text-[10px] border-0 shadow-lg px-2 py-1 rounded-md max-w-[250px]">
                                এই শিক্ষক {(selectedTeacher as any)._institution_name || "একটি প্রতিষ্ঠান"} এর সাথে যুক্ত
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </h2>
                      <p className="text-sm text-muted-foreground">{selectedTeacher.subject}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge
                          variant={selectedTeacher.institution_id ? "default" : selectedTeacher.is_available ? "default" : "secondary"}
                          className={selectedTeacher.institution_id ? "bg-blue-500/10 text-blue-700 border-blue-200" : selectedTeacher.is_available ? "bg-green-500/10 text-green-700 border-green-200" : ""}
                        >
                          {selectedTeacher.institution_id ? "✓ নিয়োগপ্রাপ্ত" : selectedTeacher.is_available ? "✓ উপলব্ধ" : "অনুপলব্ধ"}
                        </Badge>
                        {expBadge && (
                          <Badge variant="outline" className={`text-[10px] ${expBadge.color}`}>
                            <Briefcase size={9} className="mr-0.5" /> {expBadge.label}
                          </Badge>
                        )}
                        {renderStars(selectedTeacher.rating)}
                      </div>
                    </div>
                  </div>

                  {/* Info grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {selectedTeacher.qualification && (
                      <div className="flex items-center gap-2 p-2.5 bg-muted/50 rounded-lg text-sm">
                        <Award size={14} className="text-primary shrink-0" />
                        <div><div className="text-[10px] text-muted-foreground">যোগ্যতা</div><span className="text-xs font-medium">{selectedTeacher.qualification}</span></div>
                      </div>
                    )}
                    {selectedTeacher.experience_years > 0 && (
                      <div className="flex items-center gap-2 p-2.5 bg-muted/50 rounded-lg text-sm">
                        <Briefcase size={14} className="text-primary shrink-0" />
                        <div><div className="text-[10px] text-muted-foreground">অভিজ্ঞতা</div><span className="text-xs font-medium">{toBengaliNumber(selectedTeacher.experience_years)} বছর</span></div>
                      </div>
                    )}
                    {selectedTeacher.district && (
                      <div className="flex items-center gap-2 p-2.5 bg-muted/50 rounded-lg text-sm">
                        <MapPin size={14} className="text-primary shrink-0" />
                        <div><div className="text-[10px] text-muted-foreground">জেলা</div><span className="text-xs font-medium">{selectedTeacher.district}</span></div>
                      </div>
                    )}
                    {selectedTeacher.specialization && (
                      <div className="flex items-center gap-2 p-2.5 bg-muted/50 rounded-lg text-sm">
                        <BookOpen size={14} className="text-primary shrink-0" />
                        <div><div className="text-[10px] text-muted-foreground">বিশেষ দক্ষতা</div><span className="text-xs font-medium">{selectedTeacher.specialization}</span></div>
                      </div>
                    )}
                    {(selectedTeacher as any).exam_result && (
                      <div className="flex items-center gap-2 p-2.5 bg-muted/50 rounded-lg text-sm">
                        <GraduationCap size={14} className="text-primary shrink-0" />
                        <div><div className="text-[10px] text-muted-foreground">পরীক্ষার ফলাফল</div><span className="text-xs font-medium">{(selectedTeacher as any).exam_result}</span></div>
                      </div>
                    )}
                    {(selectedTeacher as any).grade_obtained && (
                      <div className="flex items-center gap-2 p-2.5 bg-muted/50 rounded-lg text-sm">
                        <Award size={14} className="text-primary shrink-0" />
                        <div><div className="text-[10px] text-muted-foreground">গ্রেড</div><span className="text-xs font-medium">{(selectedTeacher as any).grade_obtained}</span></div>
                      </div>
                    )}
                  </div>

                  {/* Previous Institution */}
                  {(selectedTeacher as any).previous_institution && (
                    <div className="text-sm bg-muted/50 rounded-lg p-3">
                      <strong className="text-xs">পূর্ববর্তী প্রতিষ্ঠান:</strong>
                      <p className="mt-1 text-muted-foreground">{(selectedTeacher as any).previous_institution}</p>
                    </div>
                  )}

                  {/* Contact */}
                  {(selectedTeacher.phone || selectedTeacher.email) && (
                    <div className="border-t pt-3 space-y-2">
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">যোগাযোগ</h3>
                      {selectedTeacher.phone && (
                        <a href={`tel:${selectedTeacher.phone}`} className="flex items-center gap-2 text-sm text-primary hover:underline">
                          <Phone size={14} /> {toBengali(selectedTeacher.phone)}
                        </a>
                      )}
                      {selectedTeacher.email && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail size={14} /> {selectedTeacher.email}
                        </div>
                      )}
                    </div>
                  )}

                  {selectedTeacher.certification && <p className="text-sm bg-muted/50 rounded-lg p-3"><strong className="text-xs">সার্টিফিকেশন:</strong><br />{selectedTeacher.certification}</p>}
                  {selectedTeacher.preferred_area && <p className="text-sm bg-muted/50 rounded-lg p-3"><strong className="text-xs">পছন্দের এলাকা:</strong><br />{selectedTeacher.preferred_area}</p>}
                  {selectedTeacher.expected_salary && <p className="text-sm bg-muted/50 rounded-lg p-3"><strong className="text-xs">প্রত্যাশিত বেতন:</strong><br />{selectedTeacher.expected_salary}</p>}
                  {selectedTeacher.bio && (
                    <div className="text-sm bg-muted/50 rounded-lg p-3">
                      <strong className="text-xs">জীবনবৃত্তান্ত:</strong>
                      <p className="mt-1 whitespace-pre-wrap text-muted-foreground">{selectedTeacher.bio}</p>
                    </div>
                  )}

                  {/* CV Download */}
                  <Button variant="outline" className="w-full gap-2" onClick={async () => {
                    toast.info("সিভি তৈরি হচ্ছে...");
                    try {
                      await generateTeacherCV(selectedTeacher);
                      toast.success("সিভি ডাউনলোড হয়েছে!");
                    } catch {
                      toast.error("সিভি তৈরিতে সমস্যা হয়েছে");
                    }
                  }}>
                    <Download size={14} /> সিভি ডাউনলোড করুন (PDF)
                  </Button>

                  {/* Reviews Section */}
                  <TeacherReviewSection teacherId={selectedTeacher.id} />
                </div>
              );
            })()}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

/* ─── Teacher Review Section Component ─── */
const REVIEW_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes between reviews

const getLastReviewTime = (): number => {
  try { return parseInt(localStorage.getItem("last_teacher_review_time") || "0", 10); } catch { return 0; }
};

const TeacherReviewSection = ({ teacherId }: { teacherId: string }) => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ reviewer_name: "", institution_name: "", rating: 5, comment: "" });

  const { data: reviews } = useQuery({
    queryKey: ["teacher_reviews", teacherId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teacher_reviews")
        .select("*")
        .eq("teacher_id", teacherId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const submitReview = useMutation({
    mutationFn: async () => {
      const lastTime = getLastReviewTime();
      const now = Date.now();
      if (now - lastTime < REVIEW_COOLDOWN_MS) {
        const remainingMin = Math.ceil((REVIEW_COOLDOWN_MS - (now - lastTime)) / 60000);
        throw new Error(`অনুগ্রহ করে ${remainingMin} মিনিট পর আবার চেষ্টা করুন।`);
      }

      const name = reviewForm.reviewer_name.trim();
      if (!name || name.length < 3) throw new Error("নাম কমপক্ষে ৩ অক্ষর হতে হবে।");
      if (name.length > 100) throw new Error("নাম ১০০ অক্ষরের মধ্যে হতে হবে।");
      if (reviewForm.comment && reviewForm.comment.length > 500) throw new Error("মন্তব্য ৫০০ অক্ষরের মধ্যে হতে হবে।");

      const { error } = await supabase.from("teacher_reviews").insert([{
        teacher_id: teacherId,
        reviewer_name: name,
        institution_name: reviewForm.institution_name.trim() || null,
        rating: reviewForm.rating,
        comment: reviewForm.comment.trim() || null,
      }]);
      if (error) throw error;

      localStorage.setItem("last_teacher_review_time", now.toString());
    },
    onSuccess: () => {
      toast.success("রিভিউ সাবমিট হয়েছে! অনুমোদনের পর দেখানো হবে।");
      setShowForm(false);
      setReviewForm({ reviewer_name: "", institution_name: "", rating: 5, comment: "" });
      queryClient.invalidateQueries({ queryKey: ["teacher_reviews", teacherId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const avgRating = reviews?.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) : 0;

  return (
    <div className="border-t pt-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-1.5">
          <MessageSquare size={14} className="text-primary" /> রিভিউ ও মূল্যায়ন
          {reviews && reviews.length > 0 && (
            <span className="text-[10px] text-muted-foreground font-normal ml-1">
              ({toBengaliNumber(reviews.length)}টি · গড় {toBengaliNumber(avgRating.toFixed(1))})
            </span>
          )}
        </h3>
        <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => setShowForm(!showForm)}>
          <Send size={12} /> রিভিউ দিন
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={e => { e.preventDefault(); submitReview.mutate(); }}
          className="bg-muted/50 rounded-lg p-3 space-y-2.5"
        >
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="আপনার নাম *"
              value={reviewForm.reviewer_name}
              onChange={e => setReviewForm({ ...reviewForm, reviewer_name: e.target.value })}
              required
              className="h-8 text-xs"
            />
            <Input
              placeholder="প্রতিষ্ঠানের নাম"
              value={reviewForm.institution_name}
              onChange={e => setReviewForm({ ...reviewForm, institution_name: e.target.value })}
              className="h-8 text-xs"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">রেটিং:</span>
            {[1, 2, 3, 4, 5].map(i => (
              <button
                key={i}
                type="button"
                onClick={() => setReviewForm({ ...reviewForm, rating: i })}
                className="focus:outline-none"
              >
                <Star size={18} className={i <= reviewForm.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"} />
              </button>
            ))}
          </div>
          <Textarea
            placeholder="আপনার মতামত লিখুন..."
            value={reviewForm.comment}
            onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
            rows={2}
            className="text-xs"
          />
          <Button type="submit" size="sm" disabled={submitReview.isPending} className="w-full h-8 text-xs">
            {submitReview.isPending ? "সাবমিট হচ্ছে..." : "রিভিউ সাবমিট করুন"}
          </Button>
        </form>
      )}

      {reviews && reviews.length > 0 ? (
        <div className="space-y-2">
          {reviews.map(r => (
            <div key={r.id} className="bg-muted/30 rounded-lg p-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium">{r.reviewer_name}</span>
                  {r.institution_name && <span className="text-[10px] text-muted-foreground ml-1">· {r.institution_name}</span>}
                </div>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} size={10} className={i <= r.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"} />
                  ))}
                </div>
              </div>
              {r.comment && <p className="text-xs text-muted-foreground mt-1">{r.comment}</p>}
              <p className="text-[10px] text-muted-foreground/60 mt-1">{new Date(r.created_at).toLocaleDateString("bn-BD")}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground text-center py-2">এখনো কোনো রিভিউ নেই</p>
      )}
    </div>
  );
};

export default TeacherDirectory;
