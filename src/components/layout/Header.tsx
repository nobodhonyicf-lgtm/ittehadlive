import { Link } from "react-router-dom";
import { useMenuItems, useSiteSettings } from "@/hooks/useData";
import { Menu, X, GraduationCap, Users, Building2, Phone, Mail, BookOpen, LogIn, User, LayoutDashboard } from "lucide-react";
import { useState, useEffect } from "react";
import { toBengali } from "@/lib/bengali";
import { useAuth } from "@/hooks/useAuth";

const Header = () => {
  const { data: menuItems } = useMenuItems();
  const { data: settings } = useSiteSettings();
  const { user, hasAnyRole } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`w-full sticky top-0 z-50 transition-shadow ${scrolled ? "shadow-lg" : "shadow-sm"}`}>
      {/* Top utility bar */}
      <div className="bg-primary text-primary-foreground">
        <div className="px-4 py-1.5 text-sm flex items-center justify-between">
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
                <User size={13} /> প্রোফাইল
              </Link>
            ) : (
              <Link to="/login" className="hover:text-accent transition-colors flex items-center gap-1">
                <LogIn size={13} /> লগইন
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Logo section - boxy design */}
      <div className="bg-card border-b-2 border-primary/20">
        <div className="px-4 py-5 flex items-center justify-center gap-4">
          {settings?.logo_url && (
            <Link to="/">
              <img src={settings.logo_url} alt="Logo" className="h-14 md:h-16 object-contain" />
            </Link>
          )}
          <Link to="/" className="text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-primary tracking-tight">
              {settings?.site_name || "ইত্তেহাদুল মাদারিসিল খুসুসিয়্যাহ"}
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              {settings?.site_description || "প্রাইভেট মাদরাসাগুলোর একটি সমন্বিত সংগঠন"}
            </p>
          </Link>
        </div>
      </div>

      {/* Navigation - boxy */}
      <nav className="bg-primary text-primary-foreground border-b-4 border-primary/80">
        <div className="px-4">
          <div className="md:hidden flex items-center justify-between py-2">
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
                  className="block px-4 py-2.5 hover:bg-primary-foreground/10 transition-colors text-sm font-medium border-r border-primary-foreground/10 last:border-r-0"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default Header;
