import { Link } from "react-router-dom";
import {
  GraduationCap,
  Users,
  Building2,
  BookOpen,
  Bell,
  Mail,
  HelpCircle,
  Compass,
  Calculator,
  MapPin,
  MessageCircleQuestion,
  Shield,
  LifeBuoy,
  FileText,
  LayoutDashboard,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const AppQuickActions = () => {
  const { user, hasAnyRole } = useAuth();

  const actions = [
    { icon: GraduationCap, label: "রেজাল্ট", path: "/result", color: "bg-primary" },
    { icon: Users, label: "কমিটি", path: "/page/committee", color: "bg-primary/80" },
    { icon: Building2, label: "শাখা", path: "/branches", color: "bg-accent" },
    { icon: BookOpen, label: "প্রকাশনা", path: "/books", color: "bg-primary/70" },
    { icon: Bell, label: "নোটিশ", path: "/posts", color: "bg-destructive" },
    { icon: GraduationCap, label: "শিক্ষক", path: "/teachers", color: "bg-primary/75" },
    { icon: HelpCircle, label: "কুইজ", path: "/quiz", color: "bg-primary" },
    { icon: Compass, label: "কিবলা", path: "/qibla", color: "bg-primary/85" },
    { icon: Calculator, label: "যাকাত", path: "/zakat", color: "bg-accent" },
    { icon: MapPin, label: "ম্যাপ", path: "/nearby-map", color: "bg-primary/80" },
    { icon: MessageCircleQuestion, label: "জিজ্ঞাসা", path: "/faq", color: "bg-primary/70" },
    { icon: Shield, label: "যাচাই", path: "/verify", color: "bg-primary/75" },
    { icon: FileText, label: "সনদ", path: "/certificate", color: "bg-accent" },
    { icon: LifeBuoy, label: "সহায়তা", path: "/support", color: "bg-primary/80" },
    { icon: Mail, label: "যোগাযোগ", path: "/app-contact", color: "bg-primary" },
    ...(user && hasAnyRole
      ? [{ icon: LayoutDashboard, label: "ড্যাশবোর্ড", path: "/admin", color: "bg-muted-foreground" }]
      : []),
  ];

  return (
    <div>
      <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
        <div className="w-1 h-4 rounded-full bg-primary" />
        দ্রুত অ্যাক্সেস
      </h2>
      <div className="grid grid-cols-5 gap-2">
        {actions.map((action) => (
          <Link
            key={action.path}
            to={action.path}
            className="flex flex-col items-center gap-1 group"
          >
            <div
              className={`${action.color} w-11 h-11 rounded-xl flex items-center justify-center text-primary-foreground shadow-sm transition-all duration-200 group-active:scale-90`}
            >
              <action.icon size={19} strokeWidth={2} />
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
