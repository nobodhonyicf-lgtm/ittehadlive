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
    { icon: GraduationCap, label: "রেজাল্ট", path: "/result", color: "bg-blue-500 dark:bg-blue-600" },
    { icon: Users, label: "কমিটি", path: "/page/committee", color: "bg-emerald-500 dark:bg-emerald-600" },
    { icon: Users, label: "উপদেষ্টামন্ডলী", path: "/page/advisors", color: "bg-cyan-500 dark:bg-cyan-600" },
    { icon: Building2, label: "শাখা", path: "/branches", color: "bg-orange-500 dark:bg-orange-600" },
    { icon: BookOpen, label: "প্রকাশনা", path: "/books", color: "bg-purple-500 dark:bg-purple-600" },
    { icon: Bell, label: "নোটিশ", path: "/posts", color: "bg-red-500 dark:bg-red-600" },
    { icon: FileText, label: "পরিচিতি", path: "/page/about", color: "bg-teal-500 dark:bg-teal-600" },
    { icon: Mail, label: "যোগাযোগ", path: "/contact", color: "bg-indigo-500 dark:bg-indigo-600" },
    ...(user && hasAnyRole
      ? [{ icon: LayoutDashboard, label: "ড্যাশবোর্ড", path: "/admin", color: "bg-slate-700 dark:bg-slate-600" }]
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
              className={`${action.color} w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-sm transition-all duration-200 group-hover:scale-110 group-active:scale-95 group-hover:shadow-md`}
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
