import {
  Bell, BellOff, Loader2, Moon, Sun, Settings, Type, Minus, Plus, MapPin, ChevronRight,
  Info, Shield, User, LogOut, Trash2, RefreshCw, HardDrive, Share2, Star, MessageCircle,
  Smartphone, BookOpen, GraduationCap, Bookmark, Globe, Heart, FileText, ShoppingBag,
  BookMarked, Languages, Palette, Navigation, LayoutDashboard, Newspaper, Image, Video,
  Mail, Tag, Building2, ClipboardList, Package, MessageSquare, Clock, Users, BarChart3,
  Camera, Menu as MenuIcon,
} from "lucide-react";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import AppLayout from "@/components/app/AppLayout";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { toBengali } from "@/lib/bengali";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useSelectedDistrict } from "@/hooks/useLocationStore";
import { BD_DISTRICTS, District } from "@/lib/bdDistricts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const findNearestDistrict = (lat: number, lng: number): District => {
  let nearest = BD_DISTRICTS[0];
  let minDist = Infinity;
  for (const d of BD_DISTRICTS) {
    const dist = Math.sqrt((d.lat - lat) ** 2 + (d.lng - lng) ** 2);
    if (dist < minDist) { minDist = dist; nearest = d; }
  }
  return nearest;
};

const FONT_SIZES = [
  { label: "ছোট", value: 14 },
  { label: "স্বাভাবিক", value: 16 },
  { label: "বড়", value: 18 },
  { label: "অনেক বড়", value: 20 },
];

// Admin navigation sections
const adminSections = [
  { label: "ড্যাশবোর্ড", icon: LayoutDashboard, path: "/admin", color: "bg-slate-500" },
  { label: "অ্যানালিটিক্স", icon: BarChart3, path: "/admin/analytics", color: "bg-blue-500" },
  { label: "পোস্ট", icon: Newspaper, path: "/admin/posts", color: "bg-emerald-500" },
  { label: "পেজ", icon: FileText, path: "/admin/pages", color: "bg-teal-500" },
  { label: "নোটিশ", icon: Bell, path: "/admin/notices", color: "bg-red-500" },
  { label: "শাখা", icon: Building2, path: "/admin/branches", color: "bg-orange-500" },
  { label: "শিক্ষার্থী", icon: Users, path: "/admin/students", color: "bg-indigo-500" },
  { label: "পরীক্ষা", icon: ClipboardList, path: "/admin/exams", color: "bg-purple-500" },
  { label: "রেজাল্ট", icon: GraduationCap, path: "/admin/results", color: "bg-pink-500" },
  { label: "বই", icon: BookOpen, path: "/admin/books", color: "bg-amber-600" },
  { label: "অর্ডার", icon: Package, path: "/admin/book-orders", color: "bg-cyan-600" },
  { label: "শিক্ষক", icon: GraduationCap, path: "/admin/teachers", color: "bg-rose-500" },
  { label: "প্রতিষ্ঠান", icon: Building2, path: "/admin/institutions", color: "bg-violet-500" },
  { label: "গ্যালারী", icon: Image, path: "/admin/gallery", color: "bg-lime-600" },
  { label: "স্লাইডার", icon: Image, path: "/admin/sliders", color: "bg-sky-500" },
  { label: "ভিডিও", icon: Video, path: "/admin/videos", color: "bg-fuchsia-500" },
  { label: "বিজ্ঞাপন", icon: Image, path: "/admin/ads", color: "bg-yellow-600" },
  { label: "নেতৃবৃন্দ", icon: Users, path: "/admin/leaders", color: "bg-emerald-600" },
  { label: "সংগঠন", icon: Users, path: "/admin/committee", color: "bg-blue-600" },
  { label: "যোগাযোগ", icon: Mail, path: "/admin/contacts", color: "bg-orange-600" },
  { label: "পুশ নোটি.", icon: Bell, path: "/admin/push-notifications", color: "bg-red-600" },
  { label: "ইউজার", icon: Users, path: "/admin/customers", color: "bg-gray-500" },
  { label: "পোল", icon: ClipboardList, path: "/admin/polls", color: "bg-teal-600" },
  { label: "সেটিংস", icon: Settings, path: "/admin/settings", color: "bg-slate-600" },
];

