import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";

/**
 * OAuthBridge: This page runs on the lovable.app domain.
 * 
 * Flow:
 * 1. Custom domain redirects here with ?provider=google&return_to=https://ittehad.bd
 * 2. This page initiates OAuth via lovable auth bridge
 * 3. After successful OAuth, it detects the session and redirects back to custom domain
 *    with access_token and refresh_token as URL hash params
 */
const OAuthBridge = () => {
  const [searchParams] = useSearchParams();
  const provider = searchParams.get("provider") as "google" | "apple" | null;
  const returnTo = searchParams.get("return_to");
  const [status, setStatus] = useState("শুরু হচ্ছে...");

  useEffect(() => {
    const handleBridge = async () => {
      // Check if we already have a session (post-OAuth callback)
      const { data: { session } } = await supabase.auth.getSession();

      if (session && returnTo) {
        // We have a session and a return_to URL — redirect back to custom domain
        setStatus("লগইন সফল! রিডাইরেক্ট হচ্ছে...");
        const url = new URL(returnTo);
        url.hash = `access_token=${session.access_token}&refresh_token=${session.refresh_token}&type=bearer`;
        window.location.href = url.toString();
        return;
      }

      if (provider && returnTo) {
        // No session yet — initiate OAuth
        setStatus("Google লগইন শুরু হচ্ছে...");
        // Store return_to in sessionStorage so we can use it after OAuth redirect
        sessionStorage.setItem("oauth_return_to", returnTo);
        const { error } = await lovable.auth.signInWithOAuth(provider, {
          redirect_uri: window.location.origin + "/oauth-bridge?return_to=" + encodeURIComponent(returnTo),
        });
        if (error) {
          setStatus("লগইন ব্যর্থ: " + error.message);
        }
      } else {
        // Check sessionStorage for return_to (post-OAuth redirect)
        const storedReturnTo = sessionStorage.getItem("oauth_return_to");
        if (session && storedReturnTo) {
          sessionStorage.removeItem("oauth_return_to");
          setStatus("লগইন সফল! রিডাইরেক্ট হচ্ছে...");
          const url = new URL(storedReturnTo);
          url.hash = `access_token=${session.access_token}&refresh_token=${session.refresh_token}&type=bearer`;
          window.location.href = url.toString();
        } else {
          setStatus("অনুগ্রহ করে লগইন পেজ থেকে আবার চেষ্টা করুন।");
        }
      }
    };

    handleBridge();
  }, [provider, returnTo]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="text-lg text-muted-foreground">{status}</p>
      </div>
    </div>
  );
};

export default OAuthBridge;
