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
  Search,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const AppQuickActions = () => {
  const { user, hasAnyRole } = useAuth();

  const primaryActions = [
    { icon: GraduationCap, label: "রেজাল্ট", path: "/result", accent: true },
    { icon: Search, label: "শিক্ষার্থী", path: "/students", accent: false },
    { icon: Building2, label: "শাখা", path: "/branches", accent: false },
    { icon: Bell, label: "নোটিশ", path: "/posts", accent: false },
    { icon: BookOpen, label: "প্রকাশনা", path: "/books", accent: false },
  ];

  const secondaryActions = [
    { icon: GraduationCap, label: "শিক্ষক", path: "/teachers" },
    { icon: Users, label: "কমিটি", path: "/page/committee" },
    { icon: HelpCircle, label: "কুইজ", path: "/quiz" },
    { icon: Compass, label: "কিবলা", path: "/qibla" },
    { icon: Calculator, label: "যাকাত", path: "/zakat" },
    { icon: MapPin, label: "ম্যাপ", path: "/nearby-map" },
    { icon: Shield, label: "যাচাই", path: "/verify" },
    { icon: FileText, label: "সনদ", path: "/certificate" },
    { icon: MessageCircleQuestion, label: "জিজ্ঞাসা", path: "/faq" },
    { icon: LifeBuoy, label: "সহায়তা", path: "/support" },
    { icon: Mail, label: "যোগাযোগ", path: "/app-contact" },
    ...(user && hasAnyRole
      ? [{ icon: LayoutDashboard, label: "ড্যাশবোর্ড", path: "/admin" }]
      : []),
  ];

  return (
    <div className="space-y-3">
      {/* Primary row - bigger, emphasized */}
      <div className="grid grid-cols-5 gap-2">
        {primaryActions.map((action) => (
          <Link
            key={action.path}
            to={action.path}
            className="flex flex-col items-center gap-1.5 group"
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-all duration-200 group-active:scale-90 ${
              action.accent 
                ? "bg-primary text-primary-foreground" 
                : "bg-card border border-border text-primary"
            }`}>
              <action.icon size={20} strokeWidth={2} />
            </div>
            <span className="text-[10px] text-foreground font-medium text-center leading-tight line-clamp-1">
              {action.label}
            </span>
          </Link>
        ))}
      </div>

      {/* Secondary grid - compact */}
      <div className="grid grid-cols-6 gap-1.5">
        {secondaryActions.map((action) => (
          <Link
            key={action.path}
            to={action.path}
            className="flex flex-col items-center gap-1 group py-1"
          >
            <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-muted-foreground group-hover:text-primary transition-all duration-200 group-active:scale-90">
              <action.icon size={16} strokeWidth={1.8} />
            </div>
            <span className="text-[9px] text-muted-foreground font-medium text-center leading-tight line-clamp-1">
              {action.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AppQuickActions;
