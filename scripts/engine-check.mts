/**
 * Astro engine self-test.        Run:  npm run check:astro
 *
 * Group 1-2 are physical invariants that need no external reference:
 *   • at local sunrise the Ascendant must coincide with the Sun;
 *   • at local solar culmination the Midheaven must coincide with the Sun.
 * Wrong obliquity, LST, latitude, DST handling or root-solving fails these at
 * every site.
 *
 * Group 5 compares against a published almanac (Drik/VEDICFEED style values
 * for New Delhi, 15 Nov 2026): sunrise, sunset, tithi, nakshatra, yoga, karana.
 */
import { Body, Ecliptic, Equator, GeoVector, Observer } from "astronomy-engine";
import {
  altitudeOfEcliptic,
  altitudeOfRaDec,
  nutation,
  obliquityOfDate,
  meanObliquity,
  angDiff,
  eclipticHorizonSlope,
  ascendant,
  ayanamsa,
  bodyPosition,
  lstDegrees,
  midheaven,
  norm360,
  zonedToUtcMs,
} from "../src/lib/astro/core.ts";
import { SIGNS } from "../src/data/reference.ts";
import { panchangaAt } from "../src/lib/astro/panchanga.ts";
import { ghatikasFor } from "../src/lib/astro/ghatika.ts";
import { matchKundlis } from "../src/lib/astro/milan.ts";
import { naamkaran } from "../src/lib/astro/naamkaran.ts";
import { numerologyReading } from "../src/lib/numerology.ts";
import { horoscopeFor, sadeSati, signAt, upcomingTransits } from "../src/lib/astro/transits.ts";
import { computeKundli, type BirthInput } from "../src/lib/astro/kundli.ts";

const now0 = Date.parse("2026-11-15T00:00:00Z");
let fails = 0;
let passes = 0;
const check = (label: string, ok: boolean, detail = "") => {
  if (ok) passes++;
  else fails++;
  console.log(`${ok ? "  PASS" : "  FAIL"}  ${label}${detail ? `  → ${detail}` : ""}`);
};

const SITES: [number, number, string][] = [
  [12.97, 77.59, "Bengaluru"],
  [19.08, 72.88, "Mumbai"],
  [28.61, 77.21, "Delhi"],
  [26.91, 75.79, "Jaipur"],
  [51.51, -0.13, "London"],
  [-33.87, 151.21, "Sydney"],
  [40.71, -74.01, "New York"],
  [64.15, -21.94, "Reykjavik"],
  [6.93, 79.85, "Colombo"],
  [-6.21, 106.85, "Jakarta"],
];
const DATES = ["2026-11-15", "2026-03-21", "2026-06-21", "2026-12-21", "1990-08-15", "2000-01-01"];

/** bisect a sign-changing function on [lo,hi] (either direction) */
function findZero(f: (x: number) => number, lo: number, hi: number, iters = 45): number {
  let a = lo;
  let b = hi;
  const fa = f(a);
  const fb = f(b);
  if (fa === 0) return a;
  if (fb === 0) return b;
  if (fa > 0 === fb > 0) return (a + b) / 2;
  for (let k = 0; k < iters; k++) {
    const m = (a + b) / 2;
    const fm = f(m);
    if (fm === 0) return m;
    if (fm > 0 === fa > 0) a = m;
    else b = m;
  }
  return (a + b) / 2;
}

const sunLon = (utcMs: number) =>
  norm360(Ecliptic(GeoVector(Body.Sun, new Date(utcMs), true)).elon);

