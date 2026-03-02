import { useEffect, useState, useRef } from "react";
import { Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { useIsMobile } from "@/hooks/use-mobile";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import {
  LayoutDashboard, FileText, Bell, Image, Settings, Menu as MenuIcon,
  Video, Users, Mail, Tag, LogOut, ChevronLeft, Newspaper, Building2,
  GraduationCap, BookOpen, ClipboardList, BarChart3, Clock, Package, MessageCircle, MessageSquare, X, ChevronDown, User, Camera,
  ChevronRight, Eye, TrendingUp, ShoppingCart, Globe
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
import AdminPushNotifications from "./AdminPushNotifications";
import AdminIslamicContent from "./AdminIslamicContent";

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
      { label: "সংগঠন", icon: Users, path: "/admin/committee", section: "committee" },
    ],
  },
  {
    label: "যোগাযোগ",
    icon: Mail,
    items: [
      { label: "যোগাযোগ", icon: Mail, path: "/admin/contacts", section: "contacts" },
      { label: "ইমেইল", icon: Mail, path: "/admin/email", section: "email" },
      { label: "SMS", icon: MessageSquare, path: "/admin/sms", section: "sms" },
      { label: "পুশ নোটিফিকেশন", icon: Bell, path: "/admin/push-notifications", section: "notifications" },
    ],
  },
  {
    label: "সেটিংস",
    icon: Settings,
    items: [
      { label: "ইউজার", icon: Users, path: "/admin/customers", section: "users" },
      { label: "পোল", icon: ClipboardList, path: "/admin/polls", section: "polls" },
      { label: "নামাজের সময়", icon: Clock, path: "/admin/prayer-times", section: "prayer-times" },
      { label: "ইসলামী কন্টেন্ট", icon: BookOpen, path: "/admin/islamic-content", section: "islamic-contents" },
      { label: "মেনু", icon: MenuIcon, path: "/admin/menu", section: "menu" },
      { label: "সেটিংস", icon: Settings, path: "/admin/settings", section: "settings" },
    ],
  },
];

