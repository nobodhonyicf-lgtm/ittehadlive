import { useEffect, useState, useMemo } from "react";
import { useAladhanPrayerTimes } from "@/hooks/useAladhanPrayerTimes";
import { Moon, Sun, Timer } from "lucide-react";

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

interface Props {
  compact?: boolean;
}

const AppIftarCountdown = ({ compact = false }: Props) => {
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

    // After sehri but before iftar → count to iftar
    // After iftar → count to next sehri
    if (nowTotal < sehriTotal) {
      return { ...sehri, mode: "sehri" as const };
    } else if (nowTotal < iftarTotal) {
      return { ...iftar, mode: "iftar" as const };
    } else {
      return { ...sehri, mode: "sehri" as const };
    }
  }, [prayer]);

  useEffect(() => {
    if (!target) return;
    setMode(target.mode);
    setSeconds(getSecondsUntil(target.h, target.m));
    const interval = setInterval(() => {
      setSeconds(getSecondsUntil(target.h, target.m));
    }, 1000);
    return () => clearInterval(interval);
  }, [target]);

  if (!prayer || seconds === null) return null;

  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const label = mode === "iftar" ? "ইফতার" : "সেহরি";
  const Icon = mode === "iftar" ? Moon : Sun;
  const bgClass = mode === "iftar"
    ? "from-amber-700 to-orange-600"
    : "from-indigo-700 to-purple-600";

  if (compact) {
    return (
      <div className={`flex items-center gap-2 bg-gradient-to-r ${bgClass} text-white rounded-xl px-3 py-2 text-[11px] font-bold`}>
        <Icon size={12} />
        <span>{label} পর্যন্ত:</span>
        <span className="font-mono tracking-widest">
          {toBengaliNum(String(hrs).padStart(2, "0"))}:{toBengaliNum(String(mins).padStart(2, "0"))}:{toBengaliNum(String(secs).padStart(2, "0"))}
        </span>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-br ${bgClass} rounded-2xl p-3 text-white shadow-md`}>
      <div className="flex items-center gap-1.5 mb-2 border-b border-white/20 pb-1.5">
        <Timer size={12} />
        <span className="text-[11px] font-bold">{label} কাউন্টডাউন</span>
      </div>
      <div className="flex items-center justify-center gap-2">
        {[
          { val: hrs, label: "ঘণ্টা" },
          { val: mins, label: "মিনিট" },
          { val: secs, label: "সেকেন্ড" },
        ].map(({ val, label: lbl }, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="bg-white/20 rounded-lg w-10 h-10 flex items-center justify-center backdrop-blur-sm">
              <span className="text-lg font-bold font-mono leading-none">
                {toBengaliNum(String(val).padStart(2, "0"))}
              </span>
            </div>
            <span className="text-[8px] opacity-70 mt-0.5">{lbl}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AppIftarCountdown;
