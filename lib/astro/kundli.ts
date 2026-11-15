/**
 * Janma Kundli: the birth chart, the Vimshottari dasha sequence and the three first-look dosha checks.
 * Houses are whole-sign houses counted from the lagna, the convention of both North and South Indian charts.
 */
import { GRAHAS, ascendantLongitude, grahaStates, lahiriAyanamsa, norm360, siderealLongitude, type GrahaId } from './core';
import { civilToInstant, offsetMinutes, type CivilDateTime } from './time';
import { DASHA_ORDER, DASHA_YEARS, dignity, houseFrom, nakshatraLord, zodiacPosition, type Dignity, type ZodiacPosition } from './zodiac';

export interface Place {
  name: string;
  /** State (India) or country. */
  region?: string;
  /** Degrees, north positive. */
  lat: number;
  /** Degrees, east positive. */
  lon: number;
  /** IANA time zone, e.g. "Asia/Kolkata". */
  tz: string;
}

export interface BirthDetails extends CivilDateTime {
  name: string;
  place: Place;
}

export interface GrahaPoint extends ZodiacPosition {
  id: GrahaId;
  /** Whole-sign house from the lagna, 1–12. */
  house: number;
  /** House counted from the Moon's rashi, 1–12. */
  houseFromMoon: number;
  retrograde: boolean;
  /** Degrees per day. */
  speed: number;
  dignity: Dignity;
}

export interface DashaPeriod {
  lord: GrahaId;
  start: Date;
  end: Date;
}

export interface MahaDasha extends DashaPeriod {
  antardashas: DashaPeriod[];
}

export interface ManglikResult {
  /** House Mars occupies from the lagna. */
  houseFromLagna: number;
  /** House Mars occupies from the Moon. */
  houseFromMoon: number;
  fromLagna: boolean;
  fromMoon: boolean;
}

export interface KaalSarpResult {
  present: boolean;
  /** House Rahu occupies from the lagna; it names the variety of the yoga. */
  rahuHouse: number;
}

export interface Kundli {
  birth: BirthDetails;
  /** The moment of birth in universal time. */
  instant: Date;
  /** Minutes the birthplace clock was ahead of UTC at that moment. */
  utcOffsetMinutes: number;
  ayanamsa: number;
  lagna: ZodiacPosition;
  grahas: Record<GrahaId, GrahaPoint>;
  dashas: MahaDasha[];
  manglik: ManglikResult;
  kaalSarp: KaalSarpResult;
}

const MS_PER_YEAR = 365.25 * 86400000;

/** Houses from which Mars is held to cause Mangal (Kuja) dosha: the 1st in northern practice, the 2nd in southern. */
export const MANGLIK_HOUSES: readonly number[] = [1, 2, 4, 7, 8, 12];

export function birthInstant(birth: BirthDetails): Date {
  return civilToInstant(birth, birth.place.tz);
}

/**
 * Vimshottari mahadashas with their antardashas. The Moon's nakshatra lord rules at birth; how far the Moon
 * has already travelled through that nakshatra decides how much of the first dasha is already spent.
 * The list covers a full 120-year cycle, so its first period usually begins before the birth itself.
 */
export function vimshottari(moonLongitude: number, birth: Date): MahaDasha[] {
  const moon = zodiacPosition(moonLongitude);
  const firstLord = nakshatraLord(moon.nakshatra);
  const firstIndex = DASHA_ORDER.indexOf(firstLord);
  let cursor = birth.getTime() - moon.nakshatraProgress * DASHA_YEARS[firstLord] * MS_PER_YEAR;
  const out: MahaDasha[] = [];
  for (let i = 0; i < 9; i++) {
    const lord = DASHA_ORDER[(firstIndex + i) % 9];
    const span = DASHA_YEARS[lord] * MS_PER_YEAR;
    const antardashas: DashaPeriod[] = [];
    let sub = cursor;
    for (let j = 0; j < 9; j++) {
      const subLord = DASHA_ORDER[(firstIndex + i + j) % 9];
      const subSpan = (span * DASHA_YEARS[subLord]) / 120;
      antardashas.push({ lord: subLord, start: new Date(sub), end: new Date(sub + subSpan) });
      sub += subSpan;
    }
    out.push({ lord, start: new Date(cursor), end: new Date(cursor + span), antardashas });
    cursor += span;
  }
  return out;
}

