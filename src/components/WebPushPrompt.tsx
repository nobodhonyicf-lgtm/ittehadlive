import { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

const DISMISS_KEY = "push_prompt_dismissed";
const SUBSCRIBED_KEY = "push_subscribed";

const WebPushPrompt = () => {
  const { isSupported, isSubscribed, isLoading, subscribe } = usePushNotifications();
  const [dismissed, setDismissed] = useState(() => {
    return localStorage.getItem(DISMISS_KEY) === "1" || localStorage.getItem(SUBSCRIBED_KEY) === "1";
  });
  const [show, setShow] = useState(false);

  const { data: vapidKey } = useQuery({
    queryKey: ["vapid_public_key"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "vapid_public_key")
        .maybeSingle();
      if (error) throw error;
      return data?.value || null;
    },
  });

  useEffect(() => {
    if (!isSupported || isSubscribed || dismissed || isLoading) return;
    // Show prompt after 5 seconds
    const timer = setTimeout(() => setShow(true), 5000);
    return () => clearTimeout(timer);
  }, [isSupported, isSubscribed, dismissed, isLoading]);

  if (!show || isSubscribed) return null;

  const handleSubscribe = async () => {
    if (!vapidKey) {
      toast.error("পুশ নোটিফিকেশন সেটআপ করা হয়নি");
      return;
    }
    const ok = await subscribe(vapidKey);
    if (ok) {
      toast.success("নোটিফিকেশন চালু করা হয়েছে!");
      localStorage.setItem(SUBSCRIBED_KEY, "1");
      setShow(false);
    } else {
      if (Notification.permission === "denied") {
        toast.error("ব্রাউজার সেটিংস থেকে নোটিফিকেশন অনুমতি দিন।");
      } else {
        toast.error("নোটিফিকেশন চালু করা যায়নি।");
      }
    }
  };

  const handleDismiss = () => {
    setShow(false);
    setDismissed(true);
    sessionStorage.setItem(DISMISS_KEY, "1");
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md animate-fade-in">
      <div className="relative bg-primary text-primary-foreground rounded-xl shadow-2xl p-4 flex items-center gap-3">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-primary-foreground/20 transition-colors"
          aria-label="বন্ধ করুন"
        >
          <X size={14} />
        </button>
        <div className="bg-primary-foreground/20 rounded-full p-2.5 shrink-0">
          <Bell size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">🔔 নোটিফিকেশন চালু করুন</p>
          <p className="text-xs opacity-80 mt-0.5">নতুন খবর ও ইসলামী কন্টেন্ট সরাসরি পেতে।</p>
        </div>
        <Button
          size="sm"
          variant="secondary"
          onClick={handleSubscribe}
          disabled={isLoading}
          className="shrink-0 text-xs"
        >
          চালু
        </Button>
      </div>
    </div>
  );
};

export default WebPushPrompt;
