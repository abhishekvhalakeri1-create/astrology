/**
 * Core astronomical engine.
 *
 * Tropical (sayan) positions come from Astronomy Engine (VSOP87 / ELP2000:
 * sub-arcsecond for the classical planets, ~1 arcsec for the Moon). Sidereal
 * (nirayana) longitudes = tropical − ayanamsa. The Ascendant is found by
 * numerically solving "altitude of the ecliptic point = 0, rising".
 *
 * Accuracy: well under an arcminute everywhere — far finer than any
 * birth-time uncertainty. Ascendant ≈ ±1'.
 */
import {
  Body,
  Ecliptic,
  GeoVector,
  Observer,
  ObserverVector,
  SiderealTime,
  SunPosition,
  Vector,
} from "astronomy-engine";

export const DEG = Math.PI / 180;
export const RAD = 180 / Math.PI;
const DAY = 86400000;

export const norm360 = (x: number) => ((x % 360) + 360) % 360;
export const sin = (d: number) => Math.sin(d * DEG);
export const cos = (d: number) => Math.cos(d * DEG);
/** atan2 in degrees, normalised to [0,360) */
export const atan2d = (y: number, x: number) => norm360(Math.atan2(y, x) * RAD);
/** shortest signed angular difference a-b, in (-180,180] */
export const angDiff = (a: number, b: number) => {
  let d = norm360(a - b);
  if (d > 180) d -= 360;
  return d;
};

/** Julian Day (UT) from milliseconds since 1970-01-01T00:00Z */
export const julianDay = (utcMs: number) => utcMs / DAY + 2440587.5;
/** Julian centuries since J2000.0 */
export const julianCenturies = (utcMs: number) => (julianDay(utcMs) - 2451545.0) / 36525;

/**
 * Nutation, IAU-1980 short form (dominant terms). Accurate to ~0.1″, which is
 * far below birth-time uncertainty but removes the systematic ≈±17″ wobble of
 * a mean-obliquity-only implementation.
 */
export function nutation(utcMs: number): { dPsi: number; dEps: number; meanObliq: number } {
  const T = julianCenturies(utcMs);
  const Ω = norm360(125.04452 - 1934.136261 * T + 0.0020708 * T * T + (T * T * T) / 450000);
  const Lsun = norm360(280.4665 + 36000.7698 * T);
  const Lmoon = norm360(218.3165 + 481267.8813 * T);
  const dPsi =
    (-17.20 * sin(Ω) - 1.32 * sin(2 * Lsun) - 0.23 * sin(2 * Lmoon) + 0.21 * sin(2 * Ω)) / 3600;
  const dEps =
    (9.2 * cos(Ω) + 0.57 * cos(2 * Lsun) + 0.1 * cos(2 * Lmoon) - 0.09 * cos(2 * Ω)) / 3600;
  return { dPsi, dEps, meanObliq: meanObliquity(utcMs) };
}

/** True obliquity of the ecliptic (mean + nutation in obliquity), degrees. */
export function obliquityOfDate(utcMs: number): number {
  const n = nutation(utcMs);
  return n.meanObliq + n.dEps;
}

/** Mean obliquity of the ecliptic (IAU-2006 series), degrees. */
export function meanObliquity(utcMs: number): number {
  const T = julianCenturies(utcMs);
  return 23.439291111 - 0.0130041667 * T - 1.6388889e-7 * T * T + 5.0361111e-7 * T * T * T;
}

/* ------------------------------------------------------------------ *
 * Local wall-clock time  <-->  UTC milliseconds, via the IANA database
 * ------------------------------------------------------------------ */

function offsetAt(tz: string, utcMs: number): number {
  try {
    const dtf = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const p: Record<string, number> = {};
    for (const part of dtf.formatToParts(new Date(utcMs))) {
      if (part.type !== "literal") p[part.type] = Number(part.value);
    }
    const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
    return asUtc - utcMs;
  } catch {
    return 0; // unknown zone → treat as UTC
  }
}

export function isValidZone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/** Wall-clock time in `tz` → UTC epoch ms (iterates to absorb DST transitions). */
export function zonedToUtcMs(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  tz: string,
): number {
  const wall = Date.UTC(year, month - 1, day, hour, minute, 0);
  let t = wall - offsetAt(tz, wall);
  t = wall - offsetAt(tz, t);
  t = wall - offsetAt(tz, t);
  return t;
}

/** UTC ms → the wall-clock pieces as seen in `tz`. */
export function utcMsToZoned(utcMs: number, tz: string) {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    weekday: "short",
  });
  const p: Record<string, string> = {};
  for (const part of dtf.formatToParts(new Date(utcMs))) p[part.type] = part.value;
  return {
    weekday: p.weekday,
    year: Number(p.year),
    month: Number(p.month),
    day: Number(p.day),
    hour: Number(p.hour),
    minute: Number(p.minute),
    label: `${p.day}/${p.month}/${p.year} ${p.hour}:${p.minute}`,
  };
}

