/** Small pieces of wording shared by the tools. */
import type { Lang } from './names';

/** "7th" · "7वें" · "7ನೇ" — a house or position number as it reads inside a sentence. */
export function ordinal(lang: Lang, n: number): string {
  if (lang === 'hi') return `${n}वें`;
  if (lang === 'kn') return `${n}ನೇ`;
  const tens = n % 100;
  if (tens >= 11 && tens <= 13) return `${n}th`;
  switch (n % 10) {
    case 1: return `${n}st`;
    case 2: return `${n}nd`;
    case 3: return `${n}rd`;
    default: return `${n}th`;
  }
}

/** Points are whole or half numbers: 24, 24.5. */
export const formatPoints = (points: number): string => (Number.isInteger(points) ? String(points) : points.toFixed(1));
