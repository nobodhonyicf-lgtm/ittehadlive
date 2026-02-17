import { Bell, BellOff, Loader2, Moon, Sun, Settings, Type, Minus, Plus } from "lucide-react";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import AppLayout from "@/components/app/AppLayout";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { toBengali } from "@/lib/bengali";

const FONT_SIZES = [
  { label: "ছোট", value: 14 },
  { label: "স্বাভাবিক", value: 16 },
  { label: "বড়", value: 18 },
  { label: "অনেক বড়", value: 20 },
];

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
  const [fontSizeIndex, setFontSizeIndex] = useState(1);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
    const saved = localStorage.getItem("app-font-size");
    if (saved) {
      const idx = FONT_SIZES.findIndex((f) => f.value === parseInt(saved));
      if (idx >= 0) setFontSizeIndex(idx);
    }
  }, []);

  useEffect(() => {
    document.documentElement.style.fontSize = `${FONT_SIZES[fontSizeIndex].value}px`;
    localStorage.setItem("app-font-size", String(FONT_SIZES[fontSizeIndex].value));
  }, [fontSizeIndex]);

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

          {/* Font Size */}
          <div className="p-4 bg-card rounded-xl border border-border">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Type size={18} className="text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">ফন্ট সাইজ</p>
                <p className="text-xs text-muted-foreground">
                  {FONT_SIZES[fontSizeIndex].label} ({toBengali(FONT_SIZES[fontSizeIndex].value)}px)
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 px-1">
              <button
                onClick={() => setFontSizeIndex((p) => Math.max(0, p - 1))}
                disabled={fontSizeIndex === 0}
                className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary disabled:opacity-30 active:scale-90 transition-all"
              >
                <Minus size={16} />
              </button>
              <div className="flex-1 flex items-center gap-1">
                {FONT_SIZES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setFontSizeIndex(i)}
                    className={`flex-1 h-2 rounded-full transition-all ${
                      i <= fontSizeIndex ? "bg-primary" : "bg-border"
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={() => setFontSizeIndex((p) => Math.min(FONT_SIZES.length - 1, p + 1))}
                disabled={fontSizeIndex === FONT_SIZES.length - 1}
                className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary disabled:opacity-30 active:scale-90 transition-all"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Notifications */}
          {isSupported && (
            <div className="p-4 bg-card rounded-xl border border-border space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    {isSubscribed ? (
                      <Bell size={18} className="text-primary" />
                    ) : (
                      <BellOff size={18} className="text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">নোটিফিকেশন</p>
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
              {!isSubscribed && !isLoading && (
                <button
                  onClick={() => handleNotifToggle(true)}
                  className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                >
                  <Bell size={16} />
                  নোটিফিকেশন চালু করুন
                </button>
              )}
            </div>
          )}
        </div>

        <p className="text-xs text-muted-foreground text-center mt-8">
          ইত্তেহাদুল মাদারিসিল খুসুসিয়্যাহ © {toBengali(new Date().getFullYear())}
        </p>
      </div>
    </AppLayout>
  );
};

export default AppSettings;
