import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import AppLayout from "@/components/app/AppLayout";
import SEOHead from "@/components/SEOHead";
import { useIsApp } from "@/hooks/useIsApp";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Briefcase, BookOpen, MapPin, DollarSign, CalendarDays, Building2, Send, CheckCircle, Copy } from "lucide-react";

const bdDistricts = [
  "ঢাকা", "চট্টগ্রাম", "রাজশাহী", "খুলনা", "বরিশাল", "সিলেট", "রংপুর", "ময়মনসিংহ",
  "কুমিল্লা", "গাজীপুর", "নারায়ণগঞ্জ", "টাঙ্গাইল", "কিশোরগঞ্জ", "মানিকগঞ্জ", "মুন্সীগঞ্জ",
  "নরসিংদী", "ফরিদপুর", "গোপালগঞ্জ", "মাদারীপুর", "শরীয়তপুর", "রাজবাড়ী",
  "ফেনী", "লক্ষ্মীপুর", "নোয়াখালী", "চাঁদপুর", "ব্রাহ্মণবাড়িয়া",
  "বগুড়া", "জয়পুরহাট", "নওগাঁ", "নাটোর", "চাঁপাইনবাবগঞ্জ", "পাবনা", "সিরাজগঞ্জ",
  "যশোর", "সাতক্ষীরা", "মেহেরপুর", "নড়াইল", "কুষ্টিয়া", "চুয়াডাঙ্গা", "মাগুরা", "ঝিনাইদহ",
  "ঝালকাঠি", "পটুয়াখালী", "পিরোজপুর", "বরগুনা", "ভোলা",
  "হবিগঞ্জ", "মৌলভীবাজার", "সুনামগঞ্জ",
  "দিনাজপুর", "ঠাকুরগাঁও", "পঞ্চগড়", "নীলফামারী", "লালমনিরহাট", "কুড়িগ্রাম", "গাইবান্ধা",
  "শেরপুর", "জামালপুর", "নেত্রকোনা",
  "বান্দরবান", "রাঙামাটি", "খাগড়াছড়ি", "কক্সবাজার",
];

