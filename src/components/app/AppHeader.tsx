import { useSiteSettings } from "@/hooks/useData";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { Bell, LayoutDashboard, Moon, Sun } from "lucide-react";
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

  return (
    <header className="sticky top-0 z-50 bg-primary text-primary-foreground transition-colors duration-300">
      <div className="flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-3">
          {appLogoUrl && (
            <Link to="/">
              <img
                src={appLogoUrl}
                alt="App Logo"
                className="h-8 w-8 rounded-lg object-contain bg-white/10 p-0.5 hover-scale"
              />
            </Link>
          )}
          <Link to="/" className="font-bold text-base truncate max-w-[180px]">
            {settings?.app_name || settings?.site_name || "ইত্তেহাদ"}
          </Link>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-white/10 rounded-full transition-all duration-200 active:scale-90"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <Link to="/posts" className="p-2 hover:bg-white/10 rounded-full transition-all duration-200 active:scale-90">
            <Bell size={20} />
          </Link>
          {user && hasAnyRole && (
            <Link to="/admin" className="p-2 hover:bg-white/10 rounded-full transition-all duration-200 active:scale-90">
              <LayoutDashboard size={18} />
            </Link>
          )}
          <Link to={user ? "/profile" : "/login"} className="p-1">
            <Avatar className="h-7 w-7 transition-transform duration-200 hover:scale-110">
              {profile?.avatar_url ? (
                <AvatarImage src={profile.avatar_url} alt="Profile" />
              ) : null}
              <AvatarFallback className="bg-white/20 text-primary-foreground text-xs">
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
