import { useQuery } from "@tanstack/react-query";

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

// Convert 24h time string "HH:MM" to Bengali
const toBengaliTime = (time24: string): string => {
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  // Remove timezone info like " (BST)"
  const clean = time24.replace(/\s*\(.*\)/, "").trim();
  const [h, m] = clean.split(":").map(Number);
  const hour12 = h % 12 || 12;
  const period = h < 12 ? "পূর্বাহ্ণ" : "অপরাহ্ণ";
  const hStr = String(hour12).replace(/\d/g, d => bengaliDigits[+d]);
  const mStr = String(m).padStart(2, "0").replace(/\d/g, d => bengaliDigits[+d]);
  return `${hStr}:${mStr} ${period}`;
};

export interface PrayerApiTimes {
  sehri: string;   // Bengali formatted
  iftar: string;    // Bengali formatted
  sehriRaw: string; // raw HH:MM
  iftarRaw: string; // raw HH:MM
  hijriDate: string;
  loading: boolean;
  error: boolean;
  locationName: string;
}

const DEFAULT_LAT = 23.8103; // Dhaka
const DEFAULT_LNG = 90.4125;
const DEFAULT_CITY = "ঢাকা";

const fetchPrayerTimes = async (lat: number, lng: number): Promise<{
  sehri: string;
  iftar: string;
  sehriRaw: string;
  iftarRaw: string;
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
    sehriRaw: timings.Fajr.replace(/\s*\(.*\)/, "").trim(),
    iftarRaw: timings.Maghrib.replace(/\s*\(.*\)/, "").trim(),
    hijriDate: `${hijri.day} ${hijri.month.ar}, ${hijri.year}`,
  };
};

export const useAladhanPrayerTimes = () => {
  return useQuery({
    queryKey: ["aladhan_prayer_times"],
    queryFn: async () => {
      let lat = DEFAULT_LAT;
      let lng = DEFAULT_LNG;
      let city = DEFAULT_CITY;

      // Try to get user location
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 5000,
            maximumAge: 3600000, // cache 1 hour
          });
        });
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
        city = "আপনার অবস্থান";
      } catch {
        // Use Dhaka defaults
      }

      const times = await fetchPrayerTimes(lat, lng);
      return { ...times, locationName: city };
    },
    staleTime: 1000 * 60 * 30, // 30 min
    refetchOnWindowFocus: false,
  });
};
