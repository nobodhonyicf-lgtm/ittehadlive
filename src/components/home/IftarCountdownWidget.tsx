import { useEffect, useState, useMemo } from "react";
import { useAladhanPrayerTimes } from "@/hooks/useAladhanPrayerTimes";
import { Moon, Sun, Timer, MapPin } from "lucide-react";

const toBengaliNum = (n: number | string) => {
  const d = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(n).replace(/[0-9]/g, (x) => d[+x]);
};

const parseRaw = (raw: string): { h: number; m: number } => {
  const [h, m] = raw.split(":").map(Number);
  return { h, m };
};

const getSecondsUntil = (h: number, m: number): number => {
  const now = new Date();
  const target = new Date(now);
  target.setHours(h, m, 0, 0);
  if (target.getTime() <= now.getTime()) target.setDate(target.getDate() + 1);
  return Math.floor((target.getTime() - now.getTime()) / 1000);
};

const IftarCountdownWidget = () => {
  const { data: prayer } = useAladhanPrayerTimes();
  const [seconds, setSeconds] = useState<number | null>(null);
  const [mode, setMode] = useState<"iftar" | "sehri">("iftar");

  const target = useMemo(() => {
    if (!prayer) return null;
    const now = new Date();
    const sehri = parseRaw(prayer.sehriRaw);
    const iftar = parseRaw(prayer.iftarRaw);
    const sehriTotal = sehri.h * 60 + sehri.m;
    const iftarTotal = iftar.h * 60 + iftar.m;
    const nowTotal = now.getHours() * 60 + now.getMinutes();
    if (nowTotal < sehriTotal) return { ...sehri, mode: "sehri" as const };
    if (nowTotal < iftarTotal) return { ...iftar, mode: "iftar" as const };
    return { ...sehri, mode: "sehri" as const };
  }, [prayer]);

  useEffect(() => {
    if (!target) return;
    setMode(target.mode);
    setSeconds(getSecondsUntil(target.h, target.m));
    const interval = setInterval(() => setSeconds(getSecondsUntil(target.h, target.m)), 1000);
    return () => clearInterval(interval);
  }, [target]);

  if (!prayer || seconds === null) return null;

  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  const label = mode === "iftar" ? "ইফতার" : "সেহরি";
  const Icon = mode === "iftar" ? Moon : Sun;
  const bgClass = mode === "iftar"
    ? "from-amber-800 to-orange-700"
    : "from-indigo-800 to-purple-700";

  return (
    <div className={`bg-gradient-to-br ${bgClass} rounded-xl p-4 text-white shadow-lg`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon size={18} />
          <div>
            <p className="text-sm font-bold">{label} কাউন্টডাউন</p>
            {prayer.locationName && (
              <div className="flex items-center gap-1 text-[10px] opacity-70">
                <MapPin size={9} />
                <span>{prayer.locationName}</span>
              </div>
            )}
          </div>
        </div>
        <Timer size={16} className="opacity-60" />
      </div>

      <div className="flex items-center justify-center gap-3">
        {[
          { val: hrs, label: "ঘণ্টা" },
          { val: mins, label: "মিনিট" },
          { val: secs, label: "সেকেন্ড" },
        ].map(({ val, label: lbl }, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="bg-white/20 rounded-xl w-14 h-14 flex items-center justify-center backdrop-blur-sm border border-white/10">
              <span className="text-2xl font-bold" style={{ fontFamily: "'Noto Sans Bengali', 'SolaimanLipi', sans-serif", fontVariantNumeric: "tabular-nums" }}>
                {toBengaliNum(String(val).padStart(2, "0"))}
              </span>
            </div>
            <span className="text-[10px] opacity-70 mt-1">{lbl}</span>
          </div>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="bg-white/10 rounded-lg p-2 text-center">
          <p className="text-[10px] opacity-70">সেহরি শেষ</p>
          <p className="text-base font-bold">{prayer.sehri}</p>
        </div>
        <div className="bg-white/10 rounded-lg p-2 text-center">
          <p className="text-[10px] opacity-70">ইফতার</p>
          <p className="text-base font-bold">{prayer.iftar}</p>
        </div>
      </div>
    </div>
  );
};

export default IftarCountdownWidget;
