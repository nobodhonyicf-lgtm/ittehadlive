import { useNotices } from "@/hooks/useData";
import { Link } from "react-router-dom";
import { Bell, ChevronRight } from "lucide-react";
import { toBengali } from "@/lib/bengali";

const AppNoticeSection = () => {
  const { data: notices } = useNotices();

  if (!notices?.length) return null;

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm transition-colors duration-300 animate-fade-in" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-destructive/10 to-destructive/5 dark:from-destructive/20 dark:to-destructive/10 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-destructive/15 dark:bg-destructive/25 flex items-center justify-center">
            <Bell size={14} className="text-destructive" />
          </div>
          <h2 className="text-sm font-bold text-foreground">সাম্প্রতিক নোটিশ</h2>
        </div>
        <Link to="/posts" className="text-xs text-primary font-medium flex items-center gap-0.5 hover:gap-1.5 transition-all duration-200 bg-primary/10 dark:bg-primary/20 px-2.5 py-1 rounded-full">
          সব দেখুন <ChevronRight size={14} />
        </Link>
      </div>
      <div className="divide-y divide-border">
        {notices.slice(0, 4).map((notice, i) => (
          <Link
            key={notice.id}
            to={`/notice/${notice.id}`}
            className="flex items-start gap-3 px-4 py-3.5 hover:bg-muted/50 dark:hover:bg-muted/30 transition-all duration-200 active:scale-[0.98] group"
          >
            <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-destructive/15 to-destructive/5 dark:from-destructive/25 dark:to-destructive/10 text-destructive text-xs flex items-center justify-center shrink-0 font-bold mt-0.5 group-hover:scale-110 transition-transform duration-200">
              {toBengali(i + 1)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium line-clamp-2 text-foreground group-hover:text-primary transition-colors duration-200">{notice.title}</p>
              <p className="text-[10px] text-muted-foreground mt-1">
                {new Date(notice.created_at).toLocaleDateString("bn-BD")}
              </p>
            </div>
            <ChevronRight size={14} className="text-muted-foreground shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AppNoticeSection;
