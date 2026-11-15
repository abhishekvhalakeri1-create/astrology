/**
 * Gochar — reading the current sky from a Moon sign.
 *
 * The rashi-phala on this site is not written copy: it is the classical transit rule applied to where the
 * grahas actually are. For each graha the tradition lists the houses, counted from the natal Moon, through which
 * its passage is favourable (Phaladeepika ch. 26). Everything else is treated as a period that asks for care.
 */
import { GRAHAS, grahaStates, nextCrossing, siderealLongitude, type GrahaId } from './core';
import { FAVOURABLE_HOUSES, houseFrom, zodiacPosition } from './zodiac';

export { FAVOURABLE_HOUSES };

export interface Transit {
  graha: GrahaId;
  rashi: number;
  /** Degrees inside the rashi. */
  degree: number;
  nakshatra: number;
  retrograde: boolean;
}

export function transitsAt(at: Date): Record<GrahaId, Transit> {
  const states = grahaStates(at);
  const out = {} as Record<GrahaId, Transit>;
  for (const graha of GRAHAS) {
    const pos = zodiacPosition(states[graha].lon);
    out[graha] = {
      graha,
      rashi: pos.rashi,
      degree: pos.degree,
      nakshatra: pos.nakshatra,
      retrograde: graha !== 'Rahu' && graha !== 'Ketu' && states[graha].retrograde,
    };
  }
  return out;
}

export interface GocharReading {
  graha: GrahaId;
  /** House the graha is passing through, counted from the Moon sign. */
  house: number;
  favourable: boolean;
}

export function gochar(moonRashi: number, transits: Record<GrahaId, Transit>, grahas: readonly GrahaId[] = GRAHAS): GocharReading[] {
  return grahas.map((graha) => {
    const house = houseFrom(moonRashi, transits[graha].rashi);
    return { graha, house, favourable: FAVOURABLE_HOUSES[graha].includes(house) };
  });
}

export interface MoonStay {
  rashi: number;
  /** When the Moon entered this rashi (or the start of the window, for the first entry). */
  start: Date;
  /** When it leaves for the next. */
  end: Date;
}

/** The Moon's passage through the rashis over the coming days — it changes sign roughly every 2¼ days. */
export function moonStays(from: Date, days: number): MoonStay[] {
  const until = from.getTime() + days * 86400000;
  const out: MoonStay[] = [];
  let cursor = from;
  let rashi = zodiacPosition(siderealLongitude('Moon', cursor)).rashi;
  for (let guard = 0; guard < 40 && cursor.getTime() < until; guard++) {
    const end = nextCrossing((t) => siderealLongitude('Moon', t), ((rashi + 1) % 12) * 30, cursor, 13.18).date;
    out.push({ rashi, start: cursor, end });
    cursor = new Date(end.getTime() + 1000);
    rashi = (rashi + 1) % 12;
  }
  return out;
}

/** When a slow graha next changes rashi (in either direction), searched day by day. Null if not within `maxDays`. */
export function nextRashiChange(graha: GrahaId, from: Date, maxDays = 1200): { at: Date; rashi: number } | null {
  const DAY = 86400000;
  const rashiAt = (ms: number) => zodiacPosition(siderealLongitude(graha, new Date(ms))).rashi;
  const current = rashiAt(from.getTime());
  const step = graha === 'Saturn' || graha === 'Jupiter' || graha === 'Rahu' || graha === 'Ketu' ? 5 * DAY : DAY;
  for (let ms = from.getTime() + step; ms <= from.getTime() + maxDays * DAY; ms += step) {
    if (rashiAt(ms) !== current) {
      let lo = ms - step;
      let hi = ms;
      while (hi - lo > 60000) {
        const mid = (lo + hi) / 2;
        if (rashiAt(mid) === current) lo = mid;
        else hi = mid;
      }
      return { at: new Date(hi), rashi: rashiAt(hi) };
    }
  }
  return null;
}
