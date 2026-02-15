import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

/**
 * OAuthCallback: This page runs on the custom domain (ittehad.bd).
 * It receives auth tokens from the URL hash and sets the Supabase session.
 */
const OAuthCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState("সেশন সেট হচ্ছে...");

  useEffect(() => {
    const handleCallback = async () => {
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");

      if (accessToken && refreshToken) {
        try {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            setStatus("সেশন সেট করতে ব্যর্থ: " + error.message);
            return;
          }

          setStatus("লগইন সফল! রিডাইরেক্ট হচ্ছে...");
          // Small delay to let auth state propagate
          setTimeout(() => {
            navigate("/profile", { replace: true });
          }, 500);
        } catch (err: any) {
          setStatus("ত্রুটি: " + err.message);
        }
      } else {
        // Supabase might auto-detect session from URL
        // Wait a moment and check
        setTimeout(async () => {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            navigate("/profile", { replace: true });
          } else {
            setStatus("টোকেন পাওয়া যায়নি। আবার চেষ্টা করুন।");
          }
        }, 1000);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="text-lg text-muted-foreground">{status}</p>
      </div>
    </div>
  );
};

export default OAuthCallback;
