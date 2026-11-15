/**
 * Checks the astrology engine in lib/astro.   Run:  npm run test:astro
 *
 * Positions and panchanga are compared with reference values from Swiss Ephemeris
 * (scripts/fixtures/reference.json). The Ashtakoota tables are checked against the properties the
 * tradition states for them, so a mistyped cell shows up as a failed rule.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { GRAHAS, angleDiff, ascendantLongitude, lahiriAyanamsa, grahaStates, type GrahaId } from '../lib/astro/core';
import { computeKundli, currentDasha, kaalSarp, manglik, sadeSatiCycles, sadeSatiStatus, vimshottari } from '../lib/astro/kundli';
import { KOOTA_MAX, KOOTA_ORDER, ashtakoota, matchBand } from '../lib/astro/matching';
import { bhagyank, mulank, namank, reduceToDigit } from '../lib/astro/numerology';
import { dayPanchang, karanaName, lunarMonth, tithiAt } from '../lib/astro/panchang';
import { FAVOURABLE_HOUSES, gochar, moonStays, transitsAt } from '../lib/astro/gochar';
import { searchPlaces } from '../lib/astro/places';
import { civilToInstant, formatClock, offsetMinutes } from '../lib/astro/time';
import { DASHA_YEARS, NAKSHATRA_SPAN, PADA_SPAN, dignity, houseFrom, nakshatraLord, zodiacPosition } from '../lib/astro/zodiac';
import { MASA, NAKSHATRA, RASHI, TITHI, YOGA, KARANA } from '../lib/astro/names';

const reference = JSON.parse(readFileSync(join(__dirname, 'fixtures', 'reference.json'), 'utf8'));

let passed = 0;
const failures: string[] = [];
function check(name: string, ok: boolean, detail = ''): void {
  if (ok) passed++;
  else failures.push(detail ? `${name} — ${detail}` : name);
}
const near = (a: number, b: number, tol: number) => Math.abs(a - b) <= tol;
const section = (title: string) => console.log(`\n${title}`);

/* ------------------------------------------------------------------ positions */
section('Sidereal positions vs Swiss Ephemeris');
{
  const worst: Record<string, number> = {};
  const limitArcsec: Record<string, number> = { Sun: 10, Moon: 15, Mars: 20, Mercury: 20, Jupiter: 20, Venus: 20, Saturn: 20, Rahu: 2, asc: 15, ayanamsa: 1 };
  for (const row of reference.positions) {
    const instant = new Date(row.utc);
    const states = grahaStates(instant);
    for (const g of ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu'] as GrahaId[]) {
      const err = Math.abs(angleDiff(states[g].lon, row[g][0])) * 3600;
      worst[g] = Math.max(worst[g] ?? 0, err);
      check(`${g} longitude ${row.utc}`, err <= limitArcsec[g], `${err.toFixed(1)}″ off`);
      if (g !== 'Rahu') check(`${g} retrograde flag ${row.utc}`, Math.abs(row[g][1]) < 0.003 || states[g].retrograde === row[g][1] < 0, `speed ${row[g][1]}`);
    }
    check(`Ketu opposite Rahu ${row.utc}`, near(Math.abs(angleDiff(states.Ketu.lon, states.Rahu.lon)), 180, 1e-9));
    const ascErr = Math.abs(angleDiff(ascendantLongitude(instant, row.lat, row.lon), row.asc)) * 3600;
    worst.asc = Math.max(worst.asc ?? 0, ascErr);
    check(`lagna ${row.place} ${row.utc}`, ascErr <= limitArcsec.asc, `${ascErr.toFixed(1)}″ off`);
    const ayErr = Math.abs(lahiriAyanamsa(instant) - row.ayanamsa) * 3600;
    worst.ayanamsa = Math.max(worst.ayanamsa ?? 0, ayErr);
    check(`ayanamsa ${row.utc}`, ayErr <= limitArcsec.ayanamsa, `${ayErr.toFixed(2)}″ off`);
  }
  console.log('  largest difference (arc-seconds):', Object.entries(worst).map(([k, v]) => `${k} ${v.toFixed(1)}`).join(' · '));
}

/* ------------------------------------------------------------------ clock time */
section('Birth clock time → universal time');
for (const row of reference.positions) {
  const [year, month, day, hour, minute] = row.local;
  const instant = civilToInstant({ year, month, day, hour, minute }, row.tz);
  check(`${row.place} ${row.local.join('-')}`, instant.toISOString().slice(0, 19) + 'Z' === row.utc, `${instant.toISOString()} vs ${row.utc}`);
  check(`offset ${row.place} ${row.local.join('-')}`, offsetMinutes(row.tz, instant) === row.offsetMin);
}
{
  // India kept its clocks an hour ahead from September 1942 to October 1945.
  const wartime = civilToInstant({ year: 1943, month: 6, day: 1, hour: 12, minute: 0 }, 'Asia/Kolkata');
  check('wartime India is UTC+6:30', wartime.toISOString() === '1943-06-01T05:30:00.000Z', wartime.toISOString());
  const modern = civilToInstant({ year: 1995, month: 6, day: 15, hour: 8, minute: 30 }, 'Asia/Kolkata');
  check('IST is UTC+5:30', modern.toISOString() === '1995-06-15T03:00:00.000Z', modern.toISOString());
  const summer = civilToInstant({ year: 2010, month: 7, day: 1, hour: 9, minute: 0 }, 'Europe/London');
  check('London summer time', summer.toISOString() === '2010-07-01T08:00:00.000Z', summer.toISOString());
  check('clock formatting', formatClock(new Date('2026-11-15T00:55:40Z'), 'Asia/Kolkata') === '6:26 AM', formatClock(new Date('2026-11-15T00:55:40Z'), 'Asia/Kolkata'));
  check('clock formatting noon', formatClock(new Date('2026-11-15T06:30:00Z'), 'Asia/Kolkata') === '12:00 PM');
}

