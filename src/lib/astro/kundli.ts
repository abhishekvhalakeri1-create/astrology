/**
 * Janma Kuṇḍlī engine — turns birth date/time/place into a full Vedic chart:
 * graha positions, houses, divisional charts, daśās, yogas, doshas and remedies.
 */
import {
  HOUSES,
  NAKSHATRA_SPAN,
  NAKSHATRAS,
  PADA_SPAN,
  PLANET_BY_ID,
  SIGNS,
  SPECIAL_ASPECTS,
  type Graha,
  KAAL_SARP_TYPES,
} from "../../data/reference";
import {
  ayanamsa,
  angDiff,
  ascendant,
  GRAHA_IDS,
  bodyPosition,
  norm360,
  zonedToUtcMs,
  type AyanamsaId,
} from "./core";
import { panchangaAt } from "./panchanga";
import { vimshottari, type DashaResult } from "./dasha";

export interface BirthPlace {
  name: string;
  region?: string;
  country?: string;
  lat: number;
  lon: number;
  tz: string;
}

export interface BirthInput {
  name: string;
  gender?: "male" | "female" | "other";
  /** calendar date of birth in the place of birth, "YYYY-MM-DD" */
  dob: string;
  /** local clock time of birth, "HH:MM" */
  tob: string;
  place: BirthPlace;
  ayanamsa?: AyanamsaId;
  /** topocentric graha positions (uses the place of birth as the observer) */
  topocentric?: boolean;
}

export type Dignity = "exalted" | "own" | "friend" | "neutral" | "enemy" | "debilitated" | "node";

export interface GrahaChartRow {
  id: Graha;
  name: string;
  sanskrit: string;
  glyph: string;
  trop: number;
  sid: number;
  sign: number;
  signName: string;
  degInSign: number;
  formatted: string;
  nakshatra: number;
  nakshatraName: string;
  pada: number;
  house: number;
  retro: boolean;
  speed: number;
  combust: boolean;
  combustOrb: number;
  dignity: Dignity;
  dignityScore: number;
  navamsaSign: number;
  drekkanaSign: number;
  dashamsaSign: number;
  vargottama: boolean;
  aspectsOn: { by: Graha; kind: "drishti" | "conjunction" }[];
  aspectsTo: number[];
}

export interface YogaHit {
  id: string;
  name: string;
  sanskrit: string;
  nature: "auspicious" | "mixed" | "inauspicious";
  grahas: Graha[];
  houses: number[];
  text: string;
  strength: number; // 0..100
  remedy: string;
  services: string[];
}

export interface DoshaHit {
  id: string;
  name: string;
  sanskrit: string;
  present: boolean;
  severity: "none" | "mild" | "moderate" | "strong";
  detail: string;
  cancelled: boolean;
  cancelReason?: string;
  remedy: string;
  services: string[];
}

export interface HouseRow {
  n: number;
  name: string;
  sanskrit: string;
  sign: number;
  signName: string;
  lord: Graha;
  lordHouse: number;
  lordDignity: Dignity;
  planets: Graha[];
  aspects: Graha[];
  empty: boolean;
  theme: string;
  rules: string;
}

export interface KarakaRow {
  rank: number;
  id: Graha;
  name: string;
  label: string;
  sidereal: number;
  house: number;
}

export interface KundliResult {
  input: BirthInput;
  utcMs: number;
  ayanamsaDeg: number;
  ayanamsaKind: AyanamsaId;
  lagna: {
    sid: number;
    trop: number;
    sign: number;
    signName: string;
    degInSign: number;
    formatted: string;
    nakshatra: number;
    nakshatraName: string;
    pada: number;
    lord: Graha;
    navamsaSign: number;
  };
  sunSign: number;
  moonSign: number;
  moonNakshatra: number;
  moonPada: number;
  gana: string;
  yoni: string;
  varna: string;
  nadi: number;
  grahas: GrahaChartRow[];
  houses: HouseRow[];
  bySign: Record<number, Graha[]>;
  dasha: DashaResult;
  yogas: YogaHit[];
  doshas: DoshaHit[];
  karakas: KarakaRow[];
  strengths: { id: Graha; name: string; score: number; note: string; rank: number }[];
  luck: {
    lagnaLord: Graha;
    chandraLord: Graha;
    atmaKaraka: Graha;
    gemstone: string;
    altGemstone: string;
    colour: string;
    number: number;
    day: string;
    direction: string;
    metal: string;
    tree: string;
    deity: string;
    mantra: string;
    charity: string;
    note: string;
  };
  birthPanchanga: ReturnType<typeof panchangaAt>;
  notes: string[];
}

const DIGNITY_SCORE: Record<Dignity, number> = {
  exalted: 100,
  own: 90,
  friend: 65,
  neutral: 45,
  enemy: 25,
  debilitated: 10,
  node: 45,
};

const pad = (n: number) => n.toFixed(2).padStart(5, "0");

/** degrees-minutes-seconds of position inside a sign */
export function dms(degInSign: number): string {
  const d = Math.floor(degInSign);
  const mFloat = (degInSign - d) * 60;
  const m = Math.floor(mFloat);
  const s = Math.round((mFloat - m) * 60);
  const mm = s === 60 ? 0 : m;
  return `${pad(d)}° ${String(mm).padStart(2, "0")}′ ${String(s === 60 ? 0 : s).padStart(2, "0")}″`;
}

