"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { loadBirth, toBirthDetails, validateBirth } from "@/components/astro/BirthForm";
import { ConsultCTA, MoonTone, Panel, ToolHero } from "@/components/astro/ui";
import type { GrahaId } from "@/lib/astro/core";
import { dateOf, formatDate, formatDayMonth } from "@/lib/astro/format";
import { FAVOURABLE_HOUSES, moonStays, nextRashiChange, transitsAt } from "@/lib/astro/gochar";
import { computeKundli } from "@/lib/astro/kundli";
import { GRAHA, NAKSHATRA, RASHI, RASHI_WESTERN, VARA, type Lang, type Tri } from "@/lib/astro/names";
import { ELEMENT, MOON_HOUSE_TEXT } from "@/lib/astro/rashiText";
import { formatClock, formatOffset, offsetMinutes, weekdayOf } from "@/lib/astro/time";
import { ordinal } from "@/lib/astro/words";
import { NAKSHATRA_SPAN, PADA_SPAN, RASHI_ELEMENT, RASHI_LORD, houseFrom } from "@/lib/astro/zodiac";
import { loadRashi, saveRashi } from "@/lib/prefs";
import { SERVICES, formatRupees } from "@/lib/site";
import { useLang } from "@/lib/useLang";

const T = {
  eyebrow: { en: "Free tool • Rashi Phala", hi: "निःशुल्क साधन • राशिफल", kn: "ಉಚಿತ ಸಾಧನ • ರಾಶಿ ಫಲ" },
  title: { en: "Rashi Phala", hi: "राशिफल", kn: "ರಾಶಿ ಫಲ" },
  intro: {
    en: "Not a paragraph written for everybody. This is Chandra bala: where the Moon actually stands from your rashi today and through the week, and where Shani, Guru, Rahu and Ketu are passing — the same gochara a panchanga gives.",
    hi: "सबके लिए लिखा गया एक अनुच्छेद नहीं। यह चंद्र बल है: आज और पूरे सप्ताह चंद्र आपकी राशि से वास्तव में कहाँ है, और शनि, गुरु, राहु तथा केतु कहाँ गोचर कर रहे हैं — वही गोचर जो पंचांग देता है।",
    kn: "ಎಲ್ಲರಿಗೂ ಬರೆದ ಒಂದೇ ಪ್ಯಾರಾ ಅಲ್ಲ. ಇದು ಚಂದ್ರ ಬಲ: ಇಂದು ಮತ್ತು ಈ ವಾರ ಚಂದ್ರ ನಿಮ್ಮ ರಾಶಿಯಿಂದ ನಿಜವಾಗಿ ಎಲ್ಲಿದ್ದಾನೆ, ಶನಿ, ಗುರು, ರಾಹು ಮತ್ತು ಕೇತು ಎಲ್ಲಿ ಸಂಚರಿಸುತ್ತಿದ್ದಾರೆ — ಪಂಚಾಂಗ ನೀಡುವ ಅದೇ ಗೋಚಾರ.",
  },
  choose: { en: "Choose your rashi", hi: "अपनी राशि चुनें", kn: "ನಿಮ್ಮ ರಾಶಿ ಆಯ್ಕೆ ಮಾಡಿ" },
  chooseNote: {
    en: "Your janma rashi is the sign the Moon was in when you were born — not the Sun sign of Western astrology.",
    hi: "जन्म राशि वह राशि है जिसमें आपके जन्म के समय चंद्र था — पाश्चात्य ज्योतिष की सूर्य राशि नहीं।",
    kn: "ಜನ್ಮ ರಾಶಿ ಎಂದರೆ ನೀವು ಹುಟ್ಟಿದಾಗ ಚಂದ್ರ ಇದ್ದ ರಾಶಿ — ಪಾಶ್ಚಾತ್ಯ ಜ್ಯೋತಿಷ್ಯದ ಸೂರ್ಯ ರಾಶಿ ಅಲ್ಲ.",
  },
  find: { en: "Find my rashi from my birth details", hi: "जन्म विवरण से मेरी राशि जानें", kn: "ಜನ್ಮ ವಿವರದಿಂದ ನನ್ನ ರಾಶಿ ತಿಳಿಯಿರಿ" },
  today: { en: "Today", hi: "आज", kn: "ಇಂದು" },
  now: { en: "Now", hi: "अभी", kn: "ಈಗ" },
  until: { en: "until", hi: "तक", kn: "ವರೆಗೆ" },
  week: { en: "Chandra bala for the week", hi: "सप्ताह का चंद्र बल", kn: "ಈ ವಾರದ ಚಂದ್ರ ಬಲ" },
  weekNote: {
    en: "The Moon changes rashi about every two and a quarter days. Plan the important things for the favourable stretches.",
    hi: "चंद्र लगभग सवा दो दिन में राशि बदलता है। महत्वपूर्ण कार्य अनुकूल समय में रखें।",
    kn: "ಚಂದ್ರ ಸುಮಾರು ಎರಡೂಕಾಲು ದಿನಕ್ಕೊಮ್ಮೆ ರಾಶಿ ಬದಲಿಸುತ್ತಾನೆ. ಮುಖ್ಯ ಕೆಲಸಗಳನ್ನು ಅನುಕೂಲ ಸಮಯದಲ್ಲಿ ಇಟ್ಟುಕೊಳ್ಳಿ.",
  },
  clock: {
    en: "Times are on this device’s clock",
    hi: "समय इस फ़ोन या कंप्यूटर की घड़ी के अनुसार हैं",
    kn: "ಸಮಯಗಳು ಈ ಫೋನ್ ಅಥವಾ ಕಂಪ್ಯೂಟರ್‌ನ ಗಡಿಯಾರದ ಪ್ರಕಾರ ಇವೆ",
  },
  slow: { en: "The slow grahas this season", hi: "इस समय के मंद ग्रह", kn: "ಈ ಕಾಲದ ಮಂದ ಗ್ರಹಗಳು" },
  slowNote: {
    en: "These stay in one rashi for a year or more and set the background of the period.",
    hi: "ये एक राशि में एक वर्ष या अधिक रहते हैं और समय की पृष्ठभूमि तय करते हैं।",
    kn: "ಇವು ಒಂದು ರಾಶಿಯಲ್ಲಿ ಒಂದು ವರ್ಷ ಅಥವಾ ಹೆಚ್ಚು ಇರುತ್ತವೆ ಮತ್ತು ಆ ಕಾಲದ ಹಿನ್ನೆಲೆಯನ್ನು ನಿರ್ಧರಿಸುತ್ತವೆ.",
  },
  about: { en: "About", hi: "परिचय:", kn: "ಪರಿಚಯ:" },
  lord: { en: "Lord", hi: "स्वामी", kn: "ಅಧಿಪತಿ" },
  element: { en: "Element", hi: "तत्व", kn: "ತತ್ವ" },
  nakshatras: { en: "Nakshatras", hi: "नक्षत्र", kn: "ನಕ್ಷತ್ರಗಳು" },
  pada: { en: "pada", hi: "चरण", kn: "ಪಾದ" },
  sadeSati: { en: "Sade Sati", hi: "साढ़े साती", kn: "ಸಾಡೇ ಸಾತಿ" },
  ashtama: { en: "Ashtama Shani", hi: "अष्टम शनि", kn: "ಅಷ್ಟಮ ಶನಿ" },
  ardhashtama: { en: "Ardhashtama Shani", hi: "अर्धाष्टम शनि", kn: "ಅರ್ಧಾಷ್ಟಮ ಶನಿ" },
  supportive: { en: "Supportive", hi: "अनुकूल", kn: "ಅನುಕೂಲ" },
  patience: { en: "Asks for patience", hi: "धैर्य माँगता है", kn: "ತಾಳ್ಮೆ ಬೇಕು" },
  retro: { en: "retrograde", hi: "वक्री", kn: "ವಕ್ರಿ" },
  doshaLink: { en: "Sade Sati dates for your chart", hi: "आपकी कुंडली की साढ़े साती की तिथियाँ", kn: "ನಿಮ್ಮ ಜಾತಕದ ಸಾಡೇ ಸಾತಿ ದಿನಾಂಕಗಳು" },
  honest: {
    en: "Gochara read from the rashi alone is the same for everyone born under it. Your own dasha and the houses in your chart decide how much of it you feel.",
    hi: "केवल राशि से पढ़ा गया गोचर उस राशि के सभी लोगों के लिए एक-सा है। आपकी अपनी दशा और कुंडली के भाव तय करते हैं कि आप उसे कितना अनुभव करेंगे।",
    kn: "ರಾಶಿಯಿಂದ ಮಾತ್ರ ಓದಿದ ಗೋಚಾರ ಆ ರಾಶಿಯ ಎಲ್ಲರಿಗೂ ಒಂದೇ. ನಿಮ್ಮದೇ ದಶೆ ಮತ್ತು ಜಾತಕದ ಭಾವಗಳು ನೀವು ಅದನ್ನು ಎಷ್ಟು ಅನುಭವಿಸುತ್ತೀರಿ ಎಂಬುದನ್ನು ನಿರ್ಧರಿಸುತ್ತವೆ.",
  },
  ctaTitle: { en: "What does this period hold for you?", hi: "यह समय आपके लिए क्या लाया है?", kn: "ಈ ಕಾಲ ನಿಮಗೆ ಏನು ತಂದಿದೆ?" },
  ctaBody: {
    en: "For the year ahead I read the transits against your own chart and dasha, month by month, with simple remedies you can do at home.",
    hi: "आने वाले वर्ष के लिए मैं गोचर को आपकी अपनी कुंडली और दशा के साथ, महीने-दर-महीने पढ़ती हूँ — घर पर करने योग्य सरल उपायों सहित।",
    kn: "ಮುಂದಿನ ವರ್ಷಕ್ಕಾಗಿ ನಾನು ಗೋಚಾರವನ್ನು ನಿಮ್ಮದೇ ಜಾತಕ ಮತ್ತು ದಶೆಯೊಂದಿಗೆ ತಿಂಗಳುವಾರು ಓದುತ್ತೇನೆ — ಮನೆಯಲ್ಲೇ ಮಾಡಬಹುದಾದ ಸರಳ ಪರಿಹಾರಗಳೊಂದಿಗೆ.",
  },
} satisfies Record<string, Tri>;

