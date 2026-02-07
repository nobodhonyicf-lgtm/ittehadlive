import { useNotices } from "@/hooks/useData";
import { Bell } from "lucide-react";
import { Link } from "react-router-dom";

const NoticeTicker = () => {
  const { data: notices } = useNotices();

  if (!notices?.length) return null;

  return (
    <div className="bg-accent text-accent-foreground flex items-center overflow-hidden">
      <div className="bg-destructive text-destructive-foreground px-4 py-2 font-bold flex items-center gap-2 shrink-0 z-10">
        <Bell size={16} />
        নোটিশ
      </div>
      <div className="overflow-hidden flex-1 py-2">
        <div className="animate-ticker whitespace-nowrap flex gap-8">
          {notices.map((notice) => (
            <Link
              key={notice.id}
              to={`/notice/${notice.id}`}
              className="hover:underline inline-block"
            >
              ● {notice.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NoticeTicker;