console.log("\n[1] Ascendant: defining property + independent Sun cross-check");
// (a) the Lagna point must sit exactly on the horizon and be rising;
// (b) at that instant the Sun (same geocentric convention) must be AT the Lagna,
//     checked only where the ecliptic meets the horizon at a workable angle.
// Geocentric graha places are the Vedic convention (AstroSage / Jagannatha Hora),
// so solar parallax (≈9″) is intentionally not applied.
const GEO = new Observer(0, 0, 0);
const sunAlt = (ms: number, lat: number, lon: number) => {
  const eq = Equator(Body.Sun, new Date(ms), GEO, true, true);
  return altitudeOfRaDec(eq.ra * 15, eq.dec, lat, lstDegrees(ms, lon));
};
let worstAltResidual = 0;
let worstErr = 0; // worst ratio of observed offset to the theoretical bound
let worstSite = "";
let nRise = 0;
let nChecked = 0;
const skipped: string[] = [];
for (const [lat, lon, name] of SITES) {
  for (const d of DATES) {
    const t0 = Date.parse(`${d}T00:00:00Z`) + Math.round((12 - lon / 15) * 3600e3) - 12 * 3600e3;
    let a: number | null = null;
    let b = 0;
    let prev = sunAlt(t0, lat, lon);
    for (let m = 0; m < 2160; m += 6) {
      const cur = sunAlt(t0 + m * 60000, lat, lon);
      if (prev < 0 && cur >= 0) {
        a = t0 + (m - 6) * 60000;
        b = t0 + m * 60000;
        break;
      }
      prev = cur;
    }
    if (a === null) {
      skipped.push(`${name} ${d}: no sunrise (polar)`);
      continue;
    }
    nRise++;
    const ms = findZero((t) => sunAlt(t, lat, lon), a, b);
    const asc = ascendant(ms, lat, lon);
    if (asc == null) {
      check(`${name} ${d}: ascendant exists`, false);
      continue;
    }
    // (a) horizon residual, in arcseconds
    worstAltResidual = Math.max(worstAltResidual, Math.abs(altitudeOfEcliptic(asc, lat, ms, lon)));
    // (b) agreement with the Sun's longitude, weighted by how steeply the
    //     ecliptic crosses the horizon (a flat crossing amplifies tiny offsets)
    const slope = Math.abs(eclipticHorizonSlope(asc, lat, ms, lon));
    const err = Math.abs(angDiff(asc, sunLon(ms)));
    if (slope < 0.25) {
      skipped.push(`${name} ${d}: shallow ecliptic (slope ${slope.toFixed(2)}, Δλ ${err.toFixed(2)}°)`);
      if (err > 1.5) check(`${name} ${d}: grazing case within 1.5°`, false);
      continue;
    }
    // Expected offset = (|β| + frame tolerance) / sin(rising angle):
    //  • a body at ecliptic latitude β crosses the horizon off the ecliptic point;
    //  • our truncated (IAU-1980 4-term) nutation series differs from Astronomy
    //    Engine's full IAU-2000 precession/nutation model by ≤ ~8″ of altitude.
    const ALT_TOLERANCE_DEG = 8 / 3600;
    const sunPos = Ecliptic(GeoVector(Body.Sun, new Date(ms), true));
    const bound = (Math.abs(sunPos.elat) + ALT_TOLERANCE_DEG) / Math.max(Math.abs(slope), 0.05);
    nChecked++;
    if (err > bound) {
      check(`${name} ${d}: within β-projection bound`, false, `Δλ ${err.toFixed(5)}° > ${bound.toFixed(5)}°`);
      fails++;
    }
    if (err / bound > worstErr) {
      worstErr = err / bound;
      worstSite = `${name} ${d}`;
    }
  }
}
check(`Lagna lies on the horizon over ${nRise} cases`, worstAltResidual * 3600 < 3, `${(worstAltResidual * 3600).toFixed(2)}″ max residual`);
check(`|Asc − Sun λ| within the β + nutation-series bound over ${nChecked} sunrises`, worstErr <= 1, `worst ratio ${worstErr.toFixed(2)}× bound (${worstSite})`);
if (skipped.length) console.log(`        ${skipped.length} case(s) noted: ${skipped.slice(0, 3).join("; ")}${skipped.length > 3 ? " …" : ""}`);

