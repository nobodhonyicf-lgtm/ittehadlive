import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/sonner";
import { Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const { user, isAdmin, hasAnyRole, loading: authLoading, signIn } = useAuth();
  const navigate = useNavigate();

  // Redirect to admin if already logged in as admin
  useEffect(() => {
    if (!authLoading && user && (isAdmin || hasAnyRole)) {
      navigate("/admin");
    }
  }, [user, isAdmin, hasAnyRole, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      toast.error("লগইন ব্যর্থ হয়েছে: " + error.message);
    }
    // Navigation will happen via the useEffect above once isAdmin updates
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("দয়া করে ইমেইল এড্রেস লিখুন");
      return;
    }
    setResetLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/reset-password`,
    });
    setResetLoading(false);
    if (error) {
      toast.error("রিসেট লিংক পাঠাতে ব্যর্থ: " + error.message);
    } else {
      toast.success(`পাসওয়ার্ড রিসেট লিংক ${email} এ পাঠানো হয়েছে`);
      setShowReset(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary rounded-full mx-auto mb-4 flex items-center justify-center">
            <Lock className="text-primary-foreground" size={28} />
          </div>
          <CardTitle className="text-primary">অ্যাডমিন লগইন</CardTitle>
        </CardHeader>
         <CardContent>
           {!showReset ? (
             <form onSubmit={handleSubmit} className="space-y-4">
               <div>
                 <Label htmlFor="email">ইমেইল</Label>
                 <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
               </div>
               <div>
                 <Label htmlFor="password">পাসওয়ার্ড</Label>
                 <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
               </div>
               <Button type="submit" disabled={loading} className="w-full">
                 {loading ? "লগইন হচ্ছে..." : "লগইন"}
               </Button>
               <button
                 type="button"
                 onClick={() => setShowReset(true)}
                 className="w-full text-sm text-primary hover:underline"
               >
                 পাসওয়ার্ড ভুলে গেছেন?
               </button>
             </form>
           ) : (
             <form onSubmit={handleResetPassword} className="space-y-4">
               <p className="text-sm text-muted-foreground mb-4">আপনার ইমেইল এড্রেস দিন, আমরা রিসেট লিংক পাঠাবো।</p>
               <div>
                 <Label htmlFor="reset-email">ইমেইল</Label>
                 <Input id="reset-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
               </div>
               <Button type="submit" disabled={resetLoading} className="w-full">
                 {resetLoading ? "পাঠাচ্ছে..." : "রিসেট লিংক পাঠান"}
               </Button>
               <button
                 type="button"
                 onClick={() => setShowReset(false)}
                 className="w-full text-sm text-primary hover:underline"
               >
                 আবার লগইনে ফিরুন
               </button>
             </form>
           )}
         </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
