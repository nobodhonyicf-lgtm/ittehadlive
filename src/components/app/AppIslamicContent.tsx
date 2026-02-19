import { useIslamicContents } from "@/hooks/useData";
import { BookOpen, Quote, HandHelping, Moon } from "lucide-react";

const categoryConfig = {
  quran: { label: "কুরআন", icon: BookOpen, bg: "from-emerald-700 to-emerald-600", darkBg: "dark:from-emerald-800 dark:to-emerald-700", emoji: "📖" },
  hadith: { label: "হাদিস", icon: Quote, bg: "from-blue-700 to-blue-600", darkBg: "dark:from-blue-800 dark:to-blue-700", emoji: "📜" },
  dua: { label: "দোয়া", icon: HandHelping, bg: "from-purple-700 to-purple-600", darkBg: "dark:from-purple-800 dark:to-purple-700", emoji: "🤲" },
  iftar: { label: "ইফতার", icon: Moon, bg: "from-amber-700 to-amber-600", darkBg: "dark:from-amber-800 dark:to-amber-700", emoji: "🌙" },
} as const;

const AppIslamicContent = () => {
  const { data: contents } = useIslamicContents();

  if (!contents?.length) return null;

  const grouped = {
    quran: contents.filter(c => c.category === "quran")[0],
    hadith: contents.filter(c => c.category === "hadith")[0],
    dua: contents.filter(c => c.category === "dua")[0],
    iftar: contents.filter(c => c.category === "iftar")[0],
  };

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

          return (
            <div
              key={key}
              className={`bg-gradient-to-br ${config.bg} ${config.darkBg} rounded-2xl p-3 text-white relative overflow-hidden min-h-[120px] flex flex-col shadow-sm transition-colors duration-300`}
            >
              <div className="absolute top-1 right-1 opacity-10">
                <Icon size={36} />
              </div>

              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="text-sm">{config.emoji}</span>
                <h3 className="text-[11px] font-bold">{config.label}</h3>
              </div>

              {item ? (
                <div className="flex-1 flex flex-col justify-between relative z-10">
                  <div>
                    <p className="text-[10px] font-semibold opacity-90 mb-0.5">{item.title}</p>
                    <p className="text-[11px] leading-relaxed line-clamp-3" dir="auto">
                      {item.content}
                    </p>
                  </div>
                  {item.source && (
                    <p className="text-[9px] opacity-60 mt-1 text-right">— {item.source}</p>
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
