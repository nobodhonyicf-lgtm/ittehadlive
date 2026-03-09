import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { LucideIcon, ShieldAlert } from "lucide-react";
import { useSectionPermissions } from "@/hooks/useSectionPermissions";

interface AdminPageWrapperProps {
  title: string;
  icon?: LucideIcon;
  children: ReactNode;
  action?: ReactNode;
  /** If set, checks view permission for this section. Falls back to auto-detect from URL. */
  permissionSection?: string;
}

const AdminPageWrapper = ({ title, icon: Icon, children, action, permissionSection }: AdminPageWrapperProps) => {
  const { canView } = useSectionPermissions();

  // If explicitly denied view permission, show access denied
  if (permissionSection !== undefined && !canView) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-300">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
          <ShieldAlert size={28} className="text-destructive" />
        </div>
        <h2 className="text-lg font-bold text-foreground mb-1">অ্যাক্সেস নেই</h2>
        <p className="text-sm text-muted-foreground max-w-xs">
          এই সেকশনে প্রবেশের অনুমতি আপনার নেই। প্রয়োজনে অ্যাডমিনের সাথে যোগাযোগ করুন।
        </p>
      </div>
    );
  }

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
