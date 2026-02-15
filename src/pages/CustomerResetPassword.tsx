import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import SEOHead from "@/components/SEOHead";
import { Lock } from "lucide-react";

const CustomerResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { toast.error("কমপক্ষে ৬ অক্ষর দিন"); return; }
    if (password !== confirm) { toast.error("পাসওয়ার্ড মিলছে না"); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) toast.error("পাসওয়ার্ড আপডেট ব্যর্থ");
    else { toast.success("পাসওয়ার্ড আপডেট হয়েছে"); navigate("/profile"); }
  };

  return (
    <Layout>
      <SEOHead title="পাসওয়ার্ড রিসেট" />
      <div className="max-w-md mx-auto px-4 py-12">
        <Card className="border-primary/20 shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <Lock className="text-primary" size={28} />
            </div>
            <CardTitle>নতুন পাসওয়ার্ড সেট করুন</CardTitle>
          </CardHeader>
          <CardContent>
            {ready ? (
              <form onSubmit={handleReset} className="space-y-4">
                <div>
                  <Label>নতুন পাসওয়ার্ড</Label>
                  <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <div>
                  <Label>পাসওয়ার্ড নিশ্চিত করুন</Label>
                  <Input type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "আপডেট হচ্ছে..." : "পাসওয়ার্ড আপডেট করুন"}
                </Button>
              </form>
            ) : (
              <p className="text-center text-muted-foreground py-6">রিসেট লিংক যাচাই হচ্ছে...</p>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default CustomerResetPassword;
