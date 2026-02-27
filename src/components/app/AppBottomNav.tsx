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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 dark:bg-card/95 backdrop-blur-xl border-t border-border/50 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.3)] transition-colors duration-300">
      <div className="flex items-center justify-around h-[58px] max-w-lg mx-auto px-2">
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
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className={`relative transition-transform duration-200 ${isActive ? 'scale-110 -translate-y-0.5' : ''}`}>
                {isActive && (
                  <span className="absolute -inset-2 bg-primary/10 rounded-xl animate-scale-in" />
                )}
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 1.8} className="relative z-10" />
              </div>
              <span className={`text-[10px] transition-all duration-200 ${isActive ? "font-bold" : "font-medium"}`}>
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-1 w-5 h-0.5 bg-primary rounded-full animate-scale-in" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default AppBottomNav;
