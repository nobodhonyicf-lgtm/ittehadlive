import { usePrayerTimes } from "@/hooks/useData";
import { toBengali } from "@/lib/bengali";
import { useState, useEffect } from "react";

const bengaliToEnglish = (s: string) =>
  s.replace(/[০-৯]/g, (d) => String("০১২৩৪৫৬৭৮৯".indexOf(d)));

// Convert 12-hour Bengali time like "৫:১৫" to minutes since midnight
// Prayer times are implicitly: ফজর(AM), যোহর(PM), আসর(PM), মাগরিব(PM), এশা(PM)
const normalizePrayerMinutes = (timeText: string, name: string): number | null => {
  const cleaned = bengaliToEnglish(timeText.trim());
  const match = cleaned.match(/(\d{1,2})[:\.](\d{2})/);
  if (!match) return null;
  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);

  // Determine AM/PM based on prayer name
  const amPrayers = ["ফজর"];
  const isAM = amPrayers.some((p) => name.includes(p));

  if (isAM) {
    // Already correct for AM (e.g., 5:15 = 5:15 AM)
  } else {
    // PM prayers: if hours < 12, add 12
    if (hours < 12) hours += 12;
  }

  return hours * 60 + minutes;
};

const AppPrayerWidget = () => {
  const { data: prayerTimes } = usePrayerTimes();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  if (!prayerTimes?.length) return null;

  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  let nextPrayer: typeof prayerTimes[0] | null = null;
  let remainingMinutes = 0;

  for (const pt of prayerTimes) {
    const mins = normalizePrayerMinutes(pt.time_text, pt.name);
    if (mins !== null && mins > currentMinutes) {
      nextPrayer = pt;
      remainingMinutes = mins - currentMinutes;
      break;
    }
  }

  return (
    <div className="bg-gradient-to-r from-emerald-700 to-emerald-600 dark:from-emerald-800 dark:to-emerald-700 rounded-2xl p-4 text-white shadow-sm animate-fade-in transition-colors duration-300" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold flex items-center gap-2">
          🕌 নামাজের সময়সূচি
        </h2>
        {nextPrayer && (
          <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full animate-pulse">
            {nextPrayer.name} — আরও {toBengali(remainingMinutes)} মিনিট
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
