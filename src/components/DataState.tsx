import { ReactNode } from "react";
import { Loader2, AlertTriangle, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DataStateProps {
  isLoading?: boolean;
  error?: Error | null;
  isEmpty?: boolean;
  loadingMessage?: string;
  emptyIcon?: ReactNode;
  emptyTitle?: string;
  emptyMessage?: string;
  errorMessage?: string;
  onRetry?: () => void;
  children: ReactNode;
  compact?: boolean;
}

/**
 * Production-grade data state handler.
 * Handles loading, error, and empty states with Bangla copy.
 */
const DataState = ({
  isLoading,
  error,
  isEmpty,
  loadingMessage = "লোড হচ্ছে...",
  emptyIcon,
  emptyTitle = "কোনো তথ্য নেই",
  emptyMessage = "এই মুহূর্তে কোনো তথ্য পাওয়া যায়নি।",
  errorMessage,
  onRetry,
  children,
  compact = false,
}: DataStateProps) => {
  const padding = compact ? "py-8" : "py-16";

  if (isLoading) {
    return (
      <div className={`flex flex-col items-center justify-center ${padding} text-center`}>
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
        <p className="text-sm text-muted-foreground">{loadingMessage}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center ${padding} text-center`}>
        <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-3">
          <AlertTriangle className="h-6 w-6 text-destructive" />
        </div>
        <h3 className="text-sm font-semibold text-foreground mb-1">কিছু সমস্যা হয়েছে</h3>
        <p className="text-xs text-muted-foreground max-w-sm mb-3">
          {errorMessage || error.message || "দুঃখিত, তথ্য লোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।"}
        </p>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            আবার চেষ্টা করুন
          </Button>
        )}
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className={`flex flex-col items-center justify-center ${padding} text-center`}>
        {emptyIcon || (
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
            <Inbox className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
        <h3 className="text-sm font-semibold text-foreground mb-1">{emptyTitle}</h3>
        <p className="text-xs text-muted-foreground max-w-sm">{emptyMessage}</p>
      </div>
    );
  }

  return <>{children}</>;
};

export default DataState;
