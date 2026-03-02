import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import { CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const TeacherApply = () => {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "", phone: "", email: "", address: "", district: "", subject: "",
    qualification: "", experience_years: 0, specialization: "", certification: "",
    bio: "", photo_url: "", preferred_area: "", expected_salary: "",
    reference_name: "", reference_phone: "",
  });

  const submitMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const payload = {
        ...data,
        email: data.email || null, address: data.address || null, district: data.district || null,
        qualification: data.qualification || null, specialization: data.specialization || null,
        certification: data.certification || null, bio: data.bio || null, photo_url: data.photo_url || null,
        preferred_area: data.preferred_area || null, expected_salary: data.expected_salary || null,
        reference_name: data.reference_name || null, reference_phone: data.reference_phone || null,
      };
      const { error } = await supabase.from("teacher_applications").insert([payload]);
      if (error) throw error;
    },
    onSuccess: () => { setSubmitted(true); toast.success("আবেদন সফলভাবে জমা হয়েছে"); },
    onError: (e: Error) => toast.error(e.message),
  });

  if (submitted) {
    return (
      <Layout>
        <SEOHead title="আবেদন সফল" />
        <div className="container mx-auto px-4 py-16 text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-primary" size={32} />
          </div>
          <h1 className="text-xl font-bold mb-2">আবেদন সফলভাবে জমা হয়েছে!</h1>
          <p className="text-muted-foreground mb-6">আপনার আবেদন পর্যালোচনা করা হবে। অনুমোদনের পর আপনাকে জানানো হবে।</p>
          <Link to="/teachers"><Button variant="outline">শিক্ষক তালিকা দেখুন</Button></Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEOHead title="শিক্ষক আবেদন ফর্ম" description="শিক্ষক হিসেবে আবেদন করুন" />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">📋 শিক্ষক আবেদন ফর্ম</h1>
          <p className="text-muted-foreground text-sm mt-1">নিচের ফর্মটি পূরণ করে শিক্ষক হিসেবে আবেদন করুন</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={e => { e.preventDefault(); if (!form.name || !form.phone || !form.subject) { toast.error("নাম, ফোন ও বিষয় আবশ্যক"); return; } submitMutation.mutate(form); }} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><Label>নাম *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
                <div><Label>ফোন *</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required /></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><Label>ইমেইল</Label><Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
                <div><Label>বিষয় *</Label><Input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required placeholder="যেমন: হিফজ, নূরানী, আরবি" /></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><Label>ঠিকানা</Label><Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
                <div><Label>জেলা</Label><Input value={form.district} onChange={e => setForm({ ...form, district: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><Label>শিক্ষাগত যোগ্যতা</Label><Input value={form.qualification} onChange={e => setForm({ ...form, qualification: e.target.value })} /></div>
                <div><Label>অভিজ্ঞতা (বছর)</Label><Input type="number" value={form.experience_years} onChange={e => setForm({ ...form, experience_years: parseInt(e.target.value) || 0 })} /></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><Label>বিশেষ দক্ষতা</Label><Input value={form.specialization} onChange={e => setForm({ ...form, specialization: e.target.value })} placeholder="যেমন: তাজবীদ, কিরাত" /></div>
                <div><Label>সার্টিফিকেশন</Label><Input value={form.certification} onChange={e => setForm({ ...form, certification: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><Label>পছন্দের এলাকা</Label><Input value={form.preferred_area} onChange={e => setForm({ ...form, preferred_area: e.target.value })} /></div>
                <div><Label>প্রত্যাশিত বেতন</Label><Input value={form.expected_salary} onChange={e => setForm({ ...form, expected_salary: e.target.value })} /></div>
              </div>
              <div><Label>ছবি URL</Label><Input value={form.photo_url} onChange={e => setForm({ ...form, photo_url: e.target.value })} placeholder="আপনার ছবির লিংক দিন" /></div>
              <div><Label>জীবনবৃত্তান্ত / নিজের সম্পর্কে</Label><Textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} rows={3} /></div>

              <div className="border-t pt-4">
                <h3 className="font-semibold text-sm mb-3">রেফারেন্স তথ্য</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div><Label>রেফারেন্সের নাম</Label><Input value={form.reference_name} onChange={e => setForm({ ...form, reference_name: e.target.value })} /></div>
                  <div><Label>রেফারেন্সের ফোন</Label><Input value={form.reference_phone} onChange={e => setForm({ ...form, reference_phone: e.target.value })} /></div>
                </div>
              </div>

              <Button type="submit" disabled={submitMutation.isPending} className="w-full">
                {submitMutation.isPending ? "জমা হচ্ছে..." : "আবেদন জমা দিন"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default TeacherApply;
