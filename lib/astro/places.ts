/**
 * Birth-place lookup. The list (about 6,700 towns and cities, every Indian town above 15,000 people) is a
 * separate chunk that is fetched only when someone starts typing a place.
 * Place data © GeoNames (geonames.org), CC BY 4.0.
 */
import type { Place } from './kundli';

type Row = [name: string, region: number, lat: number, lon: number, tz: number, aliases?: string];

interface CityData {
  tz: string[];
  rg: string[];
  c: Row[];
}

export const BENGALURU: Place = { name: 'Bengaluru', region: 'Karnataka', lat: 12.972, lon: 77.594, tz: 'Asia/Kolkata' };

/** Shown before anything is typed. */
export const SUGGESTED_PLACES: readonly Place[] = [
  BENGALURU,
  { name: 'Mysuru', region: 'Karnataka', lat: 12.298, lon: 76.639, tz: 'Asia/Kolkata' },
  { name: 'Hubballi', region: 'Karnataka', lat: 15.348, lon: 75.134, tz: 'Asia/Kolkata' },
  { name: 'Mangaluru', region: 'Karnataka', lat: 12.917, lon: 74.856, tz: 'Asia/Kolkata' },
  { name: 'Belagavi', region: 'Karnataka', lat: 15.852, lon: 74.504, tz: 'Asia/Kolkata' },
  { name: 'Chennai', region: 'Tamil Nadu', lat: 13.088, lon: 80.278, tz: 'Asia/Kolkata' },
  { name: 'Hyderabad', region: 'Telangana', lat: 17.384, lon: 78.456, tz: 'Asia/Kolkata' },
  { name: 'Mumbai', region: 'Maharashtra', lat: 19.073, lon: 72.883, tz: 'Asia/Kolkata' },
];

interface Entry {
  place: Place;
  /** Folded name and aliases, for matching. */
  keys: string[];
  india: boolean;
}

const fold = (s: string): string => s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]/g, '');

let cache: Promise<Entry[]> | null = null;

function load(): Promise<Entry[]> {
  if (!cache) {
    cache = import('./data/cities.json').then((m) => {
      const data = (m.default ?? m) as unknown as CityData;
      // Rows arrive ordered by population, largest first; that order is kept as the tie-breaker.
      return (data.c as Row[]).map((row) => {
        const tz = data.tz[row[4]];
        return {
          place: { name: row[0], region: data.rg[row[1]], lat: row[2], lon: row[3], tz },
          keys: (row[5] ? [row[0], ...row[5].split('|')] : [row[0]]).map(fold),
          india: tz === 'Asia/Kolkata',
        };
      });
    });
    cache.catch(() => {
      cache = null; // let the next keystroke retry after a failed download
    });
  }
  return cache;
}

/** Starts the download early, e.g. when a place field receives focus. */
export function preloadPlaces(): void {
  void load().catch(() => undefined);
}

export const placeLabel = (p: Place): string => (p.region ? `${p.name}, ${p.region}` : p.name);

/**
 * Best matches for what has been typed: an exact name first, then names that start with the query, then
 * names that merely contain it. Within each group Indian places come first, then larger towns.
 */
export async function searchPlaces(query: string, limit = 8): Promise<Place[]> {
  const q = fold(query);
  if (!q) return [...SUGGESTED_PLACES].slice(0, limit);
  const entries = await load();
  // tier 0 exact · 1 starts-with · 2 contains; each split into India / elsewhere
  const buckets: Place[][] = [[], [], [], [], [], []];
  for (const entry of entries) {
    let tier = 3;
    for (const key of entry.keys) {
      if (key === q) tier = 0;
      else if (tier > 1 && key.startsWith(q)) tier = 1;
      else if (tier > 2 && q.length >= 3 && key.includes(q)) tier = 2;
      if (tier === 0) break;
    }
    if (tier < 3) buckets[tier * 2 + (entry.india ? 0 : 1)].push(entry.place);
  }
  return buckets.flat().slice(0, limit);
}

/** Resolves a free-text place such as "Bangalore, Karnataka" saved by an older version of the site. */
export async function resolvePlace(text: string): Promise<Place | null> {
  const [city] = text.split(',');
  const matches = await searchPlaces(city.trim(), 1);
  return matches[0] ?? null;
}