/** The mahadasha and antardasha running at a given moment. */
export function currentDasha(dashas: MahaDasha[], at: Date): { maha: MahaDasha; antar: DashaPeriod } | null {
  const ms = at.getTime();
  const maha = dashas.find((d) => ms >= d.start.getTime() && ms < d.end.getTime());
  if (!maha) return null;
  const antar = maha.antardashas.find((d) => ms >= d.start.getTime() && ms < d.end.getTime()) ?? maha.antardashas[0];
  return { maha, antar };
}

export function manglik(marsRashi: number, lagnaRashi: number, moonRashi: number): ManglikResult {
  const houseFromLagna = houseFrom(lagnaRashi, marsRashi);
  const houseFromMoon = houseFrom(moonRashi, marsRashi);
  return {
    houseFromLagna,
    houseFromMoon,
    fromLagna: MANGLIK_HOUSES.includes(houseFromLagna),
    fromMoon: MANGLIK_HOUSES.includes(houseFromMoon),
  };
}

/** Kaal Sarp: all seven visible grahas hemmed into the half of the zodiac between Rahu and Ketu. */
export function kaalSarp(longitudes: Record<GrahaId, number>, lagnaRashi: number): KaalSarpResult {
  const rahu = longitudes.Rahu;
  const seven: GrahaId[] = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
  const ahead = seven.filter((g) => norm360(longitudes[g] - rahu) < 180).length;
  return { present: ahead === 0 || ahead === 7, rahuHouse: houseFrom(lagnaRashi, zodiacPosition(rahu).rashi) };
}

export function computeKundli(birth: BirthDetails): Kundli {
  const instant = birthInstant(birth);
  const states = grahaStates(instant);
  const lagna = zodiacPosition(ascendantLongitude(instant, birth.place.lat, birth.place.lon));
  const moonRashi = zodiacPosition(states.Moon.lon).rashi;

  const grahas = {} as Record<GrahaId, GrahaPoint>;
  const longitudes = {} as Record<GrahaId, number>;
  for (const id of GRAHAS) {
    const pos = zodiacPosition(states[id].lon);
    longitudes[id] = pos.lon;
    grahas[id] = {
      ...pos,
      id,
      house: houseFrom(lagna.rashi, pos.rashi),
      houseFromMoon: houseFrom(moonRashi, pos.rashi),
      // The mean nodes always move backwards; marking them "retrograde" would only add noise.
      retrograde: id !== 'Rahu' && id !== 'Ketu' && states[id].retrograde,
      speed: states[id].speed,
      dignity: dignity(id, pos.rashi),
    };
  }

  let utcOffsetMinutes = 330;
  try {
    utcOffsetMinutes = offsetMinutes(birth.place.tz, instant);
  } catch {
    /* unknown zone: civilToInstant already fell back to IST */
  }

  return {
    birth,
    instant,
    utcOffsetMinutes,
    ayanamsa: lahiriAyanamsa(instant),
    lagna,
    grahas,
    dashas: vimshottari(grahas.Moon.lon, instant),
    manglik: manglik(grahas.Mars.rashi, lagna.rashi, moonRashi),
    kaalSarp: kaalSarp(longitudes, lagna.rashi),
  };
}

/* ---------- Sade Sati ---------- */

export type SadeSatiPhase = 'rising' | 'peak' | 'setting';

