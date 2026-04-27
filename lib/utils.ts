import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getGreeting(date: Date = new Date()) {
  const h = date.getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export function isoWeekRange(now: Date = new Date()): { start: Date; end: Date } {
  const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const day = d.getUTCDay() || 7;
  if (day !== 1) d.setUTCDate(d.getUTCDate() - (day - 1));
  d.setUTCHours(0, 0, 0, 0);
  const end = new Date(d);
  end.setUTCDate(end.getUTCDate() + 7);
  return { start: d, end };
}

export function initialFromEmail(email: string | null | undefined) {
  if (!email) return "?";
  return email.charAt(0).toUpperCase();
}
