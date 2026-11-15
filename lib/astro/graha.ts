/** The nine grahas of Jyotish, in the order they are listed in a chart. Kept apart from core.ts so it can be used without loading the ephemeris. */
export type GrahaId = 'Sun' | 'Moon' | 'Mars' | 'Mercury' | 'Jupiter' | 'Venus' | 'Saturn' | 'Rahu' | 'Ketu';

export const GRAHAS: readonly GrahaId[] = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
