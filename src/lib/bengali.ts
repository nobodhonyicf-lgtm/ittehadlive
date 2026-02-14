const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export const toBengali = (num: number | string): string => {
  return String(num).replace(/[0-9]/g, (d) => bengaliDigits[parseInt(d)]);
};
