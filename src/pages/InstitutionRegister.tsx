import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { Building2, Upload, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { BD_DISTRICTS } from "@/lib/bdDistricts";

const InstitutionRegister = () => {
  const { user } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "", address: "", district: "", phone: "", email: "",
    website: "", muhtamim_name: "", description: "",
    total_students: "", total_teachers: "", departments: "", classes: "",
    logo_url: "", muhtamim_photo_url: "", registration_cert_url: "", approval_letter_url: "",
  });

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  const uploadFile = async (file: File, folder: string) => {
    const ext = file.name.split(".").pop();
    const path = `institutions/${user?.id}/${folder}_${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("uploads").upload(path, file);
    if (error) throw error;
    const { data } = supabase.storage.from("uploads").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, key: string, folder: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("ফাইল ৫MB এর কম হতে হবে"); return; }
    try {
      const url = await uploadFile(file, folder);
      set(key, url);
      toast.success("আপলোড সফল");
    } catch { toast.error("আপলোড ব্যর্থ"); }
  };

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("আগে লগইন করুন");
      if (!form.name.trim() || !form.phone.trim()) throw new Error("নাম ও ফোন আবশ্যক");
      const { error } = await (supabase as any).from("institutions").insert([{
        user_id: user.id,
        name: form.name.trim(),
        address: form.address.trim() || null,
        district: form.district || null,
        phone: form.phone.trim(),
        email: form.email.trim() || null,
        website: form.website.trim() || null,
        muhtamim_name: form.muhtamim_name.trim() || null,
        description: form.description.trim() || null,
        total_students: parseInt(form.total_students) || 0,
        total_teachers: parseInt(form.total_teachers) || 0,
        departments: form.departments.trim() || null,
        classes: form.classes.trim() || null,
        logo_url: form.logo_url || null,
        muhtamim_photo_url: form.muhtamim_photo_url || null,
        registration_cert_url: form.registration_cert_url || null,
        approval_letter_url: form.approval_letter_url || null,
      }]);
      if (error) throw error;
    },
    onSuccess: () => { setSubmitted(true); toast.success("আবেদন সফলভাবে জমা হয়েছে!"); },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!user) {
    return (
      <Layout>
        <SEOHead title="প্রতিষ্ঠান নিবন্ধন" />
        <div className="container mx-auto px-4 py-16 text-center max-w-md">
          <Building2 size={48} className="mx-auto text-muted-foreground/40 mb-4" />
          <h1 className="text-xl font-bold mb-2">প্রতিষ্ঠান নিবন্ধনের জন্য লগইন করুন</h1>
          <p className="text-sm text-muted-foreground mb-4">প্রতিষ্ঠান নিবন্ধন করতে আপনাকে প্রথমে লগইন/রেজিস্টার করতে হবে</p>
          <Link to="/login?returnUrl=/institution-register"><Button className="gap-2">লগইন করুন</Button></Link>
        </div>
      </Layout>
    );
  }

  if (submitted) {
    return (
      <Layout>
        <SEOHead title="আবেদন জমা হয়েছে" />
        <div className="container mx-auto px-4 py-16 text-center max-w-md">
          <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
          <h1 className="text-xl font-bold mb-2">আবেদন সফলভাবে জমা হয়েছে!</h1>
          <p className="text-sm text-muted-foreground mb-4">অ্যাডমিন আপনার আবেদন পর্যালোচনা করে অনুমোদন দেবেন। অনুমোদনের পর আপনাকে জানানো হবে।</p>
          <Link to="/"><Button>হোমে ফিরুন</Button></Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEOHead title="প্রতিষ্ঠান নিবন্ধন" description="আপনার প্রতিষ্ঠান ইত্তেহাদুল মাদারিসে নিবন্ধন করুন" />
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-medium px-3 py-1.5 rounded-full mb-3">
            <Building2 size={14} /> প্রতিষ্ঠান নিবন্ধন
          </div>
          <h1 className="text-2xl font-bold">প্রতিষ্ঠান নিবন্ধন ফর্ম</h1>
          <p className="text-sm text-muted-foreground mt-1">আপনার প্রতিষ্ঠানের তথ্য পূরণ করুন</p>
        </div>

        <form onSubmit={e => { e.preventDefault(); submitMutation.mutate(); }} className="space-y-6">
          {/* মৌলিক তথ্য */}
          <Card>
            <CardContent className="p-5 space-y-4">
              <h2 className="font-semibold text-sm border-b pb-2">মৌলিক তথ্য</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label>প্রতিষ্ঠানের নাম *</Label><Input value={form.name} onChange={e => set("name", e.target.value)} required /></div>
                <div><Label>ফোন *</Label><Input value={form.phone} onChange={e => set("phone", e.target.value)} required /></div>
                <div><Label>ইমেইল</Label><Input type="email" value={form.email} onChange={e => set("email", e.target.value)} /></div>
                <div><Label>ওয়েবসাইট</Label><Input value={form.website} onChange={e => set("website", e.target.value)} /></div>
                <div className="md:col-span-2"><Label>ঠিকানা</Label><Input value={form.address} onChange={e => set("address", e.target.value)} /></div>
                <div>
                  <Label>জেলা</Label>
                  <select className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background" value={form.district} onChange={e => set("district", e.target.value)}>
                    <option value="">জেলা নির্বাচন করুন</option>
                    {BD_DISTRICTS.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
                  </select>
                </div>
                <div><Label>মুহতামিম/প্রধানের নাম</Label><Input value={form.muhtamim_name} onChange={e => set("muhtamim_name", e.target.value)} /></div>
              </div>
              <div><Label>প্রতিষ্ঠানের বিবরণ</Label><Textarea value={form.description} onChange={e => set("description", e.target.value)} rows={3} /></div>
            </CardContent>
          </Card>

          {/* শিক্ষা সংক্রান্ত */}
          <Card>
            <CardContent className="p-5 space-y-4">
              <h2 className="font-semibold text-sm border-b pb-2">শিক্ষা সংক্রান্ত তথ্য</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label>মোট ছাত্র সংখ্যা</Label><Input type="number" value={form.total_students} onChange={e => set("total_students", e.target.value)} /></div>
                <div><Label>মোট শিক্ষক সংখ্যা</Label><Input type="number" value={form.total_teachers} onChange={e => set("total_teachers", e.target.value)} /></div>
                <div><Label>বিভাগসমূহ</Label><Input value={form.departments} onChange={e => set("departments", e.target.value)} placeholder="যেমন: হিফজ, কিতাব, মক্তব" /></div>
                <div><Label>শ্রেণীসমূহ</Label><Input value={form.classes} onChange={e => set("classes", e.target.value)} placeholder="যেমন: ১ম - দাওরায়ে হাদিস" /></div>
              </div>
            </CardContent>
          </Card>

          {/* ডকুমেন্ট আপলোড */}
          <Card>
            <CardContent className="p-5 space-y-4">
              <h2 className="font-semibold text-sm border-b pb-2">ডকুমেন্ট আপলোড</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>প্রতিষ্ঠানের লোগো</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input type="file" accept="image/*" onChange={e => handleFileUpload(e, "logo_url", "logo")} className="text-xs" />
                    {form.logo_url && <img src={form.logo_url} alt="" className="w-8 h-8 rounded object-contain" />}
                  </div>
                </div>
                <div>
                  <Label>মুহতামিমের ছবি</Label>
                  <Input type="file" accept="image/*" onChange={e => handleFileUpload(e, "muhtamim_photo_url", "muhtamim")} className="text-xs" />
                </div>
                <div>
                  <Label>রেজিস্ট্রেশন সার্টিফিকেট</Label>
                  <Input type="file" accept="image/*,.pdf" onChange={e => handleFileUpload(e, "registration_cert_url", "reg_cert")} className="text-xs" />
                </div>
                <div>
                  <Label>অনুমোদন পত্র</Label>
                  <Input type="file" accept="image/*,.pdf" onChange={e => handleFileUpload(e, "approval_letter_url", "approval")} className="text-xs" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Button type="submit" disabled={submitMutation.isPending} className="w-full gap-2" size="lg">
            <Upload size={16} /> {submitMutation.isPending ? "জমা হচ্ছে..." : "আবেদন জমা দিন"}
          </Button>
        </form>
      </div>
    </Layout>
  );
};

export default InstitutionRegister;
