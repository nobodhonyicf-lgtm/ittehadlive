import { Link } from "react-router-dom";
import {
  GraduationCap,
  Users,
  Building2,
  BookOpen,
  Bell,
  Mail,
  FileText,
  LayoutDashboard,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const AppQuickActions = () => {
  const { user, hasAnyRole } = useAuth();

  const actions = [
    { icon: GraduationCap, label: "রেজাল্ট", path: "/result", bg: "bg-blue-500" },
    { icon: Users, label: "কমিটি", path: "/page/committee", bg: "bg-primary" },
    { icon: Users, label: "উপদেষ্টা", path: "/page/advisors", bg: "bg-cyan-600" },
    { icon: Building2, label: "শাখা", path: "/branches", bg: "bg-orange-500" },
    { icon: BookOpen, label: "প্রকাশনা", path: "/books", bg: "bg-purple-600" },
    { icon: Bell, label: "নোটিশ", path: "/posts", bg: "bg-destructive" },
    { icon: FileText, label: "পরিচিতি", path: "/page/about", bg: "bg-teal-600" },
    { icon: GraduationCap, label: "শিক্ষক", path: "/teachers", bg: "bg-pink-600" },
    { icon: Mail, label: "যোগাযোগ", path: "/app-contact", bg: "bg-indigo-600" },
    ...(user && hasAnyRole
      ? [{ icon: LayoutDashboard, label: "ড্যাশবোর্ড", path: "/admin", bg: "bg-slate-600" }]
      : []),
  ];

  return (
    <div>
      <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
        <div className="w-1 h-4 rounded-full bg-primary" />
        দ্রুত অ্যাক্সেস
      </h2>
      <div className="grid grid-cols-5 gap-2">
        {actions.map((action, i) => (
          <Link
            key={action.path}
            to={action.path}
            className="flex flex-col items-center gap-1 group"
          >
            <div
              className={`${action.bg} w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-sm transition-all duration-200 group-active:scale-90`}
            >
              <action.icon size={20} strokeWidth={2} />
            </div>
            <span className="text-[10px] text-muted-foreground font-medium text-center leading-tight line-clamp-1">
              {action.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AppQuickActions;
