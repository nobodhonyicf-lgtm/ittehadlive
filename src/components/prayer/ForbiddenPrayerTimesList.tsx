import { Clock3, Sun, Sunrise, Sunset } from "lucide-react";
import { ForbiddenPrayerTimeItem } from "@/lib/forbiddenPrayerTimes";

const iconMap = {
  sunrise: Sunrise,
  "sunrise-window": Sun,
  "zawal-window": Clock3,
  sunset: Sunset,
  "sunset-window": Sun,
} as const;

interface ForbiddenPrayerTimesListProps {
  items: ForbiddenPrayerTimeItem[];
  title?: string;
  compact?: boolean;
}

const ForbiddenPrayerTimesList = ({
  items,
  title = "আজকের নিষিদ্ধ সময়",
  compact = false,
}: ForbiddenPrayerTimesListProps) => {
  if (!items.length) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-bold">{title}</h3>
        <span className="text-[10px] text-muted-foreground">লোকেশনভিত্তিক আজকের সময়</span>
      </div>

      <div className="space-y-2">
        {items.map((item) => {
          const Icon = iconMap[item.id as keyof typeof iconMap] ?? Clock3;

          return (
            <div
              key={item.id}
              className={`rounded-xl border border-border/60 bg-background/60 ${compact ? "px-3 py-2" : "px-3.5 py-3"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-2.5">
                  <span className="mt-0.5 rounded-full bg-primary/10 p-1.5 text-primary">
                    <Icon size={compact ? 14 : 15} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold leading-tight">{item.label}</p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{item.note}</p>
                  </div>
                </div>
                <span className="shrink-0 text-right text-[11px] font-semibold text-foreground">
                  {item.timeText}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ForbiddenPrayerTimesList;
