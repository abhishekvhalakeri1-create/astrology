/**
 * Chauḍḍiyā / Ghaṭikā — the day divided into eight unequal parts between
 * sunrise and sunset, each ruled by a graha in Chaldean order. AstroSage shows
 * these as "good / neutral / bad" blocks; the classical ordering used here is
 * Sun→Venus→Mercury→Moon→Saturn→Jupiter→Mars, repeating, starting at sunrise.
 * Night parts (which some almanacs print) are the same cycle from sunset.
 *
 * Also: Rāhu Kāla, Yamaghaṇṭa and Gulika Kāla as eighths of the daylight span,
 * and the 60-min ghaṭikā count (1 day = 60 ghaṭikās, 1 ghaṭikā = 24 min).
 */
import { PLANET_BY_ID, type Graha } from "../../data/reference";
import type { Panchanga } from "./panchanga";

export interface DayPart {
  index: number;
  lord: Graha;
  lordName: string;
  sanskrit: string;
  start: number;
  end: number;
  quality: "good" | "neutral" | "bad";
  use: string;
}

export interface Ghatis {
  sunrise: number;
  sunset: number;
  parts: DayPart[];
  rahukaal: { start: number; end: number; label: string };
  yamaghand: { start: number; end: number; label: string };
  gulika: { start: number; end: number; label: string };
  abhijit: { start: number; end: number; label: string } | null;
  current: DayPart | null;
  /** elapsed / remaining ghaṭikās (24-min units) of the daylight span */
  ghatikaDay: { elapsed: number; total: number; remaining: number };
  notes: string[];
}

/** Chaldean order used for day-parts (also used by horā). */
export const CHAUDIYA_ORDER = ["Su", "Ve", "Me", "Mo", "Sa", "Ju", "Ma"] as const;

const QUALITY: Record<string, DayPart["quality"]> = {
  Su: "neutral",
  Mo: "good",
  Ma: "bad",
  Me: "good",
  Ju: "good",
  Ve: "good",
  Sa: "bad",
};

const USE: Record<string, string> = {
  Su: "Authority work, government files, interviews, healing. Avoid starting anything that must grow slowly.",
  Mo: "Water, travel, mother, mind, studies, anything emotional or short-range. Best for public-facing launches.",
  Ma: "Land, police, surgery, competition, physical work. Avoid money and marriage matters in this block.",
  Me: "Trade, writing, study, deals, messages, short journeys. Excellent for signing.",
  Ju: "Teachers, judges, children, temple, loans, dharma work. One of the two blocks to plan around.",
  Ve: "Marriage, art, luxury purchases, beauty, entertainment, reconciliation. Good for courtship and couture.",
  Sa: "Labour, demolition, discipline, long-haul tasks, service. Nothing auspicious is begun here.",
};

const DAY_NAME: Record<string, string> = {
  Su: "Ravi",
  Mo: "Chandra",
  Ma: "Mangal",
  Me: "Budha",
  Ju: "Guru",
  Ve: "Shukra",
  Sa: "Shani",
};

/** Rāhu Kāla / Yamaghaṇṭa / Gulika: which eighth of the day, by weekday. */
const RAHU_KAAL: Record<number, number> = { 0: 7, 1: 1, 2: 6, 3: 4, 4: 5, 5: 3, 6: 2 };
const YAMAGHAND: Record<number, number> = { 0: 4, 1: 3, 2: 2, 3: 1, 4: 7, 5: 6, 6: 5 };
const GULIKA: Record<number, number> = { 0: 6, 1: 7, 2: 5, 3: 3, 4: 4, 5: 2, 6: 1 };

/**
 * Compute day-parts and kaala windows for a day, given a Panchanga that already
 * carries sunrise/sunset and the weekday index (0 = Sunday).
 */
export function ghatikasFor(panch: Panchanga): Ghatis | null {
  const { sunrise, sunset } = panch;
  // polar day / polar night: the eight parts are undefined without both events
  if (sunrise == null || sunset == null || sunset <= sunrise) return null;
  const span = Math.max(1, sunset - sunrise);
  const eighth = span / 8;
  const weekday = weekdayOf(sunrise, panch);

  const parts: DayPart[] = [];
  for (let i = 0; i < 8; i++) {
    const lord = CHAUDIYA_ORDER[i % CHAUDIYA_ORDER.length] as Graha;
    parts.push({
      index: i,
      lord,
      lordName: DAY_NAME[lord] ?? PLANET_BY_ID[lord]?.name ?? String(lord),
      sanskrit: `${DAY_NAME[lord]} Kāla`,
      start: sunrise + i * eighth,
      end: sunrise + (i + 1) * eighth,
      quality: QUALITY[lord] ?? "neutral",
      use: USE[lord] ?? "",
    });
  }

  // the tables in data/reference are 0-based eighths of daylight (0 = first)
  const win = (idx: number, label: string) => ({
    start: sunrise + idx * eighth,
    end: sunrise + (idx + 1) * eighth,
    label,
  });

  const noon = (sunrise + sunset) / 2;
  const abhijitSpan = eighth / 2;
  const abhijit = {
    start: noon - abhijitSpan,
    end: noon + abhijitSpan,
    label: "Abhijit Nakṣatra window",
  };

  const now = Date.now();
  const current = parts.find((p) => now >= p.start && now < p.end) ?? null;

  return {
    sunrise,
    sunset,
    parts,
    rahukaal: win(RAHU_KAAL[weekday] ?? 7, "Rāhu Kāla — start nothing new"),
    yamaghand: win(YAMAGHAND[weekday] ?? 4, "Yamaghaṇṭa — avoid travel & deals"),
    gulika: win(GULIKA[weekday] ?? 6, "Gulika Kāla — unsuitable for auspicious work"),
    abhijit,
    current,
    ghatikaDay: {
      // 1 day (sunrise→sunrise civil day ≈ 24 h) = 60 ghaṭikās of 24 min
      elapsed: clampNum((now - sunrise) / (24 * 60000), 0, 2.5) * 60,
      total: 60,
      remaining: 0,
    },
    notes: [
      `Daylight is ${(span / 3600000).toFixed(2)} h long today, so each of the eight parts is ${(eighth / 60000).toFixed(0)} min — they are never a fixed 90 minutes in the classical system, only in bad apps.`,
      "Abhijit is the one muhūrta that overrides most defects; it exists only near the equinoxes at low latitudes and never on Sunday.",
      weekday === 0
        ? "Sunday: Rāhu Kāla falls in the last eighth, and Abhijit is traditionally not used on a Sunday."
        : "",
    ].filter(Boolean),
  };
}

/** weekday index (0=Sun) of the local civil day containing `ms` */
function weekdayOf(ms: number, panch: Panchanga): number {
  const label = panch.weekday?.toLowerCase() ?? "";
  const names = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const i = names.findIndex((n) => label.startsWith(n.slice(0, 3)));
  return i >= 0 ? i : new Date(ms).getUTCDay();
}

const clampNum = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/** Sidereal-clock ghaṭikā count since sunrise (24-min units), for display. */
export function ghatikaSince(ms: number, sunrise: number): number {
  return (ms - sunrise) / (24 * 60000);
}