/* ------------------------------------------------------------------ zodiac helpers */
section('Rashi, nakshatra, pada, navamsa');
{
  const p = zodiacPosition(0);
  check('0° is Mesha, Ashwini pada 1', p.rashi === 0 && p.nakshatra === 0 && p.pada === 1 && p.navamsa === 0);
  check('just under 360° is Meena, Revati pada 4', (() => { const z = zodiacPosition(359.9999); return z.rashi === 11 && z.nakshatra === 26 && z.pada === 4 && z.navamsa === 11; })());
  check('Krittika straddles Mesha and Vrishabha', zodiacPosition(29.9).nakshatra === 2 && zodiacPosition(30.1).nakshatra === 2 && zodiacPosition(29.9).rashi === 0 && zodiacPosition(30.1).rashi === 1);
  check('navamsa of 0° Vrishabha is Makara', zodiacPosition(30).navamsa === 9);
  check('navamsa of 0° Mithuna is Tula', zodiacPosition(60).navamsa === 6);
  check('navamsa of 0° Karka is Karka', zodiacPosition(90).navamsa === 3);
  check('vargottama: 1° Mesha', zodiacPosition(1).navamsa === 0);
  check('108 padas', Math.abs(PADA_SPAN * 108 - 360) < 1e-9 && Math.abs(NAKSHATRA_SPAN * 27 - 360) < 1e-9);
  check('house counting', houseFrom(0, 0) === 1 && houseFrom(0, 11) === 12 && houseFrom(11, 0) === 2 && houseFrom(5, 4) === 12);
  check('Surya exalted in Mesha, debilitated in Tula, own in Simha', dignity('Sun', 0) === 'exalted' && dignity('Sun', 6) === 'debilitated' && dignity('Sun', 4) === 'own');
  check('Guru exalted in Karka', dignity('Jupiter', 3) === 'exalted' && dignity('Jupiter', 9) === 'debilitated');
  check('Shani exalted in Tula', dignity('Saturn', 6) === 'exalted' && dignity('Saturn', 0) === 'debilitated');
  check('nakshatra lords', nakshatraLord(0) === 'Ketu' && nakshatraLord(1) === 'Venus' && nakshatraLord(3) === 'Moon' && nakshatraLord(26) === 'Mercury' && nakshatraLord(9) === 'Ketu');
  check('name lists are complete', RASHI.en.length === 12 && RASHI.hi.length === 12 && RASHI.kn.length === 12 && NAKSHATRA.en.length === 27 && NAKSHATRA.hi.length === 27 && NAKSHATRA.kn.length === 27 && TITHI.en.length === 14 && TITHI.hi.length === 14 && TITHI.kn.length === 14 && YOGA.en.length === 27 && YOGA.hi.length === 27 && YOGA.kn.length === 27 && KARANA.en.length === 11 && KARANA.hi.length === 11 && KARANA.kn.length === 11 && MASA.en.length === 12 && MASA.hi.length === 12 && MASA.kn.length === 12);
}

