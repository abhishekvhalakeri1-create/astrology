/**
 * Ashtakoota Guna Milan — the 36-point marriage compatibility score.
 *
 * Everything is read from the two Moons: their rashi, nakshatra and pada. Eight kootas are scored and added:
 * Varna 1 · Vashya 2 · Tara 3 · Yoni 4 · Graha Maitri 5 · Gana 6 · Bhakoot 7 · Nadi 8.
 *
 * The tables are the ones used across North Indian practice. A few cells differ between published panchangas
 * (noted below where they do), which is one reason the score is a first filter and not a verdict.
 */
import type { GrahaId } from './graha';
import { RASHI_LORD, type ZodiacPosition } from './zodiac';

export type KootaKey = 'varna' | 'vashya' | 'tara' | 'yoni' | 'maitri' | 'gana' | 'bhakoot' | 'nadi';

export const KOOTA_MAX: Record<KootaKey, number> = {
  varna: 1, vashya: 2, tara: 3, yoni: 4, maitri: 5, gana: 6, bhakoot: 7, nadi: 8,
};
export const KOOTA_ORDER: readonly KootaKey[] = ['varna', 'vashya', 'tara', 'yoni', 'maitri', 'gana', 'bhakoot', 'nadi'];

/* ---- Varna: by the element of the Moon sign. 0 Brahmin (water) · 1 Kshatriya (fire) · 2 Vaishya (earth) · 3 Shudra (air) ---- */
const VARNA_OF_RASHI: readonly number[] = [1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0];

/* ---- Vashya: 0 Chatushpada · 1 Manava · 2 Jalachara · 3 Vanachara · 4 Keeta ---- */
function vashyaOf(moon: ZodiacPosition): number {
  switch (moon.rashi) {
    case 0: case 1: return 0;
    case 2: case 5: case 6: case 10: return 1;
    case 3: case 11: return 2;
    case 4: return 3;
    case 7: return 4;
    case 8: return moon.degree < 15 ? 1 : 0; // Dhanu: the archer's human half, then the horse
    default: return moon.degree < 15 ? 0 : 2; // Makara: the goat's front, then the fish tail
  }
}
/** [bride][groom]. The half points mark "prey" pairings; some panchangas print 1½ in those three cells. */
const VASHYA_POINTS: readonly (readonly number[])[] = [
  [2, 1, 1, 0.5, 1],
  [1, 2, 0.5, 0, 1],
  [1, 0.5, 2, 1, 1],
  [0, 0, 0, 2, 0],
  [1, 1, 1, 0, 2],
];

/* ---- Yoni: the animal of each nakshatra ---- */
// 0 Horse · 1 Elephant · 2 Sheep · 3 Serpent · 4 Dog · 5 Cat · 6 Rat · 7 Cow · 8 Buffalo · 9 Tiger · 10 Deer · 11 Monkey · 12 Mongoose · 13 Lion
const YONI_OF_NAKSHATRA: readonly number[] = [
  0, 1, 2, 3, 3, 4, 5, 2, 5, 6, 6, 7, 8, 9, 8, 9, 10, 10, 4, 11, 12, 11, 13, 0, 13, 7, 1,
];
/**
 * Symmetric. Widely copied versions of this table disagree with themselves in two places (Horse–Deer and
 * Buffalo–Lion read differently by row and by column); the upper-triangle values are used for both.
 */
const YONI_POINTS: readonly (readonly number[])[] = [
  [4, 2, 2, 3, 2, 2, 2, 1, 0, 1, 3, 3, 2, 1],
  [2, 4, 3, 3, 2, 2, 2, 2, 3, 1, 2, 3, 2, 0],
  [2, 3, 4, 2, 1, 2, 1, 3, 3, 1, 2, 0, 3, 1],
  [3, 3, 2, 4, 2, 1, 1, 1, 1, 2, 2, 2, 0, 2],
  [2, 2, 1, 2, 4, 2, 1, 2, 2, 1, 0, 2, 1, 1],
  [2, 2, 2, 1, 2, 4, 0, 2, 2, 1, 3, 3, 2, 1],
  [2, 2, 1, 1, 1, 0, 4, 2, 2, 2, 2, 2, 1, 2],
  [1, 2, 3, 1, 2, 2, 2, 4, 3, 0, 3, 2, 2, 1],
  [0, 3, 3, 1, 2, 2, 2, 3, 4, 1, 2, 2, 2, 1],
  [1, 1, 1, 2, 1, 1, 2, 0, 1, 4, 1, 1, 2, 1],
  [3, 2, 2, 2, 0, 3, 2, 3, 2, 1, 4, 2, 2, 1],
  [3, 3, 0, 2, 2, 3, 2, 2, 2, 1, 2, 4, 3, 2],
  [2, 2, 3, 0, 1, 2, 1, 2, 2, 2, 2, 3, 4, 2],
  [1, 0, 1, 2, 1, 1, 2, 1, 1, 1, 1, 2, 2, 4],
];

