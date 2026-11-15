/** Dates and clock times written out for the three interface languages. */
import { MONTH, MONTH_SHORT, pick, type Lang } from './names';
import { civilTimeIn, formatClock } from './time';

export interface YMD {
  year: number;
  month: number;
  day: number;
}

/** "15 June 1995" */
export function formatDate(lang: Lang, d: YMD): string {
  return `${d.day} ${pick(lang, MONTH)[d.month - 1]} ${d.year}`;
}

/** "15 Jun" — the month is abbreviated in English only; Hindi and Kannada month names are short already. */
export function formatDayMonth(lang: Lang, d: { month: number; day: number }): string {
  return `${d.day} ${lang === 'en' ? MONTH_SHORT[d.month - 1] : pick(lang, MONTH)[d.month - 1]}`;
}

/** "Jun 1995" */
export function formatMonthYear(lang: Lang, d: { year: number; month: number }): string {
  return `${lang === 'en' ? MONTH_SHORT[d.month - 1] : pick(lang, MONTH)[d.month - 1]} ${d.year}`;
}

/** The calendar date an instant falls on, on the clock of `timeZone`. */
export function dateOf(instant: Date | number, timeZone: string): YMD {
  const c = civilTimeIn(timeZone, instant);
  return { year: c.year, month: c.month, day: c.day };
}

export const sameDay = (a: YMD, b: YMD): boolean => a.year === b.year && a.month === b.month && a.day === b.day;

/**
 * A clock time for a panchanga table: "6:42 AM", with the date added when the moment falls on a different
 * calendar day from the one being shown ("2:14 AM, 16 Nov").
 */
export function clockOn(lang: Lang, instant: Date, timeZone: string, shown: YMD): string {
  // Round first, so a time shown as 12:00 AM is dated with the day it is displayed in.
  const rounded = new Date(instant.getTime() + 30000);
  const day = dateOf(rounded, timeZone);
  const clock = formatClock(instant, timeZone);
  return sameDay(day, shown) ? clock : `${clock}, ${formatDayMonth(lang, day)}`;
}

/** "8:30 AM" from a 24-hour clock reading. */
export function formatHourMinute(hour: number, minute: number): string {
  const h = hour % 12 === 0 ? 12 : hour % 12;
  return `${h}:${String(minute).padStart(2, '0')} ${hour < 12 ? 'AM' : 'PM'}`;
}
