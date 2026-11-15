/** Small choices remembered in the visitor's own browser. */
import type { Place } from "./astro/kundli";

const RASHI_KEY = "astroconnect-rashi";

/** The janma rashi (0 = Mesha) the visitor last chose, if any. */
export function loadRashi(): number | null {
  try {
    const saved = window.localStorage.getItem(RASHI_KEY);
    return saved !== null && /^\d+$/.test(saved) && Number(saved) < 12 ? Number(saved) : null;
  } catch {
    return null;
  }
}

export function saveRashi(rashi: number): void {
  try {
    window.localStorage.setItem(RASHI_KEY, String(rashi));
  } catch {
    /* private browsing: the choice lasts for this visit only */
  }
}

const PLACE_KEY = "astroconnect-panchang-place";

/** The town the visitor last looked up a panchanga for. */
export function loadPanchangPlace(): Place | null {
  try {
    const raw = window.localStorage.getItem(PLACE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as Partial<Place>;
    return typeof p.name === "string" && typeof p.lat === "number" && typeof p.lon === "number" && typeof p.tz === "string" ? (p as Place) : null;
  } catch {
    return null;
  }
}

export function savePanchangPlace(place: Place): void {
  try {
    window.localStorage.setItem(PLACE_KEY, JSON.stringify(place));
  } catch {
    /* the place simply will not be remembered */
  }
}
