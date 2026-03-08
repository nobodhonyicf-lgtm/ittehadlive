import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import { Bell, ExternalLink, Clock, Megaphone, BookOpen, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useIsApp } from "@/hooks/useIsApp";
import AppLayout from "@/components/app/AppLayout";
import { toBengali } from "@/lib/bengali";
import { useEffect } from "react";

const NotificationsPage = () => {
  const isApp = useIsApp();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["public_notifications_full"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("is_sent", true)
        .order("sent_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  // Mark as seen when page opens
  useEffect(() => {
    localStorage.setItem("notifications_last_seen", new Date().toISOString());
  }, []);

  const timeAgo = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return "এইমাত্র";
    if (diff < 3600) return `${toBengali(Math.floor(diff / 60))} মিনিট আগে`;
    if (diff < 86400) return `${toBengali(Math.floor(diff / 3600))} ঘণ্টা আগে`;
    return `${toBengali(Math.floor(diff / 86400))} দিন আগে`;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "news": return <Megaphone size={16} className="text-primary" />;
      case "islamic": return <BookOpen size={16} className="text-emerald-600" />;
      case "alert": return <AlertCircle size={16} className="text-red-500" />;
      default: return <Bell size={16} className="text-primary" />;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("bn-BD", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Group notifications by date
  const groupedNotifications = notifications?.reduce((acc, n) => {
    const dateKey = n.sent_at ? new Date(n.sent_at).toDateString() : "unknown";
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(n);
    return acc;
  }, {} as Record<string, typeof notifications>) || {};

  const content = (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Bell size={20} className="text-primary" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-foreground">নোটিফিকেশন</h1>
          <p className="text-xs text-muted-foreground">
            সর্বশেষ {toBengali(notifications?.length || 0)}টি নোটিফিকেশন
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 bg-card rounded-xl border border-border animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2" />
              <div className="h-3 bg-muted rounded w-full mb-1" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : !notifications?.length ? (
        <div className="text-center py-16">
          <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
            <Bell size={32} className="text-muted-foreground/40" />
          </div>
          <p className="text-muted-foreground font-medium">কোনো নোটিফিকেশন নেই</p>
          <p className="text-xs text-muted-foreground/60 mt-1">নতুন আপডেট পেলে এখানে দেখাবে</p>
        </div>
      ) : (
        <div className="space-y-5">
          {Object.entries(groupedNotifications).map(([dateKey, items]) => (
            <div key={dateKey}>
              {/* Date separator */}
              <div className="flex items-center gap-2 mb-3">
                <Clock size={12} className="text-muted-foreground" />
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                  {items?.[0]?.sent_at ? formatDate(items[0].sent_at) : ""}
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <div className="space-y-2.5">
                {items?.map((n) => (
                  <div
                    key={n.id}
                    className="group p-4 bg-card rounded-xl border border-border shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-200"
                  >
                    <div className="flex items-start gap-3">
                      {/* Category icon */}
                      <div className="mt-0.5 h-8 w-8 rounded-lg bg-primary/5 flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                        {getCategoryIcon(n.category)}
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Title & time */}
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-foreground text-sm leading-snug">
                            {n.title}
                          </h3>
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap mt-0.5">
                            {n.sent_at ? timeAgo(n.sent_at) : ""}
                          </span>
                        </div>

                        {/* Body */}
                        {n.body && (
                          <p className="text-[13px] text-muted-foreground mt-1.5 leading-relaxed">
                            {n.body}
                          </p>
                        )}

                        {/* Image preview */}
                        {n.image_url && (
                          <div className="mt-2.5 rounded-lg overflow-hidden border border-border">
                            <img
                              src={n.image_url}
                              alt=""
                              className="w-full h-32 object-cover"
                              loading="lazy"
                            />
                          </div>
                        )}

                        {/* Link */}
                        {n.link && (
                          <Link
                            to={n.link}
                            className="inline-flex items-center gap-1.5 text-xs text-primary mt-2.5 font-medium hover:underline transition-colors"
                          >
                            <ExternalLink size={12} />
                            বিস্তারিত দেখুন
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return isApp ? <AppLayout>{content}</AppLayout> : <Layout>{content}</Layout>;
};

export default NotificationsPage;
