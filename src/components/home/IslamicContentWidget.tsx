import { useIslamicContents, useSiteSettings } from "@/hooks/useData";
import { BookOpen, Quote, HandHelping, X, ChevronRight } from "lucide-react";
import SectionHeader from "./SectionHeader";
import IftarCountdownWidget from "./IftarCountdownWidget";
import { SeasonalIslamicCards } from "./SeasonalIslamicCards";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

const categoryConfig = {
  quran: { label: "কুরআন", icon: BookOpen, gradient: "from-emerald-800 to-teal-700", darkGradient: "dark:from-emerald-900 dark:to-teal-800", link: "/quran" },
  hadith: { label: "হাদিস", icon: Quote, gradient: "from-sky-800 to-blue-700", darkGradient: "dark:from-sky-900 dark:to-blue-800", link: "/hadith" },
  dua: { label: "দোয়া", icon: HandHelping, gradient: "from-indigo-800 to-purple-700", darkGradient: "dark:from-indigo-900 dark:to-purple-800", link: "/dua" },
  masala: { label: "মাসআলা", icon: BookOpen, gradient: "from-rose-800 to-red-700", darkGradient: "dark:from-rose-900 dark:to-red-800", link: "/masala" },
} as const;

const getDailyContent = (items: any[]) => {
  if (!items.length) return null;
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return items[dayOfYear % items.length];
};

const ContentModal = ({ item, onClose }: { item: any; onClose: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
    <div
      className="bg-card w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
      onClick={e => e.stopPropagation()}
    >
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="font-bold text-base">{item.title}</h3>
        <button onClick={onClose} className="p-2 hover:bg-muted rounded-xl"><X size={18} /></button>
      </div>
      <div className="overflow-y-auto p-6 space-y-4">
        {item.category !== "masala" && (
          <p className="font-arabic text-2xl font-bold leading-[2.5] text-right" dir="rtl">{item.content}</p>
        )}
        {item.transliteration && (
          <p className="text-sm text-muted-foreground italic border-t border-border pt-3">উচ্চারণ: {item.transliteration}</p>
        )}
        {item.meaning && (
          <p className="text-sm text-foreground leading-relaxed border-t border-border pt-3">অর্থ: {item.meaning}</p>
        )}
        {item.question && (
          <div className="border-t border-border pt-3">
            <p className="text-sm font-semibold mb-1">প্রশ্ন: {item.question}</p>
            <p className="text-sm text-foreground leading-relaxed">{item.content}</p>
          </div>
        )}
        {item.source && (
          <p className="text-sm text-muted-foreground italic text-right border-t border-border pt-4">— {item.source}</p>
        )}
      </div>
    </div>
  </div>
);

const IslamicContentWidget = () => {
  const { data: contents } = useIslamicContents();
  const { data: siteSettings } = useSiteSettings();
  const [selected, setSelected] = useState<any | null>(null);
  const showSeasonal = siteSettings?.["section_seasonal_islamic"] !== "false";

  const grouped = useMemo(() => {
    if (!contents?.length) return null;
    return {
      quran: getDailyContent(contents.filter(c => c.category === "quran")),
      hadith: getDailyContent(contents.filter(c => c.category === "hadith")),
      dua: getDailyContent(contents.filter(c => c.category === "dua")),
      masala: getDailyContent(contents.filter(c => c.category === "masala")),
    };
  }, [contents]);

  if (!grouped) return null;

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <SectionHeader title="ইসলামী কন্টেন্ট" />
      <div className="p-4 space-y-4">
        {showSeasonal && contents && <SeasonalIslamicCards contents={contents as any} />}
        <IftarCountdownWidget />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {(Object.keys(categoryConfig) as Array<keyof typeof categoryConfig>).map((key) => {
            const config = categoryConfig[key];
            const item = grouped[key];
            const Icon = config.icon;

            return (
              <div
                key={key}
                className={`bg-gradient-to-br ${config.gradient} ${config.darkGradient} rounded-xl p-4 text-white relative overflow-hidden min-h-[180px] flex flex-col shadow-lg`}
              >
                <div className="absolute inset-0 opacity-[0.04]" style={{
                  backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)`,
                }} />
                <div className="absolute top-2 right-2 opacity-10"><Icon size={32} /></div>

                <div className="flex items-center gap-2 mb-2.5 border-b border-white/20 pb-2">
                  <Icon size={16} className="shrink-0" />
                  <h3 className="text-sm font-bold tracking-wide flex-1">{config.label}</h3>
                  <Link to={config.link} className="opacity-60 hover:opacity-100 transition-opacity text-white" title={`সব ${config.label} দেখুন`}>
                    <ChevronRight size={16} />
                  </Link>
                </div>

                {item ? (
                  <button
                    className="flex-1 flex flex-col justify-between relative z-10 text-left w-full hover:opacity-90 transition-opacity cursor-pointer"
                    onClick={() => setSelected(item)}
                  >
                    <div>
                      <p className="text-xs font-semibold mb-2 opacity-90">{item.title}</p>
                      {key !== "masala" && (
                        <p className="text-[18px] font-bold leading-[2.2] font-arabic" dir="rtl">
                          {item.content}
                        </p>
                      )}
                      {key === "masala" && item.question && (
                        <p className="text-[11px] opacity-90 leading-relaxed">{item.question}</p>
                      )}
                    </div>
                    {item.meaning && (
                      <p className="text-[11px] opacity-80 mt-2 leading-relaxed line-clamp-2">{item.meaning}</p>
                    )}
                    {item.source && (
                      <p className="text-[10px] opacity-70 mt-2 text-right italic">— {item.source}</p>
                    )}
                  </button>
                ) : (
                  <Link to={config.link} className="flex-1 flex items-center justify-center relative z-10">
                    <p className="text-xs opacity-60 text-center">কন্টেন্ট যুক্ত করুন</p>
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {selected && <ContentModal item={selected} onClose={() => setSelected(null)} />}
    </div>
  );
};

export default IslamicContentWidget;
