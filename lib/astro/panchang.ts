/**
 * Daily Panchanga for a place: the five limbs (tithi, vara, nakshatra, yoga, karana) with the clock time at
 * which each one ends, sunrise and sunset, the lunar month, and the day's Rahu Kala / Yamaganda / Gulika windows.
 *
 * The Hindu day runs from one sunrise to the next, so everything is laid out between those two moments.
 */
import { Body, Observer, SearchMoonPhase, SearchRiseSet, type AstroTime } from 'astronomy-engine';
import { nextCrossing, norm360, siderealLongitude } from './core';
import type { Place } from './kundli';
import { civilToInstant, weekdayOf } from './time';
import { NAKSHATRA_SPAN, zodiacPosition } from './zodiac';

export interface CivilDate {
  year: number;
  /** 1–12 */
  month: number;
  day: number;
}

/** One stretch of a tithi, nakshatra, yoga or karana. `end` is when it gives way to the next. */
export interface Span {
  index: number;
  end: Date;
}

export interface TimeWindow {
  start: Date;
  end: Date;
}

export interface LunarMonth {
  /** Month in the amanta reckoning (ends on the new moon) used in Karnataka, 0 = Chaitra. */
  amanta: number;
  /** Month in the purnimanta reckoning (ends on the full moon) used across North India. */
  purnimanta: number;
  /** An intercalary (adhika) month. */
  adhika: boolean;
}

export interface DayPanchang {
  date: CivilDate;
  place: Place;
  /** 0 = Sunday */
  weekday: number;
  sunrise: Date | null;
  sunset: Date | null;
  nextSunrise: Date | null;
  moonrise: Date | null;
  moonset: Date | null;
  /** Tithis running between sunrise and the next sunrise; index 0–29, 0 = Shukla Pratipada. */
  tithis: Span[];
  nakshatras: Span[];
  yogas: Span[];
  /** Karana name index into names.KARANA (0–10). */
  karanas: Span[];
  paksha: 'shukla' | 'krishna';
  masa: LunarMonth;
  sunRashi: number;
  moonRashi: number;
  rahuKala: TimeWindow | null;
  yamaganda: TimeWindow | null;
  gulika: TimeWindow | null;
  abhijit: TimeWindow | null;
}

const elongation = (t: Date | AstroTime): number => norm360(siderealLongitude('Moon', t) - siderealLongitude('Sun', t));
const moonLongitude = (t: Date | AstroTime): number => siderealLongitude('Moon', t);
const yogaAngle = (t: Date | AstroTime): number => norm360(siderealLongitude('Moon', t) + siderealLongitude('Sun', t));

/** Tithi index 0–29 at an instant (0 = Shukla Pratipada, 14 = Purnima, 29 = Amavasya). */
export const tithiAt = (t: Date): number => Math.min(29, Math.floor(elongation(t) / 12));
export const nakshatraAt = (t: Date): number => zodiacPosition(moonLongitude(t)).nakshatra;
export const yogaAt = (t: Date): number => Math.min(26, Math.floor(yogaAngle(t) / NAKSHATRA_SPAN));

/** Karana (index into names.KARANA) running at an instant. */
export const karanaAt = (t: Date): number => karanaName(Math.min(59, Math.floor(elongation(t) / 6)));

/** Karana name (index into names.KARANA) from the half-tithi number 0–59. */
export function karanaName(halfTithi: number): number {
  if (halfTithi === 0) return 10; // Kimstughna opens the month
  if (halfTithi >= 57) return halfTithi - 50; // Shakuni, Chatushpada, Naga close it
  return (halfTithi - 1) % 7;
}

/** Walks an ever-increasing angle from `start` to `until`, cutting it into equal steps. */
function spans(angle: (t: Date | AstroTime) => number, step: number, count: number, ratePerDay: number, start: Date, until: Date): Span[] {
  const out: Span[] = [];
  let cursor = start;
  // The tiny nudge keeps a boundary that falls exactly on the cursor from being counted twice.
  let index = Math.min(count - 1, Math.floor(norm360(angle(cursor) + 1e-9) / step));
  for (let guard = 0; guard < 8; guard++) {
    const end = nextCrossing(angle, ((index + 1) % count) * step, cursor, ratePerDay).date;
    out.push({ index, end });
    if (end.getTime() >= until.getTime()) break;
    cursor = new Date(end.getTime() + 1000);
    index = (index + 1) % count;
  }
  return out;
}

const RAHU_PART = [8, 2, 7, 5, 6, 4, 3];
const YAMA_PART = [5, 4, 3, 2, 1, 7, 6];
const GULIKA_PART = [7, 6, 5, 4, 3, 2, 1];

