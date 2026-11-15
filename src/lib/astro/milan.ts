/**
 * Aṣṭakūṭa Kuṇḍlī Milan — 36-point Vedic match scoring, computed from both
 * charts (Moon nakṣatra + Moon sign), plus the Maṅgālīka cross-check.
 *
 * Scoring follows the rule sets most Indian matching tools publish:
 *   Vārna 1 · Vaśya 2 · Tārā 3 · Yoni 4 · Grha Maitrī 5 · Gaṇa 6 · Bhakūt 7 · Nāḍī 8
 * Where a tradition splits opinions (Vaśya, Yoni), a documented simplification is
 * used and the result panel says so.
 */
import {
  NAKSHATRAS,
  PLANET_BY_ID,
  SIGNS,
  VARNA_NAMES,
  YONI_ENEMIES,
  AUSPICIOUS_TARA,
  type Graha,
} from "../../data/reference";
import { computeKundli, type BirthInput, type KundliResult } from "./kundli";

export interface KootaResult {
  id: string;
  name: string;
  sanskrit: string;
  max: number;
  score: number;
  detail: string;
  remedy?: string;
}

export interface MilanResult {
  a: KundliResult;
  b: KundliResult;
  kootas: KootaResult[];
  total: number;
  max: number;
  percent: number;
  verdict: { title: string; text: string; tone: "great" | "good" | "work" | "care" };
  manglik: {
    aPresent: boolean;
    bPresent: boolean;
    aSeverity: string;
    bSeverity: string;
    balanced: boolean;
    note: string;
  };
  nadiNote: string;
  recommendations: string[];
  children: { yoga: boolean; note: string };
  longevity: { note: string };
}

/** sex of the yoni animal per nakṣatra (traditional list) */
const YONI_SEX: ("M" | "F")[] = [
  "M", "M", "F", "F", "M", "M", "F", "F", "F", "M", "M", "F", "F", "M", "M",
  "M", "F", "F", "M", "M", "M", "F", "F", "F", "M", "M", "M",
];

const VASHYA_GROUP: Record<number, string> = {
  0: "Chatushpada",
  1: "Chatushpada",
  2: "Manava",
  3: "Jala",
  4: "Vanachara",
  5: "Manava",
  6: "Manava",
  7: "Keeta",
  8: "Vanachara",
  9: "Keeta",
  10: "Vanachara",
  11: "Jala",
};

const lordOf = (sign: number): Graha => SIGNS[sign].lord;
const areSignLordsFriendly = (x: number, y: number) => {
  const a = PLANET_BY_ID[lordOf(x)];
  const b = PLANET_BY_ID[lordOf(y)];
  return (
    !!a.friendSigns?.includes(y) &&
    !!b.friendSigns?.includes(x) &&
    !a.enemySigns?.includes(y) &&
    !b.enemySigns?.includes(x)
  );
};
const areSignLordsEnemy = (x: number, y: number) => {
  const a = PLANET_BY_ID[lordOf(x)];
  const b = PLANET_BY_ID[lordOf(y)];
  return a.enemySigns?.includes(y) || b.enemySigns?.includes(x);
};

const yoniHostile = (x: string, y: string) =>
  YONI_ENEMIES.some(([p, q]) => (p === x && q === y) || (p === y && q === x));

