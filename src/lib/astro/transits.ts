/**
 * Transit engine — live graha positions, Sadhe Sati windows and the
 * sign-level (rāśi) horoscope generator used by the Rashifal page.
 */
import { NAKSHATRAS, PLANET_BY_ID, SIGNS, SPECIAL_ASPECTS, type Graha } from "../../data/reference";
import { ayanamsa, bodyPosition, norm360, type AyanamsaId } from "./core";

const DAY = 86400000;
const cache = new Map<string, number>();

export function siderealAt(id: string, ms: number, ayaKind: AyanamsaId = "lahiri"): number {
  const key = `${id}|${Math.round(ms / 60000)}|${ayaKind}`;
  const hit = cache.get(key);
  if (hit !== undefined) return hit;
  const v = norm360(bodyPosition(id, ms).trop - ayanamsa(ayaKind, ms));
  cache.set(key, v);
  return v;
}

export const signAt = (id: string, ms: number, ayaKind?: AyanamsaId) =>
  Math.floor(siderealAt(id, ms, ayaKind) / 30) % 12;

/** Find the moment `id` first enters `targetSign` after `fromMs` (bisection on a daily scan). */
export function findSignEntry(
  id: string,
  targetSign: number,
  fromMs: number,
  maxDays = 3600,
  ayaKind: AyanamsaId = "lahiri",
): number | null {
  const boundary = targetSign * 30;
  let prev = norm360(siderealAt(id, fromMs, ayaKind) - boundary);
  for (let d = 1; d <= maxDays; d++) {
    const t = fromMs + d * DAY;
    const cur = norm360(siderealAt(id, t, ayaKind) - boundary);
    if (prev > 180 && cur <= 180 && cur < prev) {
      let a = t - DAY;
      let b = t;
      for (let k = 0; k < 40; k++) {
        const m = (a + b) / 2;
        const v = norm360(siderealAt(id, m, ayaKind) - boundary);
        if (v > 180) a = m;
        else b = m;
      }
      return (a + b) / 2;
    }
    prev = cur;
  }
  return null;
}

/** Sequence of upcoming sign entries for a slow graha (used for forecast tables). */
export function upcomingTransits(
  id: string,
  fromMs: number,
  count = 5,
  ayaKind: AyanamsaId = "lahiri",
): { sign: number; at: number }[] {
  const out: { sign: number; at: number }[] = [];
  let cursor = fromMs;
  for (let i = 0; i < count; i++) {
    const current = signAt(id, cursor, ayaKind);
    const nextSign = (current + 1) % 12;
    const at = findSignEntry(id, nextSign, cursor + DAY, 4200, ayaKind);
    if (at === null) break;
    out.push({ sign: nextSign, at });
    cursor = at;
  }
  return out;
}

export type SadeSatiPhase =
  | "none"
  | "rising"
  | "peak"
  | "setting"
  | "dhaiya-rising"
  | "dhaiya-setting";

export interface SadeSatiStatus {
  phase: SadeSatiPhase;
  title: string;
  description: string;
  saturnSign: number;
  houseFromMoon: number;
  progress: number;
  windows: { label: string; start: number; end: number }[];
  nextShift: number | null;
  active: boolean;
}

const PHASE_TEXT: Record<SadeSatiPhase, { title: string; description: string }> = {
  none: {
    title: "Outside Sadhe Satī",
    description:
      "Saturn is not transiting the 12th, 1st or 2nd from your Moon sign right now. Ordinary effort returns ordinary results — a good window to build.",
  },
  rising: {
    title: "Sadhe Satī — rising (12th from Moon)",
    description:
      "Saturn approached your Moon sign through the 12th: expenses, sleep, foreign or hidden matters rise. Reduce commitments, protect rest, finish old obligations.",
  },
  peak: {
    title: "Sadhe Satī — peak (over the Moon)",
    description:
      "Saturn sits on your Moon sign: the mind is tested with weight and time. Discipline, routine, service and honesty are the only shortcuts. Health of bones/teeth and emotional resilience need care.",
  },
  setting: {
    title: "Sadhe Satī — setting (2nd from Moon)",
    description:
      "Saturn leaves across your 2nd: family, speech and money are sorted out. Debts shrink, but the urge to withdraw is strongest now — keep speaking up.",
  },
  "dhaiya-rising": {
    title: "Ḍhaiyā (3rd from Moon)",
    description:
      "Half-Sade-Sati over the 3rd: effort, siblings and short travel get a grind-and-grow flavour. Small consistent actions beat big plans.",
  },
  "dhaiya-setting": {
    title: "Ḍhaiyā (10th from Moon)",
    description:
      "Half-Sade-Sati over the 10th: career pressure, bosses and public duty intensify. Reputation is built by not cutting corners.",
  },
};

