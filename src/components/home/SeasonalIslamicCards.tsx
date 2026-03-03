import { useMemo } from "react";
import { Star, Moon, Sparkles, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

interface SeasonalItem {
  id: string;
  title: string;
  content: string;
  category: string;
  seasonal_tag?: string | null;
  meaning?: string | null;
  question?: string | null;
  source?: string | null;
}

const seasonalConfig: Record<string, { label: string; desc: string; icon: typeof Star; gradient: string }> = {
  ramadan: { label: "রমাদানের বিশেষ", desc: "রমাদানের ফজিলত, রোযার মাসআলা ও দোয়া", icon: Moon, gradient: "from-emerald-700 to-teal-600" },
  shawwal: { label: "ঈদুল ফিতর বিশেষ", desc: "শাওয়ালের রোযা, ঈদের মাসআলা ও দোয়া", icon: Sparkles, gradient: "from-amber-600 to-orange-500" },
  dhul_hijjah: { label: "কুরবানী বিশেষ", desc: "জিলহজ্জের আমল, কুরবানীর মাসআলা", icon: Star, gradient: "from-rose-700 to-red-600" },
  muharram: { label: "মুহাররম বিশেষ", desc: "আশুরার ফজিলত ও আমল", icon: Moon, gradient: "from-purple-700 to-indigo-600" },
  rabi_ul_awal: { label: "রবিউল আউয়াল বিশেষ", desc: "সীরাত ও নবী (সা.)-এর জীবনী", icon: Star, gradient: "from-sky-700 to-blue-600" },
  rajab: { label: "রজব বিশেষ", desc: "রজব মাসের ফজিলত ও আমল", icon: Moon, gradient: "from-violet-700 to-purple-600" },
  shaban: { label: "শাবান বিশেষ", desc: "শবে বরাতের ফজিলত ও আমল", icon: Sparkles, gradient: "from-cyan-700 to-teal-600" },
};

// Get current Islamic month approximation (simplified)
const getCurrentSeasonalTag = (): string | null => {
  const now = new Date();
  const month = now.getMonth(); // 0-11
  // Approximate mapping (shifts yearly, but provides a reasonable default)
  const monthMap: Record<number, string> = {
    2: "ramadan", // March ~ Ramadan 2026 approx
    3: "shawwal",
    5: "dhul_hijjah",
    6: "muharram",
    8: "rabi_ul_awal",
    0: "rajab",
    1: "shaban",
  };
  return monthMap[month] || null;
};

export const SeasonalIslamicCards = ({ contents, isApp = false }: { contents: SeasonalItem[]; isApp?: boolean }) => {
  const currentTag = getCurrentSeasonalTag();
  
  const seasonalItems = useMemo(() => {
    if (!currentTag || !contents?.length) return [];
    return contents.filter(c => (c as any).seasonal_tag === currentTag);
  }, [contents, currentTag]);

  if (!seasonalItems.length || !currentTag) return null;

  const config = seasonalConfig[currentTag];
  if (!config) return null;

  const Icon = config.icon;
  const displayItems = seasonalItems.slice(0, isApp ? 3 : 4);

  return (
    <div className={`rounded-2xl overflow-hidden bg-gradient-to-br ${config.gradient} text-white shadow-lg ${isApp ? 'mx-0' : ''}`}>
      <div className="relative p-4">
        <div className="absolute inset-0 opacity-[0.05]" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(255,255,255,0.15) 8px, rgba(255,255,255,0.15) 16px)`,
        }} />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Icon size={16} />
            </div>
            <div>
              <h3 className={`font-bold ${isApp ? 'text-sm' : 'text-base'}`}>{config.label}</h3>
              <p className={`opacity-75 ${isApp ? 'text-[10px]' : 'text-xs'}`}>{config.desc}</p>
            </div>
          </div>

          <div className={`grid ${isApp ? 'grid-cols-1 gap-2' : 'grid-cols-1 sm:grid-cols-2 gap-2'}`}>
            {displayItems.map((item) => (
              <Link
                key={item.id}
                to={`/${item.category}`}
                className="bg-white/15 backdrop-blur-sm rounded-xl p-3 hover:bg-white/25 transition-colors block"
              >
                <p className={`font-bold mb-1 ${isApp ? 'text-[11px]' : 'text-xs'}`}>{item.title}</p>
                {item.category !== "masala" ? (
                  <p className={`font-arabic font-bold text-right leading-[2] line-clamp-1 ${isApp ? 'text-sm' : 'text-base'}`} dir="rtl">
                    {item.content}
                  </p>
                ) : item.question ? (
                  <p className={`opacity-90 line-clamp-2 ${isApp ? 'text-[10px]' : 'text-[11px]'}`}>{item.question}</p>
                ) : null}
                {item.meaning && (
                  <p className={`opacity-70 mt-1 line-clamp-1 ${isApp ? 'text-[9px]' : 'text-[10px]'}`}>{item.meaning}</p>
                )}
              </Link>
            ))}
          </div>

          {seasonalItems.length > displayItems.length && (
            <div className="text-center mt-2">
              <span className={`opacity-70 ${isApp ? 'text-[10px]' : 'text-xs'}`}>
                আরও {seasonalItems.length - displayItems.length}টি কন্টেন্ট রয়েছে
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SeasonalIslamicCards;
