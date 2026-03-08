import { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

const DISMISS_KEY = "push_prompt_dismissed";
const SUBSCRIBED_KEY = "push_subscribed";
const VAPID_KEY_USED = "push_vapid_key_used";

const WebPushPrompt = () => {
  const { isSupported, isSubscribed, isLoading, permission, subscribe } = usePushNotifications();
  const [dismissed, setDismissed] = useState(false);
  const [show, setShow] = useState(false);
  const [autoSynced, setAutoSynced] = useState(false);

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

  // Auto-sync: re-subscribe if VAPID key changed or if permission granted but not subscribed
  useEffect(() => {
    if (!isSupported || isLoading || autoSynced || !vapidKey) return;
    
    const storedVapidKey = localStorage.getItem(VAPID_KEY_USED);
    const vapidKeyChanged = storedVapidKey && storedVapidKey !== vapidKey;
    
    if (Notification.permission === 'granted' && (!isSubscribed || vapidKeyChanged)) {
      const reason = vapidKeyChanged ? 'VAPID key changed, re-subscribing...' : 'Permission granted but not subscribed, auto-subscribing...';
      console.log(`[WebPush] ${reason}`);
      setAutoSynced(true);
      subscribe(vapidKey).then((ok) => {
        if (ok) {
          console.log('[WebPush] Auto-subscribe successful');
          localStorage.setItem(SUBSCRIBED_KEY, "1");
          localStorage.setItem(VAPID_KEY_USED, vapidKey);
        } else {
          console.log('[WebPush] Auto-subscribe failed');
        }
      });
    }
  }, [isSupported, isLoading, isSubscribed, vapidKey, autoSynced, subscribe]);

  useEffect(() => {
    if (!isSupported || isSubscribed || isLoading) return;
    // Don't show if already denied
    if ('Notification' in window && Notification.permission === 'denied') return;
    // Don't show if dismissed and permission is not granted
    if (Notification.permission !== 'granted' && 
        (localStorage.getItem(DISMISS_KEY) === "1" || localStorage.getItem(SUBSCRIBED_KEY) === "1")) {
      setDismissed(true);
      return;
    }
    // Show prompt after 5 seconds
    const timer = setTimeout(() => setShow(true), 5000);
    return () => clearTimeout(timer);
  }, [isSupported, isSubscribed, isLoading]);

  if (!show || isSubscribed || dismissed) return null;

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
    localStorage.setItem(DISMISS_KEY, "1");
  };

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md animate-fade-in">
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
