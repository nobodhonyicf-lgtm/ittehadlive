import { useIslamicContents } from "@/hooks/useData";
import { BookOpen, Quote, HandHelping } from "lucide-react";
import { useMemo } from "react";
import AppIftarCountdown from "./AppIftarCountdown";

const categoryConfig = {
  quran: { label: "কুরআন", icon: BookOpen, bg: "from-emerald-800 to-teal-700", pattern: "🕌" },
  hadith: { label: "হাদিস", icon: Quote, bg: "from-sky-800 to-blue-700", pattern: "📿" },
  dua: { label: "দোয়া", icon: HandHelping, bg: "from-indigo-800 to-purple-700", pattern: "🤲" },
} as const;

const getDailyContent = (items: any[]) => {
  if (!items.length) return null;
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return items[dayOfYear % items.length];
};

const AppIslamicContent = () => {
  const { data: contents } = useIslamicContents();

  const grouped = useMemo(() => {
    if (!contents?.length) return null;
    return {
      quran: getDailyContent(contents.filter(c => c.category === "quran")),
      hadith: getDailyContent(contents.filter(c => c.category === "hadith")),
      dua: getDailyContent(contents.filter(c => c.category === "dua")),
    };
  }, [contents]);

  if (!grouped) return null;

  return (
    <div className="animate-fade-in space-y-3" style={{ animationDelay: "300ms", animationFillMode: "both" }}>
      <h2 className="text-sm font-bold flex items-center gap-2">☪ ইসলামী কন্টেন্ট</h2>

      {/* Iftar Countdown */}
      <AppIftarCountdown />

      {/* Quran, Hadith, Dua cards */}
      <div className="grid grid-cols-2 gap-2.5">
        {(Object.keys(categoryConfig) as Array<keyof typeof categoryConfig>).map((key) => {
          const config = categoryConfig[key];
          const item = grouped[key];
          const Icon = config.icon;

          return (
            <div
              key={key}
              className={`bg-gradient-to-br ${config.bg} rounded-2xl p-3 text-white relative overflow-hidden min-h-[150px] flex flex-col shadow-md`}
            >
              <div className="absolute inset-0 opacity-[0.04]" style={{
                backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(255,255,255,0.1) 8px, rgba(255,255,255,0.1) 16px)`,
              }} />

              <div className="absolute top-1 right-1.5 opacity-10 text-2xl">{config.pattern}</div>

              <div className="flex items-center gap-1.5 mb-1.5 border-b border-white/15 pb-1.5">
                <Icon size={12} className="shrink-0" />
                <h3 className="text-[11px] font-bold">{config.label}</h3>
              </div>

              {item ? (
                <div className="flex-1 flex flex-col justify-between relative z-10">
                  <div>
                    <p className="text-[10px] font-semibold opacity-90 mb-1">{item.title}</p>
                    <p className="text-[15px] font-bold leading-[2.1] font-arabic" dir="rtl">
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
