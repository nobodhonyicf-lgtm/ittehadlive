import { useEffect, useState } from "react";
import { Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard, FileText, Bell, Image, Settings, Menu as MenuIcon,
  Video, Users, Mail, Tag, LogOut, ChevronLeft, Newspaper
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

const navItems = [
  { label: "ড্যাশবোর্ড", icon: LayoutDashboard, path: "/admin" },
  { label: "পোস্ট", icon: Newspaper, path: "/admin/posts" },
  { label: "পেজ", icon: FileText, path: "/admin/pages" },
  { label: "নোটিশ", icon: Bell, path: "/admin/notices" },
  { label: "বিজ্ঞাপন", icon: Image, path: "/admin/ads" },
  { label: "ভিডিও", icon: Video, path: "/admin/videos" },
  { label: "নেতৃবৃন্দ", icon: Users, path: "/admin/leaders" },
  { label: "মেনু", icon: MenuIcon, path: "/admin/menu" },
  { label: "ক্যাটাগরি", icon: Tag, path: "/admin/categories" },
  { label: "যোগাযোগ", icon: Mail, path: "/admin/contacts" },
  { label: "সেটিংস", icon: Settings, path: "/admin/settings" },
];

const AdminDashboard = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate("/admin/login");
    }
  }, [user, isAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-60" : "w-16"} bg-card border-r border-border transition-all shrink-0 flex flex-col`}>
        <div className="p-4 border-b border-border flex items-center justify-between">
          {sidebarOpen && <span className="font-bold text-primary text-sm">অ্যাডমিন প্যানেল</span>}
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <ChevronLeft className={`transition-transform ${!sidebarOpen ? "rotate-180" : ""}`} size={18} />
          </Button>
        </div>
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors
                ${location.pathname === item.path
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
                }`}
            >
              <item.icon size={18} />
              {sidebarOpen && item.label}
            </Link>
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

      {/* Main content */}
      <main className="flex-1 p-6 overflow-y-auto">
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
          <Route path="pages" element={<AdminPages />} />
          <Route path="notices" element={<AdminNotices />} />
          <Route path="ads" element={<AdminAds />} />
          <Route path="videos" element={<AdminVideos />} />
          <Route path="leaders" element={<AdminLeaders />} />
          <Route path="menu" element={<AdminMenu />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="contacts" element={<AdminContacts />} />
          <Route path="settings" element={<AdminSettings />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminDashboard;