const SLOW: GrahaId[] = ["Saturn", "Jupiter", "Rahu", "Ketu"];

/** "Ashwini, Bharani, Krittika (pada 1)" — the nakshatras, whole or in part, that make up a rashi. */
function nakshatrasOf(rashi: number, lang: Lang): string {
  const from = rashi * 30;
  const parts: string[] = [];
  for (let n = 0; n < 27; n++) {
    const padas: number[] = [];
    for (let p = 0; p < 4; p++) {
      const mid = n * NAKSHATRA_SPAN + (p + 0.5) * PADA_SPAN;
      if (mid >= from && mid < from + 30) padas.push(p + 1);
    }
    if (padas.length === 4) parts.push(NAKSHATRA[lang][n]);
    else if (padas.length > 0) parts.push(`${NAKSHATRA[lang][n]} (${T.pada[lang]}\u00A0${padas.length === 1 ? padas[0] : `${padas[0]}–${padas[padas.length - 1]}`})`);
  }
  return parts.join(", ");
}

export function RashiTool() {
  const lang = useLang();
  const [rashi, setRashi] = useState<number | null>(null);
  const [now, setNow] = useState<Date | null>(null);
  const [tz, setTz] = useState("Asia/Kolkata");

  useEffect(() => {
    setNow(new Date());
    try {
      const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (zone) setTz(zone);
    } catch {
      /* keep India Standard Time */
    }
    const saved = loadRashi();
    if (saved !== null) {
      setRashi(saved);
      return;
    }
    // Someone who has already made a Kundli here does not need to be asked for their rashi.
    const birth = loadBirth("self");
    if (birth && Object.keys(validateBirth(birth, "en")).length === 0) setRashi(computeKundli(toBirthDetails(birth)).grahas.Moon.rashi);
  }, []);

  const choose = (r: number) => {
    setRashi(r);
    saveRashi(r);
  };

  const sky = useMemo(() => {
    if (!now) return null;
    return {
      transits: transitsAt(now),
      stays: moonStays(now, 7),
      changes: Object.fromEntries(SLOW.map((g) => [g, nextRashiChange(g, now)])) as Record<GrahaId, { at: Date; rashi: number } | null>,
    };
  }, [now]);

  const when = (instant: Date) => {
    const d = dateOf(instant, tz);
    return `${VARA[lang][weekdayOf(d.year, d.month, d.day)]} ${formatDayMonth(lang, d)}, ${formatClock(instant, tz)}`;
  };
  const untilText = (text: string) => (lang === "en" ? `${T.until[lang]} ${text}` : `${text} ${T.until[lang]}`);

  const moonHouse = sky && rashi !== null ? houseFrom(rashi, sky.transits.Moon.rashi) : null;
  const yearly = SERVICES.find((s) => s.id === "yearly");

  return (
    <>
      <ToolHero eyebrow={T.eyebrow[lang]} title={T.title[lang]} intro={T.intro[lang]} />

      <div className="max-w-[1280px] mx-auto px-4 lg:px-8 py-8 lg:py-12 space-y-6 lg:space-y-8">
        <Panel title={T.choose[lang]}>
          <div role="group" aria-label={T.choose[lang]} className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
            {RASHI[lang].map((name, r) => (
              <button
                key={r}
                type="button"
                aria-pressed={rashi === r}
                onClick={() => choose(r)}
                className={`min-h-[64px] px-2 py-2.5 border text-center transition-colors ${rashi === r ? "bg-[#7C2D2D] border-[#7C2D2D] text-white" : "bg-white border-[#D4C4B0] text-[#1A0F0A] hover:border-[#7C2D2D]"}`}
              >
                <span className="block font-serif text-[18px] leading-[1.2]">{name}</span>
                <span className={`block text-[11.5px] mt-0.5 ${rashi === r ? "text-white/75" : "text-[#6B5D52]"}`}>{RASHI_WESTERN[r]}</span>
              </button>
            ))}
          </div>
          <p className="mt-4 text-[13.5px] leading-[1.6] text-[#5A4A3D] max-w-[720px]">{T.chooseNote[lang]}</p>
          <Link href="/birth-chart" className="mt-2 inline-flex items-center gap-1.5 text-[14px] font-semibold text-[#7C2D2D] underline underline-offset-4 decoration-[#C9A86A] hover:decoration-[#7C2D2D]">
            {T.find[lang]} <ArrowRight className="w-4 h-4" aria-hidden />
          </Link>
        </Panel>

        {sky && now && rashi !== null && moonHouse !== null && (
          <div className="space-y-6 lg:space-y-8 animate-rise" aria-live="polite">
            {/* Today */}
            <section className="frame bg-white p-5 sm:p-8 lg:p-10">
              <div className="eyebrow">
                {T.today[lang]} • {formatDate(lang, dateOf(now, tz))}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                <h2 className="font-serif text-[34px] lg:text-[46px]">{RASHI[lang][rashi]}</h2>
                <MoonTone house={moonHouse} lang={lang} />
              </div>
              <p className="mt-3 font-serif text-[21px] lg:text-[25px] leading-[1.3] text-[#7C2D2D]">
                {lang === "hi"
                  ? `चंद्र ${RASHI.hi[sky.transits.Moon.rashi]} में — आपकी राशि से ${ordinal(lang, moonHouse)}`
                  : lang === "kn"
                    ? `ಚಂದ್ರ ${RASHI.kn[sky.transits.Moon.rashi]} ರಾಶಿಯಲ್ಲಿ — ನಿಮ್ಮ ರಾಶಿಯಿಂದ ${ordinal(lang, moonHouse)} ಸ್ಥಾನ`
                    : `Moon in ${RASHI.en[sky.transits.Moon.rashi]} — the ${ordinal(lang, moonHouse)} from your rashi`}
              </p>
              <p className="mt-4 text-[17px] leading-[1.7] text-[#1A0F0A] max-w-[720px]">{MOON_HOUSE_TEXT[moonHouse - 1][lang]}</p>
              <p className="mt-4 text-[14px] leading-[1.6] text-[#5A4A3D]">
                {NAKSHATRA[lang][sky.transits.Moon.nakshatra]} {lang === "en" ? "nakshatra" : lang === "hi" ? "नक्षत्र" : "ನಕ್ಷತ್ರ"} • {RASHI[lang][sky.transits.Moon.rashi]} {untilText(when(sky.stays[0].end))}
              </p>
            </section>

            {/* The week */}
            <Panel title={T.week[lang]}>
              <p className="text-[14.5px] leading-[1.65] text-[#3D2F26] max-w-[720px]">{T.weekNote[lang]}</p>
              <ol className="mt-5 border-t border-[#EFE6D8]">
                {sky.stays.map((stay, i) => {
                  const house = houseFrom(rashi, stay.rashi);
                  return (
                    <li key={stay.end.getTime()} className={`grid grid-cols-[1fr_auto] sm:grid-cols-[1.2fr_1fr_auto] gap-x-4 gap-y-1 items-center py-3.5 px-2 border-b border-[#EFE6D8] ${i === 0 ? "bg-[#FFFBF2]" : ""}`}>
                      <div className="text-[14px] text-[#5A4A3D] tabular">
                        <span className="font-semibold text-[#1A0F0A]">{i === 0 ? T.now[lang] : when(stay.start)}</span>
                        <span className="block sm:inline"> {untilText(when(stay.end))}</span>
                      </div>
                      <div className="row-start-2 sm:row-start-auto text-[15.5px]">
                        <span className="font-semibold">{RASHI[lang][stay.rashi]}</span>
                        <span className="text-[#5A4A3D]"> • {lang === "en" ? `${ordinal(lang, house)} from you` : lang === "hi" ? `आपसे ${ordinal(lang, house)}` : `ನಿಮ್ಮಿಂದ ${ordinal(lang, house)}`}</span>
                      </div>
                      <div className="row-span-2 sm:row-span-1 justify-self-end">
                        <MoonTone house={house} lang={lang} />
                      </div>
                    </li>
                  );
                })}
              </ol>
              <p className="mt-3 text-[13px] text-[#6B5D52] tabular">
                {T.clock[lang]} (UTC{formatOffset(offsetMinutes(tz, now ?? Date.now()))}).
              </p>
            </Panel>

            {/* Slow grahas */}
            <Panel title={T.slow[lang]}>
              <p className="text-[14.5px] leading-[1.65] text-[#3D2F26] max-w-[720px]">{T.slowNote[lang]}</p>
              <ul className="mt-5 grid gap-px bg-[#E8DDD0] border border-[#E8DDD0] sm:grid-cols-2">
                {SLOW.map((g) => {
                  const t = sky.transits[g];
                  const house = houseFrom(rashi, t.rashi);
                  const good = FAVOURABLE_HOUSES[g].includes(house);
                  const special = g === "Saturn" ? ([12, 1, 2].includes(house) ? T.sadeSati[lang] : house === 8 ? T.ashtama[lang] : house === 4 ? T.ardhashtama[lang] : null) : null;
                  const change = sky.changes[g];
                  return (
                    <li key={g} className="bg-white p-4 sm:p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-serif text-[22px]">{GRAHA[g][lang]}</div>
                          <div className="mt-0.5 text-[14.5px] text-[#3D2F26]">
                            {RASHI[lang][t.rashi]}
                            {t.retrograde ? ` (${T.retro[lang]})` : ""} • {lang === "en" ? `${ordinal(lang, house)} from you` : lang === "hi" ? `आपसे ${ordinal(lang, house)}` : `ನಿಮ್ಮಿಂದ ${ordinal(lang, house)}`}
                          </div>
                        </div>
                        <span className={`shrink-0 inline-flex items-center px-2.5 py-1 text-[12.5px] font-semibold ${special ? "bg-[#FBEAEA] text-[#9B2C2C]" : good ? "bg-[#E8F3EC] text-[#1F6B43]" : "bg-[#FBF1DC] text-[#8A5A0B]"}`}>{special ?? (good ? T.supportive[lang] : T.patience[lang])}</span>
                      </div>
                      {change && (
                        <div className="mt-2 text-[13px] text-[#6B5D52] tabular">
                          {untilText(formatDate(lang, dateOf(change.at, tz)))}
                          {lang === "en" ? `, then ${RASHI.en[change.rashi]}` : lang === "hi" ? `, फिर ${RASHI.hi[change.rashi]}` : `, ನಂತರ ${RASHI.kn[change.rashi]}`}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
              <Link href="/dosha-check" className="mt-5 inline-flex items-center gap-1.5 text-[14px] font-semibold text-[#7C2D2D] underline underline-offset-4 decoration-[#C9A86A] hover:decoration-[#7C2D2D]">
                {T.doshaLink[lang]} <ArrowRight className="w-4 h-4" aria-hidden />
              </Link>
            </Panel>

            {/* The rashi itself */}
            <Panel title={lang === "en" ? `${T.about[lang]} ${RASHI.en[rashi]}` : `${T.about[lang]} ${RASHI[lang][rashi]}`}>
              <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-[auto_auto_1fr]">
                <div>
                  <dt className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-[#8A6A2F]">{T.lord[lang]}</dt>
                  <dd className="mt-1 font-serif text-[21px]">{GRAHA[RASHI_LORD[rashi]][lang]}</dd>
                </div>
                <div>
                  <dt className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-[#8A6A2F]">{T.element[lang]}</dt>
                  <dd className="mt-1 font-serif text-[21px]">{ELEMENT[RASHI_ELEMENT[rashi]][lang]}</dd>
                </div>
                <div>
                  <dt className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-[#8A6A2F]">{T.nakshatras[lang]}</dt>
                  <dd className="mt-1 font-serif text-[21px] leading-[1.3]">{nakshatrasOf(rashi, lang)}</dd>
                </div>
              </dl>
              <p className="mt-6 text-[14px] leading-[1.65] text-[#5A4A3D] max-w-[780px]">{T.honest[lang]}</p>
            </Panel>

            <ConsultCTA lang={lang} title={T.ctaTitle[lang]} body={T.ctaBody[lang]} message={`Namaste Rajeshwari madam, my rashi is ${RASHI.en[rashi]}. I read the rashi phala on your website and would like a personal reading for the period ahead.`} price={yearly ? `${formatRupees(yearly.price)} • ${yearly.minutes} min` : undefined} />
          </div>
        )}
      </div>
    </>
  );
}
