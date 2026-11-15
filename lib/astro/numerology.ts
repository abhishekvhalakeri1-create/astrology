/**
 * Anka Jyotish (numerology) as practised in India:
 *   Mulank  — the day of birth reduced to a single digit
 *   Bhagyank — the whole date of birth reduced to a single digit
 *   Namank  — the name, letter by letter, on the Chaldean scale
 * Each number 1–9 belongs to a graha.
 */
import type { GrahaId } from './graha';

/** Graha that rules each number; index 0 is unused. */
export const NUMBER_LORD: readonly (GrahaId | null)[] = [null, 'Sun', 'Moon', 'Jupiter', 'Rahu', 'Mercury', 'Venus', 'Ketu', 'Saturn', 'Mars'];

/** Chaldean letter values. The scale has no 9: it was held sacred and left unassigned. */
const CHALDEAN: Record<string, number> = {
  A: 1, I: 1, J: 1, Q: 1, Y: 1,
  B: 2, K: 2, R: 2,
  C: 3, G: 3, L: 3, S: 3,
  D: 4, M: 4, T: 4,
  E: 5, H: 5, N: 5, X: 5,
  U: 6, V: 6, W: 6,
  O: 7, Z: 7,
  F: 8, P: 8,
};

const digitSum = (n: number): number => String(Math.abs(n)).split('').reduce((sum, d) => sum + Number(d), 0);

/** Adds the digits again and again until one digit is left. */
export function reduceToDigit(n: number): number {
  let value = Math.abs(Math.trunc(n));
  while (value > 9) value = digitSum(value);
  return value;
}

export interface NumberResult {
  /** The sum before the final reduction ("compound number"), e.g. 29 for a Mulank of 2. */
  compound: number;
  /** 1–9 */
  value: number;
}

export function mulank(day: number): NumberResult {
  return { compound: day, value: reduceToDigit(day) };
}

export function bhagyank(year: number, month: number, day: number): NumberResult {
  const compound = digitSum(day) + digitSum(month) + digitSum(year);
  return { compound, value: reduceToDigit(compound) };
}

/** The letters of a name with the value each one carries, in order. Anything that is not a Latin letter is left out. */
export function letterValues(name: string): { letter: string; value: number }[] {
  return name
    .toUpperCase()
    .normalize('NFKD')
    .replace(/[^A-Z]/g, '')
    .split('')
    .map((letter) => ({ letter, value: CHALDEAN[letter] ?? 0 }));
}

/** The additions that take a number down to one digit: 29 → ["2 + 9 = 11", "1 + 1 = 2"]. */
export function reductionSteps(n: number): string[] {
  const steps: string[] = [];
  let value = Math.abs(Math.trunc(n));
  while (value > 9) {
    const digits = String(value).split('');
    const sum = digits.reduce((total, d) => total + Number(d), 0);
    steps.push(`${digits.join(' + ')} = ${sum}`);
    value = sum;
  }
  return steps;
}

/** Null when the name has no Latin letters to count (for example, when typed in another script). */
export function namank(name: string): NumberResult | null {
  const letters = name.toUpperCase().normalize('NFKD').replace(/[^A-Z]/g, '');
  if (!letters) return null;
  const compound = letters.split('').reduce((sum, ch) => sum + (CHALDEAN[ch] ?? 0), 0);
  return { compound, value: reduceToDigit(compound) };
}
