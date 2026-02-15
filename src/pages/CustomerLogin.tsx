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
import { LogIn, Mail, Lock } from "lucide-react";

const CustomerLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error("লগইন ব্যর্থ: " + error.message);
    } else {
      toast.success("সফলভাবে লগইন হয়েছে");
      navigate("/profile");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { toast.error("ইমেইল দিন"); return; }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast.error("রিসেট লিংক পাঠাতে ব্যর্থ");
    } else {
      toast.success("পাসওয়ার্ড রিসেট লিংক আপনার ইমেইলে পাঠানো হয়েছে");
      setResetMode(false);
    }
  };

  return (
    <Layout>
      <SEOHead title="লগইন" />
      <div className="max-w-md mx-auto px-4 py-12">
        <Card className="border-primary/20 shadow-lg">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <LogIn className="text-primary" size={28} />
            </div>
            <CardTitle className="text-2xl">{resetMode ? "পাসওয়ার্ড রিসেট" : "লগইন"}</CardTitle>
            <CardDescription>
              {resetMode ? "আপনার ইমেইল দিন, রিসেট লিংক পাঠানো হবে" : "আপনার অ্যাকাউন্টে প্রবেশ করুন"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={resetMode ? handleResetPassword : handleLogin} className="space-y-4">
              <div>
                <Label className="flex items-center gap-1"><Mail size={14} /> ইমেইল</Label>
                <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@mail.com" />
              </div>
              {!resetMode && (
                <div>
                  <Label className="flex items-center gap-1"><Lock size={14} /> পাসওয়ার্ড</Label>
                  <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
                </div>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "অপেক্ষা করুন..." : resetMode ? "রিসেট লিংক পাঠান" : "লগইন করুন"}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm space-y-2">
              <button onClick={() => setResetMode(!resetMode)} className="text-primary hover:underline">
                {resetMode ? "লগইনে ফিরুন" : "পাসওয়ার্ড ভুলে গেছেন?"}
              </button>
              {!resetMode && (
                <p className="text-muted-foreground">
                  অ্যাকাউন্ট নেই? <Link to="/register" className="text-primary hover:underline font-medium">রেজিস্ট্রেশন করুন</Link>
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default CustomerLogin;