function eighth(sunrise: Date, sunset: Date, part: number): TimeWindow {
  const unit = (sunset.getTime() - sunrise.getTime()) / 8;
  return { start: new Date(sunrise.getTime() + (part - 1) * unit), end: new Date(sunrise.getTime() + part * unit) };
}

/** The lunar month containing an instant, named from the Sun's rashi at the new moons either side of it. */
export function lunarMonth(at: Date, tithi: number): LunarMonth {
  const DAY = 86400000;
  const first = SearchMoonPhase(0, new Date(at.getTime() - 30 * DAY), 31);
  let previous = first ? first.date : at;
  let next = SearchMoonPhase(0, new Date(previous.getTime() + DAY), 31)?.date ?? at;
  if (next.getTime() <= at.getTime()) {
    previous = next;
    next = SearchMoonPhase(0, new Date(previous.getTime() + DAY), 31)?.date ?? at;
  }
  const sunAtStart = zodiacPosition(siderealLongitude('Sun', previous)).rashi;
  const sunAtEnd = zodiacPosition(siderealLongitude('Sun', next)).rashi;
  const amanta = (sunAtStart + 1) % 12; // a month that begins with the Sun in Meena is Chaitra
  // When the Sun stays in one rashi across both new moons the month is adhika, and borrows the following month's name.
  const adhika = sunAtStart === sunAtEnd;
  return { amanta, purnimanta: tithi >= 15 ? (amanta + 1) % 12 : amanta, adhika };
}

export function dayPanchang(date: CivilDate, place: Place): DayPanchang {
  const observer = new Observer(place.lat, place.lon, 0);
  const midnight = civilToInstant({ ...date, hour: 0, minute: 0 }, place.tz);
  const sunrise = SearchRiseSet(Body.Sun, observer, +1, midnight, 1)?.date ?? null;
  const sunset = sunrise ? SearchRiseSet(Body.Sun, observer, -1, sunrise, 1)?.date ?? null : null;
  const nextSunrise = sunset ? SearchRiseSet(Body.Sun, observer, +1, sunset, 1)?.date ?? null : null;

  // Near the poles the Sun may not rise at all; fall back to the civil day so the page still has something to show.
  const dayStart = sunrise ?? new Date(midnight.getTime() + 6 * 3600000);
  const dayEnd = nextSunrise ?? new Date(dayStart.getTime() + 86400000);

  const moonrise = SearchRiseSet(Body.Moon, observer, +1, dayStart, 1)?.date ?? null;
  const moonset = SearchRiseSet(Body.Moon, observer, -1, dayStart, 1)?.date ?? null;

  const tithis = spans(elongation, 12, 30, 12.19, dayStart, dayEnd);
  const nakshatras = spans(moonLongitude, NAKSHATRA_SPAN, 27, 13.18, dayStart, dayEnd);
  const yogas = spans(yogaAngle, NAKSHATRA_SPAN, 27, 14.16, dayStart, dayEnd);
  const karanas = spans(elongation, 6, 60, 12.19, dayStart, dayEnd).map((s) => ({ index: karanaName(s.index), end: s.end }));

  const weekday = weekdayOf(date.year, date.month, date.day);
  const tithi = tithis[0].index;
  const hasDay = sunrise !== null && sunset !== null;
  const dayLength = hasDay ? sunset.getTime() - sunrise.getTime() : 0;

  return {
    date,
    place,
    weekday,
    sunrise,
    sunset,
    nextSunrise,
    moonrise,
    moonset,
    tithis,
    nakshatras,
    yogas,
    karanas,
    paksha: tithi < 15 ? 'shukla' : 'krishna',
    masa: lunarMonth(dayStart, tithi),
    sunRashi: zodiacPosition(siderealLongitude('Sun', dayStart)).rashi,
    moonRashi: zodiacPosition(siderealLongitude('Moon', dayStart)).rashi,
    rahuKala: hasDay ? eighth(sunrise, sunset, RAHU_PART[weekday]) : null,
    yamaganda: hasDay ? eighth(sunrise, sunset, YAMA_PART[weekday]) : null,
    gulika: hasDay ? eighth(sunrise, sunset, GULIKA_PART[weekday]) : null,
    // Abhijit is the eighth of the fifteen muhurtas of daylight — the one that straddles local noon.
    abhijit: hasDay
      ? { start: new Date(sunrise.getTime() + (dayLength * 7) / 15), end: new Date(sunrise.getTime() + (dayLength * 8) / 15) }
      : null,
  };
}