export function navamsaSignOf(sign: number, degInSign: number): number {
  const n = Math.min(8, Math.floor(degInSign / (30 / 9)));
  return sign % 2 === 0 ? (sign + 9 * n) % 12 : (sign + 3 * n) % 12;
}

export function drekkanaSignOf(sign: number, degInSign: number): number {
  const n = Math.min(2, Math.floor(degInSign / 10));
  if (n === 0) return sign;
  const step = sign % 2 === 0 ? [0, 4, 8] : [0, 8, 4];
  return (sign + step[n]) % 12;
}

/** Dashāṁsa (D-10) with the movable/fixed/dual start rule of BPHS. */
export function dashamsaSignOf(sign: number, degInSign: number): number {
  const n = Math.min(9, Math.floor(degInSign / 3));
  const quality = SIGNS[sign].quality;
  const start = quality === "Movable" ? sign : quality === "Fixed" ? (sign + 8) % 12 : (sign + 4) % 12;
  return (start + 10 * n) % 12;
}

export function dignityOf(id: Graha, sign: number): Dignity {
  const p = PLANET_BY_ID[id];
  if (id === "Ra" || id === "Ke") return "node";
  if (p.debilitSign === sign) return "debilitated";
  if (p.exaltSign === sign) return "exalted";
  if (p.ownSigns?.includes(sign)) return "own";
  if (p.friendSigns?.includes(sign)) return "friend";
  if (p.enemySigns?.includes(sign)) return "enemy";
  return "neutral";
}

const kootaNadi = (nak: number) => (nak % 3) + 1; // Ādi / Madhya / Antya

