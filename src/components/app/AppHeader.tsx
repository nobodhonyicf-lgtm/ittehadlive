import { useSiteSettings } from "@/hooks/useData";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { Bell, LayoutDashboard, GraduationCap, Radio } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { toBengali } from "@/lib/bengali";

const NotificationBell = () => {
  const { data: notifications } = useQuery({
    queryKey: ["public_notifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("id, sent_at")
        .eq("is_sent", true)
        .order("sent_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
    refetchInterval: 30000,
  });

  const [lastSeen, setLastSeen] = useState<string | null>(null);

  useEffect(() => {
    setLastSeen(localStorage.getItem("notifications_last_seen"));
  }, []);

  const unreadCount = notifications?.filter(
    (n) => n.sent_at && (!lastSeen || new Date(n.sent_at) > new Date(lastSeen))
  ).length || 0;

  const handleClick = () => {
    localStorage.setItem("notifications_last_seen", new Date().toISOString());
    setLastSeen(new Date().toISOString());
  };

  return (
    <Link
      to="/notifications"
      onClick={handleClick}
      className="p-2.5 hover:bg-white/10 rounded-xl transition-all duration-200 active:scale-90 relative"
    >
      <Bell size={18} />
      {unreadCount > 0 && (
        <span className="absolute top-1 right-1 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-bold px-1 leading-none animate-pulse">
          {toBengali(unreadCount > 99 ? "99+" : unreadCount)}
        </span>
      )}
    </Link>
  );
};

const LiveButton = () => {
  const { data: latestPost } = useQuery({
    queryKey: ["latest_post_live"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("id, slug, title")
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    refetchInterval: 60000,
  });

  if (!latestPost) return null;

  return (
    <Link
      to={`/post/${latestPost.slug}`}
      className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold px-2 py-1 rounded-full transition-all active:scale-90"
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
      </span>
      LIVE
    </Link>
  );
};

const AppHeader = () => {
  const { data: settings } = useSiteSettings();
  const { user, hasAnyRole } = useAuth();

  const appLogoUrl = settings?.app_logo_url || settings?.logo_url;
  const appName = settings?.app_name || settings?.site_name || "ইত্তেহাদ";

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg">
      {/* Main header row */}
      <div className="flex items-center justify-between px-4 h-16">
        {/* Logo & Name */}
        <Link to="/" className="flex items-center gap-3 min-w-0">
          {appLogoUrl && (
            <div className="relative">
              <div className="h-10 w-10 rounded-xl bg-white p-1 ring-2 ring-white/20 shadow-md">
                <img
                  src={appLogoUrl}
                  alt="App Logo"
                  className="h-full w-full rounded-lg object-contain"
                />
              </div>
            </div>
          )}
          <div className="min-w-0">
            <h1 className="font-bold text-[13px] leading-tight truncate max-w-[180px]">
              {appName}
            </h1>
            <p className="text-[9px] opacity-70 truncate max-w-[180px] leading-tight">
              {settings?.site_description?.slice(0, 50) || "সমন্বিত শিক্ষা প্ল্যাটফর্ম"}
            </p>
          </div>
        </Link>

        {/* Action buttons */}
        <div className="flex items-center gap-0.5">
          <LiveButton />
          <Link
            to="/result"
            className="p-2.5 hover:bg-white/10 rounded-xl transition-all duration-200 active:scale-90"
            aria-label="রেজাল্ট"
          >
            <GraduationCap size={18} />
          </Link>
          <NotificationBell />

          {user && hasAnyRole && (
            <Link
              to="/admin"
              className="p-2.5 hover:bg-white/10 rounded-xl transition-all duration-200 active:scale-90"
              aria-label="Admin Dashboard"
            >
              <LayoutDashboard size={18} />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