export interface SadeSatiStatus {
  saturnRashi: number;
  /** House Saturn is transiting, counted from the natal Moon. */
  houseFromMoon: number;
  /** Set while Saturn is in the 12th, 1st or 2nd from the Moon. */
  phase: SadeSatiPhase | null;
  /** Saturn in the 4th or 8th from the Moon — the shorter "dhaiya". */
  dhaiya: boolean;
}

export function sadeSatiStatus(moonRashi: number, at: Date): SadeSatiStatus {
  const saturnRashi = zodiacPosition(siderealLongitude('Saturn', at)).rashi;
  const house = houseFrom(moonRashi, saturnRashi);
  const phase: SadeSatiPhase | null = house === 12 ? 'rising' : house === 1 ? 'peak' : house === 2 ? 'setting' : null;
  return { saturnRashi, houseFromMoon: house, phase, dhaiya: house === 4 || house === 8 };
}

export interface SadeSatiCycle {
  /** Saturn first enters the 12th from the Moon. */
  start: Date;
  /** Saturn first enters the Moon's own rashi. */
  peakStart: Date | null;
  /** Saturn first enters the 2nd from the Moon. */
  settingStart: Date | null;
  /** Saturn finally leaves the 2nd from the Moon. */
  end: Date;
}

/**
 * Every Sade Sati between two dates. Saturn often steps back across a sign boundary while retrograde;
 * each phase is dated from Saturn's first entry and the cycle ends at its final exit.
 */
export function sadeSatiCycles(moonRashi: number, from: Date, to: Date): SadeSatiCycle[] {
  const DAY = 86400000;
  const STEP = 10 * DAY;
  const rashiAt = (ms: number) => zodiacPosition(siderealLongitude('Saturn', new Date(ms))).rashi;
  const inSadeSati = (rashi: number) => {
    const h = houseFrom(moonRashi, rashi);
    return h === 12 || h === 1 || h === 2;
  };
  /** Narrows a sign change that happened between two samples down to the hour. */
  const refine = (lo: number, hi: number, before: number) => {
    while (hi - lo > 3600000) {
      const mid = (lo + hi) / 2;
      if (rashiAt(mid) === before) lo = mid;
      else hi = mid;
    }
    return hi;
  };

  // Saturn stays about two and a half years in a sign, so a retrograde dip back out never lasts a year.
  const GAP = 400 * DAY;
  const cycles: SadeSatiCycle[] = [];
  let open: SadeSatiCycle | null = null;
  let leftAt: number | null = null;
  // A cycle lasts about seven and a half years. Scanning a decade either side of the window means every cycle
  // that touches the window is seen from its true first day to its true last day.
  const MARGIN = 10 * 365 * DAY;
  let prevMs = from.getTime() - MARGIN;
  let prev = rashiAt(prevMs);
  const stop = to.getTime() + MARGIN;
  if (inSadeSati(prev)) open = { start: new Date(prevMs), peakStart: null, settingStart: null, end: new Date(prevMs) };

  for (let ms = prevMs + STEP; ms <= stop; ms += STEP) {
    const now = rashiAt(ms);
    if (now !== prev) {
      const changeAt = refine(ms - STEP, ms, prev);
      const house = houseFrom(moonRashi, now);
      if (inSadeSati(now)) {
        if (!open) open = { start: new Date(changeAt), peakStart: null, settingStart: null, end: new Date(changeAt) };
        leftAt = null;
        if (house === 1 && !open.peakStart) open.peakStart = new Date(changeAt);
        if (house === 2 && !open.settingStart) open.settingStart = new Date(changeAt);
      } else if (open) {
        leftAt = changeAt;
        open.end = new Date(changeAt);
      }
      prev = now;
    }
    if (open && leftAt !== null && ms - leftAt > GAP) {
      cycles.push(open);
      open = null;
      leftAt = null;
    }
    prevMs = ms;
  }
  if (open) {
    if (leftAt === null) open.end = new Date(stop);
    cycles.push(open);
  }
  return cycles.filter((c) => c.end.getTime() >= from.getTime() && c.start.getTime() <= to.getTime());
}
