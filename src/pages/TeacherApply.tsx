import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import { CheckCircle, LogIn, Upload, Video, ShieldCheck, AlertTriangle, ClipboardList, Camera } from "lucide-react";
import { Link } from "react-router-dom";
import Breadcrumbs from "@/components/Breadcrumbs";

/* ─── Simple Math CAPTCHA ─── */
const useCaptcha = () => {
  const [captcha, setCaptcha] = useState(() => generateCaptcha());
  const [answer, setAnswer] = useState("");

  function generateCaptcha() {
    const a = Math.floor(Math.random() * 20) + 1;
    const b = Math.floor(Math.random() * 20) + 1;
    return { a, b, question: `${a} + ${b} = ?`, correct: a + b };
  }

  const refresh = useCallback(() => {
    setCaptcha(generateCaptcha());
    setAnswer("");
  }, []);

  const isValid = parseInt(answer) === captcha.correct;

  return { question: captcha.question, answer, setAnswer, isValid, refresh };
};

const TeacherApply = () => {
  const { user, loading: authLoading } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [trackingCode, setTrackingCode] = useState("");
  const [nidFile, setNidFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const captcha = useCaptcha();

  const [form, setForm] = useState({
    name: "", phone: "", email: "", address: "", district: "", subject: "",
    qualification: "", experience_years: 0, specialization: "", certification: "",
    bio: "", preferred_area: "", expected_salary: "",
    reference_name: "", reference_phone: "",
  });

  const uploadFile = async (file: File, folder: string) => {
    const ext = file.name.split(".").pop();
    const path = `${folder}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("uploads").upload(path, file);
    if (error) throw new Error("ফাইল আপলোড ব্যর্থ: " + error.message);
    const { data } = supabase.storage.from("uploads").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSubmitForm = async () => {
    try {
      if (!user) { toast.error("লগইন করুন"); return; }
      if (!captcha.isValid) { toast.error("ক্যাপচার উত্তর ভুল হয়েছে"); return; }
      if (!nidFile) { toast.error("ভোটার আইডি / জন্ম নিবন্ধনের ছবি দিন"); return; }
      if (!videoFile) { toast.error("সেলফি ভিডিও আপলোড করুন"); return; }
      if (videoFile.size > 50 * 1024 * 1024) { toast.error("ভিডিও ৫০MB এর মধ্যে হতে হবে"); return; }
      if (nidFile.size > 10 * 1024 * 1024) { toast.error("NID ছবি ১০MB এর মধ্যে হতে হবে"); return; }
      if (photoFile && photoFile.size > 5 * 1024 * 1024) { toast.error("প্রোফাইল ছবি ৫MB এর মধ্যে হতে হবে"); return; }

      setUploading(true);

      const uploads: Promise<string>[] = [
        uploadFile(nidFile, "teacher-nid"),
        uploadFile(videoFile, "teacher-video"),
      ];
      if (photoFile) uploads.push(uploadFile(photoFile, "teacher-photos"));

      const results = await Promise.all(uploads);
      const nidUrl = results[0];
      const videoUrl = results[1];
      const photoUrl = photoFile ? results[2] : null;

      const payload = {
        ...form,
        user_id: user.id,
        nid_image_url: nidUrl,
        verification_video_url: videoUrl,
        photo_url: photoUrl,
        email: form.email || null, address: form.address || null, district: form.district || null,
        qualification: form.qualification || null, specialization: form.specialization || null,
        certification: form.certification || null, bio: form.bio || null,
        preferred_area: form.preferred_area || null, expected_salary: form.expected_salary || null,
        reference_name: form.reference_name || null, reference_phone: form.reference_phone || null,
      };
      const { data: insertedData, error } = await supabase.from("teacher_applications").insert([payload as any]).select("id").single();
      if (error) throw error;
      
      // Generate tracking code
      const trackingCode = "TA-" + new Date().toISOString().slice(2,4) + new Date().toISOString().slice(5,7) + "-" + (insertedData?.id?.substring(0, 6) || "000000").toUpperCase();
      setTrackingCode(trackingCode);
      
      setSubmitted(true);
      toast.success("আবেদন সফলভাবে জমা হয়েছে");
    } catch (e: any) {
      toast.error(e?.message || "আবেদন জমা দিতে ব্যর্থ");
    } finally {
      setUploading(false);
    }
  };

  // Not logged in
  if (!authLoading && !user) {
    return (
      <Layout>
        <SEOHead title="শিক্ষক আবেদন - লগইন প্রয়োজন" />
        <div className="container mx-auto px-4 py-16 text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <LogIn className="text-primary" size={32} />
          </div>
          <h1 className="text-xl font-bold mb-2">লগইন প্রয়োজন</h1>
          <p className="text-muted-foreground mb-6 text-sm">শিক্ষক হিসেবে আবেদন করতে প্রথমে আপনার একাউন্টে লগইন করুন। একাউন্ট না থাকলে নিবন্ধন করুন।</p>
          <div className="flex gap-3 justify-center">
            <Link to="/login?redirect=/teacher-apply">
              <Button className="gap-2"><LogIn size={16} /> লগইন করুন</Button>
            </Link>
            <Link to="/register?redirect=/teacher-apply">
              <Button variant="outline">নিবন্ধন করুন</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  if (submitted) {
    return (
      <Layout>
        <SEOHead title="আবেদন সফল" />
        <div className="container mx-auto px-4 py-16 text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-primary" size={32} />
          </div>
          <h1 className="text-xl font-bold mb-2">আবেদন সফলভাবে জমা হয়েছে!</h1>
          {trackingCode && (
            <div className="bg-muted rounded-lg p-4 mb-4">
              <p className="text-xs text-muted-foreground mb-1">আপনার ট্র্যাকিং নম্বর</p>
              <p className="text-lg font-mono font-bold text-primary">{trackingCode}</p>
              <p className="text-[10px] text-muted-foreground mt-1">এই নম্বরটি সংরক্ষণ করুন</p>
            </div>
          )}
          <p className="text-muted-foreground mb-6">আপনার আবেদন ও ভেরিফিকেশন ডকুমেন্ট পর্যালোচনা করা হবে। অনুমোদনের পর আপনাকে জানানো হবে।</p>
          <div className="flex gap-3 justify-center">
            <Link to="/teacher-dashboard"><Button>ড্যাশবোর্ড দেখুন</Button></Link>
            <Link to="/teachers"><Button variant="outline">শিক্ষক তালিকা দেখুন</Button></Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEOHead title="শিক্ষক আবেদন ফর্ম" description="শিক্ষক হিসেবে আবেদন করুন" />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold flex items-center justify-center gap-2"><ClipboardList size={24} /> শিক্ষক আবেদন ফর্ম</h1>
          <p className="text-muted-foreground text-sm mt-1">নিচের ফর্মটি পূরণ করে শিক্ষক হিসেবে আবেদন করুন</p>
        </div>

        {/* Verification Notice */}
        <Card className="mb-4 border-amber-200 bg-amber-50/50">
          <CardContent className="p-4 flex items-start gap-3">
            <ShieldCheck size={20} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-amber-800">পরিচয় যাচাই বাধ্যতামূলক</p>
              <p className="text-amber-700 text-xs mt-1">
                স্ক্যাম ও প্রতারণা রোধে আপনাকে ভোটার আইডি/জন্ম নিবন্ধনের ছবি এবং একটি সংক্ষিপ্ত সেলফি ভিডিও আপলোড করতে হবে।
                এটি শুধুমাত্র আপনার অস্তিত্ব যাচাইয়ের জন্য এবং ব্লু ব্যাজের সাথে সম্পর্কিত নয়।
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={e => { e.preventDefault(); if (!form.name || !form.phone || !form.subject) { toast.error("নাম, ফোন ও বিষয় আবশ্যক"); return; } handleSubmitForm(); }} className="space-y-4">
              {/* Basic Info */}
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
              {/* Profile Photo Upload */}
              <div>
                <Label className="flex items-center gap-1.5 mb-1.5"><Camera size={14} /> প্রোফাইল ছবি</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={e => setPhotoFile(e.target.files?.[0] || null)}
                  className="text-xs"
                />
                <p className="text-[10px] text-muted-foreground mt-1">সর্বোচ্চ ৫MB · JPG, PNG (ঐচ্ছিক)</p>
                {photoFile && <p className="text-[10px] text-green-600 mt-0.5">✓ {photoFile.name} নির্বাচিত</p>}
              </div>
              <div><Label>জীবনবৃত্তান্ত / নিজের সম্পর্কে</Label><Textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} rows={3} /></div>

              {/* Reference */}
              <div className="border-t pt-4">
                <h3 className="font-semibold text-sm mb-3">রেফারেন্স তথ্য</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div><Label>রেফারেন্সের নাম</Label><Input value={form.reference_name} onChange={e => setForm({ ...form, reference_name: e.target.value })} /></div>
                  <div><Label>রেফারেন্সের ফোন</Label><Input value={form.reference_phone} onChange={e => setForm({ ...form, reference_phone: e.target.value })} /></div>
                </div>
              </div>

              {/* Verification Documents */}
              <div className="border-t pt-4 space-y-4">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <ShieldCheck size={16} className="text-primary" /> পরিচয় যাচাই (বাধ্যতামূলক)
                </h3>

                {/* NID Upload */}
                <div>
                  <Label className="flex items-center gap-1.5 mb-1.5">
                    <Upload size={14} /> ভোটার আইডি / জন্ম নিবন্ধনের ছবি *
                  </Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={e => setNidFile(e.target.files?.[0] || null)}
                    className="text-xs"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">সর্বোচ্চ ১০MB · JPG, PNG</p>
                  {nidFile && <p className="text-[10px] text-green-600 mt-0.5">✓ {nidFile.name} নির্বাচিত</p>}
                </div>

                {/* Selfie Video Upload */}
                <div>
                  <Label className="flex items-center gap-1.5 mb-1.5">
                    <Video size={14} /> সেলফি ভিডিও *
                  </Label>
                  <Input
                    type="file"
                    accept="video/*"
                    onChange={e => setVideoFile(e.target.files?.[0] || null)}
                    className="text-xs"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    ১০-১৫ সেকেন্ডের ভিডিওতে আপনার নাম ও বিষয় বলুন · সর্বোচ্চ ৫০MB
                  </p>
                  {videoFile && <p className="text-[10px] text-green-600 mt-0.5">✓ {videoFile.name} নির্বাচিত</p>}
                </div>
              </div>

              {/* CAPTCHA */}
              <div className="border-t pt-4">
                <Label className="flex items-center gap-1.5 mb-2">
                  <AlertTriangle size={14} /> নিরাপত্তা যাচাই *
                </Label>
                <div className="flex items-center gap-3">
                  <div className="bg-muted px-4 py-2 rounded-lg font-mono text-lg font-bold select-none">
                    {captcha.question}
                  </div>
                  <Input
                    type="number"
                    placeholder="উত্তর"
                    value={captcha.answer}
                    onChange={e => captcha.setAnswer(e.target.value)}
                    className="w-24 h-10"
                    required
                  />
                  <Button type="button" variant="ghost" size="sm" onClick={captcha.refresh} className="text-xs">
                    নতুন প্রশ্ন
                  </Button>
                </div>
              </div>

              <Button type="submit" disabled={uploading} className="w-full">
                {uploading ? "ফাইল আপলোড হচ্ছে... অনুগ্রহ করে অপেক্ষা করুন" : "আবেদন জমা দিন"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default TeacherApply;
