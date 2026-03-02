import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface AdminPageWrapperProps {
  title: string;
  icon?: LucideIcon;
  children: ReactNode;
  action?: ReactNode;
}

const AdminPageWrapper = ({ title, icon: Icon, children, action }: AdminPageWrapperProps) => {
  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {Icon && (
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
              <Icon size={20} />
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-lg md:text-xl font-bold text-foreground truncate">{title}</h1>
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>

      {/* Content */}
      {children}
    </div>
  );
};

export default AdminPageWrapper;