/* ------------------------------------------------------------------ panchanga */
section('Panchanga vs Swiss Ephemeris');
{
  let worstRise = 0;
  let worstEnd = 0;
  for (const row of reference.panchang) {
    const [year, month, day] = row.date;
    const p = dayPanchang({ year, month, day }, { name: row.place, lat: row.lat, lon: row.lon, tz: row.tz });
    const label = `${row.place} ${row.date.join('-')}`;
    const secs = (a: Date | null, iso: string) => (a ? Math.abs(a.getTime() - new Date(iso).getTime()) / 1000 : Infinity);
    worstRise = Math.max(worstRise, secs(p.sunrise, row.sunrise), secs(p.sunset, row.sunset));
    check(`sunrise ${label}`, secs(p.sunrise, row.sunrise) <= 60, `${secs(p.sunrise, row.sunrise).toFixed(0)}s off`);
    check(`sunset ${label}`, secs(p.sunset, row.sunset) <= 60, `${secs(p.sunset, row.sunset).toFixed(0)}s off`);
    // A limb that changes within a minute of sunrise can legitimately land either side of it.
    const edge = (iso: string) => Math.abs(new Date(iso).getTime() - new Date(row.sunrise).getTime()) < 90000;
    if (!edge(row.tithiEnd)) {
      check(`tithi ${label}`, p.tithis[0].index === row.tithi, `${p.tithis[0].index} vs ${row.tithi}`);
      check(`tithi end ${label}`, secs(p.tithis[0].end, row.tithiEnd) <= 90, `${secs(p.tithis[0].end, row.tithiEnd).toFixed(0)}s off`);
      check(`karana ${label}`, p.karanas[0].index === karanaName(row.karanaHalfTithi));
      worstEnd = Math.max(worstEnd, secs(p.tithis[0].end, row.tithiEnd));
    }
    if (!edge(row.nakshatraEnd)) {
      check(`nakshatra ${label}`, p.nakshatras[0].index === row.nakshatra, `${p.nakshatras[0].index} vs ${row.nakshatra}`);
      check(`nakshatra end ${label}`, secs(p.nakshatras[0].end, row.nakshatraEnd) <= 90, `${secs(p.nakshatras[0].end, row.nakshatraEnd).toFixed(0)}s off`);
      worstEnd = Math.max(worstEnd, secs(p.nakshatras[0].end, row.nakshatraEnd));
    }
    if (!edge(row.yogaEnd)) {
      check(`yoga ${label}`, p.yogas[0].index === row.yoga, `${p.yogas[0].index} vs ${row.yoga}`);
      check(`yoga end ${label}`, secs(p.yogas[0].end, row.yogaEnd) <= 90, `${secs(p.yogas[0].end, row.yogaEnd).toFixed(0)}s off`);
      worstEnd = Math.max(worstEnd, secs(p.yogas[0].end, row.yogaEnd));
    }
    check(`sun rashi ${label}`, p.sunRashi === row.sunRashi);
    check(`moon rashi ${label}`, p.moonRashi === row.moonRashi);
    // spans tile the day without gaps and reach the next sunrise
    for (const list of [p.tithis, p.nakshatras, p.yogas, p.karanas]) {
      check(`spans ordered ${label}`, list.every((s, i) => i === 0 || s.end.getTime() > list[i - 1].end.getTime()));
      check(`spans reach next sunrise ${label}`, p.nextSunrise !== null && list[list.length - 1].end.getTime() >= p.nextSunrise.getTime());
    }
    check(`karanas run twice as fast as tithis ${label}`, p.karanas.length >= p.tithis.length);
    if (p.rahuKala && p.sunrise && p.sunset) {
      const eighth = (p.sunset.getTime() - p.sunrise.getTime()) / 8;
      check(`rahu kala is one eighth of the day ${label}`, near(p.rahuKala.end.getTime() - p.rahuKala.start.getTime(), eighth, 1));
      check(`rahu kala inside daylight ${label}`, p.rahuKala.start >= p.sunrise && p.rahuKala.end.getTime() <= p.sunset.getTime() + 1);
      check(`abhijit straddles midday ${label}`, p.abhijit !== null && near((p.abhijit.start.getTime() + p.abhijit.end.getTime()) / 2, (p.sunrise.getTime() + p.sunset.getTime()) / 2, 1));
    }
  }
  console.log(`  largest difference: sunrise/sunset ${worstRise.toFixed(0)}s · limb end times ${worstEnd.toFixed(0)}s`);
}
{
  // Rahu Kala on a 6-to-6 day falls where every almanac prints it.
  const hours = (part: number) => [6 + (part - 1) * 1.5, 6 + part * 1.5];
  const RAHU = [8, 2, 7, 5, 6, 4, 3];
  check('Rahu Kala: Sunday 4:30–6, Monday 7:30–9, Saturday 9–10:30', hours(RAHU[0])[0] === 16.5 && hours(RAHU[1])[0] === 7.5 && hours(RAHU[6])[0] === 9 && hours(RAHU[2])[0] === 15 && hours(RAHU[3])[0] === 12 && hours(RAHU[4])[0] === 13.5 && hours(RAHU[5])[0] === 10.5);
  check('karana cycle', karanaName(0) === 10 && karanaName(1) === 0 && karanaName(7) === 6 && karanaName(8) === 0 && karanaName(56) === 6 && karanaName(57) === 7 && karanaName(58) === 8 && karanaName(59) === 9);
}

