import { useSiteSettings } from "@/hooks/useData";
import { RefreshCw } from "lucide-react";

const UpdateTicker = () => {
  const { data: settings } = useSiteSettings();
  const text = settings?.update_ticker;

  if (!text) return null;

  return (
    <div className="bg-primary/10 border border-primary/20 rounded my-3 mx-4 flex items-center overflow-hidden">
      <div className="bg-primary text-primary-foreground px-4 py-2 font-bold flex items-center gap-2 shrink-0">
        <RefreshCw size={16} />
        আপডেটঃ
      </div>
      <div className="overflow-hidden flex-1 py-2 px-4">
        <div className="animate-ticker whitespace-nowrap text-sm">
          {text}
        </div>
      </div>
    </div>
  );
};

export default UpdateTicker;
