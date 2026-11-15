/**
 * Sidereal (Lahiri) positions of the nine grahas and the lagna.
 *
 * Astronomy comes from `astronomy-engine` (MIT, VSOP87 / lunar theory). On top of it this file adds what
 * Jyotish needs: the Lahiri ayanamsa, the mean lunar node (Rahu/Ketu) and the ascendant.
 *
 * Checked against Swiss Ephemeris over 1900–2100 (see scripts/verify-astro.ts): the Sun, Moon and planets
 * agree to a few arc-seconds, which moves a nakshatra boundary by seconds of birth time, not minutes.
 */
import { Body, Ecliptic, GeoVector, MakeTime, SiderealTime, e_tilt, type AstroTime } from 'astronomy-engine';
import { angleDiff, norm360 } from './angle';
import { GRAHAS, type GrahaId } from './graha';

export { GRAHAS, angleDiff, norm360 };
export type { GrahaId };

const BODY: Record<Exclude<GrahaId, 'Rahu' | 'Ketu'>, Body> = {
  Sun: Body.Sun,
  Moon: Body.Moon,
  Mars: Body.Mars,
  Mercury: Body.Mercury,
  Jupiter: Body.Jupiter,
  Venus: Body.Venus,
  Saturn: Body.Saturn,
};

const DEG = Math.PI / 180;

/** Lahiri (Chitrapaksha) ayanamsa at J2000.0, in degrees. */
const LAHIRI_J2000 = 23.857092353708822;

/**
 * Mean Lahiri ayanamsa in degrees: its J2000 value plus the general precession in longitude
 * accumulated since then (IAU 2006 polynomial, arc-seconds per Julian century).
 */
export function lahiriAyanamsa(date: Date | AstroTime): number {
  const t = MakeTime(date);
  const T = t.tt / 36525;
  const precession =
    5028.796195 * T + 1.1054348 * T * T + 0.00007964 * T ** 3 - 0.000023857 * T ** 4 - 0.0000000383 * T ** 5;
  return LAHIRI_J2000 + precession / 3600;
}

/** Tropical longitude of the Moon's mean ascending node (Meeus, Astronomical Algorithms ch. 47), degrees. */
function meanNodeTropical(t: AstroTime): number {
  const T = t.tt / 36525;
  return norm360(125.0445479 - 1934.1362891 * T + 0.0020754 * T * T + (T * T * T) / 467441 - T ** 4 / 60616000);
}

/** Sidereal longitude (0–360°) of one graha. Rahu and Ketu use the mean node. */
export function siderealLongitude(graha: GrahaId, date: Date | AstroTime): number {
  const t = MakeTime(date);
  const ayanamsa = lahiriAyanamsa(t);
  if (graha === 'Rahu') return norm360(meanNodeTropical(t) - ayanamsa);
  if (graha === 'Ketu') return norm360(meanNodeTropical(t) - ayanamsa + 180);
  // Apparent geocentric longitude on the true ecliptic of date; removing nutation leaves the mean equinox of date,
  // which is the frame the ayanamsa is defined in.
  const apparent = Ecliptic(GeoVector(BODY[graha], t, true)).elon;
  const nutation = e_tilt(t).dpsi / 3600;
  return norm360(apparent - nutation - ayanamsa);
}

export interface GrahaState {
  /** Sidereal longitude, 0–360°. */
  lon: number;
  /** Motion in degrees per day; negative while retrograde. */
  speed: number;
  retrograde: boolean;
}

export function grahaStates(date: Date | AstroTime): Record<GrahaId, GrahaState> {
  const t = MakeTime(date);
  const before = t.AddDays(-1 / 24);
  const after = t.AddDays(1 / 24);
  const out = {} as Record<GrahaId, GrahaState>;
  for (const g of GRAHAS) {
    const lon = siderealLongitude(g, t);
    const speed = angleDiff(siderealLongitude(g, after), siderealLongitude(g, before)) * 12;
    out[g] = { lon, speed, retrograde: speed < 0 };
  }
  return out;
}

/**
 * Sidereal longitude of the ascendant (lagna) for a place.
 * @param latitude  degrees, north positive
 * @param longitude degrees, east positive
 */
export function ascendantLongitude(date: Date | AstroTime, latitude: number, longitude: number): number {
  const t = MakeTime(date);
  const tilt = e_tilt(t);
  const localSidereal = (SiderealTime(t) * 15 + longitude) * DEG; // apparent sidereal time at the place
  const obliquity = tilt.tobl * DEG;
  const phi = latitude * DEG;
  const tropical =
    Math.atan2(
      Math.cos(localSidereal),
      -(Math.sin(localSidereal) * Math.cos(obliquity) + Math.tan(phi) * Math.sin(obliquity)),
    ) / DEG;
  return norm360(tropical - tilt.dpsi / 3600 - lahiriAyanamsa(t));
}

/**
 * Finds when an angle that keeps increasing (a longitude, an elongation, a sum of longitudes) next reaches `target`.
 * @param f          the angle in degrees at a given time
 * @param target     the angle to reach, degrees
 * @param start      search begins here
 * @param ratePerDay typical rate of change in degrees per day, used for the first step
 */
export function nextCrossing(f: (t: AstroTime) => number, target: number, start: Date | AstroTime, ratePerDay: number): AstroTime {
  const t0 = MakeTime(start);
  let t = t0;
  let remaining = norm360(target - f(t));
  // A target that sits a hair behind the start (rounding) would otherwise send us a full circle ahead.
  if (remaining > 359.999) remaining -= 360;
  t = t.AddDays(remaining / ratePerDay);
  for (let i = 0; i < 12; i++) {
    const err = angleDiff(target, f(t));
    if (Math.abs(err) < 1e-7) break;
    const rate = angleDiff(f(t.AddDays(0.01)), f(t.AddDays(-0.01))) / 0.02;
    t = t.AddDays(err / (rate || ratePerDay));
  }
  return t;
}