/* ------------------------------------------------------------------ lunar months & festivals */
section('Lunar months on known festival days');
{
  const blr = { name: 'Bengaluru', lat: 12.972, lon: 77.594, tz: 'Asia/Kolkata' };
  const day = (year: number, month: number, d: number) => dayPanchang({ year, month, day: d }, blr);
  const cases: [string, number, number, number, number, number | null, boolean][] = [
    // label, y, m, d, expected amanta month, expected tithi at sunrise (null = not asserted), adhika
    ['Deepavali Amavasya 2023 (Ashwina)', 2023, 11, 13, 6, 29, false],
    ['Ugadi 2024 — Chaitra Shukla Pratipada', 2024, 4, 9, 0, 0, false],
    ['Rama Navami 2024', 2024, 4, 17, 0, 8, false],
    ['Ganesha Chaturthi 2024', 2024, 9, 7, 5, 3, false],
    ['Vijayadashami 2024', 2024, 10, 12, 6, null, false],
    ['Maha Shivaratri 2025 (Magha Krishna)', 2025, 2, 26, 10, null, false],
    ['Ugadi 2025', 2025, 3, 30, 0, 0, false],
    ['Krishna Janmashtami 2025 (Shravana Krishna)', 2025, 8, 16, 4, null, false],
    ['Adhika Shravana 2023', 2023, 8, 1, 4, null, true],
    ['Nija Shravana 2023', 2023, 8, 25, 4, null, false],
    ['Adhika Jyeshtha 2026', 2026, 5, 25, 2, null, true],
    ['Kartika, mid-November 2026', 2026, 11, 15, 7, null, false],
  ];
  for (const [label, y, m, d, masa, tithi, adhika] of cases) {
    const p = day(y, m, d);
    check(`${label}: month`, p.masa.amanta === masa, `got ${MASA.en[p.masa.amanta]}`);
    check(`${label}: adhika`, p.masa.adhika === adhika, `got ${p.masa.adhika}`);
    if (tithi !== null) check(`${label}: tithi`, p.tithis[0].index === tithi, `got ${p.tithis[0].index}`);
  }
  const shivaratri = day(2025, 2, 26);
  check('Shivaratri night holds Krishna Chaturdashi', shivaratri.tithis.some((s) => s.index === 28));
  check('purnimanta runs a month ahead in Krishna paksha', shivaratri.paksha === 'krishna' ? shivaratri.masa.purnimanta === (shivaratri.masa.amanta + 1) % 12 : true);
  const janmashtami = day(2025, 8, 16);
  check('Janmashtami holds Krishna Ashtami', janmashtami.tithis.some((s) => s.index === 22) || day(2025, 8, 15).tithis.some((s) => s.index === 22));
  check('tithiAt agrees with dayPanchang', tithiAt(shivaratri.sunrise!) === shivaratri.tithis[0].index);
  check('lunarMonth direct call', lunarMonth(new Date('2026-11-15T03:00:00Z'), 5).amanta === 7);
}