/** Sadhe Satī status for a Moon sign at a moment, with the surrounding windows. */
export function sadeSati(moonSign: number, atMs: number, ayaKind: AyanamsaId = "lahiri"): SadeSatiStatus {
  const sat = siderealAt("Sa", atMs, ayaKind);
  const saturnSign = Math.floor(sat / 30) % 12;
  const house = ((saturnSign - moonSign + 12) % 12) + 1;
  let phase: SadeSatiPhase = "none";
  if (house === 12) phase = "rising";
  else if (house === 1) phase = "peak";
  else if (house === 2) phase = "setting";
  else if (house === 3) phase = "dhaiya-rising";
  else if (house === 10) phase = "dhaiya-setting";

  const progress = (sat % 30) / 30;

  // Build the window list: sign-entry times around the affected zone.
  const zones = [12, 1, 2].map((h) => (moonSign + h - 1 + 12) % 12);
  const windows: { label: string; start: number; end: number }[] = [];
  const labels = ["Rising phase (12th)", "Peak phase (1st)", "Setting phase (2nd)"];
  const searchStart = atMs - 4 * 365.25 * DAY;
  for (let i = 0; i < 3; i++) {
    const start = findSignEntry("Sa", zones[i], searchStart, 2200, ayaKind);
    const end = findSignEntry("Sa", (zones[i] + 1) % 12, searchStart, 2200, ayaKind);
    if (start !== null && end !== null && end > start) {
      windows.push({ label: labels[i], start, end });
    }
  }
  windows.sort((a, b) => a.start - b.start);

  const nextShift =
    findSignEntry("Sa", (saturnSign + 1) % 12, atMs, 900, ayaKind) ?? null;

  const t = PHASE_TEXT[phase];
  return {
    phase,
    title: t.title,
    description: t.description,
    saturnSign,
    houseFromMoon: house,
    progress,
    windows,
    nextShift,
    active: phase !== "none",
  };
}

/* ------------------------------------------------------------------ *
 * Rāśi (sign) horoscope generator
 * ------------------------------------------------------------------ */

export interface DomainScore {
  key: "love" | "career" | "money" | "health" | "travel" | "study";
  label: string;
  score: number; // 0..100
  stars: number; // 1..5
  note: string;
}

export interface TransitRow {
  id: Graha;
  name: string;
  sign: number;
  house: number;
  retro: boolean;
  aspectingNative: boolean;
  tone: "benefic" | "malefic" | "neutral";
}

const BENEFICS = new Set<Graha>(["Ju", "Ve", "Me", "Mo"]);
const MALEFICS = new Set<Graha>(["Ma", "Sa", "Ra", "Ke", "Su"]);

const DOMAINS: { key: DomainScore["key"]; label: string; houses: number[] }[] = [
  { key: "love", label: "Love & marriage", houses: [7, 5, 11] },
  { key: "career", label: "Career & work", houses: [10, 6, 1] },
  { key: "money", label: "Money & gains", houses: [2, 11, 6] },
  { key: "health", label: "Health & energy", houses: [1, 6, 8] },
  { key: "travel", label: "Travel & moves", houses: [3, 9, 12] },
  { key: "study", label: "Study & skills", houses: [4, 5, 9] },
];

export interface HoroscopeResult {
  sign: number;
  signName: string;
  periodLabel: string;
  overall: number;
  domains: DomainScore[];
  transits: TransitRow[];
  headline: string;
  narrative: string[];
  lucky: { colour: string; number: number; day: string; gem: string };
  sadeSati: SadeSatiStatus;
  remedies: string[];
}

