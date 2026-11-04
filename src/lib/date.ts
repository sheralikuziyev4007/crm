const LOCALE = "en-US";

const dateFormat = new Intl.DateTimeFormat(LOCALE, { month: "short", day: "numeric", year: "numeric" });
const dateTimeFormat = new Intl.DateTimeFormat(LOCALE, {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});
const relativeFormat = new Intl.RelativeTimeFormat(LOCALE, { numeric: "auto" });

/** "Oct 12, 2026" */
export const formatDate = (timestamp: number): string => dateFormat.format(timestamp);

/** "Oct 12, 2026, 3:45 PM" */
export const formatDateTime = (timestamp: number): string => dateTimeFormat.format(timestamp);

/** ISO date for file names and <time dateTime>: "2026-10-12" */
export const isoDate = (timestamp: number): string => new Date(timestamp).toISOString().slice(0, 10);

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 3600],
  ["month", 30 * 24 * 3600],
  ["week", 7 * 24 * 3600],
  ["day", 24 * 3600],
  ["hour", 3600],
  ["minute", 60],
];

/** "3 days ago", "yesterday", "just now" */
export function formatRelative(timestamp: number, now = Date.now()): string {
  const seconds = Math.round((timestamp - now) / 1000);
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) return relativeFormat.format(Math.round(seconds / size), unit);
  }
  return "just now";
}
