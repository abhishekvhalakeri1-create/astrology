/**
 * Panchanga — the five limbs of the Vedic almanac, computed from real
 * ephemeris time-of-day crossings (tithi/nakshatra/yoga/karana boundaries),
 * plus sunrise-based day-parts (Rahu Kāla etc.) and planetary hours (horā).
 */
import { Body, Observer, SearchRiseSet } from "astronomy-engine";
import {
  HORA_CYCLE,
  KARANAS,
  NAKSHATRAS,
  NAKSHATRA_SPAN,
  PLANET_BY_ID,
  SIGNS,
  TITHIS,
  WEEKDAY_LORDS,
  YOGAS_PANCHANG,
  RAHU_KAAL_PART,
  YAMAGHANTA_PART,
  GULIKA_PART,
  type Graha,
} from "../../data/reference";
import {
  angDiff,
  ayanamsa,
  bodyPosition,
  norm360,
  utcMsToZoned,
  zonedToUtcMs,
  type AyanamsaId,
} from "./core";

const HOUR = 3600e3;
const DAY = 24 * HOUR;

const TITHI_SPAN = 12;
const YOGA_SPAN = NAKSHATRA_SPAN;
const KARANA_SPAN = 6;

export const MASA_NAMES = [
  "Vaishakha", "Jyeshtha", "Ashadha", "Shravana", "Bhadrapada", "Ashwina",
  "Kartika", "Margashirsha", "Pausha", "Magha", "Phalgun", "Chaitra",
];

export interface Boundary {
  start: number | null;
  end: number | null;
}

export interface Event<T> extends Boundary {
  value: T;
}

/** First time `raw` (monotonically increasing mod 360) passes `target` inside [lo,hi]. */
function crossingUp(raw: (ms: number) => number, target: number, lo: number, hi: number, step = 2 * HOUR): number | null {
  let tPrev = lo;
  let dPrev = angDiff(raw(lo), target);
  for (let t = lo + step; t <= hi; t += step) {
    const d = angDiff(raw(t), target);
    if (dPrev < 0 && d >= 0) {
      let a = tPrev;
      let b = t;
      for (let k = 0; k < 50; k++) {
        const m = (a + b) / 2;
        if (angDiff(raw(m), target) < 0) a = m;
        else b = m;
      }
      return (a + b) / 2;
    }
    tPrev = t;
    dPrev = d;
  }
  return null;
}

/** The last crossing at or before `t`, and the next crossing after `t`. */
function boundaries(raw: (ms: number) => number, target: number, t: number): Boundary {
  let start: number | null = null;
  let cursor = t - 4 * DAY;
  for (let guard = 0; guard < 12; guard++) {
    const hit = crossingUp(raw, target, cursor, t);
    if (hit === null) break;
    start = hit;
    cursor = hit + HOUR;
  }
  const end = crossingUp(raw, target, t, t + 4 * DAY);
  return { start, end };
}

export interface DayParts {
  label: string;
  start: number;
  end: number;
  note?: string;
}

export interface Hora {
  index: number;
  lord: Graha;
  start: number;
  end: number;
  isNight: boolean;
}

export interface Panchanga {
  place: { lat: number; lon: number; tz: string };
  dayLabel: string;
  weekday: string;
  sunrise: number | null;
  sunset: number | null;
  solarNoon: number | null;
  dayLengthMs: number | null;
  tithi: Event<{ index: number; name: string; number: number; paksha: "Shukla" | "Krishna"; sanskrit: string }>;
  nakshatra: Event<{ index: number; name: string; sanskrit: string; pada: number; lord: Graha; deity: string }>;
  yoga: Event<{ index: number; name: string; nature: "auspicious" | "neutral" | "inauspicious" }>;
  karana: Event<{ index: number; name: string }>;
  vara: string;
  varaLord: Graha;
  masa: string;
  paksha: "Shukla" | "Krishna";
  sunSign: number;
  moonSign: number;
  moonSiderealLon: number;
  dayParts: DayParts[];
  horas: Hora[];
  raw: { elongation: number; sunSid: number; moonSid: number; yogaSum: number };
}

