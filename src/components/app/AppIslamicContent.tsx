import { useIslamicContents } from "@/hooks/useData";
import { useAladhanPrayerTimes } from "@/hooks/useAladhanPrayerTimes";
import { BookOpen, Quote, HandHelping, Moon, MapPin, Loader2 } from "lucide-react";
import { useMemo } from "react";

const categoryConfig = {
  quran: { label: "কুরআন", icon: BookOpen, bg: "from-emerald-800 to-teal-700", darkBg: "dark:from-emerald-900 dark:to-teal-800", pattern: "🕌" },
  hadith: { label: "হাদিস", icon: Quote, bg: "from-sky-800 to-blue-700", darkBg: "dark:from-sky-900 dark:to-blue-800", pattern: "📿" },
  dua: { label: "দোয়া", icon: HandHelping, bg: "from-indigo-800 to-purple-700", darkBg: "dark:from-indigo-900 dark:to-purple-800", pattern: "🤲" },
  iftar: { label: "ইফতার", icon: Moon, bg: "from-amber-800 to-orange-700", darkBg: "dark:from-amber-900 dark:to-orange-800", pattern: "🌙" },
} as const;

const getDailyContent = (items: any[]) => {
  if (!items.length) return null;
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return items[dayOfYear % items.length];
};

const AppIslamicContent = () => {
  const { data: contents } = useIslamicContents();
  const { data: prayerApi, isLoading: prayerLoading } = useAladhanPrayerTimes();

  const grouped = useMemo(() => {
    if (!contents?.length) return null;
    return {
      quran: getDailyContent(contents.filter(c => c.category === "quran")),
      hadith: getDailyContent(contents.filter(c => c.category === "hadith")),
      dua: getDailyContent(contents.filter(c => c.category === "dua")),
      iftar: getDailyContent(contents.filter(c => c.category === "iftar")),
    };
  }, [contents]);

  if (!grouped) return null;

  return (
    <div className="animate-fade-in" style={{ animationDelay: "300ms", animationFillMode: "both" }}>
      <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
        ☪ ইসলামী কন্টেন্ট
      </h2>
      <div className="grid grid-cols-2 gap-2.5">
        {(Object.keys(categoryConfig) as Array<keyof typeof categoryConfig>).map((key) => {
          const config = categoryConfig[key];
          const item = grouped[key];
          const Icon = config.icon;
          const isIftar = key === "iftar";

          return (
            <div
              key={key}
              className={`bg-gradient-to-br ${config.bg} ${config.darkBg} rounded-2xl p-3 text-white relative overflow-hidden min-h-[130px] flex flex-col shadow-md transition-colors duration-300`}
            >
              <div className="absolute inset-0 opacity-[0.04]" style={{
                backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(255,255,255,0.1) 8px, rgba(255,255,255,0.1) 16px)`,
              }} />

              <div className="absolute top-1 right-1.5 opacity-10 text-2xl">
                {config.pattern}
              </div>

              <div className="flex items-center gap-1.5 mb-1.5 border-b border-white/15 pb-1.5">
                <Icon size={12} className="shrink-0" />
                <h3 className="text-[11px] font-bold">{config.label}</h3>
              </div>

              {isIftar ? (
                <div className="flex-1 flex flex-col justify-between relative z-10">
                  {prayerLoading ? (
                    <div className="flex items-center gap-1 text-[10px] opacity-70">
                      <Loader2 size={10} className="animate-spin" /> লোড হচ্ছে...
                    </div>
                  ) : prayerApi ? (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1 text-[9px] opacity-70">
                        <MapPin size={8} />
                        <span>{prayerApi.locationName}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        <div className="bg-white/15 rounded-lg p-1.5 text-center">
                          <p className="text-[8px] opacity-80">সেহরি</p>
                          <p className="text-sm font-bold">{prayerApi.sehri}</p>
                        </div>
                        <div className="bg-white/15 rounded-lg p-1.5 text-center">
                          <p className="text-[8px] opacity-80">ইফতার</p>
                          <p className="text-sm font-bold">{prayerApi.iftar}</p>
                        </div>
                      </div>
                    </div>
                  ) : item ? (
                    <div>
                      <p className="text-[10px] font-semibold opacity-90 mb-0.5">{item.title}</p>
                      <p className="text-[12px] leading-[1.9] font-arabic line-clamp-3" dir="auto">{item.content}</p>
                    </div>
                  ) : (
                    <p className="text-[10px] opacity-50 mt-1">কন্টেন্ট নেই</p>
                  )}
                </div>
              ) : item ? (
                <div className="flex-1 flex flex-col justify-between relative z-10">
                  <div>
                    <p className="text-[10px] font-semibold opacity-90 mb-0.5">{item.title}</p>
                    <p className="text-[12px] leading-[1.9] font-arabic line-clamp-3" dir="auto">
                      {item.content}
                    </p>
                  </div>
                  {item.source && (
                    <p className="text-[9px] opacity-60 mt-1 text-right italic">— {item.source}</p>
                  )}
                </div>
              ) : (
                <p className="text-[10px] opacity-50 mt-1">কন্টেন্ট নেই</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AppIslamicContent;