/* ------------------------------------------------------------------ ashtakoota */
section('Ashtakoota Guna Milan');
{
  const moon = (nakshatra: number, pada: number) => zodiacPosition(nakshatra * NAKSHATRA_SPAN + (pada - 0.5) * PADA_SPAN);
  const all: ReturnType<typeof moon>[] = [];
  for (let n = 0; n < 27; n++) for (let p = 1; p <= 4; p++) all.push(moon(n, p));
  check('108 nakshatra padas', all.length === 108);

  let max = 0;
  let min = 99;
  let inRange = true;
  let sumsRight = true;
  let nadiRule = true;
  let bhakootRule = true;
  let yoniSymmetric = true;
  let maitriSymmetric = true;
  let nadiSymmetric = true;
  let taraSymmetric = true;
  let sameNakshatraSameRashi = true;
  for (const boy of all) {
    for (const girl of all) {
      const r = ashtakoota(boy, girl);
      const mirror = ashtakoota(girl, boy);
      const by = Object.fromEntries(r.kootas.map((k) => [k.key, k]));
      const mby = Object.fromEntries(mirror.kootas.map((k) => [k.key, k]));
      max = Math.max(max, r.total);
      min = Math.min(min, r.total);
      if (!r.kootas.every((k) => k.points >= 0 && k.points <= KOOTA_MAX[k.key] && k.max === KOOTA_MAX[k.key])) inRange = false;
      if (Math.abs(r.kootas.reduce((s, k) => s + k.points, 0) - r.total) > 1e-9) sumsRight = false;
      if ((by.nadi.points === 0) !== (by.nadi.boy === by.nadi.girl)) nadiRule = false;
      const dist = ((girl.rashi - boy.rashi + 12) % 12) + 1;
      if ((by.bhakoot.points === 0) !== [2, 12, 5, 9, 6, 8].includes(dist)) bhakootRule = false;
      if (by.yoni.points !== mby.yoni.points) yoniSymmetric = false;
      if (by.maitri.points !== mby.maitri.points) maitriSymmetric = false;
      if (by.nadi.points !== mby.nadi.points || by.bhakoot.points !== mby.bhakoot.points) nadiSymmetric = false;
      if (by.tara.points !== mby.tara.points) taraSymmetric = false;
      // Same star in the same sign loses Nadi and nothing else (Vashya can still differ across the halves of Dhanu and Makara).
      if (boy.nakshatra === girl.nakshatra && boy.rashi === girl.rashi && r.total !== 26 + by.vashya.points) sameNakshatraSameRashi = false;
    }
  }
  check('every koota stays within its maximum', inRange);
  check('total is the sum of the eight kootas', sumsRight);
  check('highest possible score is 36', max === 36, `max ${max}`);
  check('lowest score is not negative', min >= 0, `min ${min}`);
  check('Nadi scores 0 exactly when both nadis are the same', nadiRule);
  check('Bhakoot scores 0 exactly for 2/12, 5/9 and 6/8', bhakootRule);
  check('Yoni table is symmetric', yoniSymmetric);
  check('Graha Maitri is symmetric', maitriSymmetric);
  check('Nadi and Bhakoot do not depend on who is the boy', nadiSymmetric);
  check('Tara total does not depend on who is the boy', taraSymmetric);
  check('same nakshatra and rashi loses only the 8 points of Nadi', sameNakshatraSameRashi);
  check('identical Moons in Ashwini score 28', ashtakoota(moon(0, 1), moon(0, 1)).total === 28);
  check('koota maxima add up to 36', KOOTA_ORDER.reduce((s, k) => s + KOOTA_MAX[k], 0) === 36);

  const score = (bn: number, bp: number, gn: number, gp: number) => ashtakoota(moon(bn, bp), moon(gn, gp));
  const koota = (r: ReturnType<typeof score>, key: string) => r.kootas.find((k) => k.key === key)!;
  // Hand-worked pairs.
  {
    // Boy Rohini (Vrishabha), girl Hasta (Kanya): both earth signs, Venus & Mercury mutual friends, 5/9 apart.
    const r = score(3, 2, 12, 2);
    check('Rohini–Hasta varna 1', koota(r, 'varna').points === 1);
    check('Rohini–Hasta vashya 1 (chatushpada groom, manava bride)', koota(r, 'vashya').points === 1);
    check('Rohini–Hasta tara 3', koota(r, 'tara').points === 3, `${koota(r, 'tara').points}`);
    check('Rohini–Hasta yoni 1 (serpent–buffalo)', koota(r, 'yoni').points === 1);
    check('Rohini–Hasta maitri 5', koota(r, 'maitri').points === 5);
    check('Rohini–Hasta gana 5 (manushya groom, deva bride)', koota(r, 'gana').points === 5);
    check('Rohini–Hasta bhakoot 0 (5/9)', koota(r, 'bhakoot').points === 0 && r.bhakootPattern === '5/9');
    check('Rohini–Hasta nadi 8', koota(r, 'nadi').points === 8);
    check('Rohini–Hasta total 24', r.total === 24, `${r.total}`);
    check('Rohini–Hasta bhakoot dosha set aside by friendly lords', r.bhakootDosha.present && r.bhakootDosha.exception === 'friendly-lords');
  }
  {
    // Boy Ashwini (Mesha), girl Magha (Simha): Mars & Sun friends, 5/9, deva groom with rakshasa bride.
    const r = score(0, 1, 9, 1);
    check('Ashwini–Magha gana 0', koota(r, 'gana').points === 0);
    check('Ashwini–Magha maitri 5', koota(r, 'maitri').points === 5);
    check('Ashwini–Magha nadi 8 (adi / antya)', koota(r, 'nadi').points === 8);
    check('Ashwini–Magha tara 3 (Janma tara both ways)', koota(r, 'tara').points === 3, `${koota(r, 'tara').points}`);
    check('Ashwini–Magha yoni 2 (horse–rat)', koota(r, 'yoni').points === 2);
    check('reverse pair: rakshasa groom, deva bride scores 1', koota(score(9, 1, 0, 1), 'gana').points === 1);
  }
  {
    // 6/8 with one lord: Mesha and Vrishchika are both ruled by Mangal.
    const r = score(0, 1, 16, 1); // Ashwini (Mesha) – Anuradha (Vrishchika)
    check('Mesha–Vrishchika is 6/8', r.bhakootPattern === '6/8' && koota(r, 'bhakoot').points === 0);
    check('Mesha–Vrishchika exception: same lord', r.bhakootDosha.exception === 'same-lord');
    check('Mesha–Vrishchika maitri 5', koota(r, 'maitri').points === 5);
    check('kshatriya groom, brahmin bride: varna 0', koota(r, 'varna').points === 0);
    check('brahmin groom, kshatriya bride: varna 1', koota(score(16, 1, 0, 1), 'varna').points === 1);
  }
  {
    // Nadi exceptions
    const sameStarOtherPada = score(0, 1, 0, 3);
    check('same nakshatra, different pada: nadi dosha with exception', sameStarOtherPada.nadiDosha.present && sameStarOtherPada.nadiDosha.exception === 'same-nakshatra-different-pada');
    const sameAll = score(0, 2, 0, 2);
    check('same nakshatra and pada: nadi dosha, no exception', sameAll.nadiDosha.present && sameAll.nadiDosha.exception === null);
    const krittika = score(2, 1, 2, 3); // Krittika pada 1 is Mesha, pada 3 is Vrishabha
    check('same nakshatra across two rashis', krittika.nadiDosha.exception === 'same-nakshatra-different-rashi');
    const ardraPunarvasu = score(5, 2, 6, 2); // both Mithuna, both Adi nadi
    check('same rashi, different nakshatra', ardraPunarvasu.nadiDosha.present && ardraPunarvasu.nadiDosha.exception === 'same-rashi-different-nakshatra');
    check('different nadi: no dosha', !score(0, 1, 1, 1).nadiDosha.present);
  }
  {
    // Vashya halves of Dhanu and Makara
    const dhanuEarly = zodiacPosition(240 + 5);
    const dhanuLate = zodiacPosition(240 + 25);
    const makaraEarly = zodiacPosition(270 + 5);
    const makaraLate = zodiacPosition(270 + 25);
    const v = (m: ReturnType<typeof zodiacPosition>) => ashtakoota(m, m).kootas[1].boy;
    check('Dhanu first half manava, second half chatushpada', v(dhanuEarly) === 1 && v(dhanuLate) === 0);
    check('Makara first half chatushpada, second half jalachara', v(makaraEarly) === 0 && v(makaraLate) === 2);
    check('Simha is vanachara, Vrishchika is keeta', v(zodiacPosition(125)) === 3 && v(zodiacPosition(215)) === 4);
    const simhaGroom = ashtakoota(zodiacPosition(125), zodiacPosition(5)).kootas[1].points; // chatushpada bride, vanachara groom
    const simhaBride = ashtakoota(zodiacPosition(5), zodiacPosition(125)).kootas[1].points;
    check('vashya is directional: Mesha bride with Simha groom ½, Simha bride with Mesha groom 0', simhaGroom === 0.5 && simhaBride === 0);
  }
  check('bands', matchBand(17.5) === 'low' && matchBand(18) === 'average' && matchBand(24.5) === 'average' && matchBand(25) === 'good' && matchBand(32.5) === 'good' && matchBand(33) === 'excellent');
}

