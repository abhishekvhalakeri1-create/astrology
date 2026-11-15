/**
 * Numerology — Chaldean name number + Pythagorean life path, read through the
 * Vedic number→graha map (1 Sun, 2 Moon, 3 Jupiter, 4 Rahu, 5 Mercury, 6 Venus,
 * 7 Ketu, 8 Saturn, 9 Mars). Compatibility therefore uses the *same* graha
 * friendship table as the kundli engine, so both systems cannot contradict
 * each other.
 */
import { PLANET_BY_ID, grahaRelationship, type Graha } from "../data/reference";

const NUMBER_LORD: (Graha | null)[] = [null, "Su", "Mo", "Ju", "Ra", "Me", "Ve", "Ke", "Sa", "Ma"];

/** Chaldean letter values, as used by Indian numerologists. */
const CHALDEAN: Record<string, number> = {
  a: 1, i: 1, j: 1, q: 1, y: 1,
  b: 2, k: 2, r: 2,
  c: 3, g: 3, l: 3, s: 3,
  d: 4, m: 4, t: 4,
  e: 5, h: 5, n: 5, x: 5,
  u: 6, v: 6, w: 6,
  o: 7, z: 7,
  f: 8, p: 8,
};

const VOWELS = new Set(["a", "e", "i", "o", "u"]);

export const reduce = (n: number): number => {
  let v = Math.abs(Math.trunc(n));
  while (v > 9) v = String(v).split("").reduce((a, c) => a + Number(c), 0);
  return v;
};

export function nameLetters(name: string): { letter: string; value: number }[] {
  return name
    .toLowerCase()
    .split("")
    .filter((c) => c >= "a" && c <= "z")
    .map((c) => ({ letter: c, value: CHALDEAN[c] ?? 0 }));
}

export const compoundNameNumber = (name: string) =>
  nameLetters(name).reduce((s, l) => s + l.value, 0);

export const nameNumber = (name: string) => reduce(compoundNameNumber(name));

export function lifePathFrom(dob: string): { number: number; raw: number } {
  const digits = dob.replace(/\D/g, "").split("").map(Number);
  const raw = digits.reduce((a, b) => a + b, 0);
  return { number: reduce(raw), raw };
}

export const mulank = (day: number) => reduce(day);

export function personalYear(dob: string, year: number): number {
  const parts = dob.split("-").map(Number);
  const month = parts[1] ?? 1;
  const day = parts[2] ?? 1;
  return reduce(reduce(day) + reduce(month) + reduce(year));
}

export const lordOfNumber = (n: number): Graha | null => NUMBER_LORD[n] ?? null;

export function friendlyNumbers(core: number): { friendly: number[]; difficult: number[] } {
  const lord = lordOfNumber(core);
  const friendly: number[] = [];
  const difficult: number[] = [];
  if (!lord) return { friendly, difficult };
  for (let n = 1; n <= 9; n++) {
    const other = lordOfNumber(n);
    if (!other) continue;
    if (other === lord) {
      friendly.push(n);
      continue;
    }
    const rel = grahaRelationship(lord, other);
    if (rel === "friend") friendly.push(n);
    else if (rel === "enemy") difficult.push(n);
  }
  return { friendly, difficult };
}