const JobApply = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const isApp = useIsApp();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [trackingCode, setTrackingCode] = useState<string | null>(null);
  const [form, setForm] = useState({
    applicant_name: "", phone: "", email: "", address: "", district: "",
    qualification: "", experience_years: 0, subject: "", expected_salary: "",
    bio: "", photo_url: "", cv_url: "",
  });

  const { data: job } = useQuery({
    queryKey: ["job_detail", jobId],
    queryFn: async () => {
      const { data, error } = await supabase.from("job_postings").select("*").eq("id", jobId!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!jobId,
  });

  const { data: branch } = useQuery({
    queryKey: ["branch_for_job", job?.branch_id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_branches_public");
      if (error) throw error;
      return data?.find((b: any) => b.id === job!.branch_id);
    },
    enabled: !!job?.branch_id,
  });

  // Pre-fill subject from job
  useEffect(() => {
    if (job?.subject && !form.subject) {
      setForm(f => ({ ...f, subject: job.subject || "" }));
    }
  }, [job]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.applicant_name || !form.phone) {
      toast.error("নাম ও ফোন নম্বর আবশ্যক");
      return;
    }
    setSubmitting(true);
    const { data, error } = await supabase.from("job_applications").insert({
      job_id: jobId,
      applicant_name: form.applicant_name,
      phone: form.phone,
      email: form.email || null,
      address: form.address || null,
      district: form.district || null,
      qualification: form.qualification || null,
      experience_years: form.experience_years || 0,
      subject: form.subject || null,
      expected_salary: form.expected_salary || null,
      bio: form.bio || null,
      photo_url: form.photo_url || null,
      cv_url: form.cv_url || null,
      user_id: user?.id || null,
      tracking_code: "temp", // Will be overwritten by trigger
    } as any).select("tracking_code").single();
    setSubmitting(false);

    if (error) {
      toast.error("আবেদন জমা দিতে ব্যর্থ: " + error.message);
    } else {
      setTrackingCode(data.tracking_code);
      toast.success("আবেদন সফলভাবে জমা হয়েছে!");
    }
  };

  const copyTracking = () => {
    if (trackingCode) {
      navigator.clipboard.writeText(trackingCode);
      toast.success("ট্র্যাকিং কোড কপি হয়েছে!");
    }
  };

  if (trackingCode) {
    const successContent = (
      <div className="max-w-lg mx-auto px-4 py-10">
        <SEOHead title="আবেদন সফল" />
        <Card className="text-center">
          <CardContent className="pt-8 pb-6 space-y-4">
            <CheckCircle size={56} className="mx-auto text-primary" />
            <h2 className="text-xl font-bold">আবেদন সফলভাবে জমা হয়েছে!</h2>
            <p className="text-sm text-muted-foreground">আপনার আবেদনের অবস্থা জানতে নিচের ট্র্যাকিং কোড ব্যবহার করুন।</p>
            <div className="bg-muted rounded-xl p-4 space-y-2">
              <p className="text-xs text-muted-foreground">ট্র্যাকিং কোড</p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl font-bold text-primary tracking-wider">{trackingCode}</span>
                <Button variant="ghost" size="icon" onClick={copyTracking}><Copy size={18} /></Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">এই কোডটি সংরক্ষণ করুন। প্রোফাইলের "ট্র্যাক" ট্যাবে গিয়ে আবেদনের অবস্থা জানতে পারবেন।</p>
            <div className="flex gap-2 justify-center pt-2">
              <Link to="/profile"><Button variant="outline" size="sm">প্রোফাইলে যান</Button></Link>
              <Link to="/"><Button size="sm">হোমে যান</Button></Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
    return isApp ? <AppLayout>{successContent}</AppLayout> : <Layout>{successContent}</Layout>;
  }

  const content = (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <Breadcrumbs items={[{ label: "শিক্ষক তালিকা", href: "/teachers" }, { label: job?.title || "নিয়োগ আবেদন" }]} />
      <SEOHead title={job ? `আবেদন: ${job.title}` : "নিয়োগ আবেদন"} />

      {/* Job Info Card */}
      {job && (
        <Card className="mb-6 border-primary/20">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Briefcase size={18} className="text-primary" />
              <h2 className="text-lg font-bold">{job.title}</h2>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              {job.subject && <span className="bg-muted px-2 py-1 rounded-full flex items-center gap-1"><BookOpen size={10} /> {job.subject}</span>}
              {job.location && <span className="bg-muted px-2 py-1 rounded-full flex items-center gap-1"><MapPin size={10} /> {job.location}</span>}
              {job.salary_range && <span className="bg-muted px-2 py-1 rounded-full flex items-center gap-1"><DollarSign size={10} /> {job.salary_range}</span>}
              {job.deadline && <span className="bg-muted px-2 py-1 rounded-full flex items-center gap-1"><CalendarDays size={10} /> শেষ: {new Date(job.deadline).toLocaleDateString("bn-BD")}</span>}
            </div>
            {branch && (
              <div className="flex items-center gap-2 pt-2 border-t border-border">
                {branch.image_url ? <img src={branch.image_url} alt="" className="w-6 h-6 rounded object-contain bg-muted" /> : <Building2 size={16} className="text-primary" />}
                <span className="text-sm font-semibold text-primary">{branch.name}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Application Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Send size={18} className="text-primary" /> আবেদন ফর্ম
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><Label>আবেদনকারীর নাম *</Label><Input value={form.applicant_name} onChange={e => setForm({ ...form, applicant_name: e.target.value })} required placeholder="পূর্ণ নাম" /></div>
              <div><Label>মোবাইল নম্বর *</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required placeholder="01XXXXXXXXX" /></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><Label>ইমেইল</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" /></div>
              <div>
                <Label>জেলা</Label>
                <select className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background h-10" value={form.district} onChange={e => setForm({ ...form, district: e.target.value })}>
                  <option value="">নির্বাচন করুন</option>
                  {bdDistricts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <div><Label>ঠিকানা</Label><Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="বিস্তারিত ঠিকানা" /></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><Label>বিষয়</Label><Input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="যে বিষয়ে আবেদন" /></div>
              <div><Label>শিক্ষাগত যোগ্যতা</Label><Input value={form.qualification} onChange={e => setForm({ ...form, qualification: e.target.value })} placeholder="সর্বশেষ পরীক্ষা ও ফলাফল" /></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><Label>অভিজ্ঞতা (বছর)</Label><Input type="number" min={0} value={form.experience_years} onChange={e => setForm({ ...form, experience_years: parseInt(e.target.value) || 0 })} /></div>
              <div><Label>প্রত্যাশিত বেতন</Label><Input value={form.expected_salary} onChange={e => setForm({ ...form, expected_salary: e.target.value })} placeholder="যেমন: ৮,০০০ - ১২,০০০" /></div>
            </div>
            <div><Label>সংক্ষিপ্ত পরিচিতি</Label><Textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} rows={3} placeholder="নিজের সম্পর্কে কিছু লিখুন..." /></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><Label>ছবি URL</Label><Input value={form.photo_url} onChange={e => setForm({ ...form, photo_url: e.target.value })} placeholder="ছবির লিংক (ঐচ্ছিক)" /></div>
              <div><Label>সিভি URL</Label><Input value={form.cv_url} onChange={e => setForm({ ...form, cv_url: e.target.value })} placeholder="সিভির লিংক (ঐচ্ছিক)" /></div>
            </div>
            <Button type="submit" disabled={submitting} className="w-full gap-2">
              <Send size={16} /> {submitting ? "জমা হচ্ছে..." : "আবেদন জমা দিন"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );

  return isApp ? <AppLayout>{content}</AppLayout> : <Layout>{content}</Layout>;
};

export default JobApply;