/* ------------------------------------------------------------------ kundli, dasha, doshas */
section('Kundli, Vimshottari dasha and doshas');
{
  const birth = { name: 'Test', year: 1995, month: 6, day: 15, hour: 8, minute: 30, place: { name: 'Bengaluru', lat: 12.9716, lon: 77.5946, tz: 'Asia/Kolkata' } };
  const k = computeKundli(birth);
  check('birth instant', k.instant.toISOString() === '1995-06-15T03:00:00.000Z');
  check('offset +5:30', k.utcOffsetMinutes === 330);
  // Swiss Ephemeris for this moment: Sun 59.778° (Vrishabha), Moon 267.612° (Dhanu, Uttara Ashadha), lagna 94.560° (Karka)
  check('Sun in Vrishabha', k.grahas.Sun.rashi === 1 && near(k.grahas.Sun.lon, 59.778, 0.01), `${k.grahas.Sun.lon}`);
  check('Moon in Dhanu, Uttara Ashadha pada 1', k.grahas.Moon.rashi === 8 && k.grahas.Moon.nakshatra === 20 && k.grahas.Moon.pada === 1 && near(k.grahas.Moon.lon, 267.612, 0.01), `${k.grahas.Moon.lon}`);
  check('Karka lagna', k.lagna.rashi === 3 && near(k.lagna.lon, 94.56, 0.01), `${k.lagna.lon}`);
  check('houses follow the lagna', GRAHAS.every((g) => k.grahas[g].house === houseFrom(k.lagna.rashi, k.grahas[g].rashi)));
  check('Rahu and Ketu sit opposite', houseFrom(k.grahas.Rahu.rashi, k.grahas.Ketu.rashi) === 7);
  check('nodes are not flagged retrograde', !k.grahas.Rahu.retrograde && !k.grahas.Ketu.retrograde && !k.grahas.Sun.retrograde && !k.grahas.Moon.retrograde);

  // Dasha: Uttara Ashadha is ruled by the Sun (6 years).
  check('first dasha lord is the Moon nakshatra lord', k.dashas[0].lord === 'Sun');
  check('nine mahadashas spanning 120 years', k.dashas.length === 9 && near((k.dashas[8].end.getTime() - k.dashas[0].start.getTime()) / (365.25 * 86400000), 120, 1e-6));
  check('first dasha started before birth and ends after it', k.dashas[0].start <= k.instant && k.dashas[0].end > k.instant);
  const balanceYears = (k.dashas[0].end.getTime() - k.instant.getTime()) / (365.25 * 86400000);
  check('balance of first dasha matches the nakshatra still to be crossed', near(balanceYears, (1 - k.grahas.Moon.nakshatraProgress) * 6, 1e-6), `${balanceYears}`);
  check('dasha order after Sun: Moon, Mars, Rahu, Jupiter', k.dashas.slice(1, 5).map((d) => d.lord).join() === 'Moon,Mars,Rahu,Jupiter');
  check('each mahadasha has its own length', k.dashas.every((d) => near((d.end.getTime() - d.start.getTime()) / (365.25 * 86400000), DASHA_YEARS[d.lord], 1e-6)));
  check('antardashas tile each mahadasha', k.dashas.every((d) => d.antardashas.length === 9 && d.antardashas[0].start.getTime() === d.start.getTime() && near(d.antardashas[8].end.getTime(), d.end.getTime(), 1000) && d.antardashas[0].lord === d.lord));
  check('antardasha length = maha × antar / 120 years', near((k.dashas[1].antardashas[2].end.getTime() - k.dashas[1].antardashas[2].start.getTime()) / (365.25 * 86400000), (DASHA_YEARS[k.dashas[1].lord] * DASHA_YEARS[k.dashas[1].antardashas[2].lord]) / 120, 1e-6));
  const now = currentDasha(k.dashas, new Date('2026-11-15T00:00:00Z'));
  check('a dasha is running today', now !== null && now.maha.start <= new Date('2026-11-15') && now.antar.start <= new Date('2026-11-15T00:00:00Z'));
  check('Moon at the very start of Ashwini gives a full Ketu dasha', (() => { const d = vimshottari(0.000001, new Date('2000-01-01T00:00:00Z')); return d[0].lord === 'Ketu' && near((d[0].end.getTime() - new Date('2000-01-01T00:00:00Z').getTime()) / (365.25 * 86400000), 7, 1e-3); })());

  // Manglik
  check('Mars in the 7th from lagna is manglik', manglik(6, 0, 3).fromLagna && manglik(6, 0, 3).houseFromLagna === 7);
  check('Mars in the 3rd is not', !manglik(2, 0, 0).fromLagna && !manglik(2, 0, 0).fromMoon);
  check('Mars in 1, 2, 4, 7, 8, 12 counted; 3, 5, 6, 9, 10, 11 not', [0, 1, 3, 6, 7, 11].every((r) => manglik(r, 0, 0).fromLagna) && [2, 4, 5, 8, 9, 10].every((r) => !manglik(r, 0, 0).fromLagna));
  check('from the Moon is judged separately', manglik(5, 0, 5).fromMoon && !manglik(5, 0, 5).fromLagna);

  // Kaal Sarp
  const lon = (o: Partial<Record<GrahaId, number>>) => ({ Sun: 0, Moon: 0, Mars: 0, Mercury: 0, Jupiter: 0, Venus: 0, Saturn: 0, Rahu: 0, Ketu: 180, ...o }) as Record<GrahaId, number>;
  check('all grahas between Rahu and Ketu', kaalSarp(lon({ Rahu: 10, Ketu: 190, Sun: 20, Moon: 50, Mars: 80, Mercury: 100, Jupiter: 120, Venus: 150, Saturn: 180 }), 0).present);
  check('all grahas between Ketu and Rahu', kaalSarp(lon({ Rahu: 10, Ketu: 190, Sun: 200, Moon: 250, Mars: 280, Mercury: 300, Jupiter: 320, Venus: 350, Saturn: 5 }), 0).present);
  check('one graha on the other side breaks it', !kaalSarp(lon({ Rahu: 10, Ketu: 190, Sun: 20, Moon: 50, Mars: 80, Mercury: 100, Jupiter: 120, Venus: 150, Saturn: 200 }), 0).present);
  check('Rahu house from lagna', kaalSarp(lon({ Rahu: 95, Ketu: 275 }), 0).rahuHouse === 4);

  // Sade Sati. Saturn entered sidereal Meena on 29 March 2025; Kumbha, Meena and Mesha Moons are in Sade Sati through 2026.
  const at = new Date('2026-11-15T06:00:00Z');
  check('Saturn is in Meena in November 2026', sadeSatiStatus(11, at).saturnRashi === 11);
  check('Meena Moon: peak phase', sadeSatiStatus(11, at).phase === 'peak');
  check('Mesha Moon: rising phase', sadeSatiStatus(0, at).phase === 'rising');
  check('Kumbha Moon: setting phase', sadeSatiStatus(10, at).phase === 'setting');
  check('Simha Moon: ashtama shani (dhaiya), no sade sati', sadeSatiStatus(4, at).phase === null && sadeSatiStatus(4, at).dhaiya && sadeSatiStatus(4, at).houseFromMoon === 8);
  check('Dhanu Moon: dhaiya (4th)', sadeSatiStatus(8, at).dhaiya && sadeSatiStatus(8, at).houseFromMoon === 4);
  check('Vrishabha Moon: neither', sadeSatiStatus(1, at).phase === null && !sadeSatiStatus(1, at).dhaiya);
  const cycles = sadeSatiCycles(11, new Date('1990-01-01T00:00:00Z'), new Date('2060-01-01T00:00:00Z'));
  const fmt = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : 'null');
  console.log('  Sade Sati cycles for a Meena Moon, 1990–2060:', cycles.map((c) => `${fmt(c.start)} → ${fmt(c.peakStart)} → ${fmt(c.settingStart)} → ${fmt(c.end)}`).join('  |  '));
  const running = cycles.find((c) => c.start <= at && c.end >= at);
  check('Meena Moon has a cycle running in 2026', running !== undefined);
  // Saturn first touched Kumbha on 29 April 2022, stepped back, and returned in January 2023.
  check('that cycle began when Saturn first entered Kumbha (29 April 2022)', running !== undefined && fmt(running.start) === '2022-04-29', running ? fmt(running.start) : '');
  check('its peak began when Saturn entered Meena (29 March 2025)', running !== undefined && fmt(running.peakStart) === '2025-03-29', running ? fmt(running.peakStart) : '');
  check('its last phase begins when Saturn enters Mesha (June 2027)', running !== undefined && fmt(running.settingStart).startsWith('2027-06'), running ? fmt(running.settingStart) : '');
  check('it ends when Saturn finally leaves Mesha (April 2030)', running !== undefined && fmt(running.end).startsWith('2030-04'), running ? fmt(running.end) : '');
  check('cycles last about seven and a half years', cycles.every((c) => { const y = (c.end.getTime() - c.start.getTime()) / (365.25 * 86400000); return y > 6.5 && y < 8.6; }), cycles.map((c) => ((c.end.getTime() - c.start.getTime()) / (365.25 * 86400000)).toFixed(2)).join(','));
  check('cycles come roughly 29.5 years apart', cycles.length >= 2 && cycles.slice(1).every((c, i) => { const y = (c.start.getTime() - cycles[i].start.getTime()) / (365.25 * 86400000); return y > 28 && y < 31; }));
}

