import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/sonner";
import { Settings, Palette, Image, Search, ShieldCheck, Smartphone, LayoutDashboard, PenLine, Upload } from "lucide-react";
import AdminPageWrapper from "@/components/admin/AdminPageWrapper";

const sectionToggleKeys = [
  { key: "section_hero", label: "হিরো সেকশন", desc: "হোমপেজের শীর্ষ ব্যানার" },
  { key: "section_notice_ticker", label: "নোটিশ টিকার", desc: "স্ক্রলিং নোটিশ বার" },
  { key: "section_teacher_slider", label: "শিক্ষক তথ্য", desc: "শিক্ষক স্লাইডার সেকশন" },
  { key: "section_job_postings", label: "নিয়োগ বিজ্ঞপ্তি", desc: "চাকরির বিজ্ঞপ্তি স্লাইডার" },
  { key: "section_about", label: "পরিচিতি স্লাইডার", desc: "সম্পর্কে ও ছবি স্লাইডার" },
  { key: "section_islamic_nav", label: "ইসলামী পাতা নেভিগেশন", desc: "কুরআন, হাদিস, দোয়া, মাসআলা" },
  { key: "section_islamic_content", label: "ইসলামী কন্টেন্ট", desc: "দৈনিক ইসলামী কন্টেন্ট উইজেট" },
  { key: "section_departments", label: "বিভাগসমূহ", desc: "বিভাগ কার্ড সেকশন" },
  { key: "section_sidebar", label: "সাইডবার", desc: "লিডার, নোটিশ, নামাজ, পোল" },
  { key: "section_recent_news", label: "সর্বশেষ খবর", desc: "সাম্প্রতিক পোস্ট সেকশন" },
  { key: "section_videos", label: "ভিডিও গ্যালারী", desc: "ইউটিউব ভিডিও সেকশন" },
  { key: "section_seasonal_islamic", label: "সিজনাল ইসলামী কন্টেন্ট", desc: "রমাদান/কুরবানী ইত্যাদি মাসভিত্তিক বিশেষ কার্ড" },
  { key: "auto_islamic_push_enabled", label: "দৈনিক ইসলামী পুশ নোটিফিকেশন", desc: "প্রতিদিন অটোমেটিক আয়াত/হাদিস/দোয়া/মাসআলা পুশ পাঠায়" },
];

const pushTypeToggleKeys = [
  { key: "push_type_quran_enabled", label: "📖 আয়াত (কুরআন)", desc: "কুরআনের আয়াত পুশ নোটিফিকেশনে পাঠান" },
  { key: "push_type_hadith_enabled", label: "📜 হাদিস", desc: "হাদিস পুশ নোটিফিকেশনে পাঠান" },
  { key: "push_type_dua_enabled", label: "🤲 দোয়া", desc: "দোয়া পুশ নোটিফিকেশনে পাঠান" },
  { key: "push_type_masala_enabled", label: "⚖️ মাসআলা", desc: "মাসআলা পুশ নোটিফিকেশনে পাঠান" },
];

