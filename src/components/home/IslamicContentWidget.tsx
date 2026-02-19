import { useIslamicContents } from "@/hooks/useData";
import { useAladhanPrayerTimes } from "@/hooks/useAladhanPrayerTimes";
import { BookOpen, Quote, HandHelping, Moon, MapPin, Loader2 } from "lucide-react";
import SectionHeader from "./SectionHeader";
import { useMemo } from "react";

const categoryConfig = {
  quran: { label: "কুরআন", icon: BookOpen, gradient: "from-emerald-800 to-teal-700", darkGradient: "dark:from-emerald-900 dark:to-teal-800", pattern: "🕌" },
  hadith: { label: "হাদিস", icon: Quote, gradient: "from-sky-800 to-blue-700", darkGradient: "dark:from-sky-900 dark:to-blue-800", pattern: "📿" },
  dua: { label: "দোয়া", icon: HandHelping, gradient: "from-indigo-800 to-purple-700", darkGradient: "dark:from-indigo-900 dark:to-purple-800", pattern: "🤲" },
  iftar: { label: "ইফতার ও সেহরি", icon: Moon, gradient: "from-amber-800 to-orange-700", darkGradient: "dark:from-amber-900 dark:to-orange-800", pattern: "🌙" },
} as const;

const getDailyContent = (items: any[]) => {
  if (!items.length) return null;
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return items[dayOfYear % items.length];
};

const IslamicContentWidget = () => {
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
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <SectionHeader title="☪ ইসলামী কন্টেন্ট" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4">
        {(Object.keys(categoryConfig) as Array<keyof typeof categoryConfig>).map((key) => {
          const config = categoryConfig[key];
          const item = grouped[key];
          const Icon = config.icon;
          const isIftar = key === "iftar";

          return (
            <div
              key={key}
              className={`bg-gradient-to-br ${config.gradient} ${config.darkGradient} rounded-xl p-4 text-white relative overflow-hidden min-h-[160px] flex flex-col transition-transform hover:scale-[1.02] shadow-lg`}
            >
              <div className="absolute inset-0 opacity-[0.04]" style={{
                backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)`,
              }} />
              
              <div className="absolute top-2 right-2 opacity-10 text-4xl">
                {config.pattern}
              </div>

              <div className="flex items-center gap-2 mb-2.5 border-b border-white/20 pb-2">
                <Icon size={16} className="shrink-0" />
                <h3 className="text-sm font-bold tracking-wide">{config.label}</h3>
              </div>

              {isIftar ? (
                <div className="flex-1 flex flex-col justify-between relative z-10">
                  {prayerLoading ? (
                    <div className="flex items-center gap-2 text-xs opacity-70">
                      <Loader2 size={14} className="animate-spin" /> সময় লোড হচ্ছে...
                    </div>
                  ) : prayerApi ? (
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-1.5 text-[10px] opacity-70">
                        <MapPin size={10} />
                        <span>{prayerApi.locationName}</span>
                        {prayerApi.hijriDate && <span className="font-arabic">• {prayerApi.hijriDate}</span>}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-white/15 rounded-lg p-2.5 text-center backdrop-blur-sm">
                          <p className="text-[10px] opacity-80 mb-0.5">সেহরি শেষ</p>
                          <p className="text-lg font-bold">{prayerApi.sehri}</p>
                          <p className="text-[9px] opacity-60">ফজর</p>
                        </div>
                        <div className="bg-white/15 rounded-lg p-2.5 text-center backdrop-blur-sm">
                          <p className="text-[10px] opacity-80 mb-0.5">ইফতার</p>
                          <p className="text-lg font-bold">{prayerApi.iftar}</p>
                          <p className="text-[9px] opacity-60">মাগরিব</p>
                        </div>
                      </div>
                      {item?.content && (
                        <p className="text-[10px] opacity-60 mt-1">{item.content}</p>
                      )}
                    </div>
                  ) : item ? (
                    <div>
                      <p className="text-xs font-semibold mb-1.5 opacity-90">{item.title}</p>
                      <p className="text-[15px] leading-[2] font-arabic" dir="auto">{item.content}</p>
                      {item.source && <p className="text-[10px] opacity-70 mt-2 text-right italic">— {item.source}</p>}
                    </div>
                  ) : (
                    <p className="text-xs opacity-60 mt-2">কন্টেন্ট যুক্ত করা হয়নি</p>
                  )}
                </div>
              ) : item ? (
                <div className="flex-1 flex flex-col justify-between relative z-10">
                  <div>
                    <p className="text-xs font-semibold mb-1.5 opacity-90">{item.title}</p>
                    <p className="text-[15px] leading-[2] font-arabic" dir="auto">
                      {item.content}
                    </p>
                  </div>
                  {item.source && (
                    <p className="text-[10px] opacity-70 mt-2 text-right italic">— {item.source}</p>
                  )}
                </div>
              ) : (
                <p className="text-xs opacity-60 mt-2">কন্টেন্ট যুক্ত করা হয়নি</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default IslamicContentWidget;