export function matchKundlis(aInput: BirthInput, bInput: BirthInput): MilanResult {
  const a = computeKundli(aInput);
  const b = computeKundli(bInput);
  const A = NAKSHATRAS[a.moonNakshatra];
  const B = NAKSHATRAS[b.moonNakshatra];
  const aSign = a.moonSign;
  const bSign = b.moonSign;

  const kootas: KootaResult[] = [];

  /* 1 ── Vārna (1) */
  {
    const ok = A.varna >= B.varna;
    kootas.push({
      id: "varna",
      name: "Vārna",
      sanskrit: "वर्ण",
      max: 1,
      score: ok ? 1 : 0,
      detail: `Partner A is ${VARNA_NAMES[A.varna]} by nakṣatra, partner B is ${VARNA_NAMES[B.varna]}. The classical rule awards the point when the ${VARNA_NAMES[A.varna]} grade is equal or higher — it measures ego-compatibility more than anything modern.`,
    });
  }

  /* 2 ── Vaśya (2) — simplified, documented */
  {
    const ga = VASHYA_GROUP[aSign];
    const gb = VASHYA_GROUP[bSign];
    let score = 0;
    let why = "";
    if (ga === gb) {
      score = 2;
      why = `Both Moon signs are in the ${ga} group — the pair moves in the same harness.`;
    } else if (areSignLordsFriendly(aSign, bSign)) {
      score = 1;
      why = `${ga} vs ${gb} differ, but the Moon-sign lords are natural friends, so influence flows both ways.`;
    } else if (areSignLordsEnemy(aSign, bSign)) {
      score = 0;
      why = `${ga} vs ${gb} with warring Moon-sign lords — each will try to lead and neither will yield.`;
    } else {
      score = 1;
      why = `${ga} vs ${gb}: mixed but neutral; a shared purpose decides the balance of control.`;
    }
    kootas.push({
      id: "vashya",
      name: "Vaśya",
      sanskrit: "वश्य",
      max: 2,
      score,
      detail: `${why} (Simplified rule — the full classical table also weighs which group "controls" which.)`,
    });
  }

  /* 3 ── Tārā (3) */
  {
    const count = ((b.moonNakshatra - a.moonNakshatra + 27) % 27) + 1;
    const tara = ((count - 1) % 9) + 1;
    const good = AUSPICIOUS_TARA.has(tara);
    kootas.push({
      id: "tara",
      name: "Tārā",
      sanskrit: "तारा",
      max: 3,
      score: good ? 3 : 0,
      detail: `Counting ${count} star(s) from B's nakṣatra ${B.name} to A's ${A.name} gives tarā ${tara}/9 — ${good ? "auspicious (Samta): mutual health and fortune" : "the inauspicious (Vipat/Pratyari) set; use the wedding muhūrta to select a mitigating start"}.`,
      remedy: good ? undefined : "Choose a start-date whose tarā from the bride's star is 2, 4, 5, 7 or 9 (Muhūrta service).",
    });
  }

  /* 4 ── Yoni (4) */
  {
    const sameAnimal = A.yoni === B.yoni;
    const sameSex = YONI_SEX[a.moonNakshatra] === YONI_SEX[b.moonNakshatra];
    let score: number;
    let why: string;
    if (sameAnimal && !sameSex) {
      score = 4;
      why = `Both are ${A.yoni} yoni with complementary sex — the classical full-score pairing for physical and instinctive harmony.`;
    } else if (sameAnimal && sameSex) {
      score = 2;
      why = `Same ${A.yoni} yoni but the same sex — traditionally reduced: strong familiarity, weak polarity.`;
    } else if (yoniHostile(A.yoni, B.yoni)) {
      score = 0;
      why = `${A.yoni} and ${B.yoni} are a traditional enemy pair — physical incompatibility and one-sided irritation are expected; remedies are prescribed rather than skipping the match.`;
    } else {
      score = 2;
      why = `${A.yoni} with ${B.yoni}: neutral, no enmity in the classical list. Physical rhythm is built, not gifted.`;
    }
    kootas.push({
      id: "yoni",
      name: "Yoni",
      sanskrit: "योनि",
      max: 4,
      score,
      detail: why,
    });
  }

  /* 5 ── Grha Maitrī (5) */
  {
    const la = PLANET_BY_ID[lordOf(aSign)];
    const lb = PLANET_BY_ID[lordOf(bSign)];
    let score = 3;
    if (aSign === bSign) score = 5;
    else if (areSignLordsFriendly(aSign, bSign)) score = 5;
    else if (areSignLordsEnemy(aSign, bSign)) score = 0;
    kootas.push({
      id: "maitri",
      name: "Grha Maitrī",
      sanskrit: "गृहमैत्री",
      max: 5,
      score,
      detail: `Mind-lords ${la.name} (A) and ${lb.name} (B) are ${score === 5 ? "natural friends — intellects agree, arguments repair themselves" : score === 0 ? "natural enemies — styles clash unless both mature past their instincts" : "neutral — respectful distance works better than constant togetherness"}.`,
    });
  }

  /* 6 ── Gaṇa (6) */
  {
    const GANA_TABLE: Record<string, number> = {
      "Deva-Deva": 6,
      "Deva-Manushya": 5,
      "Deva-Rakshasa": 0,
      "Manushya-Deva": 0,
      "Manushya-Manushya": 6,
      "Manushya-Rakshasa": 1,
      "Rakshasa-Deva": 1,
      "Rakshasa-Manushya": 0,
      "Rakshasa-Rakshasa": 6,
    };
    const key = `${A.gana}-${B.gana}`;
    let score = GANA_TABLE[key] ?? 3;
    let note = `${A.name} is ${A.gana} gana, ${B.name} is ${B.gana} gana → ${key}, worth ${score}/6 in the classical table.`;
    const sameNak = a.moonNakshatra === b.moonNakshatra;
    if (score < 6 && (sameNak || areSignLordsFriendly(aSign, bSign))) {
      score = Math.min(6, score + 1);
      note += " Cancelled upward: shared nakṣatra/friendly Moon lords soften the gana gap (the traditional Gana-drushya rule).";
    }
    kootas.push({
      id: "gana",
      name: "Gaṇa",
      sanskrit: "गण",
      max: 6,
      score,
      detail: note + " Temperament clusters: Deva = refined/giving, Manushya = human/social, Rakshasa = forceful/self-protective.",
    });
  }

  /* 7 ── Bhakūt (7) — 2/11 gives 0, 5/9 gives 1, otherwise 7 */
  {
    const d = Math.abs(aSign - bSign) % 12;
    const apart = Math.min(d, 12 - d);
    let score = 7;
    let why = `Moon signs ${SIGNS[aSign].name} and ${SIGNS[bSign].name} are ${apart} apart — outside the 2/11 and 5/9 defect zones, so Bhakūt is full: shared fortune, health and family habits.`;
    if (d === 2 || d === 10) {
      score = 0;
      why = `Moon signs are 2/11 apart — the classical Bhakūt defect for money and family routines: separate accounts and clear division of household duties remove most of it.`;
    } else if (d === 5 || d === 7) {
      score = 1;
      why = `Moon signs are 5/9 apart — the "children & fortune" gap. Agree early on parenting, spending on family, and how festivals are split between households.`;
    }
    kootas.push({ id: "bhakoot", name: "Bhakūt", sanskrit: "भकूट", max: 7, score, detail: why });
  }

  /* 8 ── Nāḍī (8) */
  {
    const na = (a.moonNakshatra % 3) + 1;
    const nb = (b.moonNakshatra % 3) + 1;
    const same = na === nb;
    const sameNakshatra = a.moonNakshatra === b.moonNakshatra;
    let score = same ? 0 : 8;
    let why = same
      ? `Both are ${["Ādi (Vata)", "Madhya (Pitta)", "Antya (Kapha)"][na - 1]} nadi — the 8-point Nāḍī kooṭa is lost. Same-constitution pairs traditionally struggle with health and progeny patterns; many families cancel it via Samadeeya/Kshetra rules — worth an astrologer's ruling.`
      : `Ādi–Madhya–Antya differ (${["Ādi", "Madhya", "Antya"][na - 1]} vs ${["Ādi", "Madhya", "Antya"][nb - 1]}) — full 8 points: humoral and genetic complementarity.`;
    if (sameNakshatra) {
      why += ` Note: identical nakṣatra (${A.name}) means identical nadi and same gotra risk — most traditional families treat this as a hard check.`;
    }
    kootas.push({
      id: "nadi",
      name: "Nāḍī",
      sanskrit: "नाडी",
      max: 8,
      score,
      detail: why,
      remedy: same ? "Nadi dosha puja + medical pre-marital screening; many astrologers waive it when the Moon signs differ." : undefined,
    });
  }

  const total = kootas.reduce((s, k) => s + k.score, 0);
  const percent = Math.round((total / 36) * 100);

  const ma = a.grahas.find((g) => g.id === "Ma")!;
  const mb = b.grahas.find((g) => g.id === "Ma")!;
  const aMang = a.doshas.find((d) => d.id === "mangal")!;
  const bMang = b.doshas.find((d) => d.id === "mangal")!;
  const aPresent = aMang.present && !aMang.cancelled;
  const bPresent = bMang.present && !bMang.cancelled;
  const balanced = aPresent === bPresent;

  const verdict =
    total >= 32
      ? { title: "Excellent match", tone: "great" as const, text: `${total}/36 — the charts support each other with little friction. Traditional families accept this band without further remedies.` }
      : total >= 26
        ? { title: "Good match", tone: "good" as const, text: `${total}/36 — a solid pairing with one or two growth edges. Look at the lowest kooṭa below and agree on who handles what.` }
        : total >= 18
          ? { title: "Workable with effort", tone: "work" as const, text: `${total}/36 — mid-band: love is present but the mechanics (money, temper, families) need deliberate design. A 30-minute pre-marriage reading is strongly advised here.` }
          : { title: "Needs remedies & a second opinion", tone: "care" as const, text: `${total}/36 — below the usual acceptance line. Do not decide from software: get a human astrologer to check cancellations (Gana-drushya, Nadi exceptions, Mangal balance) before concluding anything.` };

  return {
    a,
    b,
    kootas,
    total,
    max: 36,
    percent,
    verdict,
    manglik: {
      aPresent,
      bPresent,
      aSeverity: aMang.cancelled ? "cancelled" : aMang.severity,
      bSeverity: bMang.cancelled ? "cancelled" : bMang.severity,
      balanced,
      note: aPresent && bPresent
        ? "Both partners carry Maṅgālīka — the classical view is that they neutralise each other; marriage is not blocked by Kuja here."
        : aPresent || bPresent
          ? `Only ${aPresent ? "partner A" : "partner B"} is Kuja (Mars in the ${ordinalOf(aPresent ? ma.house : mb.house)}). The traditional remedy is a Kuja–Kuja match, or Mangal Shanti before the wedding; many families instead accept it when Jupiter aspect and the Gaṇa kooṭa are strong.`
          : "Neither chart shows Kuja dosha — the marriage axis is free of martian friction.",
    },
    nadiNote: a.moonNakshatra === b.moonNakshatra
      ? `Shared nakṣatra ${A.name}: check gotra (same lineage) separately — software cannot know family lineage.`
      : `Nakṣatras ${A.name} × ${B.name} — no same-star restriction applies.`,
    recommendations: [
      ...(kootas.filter((k) => k.score / k.max < 0.5).map((k) => k.name)),
      ...(aPresent !== bPresent ? ["Mangal Shanti"] : []),
    ],
    children: {
      yoga: true,
      note: `Putrakāraka Jupiter sits in ${SIGNS[a.grahas.find((g) => g.id === "Ju")!.sign].name} (A) and ${SIGNS[b.grahas.find((g) => g.id === "Ju")!.sign].name} (B); the 5th house of each chart is ${a.houses[4].planets.length ? "occupied" : "empty"} / ${b.houses[4].planets.length ? "occupied" : "empty"}.`,
    },
    longevity: {
      note: `Both charts have ${a.strengths[0].name}/${b.strengths[0].name} as the strongest graha; the 8th house of A is ${a.houses[7].planets.length ? "activated" : "quiet"} and B's is ${b.houses[7].planets.length ? "activated" : "quiet"} — a Ayur compatibility read, not a prediction.`,
    },
  };
}

const ordinalOf = (n: number) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
};