/* ------------------------------------------------------------------ gochar */
section('Gochar (transits)');
{
  const at = new Date('2026-11-15T06:00:00Z');
  const t = transitsAt(at);
  check('every graha has a transit', GRAHAS.every((g) => t[g].rashi >= 0 && t[g].rashi <= 11));
  const reading = gochar(0, t);
  check('one reading per graha', reading.length === 9 && reading.every((r) => r.house >= 1 && r.house <= 12 && r.favourable === FAVOURABLE_HOUSES[r.graha].includes(r.house)));
  check('Moon favourable in 1, 3, 6, 7, 10, 11', FAVOURABLE_HOUSES.Moon.join() === '1,3,6,7,10,11');
  check('Jupiter favourable in 2, 5, 7, 9, 11', FAVOURABLE_HOUSES.Jupiter.join() === '2,5,7,9,11');
  check('Saturn favourable in 3, 6, 11', FAVOURABLE_HOUSES.Saturn.join() === '3,6,11');
  const stays = moonStays(at, 7);
  check('Moon changes sign three or four times a week', stays.length >= 3 && stays.length <= 5, `${stays.length}`);
  check('stays are consecutive rashis', stays.every((s, i) => i === 0 || s.rashi === (stays[i - 1].rashi + 1) % 12));
  check('each stay lasts about 2¼ days', stays.slice(1, -1).every((s) => { const d = (s.end.getTime() - s.start.getTime()) / 86400000; return d > 1.9 && d < 2.8; }));
  check('first stay matches the Moon now', stays[0].rashi === t.Moon.rashi);
}

