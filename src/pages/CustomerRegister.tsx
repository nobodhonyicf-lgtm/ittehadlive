import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import SEOHead from "@/components/SEOHead";
import { UserPlus, User, Mail, Lock, Phone } from "lucide-react";

const CustomerRegister = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);

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
