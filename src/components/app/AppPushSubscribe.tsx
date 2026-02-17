import { Bell, BellOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

const AppPushSubscribe = () => {
  const { isSupported, isSubscribed, isLoading, subscribe, unsubscribe } = usePushNotifications();

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

  if (!isSupported) return null;

  const handleToggle = async () => {
    if (isSubscribed) {
      await unsubscribe();
      toast.success("নোটিফিকেশন বন্ধ করা হয়েছে");
    } else {
      if (!vapidKey) {
        toast.error("পুশ নোটিফিকেশন সেটআপ করা হয়নি");
        return;
      }
      const ok = await subscribe(vapidKey);
      if (ok) {
        toast.success("নোটিফিকেশন চালু করা হয়েছে!");
      } else {
        if (Notification.permission === 'denied') {
          toast.error("ব্রাউজার থেকে নোটিফিকেশন অনুমতি ব্লক করা আছে। সেটিংস থেকে অনুমতি দিন।");
        } else {
          toast.error("নোটিফিকেশন চালু করা যায়নি। আবার চেষ্টা করুন।");
        }
      }
    }
  };

  return (
    <Button
      variant={isSubscribed ? "outline" : "default"}
      size="sm"
      onClick={handleToggle}
      disabled={isLoading}
      className="w-full flex items-center gap-2"
    >
      {isLoading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : isSubscribed ? (
        <BellOff size={16} />
      ) : (
        <Bell size={16} />
      )}
      {isSubscribed ? "নোটিফিকেশন বন্ধ করুন" : "নোটিফিকেশন চালু করুন"}
    </Button>
  );
};

export default AppPushSubscribe;
