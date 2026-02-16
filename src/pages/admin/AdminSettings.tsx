import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/sonner";
import { Settings, Palette, Image, Globe, Search, ShieldCheck, Smartphone } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_settings"] });
      qc.invalidateQueries({ queryKey: ["site_settings"] });
      toast.success("সংরক্ষিত");
    },
  });

  const keyLabels: Record<string, string> = {
    site_name: "সাইটের নাম",
    site_description: "সাইটের বিবরণ",
    about_text: "সম্পর্কে লেখা",
    contact_phone: "ফোন নম্বর",
    contact_email: "ইমেইল",
    copyright_text: "কপিরাইট লেখা",
    update_ticker: "আপডেট টিকার",
    logo_url: "লোগো URL",
    favicon_url: "ফেভিকন URL",
    primary_color: "প্রাইমারি কালার",
    signature_principal: "প্রধান শিক্ষক/মুহতামিমের স্বাক্ষর (ছবি URL)",
    signature_controller: "পরীক্ষা নিয়ন্ত্রকের স্বাক্ষর (ছবি URL)",
    default_og_image: "ডিফল্ট OG ছবি (সোশ্যাল শেয়ার প্রিভিউ)",
    meta_keywords: "মেটা কীওয়ার্ড (কমা দিয়ে আলাদা)",
    google_analytics_id: "Google Analytics ID",
    facebook_page_url: "Facebook পেজ URL",
    twitter_handle: "Twitter হ্যান্ডেল",
    photocard_ad_enabled: "ফটোকার্ডে বিজ্ঞাপন সক্রিয়",
    photocard_ad_image: "ফটোকার্ড বিজ্ঞাপন ছবি URL",
    otp_enabled: "ইমেইল ওটিপি যাচাই সক্রিয়",
    two_fa_enabled: "টু-ফ্যাক্টর অথেন্টিকেশন (2FA) সক্রিয়",
    google_login_enabled: "Google লগইন সক্রিয়",
    apple_login_enabled: "Apple লগইন সক্রিয়",
    app_name: "অ্যাপের নাম",
    app_logo_url: "অ্যাপ লোগো URL",
    app_icon_url: "অ্যাপ আইকন URL (PWA হোমস্ক্রিন আইকন)",
    app_banner_enabled: "অ্যাপ ব্যানার স্লাইডার সক্রিয়",
    vapid_public_key: "VAPID Public Key (পুশ নোটিফিকেশন)",
  };

  const brandingKeys = ["logo_url", "favicon_url", "primary_color"];
  const signatureKeys = ["signature_principal", "signature_controller"];
  const seoKeys = ["default_og_image", "meta_keywords", "google_analytics_id", "facebook_page_url", "twitter_handle"];
  const adKeys = ["photocard_ad_enabled", "photocard_ad_image"];
  const authKeys = ["otp_enabled", "two_fa_enabled", "google_login_enabled", "apple_login_enabled"];
  const appKeys = ["app_name", "app_logo_url", "app_icon_url", "app_banner_enabled", "vapid_public_key"];

  if (isLoading) return <div className="text-center py-8">লোড হচ্ছে...</div>;

  const appSettings = settings?.filter(s => appKeys.includes(s.key));
  const brandingSettings = settings?.filter(s => brandingKeys.includes(s.key));
  const signatureSettings = settings?.filter(s => signatureKeys.includes(s.key));
  const seoSettings = settings?.filter(s => seoKeys.includes(s.key));
  const adSettings = settings?.filter(s => adKeys.includes(s.key));
  const authSettings = settings?.filter(s => authKeys.includes(s.key));
  const generalSettings = settings?.filter(s => !brandingKeys.includes(s.key) && !signatureKeys.includes(s.key) && !seoKeys.includes(s.key) && !adKeys.includes(s.key) && !authKeys.includes(s.key) && !appKeys.includes(s.key));

  const renderSettingField = (s: any) => (
    <div key={s.id}>
      <Label className="mb-1 block font-semibold">{keyLabels[s.key] || s.key}</Label>
      <div className="flex gap-2">
        <Input
          type={s.key === "primary_color" ? "color" : "text"}
          defaultValue={s.value || ""}
          onChange={(e) => setValues({ ...values, [s.id]: e.target.value })}
          className={s.key === "primary_color" ? "w-20 h-10 p-1" : ""}
        />
        <Button
          onClick={() => updateMutation.mutate({ id: s.id, value: values[s.id] ?? s.value ?? "" })}
          disabled={updateMutation.isPending}
          size="sm"
        >
          সংরক্ষণ
        </Button>
      </div>
      {(s.key === "logo_url" || s.key === "default_og_image") && s.value && (
        <img src={s.value} alt="Preview" className="h-12 mt-2 rounded" />
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold flex items-center gap-2"><Settings size={22} /> সাইট সেটিংস</h1>

      {/* App Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Smartphone size={18} /> মোবাইল অ্যাপ সেটিংস</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {appSettings?.map(renderSettingField)}
          <p className="text-xs text-muted-foreground">
            অ্যাপ লোগো URL দিলে PWA/নেটিভ অ্যাপে আলাদা লোগো দেখাবে। খালি রাখলে ওয়েবসাইটের লোগো ব্যবহার হবে।
          </p>
        </CardContent>
      </Card>

      {/* SEO Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Search size={18} /> এসইও সেটিংস</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {seoSettings?.map(renderSettingField)}
        </CardContent>
      </Card>

      {/* Photo Card Ad Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Image size={18} /> ফটোকার্ড বিজ্ঞাপন</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {adSettings?.map(renderSettingField)}
          <p className="text-xs text-muted-foreground">
            "ফটোকার্ডে বিজ্ঞাপন সক্রিয়" এর মান <b>true</b> দিলে ফ্রন্টেন্ডে ফটোকার্ডে বিজ্ঞাপন দেখাবে। <b>false</b> দিলে দেখাবে না।
          </p>
        </CardContent>
      </Card>

      {/* Branding */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Palette size={18} /> ব্র্যান্ডিং</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {brandingSettings?.map(renderSettingField)}
        </CardContent>
      </Card>

      {/* Signatures */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">✍️ মার্কশিট স্বাক্ষর</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {signatureSettings?.map((s) => (
            <div key={s.id}>
              <Label className="mb-1 block font-semibold">{keyLabels[s.key] || s.key}</Label>
              <div className="flex gap-2">
                <Input
                  defaultValue={s.value || ""}
                  onChange={(e) => setValues({ ...values, [s.id]: e.target.value })}
                  placeholder="স্বাক্ষরের ছবির URL দিন"
                />
                <Button
                  onClick={() => updateMutation.mutate({ id: s.id, value: values[s.id] ?? s.value ?? "" })}
                  disabled={updateMutation.isPending}
                  size="sm"
                >
                  সংরক্ষণ
                </Button>
              </div>
              {s.value && (
                <img src={s.value} alt="Signature preview" className="h-10 mt-2 border rounded p-1" />
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Auth Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><ShieldCheck size={18} /> অথেন্টিকেশন সেটিংস</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {authKeys.map((key) => {
            const setting = settings?.find(s => s.key === key);
            const currentVal = setting ? (values[setting.id] ?? setting.value ?? "false") : "false";
            const isEnabled = currentVal === "true";

            const handleToggle = async (checked: boolean) => {
              const newVal = checked ? "true" : "false";
              if (setting) {
                updateMutation.mutate({ id: setting.id, value: newVal });
              } else {
                // Create the setting
                const { error } = await supabase.from("site_settings").insert({ key, value: newVal });
                if (error) {
                  toast.error("সংরক্ষণ ব্যর্থ");
                } else {
                  qc.invalidateQueries({ queryKey: ["admin_settings"] });
                  toast.success("সংরক্ষিত");
                }
              }
            };

            return (
              <div key={key} className="flex items-center justify-between p-3 bg-muted rounded">
                <div>
                  <Label className="font-semibold">{keyLabels[key] || key}</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {key === "otp_enabled"
                      ? "চালু করলে ইউজাররা রেজিস্ট্রেশনের পর ইমেইল যাচাই করতে হবে"
                      : key === "two_fa_enabled"
                      ? "চালু করলে ইউজাররা লগইনের সময় অতিরিক্ত নিরাপত্তা স্তর ব্যবহার করতে পারবে"
                      : key === "google_login_enabled"
                      ? "চালু করলে লগইন/রেজিস্ট্রেশন পেজে Google দিয়ে লগইন বাটন দেখাবে"
                      : "চালু করলে লগইন/রেজিস্ট্রেশন পেজে Apple দিয়ে লগইন বাটন দেখাবে"}
                  </p>
                </div>
                <Switch checked={isEnabled} onCheckedChange={handleToggle} />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">সাধারণ সেটিংস</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {generalSettings?.map(renderSettingField)}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;
