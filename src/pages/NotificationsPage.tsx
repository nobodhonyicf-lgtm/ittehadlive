import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import { Bell, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { useIsApp } from "@/hooks/useIsApp";
import AppLayout from "@/components/app/AppLayout";
import { toBengali } from "@/lib/bengali";

const NotificationsPage = () => {
  const isApp = useIsApp();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["public_notifications"],
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

  const timeAgo = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return "এইমাত্র";
    if (diff < 3600) return `${toBengali(Math.floor(diff / 60))} মিনিট আগে`;
    if (diff < 86400) return `${toBengali(Math.floor(diff / 3600))} ঘণ্টা আগে`;
    return `${toBengali(Math.floor(diff / 86400))} দিন আগে`;
  };

  const content = (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold flex items-center gap-2 mb-4">
        <Bell size={22} className="text-primary" />
        নোটিফিকেশন
      </h1>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">লোড হচ্ছে...</div>
      ) : !notifications?.length ? (
        <div className="text-center py-12 text-muted-foreground">
          <Bell size={48} className="mx-auto mb-3 opacity-30" />
          <p>কোনো নোটিফিকেশন নেই</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div key={n.id} className="p-4 bg-card rounded-lg border border-border shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground leading-snug">{n.title}</h3>
                  {n.body && <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{n.body}</p>}
                  {n.link && (
                    <Link
                      to={n.link}
                      className="inline-flex items-center gap-1 text-xs text-primary mt-2 hover:underline"
                    >
                      <ExternalLink size={12} />
                      বিস্তারিত দেখুন
                    </Link>
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                  {n.sent_at ? timeAgo(n.sent_at) : ""}
                </span>
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
