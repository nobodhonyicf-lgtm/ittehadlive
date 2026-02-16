import { usePrayerTimes } from "@/hooks/useData";
import { toBengali } from "@/lib/bengali";
import { useState, useEffect } from "react";

const AppPrayerWidget = () => {
  const { data: prayerTimes } = usePrayerTimes();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  if (!prayerTimes?.length) return null;

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const bengaliToEnglish = (s: string) =>
    s.replace(/[০-৯]/g, (d) => String("০১২৩৪৫৬৭৮৯".indexOf(d)));

  let nextPrayer: typeof prayerTimes[0] | null = null;
  for (const pt of prayerTimes) {
    const cleaned = bengaliToEnglish(pt.time_text.trim());
    const match = cleaned.match(/(\d{1,2})[:\.](\d{2})/);
    if (match) {
      const mins = parseInt(match[1]) * 60 + parseInt(match[2]);
      if (mins > currentMinutes) {
        nextPrayer = pt;
        break;
      }
    }
  }

  return (
    <div className="bg-gradient-to-r from-emerald-700 to-emerald-600 dark:from-emerald-800 dark:to-emerald-700 rounded-2xl p-4 text-white shadow-sm animate-fade-in transition-colors duration-300" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold flex items-center gap-2">
          🕌 নামাজের সময়সূচি
        </h2>
        {nextPrayer && (
          <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full animate-scale-in">
            পরবর্তী: {nextPrayer.name}
          </span>
        )}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {prayerTimes.slice(0, 6).map((pt, i) => (
          <div
            key={pt.id}
            className={`text-center py-2 px-1 rounded-xl transition-all duration-300 ${
              nextPrayer?.id === pt.id
                ? "bg-white/25 ring-1 ring-white/40 scale-105"
                : "bg-white/10 hover:bg-white/15"
            }`}
            style={{ animationDelay: `${250 + i * 50}ms` }}
          >
            <p className="text-[10px] opacity-80">{pt.name}</p>
            <p className="text-sm font-bold mt-0.5">{pt.time_text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AppPrayerWidget;
