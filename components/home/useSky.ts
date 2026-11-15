"use client";
import { useEffect, useState } from "react";
import { BENGALURU } from "@/lib/astro/places";
import type { SkyNow } from "@/lib/astro/today";
import { loadPanchangPlace } from "@/lib/prefs";

let cached: { key: string; sky: SkyNow } | null = null;

/**
 * The sky right now, for the home page widgets. The ephemeris is a sizeable piece of code, so it is fetched
 * after the page has appeared rather than with it. `sky` is null until then; `failed` is true if it could not load.
 *
 * Uses the town last chosen on the Panchanga page, or Bengaluru.
 */
export function useSky(): { sky: SkyNow | null; failed: boolean } {
  const [sky, setSky] = useState<SkyNow | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    const place = loadPanchangPlace() ?? BENGALURU;
    import("@/lib/astro/today")
      .then(({ skyNow }) => {
        if (!alive) return;
        const now = new Date();
        const key = `${place.lat},${place.lon},${place.tz},${Math.floor(now.getTime() / 60000)}`;
        if (!cached || cached.key !== key) cached = { key, sky: skyNow(now, place) };
        setSky(cached.sky);
      })
      .catch(() => {
        if (alive) setFailed(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  return { sky, failed };
}