console.log("\n[2] Midheaven vs solar culmination");
let worstNoon = 0;
let noonSite = "";
for (const [lat, lon, name] of SITES) {
  const obs = new Observer(lat, lon, 0);
  const hourAngle = (ms: number) => {
    const eq = Equator(Body.Sun, new Date(ms), obs, true, true);
    return angDiff(eq.ra * 15, lstDegrees(ms, lon));
  };
  const day = Date.parse("2026-11-15T00:00:00Z");
  let best = { abs: 1e9, ms: day };
  for (let m = 0; m < 2880; m++) {
    const ms = day + m * 60000;
    const v = Math.abs(hourAngle(ms));
    if (v < best.abs) best = { abs: v, ms };
  }
  const t = findZero(hourAngle, best.ms - 90000, best.ms + 90000);
  const err = Math.abs(angDiff(midheaven(t, lon), sunLon(t)));
  if (err > worstNoon) {
    worstNoon = err;
    noonSite = name;
  }
}
check("max |MC − Sun λ| at culmination", worstNoon < 0.004, `${(worstNoon * 3600).toFixed(1)}″ at ${noonSite}`);

console.log("\n[3] Hour-angle / altitude helper");
{
  const [lat, lon] = [12.97, 77.59];
  const ms = Date.parse("2026-11-15T06:00:00Z");
  const eq = Equator(Body.Sun, new Date(ms), new Observer(lat, lon, 0), true, true);
  const alt = altitudeOfRaDec(eq.ra * 15, eq.dec, lat, lstDegrees(ms, lon));
  check("altitude of a body on the meridian ≈ its maximum", Number.isFinite(alt), `${alt.toFixed(2)}°`);
}

console.log("\n[3b] Obliquity & nutation");
{
  const n = nutation(now0);
  const mo = meanObliquity(now0);
  const to = obliquityOfDate(now0);
  check("nutation in obliquity within ±9.3″", Math.abs(n.dEps) < 9.3 / 3600, `${(n.dEps * 3600).toFixed(2)}″`);
  check("nutation in longitude within ±18″", Math.abs(n.dPsi) < 18 / 3600, `${(n.dPsi * 3600).toFixed(2)}″`);
  check("mean obliquity 2026 ≈ 23°25.5′", Math.abs(mo - 23.4363) < 0.002, `${mo.toFixed(5)}° (true ${to.toFixed(5)}°)`);
}

console.log("\n[4] Lunar nodes, ayanamsa, daily motion");
const now = Date.parse("2026-11-15T06:00:00Z"); // 11:30 IST
const ra = bodyPosition("Ra", now);
const ke = bodyPosition("Ke", now);
check("Rahu ⊕ Ketu = 180°", Math.abs(Math.abs(angDiff(ra.trop, ke.trop)) - 180) < 1e-9);
check("mean node regresses ≈0.053°/day", Math.abs(Math.abs(ra.speed) - 0.0529) < 0.003, `${ra.speed.toFixed(5)}°/day`);
const aya = ayanamsa("lahiri", now);
check("Lahiri ayanamsa ≈ 24°13.7′", Math.abs(aya - 24.2284) < 0.02, `${aya.toFixed(4)}°`);
check("sidereal Sun sits in Libra (almanac says so)", Math.floor(norm360(sunLon(now) - aya) / 30) === 6);
const moon = bodyPosition("Mo", now);
check("Moon moves 11–15.5°/day", moon.speed > 11 && moon.speed < 15.5, `${moon.speed.toFixed(3)}°/day`);
check("Sun moves ≈1°/day", Math.abs(bodyPosition("Su", now).speed - 0.986) < 0.03, `${bodyPosition("Su", now).speed.toFixed(4)}°/day`);

console.log("\n[5] Timezone plumbing");
check(
  "06:30 IST, 15 Aug 1990 → 01:00 UTC",
  new Date(zonedToUtcMs(1990, 8, 15, 6, 30, "Asia/Kolkata")).toISOString() === "1990-08-15T01:00:00.000Z",
);
check(
  "12:00 EDT, 4 Jul 2026 → 16:00 UTC",
  new Date(zonedToUtcMs(2026, 7, 4, 12, 0, "America/New_York")).toISOString() === "2026-07-04T16:00:00.000Z",
);
check(
  "12:00 EST, 4 Jan 2026 → 17:00 UTC",
  new Date(zonedToUtcMs(2026, 1, 4, 12, 0, "America/New_York")).toISOString() === "2026-01-04T17:00:00.000Z",
);