export function computeKundli(input: BirthInput): KundliResult {
  const ayaKind: AyanamsaId = input.ayanamsa ?? "lahiri";
  const [y, mo, d] = input.dob.split("-").map(Number);
  const [hh, mm] = (input.tob || "12:00").split(":").map(Number);
  const { lat, lon, tz } = input.place;
  const utcMs = zonedToUtcMs(y, mo || 1, d || 1, hh || 0, mm || 0, tz);
  const aya = ayanamsa(ayaKind, utcMs);
  const topo = input.topocentric ? { lat, lon, elev: 0 } : undefined;

  const raw = (id: string) => bodyPosition(id, utcMs, topo ? { topo } : {});
  const siderealOf = (id: string) => norm360(raw(id).trop - aya);

  const lagnaTrop = ascendant(utcMs, lat, lon);
  const lagnaSid = lagnaTrop === null ? 0 : norm360(lagnaTrop - aya);
  const lagnaSign = Math.floor(lagnaSid / 30) % 12;
  const lagnaDeg = lagnaSid % 30;
  const moonSid = siderealOf("Mo");
  const sunSid = siderealOf("Su");
  const moonNak = Math.floor(moonSid / NAKSHATRA_SPAN) % 27;
  const moonPada = Math.floor((moonSid % NAKSHATRA_SPAN) / PADA_SPAN) % 4;
  const nak = NAKSHATRAS[moonNak];

  // ── graha rows ────────────────────────────────────────────────────────────
  const rows: GrahaChartRow[] = GRAHA_IDS.map((id) => {
    const p = raw(id);
    const info = PLANET_BY_ID[id];
    const sid = norm360(p.trop - aya);
    const sign = Math.floor(sid / 30) % 12;
    const degInSign = sid % 30;
    const house = ((sign - lagnaSign + 12) % 12) + 1;
    const sunDist = Math.abs(angDiff(sid, sunSid));
    const limit = info.combustLimit ?? (id === "Mo" ? 12 : undefined);
    const dignity = dignityOf(id, sign);
    const nav = navamsaSignOf(sign, degInSign);
    const grahaNak = Math.floor(sid / NAKSHATRA_SPAN) % 27;
    return {
      id,
      name: info.name,
      sanskrit: info.sanskrit,
      glyph: info.glyph,
      trop: p.trop,
      sid,
      sign,
      signName: SIGNS[sign].name,
      degInSign,
      formatted: dms(degInSign),
      nakshatra: grahaNak,
      nakshatraName: NAKSHATRAS[grahaNak].name,
      pada: Math.floor((sid % NAKSHATRA_SPAN) / PADA_SPAN) % 4,
      house,
      retro: p.retro,
      speed: p.speed,
      combust: limit !== undefined && id !== "Su" && sunDist < limit,
      combustOrb: sunDist,
      dignity,
      dignityScore: DIGNITY_SCORE[dignity],
      navamsaSign: nav,
      drekkanaSign: drekkanaSignOf(sign, degInSign),
      dashamsaSign: dashamsaSignOf(sign, degInSign),
      vargottama: nav === sign,
      aspectsOn: [],
      aspectsTo: SPECIAL_ASPECTS[id].map((k) => ((sign + k - 1 - lagnaSign + 12) % 12) + 1),
    };
  });

  const byId = new Map(rows.map((r) => [r.id, r]));
  // aspects + conjunctions received by each graha
  for (const r of rows) {
    for (const other of rows) {
      if (other.id === r.id) continue;
      const fromSign = other.sign;
      const delta = ((r.sign - fromSign + 12) % 12) + 1;
      const drishti = SPECIAL_ASPECTS[other.id].includes(delta);
      if (drishti) r.aspectsOn.push({ by: other.id, kind: "drishti" });
      else if (other.sign === r.sign) r.aspectsOn.push({ by: other.id, kind: "conjunction" });
    }
  }

  const bySign: Record<number, Graha[]> = {};
  for (const r of rows) (bySign[r.sign] ??= []).push(r.id);

  // ── houses ───────────────────────────────────────────────────────────────
  const houses: HouseRow[] = HOUSES.map((h) => {
    const sign = (lagnaSign + h.n - 1) % 12;
    const lord = SIGNS[sign].lord;
    const lordRow = byId.get(lord);
    const planets = rows.filter((r) => r.house === h.n).map((r) => r.id);
    const aspects = rows
      .filter((r) => r.house !== h.n && r.aspectsTo.includes(h.n))
      .map((r) => r.id);
    return {
      n: h.n,
      name: h.name,
      sanskrit: "",
      sign,
      signName: SIGNS[sign].name,
      lord,
      lordHouse: lordRow?.house ?? 0,
      lordDignity: dignityOf(lord, sign),
      planets,
      aspects,
      empty: planets.length === 0,
      theme: h.theme,
      rules: h.rules,
    };
  });

  // ── chara karakas (Jaimini, 8 grahas incl. Rahu) ──────────────────────────
  const KARAKA_LABELS = [
    "Atmakaraka — soul, self",
    "Amatyakaraka — career, support",
    "Bhratrikaraka — siblings, effort",
    "Matrukarakā — mother, mind",
    "Putrakaraka — children, creativity",
    "Gnatikaraka — relatives, friends",
    "Sahayadakaraka — courage, partners",
    "Darakaraka — spouse, contracts",
  ];
  const karakas: KarakaRow[] = [...rows.filter((r) => r.id !== "Ke")]
    .sort((a, b) => b.sid - a.sid)
    .slice(0, 8)
    .map((r, i) => ({
      rank: i + 1,
      id: r.id,
      name: r.name,
      label: KARAKA_LABELS[i] ?? "",
      sidereal: r.sid,
      house: r.house,
    }));

  // ── strengths ───────────────────────────────────────────────────────────────
  const strengths = rows
    .map((r) => {
      let score = r.dignityScore;
      if (r.vargottama) score += 8;
      if (r.retro && r.id !== "Ra" && r.id !== "Ke") score += 5;
      if (r.combust) score -= 18;
      if (r.house === 1 || r.house === 4 || r.house === 7 || r.house === 10) score += 6;
      if (r.house === 6 || r.house === 8 || r.house === 12) score -= 5;
      const navDignity = dignityOf(r.id, r.navamsaSign);
      if (navDignity === "exalted" || navDignity === "own") score += 8;
      if (navDignity === "debilitated") score -= 10;
      return {
        id: r.id,
        name: r.name,
        score: Math.max(2, Math.min(100, Math.round(score))),
        note: [
          r.dignity === "exalted" ? "Uccha (exalted)" : "",
          r.dignity === "debilitated" ? "Neecha (debilitated)" : "",
          r.dignity === "own" ? "Svakshetra (own sign)" : "",
          r.vargottama ? "Vargottama in Navāṁsa" : "",
          r.combust ? "Astaṅgata (combust)" : "",
          r.retro && r.id !== "Ra" && r.id !== "Ke" ? "Vakri (retrograde)" : "",
        ]
          .filter(Boolean)
          .join(", ") || "Neutral position",
        rank: 0,
      };
    })
    .sort((a, b) => b.score - a.score)
    .map((s, i) => ({ ...s, rank: i + 1 }));

  const dasha = vimshottari(moonSid, utcMs);

  // ── yogas & doshas ──────────────────────────────────────────────────────────
  const yogas = detectYogas(rows, byId, lagnaSign, houses);
  const doshas = detectDoshas(rows, byId, lagnaSign, moonSid);

  // ── luck & remedies ─────────────────────────────────────────────────────────
  const lagnaLord = SIGNS[lagnaSign].lord;
  const atma = karakas[0]?.id ?? nak.lord;
  const luckyPlanet = nak.lord;
  const lp = PLANET_BY_ID[luckyPlanet];
  const ll = PLANET_BY_ID[lagnaLord];
  const luck = {
    lagnaLord,
    chandraLord: nak.lord,
    atmaKaraka: atma,
    gemstone: lp.gem,
    altGemstone: ll.gem,
    colour: lp.color,
    number: SIGNS[Math.floor(moonSid / 30) % 12].number,
    day: lp.day,
    direction: lp.direction,
    metal: lp.metal,
    tree: lp.tree,
    deity: lp.deva,
    mantra: lp.mantras[0] ?? "",
    charity: `Donate ${lp.color.split(" ")[0].toLowerCase()} items, ${lp.metal.toLowerCase()} or ${lp.tree.toLowerCase()}-related goods on ${lp.day}.`,
    note: `Ratna is assigned from the lord of your janma nakṣatra (${nak.name} → ${lp.name}). Test a gem for 3 days before regular wear, and confirm with a consultation.`,
  };

  const notes: string[] = [];
  if (lagnaTrop === null) {
    notes.push(
      "No rising ecliptic point at this latitude/time (polar case) — Lagna shown as 0° Aries; use a manual chart for this birth.",
    );
  }
  notes.push(
    `Positions use the Lahiri (Chitrapaksha) ayanāṁsa at ${aya.toFixed(4)}°, ${
      input.topocentric ? "topocentric" : "geocentric"
    } graha places and the mean (Vakya) lunar node.`,
  );
  notes.push(
    "Houses are whole-sign (Rāśi) from the Lagna; Bhava positions use equal 30° spans from the exact Lagna degree.",
  );

  return {
    input,
    utcMs,
    ayanamsaDeg: aya,
    ayanamsaKind: ayaKind,
    lagna: {
      sid: lagnaSid,
      trop: lagnaTrop ?? 0,
      sign: lagnaSign,
      signName: SIGNS[lagnaSign].name,
      degInSign: lagnaDeg,
      formatted: dms(lagnaDeg),
      nakshatra: Math.floor(lagnaSid / NAKSHATRA_SPAN) % 27,
      nakshatraName: NAKSHATRAS[Math.floor(lagnaSid / NAKSHATRA_SPAN) % 27].name,
      pada: Math.floor((lagnaSid % NAKSHATRA_SPAN) / PADA_SPAN) % 4,
      lord: lagnaLord,
      navamsaSign: navamsaSignOf(lagnaSign, lagnaDeg),
    },
    sunSign: Math.floor(sunSid / 30) % 12,
    moonSign: Math.floor(moonSid / 30) % 12,
    moonNakshatra: moonNak,
    moonPada,
    gana: nak.gana,
    yoni: nak.yoni,
    varna: NAKSHATRA_VARNA[nak.varna],
    nadi: kootaNadi(moonNak),
    grahas: rows,
    houses,
    bySign,
    dasha,
    yogas,
    doshas,
    karakas,
    strengths,
    luck,
    birthPanchanga: panchangaAt(utcMs, { lat, lon, tz }, ayaKind),
    notes,
  };
}