/* ------------------------------------------------------------------ numerology */
section('Numerology');
{
  check('reduce 29 → 2', reduceToDigit(29) === 2 && reduceToDigit(9) === 9 && reduceToDigit(19) === 1 && reduceToDigit(38) === 2);
  check('mulank of the 15th is 6', mulank(15).value === 6 && mulank(15).compound === 15);
  check('bhagyank of 15-06-1995 is 9', bhagyank(1995, 6, 15).value === 9 && bhagyank(1995, 6, 15).compound === 36);
  check('bhagyank of 02-10-1869 is 9', bhagyank(1869, 10, 2).value === 9);
  // Chaldean: R2 A1 J1 E5 S3 H5 W6 A1 R2 I1 = 27 → 9
  check('namank RAJESHWARI', namank('Rajeshwari')?.compound === 27 && namank('Rajeshwari')?.value === 9, JSON.stringify(namank('Rajeshwari')));
  check('spaces and case ignored', namank('  raje shwari ')?.compound === 27);
  check('non-Latin script gives null', namank('ರಾಜೇಶ್ವರಿ') === null && namank('') === null);
}

/* ------------------------------------------------------------------ places */
async function placeChecks(): Promise<void> {
  section('Place search');
  const first = async (q: string) => (await searchPlaces(q, 5))[0];
  const names = async (q: string) => (await searchPlaces(q, 8)).map((p) => p.name);
  check('empty query suggests Bengaluru first', (await first(''))?.name === 'Bengaluru');
  check('"Bangalore" finds Bengaluru', (await first('Bangalore'))?.name === 'Bengaluru');
  check('"bang" finds Bengaluru first', (await first('bang'))?.name === 'Bengaluru', (await names('bang')).join(', '));
  check('"Mysore" finds Mysuru', (await first('Mysore'))?.name === 'Mysuru');
  check('"Bombay" finds Mumbai', (await first('Bombay'))?.name === 'Mumbai');
  check('"Kashi" finds Varanasi', (await first('Kashi'))?.name === 'Varanasi', (await names('Kashi')).join(', '));
  check('"Hubli" finds Hubballi', (await first('hubli'))?.name === 'Hubballi', (await names('hubli')).join(', '));
  check('"Dharwad" is listed', (await first('Dharwad'))?.name === 'Dharwad', (await names('Dharwad')).join(', '));
  check('"Hyderabad" prefers India', (await first('Hyderabad'))?.region === 'Telangana');
  const london = await first('London');
  check('London carries its own time zone', london?.name === 'London' && london.tz === 'Europe/London');
  const blr = await first('Bengaluru');
  check('Bengaluru coordinates', blr !== undefined && near(blr.lat, 12.97, 0.01) && near(blr.lon, 77.59, 0.01) && blr.tz === 'Asia/Kolkata' && blr.region === 'Karnataka');
  check('nonsense finds nothing', (await searchPlaces('zzzzqqq')).length === 0);
}

/* ------------------------------------------------------------------ result */
placeChecks()
  .then(() => {
    console.log(`\n${passed} checks passed, ${failures.length} failed`);
    if (failures.length) {
      for (const f of failures.slice(0, 60)) console.log('  ✗ ' + f);
      if (failures.length > 60) console.log(`  … and ${failures.length - 60} more`);
      process.exit(1);
    }
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
