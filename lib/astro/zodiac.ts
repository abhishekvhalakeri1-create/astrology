/**
 * The fixed tables of Jyotish: rashis, nakshatras and what each one carries.
 * Indices are zero-based throughout: rashi 0 = Mesha … 11 = Meena, nakshatra 0 = Ashwini … 26 = Revati.
 */
import { norm360 } from './angle';
import type { GrahaId } from './graha';

export const NAKSHATRA_SPAN = 360 / 27; // 13°20′
export const PADA_SPAN = NAKSHATRA_SPAN / 4; // 3°20′

/** Lord of each rashi. */
export const RASHI_LORD: readonly GrahaId[] = [
  'Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter',
];

export type Element = 'fire' | 'earth' | 'air' | 'water';
export const RASHI_ELEMENT: readonly Element[] = [
  'fire', 'earth', 'air', 'water', 'fire', 'earth', 'air', 'water', 'fire', 'earth', 'air', 'water',
];

/** Vimshottari lord of each nakshatra: the nine-lord cycle starts at Ashwini with Ketu and repeats three times. */
export const DASHA_ORDER: readonly GrahaId[] = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];
export const DASHA_YEARS: Record<GrahaId, number> = {
  Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7, Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17,
};
export const nakshatraLord = (nakshatra: number): GrahaId => DASHA_ORDER[nakshatra % 9];

/** Exaltation (uccha) sign of each graha; debilitation (neecha) is the sign opposite. */
export const EXALTATION: Partial<Record<GrahaId, number>> = {
  Sun: 0, Moon: 1, Mars: 9, Mercury: 5, Jupiter: 3, Venus: 11, Saturn: 6,
};

export type Dignity = 'exalted' | 'debilitated' | 'own' | null;

export function dignity(graha: GrahaId, rashi: number): Dignity {
  const ex = EXALTATION[graha];
  if (ex === undefined) return null;
  if (rashi === ex) return 'exalted';
  if (rashi === (ex + 6) % 12) return 'debilitated';
  if (RASHI_LORD[rashi] === graha) return 'own';
  return null;
}

export interface ZodiacPosition {
  /** Sidereal longitude, 0–360°. */
  lon: number;
  rashi: number;
  /** Degrees inside the rashi, 0–30. */
  degree: number;
  nakshatra: number;
  /** 1–4 */
  pada: number;
  /** Fraction of the nakshatra already crossed, 0–1. */
  nakshatraProgress: number;
  /** Rashi in the navamsa (D9) chart. */
  navamsa: number;
}

export function zodiacPosition(longitude: number): ZodiacPosition {
  const lon = norm360(longitude);
  const rashi = Math.min(11, Math.floor(lon / 30));
  const nakshatra = Math.min(26, Math.floor(lon / NAKSHATRA_SPAN));
  const within = lon - nakshatra * NAKSHATRA_SPAN;
  return {
    lon,
    rashi,
    degree: lon - rashi * 30,
    nakshatra,
    pada: Math.min(4, Math.floor(within / PADA_SPAN) + 1),
    nakshatraProgress: within / NAKSHATRA_SPAN,
    // The 108 navamsas run through the twelve signs nine times over, starting from Mesha at 0° Mesha.
    navamsa: Math.floor(lon / PADA_SPAN) % 12,
  };
}

/** House (1–12) of a rashi counted from a reference rashi — whole-sign houses. */
export const houseFrom = (reference: number, rashi: number): number => ((rashi - reference + 12) % 12) + 1;

/**
 * Houses from the Moon sign in which each graha's transit is held to be favourable (Phaladeepika ch. 26).
 * Everything else is treated as a period that asks for care.
 */
export const FAVOURABLE_HOUSES: Record<GrahaId, readonly number[]> = {
  Sun: [3, 6, 10, 11],
  Moon: [1, 3, 6, 7, 10, 11],
  Mars: [3, 6, 11],
  Mercury: [2, 4, 6, 8, 10, 11],
  Jupiter: [2, 5, 7, 9, 11],
  Venus: [1, 2, 3, 4, 5, 8, 9, 11, 12],
  Saturn: [3, 6, 11],
  Rahu: [3, 6, 11],
  Ketu: [3, 6, 11],
};

/** "12°34′" */
export function formatDegree(deg: number): string {
  let d = Math.floor(deg);
  let m = Math.round((deg - d) * 60);
  if (m === 60) {
    d += 1;
    m = 0;
  }
  return `${d}°${String(m).padStart(2, '0')}′`;
}
