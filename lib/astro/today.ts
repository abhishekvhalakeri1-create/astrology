/**
 * The sky at this moment over one place — what the home page shows before anyone has typed anything:
 * the day's panchanga, the chart of the moment and where the Moon is.
 */
import { ascendantLongitude, type GrahaId } from './core';
import { moonStays, transitsAt, type Transit } from './gochar';
import type { Place } from './kundli';
import { dayPanchang, type DayPanchang } from './panchang';
import { todayIn } from './time';
import { zodiacPosition } from './zodiac';

export interface SkyNow {
  at: Date;
  place: Place;
  /** Panchanga of the civil day `at` falls on, at `place`. */
  panchang: DayPanchang;
  /** Rashi rising on the eastern horizon, 0 = Mesha. */
  lagnaRashi: number;
  transits: Record<GrahaId, Transit>;
  /** When the Moon leaves the rashi it is in now. */
  moonLeaves: Date;
}

export function skyNow(at: Date, place: Place): SkyNow {
  return {
    at,
    place,
    panchang: dayPanchang(todayIn(place.tz, at), place),
    lagnaRashi: zodiacPosition(ascendantLongitude(at, place.lat, place.lon)).rashi,
    transits: transitsAt(at),
    moonLeaves: moonStays(at, 0.01)[0].end,
  };
}