const AdminSettings = () => {
  const qc = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["admin_settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("*").order("key");
      if (error) throw error;
      return data;
    },
  });

  const [values, setValues] = useState<Record<string, string>>({});

  const updateMutation = useMutation({
    mutationFn: async ({ id, value }: { id: string; value: string }) => {
      const { error } = await supabase.from("site_settings").update({ value }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("সংরক্ষিত"); qc.invalidateQueries({ queryKey: ["admin_settings"] }); qc.invalidateQueries({ queryKey: ["site_settings"] }); },
  });

  const keyLabels: Record<string, string> = {
    site_name: "সাইটের নাম", site_description: "সাইটের বিবরণ", about_text: "সম্পর্কে লেখা",
    contact_phone: "ফোন নম্বর", contact_email: "ইমেইল", copyright_text: "কপিরাইট লেখা",
    update_ticker: "আপডেট টিকার", logo_url: "লোগো URL", favicon_url: "ফেভিকন URL",
    primary_color: "প্রাইমারি কালার",
    signature_principal: "প্রধান শিক্ষক/মুহতামিমের স্বাক্ষর (ছবি URL)",
    signature_controller: "পরীক্ষা নিয়ন্ত্রকের স্বাক্ষর (ছবি URL)",
    signature_president: "সভাপতির স্বাক্ষর - নোটিশ প্যাড (ছবি URL)",
    default_og_image: "ডিফল্ট OG ছবি", meta_keywords: "মেটা কীওয়ার্ড",
    google_analytics_id: "Google Analytics ID", facebook_page_url: "Facebook পেজ URL",
    twitter_handle: "Twitter হ্যান্ডেল",
    photocard_ad_enabled: "ফটোকার্ডে বিজ্ঞাপন সক্রিয়", photocard_ad_image: "ফটোকার্ড বিজ্ঞাপন ছবি URL",
    otp_enabled: "ইমেইল ওটিপি যাচাই সক্রিয়", two_fa_enabled: "টু-ফ্যাক্টর অথেন্টিকেশন সক্রিয়",
    google_login_enabled: "Google লগইন সক্রিয়", apple_login_enabled: "Apple লগইন সক্রিয়",
    app_name: "অ্যাপের নাম", app_logo_url: "অ্যাপ লোগো URL",
    app_icon_url: "অ্যাপ আইকন URL", app_banner_enabled: "অ্যাপ ব্যানার স্লাইডার সক্রিয়",
    vapid_public_key: "VAPID Public Key", vapid_private_key: "VAPID Private Key",
  };

  const brandingKeys = ["logo_url", "favicon_url", "primary_color"];
  const signatureKeys = ["signature_principal", "signature_controller", "signature_president"];
  const seoKeys = ["default_og_image", "meta_keywords", "google_analytics_id", "facebook_page_url", "twitter_handle"];
  const adKeys = ["photocard_ad_enabled", "photocard_ad_image"];
  const authKeys = ["otp_enabled", "two_fa_enabled", "google_login_enabled", "apple_login_enabled"];
  const appKeys = ["app_name", "app_logo_url", "app_icon_url", "app_banner_enabled", "vapid_public_key", "vapid_private_key"];
  const allSectionKeys = [...sectionToggleKeys.map(s => s.key), ...pushTypeToggleKeys.map(s => s.key)];

  const upsertMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const existing = settings?.find(s => s.key === key);
      if (existing) { const { error } = await supabase.from("site_settings").update({ value }).eq("id", existing.id); if (error) throw error; }
      else { const { error } = await supabase.from("site_settings").insert({ key, value }); if (error) throw error; }
    },
    onSuccess: () => { toast.success("সংরক্ষিত"); qc.invalidateQueries({ queryKey: ["admin_settings"] }); qc.invalidateQueries({ queryKey: ["site_settings"] }); },
  });

  if (isLoading) return <div className="text-center py-8 text-muted-foreground">লোড হচ্ছে...</div>;

  const appSettings = settings?.filter(s => appKeys.includes(s.key));
  const brandingSettings = settings?.filter(s => brandingKeys.includes(s.key));
  const signatureSettings = settings?.filter(s => signatureKeys.includes(s.key));
  const seoSettings = settings?.filter(s => seoKeys.includes(s.key));
  const adSettings = settings?.filter(s => adKeys.includes(s.key));
  const generalSettings = settings?.filter(s => !brandingKeys.includes(s.key) && !signatureKeys.includes(s.key) && !seoKeys.includes(s.key) && !adKeys.includes(s.key) && !authKeys.includes(s.key) && !appKeys.includes(s.key) && !allSectionKeys.includes(s.key));

  const [uploading, setUploading] = useState<string | null>(null);

  const handleFileUpload = async (settingKey: string, file: File) => {
    try {
      setUploading(settingKey);
      const ext = file.name.split(".").pop();
      const path = `site/${settingKey}-${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from("uploads").upload(path, file);
      if (uploadErr) throw uploadErr;
      const { data: urlData } = supabase.storage.from("uploads").getPublicUrl(path);
      const publicUrl = urlData.publicUrl;
      // Upsert the setting
      upsertMutation.mutate({ key: settingKey, value: publicUrl });
    } catch (e: any) {
      toast.error("আপলোড ব্যর্থ: " + e.message);
    } finally {
      setUploading(null);
    }
  };

  const renderSettingField = (s: any) => (
    <div key={s.id}>
      <Label className="mb-1 block font-semibold">{keyLabels[s.key] || s.key}</Label>
      <div className="flex gap-2">
        <Input type={s.key === "primary_color" ? "color" : "text"} defaultValue={s.value || ""} onChange={(e) => setValues({ ...values, [s.id]: e.target.value })} className={s.key === "primary_color" ? "w-20 h-10 p-1" : ""} />
        <Button onClick={() => updateMutation.mutate({ id: s.id, value: values[s.id] ?? s.value ?? "" })} disabled={updateMutation.isPending} size="sm">সংরক্ষণ</Button>
      </div>
      {/* File upload option for image fields */}
      {(s.key === "logo_url" || s.key === "favicon_url" || s.key === "app_icon_url" || s.key === "app_logo_url" || s.key === "default_og_image") && (
        <div className="mt-2">
          <Label className="text-xs text-muted-foreground flex items-center gap-1 mb-1"><Upload size={12} /> অথবা সরাসরি আপলোড করুন</Label>
          <Input type="file" accept="image/*" className="text-xs h-9" disabled={uploading === s.key}
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(s.key, f); }} />
          {uploading === s.key && <p className="text-xs text-primary mt-1">আপলোড হচ্ছে...</p>}
        </div>
      )}
      {(s.key === "logo_url" || s.key === "default_og_image" || s.key === "app_icon_url" || s.key === "app_logo_url" || s.key === "favicon_url") && s.value && <img src={s.value} alt="Preview" className="h-12 mt-2 rounded" />}
    </div>
  );

  const renderNewField = (key: string) => (
    <div key={key}>
      <Label className="mb-1 block font-semibold">{keyLabels[key] || key}</Label>
      <div className="flex gap-2">
        <Input type="text" onChange={(e) => setValues({ ...values, [`new_${key}`]: e.target.value })} placeholder={key.includes("vapid") ? "কী পেস্ট করুন" : ""} />
        <Button onClick={() => upsertMutation.mutate({ key, value: values[`new_${key}`] || "" })} disabled={upsertMutation.isPending} size="sm">সংরক্ষণ</Button>
      </div>
    </div>
  );

  return (
    <AdminPageWrapper title="সাইট সেটিংস" icon={Settings}>
      {/* Section Toggles */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><LayoutDashboard size={18} /> হোমপেজ সেকশন অন/অফ</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground mb-2">হোমপেজের প্রতিটি সেকশন এখান থেকে চালু বা বন্ধ করুন।</p>
          {sectionToggleKeys.map(({ key, label, desc }) => {
            const setting = settings?.find(s => s.key === key);
            const currentVal = setting?.value ?? "true";
            const isEnabled = currentVal !== "false";
            const handleToggle = async (checked: boolean) => {
              const newVal = checked ? "true" : "false";
              upsertMutation.mutate({ key, value: newVal });
            };
            return (
              <div key={key} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <Label className="font-semibold text-sm">{label}</Label>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{desc}</p>
                </div>
                <Switch checked={isEnabled} onCheckedChange={handleToggle} />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Push Content Type Toggles */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2">📬 পুশ নোটিফিকেশন কন্টেন্ট টাইপ</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground mb-2">কোন ধরনের ইসলামী কন্টেন্ট দৈনিক পুশ নোটিফিকেশন হিসেবে পাঠাবেন তা নির্বাচন করুন।</p>
          {pushTypeToggleKeys.map(({ key, label, desc }) => {
            const setting = settings?.find(s => s.key === key);
            const currentVal = setting?.value ?? "true";
            const isEnabled = currentVal !== "false";
            const handleToggle = async (checked: boolean) => {
              const newVal = checked ? "true" : "false";
              upsertMutation.mutate({ key, value: newVal });
            };
            return (
              <div key={key} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <Label className="font-semibold text-sm">{label}</Label>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{desc}</p>
                </div>
                <Switch checked={isEnabled} onCheckedChange={handleToggle} />
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Smartphone size={18} /> মোবাইল অ্যাপ সেটিংস</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {appSettings?.map(renderSettingField)}
          {appKeys.filter(key => !appSettings?.some(s => s.key === key)).map(renderNewField)}
          <p className="text-xs text-muted-foreground">VAPID Public Key ব্রাউজারে সাবস্ক্রিপশনের জন্য এবং VAPID Private Key সার্ভার থেকে পুশ পাঠানোর জন্য।</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Search size={18} /> এসইও সেটিংস</CardTitle></CardHeader>
        <CardContent className="space-y-4">{seoSettings?.map(renderSettingField)}</CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Image size={18} /> ফটোকার্ড বিজ্ঞাপন</CardTitle></CardHeader>
        <CardContent className="space-y-4">{adSettings?.map(renderSettingField)}</CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Palette size={18} /> ব্র্যান্ডিং</CardTitle></CardHeader>
        <CardContent className="space-y-4">{brandingSettings?.map(renderSettingField)}</CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><PenLine size={18} /> স্বাক্ষর সেটিংস</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {signatureSettings?.map((s) => (
            <div key={s.id}>
              <Label className="mb-1 block font-semibold">{keyLabels[s.key] || s.key}</Label>
              <div className="flex gap-2">
                <Input defaultValue={s.value || ""} onChange={(e) => setValues({ ...values, [s.id]: e.target.value })} placeholder="স্বাক্ষরের ছবির URL" />
                <Button onClick={() => updateMutation.mutate({ id: s.id, value: values[s.id] ?? s.value ?? "" })} disabled={updateMutation.isPending} size="sm">সংরক্ষণ</Button>
              </div>
              {s.value && <img src={s.value} alt="Signature" className="h-10 mt-2 border rounded p-1" />}
            </div>
          ))}
          {signatureKeys.filter(key => !signatureSettings?.some(s => s.key === key)).map(renderNewField)}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><ShieldCheck size={18} /> অথেন্টিকেশন সেটিংস</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {authKeys.map((key) => {
            const setting = settings?.find(s => s.key === key);
            const currentVal = setting ? (values[setting.id] ?? setting.value ?? "false") : "false";
            const isEnabled = currentVal === "true";
            const handleToggle = async (checked: boolean) => {
              const newVal = checked ? "true" : "false";
              if (setting) updateMutation.mutate({ id: setting.id, value: newVal });
              else { await supabase.from("site_settings").insert({ key, value: newVal }); qc.invalidateQueries({ queryKey: ["admin_settings"] }); toast.success("সংরক্ষিত"); }
            };
            return (
              <div key={key} className="flex items-center justify-between p-3 bg-muted rounded">
                <div>
                  <Label className="font-semibold">{keyLabels[key] || key}</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {key === "otp_enabled" ? "ইমেইল যাচাই সক্রিয় করুন" : key === "two_fa_enabled" ? "অতিরিক্ত নিরাপত্তা স্তর" : key === "google_login_enabled" ? "Google দিয়ে লগইন" : "Apple দিয়ে লগইন"}
                  </p>
                </div>
                <Switch checked={isEnabled} onCheckedChange={handleToggle} />
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">সাধারণ সেটিংস</CardTitle></CardHeader>
        <CardContent className="space-y-4">{generalSettings?.map(renderSettingField)}</CardContent>
      </Card>
    </AdminPageWrapper>
  );
};

export default AdminSettings;
