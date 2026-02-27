/**
 * Convert a Gregorian date to approximate Hijri date in Bengali.
 * This is a simple algorithmic approximation — not astronomically precise.
 */
export function toHijriBengali(date: Date): string {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  const toBn = (n: number | string) => String(n).replace(/[0-9]/g, (d) => bengaliDigits[parseInt(d)]);

  const hijriMonths = [
    "মুহাররম", "সফর", "রবিউল আউয়াল", "রবিউস সানি",
    "জমাদিউল আউয়াল", "জমাদিউস সানি", "রজব", "শাবান",
    "রমজান", "শাওয়াল", "জিলক্বদ", "জিলহজ্জ"
  ];

  // Approximate Hijri conversion using the Kuwaiti algorithm
  const jd = gregorianToJD(date.getFullYear(), date.getMonth() + 1, date.getDate());
  const hijri = jdToHijri(jd);

  return `${toBn(hijri.day)} ${hijriMonths[hijri.month - 1]}, ${toBn(hijri.year)} হিজরি`;
}

function gregorianToJD(year: number, month: number, day: number): number {
  if (month <= 2) { year--; month += 12; }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + B - 1524.5;
}

function jdToHijri(jd: number): { year: number; month: number; day: number } {
  const l = Math.floor(jd) - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  const l2 = l - 10631 * n + 354;
  const j = Math.floor((10985 - l2) / 5316) * Math.floor((50 * l2) / 17719) + Math.floor(l2 / 5670) * Math.floor((43 * l2) / 15238);
  const l3 = l2 - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
  const month = Math.floor((24 * l3) / 709);
  const day = l3 - Math.floor((709 * month) / 24);
  const year = 30 * n + j - 30;
  return { year, month, day };
}
