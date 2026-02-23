import { useIslamicContents } from "@/hooks/useData";
import { BookOpen, Quote, HandHelping, X, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import AppIftarCountdown from "./AppIftarCountdown";
import { Link } from "react-router-dom";

const categoryConfig = {
  quran: { label: "কুরআন", icon: BookOpen, bg: "from-emerald-800 to-teal-700", pattern: "🕌", link: "/quran" },
  hadith: { label: "হাদিস", icon: Quote, bg: "from-sky-800 to-blue-700", pattern: "📿", link: "/hadith" },
  dua: { label: "দোয়া", icon: HandHelping, bg: "from-indigo-800 to-purple-700", pattern: "🤲", link: "/dua" },
  masala: { label: "মাসআলা", icon: BookOpen, bg: "from-rose-800 to-red-700", pattern: "📖", link: "/masala" },
} as const;

const getDailyContent = (items: any[]) => {
  if (!items.length) return null;
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return items[dayOfYear % items.length];
};

const ContentModal = ({ item, onClose }: { item: any; onClose: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
    <div
      className="bg-card w-full rounded-t-2xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col"
      onClick={e => e.stopPropagation()}
    >
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="font-bold text-sm">{item.title}</h3>
        <button onClick={onClose} className="p-2 hover:bg-muted rounded-xl"><X size={16} /></button>
      </div>
      <div className="overflow-y-auto p-5 space-y-4">
        {item.category !== "masala" && (
          <p className="font-arabic text-2xl font-bold leading-[2.5] text-right" dir="rtl">{item.content}</p>
        )}
        {item.transliteration && (
          <p className="text-sm text-muted-foreground italic border-t border-border pt-3">উচ্চারণ: {item.transliteration}</p>
        )}
        {item.meaning && (
          <p className="text-sm text-foreground leading-relaxed border-t border-border pt-3">📝 অর্থ: {item.meaning}</p>
        )}
        {item.question && (
          <div className="border-t border-border pt-3">
            <p className="text-sm font-semibold mb-1">❓ প্রশ্ন: {item.question}</p>
            <p className="text-sm text-foreground leading-relaxed">{item.content}</p>
          </div>
        )}
        {item.source && (
          <p className="text-sm text-muted-foreground italic text-right border-t border-border pt-3">— {item.source}</p>
        )}
      </div>
    </div>
  </div>
);

const AppIslamicContent = () => {
  const { data: contents } = useIslamicContents();
  const [selected, setSelected] = useState<any | null>(null);

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
    <div className="animate-fade-in space-y-3" style={{ animationDelay: "300ms", animationFillMode: "both" }}>
      <h2 className="text-sm font-bold flex items-center gap-2">☪ ইসলামী কন্টেন্ট</h2>

      <AppIftarCountdown />

      <div className="grid grid-cols-2 gap-2.5">
        {(Object.keys(categoryConfig) as Array<keyof typeof categoryConfig>).map((key) => {
          const config = categoryConfig[key];
          const item = grouped[key];
          const Icon = config.icon;

          return (
            <div key={key} className={`bg-gradient-to-br ${config.bg} rounded-2xl p-3 text-white relative overflow-hidden min-h-[150px] flex flex-col shadow-md`}>
              <div className="absolute inset-0 opacity-[0.04]" style={{
                backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(255,255,255,0.1) 8px, rgba(255,255,255,0.1) 16px)`,
              }} />
              <div className="absolute top-1 right-1.5 opacity-10 text-2xl">{config.pattern}</div>

              <div className="flex items-center gap-1.5 mb-1.5 border-b border-white/15 pb-1.5">
                <Icon size={12} className="shrink-0" />
                <h3 className="text-[11px] font-bold flex-1">{config.label}</h3>
                <Link to={config.link} className="opacity-60 hover:opacity-100 transition-opacity">
                  <ChevronRight size={12} />
                </Link>
              </div>

              {item ? (
                <button
                  className="flex-1 flex flex-col justify-between relative z-10 text-left w-full active:opacity-80 transition-opacity"
                  onClick={() => setSelected(item)}
                >
                  <div>
                    <p className="text-[10px] font-semibold opacity-90 mb-1">{item.title}</p>
                    {key !== "masala" && (
                      <p className="text-[15px] font-bold leading-[2.1] font-arabic" dir="rtl">
                        {item.content}
                      </p>
                    )}
                    {key === "masala" && item.question && (
                      <p className="text-[9px] opacity-90 leading-relaxed">{item.question}</p>
                    )}
                  </div>
                  {item.meaning && (
                    <p className="text-[9px] opacity-70 mt-1 leading-relaxed line-clamp-2">📝 {item.meaning}</p>
                  )}
                  {item.source && (
                    <p className="text-[9px] opacity-60 mt-1 text-right italic">— {item.source}</p>
                  )}
                </button>
              ) : (
                <Link to={config.link} className="flex-1 flex items-center justify-center relative z-10">
                  <p className="text-[10px] opacity-50">আরও দেখুন</p>
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {selected && <ContentModal item={selected} onClose={() => setSelected(null)} />}
    </div>
  );
};

export default AppIslamicContent;
