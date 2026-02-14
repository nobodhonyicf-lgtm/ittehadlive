import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionValid, setSessionValid] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if there's a valid session from the reset email
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        setSessionValid(true);
      } else {
        toast.error("রিসেট লিংকটি বৈধ নয় বা মেয়াদ শেষ হয়েছে");
        setTimeout(() => navigate("/admin/login"), 2000);
      }
    };
    checkSession();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      toast.error("সব ফিল্ড পূরণ করুন");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("পাসওয়ার্ড মিলছে না");
      return;
    }

    if (password.length < 6) {
      toast.error("পাসওয়ার্ড অন্তত ৬ অক্ষর হতে হবে");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      toast.error("পাসওয়ার্ড পরিবর্তন ব্যর্থ: " + error.message);
    } else {
      toast.success("পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে");
      setTimeout(() => navigate("/admin/login"), 2000);
    }
  };

  if (!sessionValid) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">লোড হচ্ছে...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary rounded-full mx-auto mb-4 flex items-center justify-center">
            <Lock className="text-primary-foreground" size={28} />
          </div>
          <CardTitle className="text-primary">নতুন পাসওয়ার্ড</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="password">নতুন পাসওয়ার্ড</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div>
              <Label htmlFor="confirm-password">পাসওয়ার্ড নিশ্চিত করুন</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "পরিবর্তন হচ্ছে..." : "পাসওয়ার্ড পরিবর্তন করুন"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