/** grahas that currently aspect a given sign (drishti or conjunction). */
function aspectingGrahas(targetSign: number, atMs: number, ayaKind: AyanamsaId): Graha[] {
  const out: Graha[] = [];
  for (const id of ["Su", "Mo", "Ma", "Me", "Ju", "Ve", "Sa", "Ra", "Ke"] as Graha[]) {
    const s = signAt(id, atMs, ayaKind);
    if (s === targetSign) {
      out.push(id);
      continue;
    }
    const delta = ((targetSign - s + 12) % 12) + 1;
    if (SPECIAL_ASPECTS[id].includes(delta)) out.push(id);
  }
  return out;
}

export function horoscopeFor(
  sign: number,
  atMs: number,
  periodLabel: string,
  opts: { ayanamsa?: AyanamsaId; themes?: Record<number, { love: string; career: string; money: string; health: string }> } = {},
): HoroscopeResult {
  const ayaKind = opts.ayanamsa ?? "lahiri";
  const transits: TransitRow[] = (
    ["Su", "Mo", "Ma", "Me", "Ju", "Ve", "Sa", "Ra", "Ke"] as Graha[]
  ).map((id) => {
    const s = signAt(id, atMs, ayaKind);
    const house = ((s - sign + 12) % 12) + 1;
    const pos = bodyPosition(id, atMs);
    const aspectingNative =
      s === sign || SPECIAL_ASPECTS[id].includes(((sign - s + 12) % 12) + 1);
    const dignity = id === "Ra" || id === "Ke" ? "neutral" : PLANET_BY_ID[id].exaltSign === s ? "benefic" : PLANET_BY_ID[id].debilitSign === s ? "neutral" : BENEFICS.has(id) ? "benefic" : MALEFICS.has(id) ? "malefic" : "neutral";
    return {
      id,
      name: PLANET_BY_ID[id].name,
      sign: s,
      house,
      retro: pos.retro,
      aspectingNative,
      tone: PLANET_BY_ID[id].exaltSign === s ? "benefic" : dignity,
    };
  });

  const domains: DomainScore[] = DOMAINS.map((d) => {
    let score = 52;
    const notes: string[] = [];
    for (const h of d.houses) {
      const occupants = transits.filter((t) => t.house === h);
      for (const o of occupants) {
        if (BENEFICS.has(o.id)) {
          score += h === d.houses[0] ? 14 : 8;
          notes.push(`${o.name} in your ${ordinal(h)}`);
        } else if (MALEFICS.has(o.id)) {
          score -= h === d.houses[0] ? 11 : 6;
          notes.push(`${o.name}${o.retro ? " (retrograde)" : ""} pressing your ${ordinal(h)}`);
        }
      }
      const aspects = aspectingGrahas((sign + h - 1) % 12, atMs, ayaKind).filter(
        (g) => g !== "Mo",
      );
      for (const a of aspects) {
        if (BENEFICS.has(a)) score += 5;
        else score -= 4;
      }
    }
    const ss = sadeSati(sign, atMs, ayaKind);
    if (ss.active && d.key === "career") score -= 8;
    if (ss.active && d.key === "health") score -= 6;
    score = Math.max(12, Math.min(96, Math.round(score)));
    const stars = score >= 82 ? 5 : score >= 70 ? 4 : score >= 55 ? 3 : score >= 40 ? 2 : 1;
    return {
      key: d.key,
      label: d.label,
      score,
      stars,
      note: notes.length
        ? `${notes.join(", ")} — ${scorePhrase(stars)}`
        : `No graha is sitting directly in your ${ordinal(d.houses[0])} this ${periodLabel.toLowerCase().split(" ")[0]} — ${scorePhrase(stars)} by default`,
    };
  });

  const overall = Math.round(domains.reduce((a, b) => a + b.score, 0) / domains.length);
  const jup = transits.find((t) => t.id === "Ju")!;
  const sat = transits.find((t) => t.id === "Sa")!;
  const rah = transits.find((t) => t.id === "Ra")!;
  const ket = transits.find((t) => t.id === "Ke")!;
  const themes = opts.themes?.[sign];

  const narrative = [
    `Jupiter's transit through ${SIGNS[jup.sign].name} lands in your ${ordinal(jup.house)} house — the area of ${houseTheme(jup.house)}. This is the growth axis of your ${periodLabel.toLowerCase()}: expand here rather than fight elsewhere.`,
    `Saturn in ${SIGNS[sat.sign].name} occupies your ${ordinal(sat.house)} house (${houseTheme(sat.house)}). It asks for repetition, records and follow-through; whatever you build here stays.`,
    `The Rāhu–Ketu axis (${SIGNS[rah.sign].name}–${SIGNS[ket.sign].name}) runs across your ${ordinal(rah.house)}–${ordinal(ket.house)} houses: move toward ${houseTheme(rah.house)}, release ${houseTheme(ket.house)}.`,
  ].filter(Boolean);

  if (themes) {
    narrative.push(
      ...[
        `Love: ${themes.love}`,
        `Work: ${themes.career}`,
        `Money: ${themes.money}`,
        `Health: ${themes.health}`,
      ],
    );
  }

  const best = [...domains].sort((a, b) => b.score - a.score)[0];
  const worst = [...domains].sort((a, b) => a.score - b.score)[0];
  const headline = `${best.label} peaks at ${best.stars}★ while ${worst.label.toLowerCase()} needs tuck — Saturn and Jupiter together in your ${ordinal(jup.house)}–${ordinal(sat.house)} axis. Overall ${Math.round(overall / 20) + 1}/5.`;

  const sad = sadeSati(sign, atMs, ayaKind);
  const remedies = [
    `Chant the ${PLANET_BY_ID[SIGNS[sign].lord].name} mantra on ${PLANET_BY_ID[SIGNS[sign].lord].day}: ${PLANET_BY_ID[SIGNS[sign].lord].mantras[0]}`,
    `Donate ${PLANET_BY_ID.Sa.color.toLowerCase()} items on Saturday to soften the ${ordinal(sat.house)}-house pressure.`,
    sad.active
      ? "You are inside a Sadhe Satī phase — add a Saturday oil lamp and one hour of unpaid service per week."
      : "Keep the Tuesday Hanuman reading as preventive strength.",
    `Use ${PLANET_BY_ID.Ju.color} on Thursdays for the ${ordinal(jup.house)}-house expansion, and ${PLANET_BY_ID.Sa.color.toLowerCase()} on Saturdays for grounding.`,
  ];

  const moon = NAKSHATRAS[Math.floor(siderealAt("Mo", atMs, ayaKind) / (360 / 27)) % 27];
  return {
    sign,
    signName: SIGNS[sign].name,
    periodLabel,
    overall,
    domains,
    transits,
    headline,
    narrative,
    lucky: {
      colour: SIGNS[sign].color,
      number: SIGNS[sign].number,
      day: PLANET_BY_ID[SIGNS[sign].lord].day,
      gem: moon ? PLANET_BY_ID[moon.lord].gem : SIGNS[sign].gem,
    },
    sadeSati: sad,
    remedies,
  };
}

export function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
}

const HOUSE_THEMES = [
  "self, body and first impressions",
  "family, savings and speech",
  "courage, siblings, skills and short travel",
  "home, mother, property and peace of mind",
  "children, romance, study and creativity",
  "work, health, disputes and service",
  "marriage, contracts and the outside world",
  "shared money, research, crises and renewal",
  "fortune, gurus, father and long travel",
  "career, status and life's work",
  "gains, networks and elder siblings",
  "expenditure, foreign lands, rest and release",
];
const houseTheme = (h: number) => HOUSE_THEMES[(h - 1 + 12) % 12] ?? HOUSE_THEMES[0];

const scorePhrase = (stars: number) =>
  [
    "a low-gear period: protect the basics, postpone big bets",
    "uneven — small wins if you keep records and promises",
    "workable: steady effort converts",
    "favourable: push the priority here",
    "strong: green light for starts, signings and travel",
  ][stars - 1] ?? "";
