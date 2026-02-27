import { Bell, BellOff, Loader2, Moon, Sun, Settings, Type, Minus, Plus, MapPin, ChevronRight, Palette, Info, Shield } from "lucide-react";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import AppLayout from "@/components/app/AppLayout";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { toBengali } from "@/lib/bengali";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";

const BD_LOCATIONS = [
  { name: "ঢাকা", lat: 23.8103, lng: 90.4125 },
  { name: "চট্টগ্রাম", lat: 22.3569, lng: 91.7832 },
  { name: "রাজশাহী", lat: 24.3636, lng: 88.6241 },
  { name: "খুলনা", lat: 22.8456, lng: 89.5403 },
  { name: "সিলেট", lat: 24.8949, lng: 91.8687 },
  { name: "বরিশাল", lat: 22.701, lng: 90.3535 },
  { name: "রংপুর", lat: 25.7439, lng: 89.2752 },
  { name: "ময়মনসিংহ", lat: 24.7471, lng: 90.4203 },
  { name: "কুমিল্লা", lat: 23.4607, lng: 91.1809 },
  { name: "গাজীপুর", lat: 23.9999, lng: 90.4203 },
  { name: "নারায়ণগঞ্জ", lat: 23.6238, lng: 90.5 },
  { name: "ব্রাহ্মণবাড়িয়া", lat: 23.9571, lng: 91.1115 },
  { name: "যশোর", lat: 23.1667, lng: 89.2 },
  { name: "কক্সবাজার", lat: 21.4272, lng: 92.0058 },
  { name: "দিনাজপুর", lat: 25.6279, lng: 88.6332 },
  { name: "বগুড়া", lat: 24.8465, lng: 89.3773 },
  { name: "নোয়াখালী", lat: 22.8696, lng: 91.0995 },
  { name: "পাবনা", lat: 24.0064, lng: 89.2372 },
  { name: "টাঙ্গাইল", lat: 24.2513, lng: 89.9164 },
  { name: "স্বয়ংক্রিয় (GPS)", lat: 0, lng: 0 },
];

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
  const [selectedLocation, setSelectedLocation] = useState("ঢাকা");

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
    const saved = localStorage.getItem("app-font-size");
    if (saved) {
      const idx = FONT_SIZES.findIndex((f) => f.value === parseInt(saved));
      if (idx >= 0) setFontSizeIndex(idx);
    }
    const savedLoc = localStorage.getItem("prayer-location");
    if (savedLoc) setSelectedLocation(savedLoc);
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
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md">
            <Settings size={20} className="text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">সেটিংস</h1>
            <p className="text-xs text-muted-foreground">অ্যাপ কাস্টমাইজ করুন</p>
          </div>
        </div>

        {/* General Section */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">সাধারণ</p>
          <div className="bg-card rounded-2xl border border-border overflow-hidden divide-y divide-border">
            {/* Location */}
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-9 w-9 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <MapPin size={18} className="text-blue-500" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">লোকেশন</p>
                  <p className="text-[11px] text-muted-foreground">নামাজের সময় ও ইফতারের জন্য</p>
                </div>
              </div>
              <Select value={selectedLocation} onValueChange={(v) => {
                setSelectedLocation(v);
                localStorage.setItem("prayer-location", v);
                toast.success(`লোকেশন পরিবর্তন: ${v}`);
              }}>
                <SelectTrigger className="w-full h-10 rounded-xl">
                  <SelectValue placeholder="লোকেশন নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  {BD_LOCATIONS.map(loc => (
                    <SelectItem key={loc.name} value={loc.name}>{loc.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Theme */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  {isDark ? <Moon size={18} className="text-purple-500" /> : <Sun size={18} className="text-amber-500" />}
                </div>
                <div>
                  <p className="font-semibold text-sm">ডার্ক মোড</p>
                  <p className="text-[11px] text-muted-foreground">{isDark ? "চালু আছে" : "বন্ধ আছে"}</p>
                </div>
              </div>
              <Switch checked={isDark} onCheckedChange={toggleTheme} />
            </div>

            {/* Font Size */}
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-9 w-9 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <Type size={18} className="text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">ফন্ট সাইজ</p>
                  <p className="text-[11px] text-muted-foreground">
                    {FONT_SIZES[fontSizeIndex].label} ({toBengali(FONT_SIZES[fontSizeIndex].value)}px)
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 px-1">
                <button
                  onClick={() => setFontSizeIndex((p) => Math.max(0, p - 1))}
                  disabled={fontSizeIndex === 0}
                  className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center text-foreground disabled:opacity-30 active:scale-90 transition-all"
                >
                  <Minus size={16} />
                </button>
                <div className="flex-1 flex items-center gap-1.5">
                  {FONT_SIZES.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setFontSizeIndex(i)}
                      className={`flex-1 h-2.5 rounded-full transition-all duration-200 ${
                        i <= fontSizeIndex ? "bg-primary shadow-sm" : "bg-border"
                      }`}
                    />
                  ))}
                </div>
                <button
                  onClick={() => setFontSizeIndex((p) => Math.min(FONT_SIZES.length - 1, p + 1))}
                  disabled={fontSizeIndex === FONT_SIZES.length - 1}
                  className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center text-foreground disabled:opacity-30 active:scale-90 transition-all"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        {isSupported && (
          <div className="mb-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">নোটিফিকেশন</p>
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${isSubscribed ? 'bg-red-500/10' : 'bg-muted'}`}>
                      {isSubscribed ? (
                        <Bell size={18} className="text-red-500" />
                      ) : (
                        <BellOff size={18} className="text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">পুশ নোটিফিকেশন</p>
                      <p className="text-[11px] text-muted-foreground">
                        {isSubscribed ? "সক্রিয়" : "নিষ্ক্রিয়"}
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
                    className="w-full mt-3 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-sm"
                  >
                    <Bell size={16} />
                    নোটিফিকেশন চালু করুন
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Links Section */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">অন্যান্য</p>
          <div className="bg-card rounded-2xl border border-border overflow-hidden divide-y divide-border">
            <Link to="/app-contact" className="flex items-center justify-between p-4 active:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                  <Info size={18} className="text-indigo-500" />
                </div>
                <p className="font-semibold text-sm">যোগাযোগ</p>
              </div>
              <ChevronRight size={16} className="text-muted-foreground" />
            </Link>
            <Link to="/page/about" className="flex items-center justify-between p-4 active:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-teal-500/10 flex items-center justify-center">
                  <Shield size={18} className="text-teal-500" />
                </div>
                <p className="font-semibold text-sm">আমাদের সম্পর্কে</p>
              </div>
              <ChevronRight size={16} className="text-muted-foreground" />
            </Link>
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground text-center mt-8 opacity-60">
          ইত্তেহাদুল মাদারিসিল খুসুসিয়্যাহ © {toBengali(new Date().getFullYear())}
        </p>
      </div>
    </AppLayout>
  );
};

export default AppSettings;
