import { useLeaderProfiles, useNotices } from "@/hooks/useData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Bell } from "lucide-react";
import { Link } from "react-router-dom";

const Sidebar = () => {
  const { data: leaders } = useLeaderProfiles();
  const { data: notices } = useNotices();

  return (
    <div className="space-y-4">
      {/* Leader profiles */}
      {leaders?.map((leader) => (
        <Card key={leader.id} className="border-t-4 border-t-primary">
          <CardHeader className="pb-2">
            <CardTitle className="text-primary text-center text-base bg-primary/10 rounded py-2">
              {leader.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-3 flex items-center justify-center overflow-hidden">
              {leader.image_url ? (
                <img src={leader.image_url} alt={leader.name} className="w-full h-full object-cover" />
              ) : (
                <User className="text-muted-foreground" size={32} />
              )}
            </div>
            <h3 className="font-bold text-sm">{leader.name}</h3>
            {leader.bio && (
              <p className="text-xs text-muted-foreground mt-2 line-clamp-6 text-justify">
                {leader.bio}
              </p>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Notices */}
      <Card className="border-t-4 border-t-accent">
        <CardHeader className="pb-2">
          <CardTitle className="text-accent text-base bg-accent/10 rounded py-2 text-center flex items-center justify-center gap-2">
            <Bell size={16} />
            নোটিশ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {notices?.slice(0, 8).map((notice) => (
              <li key={notice.id} className="border-b border-border pb-2 last:border-0">
                <Link
                  to={`/notice/${notice.id}`}
                  className="text-sm hover:text-primary transition-colors flex items-start gap-2"
                >
                  <span className="bg-destructive text-destructive-foreground text-xs px-1.5 py-0.5 rounded shrink-0 mt-0.5">
                    ৪
                  </span>
                  <span className="line-clamp-2">{notice.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default Sidebar;
