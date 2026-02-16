import { useEffect, useState } from "react";
import { Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard, FileText, Bell, Image, Settings, Menu as MenuIcon,
  Video, Users, Mail, Tag, LogOut, ChevronLeft, Newspaper, Building2,
  GraduationCap, BookOpen, ClipboardList, BarChart3, Clock, Package, MessageCircle, MessageSquare, X, ChevronDown
} from "lucide-react";
import AdminPosts from "./AdminPosts";
import AdminPages from "./AdminPages";
import AdminNotices from "./AdminNotices";
import AdminAds from "./AdminAds";
import AdminVideos from "./AdminVideos";
import AdminLeaders from "./AdminLeaders";
import AdminMenu from "./AdminMenu";
import AdminSettings from "./AdminSettings";
import AdminContacts from "./AdminContacts";
import AdminCategories from "./AdminCategories";
import AdminBranches from "./AdminBranches";
import AdminStudents from "./AdminStudents";
import AdminExams from "./AdminExams";
import AdminSubjects from "./AdminSubjects";
import AdminResults from "./AdminResults";
import AdminPolls from "./AdminPolls";
import AdminAnalytics from "./AdminAnalytics";
import AdminPrayerTimes from "./AdminPrayerTimes";
import AdminCommittee from "./AdminCommittee";
import AdminPhotoCard from "./AdminPhotoCard";
import AdminGallery from "./AdminGallery";
import AdminSliders from "./AdminSliders";
import AdminBooks from "./AdminBooks";
import AdminBookOrders from "./AdminBookOrders";
import AdminBookReviews from "./AdminBookReviews";
import AdminEmail from "./AdminEmail";
import AdminSMS from "./AdminSMS";
import AdminCustomers from "./AdminCustomers";

interface NavItem {
  label: string;
  icon: any;
  path: string;
  section: string;
}

interface NavCategory {
  label: string;
  icon: any;
  items: NavItem[];
}

const navCategories: NavCategory[] = [
  {
    label: "প্রধান",
    icon: LayoutDashboard,
    items: [
      { label: "ড্যাশবোর্ড", icon: LayoutDashboard, path: "/admin", section: "" },
      { label: "অ্যানালিটিক্স", icon: BarChart3, path: "/admin/analytics", section: "analytics" },
    ],
  },
  {
    label: "কন্টেন্ট",
    icon: Newspaper,
    items: [
      { label: "পোস্ট", icon: Newspaper, path: "/admin/posts", section: "posts" },
      { label: "পেজ", icon: FileText, path: "/admin/pages", section: "pages" },
      { label: "ফটো কার্ড", icon: Image, path: "/admin/photo-card", section: "photo-card" },
      { label: "ক্যাটাগরি", icon: Tag, path: "/admin/categories", section: "categories" },
      { label: "নোটিশ", icon: Bell, path: "/admin/notices", section: "notices" },
    ],
  },
  {
    label: "শিক্ষা",
    icon: GraduationCap,
    items: [
      { label: "শাখা", icon: Building2, path: "/admin/branches", section: "branches" },
      { label: "শিক্ষার্থী", icon: Users, path: "/admin/students", section: "students" },
      { label: "পরীক্ষা", icon: ClipboardList, path: "/admin/exams", section: "exams" },
      { label: "বিষয়", icon: BookOpen, path: "/admin/subjects", section: "subjects" },
      { label: "রেজাল্ট", icon: GraduationCap, path: "/admin/results", section: "results" },
    ],
  },
  {
    label: "বই ও অর্ডার",
    icon: BookOpen,
    items: [
      { label: "বই", icon: BookOpen, path: "/admin/books", section: "books" },
      { label: "অর্ডার", icon: Package, path: "/admin/book-orders", section: "book-orders" },
      { label: "বই রিভিউ", icon: MessageCircle, path: "/admin/book-reviews", section: "book-reviews" },
    ],
  },
  {
    label: "মিডিয়া ও প্রদর্শনী",
    icon: Image,
    items: [
      { label: "গ্যালারী", icon: Image, path: "/admin/gallery", section: "gallery" },
      { label: "স্লাইডার", icon: Image, path: "/admin/sliders", section: "sliders" },
      { label: "ভিডিও", icon: Video, path: "/admin/videos", section: "videos" },
      { label: "বিজ্ঞাপন", icon: Image, path: "/admin/ads", section: "ads" },
    ],
  },
  {
    label: "ব্যক্তিবর্গ",
    icon: Users,
    items: [
      { label: "নেতৃবৃন্দ", icon: Users, path: "/admin/leaders", section: "leaders" },
      { label: "কমিটি/উপদেষ্টা", icon: Users, path: "/admin/committee", section: "committee" },
    ],
  },
  {
    label: "যোগাযোগ",
    icon: Mail,
    items: [
      { label: "যোগাযোগ", icon: Mail, path: "/admin/contacts", section: "contacts" },
      { label: "ইমেইল", icon: Mail, path: "/admin/email", section: "email" },
      { label: "SMS", icon: MessageSquare, path: "/admin/sms", section: "sms" },
    ],
  },
  {
    label: "সেটিংস",
    icon: Settings,
    items: [
      { label: "ইউজার", icon: Users, path: "/admin/customers", section: "users" },
      { label: "পোল", icon: ClipboardList, path: "/admin/polls", section: "polls" },
      { label: "নামাজের সময়", icon: Clock, path: "/admin/prayer-times", section: "prayer-times" },
      { label: "মেনু", icon: MenuIcon, path: "/admin/menu", section: "menu" },
      { label: "সেটিংস", icon: Settings, path: "/admin/settings", section: "settings" },
    ],
  },
];

