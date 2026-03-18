import { toBengali } from "@/lib/bengali";

export interface ForbiddenPrayerTimeItem {
  id: string;
  label: string;
  timeText: string;
  note: string;
}

const parseTimeToMinutes = (time24: string): number => {
  const clean = time24.replace(/\s*\(.*\)/, "").trim();
  const [hours, minutes] = clean.split(":").map(Number);
  return hours * 60 + minutes;
};

const formatMinutesToBengaliTime = (totalMinutes: number): string => {
  const safeMinutes = ((totalMinutes % 1440) + 1440) % 1440;
  const hours24 = Math.floor(safeMinutes / 60);
  const minutes = safeMinutes % 60;
  const hours12 = hours24 % 12 || 12;
  const period = hours24 < 12 ? "পূর্বাহ্ণ" : "অপরাহ্ণ";
  return `${toBengali(hours12)}:${toBengali(String(minutes).padStart(2, "0"))} ${period}`;
};

const formatSingleTime = (time24: string): string => formatMinutesToBengaliTime(parseTimeToMinutes(time24));

const formatRange = (start24: string, end24: string): string => {
  const start = parseTimeToMinutes(start24);
  const end = parseTimeToMinutes(end24);
  return `${formatMinutesToBengaliTime(start)} - ${formatMinutesToBengaliTime(end)}`;
};

const offsetTime = (time24: string, minutesToAdd: number): string => {
  const nextMinutes = parseTimeToMinutes(time24) + minutesToAdd;
  const safeMinutes = ((nextMinutes % 1440) + 1440) % 1440;
  const hours = String(Math.floor(safeMinutes / 60)).padStart(2, "0");
  const minutes = String(safeMinutes % 60).padStart(2, "0");
  return `${hours}:${minutes}`;
};

export const buildForbiddenPrayerTimes = ({
  sunriseRaw,
  dhuhrRaw,
  sunsetRaw,
}: {
  sunriseRaw?: string;
  dhuhrRaw?: string;
  sunsetRaw?: string;
}): ForbiddenPrayerTimeItem[] => {
  if (!sunriseRaw || !dhuhrRaw || !sunsetRaw) return [];

  return [
    {
      id: "sunrise",
      label: "সূর্যোদয়",
      timeText: formatSingleTime(sunriseRaw),
      note: "সূর্য ওঠার মুহূর্ত",
    },
    {
      id: "sunrise-window",
      label: "সূর্যোদয়ের নিষিদ্ধ সময়",
      timeText: formatRange(sunriseRaw, offsetTime(sunriseRaw, 15)),
      note: "সূর্য পুরোপুরি উদিত হওয়া পর্যন্ত",
    },
    {
      id: "zawal-window",
      label: "দুপুরের নিষিদ্ধ সময়",
      timeText: formatRange(offsetTime(dhuhrRaw, -10), dhuhrRaw),
      note: "যোহরের আগে মধ্যদুপুরের সময়",
    },
    {
      id: "sunset",
      label: "সূর্যাস্ত",
      timeText: formatSingleTime(sunsetRaw),
      note: "মাগরিব শুরু হওয়ার মুহূর্ত",
    },
    {
      id: "sunset-window",
      label: "সূর্যাস্তের নিষিদ্ধ সময়",
      timeText: formatRange(offsetTime(sunsetRaw, -15), sunsetRaw),
      note: "সূর্য পুরোপুরি অস্ত যাওয়া পর্যন্ত",
    },
  ];
};