/* ------------------------------------------------------------------ *
 * Ayanamsa (tropical → sidereal)
 * ------------------------------------------------------------------ */

export type AyanamsaId = "lahiri" | "kp";

const PRECESSION_DEG_PER_YEAR = 5028.796195 / 3600 / 100; // general precession in longitude
const AYANAMSA_BASE: Record<AyanamsaId, { at: number; value: number; note: string }> = {
  lahiri: {
    at: 2000,
    value: 23.853,
    note: "Lahiri (Chitrapaksha) — the ayanamsa used by Indian almanacs and by AstroSage-class software.",
  },
  kp: {
    at: 2000,
    value: 23.7528,
    note: "KP (Krishnamurti) — a fixed offset from Lahiri, for sub-lord style reading. Approximate.",
  },
};

export function ayanamsa(kind: AyanamsaId, utcMs: number): number {
  const cfg = AYANAMSA_BASE[kind] ?? AYANAMSA_BASE.lahiri;
  const years = (julianDay(utcMs) - 2451545.0) / 365.25;
  return norm360(cfg.value + PRECESSION_DEG_PER_YEAR * years);
}

export const AYANAMSA_NOTES = Object.fromEntries(
  (Object.keys(AYANAMSA_BASE) as AyanamsaId[]).map((k) => [k, AYANAMSA_BASE[k].note]),
) as Record<AyanamsaId, string>;

/* ------------------------------------------------------------------ *
 * Positions
 * ------------------------------------------------------------------ */

export interface GeoPoint {
  lat: number;
  lon: number;
  elev?: number;
}

export interface BodyPosition {
  /** tropical ecliptic longitude of date, degrees */
  trop: number;
  /** ecliptic latitude, degrees */
  plat: number;
  /** geocentric distance, AU */
  dist: number;
  /** motion in degrees/day (negative = retrograde) */
  speed: number;
  retro: boolean;
}

const BODIES: Record<string, Body> = {
  Su: Body.Sun,
  Mo: Body.Moon,
  Ma: Body.Mars,
  Me: Body.Mercury,
  Ju: Body.Jupiter,
  Ve: Body.Venus,
  Sa: Body.Saturn,
  Ur: Body.Uranus,
  Ne: Body.Neptune,
  Pl: Body.Pluto,
};

export const GRAHA_IDS = ["Su", "Mo", "Ma", "Me", "Ju", "Ve", "Sa", "Ra", "Ke"] as const;
export const OUTER_IDS = ["Ur", "Ne", "Pl"] as const;

function magnitude(v: { x: number; y: number; z: number }): number {
  return Math.hypot(v.x, v.y, v.z);
}

function rawEcliptic(
  body: Body,
  utcMs: number,
  topo?: GeoPoint,
): { lon: number; lat: number; dist: number } {
  const date = new Date(utcMs);
  if (body === Body.Sun && !topo) {
    const p = SunPosition(date); // apparent place (aberration + nutation included)
    return { lon: p.elon, lat: p.elat, dist: magnitude(p.vec) };
  }
  const v = GeoVector(body, date, true);
  if (!topo) {
    const e = Ecliptic(v);
    return { lon: e.elon, lat: e.elat, dist: magnitude(v) };
  }
  // both vectors are EQJ (J2000 mean equator), so the subtraction is legal
  const o = ObserverVector(date, new Observer(topo.lat, topo.lon, topo.elev ?? 0), false);
  const rel = new Vector(v.x - o.x, v.y - o.y, v.z - o.z, v.t);
  const e = Ecliptic(rel);
  return { lon: e.elon, lat: e.elat, dist: magnitude(rel) };
}

/**
 * Longitude + daily motion for one graha. Rahu/Ketu are the mean (Vakya)
 * lunar node — the convention used by most Jyotish software.
 */
export function bodyPosition(
  id: string,
  utcMs: number,
  opts: { topo?: GeoPoint; stepDays?: number } = {},
): BodyPosition {
  const step = opts.stepDays ?? (id === "Mo" ? 0.1 : 0.5);
  if (id === "Ra" || id === "Ke") {
    const sign = id === "Ke" ? 180 : 0;
    const node = meanNodeLongitude(utcMs) + sign;
    const back = meanNodeLongitude(utcMs - step * DAY) + sign;
    const speed = angDiff(node, back) / step;
    return { trop: norm360(node), plat: 0, dist: 0, speed, retro: true };
  }
  const body = BODIES[id];
  if (!body) throw new Error(`unknown body: ${id}`);
  const now = rawEcliptic(body, utcMs, opts.topo);
  const ahead = rawEcliptic(body, utcMs + step * DAY, opts.topo);
  const speed = angDiff(ahead.lon, now.lon) / step;
  return { trop: norm360(now.lon), plat: now.lat, dist: now.dist, speed, retro: speed < 0 };
}