/* ---- Graha Maitri: natural friendships between the lords of the two Moon signs ---- */
type Seven = Exclude<GrahaId, 'Rahu' | 'Ketu'>;
const FRIENDS: Record<Seven, readonly Seven[]> = {
  Sun: ['Moon', 'Mars', 'Jupiter'],
  Moon: ['Sun', 'Mercury'],
  Mars: ['Sun', 'Moon', 'Jupiter'],
  Mercury: ['Sun', 'Venus'],
  Jupiter: ['Sun', 'Moon', 'Mars'],
  Venus: ['Mercury', 'Saturn'],
  Saturn: ['Mercury', 'Venus'],
};
const ENEMIES: Record<Seven, readonly Seven[]> = {
  Sun: ['Venus', 'Saturn'],
  Moon: [],
  Mars: ['Mercury'],
  Mercury: ['Moon'],
  Jupiter: ['Mercury', 'Venus'],
  Venus: ['Sun', 'Moon'],
  Saturn: ['Sun', 'Moon', 'Mars'],
};
type Regard = 'friend' | 'neutral' | 'enemy';
const regard = (of: Seven, towards: Seven): Regard =>
  of === towards || FRIENDS[of].includes(towards) ? 'friend' : ENEMIES[of].includes(towards) ? 'enemy' : 'neutral';

function maitriPoints(a: Seven, b: Seven): number {
  const pair = [regard(a, b), regard(b, a)].sort().join('+');
  switch (pair) {
    case 'friend+friend': return 5;
    case 'friend+neutral': return 4;
    case 'neutral+neutral': return 3;
    case 'enemy+friend': return 1;
    case 'enemy+neutral': return 0.5;
    default: return 0;
  }
}

/* ---- Gana: 0 Deva · 1 Manushya · 2 Rakshasa ---- */
const GANA_OF_NAKSHATRA: readonly number[] = [
  0, 1, 2, 1, 0, 1, 0, 0, 2, 2, 1, 1, 0, 2, 0, 2, 0, 2, 2, 1, 1, 0, 2, 2, 1, 1, 0,
];
/** [bride][groom] */
const GANA_POINTS: readonly (readonly number[])[] = [
  [6, 5, 1],
  [6, 6, 0],
  [0, 0, 6],
];

/* ---- Nadi: 0 Adi · 1 Madhya · 2 Antya ---- */
const NADI_OF_NAKSHATRA: readonly number[] = [
  0, 1, 2, 2, 1, 0, 0, 1, 2, 2, 1, 0, 0, 1, 2, 2, 1, 0, 0, 1, 2, 2, 1, 0, 0, 1, 2,
];

/** Position in the nine-fold tara cycle (0 Janma … 8 Ati-Mitra) of `to`, counted from `from`. */
const taraFrom = (from: number, to: number): number => ((to - from + 27) % 27) % 9;
/** Vipat, Pratyari and Vadha — the 3rd, 5th and 7th — are the unfavourable taras. */
const taraIsGood = (tara: number): boolean => tara !== 2 && tara !== 4 && tara !== 6;

export interface KootaResult {
  key: KootaKey;
  points: number;
  max: number;
  /** Index into the matching name list (VARNA, VASHYA, TARA, YONI, GANA, NADI); a rashi for maitri and bhakoot. */
  boy: number;
  girl: number;
}

export type DoshaException = 'same-rashi-different-nakshatra' | 'same-nakshatra-different-rashi' | 'same-nakshatra-different-pada' | 'same-lord' | 'friendly-lords';

export interface DoshaFlag {
  present: boolean;
  /** A traditional ground on which the dosha is set aside, when one applies. */
  exception: DoshaException | null;
}

export type MatchBand = 'low' | 'average' | 'good' | 'excellent';

export interface MatchResult {
  kootas: KootaResult[];
  total: number;
  band: MatchBand;
  nadiDosha: DoshaFlag;
  bhakootDosha: DoshaFlag;
  ganaDosha: DoshaFlag;
  /** Which of 2/12, 5/9 or 6/8 the two rashis form, when Bhakoot scores nothing. */
  bhakootPattern: '2/12' | '5/9' | '6/8' | null;
}

