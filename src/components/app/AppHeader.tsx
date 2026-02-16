import { useSiteSettings } from "@/hooks/useData";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { Bell, Settings, LayoutDashboard } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const AppHeader = () => {
  const { data: settings } = useSiteSettings();
  const { user, hasAnyRole } = useAuth();

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
    <header className="sticky top-0 z-50 bg-primary text-primary-foreground">
      <div className="flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-3">
          {appLogoUrl && (
            <Link to="/">
              <img
                src={appLogoUrl}
                alt="App Logo"
                className="h-8 w-8 rounded-lg object-contain bg-white/10 p-0.5"
              />
            </Link>
          )}
          <Link to="/" className="font-bold text-base truncate max-w-[180px]">
            {settings?.app_name || settings?.site_name || "ইত্তেহাদ"}
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/posts" className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <Bell size={20} />
          </Link>
          {user && hasAnyRole && (
            <Link to="/admin" className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <LayoutDashboard size={18} />
            </Link>
          )}
          <Link to={user ? "/profile" : "/login"} className="p-1">
            <Avatar className="h-7 w-7">
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