/** Mean lunar ascending node (Rahu), tropical degrees of date. */
export function meanNodeLongitude(utcMs: number): number {
  const T = julianCenturies(utcMs);
  return norm360(
    125.0445479 -
      1934.1362891 * T +
      0.0020754 * T * T +
      (T * T * T) / 467441 -
      (T * T * T * T) / 60629000,
  );
}

/* ------------------------------------------------------------------ *
 * Ascendant / Midheaven / altitude algebra
 * ------------------------------------------------------------------ */

export function lstDegrees(utcMs: number, geoLon: number): number {
  return norm360(SiderealTime(new Date(utcMs)) * 15 + geoLon);
}

/** Equatorial coordinates (deg) of the ecliptic point at tropical longitude `lam`. */
function equatorialOf(lam: number, obl: number): { ra: number; dec: number } {
  const arg = Math.max(-1, Math.min(1, sin(obl) * sin(lam)));
  const dec = Math.asin(arg) * RAD;
  const ra = atan2d(sin(lam) * cos(obl), cos(lam));
  return { ra, dec };
}

/**
 * Altitude (deg) above the horizon of the ecliptic point `lam`, from latitude `lat`.
 * Points with longitude just *below* the Ascendant have already risen (alt > 0);
 * points just above it are still below the horizon — so the Ascendant is the
 * + → − zero crossing as longitude increases.
 */
function altitudeOf(lam: number, lat: number, lst: number, obl: number): number {
  const { ra, dec } = equatorialOf(lam, obl);
  const H = norm360(lst - ra);
  const arg = Math.max(-1, Math.min(1, sin(lat) * sin(dec) + cos(lat) * cos(dec) * cos(H)));
  return Math.asin(arg) * RAD;
}

/**
 * Ascendant — exact closed form.
 *
 * Solving "altitude of the ecliptic point = 0" for longitude gives
 *     tan λ = −cos φ · cos θ / ( sin φ · sin ε + cos φ · cos ε · sin θ )
 * with φ = latitude, ε = obliquity of date, θ = local (apparent) sidereal time.
 * The atan2 quadrant is then corrected so the returned point is the *rising*
 * crossing — the one where altitude falls as longitude increases. Closed form
 * (instead of a numeric horizon search) matters at high latitudes, where the
 * ecliptic meets the horizon so shallowly that a bracketed scan can lock onto
 * the wrong root.
 */
export function ascendant(utcMs: number, lat: number, geoLon: number): number | null {
  if (!Number.isFinite(lat) || Math.abs(lat) >= 89.5) return null;
  const θ = lstDegrees(utcMs, geoLon);
  const ε = obliquityOfDate(utcMs);
  const y = -cos(lat) * cos(θ);
  const x = sin(lat) * sin(ε) + cos(lat) * cos(ε) * sin(θ);
  if (y === 0 && x === 0) return null;
  let λ = atan2d(y, x);
  // keep the rising intersection
  const h = 0.25;
  const slope =
    altitudeOf(λ + h, lat, θ, ε) - altitudeOf(λ - h, lat, θ, ε);
  if (slope > 0) λ = norm360(λ + 180);
  return norm360(λ);
}

/** Midheaven: the ecliptic longitude culminating on the local meridian. */
export function midheaven(utcMs: number, geoLon: number): number {
  const lst = lstDegrees(utcMs, geoLon);
  const obl = obliquityOfDate(utcMs);
  return atan2d(sin(lst), cos(lst) * cos(obl));
}

/** Altitude (deg) of a tropical ecliptic longitude at a place/time (no refraction). */
export function altitudeOfEcliptic(tropLon: number, lat: number, utcMs: number, geoLon: number): number {
  const obl = obliquityOfDate(utcMs);
  const { ra, dec } = equatorialOf(tropLon, obl);
  return altitudeOfRaDec(ra, dec, lat, lstDegrees(utcMs, geoLon));
}

/**
 * d(altitude)/d(longitude) at a point on the horizon — the "angle at which the
 * ecliptic rises". Below ~0.2 the Lagna cusp becomes numerically ill-conditioned
 * (very high / very low latitudes near a solstice), which is worth reporting.
 */
export function eclipticHorizonSlope(tropLon: number, lat: number, utcMs: number, geoLon: number): number {
  const h = 0.05;
  return (
    (altitudeOfEcliptic(tropLon + h, lat, utcMs, geoLon) -
      altitudeOfEcliptic(tropLon - h, lat, utcMs, geoLon)) /
    (2 * h)
  );
}

/** Sidereal longitude of a tropical longitude (helper for reports). */
export const toSidereal = (trop: number, aya: number) => norm360(trop - aya);

/** Altitude of an arbitrary equatorial point, used by the muhurta helper. */
export function altitudeOfRaDec(ra: number, dec: number, lat: number, lst: number): number {
  const H = norm360(lst - ra);
  const arg = Math.max(-1, Math.min(1, sin(lat) * sin(dec) + cos(lat) * cos(dec) * cos(H)));
  return Math.asin(arg) * RAD;
}
