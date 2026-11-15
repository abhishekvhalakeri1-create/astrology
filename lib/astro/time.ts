/**
 * Clock time at a place ⇄ universal time.
 *
 * A birth time is a wall-clock reading at the place of birth. Converting it properly needs that place's
 * time-zone history: India ran an hour ahead during 1942–45, and births abroad may fall in daylight-saving
 * time. The browser's Intl database knows all of this, so we ask it instead of assuming a fixed offset.
 */

export interface CivilDateTime {
  year: number;
  /** 1–12 */
  month: number;
  day: number;
  /** 0–23 */
  hour: number;
  minute: number;
}

const formatters = new Map<string, Intl.DateTimeFormat>();

function partsFormatter(timeZone: string): Intl.DateTimeFormat {
  let f = formatters.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    });
    formatters.set(timeZone, f);
  }
  return f;
}

/** The wall-clock reading in `timeZone` at a given instant. */
export function civilTimeIn(timeZone: string, instant: Date | number): CivilDateTime & { second: number } {
  const parts: Record<string, string> = {};
  for (const p of partsFormatter(timeZone).formatToParts(new Date(instant))) parts[p.type] = p.value;
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour) % 24,
    minute: Number(parts.minute),
    second: Number(parts.second),
  };
}

/** Minutes that `timeZone` is ahead of UTC at a given instant (India: 330). */
export function offsetMinutes(timeZone: string, instant: Date | number): number {
  const ms = new Date(instant).getTime();
  const c = civilTimeIn(timeZone, ms);
  const asUtc = Date.UTC(c.year, c.month - 1, c.day, c.hour, c.minute, c.second);
  return (asUtc - Math.floor(ms / 1000) * 1000) / 60000;
}

/**
 * The instant at which clocks in `timeZone` showed the given reading.
 * `fallbackOffsetMinutes` is used only where the runtime does not know the zone.
 */
export function civilToInstant(c: CivilDateTime, timeZone: string, fallbackOffsetMinutes = 330): Date {
  const asUtc = Date.UTC(c.year, c.month - 1, c.day, c.hour, c.minute, 0);
  try {
    const first = asUtc - offsetMinutes(timeZone, asUtc) * 60000;
    // The offset at our first guess may differ from the offset at the answer when a clock change sits in between.
    const second = asUtc - offsetMinutes(timeZone, first) * 60000;
    return new Date(second);
  } catch {
    return new Date(asUtc - fallbackOffsetMinutes * 60000);
  }
}

/** "+05:30" */
export function formatOffset(minutes: number): string {
  const sign = minutes < 0 ? '−' : '+';
  const abs = Math.abs(Math.round(minutes));
  return `${sign}${String(Math.floor(abs / 60)).padStart(2, '0')}:${String(abs % 60).padStart(2, '0')}`;
}

/** "6:42 AM" on the clock of `timeZone`. */
export function formatClock(instant: Date | number, timeZone: string): string {
  // Adding half a minute before dropping the seconds rounds to the nearest minute, as a printed panchanga does.
  const rounded = civilTimeIn(timeZone, new Date(instant).getTime() + 30000);
  const h = rounded.hour % 12 === 0 ? 12 : rounded.hour % 12;
  return `${h}:${String(rounded.minute).padStart(2, '0')} ${rounded.hour < 12 ? 'AM' : 'PM'}`;
}

/** Today's calendar date on the clock of `timeZone`. */
export function todayIn(timeZone: string, now: Date | number = Date.now()): { year: number; month: number; day: number } {
  const c = civilTimeIn(timeZone, now);
  return { year: c.year, month: c.month, day: c.day };
}

/** Days in a calendar month (month 1–12). */
export const daysInMonth = (year: number, month: number): number => new Date(Date.UTC(year, month, 0)).getUTCDate();

/** Day of week (0 = Sunday) of a calendar date. */
export const weekdayOf = (year: number, month: number, day: number): number => new Date(Date.UTC(year, month - 1, day)).getUTCDay();