const SettingsRow = ({ icon: Icon, iconBg, label, sub, onClick, to, right }: {
  icon: any; iconBg: string; label: string; sub?: string; onClick?: () => void; to?: string; right?: React.ReactNode;
}) => {
  const content = (
    <div className="flex items-center justify-between p-4 active:bg-muted/50 transition-colors">
      <div className="flex items-center gap-3">
        <div className={`h-9 w-9 rounded-xl ${iconBg} flex items-center justify-center`}>
          <Icon size={18} className="text-white" />
        </div>
        <div>
          <p className="font-semibold text-sm">{label}</p>
          {sub && <p className="text-[11px] text-muted-foreground">{sub}</p>}
        </div>
      </div>
      {right || <ChevronRight size={16} className="text-muted-foreground" />}
    </div>
  );
  if (to) return <Link to={to}>{content}</Link>;
  if (onClick) return <button onClick={onClick} className="w-full text-left">{content}</button>;
  return content;
};

const AppSettings = () => {
  const { isSupported, isSubscribed, isLoading, subscribe, unsubscribe } = usePushNotifications();
  const { user, isAdmin, hasAnyRole, signOut } = useAuth();
  const { hasPermission } = usePermissions();

  const { data: profile } = useQuery({
    queryKey: ["user_profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("full_name, avatar_url, phone").eq("user_id", user!.id).maybeSingle();
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: vapidKey } = useQuery({
    queryKey: ["vapid_public_key"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("value").eq("key", "vapid_public_key").maybeSingle();
      if (error) throw error;
      return data?.value || null;
    },
  });

  // Admin stats
  const { data: adminStats } = useQuery({
    queryKey: ["admin_quick_stats"],
    queryFn: async () => {
      const [orders, contacts] = await Promise.all([
        supabase.from("book_orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("contact_submissions").select("id", { count: "exact", head: true }).eq("is_read", false),
      ]);
      return { pendingOrders: orders.count || 0, unreadContacts: contacts.count || 0 };
    },
    enabled: !!user && hasAnyRole,
  });

  const [isDark, setIsDark] = useState(false);
  const [fontSizeIndex, setFontSizeIndex] = useState(1);
  const [cacheSize, setCacheSize] = useState<string | null>(null);
  const [detecting, setDetecting] = useState(false);
  const [district, setDistrict] = useSelectedDistrict();

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
    const saved = localStorage.getItem("app-font-size");
    if (saved) {
      const idx = FONT_SIZES.findIndex((f) => f.value === parseInt(saved));
      if (idx >= 0) setFontSizeIndex(idx);
    }
    if ("storage" in navigator && "estimate" in navigator.storage) {
      navigator.storage.estimate().then((est) => {
        const usedMB = ((est.usage || 0) / (1024 * 1024)).toFixed(1);
        setCacheSize(`${usedMB} MB`);
      });
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

  const handleAutoDetect = () => {
    if (!navigator.geolocation) {
      toast.error("আপনার ব্রাউজার লোকেশন সাপোর্ট করে না");
      return;
    }
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const nearest = findNearestDistrict(pos.coords.latitude, pos.coords.longitude);
        setDistrict(nearest);
        setDetecting(false);
        toast.success(`লোকেশন সনাক্ত: ${nearest.name}`);
      },
      () => {
        setDetecting(false);
        toast.error("লোকেশন অনুমতি দিন অথবা ম্যানুয়ালি সিলেক্ট করুন");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleNotifToggle = async (checked: boolean) => {
    if (checked) {
      if (!vapidKey) { toast.error("পুশ নোটিফিকেশন সেটআপ করা হয়নি"); return; }
      const ok = await subscribe(vapidKey);
      if (ok) toast.success("নোটিফিকেশন চালু করা হয়েছে!");
      else toast.error(Notification.permission === "denied" ? "ব্রাউজার থেকে নোটিফিকেশন ব্লক করা আছে।" : "নোটিফিকেশন চালু করা যায়নি।");
    } else {
      await unsubscribe();
      toast.success("নোটিফিকেশন বন্ধ করা হয়েছে");
    }
  };

  const handleClearCache = async () => {
    try {
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
      localStorage.clear();
      sessionStorage.clear();
      toast.success("ক্যাশ পরিষ্কার হয়েছে! পেজ রিলোড হচ্ছে...");
      setTimeout(() => window.location.reload(), 1000);
    } catch { toast.error("ক্যাশ পরিষ্কার করা যায়নি"); }
  };

  const handleShareApp = () => {
    const url = `${window.location.origin}/install`;
    if (typeof navigator.share === "function") {
      navigator.share({ title: "ইত্তেহাদ অ্যাপ", text: "ইত্তেহাদুল মাদারিসিল খুসুসিয়্যাহ অ্যাপ ইনস্টল করুন", url });
    } else { navigator.clipboard.writeText(url); toast.success("লিংক কপি হয়েছে!"); }
  };

  const handleRefresh = () => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((regs) => regs.forEach((r) => r.update()));
    }
    toast.success("আপডেট চেক করা হচ্ছে...");
    setTimeout(() => window.location.reload(), 500);
  };

  const visibleAdminSections = adminSections.filter(s => {
    const section = s.path.replace("/admin/", "").replace("/admin", "");
    return hasPermission(section || "", "view");
  });

  return (
    <AppLayout>
      <div className="px-4 py-6 max-w-lg mx-auto space-y-5 animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-primary flex items-center justify-center shadow-md">
            <Settings size={20} className="text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">সেটিংস</h1>
            <p className="text-xs text-muted-foreground">অ্যাপ কাস্টমাইজ করুন</p>
          </div>
        </div>

        {/* ══════ Account Section ══════ */}
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">একাউন্ট</p>
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            {user ? (
              <>
                <Link to="/profile" className="flex items-center gap-3 p-4 active:bg-muted/50 transition-colors">
                  <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                    {profile?.avatar_url ? <AvatarImage src={profile.avatar_url} /> : null}
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                      {profile?.full_name?.charAt(0) || <User size={20} />}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm truncate">{profile?.full_name || "প্রোফাইল"}</p>
                      {hasAnyRole && (
                        <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
                          {isAdmin ? "অ্যাডমিন" : "মডারেটর"}
                        </Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                    {profile?.phone && <p className="text-[10px] text-muted-foreground/70">{profile.phone}</p>}
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground shrink-0" />
                </Link>

                {/* Logged-in user quick actions */}
                <div className="border-t border-border grid grid-cols-3 divide-x divide-border">
                  <Link to="/profile" className="flex flex-col items-center gap-1 py-3 active:bg-muted/50 transition-colors">
                    <User size={16} className="text-primary" />
                    <span className="text-[10px] text-muted-foreground">প্রোফাইল</span>
                  </Link>
                  <Link to="/cart" className="flex flex-col items-center gap-1 py-3 active:bg-muted/50 transition-colors">
                    <ShoppingBag size={16} className="text-orange-500" />
                    <span className="text-[10px] text-muted-foreground">অর্ডার</span>
                  </Link>
                  <Link to="/notifications" className="flex flex-col items-center gap-1 py-3 active:bg-muted/50 transition-colors">
                    <Bell size={16} className="text-red-500" />
                    <span className="text-[10px] text-muted-foreground">নোটিফিকেশন</span>
                  </Link>
                </div>
              </>
            ) : (
              <div>
                <Link to="/login" className="flex items-center gap-3 p-4 active:bg-muted/50 transition-colors">
                  <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center">
                    <User size={20} className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">লগইন করুন</p>
                    <p className="text-[11px] text-muted-foreground">একাউন্টে প্রবেশ করুন</p>
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground" />
                </Link>
                <div className="border-t border-border">
                  <Link to="/register" className="flex items-center gap-3 p-4 active:bg-muted/50 transition-colors">
                    <div className="h-9 w-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                      <Users size={16} className="text-emerald-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">নতুন একাউন্ট তৈরি করুন</p>
                      <p className="text-[11px] text-muted-foreground">ফ্রি রেজিস্ট্রেশন</p>
                    </div>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ══════ Admin Dashboard Section (only for admins) ══════ */}
        {user && hasAnyRole && (
          <div>
            <div className="flex items-center justify-between mb-2 px-1">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">অ্যাডমিন প্যানেল</p>
              {adminStats && (adminStats.pendingOrders > 0 || adminStats.unreadContacts > 0) && (
                <div className="flex gap-2">
                  {adminStats.pendingOrders > 0 && (
                    <Badge variant="destructive" className="text-[9px] px-1.5">{toBengali(adminStats.pendingOrders)} অর্ডার</Badge>
                  )}
                  {adminStats.unreadContacts > 0 && (
                    <Badge variant="secondary" className="text-[9px] px-1.5">{toBengali(adminStats.unreadContacts)} মেসেজ</Badge>
                  )}
                </div>
              )}
            </div>
            <div className="bg-card rounded-2xl border border-border p-3">
              <div className="grid grid-cols-4 gap-2">
                {visibleAdminSections.map((s) => (
                  <Link
                    key={s.path}
                    to={s.path}
                    className="flex flex-col items-center gap-1.5 py-2 px-1 rounded-xl active:bg-muted/50 transition-all group"
                  >
                    <div className={`${s.color} w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm group-active:scale-90 transition-transform`}>
                      <s.icon size={18} strokeWidth={2} />
                    </div>
                    <span className="text-[9px] text-muted-foreground font-medium text-center leading-tight line-clamp-1">{s.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════ Location Section ══════ */}
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">লোকেশন</p>
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-9 w-9 rounded-xl bg-blue-500 flex items-center justify-center">
                  <MapPin size={18} className="text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">বর্তমান লোকেশন</p>
                  <p className="text-[11px] text-muted-foreground">{district.name} • নামাজ ও ইফতারের সময়ের জন্য</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs gap-1.5 mb-2"
                onClick={handleAutoDetect}
                disabled={detecting}
              >
                {detecting ? <Loader2 size={13} className="animate-spin" /> : <Navigation size={13} />}
                {detecting ? "সনাক্ত করা হচ্ছে..." : "📍 অটো লোকেশন সনাক্ত করুন"}
              </Button>
              <div className="grid grid-cols-4 gap-1.5 max-h-[140px] overflow-y-auto">
                {BD_DISTRICTS.map((d) => (
                  <button
                    key={d.name}
                    onClick={() => { setDistrict(d); toast.success(`লোকেশন: ${d.name}`); }}
                    className={`text-[10px] px-1.5 py-1.5 rounded-lg text-center transition-all ${
                      district.name === d.name
                        ? "bg-primary text-primary-foreground font-bold shadow-sm"
                        : "bg-muted/50 hover:bg-muted text-foreground"
                    }`}
                  >
                    {d.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ══════ General Section ══════ */}
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">সাধারণ</p>
          <div className="bg-card rounded-2xl border border-border overflow-hidden divide-y divide-border">
            {/* Theme */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${isDark ? 'bg-purple-500' : 'bg-amber-500'}`}>
                  {isDark ? <Moon size={18} className="text-white" /> : <Sun size={18} className="text-white" />}
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
                <div className="h-9 w-9 rounded-xl bg-emerald-500 flex items-center justify-center">
                  <Type size={18} className="text-white" />
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

        {/* ══════ Notifications Section ══════ */}
        {isSupported && (
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">নোটিফিকেশন</p>
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${isSubscribed ? 'bg-red-500' : 'bg-muted'}`}>
                      {isSubscribed ? (
                        <Bell size={18} className="text-white" />
                      ) : (
                        <BellOff size={18} className="text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">পুশ নোটিফিকেশন</p>
                      <p className="text-[11px] text-muted-foreground">{isSubscribed ? "সক্রিয়" : "নিষ্ক্রিয়"}</p>
                    </div>
                  </div>
                  {isLoading ? (
                    <Loader2 size={18} className="animate-spin text-muted-foreground" />
                  ) : (
                    <Switch checked={isSubscribed} onCheckedChange={handleNotifToggle} />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════ Storage & Maintenance ══════ */}
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">স্টোরেজ ও রক্ষণাবেক্ষণ</p>
          <div className="bg-card rounded-2xl border border-border overflow-hidden divide-y divide-border">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-amber-500 flex items-center justify-center">
                  <HardDrive size={18} className="text-white" />
                </div>
                <div>
                  <p className="font-semibold text-sm">ক্যাশ ডেটা</p>
                  <p className="text-[11px] text-muted-foreground">{cacheSize || "হিসাব হচ্ছে..."}</p>
                </div>
              </div>
            </div>
            <SettingsRow icon={Trash2} iconBg="bg-red-500" label="ক্যাশ পরিষ্কার করুন" sub="অফলাইন ডেটা মুছে ফেলুন" onClick={handleClearCache} />
            <SettingsRow icon={RefreshCw} iconBg="bg-green-500" label="আপডেট চেক করুন" sub="সর্বশেষ ভার্সন ডাউনলোড করুন" onClick={handleRefresh} />
          </div>
        </div>

        {/* ══════ Quick Links (enhanced for logged-in) ══════ */}
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">দ্রুত লিংক</p>
          <div className="bg-card rounded-2xl border border-border overflow-hidden divide-y divide-border">
            <SettingsRow icon={GraduationCap} iconBg="bg-orange-500" label="শিক্ষক ডিরেক্টরি" sub="যোগ্য শিক্ষক খুঁজুন" to="/teachers" />
            <SettingsRow icon={ShoppingBag} iconBg="bg-cyan-500" label="বইয়ের দোকান" sub="ইসলামী বই কিনুন" to="/books" />
            <SettingsRow icon={BookMarked} iconBg="bg-emerald-600" label="হাদিস শরীফ" sub="হাদিস পড়ুন ও শিখুন" to="/hadith" />
            <SettingsRow icon={FileText} iconBg="bg-violet-500" label="পরীক্ষার ফলাফল" sub="ফলাফল দেখুন" to="/result" />
            {user && (
              <>
                <SettingsRow icon={BookOpen} iconBg="bg-teal-500" label="কুরআন শরীফ" sub="কুরআন পাঠ করুন" to="/quran" />
                <SettingsRow icon={Heart} iconBg="bg-pink-500" label="দোয়া সমূহ" sub="প্রয়োজনীয় দোয়া পড়ুন" to="/dua" />
                <SettingsRow icon={Globe} iconBg="bg-sky-500" label="কিবলা কম্পাস" sub="কিবলার দিক নির্ণয় করুন" to="/qibla" />
              </>
            )}
          </div>
        </div>

        {/* ══════ Others Section ══════ */}
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">অন্যান্য</p>
          <div className="bg-card rounded-2xl border border-border overflow-hidden divide-y divide-border">
            <SettingsRow icon={Share2} iconBg="bg-pink-500" label="অ্যাপ শেয়ার করুন" sub="বন্ধুদের ইনস্টল লিংক পাঠান" onClick={handleShareApp} />
            <SettingsRow icon={Star} iconBg="bg-yellow-500" label="অ্যাপ রেটিং দিন" sub="আমাদের ৫ স্টার দিন" onClick={() => toast.success("ধন্যবাদ! আপনার রেটিং গ্রহণ করা হয়েছে")} />
            <SettingsRow icon={MessageCircle} iconBg="bg-indigo-500" label="যোগাযোগ ও মতামত" to="/app-contact" />
            <SettingsRow icon={Info} iconBg="bg-teal-500" label="আমাদের সম্পর্কে" to="/page/about" />
            <SettingsRow icon={Shield} iconBg="bg-gray-500" label="গোপনীয়তা নীতি" to="/privacy" />
            <SettingsRow icon={FileText} iconBg="bg-slate-500" label="শর্তাবলী" to="/terms" />
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-slate-500 flex items-center justify-center">
                  <Smartphone size={18} className="text-white" />
                </div>
                <div>
                  <p className="font-semibold text-sm">অ্যাপ ভার্সন</p>
                  <p className="text-[11px] text-muted-foreground">v2.1.0</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Logout button for logged-in users */}
        {user && (
          <div>
            <button
              onClick={() => signOut()}
              className="w-full bg-destructive/10 text-destructive font-semibold text-sm py-3.5 rounded-2xl flex items-center justify-center gap-2 active:bg-destructive/20 transition-colors"
            >
              <LogOut size={16} />
              লগআউট
            </button>
          </div>
        )}

        <p className="text-[11px] text-muted-foreground text-center mt-6 opacity-60">
          ইত্তেহাদুল মাদারিসিল খুসুসিয়্যাহ © {toBengali(new Date().getFullYear())}
        </p>
      </div>
    </AppLayout>
  );
};

export default AppSettings;