const AUSPICIOUS_YOGAS = new Set([2, 3, 4, 6, 7, 10, 11, 15, 19, 20, 21, 22, 23, 24, 25]);
const INAUSPICIOUS_YOGAS = new Set([0, 5, 8, 9, 12, 13, 14, 16, 17, 18, 26]);

/**
 * Karana of a half-tithi slot (0..59). The 7 movable karanas run Bava…Vishti
 * through the first cycle and then continue as a 7-cycle (the 7th slot is
 * repeated at the wrap, which is why Vishti does not appear on every Chaturthi);
 * the 4 fixed karanas take the final slots of the dark half.
 * Calibrated against published Drik-style almanacs.
 */
export function karanaIndexOf(slot: number): number {
  const i = ((slot % 60) + 60) % 60;
  if (i <= 6) return i;
  if (i <= 55) return ((((i - 8) % 7) + 7) % 7);
  return 7 + (i - 56);
}

export function karanaName(index: number): string {
  return KARANAS[karanaIndexOf(index)] ?? "—";
}

export function panchangaAt(
  utcMs: number,
  geo: { lat: number; lon: number; tz: string; elev?: number },
  ayaKind: AyanamsaId = "lahiri",
): Panchanga {
  const sunLon = (ms: number) => norm360(bodyPosition("Su", ms).trop - ayanamsa(ayaKind, ms));
  const moonLon = (ms: number) => norm360(bodyPosition("Mo", ms).trop - ayanamsa(ayaKind, ms));
  const elong = (ms: number) => norm360(moonLon(ms) - sunLon(ms));
  const yogaSum = (ms: number) => norm360(moonLon(ms) + sunLon(ms));

  const sunSid = sunLon(utcMs);
  const moonSid = moonLon(utcMs);
  const elongation = norm360(moonSid - sunSid);

  const tIdx = Math.floor(elongation / TITHI_SPAN) % 30;
  const paksha: "Shukla" | "Krishna" = tIdx < 15 ? "Shukla" : "Krishna";
  const tNo = tIdx % 15;
  const tithiName = tNo === 14 ? (paksha === "Shukla" ? "Purnima" : "Amavasya") : TITHIS[tNo];
  const tithiSanskrit = tNo === 14 ? (paksha === "Shukla" ? "पूर्णिमा" : "अमावस्या") : TITHIS[tNo];

  const nakIdx = Math.floor(moonSid / NAKSHATRA_SPAN) % 27;
  const nak = NAKSHATRAS[nakIdx];
  const pada = Math.floor((moonSid % NAKSHATRA_SPAN) / (NAKSHATRA_SPAN / 4)) % 4;

  const yogIdx = Math.floor(yogaSum(utcMs) / YOGA_SPAN) % 27;
  const karIdx = Math.floor(elongation / KARANA_SPAN);

  // ---- local day, sunrise & sunset -------------------------------------------
  const zoned = utcMsToZoned(utcMs, geo.tz);
  const midnight = zonedToUtcMs(zoned.year, zoned.month, zoned.day, 0, 0, geo.tz);
  const obs = new Observer(geo.lat, geo.lon, geo.elev ?? 0);
  const findEvent = (dir: 1 | -1) => {
    // sunrises: search from local noon the day before, so an early-morning rise is found;
    // sunsets: search from local midnight, so we get *today's* sunset, not yesterday's.
    const from = dir === 1 ? midnight - 12 * HOUR : midnight;
    const hit = SearchRiseSet(Body.Sun, obs, dir, new Date(from), 2);
    if (!hit) return null;
    const at = utcMsToZoned(hit.date.getTime(), geo.tz);
    return at.day === zoned.day && at.month === zoned.month && at.year === zoned.year
      ? hit.date.getTime()
      : null;
  };
  const sunrise = findEvent(+1);
  const sunset = findEvent(-1);
  const dayLengthMs = sunrise !== null && sunset !== null ? sunset - sunrise : null;
  const solarNoon = dayLengthMs !== null && sunrise !== null ? sunrise + dayLengthMs / 2 : null;

  const weekdayIdx = (zoned.weekday === "Sun" ? 0
    : zoned.weekday === "Mon" ? 1
    : zoned.weekday === "Tue" ? 2
    : zoned.weekday === "Wed" ? 3
    : zoned.weekday === "Thu" ? 4
    : zoned.weekday === "Fri" ? 5
    : 6);
  const vara = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][weekdayIdx];
  const varaLord = WEEKDAY_LORDS[weekdayIdx];

  // ---- sunrise-anchored day parts -------------------------------------------
  const dayParts: DayParts[] = [];
  if (sunrise !== null && sunset !== null) {
    const part = (sunset - sunrise) / 8;
    const mk = (label: string, idx: number, note: string) => {
      const s = sunrise + part * idx;
      dayParts.push({ label, start: s, end: s + part, note });
    };
    mk("Rahu Kāla", RAHU_KAAL_PART[weekdayIdx], "Avoid new beginnings, travel and signings.");
    mk("Yamagaṇḍa", YAMAGHANTA_PART[weekdayIdx], "Unfavourable for journeys and important deals.");
    mk("Gulika Kāla", GULIKA_PART[weekdayIdx], "Postpone risky or confrontational acts.");
    if (solarNoon !== null) {
      dayParts.push({
        label: "Abhijit Muḥūrta",
        start: solarNoon - 24 * 60e3,
        end: solarNoon + 24 * 60e3,
        note: "Nakshatra-free window of the day — excellent for auspicious starts.",
      });
    }
  }

  // ---- horā (planetary hours) -----------------------------------------------
  const horas: Hora[] = [];
  if (sunrise !== null && sunset !== null && dayLengthMs !== null && dayLengthMs > 0) {
    const dayHora = dayLengthMs / 12;
    const nightHora = (DAY - dayLengthMs) / 12;
    const startIdx = WEEKDAY_LORDS.indexOf(varaLord);
    let t = sunrise;
    for (let h = 0; h < 24; h++) {
      const isNight = h >= 12;
      const len = isNight ? nightHora : dayHora;
      const lordIdx = (startIdx + h) % 7;
      const lord = HORA_CYCLE[lordIdx];
      horas.push({ index: h, lord, start: t, end: t + len, isNight });
      t += len;
    }
  }

  return {
    place: { lat: geo.lat, lon: geo.lon, tz: geo.tz },
    dayLabel: `${zoned.day}/${zoned.month}/${zoned.year}`,
    weekday: vara,
    sunrise,
    sunset,
    solarNoon,
    dayLengthMs,
    tithi: {
      value: { index: tIdx, name: tithiName, number: tNo + 1, paksha, sanskrit: tithiSanskrit },
      ...boundaries(elong, (Math.floor(elongation / TITHI_SPAN) % 30) * TITHI_SPAN, utcMs),
    },
    nakshatra: {
      value: { index: nakIdx, name: nak.name, sanskrit: nak.sanskrit, pada, lord: nak.lord, deity: nak.deity },
      ...boundaries(moonLon, nakIdx * NAKSHATRA_SPAN, utcMs),
    },
    yoga: {
      value: {
        index: yogIdx,
        name: YOGAS_PANCHANG[yogIdx] ?? "—",
        nature: AUSPICIOUS_YOGAS.has(yogIdx)
          ? "auspicious"
          : INAUSPICIOUS_YOGAS.has(yogIdx)
            ? "inauspicious"
            : "neutral",
      },
      ...boundaries(yogaSum, yogIdx * YOGA_SPAN, utcMs),
    },
    karana: {
      value: { index: karIdx, name: karanaName(karIdx) },
      ...boundaries(elong, karIdx * KARANA_SPAN, utcMs),
    },
    vara,
    varaLord,
    masa: MASA_NAMES[Math.floor(sunSid / 30) % 12] ?? SIGNS[Math.floor(sunSid / 30) % 12].name,
    paksha,
    sunSign: Math.floor(sunSid / 30) % 12,
    moonSign: Math.floor(moonSid / 30) % 12,
    moonSiderealLon: moonSid,
    dayParts,
    horas,
    raw: { elongation, sunSid, moonSid, yogaSum: yogaSum(utcMs) },
  };
}

export function horaOf(ms: number, horas: Hora[]): Hora | null {
  return horas.find((h) => ms >= h.start && ms < h.end) ?? null;
}

export function currentDayPart(ms: number, p: Panchanga): DayParts | null {
  return p.dayParts.find((d) => ms >= d.start && ms < d.end) ?? null;
}

export const planetOfHora = (h: Hora) => PLANET_BY_ID[h.lord];
