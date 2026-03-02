import { Home, BookOpen, Bell, Settings, BookMarked } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { icon: Home, label: "হোম", path: "/" },
  { icon: BookOpen, label: "কুরআন", path: "/quran" },
  { icon: Bell, label: "নোটিশ", path: "/notifications" },
  { icon: BookMarked, label: "হাদিস", path: "/hadith" },
  { icon: Settings, label: "সেটিংস", path: "/app-settings" },
];

const AppBottomNav = () => {
  const location = useLocation();

  if (location.pathname.startsWith("/admin")) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/98 backdrop-blur-xl border-t border-border/40 shadow-[0_-2px_16px_rgba(0,0,0,0.05)] transition-colors duration-300">
      <div className="flex items-center justify-around h-[60px] max-w-lg mx-auto px-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path !== "/" && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-all duration-200 active:scale-90 ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              {isActive && (
                <span className="absolute top-0 w-8 h-0.5 bg-primary rounded-full" />
              )}
              <div className={`transition-all duration-200 ${isActive ? '-translate-y-0.5' : ''}`}>
                <item.icon size={isActive ? 22 : 20} strokeWidth={isActive ? 2.5 : 1.8} />
              </div>
              <span className={`text-[10px] transition-all duration-200 ${isActive ? "font-bold" : "font-medium"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default AppBottomNav;
