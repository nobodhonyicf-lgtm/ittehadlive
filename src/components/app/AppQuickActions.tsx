import { Link } from "react-router-dom";
import {
  GraduationCap,
  Users,
  Building2,
  BookOpen,
  Bell,
  Mail,
  FileText,
  Image,
  LayoutDashboard,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const AppQuickActions = () => {
  const { user, hasAnyRole } = useAuth();

  const actions = [
    { icon: GraduationCap, label: "রেজাল্ট", path: "/result", gradient: "from-blue-500 to-blue-600" },
    { icon: Users, label: "কমিটি", path: "/page/committee", gradient: "from-emerald-500 to-emerald-600" },
    { icon: Users, label: "উপদেষ্টামন্ডলী", path: "/page/advisors", gradient: "from-cyan-500 to-cyan-600" },
    { icon: Building2, label: "শাখা", path: "/branches", gradient: "from-orange-500 to-orange-600" },
    { icon: BookOpen, label: "প্রকাশনা", path: "/books", gradient: "from-purple-500 to-purple-600" },
    { icon: Bell, label: "নোটিশ", path: "/posts", gradient: "from-red-500 to-red-600" },
    { icon: FileText, label: "পরিচিতি", path: "/page/about", gradient: "from-teal-500 to-teal-600" },
    { icon: GraduationCap, label: "শিক্ষক", path: "/teachers", gradient: "from-pink-500 to-pink-600" },
    { icon: Mail, label: "যোগাযোগ", path: "/app-contact", gradient: "from-indigo-500 to-indigo-600" },
    ...(user && hasAnyRole
      ? [{ icon: LayoutDashboard, label: "ড্যাশবোর্ড", path: "/admin", gradient: "from-slate-600 to-slate-700" }]
      : []),
  ];

  return (
    <div>
      <h2 className="text-sm font-bold text-foreground mb-3">দ্রুত অ্যাক্সেস</h2>
      <div className="grid grid-cols-4 gap-3">
        {actions.map((action, i) => (
          <Link
            key={action.path}
            to={action.path}
            className="flex flex-col items-center gap-1.5 group animate-fade-in"
            style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'both' }}
          >
            <div
              className={`bg-gradient-to-br ${action.gradient} w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-sm transition-all duration-200 group-hover:scale-110 group-active:scale-95 group-hover:shadow-md`}
            >
              <action.icon size={22} />
            </div>
            <span className="text-[11px] text-muted-foreground font-medium text-center leading-tight">
              {action.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AppQuickActions;
