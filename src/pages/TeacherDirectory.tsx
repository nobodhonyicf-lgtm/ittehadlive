import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, MapPin, BookOpen, Award, Phone, Mail, Star } from "lucide-react";
import { Link } from "react-router-dom";

const TeacherDirectory = () => {
  const [search, setSearch] = useState("");
  const [districtFilter, setDistrictFilter] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);

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
    return true;
  }) || [];

  return (
    <Layout>
      <SEOHead title="শিক্ষক সার্ভিস সেন্টার" description="যোগ্য শিক্ষক খুঁজুন এবং শিক্ষক হিসেবে আবেদন করুন" />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">🎓 শিক্ষক সার্ভিস সেন্টার</h1>
          <p className="text-muted-foreground">যোগ্য কুরআন ও ইসলামী শিক্ষা শিক্ষক খুঁজুন</p>
          <div className="flex gap-3 justify-center mt-4">
            <Link to="/teacher-apply">
              <Button>📋 শিক্ষক হিসেবে আবেদন করুন</Button>
            </Link>
          </div>
        </div>

        {/* Active Job Postings */}
        {jobs && jobs.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold mb-3">📢 নিয়োগ বিজ্ঞপ্তি</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {jobs.map(j => (
                <Card key={j.id} className="border-primary/20">
                  <CardContent className="p-4">
                    <h3 className="font-semibold">{j.title}</h3>
                    {j.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{j.description}</p>}
                    <div className="flex flex-wrap gap-2 mt-2 text-xs text-muted-foreground">
                      {j.subject && <span className="bg-muted px-2 py-0.5 rounded">📚 {j.subject}</span>}
                      {j.location && <span className="bg-muted px-2 py-0.5 rounded">📍 {j.location}</span>}
                      {j.salary_range && <span className="bg-muted px-2 py-0.5 rounded">💰 {j.salary_range}</span>}
                      {j.deadline && <span className="bg-muted px-2 py-0.5 rounded">📅 শেষ: {new Date(j.deadline).toLocaleDateString("bn-BD")}</span>}
                    </div>
                    <Link to="/teacher-apply" className="mt-3 inline-block">
                      <Button size="sm" variant="outline">আবেদন করুন</Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input placeholder="নাম বা বিষয় দিয়ে খুঁজুন..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <select className="border border-input rounded-md px-3 py-2 text-sm bg-background" value={districtFilter} onChange={e => setDistrictFilter(e.target.value)}>
            <option value="">সকল জেলা</option>
            {districts.map(d => <option key={d} value={d!}>{d}</option>)}
          </select>
          <select className="border border-input rounded-md px-3 py-2 text-sm bg-background" value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)}>
            <option value="">সকল বিষয়</option>
            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Teacher Grid */}
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">লোড হচ্ছে...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">কোনো শিক্ষক পাওয়া যায়নি</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(t => (
              <Card key={t.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedTeacher(t)}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {t.photo_url ? (
                      <img src={t.photo_url} alt={t.name} className="w-14 h-14 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary text-lg shrink-0">👨‍🏫</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm">{t.name}</h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><BookOpen size={12} /> {t.subject}</p>
                      {t.district && <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin size={12} /> {t.district}</p>}
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={t.is_available ? "default" : "secondary"} className="text-[10px]">{t.is_available ? "উপলব্ধ" : "অনুপলব্ধ"}</Badge>
                        {t.experience_years > 0 && <span className="text-[10px] text-muted-foreground">{t.experience_years} বছর অভিজ্ঞতা</span>}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Teacher Detail Dialog */}
        <Dialog open={!!selectedTeacher} onOpenChange={o => !o && setSelectedTeacher(null)}>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>শিক্ষক প্রোফাইল</DialogTitle></DialogHeader>
            {selectedTeacher && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  {selectedTeacher.photo_url ? (
                    <img src={selectedTeacher.photo_url} alt="" className="w-20 h-20 rounded-full object-cover" />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-3xl">👨‍🏫</div>
                  )}
                  <div>
                    <h2 className="text-lg font-bold">{selectedTeacher.name}</h2>
                    <p className="text-sm text-muted-foreground">{selectedTeacher.subject}</p>
                    <Badge variant={selectedTeacher.is_available ? "default" : "secondary"} className="mt-1">{selectedTeacher.is_available ? "উপলব্ধ" : "অনুপলব্ধ"}</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  {selectedTeacher.qualification && <div className="flex items-center gap-2"><Award size={14} className="text-primary" /><span>{selectedTeacher.qualification}</span></div>}
                  {selectedTeacher.experience_years > 0 && <div className="flex items-center gap-2"><Star size={14} className="text-primary" /><span>{selectedTeacher.experience_years} বছর অভিজ্ঞতা</span></div>}
                  {selectedTeacher.district && <div className="flex items-center gap-2"><MapPin size={14} className="text-primary" /><span>{selectedTeacher.district}</span></div>}
                  {selectedTeacher.specialization && <div className="flex items-center gap-2"><BookOpen size={14} className="text-primary" /><span>{selectedTeacher.specialization}</span></div>}
                  {selectedTeacher.phone && <div className="flex items-center gap-2"><Phone size={14} className="text-primary" /><a href={`tel:${selectedTeacher.phone}`} className="text-primary underline">{selectedTeacher.phone}</a></div>}
                  {selectedTeacher.email && <div className="flex items-center gap-2"><Mail size={14} className="text-primary" /><span>{selectedTeacher.email}</span></div>}
                </div>

                {selectedTeacher.certification && <p className="text-sm"><strong>সার্টিফিকেশন:</strong> {selectedTeacher.certification}</p>}
                {selectedTeacher.preferred_area && <p className="text-sm"><strong>পছন্দের এলাকা:</strong> {selectedTeacher.preferred_area}</p>}
                {selectedTeacher.expected_salary && <p className="text-sm"><strong>প্রত্যাশিত বেতন:</strong> {selectedTeacher.expected_salary}</p>}
                {selectedTeacher.bio && <div className="text-sm bg-muted rounded-lg p-3"><strong>জীবনবৃত্তান্ত:</strong><p className="mt-1 whitespace-pre-wrap">{selectedTeacher.bio}</p></div>}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default TeacherDirectory;
