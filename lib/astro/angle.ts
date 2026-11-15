/** Arithmetic on angles in degrees. Kept apart from core.ts so the fixed tables can be used without loading the ephemeris. */

/** Wraps any angle into 0 ≤ x < 360. */
export const norm360 = (x: number): number => ((x % 360) + 360) % 360;

/** Signed smallest difference a − b, in (−180, 180]. */
export const angleDiff = (a: number, b: number): number => {
  const d = norm360(a - b);
  return d > 180 ? d - 360 : d;
};
