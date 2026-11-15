/**
 * Śubha Muhūrta — electional astrology. Given a purpose and a date range, every
 * day is scored from the live pañcāṅga (nakṣatra, tithi, pakṣa, yoga, karaṇa,
 * vāra), then the best window inside daylight is chosen while excluding
 * Rāhu Kāla, Yamaghaṇṭa and Gulika Kāla and preferring Abhijit when it is clean.
 *
 * Every ± on a day is kept as a printed reason, so the user can see exactly why
 * Tuesday lost to Thursday. No random numbers, no "consult us for the date":
 * this is the same engine the free Panchang page uses.
 */
import { KARANAS, NAKSHATRAS } from "../../data/reference";

/** nakṣatra indices from their published names — an index list is too easy to mis-key */
const NAK_INDEX: Record<string, number> = Object.fromEntries(NAKSHATRAS.map((n) => [n.name, n.index]));
const ns = (...names: string[]) => names.map((n) => NAK_INDEX[n] ?? -1).filter((i) => i >= 0);
import { panchangaAt, type Panchanga } from "./panchanga";
import { ghatikasFor } from "./ghatika";
import { zonedToUtcMs, utcMsToZoned } from "./core";

export type MuhuratPurpose =
  | "vivah"
  | "grihapravesh"
  | "puja"
  | "car"
  | "business"
  | "study"
  | "travel"
  | "samskara"
  | "sagai"
  | "pitra";

export interface MuhuratDef {
  id: MuhuratPurpose;
  label: string;
  sanskrit: string;
  emoji: string;
  blurb: string;
  note: string;
  /** nakṣatras, by their published name (resolved to indices once, here) */
  best: number[];
  ok: number[];
  avoid: number[];
  /** favourable / refused tithi numbers within their pakṣa (1-15) */
  tithiBest: number[];
  tithiAvoid: number[];
  /** weekday lords friendly to the work */
  lords: string[];
  paksha: "Shukla" | "Krishna" | "any";
  purnima: "best" | "avoid" | "neutral";
  amavasya: "best" | "avoid" | "neutral";
  /** Abhijit is a hard requirement rather than a bonus */
  needAbhijit?: boolean;
}

/** Rikta (empty) tithis — 4, 9, 14 — refused for almost every beginning. */
const RIKTA = [4, 9, 14];
/** Nanda/Jaya/Rikta/Poorna groupings, only used as a mild penalty. */
const NITYA_YOGA_GOOD = new Set([1, 2, 3, 4, 6, 15, 19, 20, 21, 22, 23, 24, 13]);
const NITYA_YOGA_BAD = new Set([0, 5, 8, 9, 12, 14, 16, 17, 18, 26]);