const TEXT: Record<number, { key: string; line: string; career: string; shadow: string }> = {
  1: { key: "Sun", line: "Leader by number — original, allergic to being second", career: "founder roles, government, administration, any chair with one seat", shadow: "domination, pride, solitude at the top" },
  2: { key: "Moon", line: "Receptive and intuitive; reads a room before entering it", career: "care, hospitality, food and water, counselling, public relations", shadow: "mood-led decisions, over-accommodation" },
  3: { key: "Jupiter", line: "Teacher-nature: doctrine, optimism, the long explanation", career: "law, finance, education, publishing, spirituality", shadow: "preaching, excess, scattered generosity" },
  4: { key: "Rahu", line: "Unconventional and restless; the ordinary path does not fit", career: "technology, media, import/export, research, the fringe", shadow: "sudden breaks, secrecy, self-sabotage" },
  5: { key: "Mercury", line: "Communicator and trader — quick hands, quicker mind", career: "sales, writing, analytics, travel, teaching", shadow: "nervousness, dilettantism, over-committing" },
  6: { key: "Venus", line: "Harmoniser with taste; beauty is a working method", career: "design, film, luxury, food, fashion, events", shadow: "comfort debt, conflict avoidance" },
  7: { key: "Ketu", line: "Detached researcher; knows without being told", career: "coding, research, healing, spirituality, deep back-office work", shadow: "isolation, doubt, abandoning things halfway" },
  8: { key: "Saturn", line: "Slow, structural, inevitable — karma's accountant", career: "real estate, logistics, law, labour, engineering, institutions", shadow: "delay, heaviness, over-work" },
  9: { key: "Mars", line: "Engineer-soldier: courage, cutting, building", career: "defence, surgery, sport, mechanical work, startups", shadow: "anger, accidents, burned bridges" },
};

export interface NumerologyReading {
  name: string;
  dob: string;
  mulank: number;
  bhagyank: number;
  core: number;
  nameNo: number;
  nameCompound: number;
  soulNo: number;
  personaNo: number;
  personalYear: number;
  friendly: number[];
  difficult: number[];
  lord: { name: string; gem: string; colour: string; day: string; mantra: string } | null;
  luckyDates: number[];
  letters: { letter: string; value: number }[];
  headline: string;
  paragraphs: string[];
  nameFixes: { suggestion: string; number: number; target: number }[];
}