const NAKSHATRA_VARNA = ["Brahmin", "Kshatriya", "Vaishya", "Shudra"];

/* ------------------------------------------------------------------ *
 * Yoga detection
 * ------------------------------------------------------------------ */

const KENDRA = [1, 4, 7, 10];
const TRIKONA = [1, 5, 9];
const UPACHAYA = [3, 6, 10, 11];

type RowMap = Map<Graha, GrahaChartRow>;
const houseOf = (m: RowMap, g: Graha) => m.get(g)?.house ?? 0;
const signOf = (m: RowMap, g: Graha) => m.get(g)?.sign ?? -1;
const same = (a: number, b: number) => ((a - b + 12) % 12);
const isKendraFrom = (from: number, to: number) => KENDRA.includes(same(to, from) + 1);
const isTrikonaFrom = (from: number, to: number) => TRIKONA.includes(same(to, from) + 1);

function lordOfSign(sign: number): Graha {
  return SIGNS[((sign % 12) + 12) % 12].lord;
}

function detectYogas(rows: GrahaChartRow[], byId: RowMap, lagnaSign: number, houses: HouseRow[]): YogaHit[] {
  const hits: YogaHit[] = [];
  const push = (y: Omit<YogaHit, "strength"> & { strength?: number }) =>
    hits.push({ ...y, strength: y.strength ?? 70 });

  const moonHouse = houseOf(byId, "Mo");
  const moonSign = signOf(byId, "Mo");
  const jupSign = signOf(byId, "Ju");

  // 1. Pañcha Mahāpuruṣa
  const maha: [Graha, string, string, string][] = [
    ["Ma", "Ruchaka", "रूचक", "command, courage, property and technical mastery"],
    ["Me", "Bhadra", "भद्र", "intellect, speech, commerce and writing"],
    ["Ju", "Hamsa", "हंस", "wisdom, teaching, wealth and reputation"],
    ["Ve", "Malavya", "मालव्य", "art, luxury, vehicles and charisma"],
    ["Sa", "Shasha", "शश", "land, organisation, endurance and late flowering"],
  ];
  for (const [g, name, sk, effect] of maha) {
    const r = byId.get(g);
    if (!r) continue;
    if ((r.dignity === "exalted" || r.dignity === "own") && KENDRA.includes(r.house)) {
      push({
        id: `maha-${g}`,
        name,
        sanskrit: sk,
        nature: "auspicious",
        grahas: [g],
        houses: [r.house],
        text: `${r.name} in ${r.signName} (${r.dignity === "exalted" ? "Uccha" : "own sign"}) in the ${ordinal(r.house)} from the Lagna forms a ${name} Yoga: ${effect}. The ${HOUSES[r.house - 1].theme.toLowerCase()} area of life carries exceptional natural strength.`,
        strength: 78 + (r.vargottama ? 12 : 0) + (r.retro ? 4 : 0),
        remedy: `Strengthen ${r.name} with ${PLANET_BY_ID[g].day} practice, ${PLANET_BY_ID[g].gem.split(" (")[0].toLowerCase()} charity and the ${r.name.toLowerCase()} mantra.`,
        services: ["puja-mahapurusha", "consult-30", "gem-advise"],
      });
    }
  }

  // 2. Gajakesari
  if (isKendraFrom(moonSign, jupSign)) {
    push({
      id: "gajakesari",
      name: "Gajakeśarī",
      sanskrit: "गजकेसरि",
      nature: "auspicious",
      grahas: ["Ju", "Mo"],
      houses: [houseOf(byId, "Ju"), moonHouse],
      text: `Jupiter in the ${ordinal(houseOf(byId, "Ju"))} from the Moon casts a protecting gaze over your mind and public image: name, learning, ethical leadership and support from mentors. ${isKendraFrom(jupSign, moonSign) ? "The mutual kendra makes it full-strength." : "Partial — the Moon does not return the aspect, so results come through effort."}`,
      strength: isKendraFrom(jupSign, moonSign) ? 88 : 66,
      remedy: "Thursday Brihaspati japa; donate books and yellow food.",
      services: ["puja-guru", "consult-30"],
    });
  }

  // 3. Budhāditya
  const me = byId.get("Me");
  const su = byId.get("Su");
  if (me && su && me.sign === su.sign && me.combustOrb < 14) {
    push({
      id: "budhaditya",
      name: "Budhāditya",
      sanskrit: "बुधादित्य",
      nature: "mixed",
      grahas: ["Me", "Su"],
      houses: [me.house],
      text: `Mercury joins the Sun in ${me.signName} — sharp intellect, persuasive speech and research ability.${me.combust ? " Because Mercury is combust here, ideas need patience to become visible; speak with timing rather than volume." : " Strong: intelligence converts into reputation."}`,
      strength: me.combust ? 48 : 80,
      remedy: "Wednesday Ganesha worship; write daily; teach one thing you know.",
      services: ["consult-15", "career-package"],
    });
  }

  // 4. Chandra-Mangala
  const ma = byId.get("Ma");
  if (ma && (ma.sign === moonSign || isKendraFrom(moonSign, ma.sign))) {
    push({
      id: "chandra-mangala",
      name: "Chandra-Maṅgala",
      sanskrit: "चन्द्रमङ्गल",
      nature: "auspicious",
      grahas: ["Mo", "Ma"],
      houses: [moonHouse, ma.house],
      text: "Moon and Mars combine into a Chandra-Mangala Yoga — entrepreneurial drive, emotional courage and money made through initiative and machinery/technology. Handle temper so the gains are not burned in disputes.",
      strength: 72,
      remedy: "Tuesday Hanuman worship; channel intensity into sport or building.",
      services: ["business-package", "puja-mangal"],
    });
  }

  // 5. Guru-Chandala
  const ra = byId.get("Ra");
  if (ra && ra.sign === jupSign) {
    push({
      id: "guru-chandala",
      name: "Guru-Chaṇḍāla",
      sanskrit: "गुरुचण्डाल",
      nature: "mixed",
      grahas: ["Ju", "Ra"],
      houses: [ra.house],
      text: `Jupiter with Rāhu in ${ra.signName}: unorthodox intelligence, powerful for research, media, coding and foreign connections, but it can stretch ethics and guru relationships. Keep counsel of one sober mentor before big commitments.`,
      strength: 55,
      remedy: "Guru mantras, honesty in teaching/contracts, Rahu shanti on Saturdays.",
      services: ["puja-rahu", "consult-30"],
    });
  }

  // 6. Kemadrūma (with cancellations)
  const support = rows.filter((r) => isKendraFrom(moonSign, r.sign) && r.id !== "Mo");
  if (support.length === 0) {
    const cancels = moonSign === 3 || isKendraFrom(moonSign, jupSign) || rows.some((r) => same(r.sign, moonSign) === 1 || same(r.sign, moonSign) === 11);
    push({
      id: "kemadruma",
      name: "Kemadrūma",
      sanskrit: "केन्द्रद्रुम",
      nature: cancels ? "mixed" : "inauspicious",
      grahas: ["Mo"],
      houses: [moonHouse],
      text: cancels
        ? "The classical Kemadrūma condition (no graha in the four houses around the Moon) is present but cancelled by a benefic support rule — expect self-reliance that matures into independence rather than isolation."
        : "No graha occupies the kendras around the Moon: a Kemadrūma signature of emotional self-sufficiency that can feel like loneliness in crowds. Building chosen family, mentoring and regular community practice reverses it.",
      strength: cancels ? 45 : 30,
      remedy: "Monday Shiva/Parvati worship; feed women and children; keep a silver water cup.",
      services: ["puja-chandra", "consult-30"],
    });
  }

  // 7. Sunaphā / Caphā / Dhūrdhura
  const twoFromMoon = rows.filter((r) => same(r.sign, moonSign) === 1).map((r) => r.id);
  const twelveFromMoon = rows.filter((r) => same(r.sign, moonSign) === 11).map((r) => r.id);
  const benefics = new Set<Graha>(["Ju", "Ve", "Me", "Mo"]);
  if (twoFromMoon.length && twelveFromMoon.length) {
    push({
      id: "dhurdhura",
      name: "Dhūrādhūra",
      sanskrit: "धूराधूर",
      nature: "auspicious",
      grahas: [...twoFromMoon, ...twelveFromMoon],
      houses: [moonHouse],
      text: "Grahas flank the Moon on both sides — a royal-yoga class signature of protection, income from two directions and people who guard your back.",
      strength: 80,
      remedy: "Keep both generosity (12th) and savings (2nd) in balance; Monday charity.",
      services: ["consult-15"],
    });
  } else if (twoFromMoon.length) {
    push({
      id: "sunapha",
      name: "Sunaphā",
      sanskrit: "सुनफा",
      nature: "auspicious",
      grahas: twoFromMoon,
      houses: [((moonHouse + 1 - 1) % 12) + 1],
      text: `${twoFromMoon.map((g) => PLANET_BY_ID[g].name).join(", ")} in the 2nd from the Moon gives Sunaphā Yoga — wealth, speech and accumulating ability${twoFromMoon.some((g) => benefics.has(g)) ? ", especially through writing, teaching or finance." : ", through persistent effort."}`,
      strength: 74,
      remedy: "Protect family money; feed one person daily.",
      services: ["money-package"],
    });
  } else if (twelveFromMoon.length) {
    push({
      id: "chapha",
      name: "Chaphā",
      sanskrit: "चफा",
      nature: "mixed",
      grahas: twelveFromMoon,
      houses: [moonHouse],
      text: "Grahas in the 12th from the Moon spend energy and money quickly; with a benefic there it becomes a spiritual/foreign-gain signature, with malefics watch leaks, sleep and undisclosed expenses.",
      strength: 45,
      remedy: "Fixed savings on autopay; midnight discipline with screens and spend.",
      services: ["money-package", "consult-15"],
    });
  }

  // 8. Śaṅkata
  const jupFromMoon = same(jupSign, moonSign) + 1;
  if (jupFromMoon === 6 || jupFromMoon === 8) {
    const cancel = isKendraFrom(lagnaSign, jupSign) || isKendraFrom(lagnaSign, moonSign);
    push({
      id: "shakata",
      name: "Śaṅkata",
      sanskrit: "शकट",
      nature: cancel ? "mixed" : "inauspicious",
      grahas: ["Ju", "Mo"],
      houses: [houseOf(byId, "Ju"), moonHouse],
      text: `Jupiter sits in the ${ordinal(jupFromMoon)} from the Moon — the wheel-and-cart yoga of rise and fall in fortune. ${cancel ? "A kendra from the Lagna cancels most of it: stability returns after each cycle." : "Steady routines, a fixed mentor and avoiding leverage smooth the bumps."}`,
      strength: cancel ? 55 : 35,
      remedy: "Mahalakshmi japa on Fridays; keep promises about money.",
      services: ["puja-lakshmi", "consult-30"],
    });
  }

  // 9. Ādhi (benefics in 6,7,8 from Moon)
  const adhi = rows.filter((r) => [6, 7, 8].includes(same(r.sign, moonSign) + 1) && benefics.has(r.id));
  if (adhi.length >= 2) {
    push({
      id: "adhi",
      name: "Ādhi",
      sanskrit: "अधि",
      nature: "auspicious",
      grahas: adhi.map((r) => r.id),
      houses: adhi.map((r) => r.house),
      text: "Two or more benefics in the 6th–8th from the Moon form Ādhi Yoga — protection from enmity, strong recovery from illness and comfort through intellect.",
      strength: 76,
      remedy: "Maintain cleanliness at home; support hospital or animal welfare.",
      services: ["consult-15"],
    });
  }

  // 10. Parivartana (sign exchange)
  for (const a of rows) {
    for (const b of rows) {
      if (a.id >= b.id) continue;
      if (lordOfSign(a.sign) === b.id && lordOfSign(b.sign) === a.id) {
        push({
          id: `parivartana-${a.id}-${b.id}`,
          name: "Parivartana",
          sanskrit: "परिवर्तन",
          nature: "auspicious",
          grahas: [a.id, b.id],
          houses: [a.house, b.house],
          text: `${a.name} and ${b.name} exchange signs — a Parivartana Yoga that makes both areas work for each other: what you give in the ${ordinal(a.house)} returns through the ${ordinal(b.house)}.`,
          strength: 70,
          remedy: "Keep both sides of the exchange honest — contracts and family obligations.",
          services: ["consult-30"],
        });
      }
    }
  }

  // 11. Dharma-Karmādhipati & Lakṣmī Rāja yogas
  const combos: [number, number, string, string][] = [
    [9, 10, "Dharma-Karmādhipati Rāja Yoga", "Fortune and career lords unite — a signature of rise through righteous work, leadership and public usefulness."],
    [1, 9, "Dharma-Kendra Rāja Yoga", "The Lagna and 9th lords unite — personal identity rides on luck, mentors and pilgrimage-like career turns."],
    [5, 9, "Vidyā-Guṇa Rāja Yoga", "Creativity/children lord with fortune lord — intelligence, teaching, and blessings through children or students."],
    [2, 11, "Lakṣmī Dhana Yoga", "Wealth and gains lords unite — money circulates and compounds; income arrives through networks."],
    [1, 5, "Svayaṁ Rāja Yoga", "Self and intellect/children lords unite — success built from one's own initiative and creative output."],
  ];
  for (const [h1, h2, name, text] of combos) {
    const l1 = houses[h1 - 1].lord;
    const l2 = houses[h2 - 1].lord;
    if (l1 === l2) continue; // same lord: counted once
    const r1 = byId.get(l1);
    const r2 = byId.get(l2);
    if (!r1 || !r2) continue;
    const conjunct = r1.sign === r2.sign;
    const mutualKendra = isKendraFrom(r1.sign, r2.sign) || isKendraFrom(r2.sign, r1.sign);
    const mutualTrikona = isTrikonaFrom(r1.sign, r2.sign) || isTrikonaFrom(r2.sign, r1.sign);
    const aspected = r1.aspectsTo.includes(h2) || r2.aspectsTo.includes(h1);
    if (conjunct || mutualKendra || mutualTrikona || aspected) {
      const weak = r1.dignity === "debilitated" || r2.dignity === "debilitated" || r1.combust || r2.combust;
      push({
        id: `raja-${h1}-${h2}`,
        name,
        sanskrit: "राजयोग",
        nature: weak ? "mixed" : "auspicious",
        grahas: [l1, l2],
        houses: [h1, h2],
        text: `${text} Formed by ${PLANET_BY_ID[l1].name} (${ordinal(h1)} lord) with ${PLANET_BY_ID[l2].name} (${ordinal(h2)} lord)${conjunct ? " in the same sign" : aspected ? " by aspect" : " in mutual angles"}.${weak ? " Weakened by debilitation/combustion — the results arrive late and need cleaning up of the affected area." : ""}`,
        strength: conjunct ? 84 : mutualKendra || mutualTrikona ? 74 : 60,
        remedy: `Honour both lords: ${PLANET_BY_ID[l1].day} for ${PLANET_BY_ID[l1].name}, ${PLANET_BY_ID[l2].day} for ${PLANET_BY_ID[l2].name}.`,
        services: ["consult-30", "career-package"],
      });
    }
  }

  // 12. Neecha-bhaṅga
  for (const r of rows) {
    if (r.dignity !== "debilitated") continue;
    const debilityLord = lordOfSign(r.sign);
    const exaltLord = lordOfSign(PLANET_BY_ID[r.id].exaltSign ?? 0);
    const dl = byId.get(debilityLord);
    const el = byId.get(exaltLord);
    const condA = dl && (isKendraFrom(lagnaSign, dl.sign) || isKendraFrom(moonSign, dl.sign));
    const condB = el && (isKendraFrom(lagnaSign, el.sign) || isKendraFrom(moonSign, el.sign));
    const condC = r.house === 10 || r.house === 6;
    if (condA || condB || condC) {
      push({
        id: `neecha-bhanga-${r.id}`,
        name: "Nīcha-bhaṅga",
        sanskrit: "नीचभङ्ग",
        nature: "auspicious",
        grahas: [r.id, ...(condA ? [debilityLord] : []), ...(condB ? [exaltLord] : [])],
        houses: [r.house],
        text: `${r.name} is debilitated in ${r.signName}, but the cancellation rule (${condA ? "lord of that sign in a kendra" : condB ? "lord of its exaltation sign in a kendra" : "Kendra/Mrita-style strength"}) fires: what begins as weakness in the ${ordinal(r.house)} house turns into a hard-won specialty — the classic "falls then rises" pattern.`,
        strength: 62,
        remedy: `Work with ${r.name} directly rather than around it: ${PLANET_BY_ID[r.id].mantras[0] ?? ""}`,
        services: ["consult-30", "puja-navagraha"],
      });
    }
  }

  // 13. Viprīta Rāja Yoga (dusthana lords)
  for (const [d, good] of [[6, 11], [8, 3], [12, 3]] as [number, number][]) {
    const lord = houses[d - 1].lord;
    const lr = byId.get(lord);
    if (!lr) continue;
    if (lr.house === good && (lr.dignity === "own" || lr.dignity === "exalted" || lr.dignity === "friend")) {
      push({
        id: `vipreeta-${d}`,
        name: "Viprīta Rāja Yoga",
        sanskrit: "विपरीतराजयोग",
        nature: "auspicious",
        grahas: [lord],
        houses: [d, good],
        text: `The 6th/8th/12th lord ${PLANET_BY_ID[lord].name} sits in an upachaya kona in good dignity — difficulties convert into advancement: success through crises, competition, insurance, healing or restructuring.`,
        strength: 60,
        remedy: "Serve without expectation; keep hygiene of debt and health.",
        services: ["consult-30"],
      });
    }
  }

  // 15. Gaja Kesari from the Lagna (Jupiter strong in kendra)
  const ju = byId.get("Ju");
  if (ju && KENDRA.includes(ju.house) && (ju.dignity === "exalted" || ju.dignity === "own")) {
    push({
      id: "guru-kendra",
      name: "Bṛhaspati Kendra",
      sanskrit: "गुरुकेन्द्र",
      nature: "auspicious",
      grahas: ["Ju"],
      houses: [ju.house],
      text: `Jupiter exalted/own in the ${ordinal(ju.house)} house: a natural teacher-figure in your chart. Blessings, children, learning and ethical wealth are the backbone of your luck.`,
      strength: 82,
      remedy: "Thursday guru dakshina; keep one student or mentee.",
      services: ["gem-advise", "consult-30"],
    });
  }

  // de-duplicate by id, keep the strongest
  const seen = new Map<string, YogaHit>();
  for (const y of hits) if (!seen.has(y.id) || seen.get(y.id)!.strength < y.strength) seen.set(y.id, y);
  return [...seen.values()].sort((a, b) => b.strength - a.strength);
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
}

