import { Link } from "react-router-dom";
import { useMenuItems, useSiteSettings } from "@/hooks/useData";
import { Menu, X, GraduationCap, Users, Building2 } from "lucide-react";
import { useState } from "react";
import islamicBorder from "@/assets/islamic-border.jpg";

const Header = () => {
  const { data: menuItems } = useMenuItems();
  const { data: settings } = useSiteSettings();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="w-full">
      {/* Top bar */}
      <div className="bg-primary text-primary-foreground py-2 px-4 text-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          {settings?.contact_phone && <span>☎ {settings.contact_phone}</span>}
          {settings?.contact_email && <span className="hidden md:inline">✉ {settings.contact_email}</span>}
        </div>
        <div className="flex items-center gap-3 text-xs">
          <Link to="/result" className="hover:text-accent transition-colors flex items-center gap-1"><GraduationCap size={14} /> রেজাল্ট</Link>
          <Link to="/students" className="hover:text-accent transition-colors flex items-center gap-1"><Users size={14} /> ডিরেক্টরি</Link>
          <Link to="/branches" className="hover:text-accent transition-colors flex items-center gap-1"><Building2 size={14} /> শাখা</Link>
        </div>
      </div>

      {/* Logo */}
      <div className="bg-card py-6 px-4 text-center border-b border-border relative">
        <Link to="/" className="inline-block">
          <h1 className="text-2xl md:text-4xl font-bold text-primary">
            {settings?.site_name || "ইত্তেহাদুল মাদারিসিল খুসুসিয়্যাহ"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {settings?.site_description || "প্রাইভেট মাদরাসাগুলোর একটি সমন্বিত সংগঠন"}
          </p>
        </Link>
      </div>

      {/* Islamic border decoration */}
      <div className="h-8 bg-cover bg-center" style={{ backgroundImage: `url(${islamicBorder})` }} />

      {/* Navigation */}
      <nav className="bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4">
          <div className="md:hidden flex items-center justify-between py-2">
            <span className="font-bold">মেনু</span>
            <button onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
          <ul className={`${mobileOpen ? "block" : "hidden"} md:flex md:items-center md:gap-0 pb-2 md:pb-0`}>
            {menuItems?.map((item) => (
              <li key={item.id}>
                <Link
                  to={item.url}
                  className="block px-4 py-2 hover:bg-primary-foreground/10 transition-colors text-sm md:text-base rounded"
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
