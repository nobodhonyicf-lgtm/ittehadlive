import { Link } from "react-router-dom";
import { useMenuItems, useSiteSettings } from "@/hooks/useData";
import { Menu, X, GraduationCap, Users, Building2, Phone, Mail, BookOpen, LogIn, User, LayoutDashboard, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import { toBengali } from "@/lib/bengali";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const Header = () => {
  const { data: menuItems } = useMenuItems();
  const { data: settings } = useSiteSettings();
  const { user, hasAnyRole } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["user_profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("full_name, avatar_url").eq("user_id", user!.id).maybeSingle();
      return data;
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`w-full sticky top-0 z-50 transition-all duration-300 ${scrolled ? "shadow-xl" : "shadow-sm"}`}>
      {/* Top utility bar */}
      <div className="bg-primary text-primary-foreground">
        <div className="max-w-[1200px] mx-auto px-4 py-1.5 text-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            {settings?.contact_phone && (
              <span className="flex items-center gap-1 text-xs opacity-90">
                <Phone size={12} /> {toBengali(settings.contact_phone)}
              </span>
            )}
            {settings?.contact_email && (
              <span className="hidden md:flex items-center gap-1 text-xs opacity-90">
                <Mail size={12} /> {settings.contact_email}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs">
            <Link to="/branches" className="hover:text-accent transition-colors flex items-center gap-1">
              <MapPin size={13} /> শাখাসমূহ
            </Link>
            <Link to="/result" className="hover:text-accent transition-colors flex items-center gap-1">
              <GraduationCap size={13} /> রেজাল্ট
            </Link>
            <Link to="/books" className="hover:text-accent transition-colors flex items-center gap-1">
              <BookOpen size={13} /> প্রকাশনা
            </Link>
            {user && hasAnyRole && (
              <Link to="/admin" className="hover:text-accent transition-colors flex items-center gap-1">
                <LayoutDashboard size={13} /> ড্যাশবোর্ড
              </Link>
            )}
            {user ? (
              <Link to="/profile" className="hover:text-accent transition-colors flex items-center gap-1">
                <Avatar className="h-5 w-5">
                  {profile?.avatar_url ? <AvatarImage src={profile.avatar_url} alt="Profile" /> : null}
                  <AvatarFallback className="bg-primary-foreground/20 text-primary-foreground text-[9px]">
                    {profile?.full_name?.charAt(0) || <User size={10} />}
                  </AvatarFallback>
                </Avatar>
                প্রোফাইল
              </Link>
            ) : (
              <Link to="/login" className="hover:text-accent transition-colors flex items-center gap-1">
                <LogIn size={13} /> লগইন
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Logo section */}
      <div className="bg-card border-b border-border">
        <div className="max-w-[1200px] mx-auto px-4 py-4 flex items-center justify-center gap-4">
          {settings?.logo_url && (
            <Link to="/">
              <img src={settings.logo_url} alt="Logo" className="h-14 md:h-16 object-contain drop-shadow-sm" />
            </Link>
          )}
          <Link to="/" className="text-center">
            <h1 className="text-xl md:text-2xl font-bold text-primary tracking-tight leading-tight">
              {settings?.site_name || "ইত্তেহাদুল মাদারিসিল খুসুসিয়্যাহ"}
            </h1>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {settings?.site_description || "প্রাইভেট মাদরাসাগুলোর একটি সমন্বিত সংগঠন"}
            </p>
          </Link>
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-primary text-primary-foreground">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="md:hidden flex items-center justify-between py-2.5">
            <span className="font-semibold text-sm">মেনু</span>
            <button onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
          <ul className={`${mobileOpen ? "block" : "hidden"} md:flex md:items-center md:justify-center pb-2 md:pb-0`}>
            {menuItems?.map((item) => (
              <li key={item.id}>
                <Link
                  to={item.url}
                  className="block px-4 py-2.5 hover:bg-primary-foreground/10 transition-colors text-sm font-medium rounded-md"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            {/* Islamic sections */}
            <li>
              <Link to="/quran" className="block px-4 py-2.5 hover:bg-primary-foreground/10 transition-colors text-sm font-medium rounded-md" onClick={() => setMobileOpen(false)}>
                কুরআন
              </Link>
            </li>
            <li>
              <Link to="/hadith" className="block px-4 py-2.5 hover:bg-primary-foreground/10 transition-colors text-sm font-medium rounded-md" onClick={() => setMobileOpen(false)}>
                হাদিস
              </Link>
            </li>
            <li>
              <Link to="/dua" className="block px-4 py-2.5 hover:bg-primary-foreground/10 transition-colors text-sm font-medium rounded-md" onClick={() => setMobileOpen(false)}>
                দোয়া
              </Link>
            </li>
            <li>
              <Link to="/masala" className="block px-4 py-2.5 hover:bg-primary-foreground/10 transition-colors text-sm font-medium rounded-md" onClick={() => setMobileOpen(false)}>
                মাসআলা
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default Header;
