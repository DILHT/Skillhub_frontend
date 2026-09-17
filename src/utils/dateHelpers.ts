// src/utils/dateHelpers.ts
import { format, parseISO, isValid } from "date-fns";

// Safely formats a date string. Returns a fallback instead of crashing
// when the string is empty or malformed (e.g. backend returned no date).
export function safeFormatDate(
  dateStr: string | undefined | null,
  formatStr: string = "EEEE, d MMMM yyyy",
  fallback: string = "Date not set",
): string {
  if (!dateStr) return fallback;
  try {
    const parsed = parseISO(dateStr);
    if (!isValid(parsed)) return fallback;
    return format(parsed, formatStr);
  } catch {
    return fallback;
  }
}

export function safeFormatTime(
  dateStr: string | undefined | null,
  formatStr: string = "h:mm a",
  fallback: string = "",
): string {
  if (!dateStr) return fallback;
  try {
    const parsed = parseISO(dateStr);
    if (!isValid(parsed)) return fallback;
    return format(parsed, formatStr);
  } catch {
    return fallback;
  }
}

// Validates a YYYY-MM-DD string is a real, logical, future date.
export function isValidFutureDate(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const parsed = parseISO(dateStr);
  if (!isValid(parsed)) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return parsed >= today;
}

// Validates a HH:mm string is a real time (00-23 : 00-59).
export function isValidTime(timeStr: string): boolean {
  const match = /^(\d{2}):(\d{2})$/.exec(timeStr);
  if (!match) return false;
  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
}
