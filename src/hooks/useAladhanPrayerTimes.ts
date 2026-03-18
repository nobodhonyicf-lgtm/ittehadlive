import { useQuery } from "@tanstack/react-query";
import { useSelectedDistrict } from "@/hooks/useLocationStore";

interface AladhanTimings {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  Imsak: string;
}

interface AladhanResponse {
  data: {
    timings: AladhanTimings;
    date: {
      hijri: {
        month: { en: string; ar: string };
        day: string;
        year: string;
      };
    };
    meta: {
      timezone: string;
    };
  };
}

const toBengaliTime = (time24: string): string => {
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  const clean = time24.replace(/\s*\(.*\)/, "").trim();
  const [h, m] = clean.split(":").map(Number);
  const hour12 = h % 12 || 12;
  const period = h < 12 ? "পূর্বাহ্ণ" : "অপরাহ্ণ";
  const hStr = String(hour12).replace(/\d/g, d => bengaliDigits[+d]);
  const mStr = String(m).padStart(2, "0").replace(/\d/g, d => bengaliDigits[+d]);
  return `${hStr}:${mStr} ${period}`;
};

export interface PrayerApiTimes {
  sehri: string;
  iftar: string;
  sunrise: string;
  dhuhr: string;
  sunset: string;
  sehriRaw: string;
  iftarRaw: string;
  sunriseRaw: string;
  dhuhrRaw: string;
  sunsetRaw: string;
  hijriDate: string;
  loading: boolean;
  error: boolean;
  locationName: string;
}

const cleanRawTime = (time: string) => time.replace(/\s*\(.*\)/, "").trim();

const fetchPrayerTimes = async (lat: number, lng: number): Promise<{
  sehri: string;
  iftar: string;
  sunrise: string;
  dhuhr: string;
  sunset: string;
  sehriRaw: string;
  iftarRaw: string;
  sunriseRaw: string;
  dhuhrRaw: string;
  sunsetRaw: string;
  hijriDate: string;
}> => {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const yyyy = today.getFullYear();

  const res = await fetch(
    `https://api.aladhan.com/v1/timings/${dd}-${mm}-${yyyy}?latitude=${lat}&longitude=${lng}&method=1&tune=0,0,0,0,0,0,0,0,0`
  );

  if (!res.ok) throw new Error("Aladhan API error");

  const json: AladhanResponse = await res.json();
  const timings = json.data.timings;
  const hijri = json.data.date.hijri;

  return {
    sehri: toBengaliTime(timings.Fajr),
    iftar: toBengaliTime(timings.Maghrib),
    sunrise: toBengaliTime(timings.Sunrise),
    dhuhr: toBengaliTime(timings.Dhuhr),
    sunset: toBengaliTime(timings.Maghrib),
    sehriRaw: cleanRawTime(timings.Fajr),
    iftarRaw: cleanRawTime(timings.Maghrib),
    sunriseRaw: cleanRawTime(timings.Sunrise),
    dhuhrRaw: cleanRawTime(timings.Dhuhr),
    sunsetRaw: cleanRawTime(timings.Maghrib),
    hijriDate: `${hijri.day} ${hijri.month.ar}, ${hijri.year}`,
  };
};

export const useAladhanPrayerTimes = () => {
  const [district] = useSelectedDistrict();

  return useQuery({
    queryKey: ["aladhan_prayer_times", district.name],
    queryFn: async () => {
      const times = await fetchPrayerTimes(district.lat, district.lng);
      return { ...times, locationName: district.name };
    },
    staleTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  });
};