/* ------------------------------------------------------------------ *
 * Doshas
 * ------------------------------------------------------------------ */

function detectDoshas(rows: GrahaChartRow[], byId: RowMap, lagnaSign: number, moonSid: number): DoshaHit[] {
  const out: DoshaHit[] = [];
  const ma = byId.get("Ma");
  const ju = byId.get("Ju");
  const ra = byId.get("Ra");
  const ke = byId.get("Ke");
  const moonSign = Math.floor(moonSid / 30) % 12;

  // Kuja / Mangal dosha
  {
    const fromLagna = ma ? [1, 2, 4, 7, 8, 12].includes(ma.house) : false;
    const fromMoon = ma ? ((ma.sign - moonSign + 12) % 12) + 1 : 0;
    const severeHouses = fromLagna && ma ? [1, 8].includes(ma.house) : false;
    const moderate = fromLagna && ma ? [4, 7].includes(ma.house) : false;
    const jupiterLooks = !!ju && ju.aspectsTo.includes(ma?.house ?? 0);
    const cancel =
      !!ma &&
      (ma.sign === 0 || ma.sign === 7 || ma.sign === 2 || ma.sign === 5 || lagnaSign === 1 || lagnaSign === 6 || jupiterLooks || ma.dignity === "exalted");
    const reasons: string[] = [];
    if (ma && (ma.sign === 0 || ma.sign === 7)) reasons.push("Mars in its own sign");
    if (ma && (ma.sign === 2 || ma.sign === 5)) reasons.push("Mars in Gemini/Virgo (upachaya-friendly)");
    if (lagnaSign === 1 || lagnaSign === 6) reasons.push("Vrishabha/Tula Lagna rule");
    if (jupiterLooks) reasons.push("Jupiter's aspect on Mars");
    if (ma?.dignity === "exalted") reasons.push("Mars exalted");
    out.push({
      id: "mangal",
      name: "Maṅgālīka (KuJa) Doṣa",
      sanskrit: "मङ्गलदोष",
      present: fromLagna,
      severity: !fromLagna ? "none" : severeHouses ? "strong" : moderate ? "moderate" : "mild",
      detail: fromLagna
        ? `Mars occupies the ${ordinal(ma!.house)} house from the Lagna${fromMoon >= 1 && [1, 2, 4, 7, 8, 12].includes(fromMoon) ? ` and the ${ordinal(fromMoon)} from the Moon (a second, stronger layer)` : ""}. Marriage and partnership carry sharp martian energy: friction over temper, autonomy and money. Matching a partner with equal or higher Kuja strength neutralises most of it.`
        : "Mars does not occupy 1/2/4/7/8/12 from the Lagna — no Kuja dosha from the Ascendant.",
      cancelled: fromLagna && cancel,
      cancelReason: reasons.join("; ") || undefined,
      remedy: "Hanuman Chalisa for 40 Tuesdays, Mangal Shanti puja, and — most practically — marry with an equally strong or Kuja partner.",
      services: ["puja-mangal", "milan-premium", "consult-30"],
    });
  }

  // Kāla Sarpa
  {
    const present = !!ra && !!ke && rows
      .filter((r) => r.id !== "Ra" && r.id !== "Ke" && r.id !== "Mo")
      .every((r) => {
        const fromRahu = norm360(r.sid - ra!.sid);
        const arc = norm360(ke!.sid - ra!.sid);
        return fromRahu <= arc;
      });
    const rahuHouse = ra ? ra.house : 0;
    const type = KAAL_SARP_TYPES[(rahuHouse - 1 + 12) % 12];
    const partial =
      ra && ke
        ? rows
            .filter((r) => r.id !== "Ra" && r.id !== "Ke")
            .filter((r) => norm360(r.sid - ra.sid) <= norm360(ke.sid - ra.sid)).length
        : 0;
    out.push({
      id: "kaalsarp",
      name: "कालसर्प योग",
      sanskrit: "Kāla Sarpa",
      present,
      severity: present ? (partial >= 7 ? "strong" : "moderate") : "none",
      detail: present
        ? `All grahas lie between Rāhu (${ra!.signName}) and Ketu (${ke!.signName}) — the ${type.name} variety. ${type.impact} Moon is excluded from the test, as in most almanac software.`
        : `${partial} of 7 grahas sit inside the Rāhu–Ketu axis; full Kāla Sarpa needs all seven, so you are not bound by it.`,
      cancelled: false,
      remedy: "Rahu shanti at a nagaram temple; complete the promises you make; keep a weekly digital fast.",
      services: ["puja-rahu", "consult-30"],
    });
  }

  // Pitr-related indications (simplified, disclosed)
  {
    const su = byId.get("Su");
    const nodes = [ra, ke].filter(Boolean) as GrahaChartRow[];
    const withNode = nodes.some((n) => n.sign === su?.sign);
    const in12 = su?.house === 12;
    const maleficsAspect = su ? su.aspectsOn.filter((a) => ["Ma", "Sa", "Ra", "Ke"].includes(a.by)).length > 0 : false;
    const present = !!su && (withNode || (in12 && maleficsAspect));
    out.push({
      id: "pitru",
      name: "Pitṛ related indication",
      sanskrit: "पितृदोष",
      present,
      severity: present ? (withNode && in12 ? "moderate" : "mild") : "none",
      detail: present
        ? `The Sun${withNode ? " shares a sign with a node" : " sits in the 12th under malefic aspect"} — the classical marker for unfinished ancestral business. Ancestral rites (Śrāddha/Tarpaṇa) on Amāvāsyā and a settled relationship with your father's side are the remedy, not fear.`
        : "No Sun–node or 12th-house malefic combination found.",
      cancelled: false,
      remedy: "Tarpan on Amavasya; donate in a parent's name; resolve one old family obligation.",
      services: ["puja-pitru", "consult-15"],
    });
  }

  // Gandanta / edge-of-sign stress (a genuinely defined, simple check)
  {
    const gandanta = rows.filter((r) => {
      const deg = r.degInSign;
      return (
        ([3, 7, 11].includes(r.sign) && deg > 26.6667) ||
        ([4, 8, 0].includes(r.sign) && deg < 3.3333)
      );
    });
    out.push({
      id: "gandanta",
      name: "Ganḍānta graha",
      sanskrit: "ग्रहणादोष",
      present: gandanta.length > 0,
      severity: gandanta.length ? "mild" : "none",
      detail: gandanta.length
        ? `${gandanta.map((g) => g.name).join(", ")} sit at a water–non-water sign junction, a traditional "knot" that makes those areas feel stuck until handled with ritual and patience.`
        : "No graha in a Gandanta junction.",
      cancelled: false,
      remedy: "Ganga-jal abhiṣeka; gradual starts on the affected matters.",
      services: ["puja-ganga", "consult-15"],
    });
  }

  return out;
}

export { ordinal, KENDRA, TRIKONA, UPACHAYA };
