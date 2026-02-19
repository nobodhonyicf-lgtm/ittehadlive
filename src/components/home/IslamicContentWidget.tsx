import { useIslamicContents } from "@/hooks/useData";
import { BookOpen, Quote, HandHelping, Moon } from "lucide-react";
import SectionHeader from "./SectionHeader";

const categoryConfig = {
  quran: { label: "কুরআন", icon: BookOpen, gradient: "from-emerald-700 to-emerald-600", darkGradient: "dark:from-emerald-800 dark:to-emerald-700" },
  hadith: { label: "হাদিস", icon: Quote, gradient: "from-blue-700 to-blue-600", darkGradient: "dark:from-blue-800 dark:to-blue-700" },
  dua: { label: "দোয়া", icon: HandHelping, gradient: "from-purple-700 to-purple-600", darkGradient: "dark:from-purple-800 dark:to-purple-700" },
  iftar: { label: "ইফতার সময়সূচি", icon: Moon, gradient: "from-amber-700 to-amber-600", darkGradient: "dark:from-amber-800 dark:to-amber-700" },
} as const;

const IslamicContentWidget = () => {
  const { data: contents } = useIslamicContents();

  if (!contents?.length) return null;

  const grouped = {
    quran: contents.filter(c => c.category === "quran")[0],
    hadith: contents.filter(c => c.category === "hadith")[0],
    dua: contents.filter(c => c.category === "dua")[0],
    iftar: contents.filter(c => c.category === "iftar")[0],
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <SectionHeader title="ইসলামী কন্টেন্ট" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4">
        {(Object.keys(categoryConfig) as Array<keyof typeof categoryConfig>).map((key) => {
          const config = categoryConfig[key];
          const item = grouped[key];
          const Icon = config.icon;

          return (
            <div
              key={key}
              className={`bg-gradient-to-br ${config.gradient} ${config.darkGradient} rounded-xl p-4 text-white relative overflow-hidden min-h-[140px] flex flex-col transition-transform hover:scale-[1.02]`}
            >
              {/* Background pattern */}
              <div className="absolute top-2 right-2 opacity-10">
                <Icon size={48} />
              </div>

              <div className="flex items-center gap-2 mb-2">
                <Icon size={16} className="shrink-0" />
                <h3 className="text-sm font-bold">{config.label}</h3>
              </div>

              {item ? (
                <div className="flex-1 flex flex-col justify-between relative z-10">
                  <div>
                    <p className="text-xs font-semibold mb-1 opacity-90">{item.title}</p>
                    <p className="text-[13px] leading-relaxed font-arabic" dir="auto">
                      {item.content}
                    </p>
                  </div>
                  {item.source && (
                    <p className="text-[10px] opacity-70 mt-2 text-right">— {item.source}</p>
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
