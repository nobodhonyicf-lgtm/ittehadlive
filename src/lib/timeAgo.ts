import { toBengali } from "./bengali";

export const timeAgo = (dateStr: string): string => {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  if (diffSec < 60) return "এইমাত্র";
  if (diffMin < 60) return `${toBengali(diffMin)} মিনিট আগে`;
  if (diffHour < 24) return `${toBengali(diffHour)} ঘণ্টা আগে`;
  if (diffDay < 30) return `${toBengali(diffDay)} দিন আগে`;
  if (diffMonth < 12) return `${toBengali(diffMonth)} মাস আগে`;
  return `${toBengali(diffYear)} বছর আগে`;
};
