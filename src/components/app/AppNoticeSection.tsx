import { useNotices } from "@/hooks/useData";
import { Link } from "react-router-dom";
import { Bell, ChevronRight } from "lucide-react";
import { toBengali } from "@/lib/bengali";

const AppNoticeSection = () => {
  const { data: notices } = useNotices();

  if (!notices?.length) return null;

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm transition-colors duration-300 animate-fade-in" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
      <div className="flex items-center justify-between px-4 py-2.5 bg-destructive/10 dark:bg-destructive/20">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-destructive" />
          <h2 className="text-sm font-bold text-foreground">সাম্প্রতিক নোটিশ</h2>
        </div>
        <Link to="/posts" className="text-xs text-primary font-medium flex items-center gap-0.5 hover:gap-1.5 transition-all duration-200">
          সব দেখুন <ChevronRight size={14} />
        </Link>
      </div>
      <div className="divide-y divide-border">
        {notices.slice(0, 4).map((notice, i) => (
          <Link
            key={notice.id}
            to={`/notice/${notice.id}`}
            className="flex items-start gap-3 px-4 py-3 hover:bg-muted/50 dark:hover:bg-muted/30 transition-all duration-200 active:scale-[0.98]"
          >
            <span className="w-6 h-6 rounded-full bg-primary/10 dark:bg-primary/20 text-primary text-xs flex items-center justify-center shrink-0 font-bold mt-0.5">
              {toBengali(i + 1)}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium line-clamp-2 text-foreground">{notice.title}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {new Date(notice.created_at).toLocaleDateString("bn-BD")}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AppNoticeSection;
