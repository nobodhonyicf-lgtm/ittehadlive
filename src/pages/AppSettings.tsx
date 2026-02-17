import { Bell, BellOff, Loader2, Moon, Sun, Settings, ChevronRight } from "lucide-react";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import AppLayout from "@/components/app/AppLayout";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";

const AppSettings = () => {
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

  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("app-theme", next ? "dark" : "light");
  };

  const handleNotifToggle = async (checked: boolean) => {
    if (checked) {
      if (!vapidKey) {
        toast.error("পুশ নোটিফিকেশন সেটআপ করা হয়নি");
        return;
      }
      const ok = await subscribe(vapidKey);
      if (ok) {
        toast.success("নোটিফিকেশন চালু করা হয়েছে!");
      } else {
        if (Notification.permission === "denied") {
          toast.error("ব্রাউজার থেকে নোটিফিকেশন অনুমতি ব্লক করা আছে। সেটিংস থেকে অনুমতি দিন।");
        } else {
          toast.error("নোটিফিকেশন চালু করা যায়নি।");
        }
      }
    } else {
      await unsubscribe();
      toast.success("নোটিফিকেশন বন্ধ করা হয়েছে");
    }
  };

  return (
    <AppLayout>
      <div className="px-4 py-6 max-w-lg mx-auto">
        <h1 className="text-xl font-bold flex items-center gap-2 mb-6">
          <Settings size={22} className="text-primary" />
          সেটিংস
        </h1>

        <div className="space-y-1">
          {/* Theme */}
          <div className="flex items-center justify-between p-4 bg-card rounded-xl border border-border">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                {isDark ? <Moon size={18} className="text-primary" /> : <Sun size={18} className="text-primary" />}
              </div>
              <div>
                <p className="font-semibold text-sm">ডার্ক মোড</p>
                <p className="text-xs text-muted-foreground">অ্যাপের থিম পরিবর্তন করুন</p>
              </div>
            </div>
            <Switch checked={isDark} onCheckedChange={toggleTheme} />
          </div>

          {/* Notifications */}
          {isSupported && (
            <div className="flex items-center justify-between p-4 bg-card rounded-xl border border-border">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  {isSubscribed ? (
                    <Bell size={18} className="text-primary" />
                  ) : (
                    <BellOff size={18} className="text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-sm">পুশ নোটিফিকেশন</p>
                  <p className="text-xs text-muted-foreground">
                    {isSubscribed ? "নোটিফিকেশন চালু আছে" : "নোটিফিকেশন বন্ধ আছে"}
                  </p>
                </div>
              </div>
              {isLoading ? (
                <Loader2 size={18} className="animate-spin text-muted-foreground" />
              ) : (
                <Switch checked={isSubscribed} onCheckedChange={handleNotifToggle} />
              )}
            </div>
          )}
        </div>

        <p className="text-xs text-muted-foreground text-center mt-8">
          ইত্তেহাদুল মাদারিসিল খুসুসিয়্যাহ © {new Date().getFullYear()}
        </p>
      </div>
    </AppLayout>
  );
};

export default AppSettings;
