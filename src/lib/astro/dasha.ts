/**
 * Vimshottari Daśā — the 120-year planetary period system of Parāśara.
 *
 * Lord sequence (fixed): Ketu 7 → Venus 20 → Sun 6 → Moon 10 → Mars 7 →
 * Rāhu 18 → Jupiter 16 → Saturn 19 → Mercury 17  (total = 120 years, which is
 * what "viṁśottarī" literally means). The natal Moon's nakṣatra lord starts the
 * first mahādāśa, reduced to the portion still to be elapsed.
 * Antardaśās divide their parent period in proportion to each lord's full
 * period over the 120-year cycle; pratyantara daśās do the same again.
 */
import {
  DASHA_ORDER,
  NAKSHATRA_SPAN,
  NAKSHATRAS,
  PLANET_BY_ID,
  type Graha,
} from "../../data/reference";
import { norm360 } from "./core";

const YEARS = 365.2425 * 86400000; // dasha year in ms
const TOTAL = 120;

export interface PdEntry {
  lord: Graha;
  start: number;
  end: number;
  years: number;
}
export interface AdEntry extends PdEntry {
  pratyantardashas: PdEntry[];
}
export interface MdEntry extends PdEntry {
  antardashas: AdEntry[];
  /** true when the first period is the truncated natal balance */
  isNatalBalance?: boolean;
}

export interface DashaResult {
  nakshatraIndex: number;
  nakshatraName: string;
  startLord: Graha;
  elapsedFraction: number;
  balanceYears: number;
  mahadashas: MdEntry[];
  current: { md: MdEntry; ad: AdEntry; pd: PdEntry } | null;
  nextMd: MdEntry | null;
}

const period = (g: Graha) => PLANET_BY_ID[g].dashaYears;

function subPeriods(lord: Graha, start: number, years: number): AdEntry[] {
  const first = DASHA_ORDER.indexOf(lord);
  let cursor = start;
  const entries: AdEntry[] = [];
  for (let k = 0; k < 9; k++) {
    const sub = DASHA_ORDER[(first + k) % 9];
    const len = (years * period(sub)) / TOTAL;
    const entry: AdEntry = {
      lord: sub,
      start: cursor,
      end: cursor + len * YEARS,
      years: len,
      pratyantardashas: [],
    };
    // third level (pratyantara) — one level deeper, same proportionality
    const pFirst = DASHA_ORDER.indexOf(sub);
    let pCursor = cursor;
    for (let j = 0; j < 9; j++) {
      const p = DASHA_ORDER[(pFirst + j) % 9];
      const pLen = (len * period(p)) / TOTAL;
      entry.pratyantardashas.push({ lord: p, start: pCursor, end: pCursor + pLen * YEARS, years: pLen });
      pCursor += pLen * YEARS;
    }
    cursor += len * YEARS;
    entries.push(entry);
  }
  return entries;
}

/** Full Vimshottari timeline for a birth moment and the Moon's sidereal longitude. */
export function vimshottari(moonSidereal: number, birthMs: number, horizonYears = 120): DashaResult {
  const nakIndex = Math.floor(norm360(moonSidereal) / NAKSHATRA_SPAN) % 27;
  const nak = NAKSHATRAS[nakIndex];
  const startLord = nak.lord;
  const elapsedFraction = (norm360(moonSidereal) - nakIndex * NAKSHATRA_SPAN) / NAKSHATRA_SPAN;
  const balanceYears = period(startLord) * (1 - elapsedFraction);

  const mahadashas: MdEntry[] = [];
  let cursor = birthMs;
  const firstIdx = DASHA_ORDER.indexOf(startLord);
  for (let k = 0; k < 9; k++) {
    const lord = DASHA_ORDER[(firstIdx + k) % 9];
    const years = k === 0 ? balanceYears : period(lord);
    mahadashas.push({
      lord,
      start: cursor,
      end: cursor + years * YEARS,
      years,
      isNatalBalance: k === 0,
      antardashas: subPeriods(lord, cursor, years),
    });
    cursor += years * YEARS;
    if (cursor > birthMs + horizonYears * YEARS) break;
  }

  const now = Date.now();
  const mdIndex = mahadashas.findIndex((m) => now >= m.start && now < m.end);
  const md = mdIndex >= 0 ? mahadashas[mdIndex] : null;
  const ad = md?.antardashas.find((a) => now >= a.start && now < a.end) ?? null;
  const pd = ad?.pratyantardashas.find((p) => now >= p.start && now < p.end) ?? null;

  return {
    nakshatraIndex: nakIndex,
    nakshatraName: nak.name,
    startLord,
    elapsedFraction,
    balanceYears,
    mahadashas,
    current: md && ad && pd ? { md, ad, pd } : null,
    nextMd: md ? (mahadashas[mdIndex + 1] ?? null) : null,
  };
}

export function dashaRange(start: number, end: number, tz = "UTC"): string {
  const f = (ms: number) =>
    new Intl.DateTimeFormat("en-GB", {
      timeZone: tz,
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(ms));
  return `${f(start)} — ${f(end)}`;
}

export function dashaProgress(md: MdEntry, now = Date.now()): number {
  return Math.max(0, Math.min(1, (now - md.start) / (md.end - md.start)));
}

/** Themes used when generating dasha text. */
export const DASHA_THEMES: Record<Graha, { positive: string; challenging: string; remedy: string }> = {
  Su: { positive: "recognition, authority, government favour, health, father's support", challenging: "ego clashes, heart/eye strain, burnout", remedy: "Surya Namaskar and Sunday water offering to the Sun" },
  Mo: { positive: "emotional support, public love, travel, mother, property", challenging: "mood swings, digestion, indecision", remedy: "Monday fast, silver/pearl charity, feeding women & children" },
  Ma: { positive: "courage, land & property, engineering, competition wins", challenging: "accidents, anger, litigation, sibling friction", remedy: "Hanuman Chalisa on Tuesday, blood donation, red-flag worship" },
  Me: { positive: "learning, communication, business growth, writing", challenging: "nervous anxiety, scattered focus, contract slips", remedy: "Wednesday Ganesha puja, green clothes, feeding green fodder to cows" },
  Ju: { positive: "children, wisdom, wealth, teaching, marriage alliances", challenging: "over-promising, guru disputes, weight and sugar", remedy: "Thursday Brihaspati puja, donate books and yellow items" },
  Ve: { positive: "love, marriage, arts, vehicles, comfort, fame", challenging: "luxury debt, relationship indulgence, kidneys", remedy: "Friday Lakshmi worship, respect women, donate white cloth" },
  Sa: { positive: "durable gains through labour, discipline, real estate, longevity", challenging: "delay, isolation, joints/teeth, job pressure", remedy: "Saturday oil lamp, service to workers, feed crows & the needy" },
  Ra: { positive: "sudden rise, foreign/tech gains, mass influence", challenging: "illusion, scams, anxiety, uncleared debts", remedy: "Rahu shanti japa, donate black blanket, discipline with alcohol" },
  Ke: { positive: "research, coding, spirituality, detachment that frees", challenging: "isolation, losses, unexplained obstacles, skin & allergies", remedy: "Ketu Ganesha worship, donate striped cloth, serve the forgotten" },
};
