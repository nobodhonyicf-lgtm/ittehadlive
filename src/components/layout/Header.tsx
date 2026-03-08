import { Link } from "react-router-dom";
import { useMenuItems, useSiteSettings } from "@/hooks/useData";
import { Menu, X, GraduationCap, Phone, BookOpen, LogIn, User, LayoutDashboard, Users, ChevronDown } from "lucide-react";
import LocationPicker from "@/components/LocationPicker";
import { useState, useEffect, useRef } from "react";
import { toBengali } from "@/lib/bengali";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const islamicDropdown = [
  { label: "কুরআন", path: "/quran" },
  { label: "হাদিস", path: "/hadith" },
  { label: "দোয়া", path: "/dua" },
  { label: "মাসআলা", path: "/masala" },
];

const toolsDropdown = [
  { label: "কুইজ", path: "/quiz" },
  { label: "কিবলা", path: "/qibla" },
  { label: "যাকাত", path: "/zakat" },
  { label: "ম্যাপ", path: "/nearby-map" },
];

const DropdownMenu = ({ label, items, onNavigate }: { label: string; items: { label: string; path: string }[]; onNavigate?: () => void }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLLIElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <li ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-3.5 py-2 hover:bg-primary-foreground/10 transition-colors text-sm font-medium rounded-md"
      >
        {label} <ChevronDown size={12} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <ul className="md:absolute md:top-full md:left-0 md:mt-1 md:bg-card/95 md:backdrop-blur-xl md:rounded-lg md:shadow-xl md:min-w-[140px] md:border md:border-border/50 md:z-50 md:py-1 md:text-foreground">
          {items.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className="block px-4 py-2 hover:bg-primary/10 transition-colors text-sm whitespace-nowrap rounded-md"
                onClick={() => { setOpen(false); onNavigate?.(); }}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
};

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
    <header className={`w-full sticky top-[36px] z-50 transition-all duration-300 ${scrolled ? "shadow-lg shadow-primary/5" : ""}`}>
      <div className="bg-card/90 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-[1200px] mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 min-w-0">
            {settings?.logo_url && (
              <img src={settings.logo_url} alt="Logo" className="h-10 md:h-12 object-contain shrink-0" />
            )}
            <div className="min-w-0">
              <h1 className="text-base md:text-lg font-bold text-primary leading-tight truncate">
                {settings?.site_name || "ইত্তেহাদুল মাদারিসিল খুসুসিয়্যাহ"}
              </h1>
              <p className="text-[10px] text-muted-foreground hidden sm:block truncate">
                {settings?.site_description || "প্রাইভেট মাদরাসাগুলোর একটি সমন্বিত সংগঠন"}
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
            {settings?.contact_phone && (
              <span className="hidden lg:flex items-center gap-1">
                <Phone size={11} /> {toBengali(settings.contact_phone)}
              </span>
            )}
            <LocationPicker />
            <Link to="/result" className="hidden md:flex items-center gap-1 hover:text-primary transition-colors">
              <GraduationCap size={13} /> রেজাল্ট
            </Link>
            <Link to="/books" className="hidden md:flex items-center gap-1 hover:text-primary transition-colors">
              <BookOpen size={13} /> প্রকাশনা
            </Link>
            <Link to="/teachers" className="hidden md:flex items-center gap-1 hover:text-primary transition-colors">
              <Users size={13} /> খেদমত প্রয়োজন
            </Link>
            {user && hasAnyRole && (
              <Link to="/admin" className="hidden md:flex items-center gap-1 hover:text-primary transition-colors">
                <LayoutDashboard size={13} /> ড্যাশবোর্ড
              </Link>
            )}
            {user ? (
              <Link to="/profile" className="flex items-center gap-1 hover:text-primary transition-colors">
                <Avatar className="h-6 w-6">
                  {profile?.avatar_url ? <AvatarImage src={profile.avatar_url} alt="Profile" /> : null}
                  <AvatarFallback className="bg-primary/10 text-primary text-[9px]">
                    {profile?.full_name?.charAt(0) || <User size={10} />}
                  </AvatarFallback>
                </Avatar>
              </Link>
            ) : (
              <Link to="/login" className="flex items-center gap-1 hover:text-primary transition-colors">
                <LogIn size={13} /> লগইন
              </Link>
            )}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-1.5 rounded-lg hover:bg-muted transition-colors" aria-label="Toggle menu">
              {mobileOpen ? <X size={20} className="text-foreground" /> : <Menu size={20} className="text-foreground" />}
            </button>
          </div>
        </div>
      </div>

      <nav className="bg-primary/95 backdrop-blur-xl text-primary-foreground">
        <div className="max-w-[1200px] mx-auto px-4">
          <ul className={`${mobileOpen ? "block py-2" : "hidden"} md:flex md:items-center md:justify-center`}>
            {menuItems?.map((item) => (
              <li key={item.id}>
                <Link
                  to={item.url}
                  className="block px-3.5 py-2 hover:bg-primary-foreground/10 transition-colors text-sm font-medium rounded-md"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <DropdownMenu label="ইসলামী" items={islamicDropdown} onNavigate={() => setMobileOpen(false)} />
            <DropdownMenu label="টুলস" items={toolsDropdown} onNavigate={() => setMobileOpen(false)} />
            {/* Mobile-only links */}
            <li className="md:hidden">
              <Link to="/result" className="block px-3.5 py-2 hover:bg-primary-foreground/10 transition-colors text-sm font-medium rounded-md" onClick={() => setMobileOpen(false)}>
                রেজাল্ট
              </Link>
            </li>
            <li className="md:hidden">
              <Link to="/books" className="block px-3.5 py-2 hover:bg-primary-foreground/10 transition-colors text-sm font-medium rounded-md" onClick={() => setMobileOpen(false)}>
                প্রকাশনা
              </Link>
            </li>
            <li className="md:hidden">
              <Link to="/teachers" className="block px-3.5 py-2 hover:bg-primary-foreground/10 transition-colors text-sm font-medium rounded-md" onClick={() => setMobileOpen(false)}>
                খেদমত প্রয়োজন
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default Header;