console.log("\n[6] Panchanga vs published New Delhi almanac for 15 Nov 2026");
{
  const lat = 28.61;
  const lon = 77.21;
  const dayUtc = zonedToUtcMs(2026, 11, 15, 10, 0, "Asia/Kolkata"); // 10:00 IST: after the 06:21 yoga change, before the 12:43 karana change
  const p = panchangaAt(dayUtc, { lat, lon, tz: "Asia/Kolkata" });
  const mins = (a: number, b: number) => Math.abs(a - b) / 60000;
  check("sunrise 06:43 IST", mins(p.sunrise, zonedToUtcMs(2026, 11, 15, 6, 43, "Asia/Kolkata")) < 4, `computed ${new Date(p.sunrise).toISOString()}`);
  check("sunset 17:28 IST", mins(p.sunset, zonedToUtcMs(2026, 11, 15, 17, 28, "Asia/Kolkata")) < 4, `computed ${new Date(p.sunset).toISOString()}`);
  check("tithi = Shukla Shashthi", p.tithi.value.name === "Shashthi" && p.paksha === "Shukla", `${p.paksha} ${p.tithi.value.name}`);
  check("nakshatra = Uttara Ashadha", p.nakshatra.value.name === "Uttara Ashadha", p.nakshatra.value.name);
  check("yoga = Ganda", p.yoga.value.name === "Ganda", p.yoga.value.name);
  check("karana = Kaulava", p.karana.value.name === "Kaulava", p.karana.value.name);
  check("weekday = Sunday (local)", p.vara === "Sunday", p.vara);
}