/* ─── Dashboard Home with Stats ─── */
const DashboardHome = () => {
  const { data: stats } = useQuery({
    queryKey: ["admin_dashboard_stats"],
    queryFn: async () => {
      const [posts, students, branches, orders, notices, contacts, pageViews] = await Promise.all([
        supabase.from("posts").select("id", { count: "exact", head: true }),
        supabase.from("students").select("id", { count: "exact", head: true }),
        supabase.from("branches").select("id", { count: "exact", head: true }),
        supabase.from("book_orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("notices").select("id", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("contact_submissions").select("id", { count: "exact", head: true }).eq("is_read", false),
        supabase.from("page_views").select("id", { count: "exact", head: true }),
      ]);
      return {
        posts: posts.count || 0,
        students: students.count || 0,
        branches: branches.count || 0,
        pendingOrders: orders.count || 0,
        activeNotices: notices.count || 0,
        unreadContacts: contacts.count || 0,
        totalViews: pageViews.count || 0,
      };
    },
  });

  const statCards = [
    { label: "মোট পোস্ট", value: stats?.posts ?? "...", icon: Newspaper, color: "from-primary/20 to-primary/5 text-primary", link: "/admin/posts" },
    { label: "মোট শিক্ষার্থী", value: stats?.students ?? "...", icon: GraduationCap, color: "from-blue-500/20 to-blue-500/5 text-blue-600", link: "/admin/students" },
    { label: "শাখা সমূহ", value: stats?.branches ?? "...", icon: Building2, color: "from-emerald-500/20 to-emerald-500/5 text-emerald-600", link: "/admin/branches" },
    { label: "পেন্ডিং অর্ডার", value: stats?.pendingOrders ?? "...", icon: ShoppingCart, color: "from-orange-500/20 to-orange-500/5 text-orange-600", link: "/admin/book-orders" },
    { label: "সক্রিয় নোটিশ", value: stats?.activeNotices ?? "...", icon: Bell, color: "from-violet-500/20 to-violet-500/5 text-violet-600", link: "/admin/notices" },
    { label: "অপঠিত বার্তা", value: stats?.unreadContacts ?? "...", icon: Mail, color: "from-rose-500/20 to-rose-500/5 text-rose-600", link: "/admin/contacts" },
    { label: "মোট পেজ ভিউ", value: stats?.totalViews ?? "...", icon: Eye, color: "from-cyan-500/20 to-cyan-500/5 text-cyan-600", link: "/admin/analytics" },
    { label: "সাইটে যান", value: "→", icon: Globe, color: "from-teal-500/20 to-teal-500/5 text-teal-600", link: "/" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary/70 p-6 md:p-8 text-primary-foreground">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-foreground/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-primary-foreground/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10">
          <h1 className="text-xl md:text-2xl font-bold mb-1">আসসালামু আলাইকুম! 👋</h1>
          <p className="text-primary-foreground/80 text-sm md:text-base">অ্যাডমিন প্যানেলে স্বাগতম। নিচে আপনার সাইটের সারসংক্ষেপ দেখুন।</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {statCards.map((card, i) => (
          <Link key={card.label} to={card.link}>
            <Card className={`group relative overflow-hidden border-0 bg-gradient-to-br ${card.color} hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 cursor-pointer`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium opacity-70 mb-1">{card.label}</p>
                    <p className="text-2xl md:text-3xl font-bold">{card.value}</p>
                  </div>
                  <card.icon size={24} className="opacity-40 group-hover:opacity-60 transition-opacity" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "নতুন পোস্ট", icon: Newspaper, path: "/admin/posts" },
          { label: "নোটিশ যোগ", icon: Bell, path: "/admin/notices" },
          { label: "ছবি আপলোড", icon: Image, path: "/admin/gallery" },
          { label: "সেটিংস", icon: Settings, path: "/admin/settings" },
        ].map((action) => (
          <Link key={action.label} to={action.path}>
            <Card className="border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 cursor-pointer group">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                  <action.icon size={18} />
                </div>
                <span className="text-sm font-medium">{action.label}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

/* ─── Main Dashboard Layout ─── */
const AdminDashboard = () => {
  const { user, isAdmin, hasAnyRole, loading, signOut } = useAuth();
  const { hasPermission } = usePermissions();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: profile } = useQuery({
    queryKey: ["user_profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from("profiles")
        .select("full_name, avatar_url, phone")
        .eq("user_id", user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;
    const ext = file.name.split(".").pop();
    const path = `avatars/${user.id}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("uploads").upload(path, file, { upsert: true });
    if (uploadError) return;
    const { data: urlData } = supabase.storage.from("uploads").getPublicUrl(path);
    const avatarUrl = urlData.publicUrl + "?t=" + Date.now();
    await supabase.from("profiles").update({ avatar_url: avatarUrl }).eq("user_id", user.id);
    queryClient.invalidateQueries({ queryKey: ["user_profile", user.id] });
  };

  useEffect(() => {
    if (isMobile === false) setSidebarOpen(true);
    if (isMobile === true) setSidebarOpen(false);
  }, [isMobile]);

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

  // Current page title for breadcrumb
  const currentPageTitle = (() => {
    const allItems = navCategories.flatMap(c => c.items);
    const found = allItems.find(i => i.path === location.pathname);
    return found?.label || "";
  })();

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
    <div className="min-h-screen bg-muted/30 flex">
      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ─── Enhanced Sidebar ─── */}
      <aside
        className={`
          ${isMobile ? "fixed inset-y-0 left-0 z-50" : "sticky top-0 h-screen"}
          ${sidebarOpen ? "w-64" : isMobile ? "w-0 overflow-hidden" : "w-[68px]"}
          bg-card border-r border-border/50 transition-all duration-300 shrink-0 flex flex-col shadow-sm
        `}
      >
        {/* Sidebar Header */}
        <div className="h-14 border-b border-border/50 flex items-center px-3 gap-2">
          {sidebarOpen && (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
                ই
              </div>
              <span className="font-bold text-primary text-sm truncate">অ্যাডমিন প্যানেল</span>
            </div>
          )}
          <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {isMobile && sidebarOpen ? <X size={16} /> : <ChevronLeft className={`transition-transform duration-300 ${!sidebarOpen ? "rotate-180" : ""}`} size={16} />}
          </Button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto scrollbar-thin">
          {filteredCategories.map((cat) => (
            <div key={cat.label} className="mb-1">
              {sidebarOpen ? (
                <button
                  onClick={() => toggleCategory(cat.label)}
                  className="flex items-center justify-between w-full px-3 py-2 text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-widest hover:text-foreground transition-colors rounded-md"
                >
                  <span className="flex items-center gap-2">
                    <cat.icon size={13} />
                    {cat.label}
                  </span>
                  <ChevronDown size={12} className={`transition-transform duration-200 ${openCategories[cat.label] ? "" : "-rotate-90"}`} />
                </button>
              ) : (
                <div className="border-b border-border/30 my-1.5 mx-2" />
              )}
              <div className={`space-y-0.5 ${sidebarOpen && openCategories[cat.label] === false ? "hidden" : ""}`}>
                {cat.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={handleNavClick}
                      title={!sidebarOpen ? item.label : undefined}
                      className={`group flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 relative
                        ${sidebarOpen ? "ml-1" : "justify-center"}
                        ${isActive
                          ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        }`}
                    >
                      <item.icon size={17} className={isActive ? "" : "group-hover:scale-110 transition-transform"} />
                      {sidebarOpen && <span className="truncate">{item.label}</span>}
                      {isActive && sidebarOpen && (
                        <ChevronRight size={14} className="ml-auto opacity-60" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-2 border-t border-border/50 space-y-0.5">
          <Link to="/" onClick={handleNavClick}>
            <Button variant="ghost" size="sm" className="w-full justify-start gap-2 h-9 text-muted-foreground hover:text-foreground">
              <Globe size={16} />
              {sidebarOpen && "সাইটে ফিরুন"}
            </Button>
          </Link>
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 h-9 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={signOut}>
            <LogOut size={16} />
            {sidebarOpen && "লগআউট"}
          </Button>
        </div>
      </aside>

      {/* ─── Main Area ─── */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Enhanced Top Bar */}
        <div className="sticky top-0 z-30 bg-card/80 backdrop-blur-lg border-b border-border/50 px-4 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {isMobile && (
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => setSidebarOpen(true)}>
                <MenuIcon size={18} />
              </Button>
            )}
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-sm min-w-0">
              <Link to="/admin" className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
                <LayoutDashboard size={15} />
              </Link>
              {currentPageTitle && location.pathname !== "/admin" && (
                <>
                  <ChevronRight size={13} className="text-muted-foreground/50 shrink-0" />
                  <span className="font-medium text-foreground truncate">{currentPageTitle}</span>
                </>
              )}
            </div>
          </div>

          {/* Profile dropdown */}
          <div className="relative shrink-0" ref={profileRef}>
            <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity rounded-full p-1 pr-2 hover:bg-accent">
              <Avatar className="h-8 w-8 ring-2 ring-primary/10">
                {profile?.avatar_url ? (
                  <AvatarImage src={profile.avatar_url} alt="Profile" />
                ) : null}
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                  {profile?.full_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || <User size={14} />}
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:block text-sm font-medium text-foreground max-w-[120px] truncate">
                {profile?.full_name || user?.email?.split("@")[0]}
              </span>
              <ChevronDown size={13} className="text-muted-foreground hidden md:block" />
            </button>
            {profileOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-card border border-border/50 rounded-xl shadow-xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center gap-3 mb-3 pb-3 border-b border-border/50">
                  <div className="relative group">
                    <Avatar className="h-14 w-14 ring-2 ring-primary/20">
                      {profile?.avatar_url ? (
                        <AvatarImage src={profile.avatar_url} alt="Profile" />
                      ) : null}
                      <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                        {profile?.full_name?.charAt(0) || <User size={20} />}
                      </AvatarFallback>
                    </Avatar>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Camera size={16} className="text-white" />
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-foreground truncate">{profile?.full_name || "নাম নেই"}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                      {isAdmin ? "অ্যাডমিন" : "সম্পাদক"}
                    </span>
                  </div>
                </div>
                <div className="space-y-0.5">
                  <Link to="/profile" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors text-foreground">
                    <User size={15} /> প্রোফাইল দেখুন
                  </Link>
                  <Link to="/admin/settings" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors text-foreground">
                    <Settings size={15} /> সেটিংস
                  </Link>
                  <button onClick={() => { setProfileOpen(false); signOut(); }} className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg hover:bg-destructive/10 transition-colors text-destructive w-full text-left">
                    <LogOut size={15} /> লগআউট
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 md:p-6">
          <Routes>
            <Route index element={<DashboardHome />} />
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
            <Route path="push-notifications" element={<AdminPushNotifications />} />
            <Route path="islamic-content" element={<AdminIslamicContent />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