export function matchBand(total: number): MatchBand {
  if (total < 18) return 'low';
  if (total < 25) return 'average';
  if (total < 33) return 'good';
  return 'excellent';
}

export function ashtakoota(boy: ZodiacPosition, girl: ZodiacPosition): MatchResult {
  const boyVarna = VARNA_OF_RASHI[boy.rashi];
  const girlVarna = VARNA_OF_RASHI[girl.rashi];
  const varna = boyVarna <= girlVarna ? 1 : 0; // the groom's varna should not rank below the bride's

  const boyVashya = vashyaOf(boy);
  const girlVashya = vashyaOf(girl);
  const vashya = VASHYA_POINTS[girlVashya][boyVashya];

  const taraOfBoy = taraFrom(girl.nakshatra, boy.nakshatra);
  const taraOfGirl = taraFrom(boy.nakshatra, girl.nakshatra);
  const tara = (taraIsGood(taraOfBoy) ? 1.5 : 0) + (taraIsGood(taraOfGirl) ? 1.5 : 0);

  const boyYoni = YONI_OF_NAKSHATRA[boy.nakshatra];
  const girlYoni = YONI_OF_NAKSHATRA[girl.nakshatra];
  const yoni = YONI_POINTS[girlYoni][boyYoni];

  const boyLord = RASHI_LORD[boy.rashi] as Seven;
  const girlLord = RASHI_LORD[girl.rashi] as Seven;
  const maitri = maitriPoints(boyLord, girlLord);

  const boyGana = GANA_OF_NAKSHATRA[boy.nakshatra];
  const girlGana = GANA_OF_NAKSHATRA[girl.nakshatra];
  const gana = GANA_POINTS[girlGana][boyGana];

  const distance = ((girl.rashi - boy.rashi + 12) % 12) + 1; // the girl's rashi counted from the boy's, 1–12
  const bhakootPattern = distance === 2 || distance === 12 ? '2/12' : distance === 5 || distance === 9 ? '5/9' : distance === 6 || distance === 8 ? '6/8' : null;
  const bhakoot = bhakootPattern ? 0 : 7;

  const boyNadi = NADI_OF_NAKSHATRA[boy.nakshatra];
  const girlNadi = NADI_OF_NAKSHATRA[girl.nakshatra];
  const nadi = boyNadi === girlNadi ? 0 : 8;

  const kootas: KootaResult[] = [
    { key: 'varna', points: varna, max: 1, boy: boyVarna, girl: girlVarna },
    { key: 'vashya', points: vashya, max: 2, boy: boyVashya, girl: girlVashya },
    { key: 'tara', points: tara, max: 3, boy: taraOfBoy, girl: taraOfGirl },
    { key: 'yoni', points: yoni, max: 4, boy: boyYoni, girl: girlYoni },
    { key: 'maitri', points: maitri, max: 5, boy: boy.rashi, girl: girl.rashi },
    { key: 'gana', points: gana, max: 6, boy: boyGana, girl: girlGana },
    { key: 'bhakoot', points: bhakoot, max: 7, boy: boy.rashi, girl: girl.rashi },
    { key: 'nadi', points: nadi, max: 8, boy: boyNadi, girl: girlNadi },
  ];
  const total = kootas.reduce((sum, k) => sum + k.points, 0);

  // Lords that are one planet, or friends both ways, are the classical ground for setting Bhakoot and Gana dosha aside.
  const lordException: DoshaException | null = boyLord === girlLord ? 'same-lord' : maitri === 5 ? 'friendly-lords' : null;

  let nadiException: DoshaException | null = null;
  if (nadi === 0) {
    const sameNakshatra = boy.nakshatra === girl.nakshatra;
    const sameRashi = boy.rashi === girl.rashi;
    if (sameRashi && !sameNakshatra) nadiException = 'same-rashi-different-nakshatra';
    else if (sameNakshatra && !sameRashi) nadiException = 'same-nakshatra-different-rashi';
    else if (sameNakshatra && boy.pada !== girl.pada) nadiException = 'same-nakshatra-different-pada';
  }

  return {
    kootas,
    total,
    band: matchBand(total),
    nadiDosha: { present: nadi === 0, exception: nadiException },
    bhakootDosha: { present: bhakoot === 0, exception: bhakoot === 0 ? lordException : null },
    ganaDosha: { present: gana <= 1, exception: gana <= 1 ? lordException : null },
    bhakootPattern,
  };
}
