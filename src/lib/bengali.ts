const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export const toBengali = (num: number | string): string => {
  return String(num).replace(/[0-9]/g, (d) => bengaliDigits[parseInt(d)]);
};

/** Format number with Indian-style commas (১,০০,০০০) and convert to Bengali */
export const toBengaliNumber = (num: number | string): string => {
  const n = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(n)) return toBengali(String(num));
  const formatted = n.toLocaleString('en-IN');
  return toBengali(formatted);
};