export const MUHURAT_PURPOSES: MuhuratDef[] = [
  {
    id: "vivah",
    label: "Marriage",
    sanskrit: "विवाह",
    emoji: "💍",
    blurb: "The strictest list — Rohiṇī, Hasta, Svātī, Viśākhā, Anurādhā, Mūla, Śravaṇa, Dhaniṣṭhā, Śatabhiṣā and the three Uttarās.",
    note: "Marriage is refused on Bharaṇī, Kṛttikā, Ārdrā, Aśvinī (some lineages), the two Pūrvas and Māghā, on Rikta tithis, on Amāvāsyā and in Viṣṭi karaṇa. Most families also require the bride's and groom's horoscopes to agree — run Milan before you fix a date.",
    best: ns("Rohini", "Hasta", "Swati", "Anuradha", "Mula", "Shravana", "Dhanishta", "Uttara Phalguni", "Uttara Ashadha", "Uttara Bhadrapada"),
    ok: ns("Ashwini", "Mrigashira", "Punarvasu", "Pushya", "Chitra", "Vishakha", "Ashlesha", "Shatabhisha", "Revati"),
    avoid: ns("Bharani", "Krittika", "Ardra", "Magha", "Purva Phalguni", "Purva Ashadha", "Purva Bhadrapada", "Jyeshtha"),
    tithiBest: [2, 3, 5, 7, 10, 11, 13],
    tithiAvoid: [...RIKTA, 12, 15],
    lords: ["Ve", "Ju", "Mo", "Me"],
    paksha: "Shukla",
    purnima: "avoid",
    amavasya: "avoid",
  },
  {
    id: "grihapravesh",
    label: "Griha Pravesh / house warming",
    sanskrit: "गृह प्रवेश",
    emoji: "🏠",
    blurb: "A firm nakṣatra, a waxing tithi, Wednesday or Thursday, and a Pūrṇimā if you can get one.",
    note: "Gṛha praveśa wants a stable nakṣatra (Kṛttikā, Rohiṇī, Mṛga, Punarvasu, Hasta, Anurādhā, Mūla, Śravaṇa, Dhanisṭhā, Uttara Bhādrapadā, Revatī), a waxing tithi and preferably Śukra or Guru vāsa. Vāstu also refuses Rāhu Kāla entry; the calendar half is what this tool computes.",
    best: ns("Rohini", "Mrigashira", "Punarvasu", "Pushya", "Hasta", "Swati", "Vishakha", "Anuradha", "Shravana", "Dhanishta", "Uttara Bhadrapada", "Revati"),
    ok: ns("Ashwini", "Ashlesha", "Chitra", "Mula", "Shatabhisha", "Uttara Phalguni", "Uttara Ashadha"),
    avoid: ns("Bharani", "Krittika", "Ardra", "Magha", "Purva Phalguni", "Purva Ashadha", "Purva Bhadrapada", "Jyeshtha"),
    tithiBest: [2, 3, 5, 7, 10, 11, 13],
    tithiAvoid: [...RIKTA],
    lords: ["Me", "Ve", "Ju", "Mo"],
    paksha: "Shukla",
    purnima: "best",
    amavasya: "avoid",
  },
  {
    id: "puja",
    label: "Puja, vrat & Satyanarayan",
    sanskrit: "पूजा · व्रत",
    emoji: "🪔",
    blurb: "Pūrṇimā and Pratipad of the bright half, Ekādaśī for fasting, Amāvāsyā for Satyanārāyaṇa.",
    note: "Vrata days follow the lunar day rather than the solar date, so the calendar shifts about 11 days earlier each year. Pūrṇimā (Satyanārāyaṇa, Buddha Pūrṇimā), Ekādaśī (fasting), Pradoṣa (Saturday evening, Śaṅkara-caturthi) and Saṣṭhī (Kārttikeya) are the ones families actually schedule.",
    best: ns("Pushya", "Rohini", "Punarvasu", "Hasta", "Swati", "Vishakha", "Anuradha", "Shravana", "Dhanishta", "Revati", "Uttara Phalguni"),
    ok: ns("Ashwini", "Mrigashira", "Ashlesha", "Chitra", "Mula", "Shatabhisha", "Uttara Ashadha", "Uttara Bhadrapada"),
    avoid: ns("Ardra", "Bharani", "Purva Bhadrapada", "Jyeshtha", "Magha"),
    tithiBest: [1, 2, 3, 5, 7, 8, 11, 13],
    tithiAvoid: [...RIKTA],
    lords: ["Ju", "Mo", "Ve", "Su"],
    paksha: "any",
    purnima: "best",
    amavasya: "best",
  },
  {
    id: "business",
    label: "New business, shop & signboard",
    sanskrit: "व्यापार आरंभ",
    emoji: "📈",
    blurb: "Budha or Śukra vāsa, waxing Moon, and nakṣatras that are quick and prosperous.",
    note: "Vyāpāra ārambha prefers Aśvinī, Mṛga, Āśleṣā, Hasta, Svātī, Viśākhā, Anurādhā, Mūla, Śravaṇa, Dhaniṣṭhā and Revatī, a waxing tithi, and the first half of the day in a good horā. Thursday (Guru) and Friday (Śukra) are the traditional opening days; Saturday is avoided for a first sale.",
    best: ns("Mrigashira", "Punarvasu", "Chitra", "Vishakha", "Anuradha", "Shravana", "Dhanishta", "Shatabhisha", "Hasta", "Swati"),
    ok: ns("Ashwini", "Rohini", "Pushya", "Ashlesha", "Mula", "Uttara Phalguni", "Uttara Ashadha", "Uttara Bhadrapada", "Revati"),
    avoid: ns("Bharani", "Krittika", "Ardra", "Magha", "Purva Phalguni", "Purva Ashadha", "Purva Bhadrapada", "Jyeshtha"),
    tithiBest: [2, 3, 5, 7, 10, 11, 13],
    tithiAvoid: [...RIKTA],
    lords: ["Me", "Ve", "Su", "Ju"],
    paksha: "Shukla",
    purnima: "neutral",
    amavasya: "avoid",
  },
  {
    id: "car",
    label: "Vehicle purchase & first drive",
    sanskrit: "वाहन खरीद",
    emoji: "🚗",
    blurb: "Movable nakṣatras for anything that moves; take it out in Abhijit if the day allows.",
    note: "Vāhana kraya uses Aśvinī, Mṛga, Āśleṣā, Hasta, Svātī, Viśākhā, Anurādhā, Mūla, Śravaṇa, Dhaniṣṭhā and Revatī, and refuses Bharaṇī, Ārdrā, Māghā, Pūrva Bhādrapadā and the two Pūrvas. Number plates and registration are treated as part of the same muhūrta — pick the moment the paperwork is signed, not the delivery.",
    best: ns("Ashwini", "Mrigashira", "Punarvasu", "Hasta", "Swati", "Vishakha", "Anuradha", "Mula", "Shravana", "Dhanishta", "Revati"),
    ok: ns("Rohini", "Pushya", "Ashlesha", "Chitra", "Shatabhisha", "Uttara Phalguni", "Uttara Ashadha", "Uttara Bhadrapada"),
    avoid: ns("Bharani", "Krittika", "Ardra", "Magha", "Purva Phalguni", "Purva Ashadha", "Purva Bhadrapada", "Jyeshtha"),
    tithiBest: [2, 3, 5, 7, 10, 11, 13],
    tithiAvoid: [...RIKTA],
    lords: ["Me", "Mo", "Su"],
    paksha: "any",
    purnima: "neutral",
    amavasya: "neutral",
  },
  {
    id: "study",
    label: "Vidyārambha & school admission",
    sanskrit: "विद्या आरंभ",
    emoji: "📚",
    blurb: "The child is made to write the first letters on a plate of rice on Śravaṇa or Dhaniṣṭhā.",
    note: "Vidyārambha is done on a Wednesday or Thursday in Śukla pakṣa, on Śravaṇa, Dhaniṣṭhā, Aśleṣā, Mūla, Hasta or Revatī, after Sarasvatī-pūjā; Akṣarābhyāsa on Vijayā Daśamī is the other common choice. Rikta tithis and Viṣṭi are refused.",
    best: ns("Punarvasu", "Hasta", "Anuradha", "Shravana", "Dhanishta", "Revati", "Pushya", "Rohini"),
    ok: ns("Ashwini", "Mrigashira", "Swati", "Chitra", "Vishakha", "Shatabhisha", "Uttara Phalguni", "Uttara Ashadha", "Uttara Bhadrapada"),
    avoid: ns("Ardra", "Magha", "Bharani", "Krittika", "Mula", "Jyeshtha", "Purva Bhadrapada"),
    tithiBest: [2, 3, 5, 7, 10, 11, 13],
    tithiAvoid: [...RIKTA, 12],
    lords: ["Me", "Ju", "Mo"],
    paksha: "Shukla",
    purnima: "neutral",
    amavasya: "avoid",
  },
  {
    id: "travel",
    label: "Travel & departure",
    sanskrit: "यात्रा",
    emoji: "✈️",
    blurb: "Movable nakṣatras, waxing Moon, and never inside the three kālas.",
    note: "Yātrā prefers movable nakṣatras (Aśvinī, Bharaṇī, Śravaṇa, Dhaniṣṭhā, and Rohiṇī), a waxing tithi, and a friendly weekday. Direction matters as much as the day in the classical texts — the day's direction is given from the nakṣatra on the result card. Departing during Rāhu Kāla is the single most common mistake.",
    best: ns("Ashwini", "Shravana", "Dhanishta", "Swati", "Vishakha", "Shatabhisha", "Revati", "Bharani"),
    ok: ns("Mrigashira", "Punarvasu", "Hasta", "Anuradha", "Chitra", "Pushya", "Rohini", "Uttara Ashadha", "Uttara Bhadrapada"),
    avoid: ns("Ardra", "Magha", "Krittika", "Purva Phalguni", "Purva Ashadha", "Purva Bhadrapada", "Jyeshtha"),
    tithiBest: [2, 3, 5, 7, 10, 11, 13],
    tithiAvoid: [...RIKTA, 8, 12],
    lords: ["Mo", "Me", "Ju"],
    paksha: "any",
    purnima: "neutral",
    amavasya: "neutral",
  },
  {
    id: "samskara",
    label: "Naming, Upanayana, head-shave",
    sanskrit: "नामकरण · उपनयन",
    emoji: "🕉️",
    blurb: "The saṁskāra list: gentle nakṣatras, bright fortnight, Guru or Budha vāsa.",
    note: "Nāmākaraṇa, uṣṇapāta (head-shave) and upanayana use Aśvinī, Rohiṇī, Mṛga, Punarvasu, Hasta, Svātī, Viśākhā, Anurādhā, Mūla, Śravaṇa, Dhaniṣṭhā, Śatabhiṣā and the Uttarās. For a naming ceremony the syllable is chosen from the birth nakṣatra — the Naamkaran tool generates those names.",
    best: ns("Rohini", "Punarvasu", "Pushya", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Shravana", "Dhanishta", "Uttara Phalguni", "Uttara Ashadha", "Uttara Bhadrapada", "Revati"),
    ok: ns("Ashwini", "Mrigashira", "Ashlesha", "Shatabhisha", "Mula"),
    avoid: ns("Bharani", "Krittika", "Ardra", "Magha", "Jyeshtha", "Purva Bhadrapada", "Purva Ashadha", "Purva Phalguni"),
    tithiBest: [2, 3, 5, 7, 10, 11, 13],
    tithiAvoid: [...RIKTA],
    lords: ["Ju", "Mo", "Me", "Ve"],
    paksha: "Shukla",
    purnima: "neutral",
    amavasya: "neutral",
  },
  {
    id: "sagai",
    label: "Engagement, roka & rishta meeting",
    sanskrit: "आशीर्वाद · सगाई",
    emoji: "💞",
    blurb: "Marriage rules with a wider nakṣatra list, because nothing irrevocable is signed.",
    note: "Āśīrvāda and roka follow the marriage list but tolerate more nakṣatras. A Wednesday or Friday in the bright half, on a tithi that is not Rikta, is the usual answer; the families' horoscope match should already exist — run Milan if it does not.",
    best: ns("Rohini", "Hasta", "Swati", "Anuradha", "Shravana", "Dhanishta", "Uttara Phalguni", "Uttara Ashadha", "Mrigashira", "Punarvasu"),
    ok: ns("Ashwini", "Pushya", "Chitra", "Vishakha", "Ashlesha", "Mula", "Shatabhisha", "Uttara Bhadrapada", "Revati"),
    avoid: ns("Bharani", "Krittika", "Ardra", "Magha", "Purva Phalguni", "Purva Ashadha", "Purva Bhadrapada", "Jyeshtha"),
    tithiBest: [2, 3, 5, 7, 10, 11, 13],
    tithiAvoid: [...RIKTA],
    lords: ["Ve", "Me", "Mo"],
    paksha: "Shukla",
    purnima: "neutral",
    amavasya: "avoid",
  },
  {
    id: "pitra",
    label: "Antyeṣṭi, śrāddha & pitṛ karma",
    sanskrit: "अंत्येष्टि · श्राद्ध",
    emoji: "🕯️",
    blurb: "Reversed rules: the dark fortnight, Amāvāsyā, and Saturn's or the Sun's weekday.",
    note: "These rites belong to Kṛṣṇa pakṣa and Amāvāsyā; the usual auspiciousness factors are deliberately inverted, and Viṣṭi, Rikta and the good yogas are not treated as obstacles here. The tithi of the death is repeated monthly (māśika-śrāddha) — this tool marks those days, it does not tell you whether the rite is due.",
    best: ns("Bharani", "Krittika", "Rohini", "Ashlesha", "Magha", "Mula", "Shravana", "Shatabhisha", "Purva Bhadrapada", "Mrigashira"),
    ok: ns("Ashwini", "Punarvasu", "Pushya", "Hasta", "Swati", "Anuradha", "Dhanishta", "Jyeshtha", "Revati", "Uttara Phalguni"),
    avoid: ns("Vishakha", "Chitra", "Ardra", "Uttara Ashadha", "Uttara Bhadrapada", "Purva Phalguni", "Purva Ashadha"),
    tithiBest: [1, 4, 9, 12, 14, 15],
    tithiAvoid: [2, 3, 5, 7, 10, 11, 13],
    lords: ["Sa", "Su", "Ma"],
    paksha: "Krishna",
    purnima: "avoid",
    amavasya: "best",
  },
];

export interface MuhuratReason {
  text: string;
  /** signed weight, shown verbatim next to the factor */
  delta: number;
  kind: "nakshatra" | "tithi" | "paksha" | "yoga" | "karana" | "vara" | "kaala" | "lagna" | "other";
}

export interface MuhuratDay {
  iso: string;
  label: string;
  weekday: string;
  atMs: number;
  sunrise: number | null;
  sunset: number | null;
  score: number;
  klass: "best" | "good" | "fair" | "avoid";
  tithi: { name: string; sanskrit: string; number: number; paksha: string };
  nakshatra: { name: string; sanskrit: string; index: number; lord: string };
  yoga: { name: string; index: number; nature: string };
  karana: { name: string; index: number };
  masa: string;
  reasons: MuhuratReason[];
  window: { start: number; end: number; label: string; tone: "abhijit" | "hora" | "none" } | null;
  blocked: { label: string; start: number; end: number }[];
}

export interface MuhuratResult {
  def: MuhuratDef;
  from: string;
  to: string;
  tz: string;
  days: MuhuratDay[];
  ranked: MuhuratDay[];
  best: MuhuratDay | null;
  scanned: number;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const LORD_NAMES: Record<string, string> = {
  Su: "Sūrya",
  Mo: "Chandra",
  Ma: "Mangal",
  Me: "Budha",
  Ju: "Guru",
  Ve: "Śukra",
  Sa: "Śani",
};

/**
 * Score one day from its pañcāṅga. `localNoonMs` is the instant the day is
 * sampled at (12:00 local), which is what almanacs use for the "day's" values.
 */
export function scoreMuhuratDay(p: Panchanga, def: MuhuratDef, sampleMs: number): MuhuratDay {
  const reasons: MuhuratReason[] = [];
  let score = 50;
  const add = (delta: number, kind: MuhuratReason["kind"], text: string) => {
    score += delta;
    reasons.push({ delta, kind, text });
  };

  const nak = p.nakshatra.value.index;
  if (def.best.includes(nak)) add(14, "nakshatra", `${p.nakshatra.value.name} — listed as excellent for ${def.label.toLowerCase()}`);
  else if (def.avoid.includes(nak)) add(-18, "nakshatra", `${p.nakshatra.value.name} is refused for this work`);
  else if (def.ok.includes(nak)) add(6, "nakshatra", `${p.nakshatra.value.name} — acceptable`);
  else add(-4, "nakshatra", `${p.nakshatra.value.name} — neutral for this work`);

  const inPaksha = def.paksha === "any" || p.paksha === def.paksha;
  const tNo = p.tithi.value.number; // 1..15 inside the running paksha
  const isPurnima = tNo === 15 && p.paksha === "Shukla";
  const isAmavasya = tNo === 15 && p.paksha === "Krishna";
  if (isPurnima) {
    if (def.purnima === "best") add(14, "tithi", "Pūrṇimā — the full Moon is the reason this rite is done");
    else if (def.purnima === "avoid") add(-12, "tithi", "Pūrṇimā is avoided for this work");
    else add(1, "tithi", "Pūrṇimā");
  } else if (isAmavasya) {
    if (def.amavasya === "best") add(18, "tithi", "Amāvāsyā — pitṛ and Satyanārāyaṇa observances belong to this tithi");
    else if (def.amavasya === "avoid") add(-16, "tithi", "Amāvāsyā is refused for beginnings");
    else add(0, "tithi", "Amāvāsyā");
  } else if (def.tithiBest.includes(tNo)) add(11, "tithi", `${p.tithi.value.name} (tithi ${tNo}) is favourable`);
  else if (def.tithiAvoid.includes(tNo)) add(-15, "tithi", `${p.tithi.value.name} is avoided for this work`);
  else add(-2, "tithi", `${p.tithi.value.name} — neither preferred nor refused`);

  if (inPaksha) add(6, "paksha", `${p.paksha} pakṣa — the half this work wants`);
  else add(-12, "paksha", `${p.paksha} pakṣa — this work belongs to ${def.paksha} pakṣa`);

  const yIdx = p.yoga.value.index;
  if (NITYA_YOGA_GOOD.has(yIdx)) add(8, "yoga", `${p.yoga.value.name} yoga — nitya-yoga list marks it auspicious`);
  else if (NITYA_YOGA_BAD.has(yIdx)) add(-12, "yoga", `${p.yoga.value.name} yoga — hold back today`);
  else add(2, "yoga", `${p.yoga.value.name} yoga (${p.yoga.value.nature})`);

  if (p.karana.value.name === "Vishti") add(-20, "karana", "Viṣṭi (Bhadra) karaṇa — the one karaṇa that is strictly refused");
  else if (p.karana.value.index >= 7) add(-5, "karana", `${KARANAS[p.karana.value.index]} — a fixed karaṇa, mixed results`);
  else add(3, "karana", `${KARANAS[p.karana.value.index]} karaṇa`);

  const lord = p.varaLord;
  if (def.lords.includes(lord)) add(9, "vara", `${p.vara} — ${LORD_NAMES[lord]}'s day, friendly to this work`);
  else if (lord === "Sa" && def.id !== "pitra") add(-5, "vara", "Śani's day — slow for a beginning");
  else if (lord === "Ma" && (def.id === "vivah" || def.id === "grihapravesh" || def.id === "sagai")) add(-6, "vara", "Mangal's day — sharp; most families skip it for marriage and house entry");

  const klass: MuhuratDay["klass"] = score >= 78 ? "best" : score >= 64 ? "good" : score >= 48 ? "fair" : "avoid";
  const z = utcMsToZoned(sampleMs, p.place.tz);
  return {
    iso: `${z.year}-${pad(z.month)}-${pad(z.day)}`,
    label: `${pad(z.day)} ${MONTHS[z.month - 1]} ${z.year}`,
    weekday: p.vara,
    atMs: sampleMs,
    sunrise: p.sunrise,
    sunset: p.sunset,
    score: Math.max(0, Math.min(100, Math.round(score))),
    klass,
    tithi: { name: p.tithi.value.name, sanskrit: p.tithi.value.sanskrit, number: tNo, paksha: p.tithi.value.paksha },
    nakshatra: { name: p.nakshatra.value.name, sanskrit: p.nakshatra.value.sanskrit, index: nak, lord: p.nakshatra.value.lord },
    yoga: { name: p.yoga.value.name, index: yIdx, nature: p.yoga.value.nature },
    karana: { name: p.karana.value.name, index: p.karana.value.index },
    masa: p.masa,
    reasons,
    window: null,
    blocked: [],
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Choose the usable window: Abhijit if it is clean, otherwise the longest
 * good day-part that is not swallowed by Rāhu Kāla, Yamaghaṇṭa or Gulika.
 */
export function pickMuhuratWindow(day: MuhuratDay, p: Panchanga, def: MuhuratDef): MuhuratDay {
  const g = ghatikasFor(p);
  if (!g) {
    day.reasons.push({ delta: 0, kind: "kaala", text: "No sunrise at this place on this date — daylight-based muhūrta rules cannot be applied" });
    return day;
  }
  const blocked = [
    { label: "Rāhu Kāla", start: g.rahukaal.start, end: g.rahukaal.end },
    { label: "Yamaghaṇṭa", start: g.yamaghand.start, end: g.yamaghand.end },
    { label: "Gulika Kāla", start: g.gulika.start, end: g.gulika.end },
  ];
  day.blocked = blocked;
  const hits = (a: number, b: number) => blocked.some((x) => a < x.end && b > x.start);

  if (g.abhijit && !hits(g.abhijit.start, g.abhijit.end)) {
    day.window = { start: g.abhijit.start, end: g.abhijit.end, label: "Abhijit Muhūrta", tone: "abhijit" };
    day.reasons.push({ delta: 8, kind: "kaala", text: "Abhijit Muhūrta is clean — the window every almanac prints as the universal remedy" });
    day.score = Math.min(100, day.score + 8);
  } else if (g.abhijit) {
    day.reasons.push({ delta: -4, kind: "kaala", text: "Abhijit falls inside a kāla today, so it cannot be used" });
    day.score = Math.max(0, day.score - 4);
  }
  const parts = g.parts.filter((x) => x.end <= g.sunset && x.start >= g.sunrise && !hits(x.start, x.end));
  const friendly = parts.filter((x) => def.lords.includes(x.lord));
  const pool = friendly.length ? friendly : parts.filter((x) => x.quality === "good");
  if (!day.window && pool.length) {
    const best = pool.reduce((a, b) => (b.end - b.start > a.end - a.start ? b : a));
    day.window = { start: best.start, end: best.end, label: `${best.lordName} Horā`, tone: "hora" };
    day.reasons.push({
      delta: 3,
      kind: "kaala",
      text: `${best.lordName} horā (${best.quality}) is the cleanest block — ${best.use.split(".")[0].toLowerCase()}`,
    });
    day.score = Math.min(100, day.score + 3);
  } else if (!day.window) {
    day.reasons.push({ delta: -8, kind: "kaala", text: "No daylight block survives the three kālas — an evening ritual or another day is better" });
    day.score = Math.max(0, day.score - 8);
  }
  return day;
}

function dayAt(y: number, m: number, d: number, tz: string) {
  return zonedToUtcMs(y, m, d, 12, 0, tz);
}

export interface MuhuratQuery {
  purpose: MuhuratPurpose;
  /** inclusive ISO dates (YYYY-MM-DD), interpreted in `place`'s time zone */
  fromISO: string;
  toISO: string;
  place: { name?: string; lat: number; lon: number; tz: string };
  ayanamsa?: "lahiri" | "kp";
  /** hard cap on days scanned (default 90) */
  limit?: number;
}

export function findMuhurat(q: MuhuratQuery): MuhuratResult {
  const def = MUHURAT_PURPOSES.find((d) => d.id === q.purpose) ?? MUHURAT_PURPOSES[0];
  const [fy, fm, fd] = q.fromISO.split("-").map(Number);
  const [ty, tm, td] = q.toISO.split("-").map(Number);
  let ms = dayAt(fy, fm, fd, q.place.tz);
  const last = dayAt(ty, tm, td, q.place.tz);
  const limit = q.limit ?? 90;
  const days: MuhuratDay[] = [];
  let scanned = 0;
  while (ms <= last && scanned < limit) {
    const p = panchangaAt(ms, { lat: q.place.lat, lon: q.place.lon, tz: q.place.tz }, q.ayanamsa ?? "lahiri");
    const day = scoreMuhuratDay(p, def, ms);
    pickMuhuratWindow(day, p, def);
    days.push(day);
    ms += 86400000;
    scanned++;
  }
  const order = { best: 0, good: 1, fair: 2, avoid: 3 } as const;
  const ranked = [...days].sort((a, b) => order[a.klass] - order[b.klass] || b.score - a.score || a.atMs - b.atMs);
  return {
    def,
    from: q.fromISO,
    to: q.toISO,
    tz: q.place.tz,
    days,
    ranked,
    best: ranked.find((d) => d.klass !== "avoid") ?? null,
    scanned,
  };
}