const AdminDashboard = () => {
  const { user, isAdmin, hasAnyRole, loading, signOut } = useAuth();
  const { hasPermission } = usePermissions();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (isMobile === false) setSidebarOpen(true);
    if (isMobile === true) setSidebarOpen(false);
  }, [isMobile]);

  // Auto-open category that contains current path
  useEffect(() => {
    const newOpen: Record<string, boolean> = {};
    navCategories.forEach((cat) => {
      if (cat.items.some((item) => item.path === location.pathname)) {
        newOpen[cat.label] = true;
      }
    });
    setOpenCategories((prev) => ({ ...prev, ...newOpen }));
  }, [location.pathname]);

  const toggleCategory = (label: string) => {
    setOpenCategories((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const filteredCategories = navCategories.map((cat) => ({
    ...cat,
    items: cat.items.filter((item) => !item.section || hasPermission(item.section, "view")),
  })).filter((cat) => cat.items.length > 0);

  useEffect(() => {
    if (!loading && (!user || (!isAdmin && !hasAnyRole))) {
      navigate("/admin/login");
    }
  }, [user, isAdmin, hasAnyRole, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user || (!isAdmin && !hasAnyRole)) return null;

  const handleNavClick = () => {
    if (isMobile) setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {isMobile && sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={`
          ${isMobile ? "fixed inset-y-0 left-0 z-50" : "relative"}
          ${sidebarOpen ? "w-60" : isMobile ? "w-0 overflow-hidden" : "w-16"}
          bg-card border-r border-border transition-all shrink-0 flex flex-col
        `}
      >
        <div className="p-4 border-b border-border flex items-center justify-between">
          {sidebarOpen && <span className="font-bold text-primary text-sm">অ্যাডমিন প্যানেল</span>}
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {isMobile && sidebarOpen ? <X size={18} /> : <ChevronLeft className={`transition-transform ${!sidebarOpen ? "rotate-180" : ""}`} size={18} />}
          </Button>
        </div>
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {filteredCategories.map((cat) => (
            <div key={cat.label}>
              {sidebarOpen ? (
                <button
                  onClick={() => toggleCategory(cat.label)}
                  className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <cat.icon size={14} />
                    {cat.label}
                  </span>
                  <ChevronDown size={14} className={`transition-transform ${openCategories[cat.label] ? "rotate-180" : ""}`} />
                </button>
              ) : (
                <div className="border-b border-border my-1" />
              )}
              {(sidebarOpen ? openCategories[cat.label] !== false : true) && cat.items.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={handleNavClick}
                  className={`flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors
                    ${sidebarOpen ? "ml-2" : ""}
                    ${location.pathname === item.path
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted"
                    }`}
                >
                  <item.icon size={18} />
                  {sidebarOpen && item.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>
        <div className="p-2 border-t border-border">
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2" onClick={signOut}>
            <LogOut size={16} />
            {sidebarOpen && "লগআউট"}
          </Button>
          <Link to="/">
            <Button variant="ghost" size="sm" className="w-full justify-start gap-2 mt-1">
              <ChevronLeft size={16} />
              {sidebarOpen && "সাইটে ফিরুন"}
            </Button>
          </Link>
        </div>
      </aside>

      <main className="flex-1 min-w-0 overflow-y-auto">
        {isMobile && (
          <div className="sticky top-0 z-30 bg-card border-b border-border px-4 py-3 flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
              <MenuIcon size={20} />
            </Button>
            <span className="font-bold text-primary text-sm">অ্যাডমিন প্যানেল</span>
          </div>
        )}
        <div className="p-4 md:p-6">
          <Routes>
            <Route
              index
              element={
                <div className="text-center py-12">
                  <LayoutDashboard className="mx-auto text-primary mb-4" size={48} />
                  <h1 className="text-2xl font-bold">স্বাগতম, অ্যাডমিন প্যানেলে!</h1>
                  <p className="text-muted-foreground mt-2">বাম পাশের মেনু থেকে পছন্দের অপশন বেছে নিন।</p>
                </div>
              }
            />
            <Route path="posts" element={<AdminPosts />} />
            <Route path="photo-card" element={<AdminPhotoCard />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="pages" element={<AdminPages />} />
            <Route path="notices" element={<AdminNotices />} />
            <Route path="branches" element={<AdminBranches />} />
            <Route path="students" element={<AdminStudents />} />
            <Route path="exams" element={<AdminExams />} />
            <Route path="subjects" element={<AdminSubjects />} />
            <Route path="results" element={<AdminResults />} />
            <Route path="polls" element={<AdminPolls />} />
            <Route path="prayer-times" element={<AdminPrayerTimes />} />
            <Route path="books" element={<AdminBooks />} />
            <Route path="book-orders" element={<AdminBookOrders />} />
            <Route path="book-reviews" element={<AdminBookReviews />} />
            <Route path="ads" element={<AdminAds />} />
            <Route path="videos" element={<AdminVideos />} />
            <Route path="leaders" element={<AdminLeaders />} />
            <Route path="committee" element={<AdminCommittee />} />
            <Route path="gallery" element={<AdminGallery />} />
            <Route path="sliders" element={<AdminSliders />} />
            <Route path="menu" element={<AdminMenu />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="contacts" element={<AdminContacts />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="email" element={<AdminEmail />} />
            <Route path="sms" element={<AdminSMS />} />
            <Route path="settings" element={<AdminSettings />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