export function numerologyReading(name: string, dob: string, at = new Date()): NumerologyReading {
  const lp = lifePathFrom(dob);
  const day = Number(dob.split("-")[2] || 1);
  const mn = mulank(day);
  const nn = nameNumber(name);
  const letters = nameLetters(name);
  const currentRaw = compoundNameNumber(name);
  const soulNo = reduce(letters.filter((l) => VOWELS.has(l.letter)).reduce((s, l) => s + l.value, 0)) || 0;
  const personaNo = reduce(letters.filter((l) => !VOWELS.has(l.letter)).reduce((s, l) => s + l.value, 0)) || 0;
  const py = personalYear(dob, at.getUTCFullYear());
  const core = reduce(mn + lp.number);
  const { friendly, difficult } = friendlyNumbers(core);
  const lordGraha = lordOfNumber(core);
  const lord = lordGraha
    ? {
        name: PLANET_BY_ID[lordGraha].name,
        gem: PLANET_BY_ID[lordGraha].gem,
        colour: PLANET_BY_ID[lordGraha].color,
        day: PLANET_BY_ID[lordGraha].day,
        mantra: PLANET_BY_ID[lordGraha].mantras[0] ?? "",
      }
    : null;

  const t = TEXT[core] ?? TEXT[1]!;
  const tp = TEXT[py] ?? TEXT[1]!;
  const yearNote =
    py === 8 || py === 4
      ? "Slow, structural year — sign long contracts, avoid leverage, finish what is open."
      : py === 9
        ? "Completion year — close files, settle debts, stop starting."
        : py === 1
          ? "New cycle — start the thing you have deferred for two years."
          : py === 3 || py === 6
            ? "Expansion and visibility — teach, publish, get engaged, buy beauty."
            : py === 5
              ? "Movement year — travel, switch, sell, learn fast."
              : "Effort year — compete, build, operate.";

  const paragraphs = [
    `Mulank ${mn} · Bhāgyaṅk ${lp.number} · composite driver ${core}. ${t.line}. The number is ruled by ${lord?.name ?? "a blend of grahas"}, so the natural work is ${t.career}; the shadow to watch is ${t.shadow}.`,
    `Name vibration ${nn} (Chaldean total ${currentRaw}) sits ${nn === core ? "exactly on your core number — the spelling already supports you, do not change it" : `${Math.abs(nn - core)} step${Math.abs(nn - core) === 1 ? "" : "s"} from ${core}`}${nn === core ? "" : `, so people routinely mis-read your intent; a one-letter spelling adjustment usually closes the gap`}.`,
    `Soul urge ${soulNo} (vowels) versus outer persona ${personaNo} (consonants): ${soulNo === personaNo ? "what you want and what you show are the same number — rare congruence, and people trust you quickly" : `you want ${TEXT[soulNo]?.key ?? "quiet"} but project ${TEXT[personaNo]?.key ?? "noise"}; you will be asked for the wrong thing until you say what you actually want`}.`,
    `Personal year ${py} (${tp.key}): ${tp.line}. ${yearNote}`,
    `Working dates each month: ${[core, ...friendly].slice(0, 4).map((n) => `${n}, ${n + 9}${n + 18 <= 28 ? `, ${n + 18}` : ""}`).join(" · ")}${difficult.length ? ` · avoid launching on ${difficult.map((d) => `${d}, ${d + 9}`).join(" / ")}` : ""}.`,
  ];

  // smallest legal spelling change that lands on a friendly root — edits the
  // given name only, never the surname, and never duplicates a suggestion.
  const nameFixes: { suggestion: string; number: number; target: number }[] = [];
  const targets = [...new Set([core, ...friendly])].filter((t) => t !== nn).slice(0, 3);
  const seen = new Set<string>();
  const push = (suggestion: string, target: number) => {
    const key = suggestion.toLowerCase();
    if (!suggestion || suggestion === name || seen.has(key)) return;
    if (reduce(compoundNameNumber(suggestion)) !== target) return;
    seen.add(key);
    nameFixes.push({ suggestion, number: target, target });
  };
  const words = name.trim().split(/\s+/);
  const head = words[0] ?? name;
  const rest = words.slice(1).join(" ");
  const withHead = (h: string) => (rest ? `${h} ${rest}` : h);
  const APPEND = ["a", "h", "i", "e", "n", "r", "u", "y", "t", "k"];
  const DOUBLES: [RegExp, string][] = [
    [/a(?!a)/i, "aa"], [/i(?!i)/i, "ee"], [/u(?!u)/i, "oo"], [/e(?!e)/i, "ee"],
  ];
  const SWAPS: [RegExp, string][] = [
    [/k/i, "c"], [/c(?!h)/i, "k"], [/i/i, "y"], [/y/i, "i"], [/v/i, "f"], [/s/i, "z"], [/z/i, "s"], [/d/i, "dd"],
  ];
  for (const target of targets) {
    for (const extra of APPEND) {
      const candidate = withHead(`${head}${extra}`);
      if (reduce(compoundNameNumber(candidate)) === target) {
        push(candidate, target);
        break;
      }
    }
    for (const [re, to] of DOUBLES) {
      if (!re.test(head)) continue;
      const candidate = withHead(head.replace(re, to));
      if (reduce(compoundNameNumber(candidate)) === target) {
        push(candidate, target);
        break;
      }
    }
    for (const [re, to] of SWAPS) {
      if (!re.test(head)) continue;
      const candidate = withHead(head.replace(re, to));
      if (reduce(compoundNameNumber(candidate)) === target) {
        push(candidate, target);
        break;
      }
    }
  }
  if (targets.length && nameFixes.length === 0) {
    // no single edit worked: propose the two-letter append as a fallback
    for (const target of targets) {
      const candidate = withHead(`${head}aa`);
      if (reduce(compoundNameNumber(candidate)) === target) push(candidate, target);
    }
  }

  return {
    name,
    dob,
    mulank: mn,
    bhagyank: lp.number,
    core,
    nameNo: nn,
    nameCompound: currentRaw,
    soulNo,
    personaNo,
    personalYear: py,
    friendly,
    difficult,
    lord,
    luckyDates: [
      ...new Set([core, ...friendly].flatMap((n) => [n, n + 9, n + 18]).filter((n) => n <= 28)),
    ].sort((a, b) => a - b),
    letters,
    headline: `${t.line} · personal year ${py} (${tp.key})`,
    paragraphs,
    nameFixes: nameFixes.slice(0, 6),
  };
}
