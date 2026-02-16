import { useSiteSettings } from "@/hooks/useData";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { Bell, LayoutDashboard, Moon, Sun, Search } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

const AppHeader = () => {
  const { data: settings } = useSiteSettings();
  const { user, hasAnyRole } = useAuth();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("app-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const dark = saved === "dark" || (!saved && prefersDark);
    setIsDark(dark);
    document.documentElement.classList.toggle("dark", dark);
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("app-theme", next ? "dark" : "light");
  };

  const { data: profile } = useQuery({
    queryKey: ["user_profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id,
  });

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
              <div className="h-10 w-10 rounded-xl bg-white/15 backdrop-blur-sm p-1 ring-2 ring-white/20 shadow-md">
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
          <button
            onClick={toggleTheme}
            className="p-2.5 hover:bg-white/10 rounded-xl transition-all duration-200 active:scale-90"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <Link
            to="/posts"
            className="p-2.5 hover:bg-white/10 rounded-xl transition-all duration-200 active:scale-90 relative"
          >
            <Bell size={18} />
          </Link>

          {user && hasAnyRole && (
            <Link
              to="/admin"
              className="p-2.5 hover:bg-white/10 rounded-xl transition-all duration-200 active:scale-90"
              aria-label="Admin Dashboard"
            >
              <LayoutDashboard size={18} />
            </Link>
          )}

          <Link to={user ? "/profile" : "/login"} className="ml-1">
            <Avatar className="h-8 w-8 ring-2 ring-white/25 shadow-sm transition-transform duration-200 hover:scale-110">
              {profile?.avatar_url ? (
                <AvatarImage src={profile.avatar_url} alt="Profile" />
              ) : null}
              <AvatarFallback className="bg-white/20 text-primary-foreground text-xs font-bold">
                {profile?.full_name?.charAt(0) || "?"}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
