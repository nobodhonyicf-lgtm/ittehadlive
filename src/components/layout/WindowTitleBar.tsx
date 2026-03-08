import { Minus, Square, X, Globe } from "lucide-react";
import { useSiteSettings } from "@/hooks/useData";

const WindowTitleBar = () => {
  const { data: settings } = useSiteSettings();

  return (
    <div className="w-full h-9 bg-card/80 backdrop-blur-xl border-b border-border/50 flex items-center justify-between px-3 select-none shrink-0 z-[60]">
      {/* Left: App icon + title */}
      <div className="flex items-center gap-2 min-w-0">
        <Globe size={14} className="text-primary shrink-0" />
        <span className="text-[11px] text-muted-foreground truncate">
          {settings?.site_name || "ইত্তেহাদুল মাদারিসিল খুসুসিয়্যাহ"} — ittehad.bd
        </span>
      </div>

      {/* Right: Window controls */}
      <div className="flex items-center shrink-0">
        <button className="w-11 h-9 flex items-center justify-center hover:bg-muted/80 transition-colors" aria-label="Minimize">
          <Minus size={14} className="text-foreground/70" />
        </button>
        <button className="w-11 h-9 flex items-center justify-center hover:bg-muted/80 transition-colors" aria-label="Maximize">
          <Square size={10} className="text-foreground/70" />
        </button>
        <button className="w-11 h-9 flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors rounded-tr-lg" aria-label="Close">
          <X size={14} />
        </button>
      </div>
    </div>
  );
};

export default WindowTitleBar;
