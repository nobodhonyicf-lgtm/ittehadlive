import { useState, useCallback, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, MapPin, BookOpen, Award, Phone, Mail, Star, Filter, ChevronDown, GraduationCap, Users, Briefcase, Clock, MessageSquare, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "@/components/ui/sonner";

const PAGE_SIZE = 12;

const TeacherDirectory = () => {
  const [search, setSearch] = useState("");
  const [districtFilter, setDistrictFilter] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("");
  const [experienceFilter, setExperienceFilter] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const loaderRef = useRef<HTMLDivElement>(null);

  const { data: teachers, isLoading } = useQuery({
    queryKey: ["public_teachers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("teachers").select("*").eq("is_active", true).order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const { data: jobs } = useQuery({
    queryKey: ["public_job_postings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("job_postings").select("*").eq("is_active", true).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const districts = [...new Set(teachers?.map(t => t.district).filter(Boolean) || [])];
  const subjects = [...new Set(teachers?.map(t => t.subject).filter(Boolean) || [])];

  const filtered = teachers?.filter(t => {
    if (search && !t.name.toLowerCase().includes(search.toLowerCase()) && !t.subject.toLowerCase().includes(search.toLowerCase())) return false;
    if (districtFilter && t.district !== districtFilter) return false;
    if (subjectFilter && t.subject !== subjectFilter) return false;
    if (availabilityFilter === "available" && !t.is_available) return false;
    if (availabilityFilter === "unavailable" && t.is_available) return false;
    if (experienceFilter === "1-3" && (t.experience_years < 1 || t.experience_years > 3)) return false;
    if (experienceFilter === "3-5" && (t.experience_years < 3 || t.experience_years > 5)) return false;
    if (experienceFilter === "5+" && t.experience_years < 5) return false;
    return true;
  }) || [];

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

  const renderStars = (rating: number | null) => {
    const r = rating || 0;
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
          <Star key={i} size={12} className={i <= r ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"} />
        ))}
        {r > 0 && <span className="text-[10px] text-muted-foreground ml-1">({r.toFixed(1)})</span>}
      </div>
    );
  };

  const totalTeachers = teachers?.length || 0;
  const availableTeachers = teachers?.filter(t => t.is_available)?.length || 0;

  return (
    <Layout>
      <SEOHead title="শিক্ষক সার্ভিস সেন্টার" description="যোগ্য শিক্ষক খুঁজুন এবং শিক্ষক হিসেবে আবেদন করুন" />
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-background rounded-2xl p-6 md:p-10 mb-8 overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-medium px-3 py-1.5 rounded-full mb-3">
              <GraduationCap size={14} /> শিক্ষক সার্ভিস সেন্টার
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">যোগ্য শিক্ষক খুঁজুন</h1>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">কুরআন, হাদিস ও ইসলামী শিক্ষায় অভিজ্ঞ শিক্ষক খুঁজে নিন আপনার প্রতিষ্ঠানের জন্য</p>

            {/* Stats */}
            <div className="flex justify-center gap-6 mt-5">
              <div className="text-center">
                <div className="text-xl font-bold text-primary">{totalTeachers}</div>
                <div className="text-[10px] text-muted-foreground">মোট শিক্ষক</div>
              </div>
              <div className="w-px bg-border" />
              <div className="text-center">
                <div className="text-xl font-bold text-primary">{availableTeachers}</div>
                <div className="text-[10px] text-muted-foreground">উপলব্ধ</div>
              </div>
              <div className="w-px bg-border" />
              <div className="text-center">
                <div className="text-xl font-bold text-primary">{districts.length}</div>
                <div className="text-[10px] text-muted-foreground">জেলা</div>
              </div>
            </div>

            <div className="flex gap-3 justify-center mt-5">
              <Link to="/teacher-apply">
                <Button className="gap-2 shadow-md"><Briefcase size={16} /> শিক্ষক হিসেবে আবেদন</Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Active Job Postings */}
        {jobs && jobs.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-primary rounded-full" />
              <h2 className="text-lg font-bold">নিয়োগ বিজ্ঞপ্তি</h2>
              <Badge variant="secondary" className="text-[10px]">{jobs.length}টি সক্রিয়</Badge>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {jobs.map(j => (
                <Card key={j.id} className="border-primary/20 hover:border-primary/40 transition-colors group">
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
                      {j.subject && <span className="bg-muted px-2 py-0.5 rounded-full">📚 {j.subject}</span>}
                      {j.location && <span className="bg-muted px-2 py-0.5 rounded-full">📍 {j.location}</span>}
                      {j.salary_range && <span className="bg-muted px-2 py-0.5 rounded-full">💰 {j.salary_range}</span>}
                    </div>
                    <Link to="/teacher-apply" className="mt-3 inline-block">
                      <Button size="sm" variant="outline" className="h-7 text-xs">আবেদন করুন →</Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-card border border-border rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Filter size={14} className="text-primary" />
            <span className="text-sm font-medium">শিক্ষক খুঁজুন</span>
            {filtered.length !== (teachers?.length || 0) && (
              <Badge variant="outline" className="text-[10px] ml-auto">{filtered.length} জন পাওয়া গেছে</Badge>
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
              {visibleTeachers.map(t => (
                <Card
                  key={t.id}
                  className="group hover:shadow-lg hover:border-primary/20 transition-all duration-300 cursor-pointer overflow-hidden"
                  onClick={() => setSelectedTeacher(t)}
                >
                  <CardContent className="p-0">
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        {t.photo_url ? (
                          <img src={t.photo_url} alt={t.name} className="w-16 h-16 rounded-xl object-cover shrink-0 ring-2 ring-muted group-hover:ring-primary/20 transition-colors" />
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-primary text-2xl shrink-0">
                            👨‍🏫
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">{t.name}</h3>
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
                    <div className="px-4 pb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={t.is_available ? "default" : "secondary"}
                          className={`text-[10px] ${t.is_available ? "bg-green-500/10 text-green-700 border-green-200" : ""}`}
                        >
                          {t.is_available ? "✓ উপলব্ধ" : "অনুপলব্ধ"}
                        </Badge>
                      </div>
                      {t.experience_years > 0 && (
                        <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                          {t.experience_years} বছর অভিজ্ঞতা
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
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
                মোট {filtered.length} জন শিক্ষক দেখানো হয়েছে
              </p>
            )}
          </>
        )}

        {/* Teacher Detail Dialog */}
        <Dialog open={!!selectedTeacher} onOpenChange={o => !o && setSelectedTeacher(null)}>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>শিক্ষক প্রোফাইল</DialogTitle></DialogHeader>
            {selectedTeacher && (
              <div className="space-y-5">
                {/* Profile header */}
                <div className="flex items-center gap-4">
                  {selectedTeacher.photo_url ? (
                    <img src={selectedTeacher.photo_url} alt="" className="w-20 h-20 rounded-xl object-cover ring-2 ring-primary/10" />
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-3xl">👨‍🏫</div>
                  )}
                  <div>
                    <h2 className="text-lg font-bold">{selectedTeacher.name}</h2>
                    <p className="text-sm text-muted-foreground">{selectedTeacher.subject}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant={selectedTeacher.is_available ? "default" : "secondary"}
                        className={selectedTeacher.is_available ? "bg-green-500/10 text-green-700 border-green-200" : ""}
                      >
                        {selectedTeacher.is_available ? "✓ উপলব্ধ" : "অনুপলব্ধ"}
                      </Badge>
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
                      <div><div className="text-[10px] text-muted-foreground">অভিজ্ঞতা</div><span className="text-xs font-medium">{selectedTeacher.experience_years} বছর</span></div>
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
                </div>

                {/* Contact */}
                {(selectedTeacher.phone || selectedTeacher.email) && (
                  <div className="border-t pt-3 space-y-2">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">যোগাযোগ</h3>
                    {selectedTeacher.phone && (
                      <a href={`tel:${selectedTeacher.phone}`} className="flex items-center gap-2 text-sm text-primary hover:underline">
                        <Phone size={14} /> {selectedTeacher.phone}
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

                {/* Reviews Section */}
                <TeacherReviewSection teacherId={selectedTeacher.id} />
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

/* ─── Teacher Review Section Component ─── */
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
      const { error } = await supabase.from("teacher_reviews").insert([{
        teacher_id: teacherId,
        reviewer_name: reviewForm.reviewer_name,
        institution_name: reviewForm.institution_name || null,
        rating: reviewForm.rating,
        comment: reviewForm.comment || null,
      }]);
      if (error) throw error;
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
              ({reviews.length}টি · গড় {avgRating.toFixed(1)}⭐)
            </span>
          )}
        </h3>
        <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => setShowForm(!showForm)}>
          <Send size={12} /> রিভিউ দিন
        </Button>
      </div>

      {/* Review Form */}
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

      {/* Existing Reviews */}
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
