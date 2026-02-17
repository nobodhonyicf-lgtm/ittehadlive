import { Home, GraduationCap, Bell, BookOpen, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { icon: Home, label: "হোম", path: "/" },
  { icon: GraduationCap, label: "রেজাল্ট", path: "/result" },
  { icon: Bell, label: "নোটিফিকেশন", path: "/notifications" },
  { icon: BookOpen, label: "বই", path: "/books" },
  { icon: User, label: "প্রোফাইল", path: "/profile" },
];

const AppBottomNav = () => {
  const location = useLocation();

  if (location.pathname.startsWith("/admin")) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card dark:bg-card border-t border-border shadow-[0_-2px_10px_rgba(0,0,0,0.08)] dark:shadow-[0_-2px_10px_rgba(0,0,0,0.3)] transition-colors duration-300">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== "/" && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center gap-0.5 w-full h-full transition-all duration-200 active:scale-90 ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className={`transition-transform duration-200 ${isActive ? 'scale-110 -translate-y-0.5' : ''}`}>
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
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
