import { useNotices } from "@/hooks/useData";
import { Bell, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const NoticeTicker = () => {
  const { data: notices } = useNotices();

  if (!notices?.length) return null;

  return (
    <div className="bg-card border-b border-border mt-8">
      <div className="max-w-[1200px] mx-auto flex items-center min-h-[42px] overflow-hidden">
        <div className="bg-primary text-primary-foreground px-4 self-stretch flex items-center gap-2 shrink-0 z-10 text-[13px] font-bold">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          নোটিশ
        </div>
        <div className="overflow-hidden flex-1 flex items-center px-3 min-h-[42px]">
          <div className="animate-ticker whitespace-nowrap flex items-center gap-10 text-[13px]">
            {notices.map((notice) => (
              <Link
                key={notice.id}
                to={`/notice/${notice.id}`}
                className="hover:text-primary transition-colors inline-flex items-center gap-1.5 text-foreground leading-none"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                {notice.title}
              </Link>
            ))}
          </div>
        </div>
        <Link to="/posts" className="hidden sm:flex items-center gap-0.5 text-[11px] text-primary font-medium px-3 self-stretch hover:bg-muted/50 transition-colors shrink-0">
          সব দেখুন <ChevronRight size={12} />
        </Link>
      </div>
    </div>
  );
};

export default NoticeTicker;