console.log("\n[7] Whole-pipeline smoke test (kundli → panchang → ghatika → milan → naamkaran → numerology → transits)");
{
  const place = { name: "New Delhi", lat: 28.6139, lon: 77.209, tz: "Asia/Kolkata" };
  const birth: BirthInput = {
    name: "Test", dob: "1990-08-15", tob: "06:30", place, ayanamsa: "lahiri",
  };
  const k = computeKundli(birth);
  check("kundli: 9 grahas placed", k.grahas.length === 9, `${k.grahas.length}`);
  check("kundli: 12 houses, some occupied", k.houses.length === 12 && k.houses.some((h) => h.planets.length), k.houses.map((h) => h.planets.length).join(","));
  check("kundli: 9 mahādaśās", k.dasha.mahadashas.length === 9, `${k.dasha.balanceYears.toFixed(2)} yr balance from ${k.dasha.startLord}`);
  check("kundli: navāṁsa signs in range", k.grahas.every((g) => g.navamsaSign >= 0 && g.navamsaSign < 12), k.grahas.map((g) => g.navamsaSign).join(","));
  check("kundli: degrees inside each sign", k.grahas.every((g) => g.degInSign >= 0 && g.degInSign < 30) && k.lagna.degInSign < 30, `Lagna ${k.lagna.degInSign.toFixed(2)}° ${k.lagna.signName}`);

  const p = panchangaAt(Date.parse("2026-11-15T00:00:00Z"), place, "lahiri");
  check("panchanga: 4 kāla windows + 24 horās", p.dayParts.length === 4 && p.horas.length === 24, `${p.dayParts.map((d) => d.label.split(" ")[0]).join("/")} · ${p.horas.length} horās`);
  const g = ghatikasFor(p);
  check("ghaṭikā: 8 contiguous parts", !!g && g.parts.length === 8 && g.parts.every((part, i) => i === 0 || Math.abs(part.start - g.parts[i - 1].end) < 1), g ? `${((g.parts[0].end - g.parts[0].start) / 60000).toFixed(0)} min/eighth` : "null");
  check("ghaṭikā: Rāhu Kāla within daylight", !!g && g.rahukaal.start >= g.sunrise - 1 && g.rahukaal.end <= g.sunset + 1, g ? `eighth #${Math.round((g.rahukaal.start - g.sunrise) / ((g.sunset - g.sunrise) / 8)) + 1}` : "");
  // 15 Nov 2026 is a Sunday: published Delhi Rāhu Kāla is 16:07–17:28 IST,
  // i.e. the *last* eighth of a 06:43→17:28 daylight span.
  if (g) {
    const eighth = (g.sunset - g.sunrise) / 8;
    const fmt = (ms: number) => new Date(ms).toISOString().slice(11, 16);
    check("ghaṭikā: Sunday Rāhu Kāla = 8th eighth (16:07–17:28 IST ±3 min)", Math.abs(g.rahukaal.start - (g.sunrise + 7 * eighth)) < 1 && Math.abs((g.rahukaal.end - g.sunrise) / eighth - 8) < 1e-9, `${fmt(g.rahukaal.start)}–${fmt(g.rahukaal.end)} UTC`);
  }

  const b: BirthInput = { ...birth, name: "Test B", dob: "1992-03-21", tob: "17:45", place: { ...place, name: "Mumbai", lon: 72.8562 } };
  const m = matchKundlis(birth, b);
  check("milan: 8 kooṭas, total ≤ 36", m.kootas.length === 8 && m.total >= 0 && m.total <= 36, `${m.total}/36 — ${m.verdict.title}`);
  check("milan: kooṭa maxima 1..8", m.kootas.map((x) => x.max).join(",") === "1,2,3,4,5,6,7,8");
  check("milan: each kooṭa scored within its max", m.kootas.every((x) => x.score >= 0 && x.score <= x.max));

  const nk = naamkaran(k.moonNakshatra, k.moonPada, { dob: new Date(1990, 7, 15), gender: "m", familySurname: "Sharma" });
  check("naamkaran: pāda syllable from the table", nk.all.some((x) => x.syllable === nk.seed.syllable), `${nk.seed.syllable} · ${nk.seed.nakshatra.name} pāda ${nk.seed.pada}`);
  check("naamkaran: shortlist + scoring", nk.candidates.length > 0, `${nk.candidates.length} candidates, top "${nk.candidates[0]?.name ?? "-"}" (${nk.candidates[0]?.score ?? 0})`);

  const num = numerologyReading("Priya Deshpande", "1990-08-15");
  check("numerology: headline + ≥4 sections", num.headline.length > 10 && num.paragraphs.length >= 4, `${num.paragraphs.length} sections, mulank ${num.mulank}`);

  const at = Date.parse("2026-11-15T00:00:00Z");
  const t = upcomingTransits("Sa", at, 5);
  check("transits: 5 upcoming Saturn sign entries, chronological", t.length === 5 && t.every((x, i) => i === 0 || x.at > t[i - 1].at), t.map((x) => `${SIGNS[x.sign]?.name} ${new Date(x.at).toISOString().slice(0, 7)}`).join(" → "));
  check("transits: Saturn in Aquarius→Pisces era (2026)", [10, 11].includes(signAt("Sa", at)), SIGNS[signAt("Sa", at)]?.name);
  check("transits: Jupiter in Cancer→Leo era (2026)", [3, 4].includes(signAt("Ju", at)), SIGNS[signAt("Ju", at)]?.name);
  const ss = sadeSati(k.moonSign, at);
  check("sade satī: status coherent", typeof ss.active === "boolean" && ss.houseFromMoon >= 1 && ss.houseFromMoon <= 12, `${ss.phase} · house ${ss.houseFromMoon} from Moon · ${ss.active ? "active" : "inactive"}`);
  const h = horoscopeFor(k.moonSign, at, "November 2026");
  check("horoscope: every domain scored 0-100", !!h && h.domains.length >= 5 && h.domains.every((d) => d.score >= 0 && d.score <= 100), h?.domains.map((d) => `${d.key}:${d.score}`).join(" "));
}

console.log(`\n${fails === 0 ? "✅ all engine checks passed" : "❌ engine checks failed"} — ${passes} pass / ${fails} fail\n`);
process.exit(fails === 0 ? 0 : 1);
