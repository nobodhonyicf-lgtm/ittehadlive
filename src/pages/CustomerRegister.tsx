import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";
import SEOHead from "@/components/SEOHead";
import { UserPlus, User, Mail, Lock, Phone } from "lucide-react";

const CustomerRegister = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);

  const { data: socialSettings } = useQuery({
    queryKey: ["social_login_settings"],
    queryFn: async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", ["google_login_enabled", "apple_login_enabled"]);
      const map: Record<string, boolean> = {};
      data?.forEach((s) => (map[s.key] = s.value === "true"));
      return map;
    },
  });

  const googleEnabled = socialSettings?.google_login_enabled ?? false;
  const appleEnabled = socialSettings?.apple_login_enabled ?? false;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error("পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে"); return; }
    if (form.password !== form.confirmPassword) { toast.error("পাসওয়ার্ড মিলছে না"); return; }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.full_name },
        emailRedirectTo: window.location.origin,
      },
    });
    setLoading(false);

    if (error) {
      toast.error("রেজিস্ট্রেশন ব্যর্থ: " + error.message);
    } else {
      toast.success("রেজিস্ট্রেশন সফল! অনুগ্রহ করে আপনার ইমেইল ভেরিফাই করুন।");
      navigate("/login");
    }
  };

  const handleSocialLogin = async (provider: "google" | "apple") => {
    setSocialLoading(provider);
    try {
      const isCustomDomain =
        !window.location.hostname.includes("lovable.app") &&
        !window.location.hostname.includes("lovableproject.com");

      if (isCustomDomain) {
        const lovableOrigin = "https://ittehadlive.lovable.app";
        const redirectUri = encodeURIComponent(window.location.origin);
        window.location.href = `${lovableOrigin}/~oauth/initiate?provider=${provider}&redirect_uri=${redirectUri}`;
        return;
      } else {
        const { error } = await lovable.auth.signInWithOAuth(provider, {
          redirect_uri: window.location.origin,
        });
        if (error) throw error;
      }
    } catch (err: any) {
      toast.error(`${provider} লগইন ব্যর্থ: ${err.message}`);
    } finally {
      setSocialLoading(null);
    }
  };

  const hasSocialLogin = googleEnabled || appleEnabled;

  return (
    <Layout>
      <SEOHead title="রেজিস্ট্রেশন" />
      <div className="max-w-md mx-auto px-4 py-12">
        <Card className="border-primary/20 shadow-lg">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <UserPlus className="text-primary" size={28} />
            </div>
            <CardTitle className="text-2xl">রেজিস্ট্রেশন</CardTitle>
            <CardDescription>নতুন অ্যাকাউন্ট তৈরি করুন</CardDescription>
          </CardHeader>
          <CardContent>
            {hasSocialLogin && (
              <div className="space-y-3 mb-4">
                {googleEnabled && (
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    disabled={socialLoading === "google"}
                    onClick={() => handleSocialLogin("google")}
                  >
                    <svg viewBox="0 0 24 24" className="w-5 h-5"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                    {socialLoading === "google" ? "অপেক্ষা করুন..." : "Google দিয়ে সাইন আপ"}
                  </Button>
                )}
                {appleEnabled && (
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    disabled={socialLoading === "apple"}
                    onClick={() => handleSocialLogin("apple")}
                  >
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
                    {socialLoading === "apple" ? "অপেক্ষা করুন..." : "Apple দিয়ে সাইন আপ"}
                  </Button>
                )}
                <div className="flex items-center gap-3">
                  <Separator className="flex-1" />
                  <span className="text-xs text-muted-foreground">অথবা</span>
                  <Separator className="flex-1" />
                </div>
              </div>
            )}
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <Label className="flex items-center gap-1"><User size={14} /> পূর্ণ নাম *</Label>
                <Input required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="আপনার নাম" />
              </div>
              <div>
                <Label className="flex items-center gap-1"><Mail size={14} /> ইমেইল *</Label>
                <Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="example@mail.com" />
              </div>
              <div>
                <Label className="flex items-center gap-1"><Phone size={14} /> ফোন নম্বর</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="০১XXXXXXXXX" />
              </div>
              <div>
                <Label className="flex items-center gap-1"><Lock size={14} /> পাসওয়ার্ড *</Label>
                <Input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="কমপক্ষে ৬ অক্ষর" />
              </div>
              <div>
                <Label className="flex items-center gap-1"><Lock size={14} /> পাসওয়ার্ড নিশ্চিত করুন *</Label>
                <Input type="password" required value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} placeholder="পুনরায় পাসওয়ার্ড দিন" />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "অপেক্ষা করুন..." : "রেজিস্ট্রেশন করুন"}
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              অ্যাকাউন্ট আছে? <Link to="/login" className="text-primary hover:underline font-medium">লগইন করুন</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default CustomerRegister;
