"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Printer } from "lucide-react";
import { BirthFields, EMPTY_BIRTH, loadBirth, saveBirth, showFirstError, toBirthDetails, validateBirth, type BirthErrors, type BirthInput } from "@/components/astro/BirthForm";
import { KundliChart, type ChartGraha } from "@/components/astro/KundliChart";
import { ChartStyleToggle, ConsultCTA, Fact, FormWithAside, Panel, PrivacyNote, ToolHero, useChartStyle } from "@/components/astro/ui";
import { GRAHAS, type GrahaId } from "@/lib/astro/core";
import { dateOf, formatDate, formatHourMinute, formatMonthYear } from "@/lib/astro/format";
import { computeKundli, currentDasha, sadeSatiStatus, type Kundli } from "@/lib/astro/kundli";
import { ADHIKA, GRAHA, GRAHA_WESTERN, KARANA, LAGNA, MASA, NAKSHATRA, PAKSHA, RASHI, RASHI_WESTERN, VARA, YOGA, tithiName, type Lang, type Tri } from "@/lib/astro/names";
import { dayPanchang, karanaAt, lunarMonth, tithiAt, yogaAt } from "@/lib/astro/panchang";
import { placeLabel } from "@/lib/astro/places";
import { formatClock, formatOffset } from "@/lib/astro/time";
import { ordinal } from "@/lib/astro/words";
import { RASHI_LORD, formatDegree, nakshatraLord } from "@/lib/astro/zodiac";
import { SERVICES, formatRupees } from "@/lib/site";
import { useLang } from "@/lib/useLang";

const T = {
  eyebrow: { en: "Free tool • Janma Kundli", hi: "निःशुल्क साधन • जन्म कुंडली", kn: "ಉಚಿತ ಸಾಧನ • ಜನ್ಮ ಕುಂಡಲಿ" },
  title: { en: "Your Kundli", hi: "आपकी कुंडली", kn: "ನಿಮ್ಮ ಕುಂಡಲಿ" },
  intro: {
    en: "Date, time and place of birth give the rashi chart and navamsa, the position of every graha, your nakshatra, the panchanga of your birth and the Vimshottari dasha you are running now.",
    hi: "जन्म की तिथि, समय और स्थान से राशि कुंडली और नवांश, हर ग्रह की स्थिति, आपका नक्षत्र, जन्म का पंचांग और अभी चल रही विंशोत्तरी दशा मिलती है।",
    kn: "ಹುಟ್ಟಿದ ದಿನಾಂಕ, ಸಮಯ ಮತ್ತು ಸ್ಥಳದಿಂದ ರಾಶಿ ಕುಂಡಲಿ ಮತ್ತು ನವಾಂಶ, ಪ್ರತಿ ಗ್ರಹದ ಸ್ಥಾನ, ನಿಮ್ಮ ನಕ್ಷತ್ರ, ಜನ್ಮದ ಪಂಚಾಂಗ ಮತ್ತು ಈಗ ನಡೆಯುತ್ತಿರುವ ವಿಂಶೋತ್ತರಿ ದಶೆ ಸಿಗುತ್ತದೆ.",
  },
  formTitle: { en: "Birth details", hi: "जन्म विवरण", kn: "ಜನ್ಮ ವಿವರ" },
  asideTitle: { en: "What the Kundli shows", hi: "कुंडली में क्या मिलेगा", kn: "ಕುಂಡಲಿಯಲ್ಲಿ ಏನು ಸಿಗುತ್ತದೆ" },
  submit: { en: "Make my Kundli", hi: "मेरी कुंडली बनाएँ", kn: "ನನ್ನ ಕುಂಡಲಿ ರಚಿಸಿ" },
  kundliOf: { en: "Kundli", hi: "कुंडली", kn: "ಕುಂಡಲಿ" },
  lagna: { en: "Lagna", hi: "लग्न", kn: "ಲಗ್ನ" },
  rashi: { en: "Rashi (Moon sign)", hi: "राशि (चंद्र राशि)", kn: "ರಾಶಿ (ಚಂದ್ರ ರಾಶಿ)" },
  nakshatra: { en: "Nakshatra", hi: "नक्षत्र", kn: "ನಕ್ಷತ್ರ" },
  dashaNow: { en: "Dasha running now", hi: "अभी की दशा", kn: "ಈಗಿನ ದಶೆ" },
  lord: { en: "lord", hi: "स्वामी", kn: "ಅಧಿಪತಿ" },
  pada: { en: "pada", hi: "चरण", kn: "ಪಾದ" },
  until: { en: "until", hi: "तक", kn: "ವರೆಗೆ" },
  charts: { en: "The charts", hi: "कुंडली चक्र", kn: "ಕುಂಡಲಿ ಚಕ್ರಗಳು" },
  d1: { en: "Rashi", hi: "राशि", kn: "ರಾಶಿ" },
  d9: { en: "Navamsa", hi: "नवांश", kn: "ನವಾಂಶ" },
  d1Note: { en: "Rashi chart (D1) — the body of the horoscope", hi: "राशि कुंडली (D1) — कुंडली का मूल", kn: "ರಾಶಿ ಕುಂಡಲಿ (D1) — ಜಾತಕದ ಮೂಲ" },
  d9Note: { en: "Navamsa (D9) — marriage, and the inner strength of each graha", hi: "नवांश (D9) — विवाह और हर ग्रह का भीतरी बल", kn: "ನವಾಂಶ (D9) — ವಿವಾಹ ಮತ್ತು ಪ್ರತಿ ಗ್ರಹದ ಆಂತರಿಕ ಬಲ" },
  legendNumbers: { en: "Small numbers are rashis (1 = Mesha).", hi: "छोटे अंक राशियाँ हैं (1 = मेष)।", kn: "ಚಿಕ್ಕ ಅಂಕಿಗಳು ರಾಶಿಗಳು (1 = ಮೇಷ)." },
  legendRetro: { en: "A raised R marks a retrograde graha.", hi: "ऊपर लिखा व वक्री ग्रह दर्शाता है।", kn: "ಮೇಲೆ ಬರೆದ ವ ವಕ್ರಿ ಗ್ರಹವನ್ನು ಸೂಚಿಸುತ್ತದೆ." },
  positions: { en: "Graha positions", hi: "ग्रह स्थिति", kn: "ಗ್ರಹ ಸ್ಥಿತಿ" },
  graha: { en: "Graha", hi: "ग्रह", kn: "ಗ್ರಹ" },
  sign: { en: "Rashi", hi: "राशि", kn: "ರಾಶಿ" },
  house: { en: "House", hi: "भाव", kn: "ಭಾವ" },
  retro: { en: "Retrograde", hi: "वक्री", kn: "ವಕ್ರಿ" },
  exalted: { en: "Exalted", hi: "उच्च", kn: "ಉಚ್ಚ" },
  debilitated: { en: "Debilitated", hi: "नीच", kn: "ನೀಚ" },
  own: { en: "Own sign", hi: "स्वराशि", kn: "ಸ್ವಕ್ಷೇತ್ರ" },
  birthPanchang: { en: "Panchanga at birth", hi: "जन्म का पंचांग", kn: "ಜನ್ಮದ ಪಂಚಾಂಗ" },
  vara: { en: "Vara", hi: "वार", kn: "ವಾರ" },
  tithi: { en: "Tithi", hi: "तिथि", kn: "ತಿಥಿ" },
  yoga: { en: "Yoga", hi: "योग", kn: "ಯೋಗ" },
  karana: { en: "Karana", hi: "करण", kn: "ಕರಣ" },
  masa: { en: "Lunar month", hi: "चंद्र मास", kn: "ಚಾಂದ್ರ ಮಾಸ" },
  sunrise: { en: "Sunrise that day", hi: "उस दिन सूर्योदय", kn: "ಆ ದಿನದ ಸೂರ್ಯೋದಯ" },
  dasha: { en: "Vimshottari dasha", hi: "विंशोत्तरी दशा", kn: "ವಿಂಶೋತ್ತರಿ ದಶೆ" },
  dashaIntro: {
    en: "The 120-year cycle of planetary periods, counted from the Moon’s nakshatra at birth. The period you are in now is marked.",
    hi: "जन्म के चंद्र नक्षत्र से गिना जाने वाला ग्रह दशाओं का 120 वर्ष का चक्र। अभी चल रही दशा चिह्नित है।",
    kn: "ಜನ್ಮ ಕಾಲದ ಚಂದ್ರ ನಕ್ಷತ್ರದಿಂದ ಎಣಿಸುವ 120 ವರ್ಷಗಳ ಗ್ರಹ ದಶಾ ಚಕ್ರ. ಈಗ ನಡೆಯುತ್ತಿರುವ ದಶೆಯನ್ನು ಗುರುತಿಸಲಾಗಿದೆ.",
  },
  mahadasha: { en: "Mahadasha", hi: "महादशा", kn: "ಮಹಾದಶೆ" },
  antardasha: { en: "Antardashas of the running mahadasha", hi: "चल रही महादशा की अंतर्दशाएँ", kn: "ನಡೆಯುತ್ತಿರುವ ಮಹಾದಶೆಯ ಅಂತರ್ದಶೆಗಳು" },
  now: { en: "Now", hi: "अभी", kn: "ಈಗ" },
  birth: { en: "Birth", hi: "जन्म", kn: "ಜನನ" },
  doshas: { en: "Dosha check", hi: "दोष जाँच", kn: "ದೋಷ ಪರಿಶೀಲನೆ" },
  manglik: { en: "Mangal dosha", hi: "मंगल दोष", kn: "ಕುಜ ದೋಷ" },
  kaalSarp: { en: "Kaal Sarp yoga", hi: "काल सर्प योग", kn: "ಕಾಳ ಸರ್ಪ ಯೋಗ" },
  sadeSati: { en: "Sade Sati now", hi: "अभी साढ़े साती", kn: "ಈಗ ಸಾಡೇ ಸಾತಿ" },
  yes: { en: "Present", hi: "है", kn: "ಇದೆ" },
  no: { en: "Not present", hi: "नहीं है", kn: "ಇಲ್ಲ" },
  mild: { en: "From the Moon only", hi: "केवल चंद्र से", kn: "ಚಂದ್ರನಿಂದ ಮಾತ್ರ" },
  running: { en: "Running", hi: "चल रही है", kn: "ನಡೆಯುತ್ತಿದೆ" },
  notRunning: { en: "Not running", hi: "नहीं चल रही", kn: "ನಡೆಯುತ್ತಿಲ್ಲ" },
  doshaLink: { en: "What these mean, with dates", hi: "इनका अर्थ, तिथियों सहित", kn: "ಇವುಗಳ ಅರ್ಥ, ದಿನಾಂಕಗಳೊಂದಿಗೆ" },
  print: { en: "Print or save as PDF", hi: "प्रिंट करें या PDF सहेजें", kn: "ಮುದ್ರಿಸಿ ಅಥವಾ PDF ಉಳಿಸಿ" },
  settings: { en: "Lahiri ayanamsa", hi: "लाहिरी अयनांश", kn: "ಲಾಹಿರಿ ಅಯನಾಂಶ" },
  ctaTitle: { en: "A chart is only the beginning", hi: "कुंडली तो केवल शुरुआत है", kn: "ಕುಂಡಲಿ ಕೇವಲ ಆರಂಭ" },
  ctaBody: {
    en: "The positions are arithmetic. What they mean for your work, marriage and health is a reading. Send me this chart and I will study it by hand before we speak.",
    hi: "ग्रह स्थिति तो गणित है। आपके काम, विवाह और स्वास्थ्य के लिए उसका अर्थ वाचन से निकलता है। यह कुंडली मुझे भेजिए, बात करने से पहले मैं इसे हाथ से देखूँगी।",
    kn: "ಗ್ರಹ ಸ್ಥಿತಿ ಕೇವಲ ಗಣಿತ. ನಿಮ್ಮ ಉದ್ಯೋಗ, ವಿವಾಹ ಮತ್ತು ಆರೋಗ್ಯಕ್ಕೆ ಅದರ ಅರ್ಥ ವಾಚನದಿಂದ ತಿಳಿಯುತ್ತದೆ. ಈ ಕುಂಡಲಿಯನ್ನು ನನಗೆ ಕಳುಹಿಸಿ, ಮಾತನಾಡುವ ಮೊದಲು ನಾನು ಕೈಯಿಂದ ಪರಿಶೀಲಿಸುತ್ತೇನೆ.",
  },
} satisfies Record<string, Tri>;

const ASIDE: readonly { title: Tri; text: Tri }[] = [
  {
    title: { en: "Rashi chart and Navamsa", hi: "राशि कुंडली और नवांश", kn: "ರಾಶಿ ಕುಂಡಲಿ ಮತ್ತು ನವಾಂಶ" },
    text: {
      en: "Drawn in the North Indian or the South Indian style, whichever your family uses.",
      hi: "उत्तर भारतीय या दक्षिण भारतीय शैली में, जो आपके परिवार में चलती हो।",
      kn: "ಉತ್ತರ ಭಾರತೀಯ ಅಥವಾ ದಕ್ಷಿಣ ಭಾರತೀಯ ಶೈಲಿಯಲ್ಲಿ, ನಿಮ್ಮ ಮನೆಯಲ್ಲಿ ಬಳಸುವ ರೀತಿಯಲ್ಲಿ.",
    },
  },
  {
    title: { en: "The lagna and the nine grahas", hi: "लग्न और नौ ग्रह", kn: "ಲಗ್ನ ಮತ್ತು ಒಂಬತ್ತು ಗ್ರಹಗಳು" },
    text: {
      en: "Rashi, degree, nakshatra, pada and house for each one.",
      hi: "हर एक की राशि, अंश, नक्षत्र, चरण और भाव।",
      kn: "ಪ್ರತಿಯೊಂದರ ರಾಶಿ, ಅಂಶ, ನಕ್ಷತ್ರ, ಪಾದ ಮತ್ತು ಭಾವ.",
    },
  },
  {
    title: { en: "Vimshottari dasha", hi: "विंशोत्तरी दशा", kn: "ವಿಂಶೋತ್ತರಿ ದಶೆ" },
    text: {
      en: "All nine mahadashas with their dates, and the antardasha you are in today.",
      hi: "नौों महादशाएँ तिथियों सहित, और आज चल रही अंतर्दशा।",
      kn: "ಒಂಬತ್ತೂ ಮಹಾದಶೆಗಳು ದಿನಾಂಕ ಸಹಿತ, ಮತ್ತು ಇಂದು ನಡೆಯುತ್ತಿರುವ ಅಂತರ್ದಶೆ.",
    },
  },
  {
    title: { en: "Panchanga of your birth", hi: "जन्म का पंचांग", kn: "ಜನ್ಮದ ಪಂಚಾಂಗ" },
    text: {
      en: "Vara, tithi, nakshatra, yoga, karana and the lunar month you were born in.",
      hi: "वार, तिथि, नक्षत्र, योग, करण और जन्म का चंद्र मास।",
      kn: "ವಾರ, ತಿಥಿ, ನಕ್ಷತ್ರ, ಯೋಗ, ಕರಣ ಮತ್ತು ಹುಟ್ಟಿದ ಚಾಂದ್ರ ಮಾಸ.",
    },
  },
  {
    title: { en: "Dosha check, and a copy to keep", hi: "दोष जाँच, और रखने के लिए प्रति", kn: "ದೋಷ ಪರಿಶೀಲನೆ, ಮತ್ತು ಇಟ್ಟುಕೊಳ್ಳಲು ಪ್ರತಿ" },
    text: {
      en: "Mangal dosha, Kaal Sarp and Sade Sati at a glance. Print the page or save it as a PDF.",
      hi: "मंगल दोष, काल सर्प और साढ़े साती एक नज़र में। पृष्ठ छापें या PDF में सहेजें।",
      kn: "ಕುಜ ದೋಷ, ಕಾಳ ಸರ್ಪ ಮತ್ತು ಸಾಡೇ ಸಾತಿ ಒಂದೇ ನೋಟದಲ್ಲಿ. ಪುಟವನ್ನು ಮುದ್ರಿಸಿ ಅಥವಾ PDF ಆಗಿ ಉಳಿಸಿ.",
    },
  },
];

/** Panchanga of the birth moment. The Hindu day begins at sunrise, so a birth before sunrise belongs to the previous vara. */
function birthPanchang(k: Kundli) {
  const b = k.birth;
  const day = dayPanchang({ year: b.year, month: b.month, day: b.day }, b.place);
  const beforeSunrise = day.sunrise !== null && k.instant.getTime() < day.sunrise.getTime();
  const tithi = tithiAt(k.instant);
  return {
    weekday: beforeSunrise ? (day.weekday + 6) % 7 : day.weekday,
    tithi,
    paksha: tithi < 15 ? ("shukla" as const) : ("krishna" as const),
    yoga: yogaAt(k.instant),
    karana: karanaAt(k.instant),
    masa: lunarMonth(k.instant, tithi),
    sunrise: day.sunrise,
  };
}

function whatsappMessage(k: Kundli, dasha: string): string {
  const b = k.birth;
  const moon = k.grahas.Moon;
  return [
    "Namaste Rajeshwari madam, I made my Kundli on your website.",
    `Name: ${b.name || "-"}`,
    `Born: ${formatDate("en", b)}, ${formatHourMinute(b.hour, b.minute)}, ${placeLabel(b.place)}`,
    `Lagna: ${RASHI.en[k.lagna.rashi]} | Rashi: ${RASHI.en[moon.rashi]} | Nakshatra: ${NAKSHATRA.en[moon.nakshatra]} pada ${moon.pada}`,
    dasha ? `Running dasha: ${dasha}` : "",
    "I would like a birth chart reading.",
  ]
    .filter(Boolean)
    .join("\n");
}

function StateChips({ k, id, lang }: { k: Kundli; id: GrahaId; lang: Lang }) {
  const g = k.grahas[id];
  const chips: { text: string; className: string }[] = [];
  if (g.retrograde) chips.push({ text: T.retro[lang], className: "bg-[#FBEAEA] text-[#9B2C2C]" });
  if (g.dignity === "exalted") chips.push({ text: T.exalted[lang], className: "bg-[#E8F3EC] text-[#1F6B43]" });
  if (g.dignity === "debilitated") chips.push({ text: T.debilitated[lang], className: "bg-[#F1ECE4] text-[#5A4A3D]" });
  if (g.dignity === "own") chips.push({ text: T.own[lang], className: "bg-[#FBF1DC] text-[#8A5A0B]" });
  if (!chips.length) return null;
  return (
    <span className="mt-1 flex flex-wrap gap-1">
      {chips.map((c) => (
        <span key={c.text} className={`px-1.5 py-0.5 text-[11px] font-semibold leading-none ${c.className}`}>
          {c.text}
        </span>
      ))}
    </span>
  );
}

export function KundliTool() {
  const lang = useLang();
  const [input, setInput] = useState<BirthInput>(EMPTY_BIRTH);
  const [attempted, setAttempted] = useState(false);
  const [kundli, setKundli] = useState<Kundli | null>(null);
  const [now, setNow] = useState<Date | null>(null);
  const [style, setStyle] = useChartStyle();
  const resultRef = useRef<HTMLDivElement>(null);
  const scrollOnResult = useRef(false);

  useEffect(() => {
    const saved = loadBirth("self");
    if (saved) setInput(saved);
  }, []);

  useEffect(() => {
    if (kundli && scrollOnResult.current) {
      scrollOnResult.current = false;
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      resultRef.current?.focus({ preventScroll: true });
    }
  }, [kundli]);

  // Once "Make my Kundli" has been pressed, each message goes away as soon as its field is put right.
  const errors: BirthErrors = attempted ? validateBirth(input, lang) : {};

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setAttempted(true);
    if (Object.keys(validateBirth(input, lang)).length) {
      setKundli(null);
      showFirstError(e.currentTarget as HTMLElement);
      return;
    }
    saveBirth("self", input);
    scrollOnResult.current = true;
    setNow(new Date());
    setKundli(computeKundli(toBirthDetails(input)));
  };

  const extra = useMemo(() => {
    if (!kundli || !now) return null;
    return {
      panchang: birthPanchang(kundli),
      dasha: currentDasha(kundli.dashas, now),
      sadeSati: sadeSatiStatus(kundli.grahas.Moon.rashi, now),
    };
  }, [kundli, now]);

  const d1: ChartGraha[] = kundli ? GRAHAS.map((id) => ({ id, rashi: kundli.grahas[id].rashi, retrograde: kundli.grahas[id].retrograde })) : [];
  const d9: ChartGraha[] = kundli ? GRAHAS.map((id) => ({ id, rashi: kundli.grahas[id].navamsa, retrograde: kundli.grahas[id].retrograde })) : [];
  const price = SERVICES.find((s) => s.id === "birth-chart");

  return (
    <>
      <ToolHero eyebrow={T.eyebrow[lang]} title={T.title[lang]} intro={T.intro[lang]} />

      <div className="max-w-[1280px] mx-auto px-4 lg:px-8 py-8 lg:py-12 space-y-8 lg:space-y-10">
        <FormWithAside title={T.asideTitle[lang]} items={ASIDE.map((a) => ({ title: a.title[lang], text: a.text[lang] }))}>
          <form onSubmit={submit} noValidate className="no-print">
            <Panel title={T.formTitle[lang]}>
              <BirthFields idPrefix="self" value={input} onChange={setInput} errors={errors} lang={lang} />
              <button type="submit" className="btn btn-maroon w-full sm:w-auto sm:min-w-[260px] !min-h-[54px] !text-[16px] mt-6">
                {T.submit[lang]}
              </button>
              <PrivacyNote lang={lang} className="mt-4" />
            </Panel>
          </form>
        </FormWithAside>

        {kundli && extra && now && (
          <div ref={resultRef} tabIndex={-1} className="space-y-6 lg:space-y-8 outline-none scroll-mt-24 animate-rise">
            {/* Summary */}
            <section className="night text-[#FFFEFB] p-5 sm:p-8 lg:p-10">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="eyebrow !text-[#C9A86A]">{T.kundliOf[lang]}</div>
                  <h2 className="mt-2 font-serif text-[30px] lg:text-[40px] text-[#FFFEFB]">{kundli.birth.name || T.title[lang]}</h2>
                  <p className="mt-2 text-[14.5px] leading-[1.6] text-[#E8DDD0]/80">
                    {formatDate(lang, kundli.birth)} • {formatHourMinute(kundli.birth.hour, kundli.birth.minute)} (UTC{formatOffset(kundli.utcOffsetMinutes)}) • {placeLabel(kundli.birth.place)}
                  </p>
                </div>
                <button type="button" onClick={() => window.print()} className="no-print inline-flex items-center gap-2 h-11 px-4 border border-[#C9A86A]/50 text-[13px] font-semibold text-[#E8C99A] hover:bg-[#C9A86A] hover:text-[#1A0F0A] transition-colors">
                  <Printer className="w-4 h-4" aria-hidden /> {T.print[lang]}
                </button>
              </div>
              <div className="mt-7 grid grid-cols-2 gap-x-6 gap-y-6 lg:grid-cols-4 pt-6 border-t border-[#C9A86A]/25">
                <Fact tone="dark" label={T.lagna[lang]} value={RASHI[lang][kundli.lagna.rashi]} sub={`${formatDegree(kundli.lagna.degree)}${lang === "en" ? ` • ${RASHI_WESTERN[kundli.lagna.rashi]}` : ""}`} />
                <Fact tone="dark" label={T.rashi[lang]} value={RASHI[lang][kundli.grahas.Moon.rashi]} sub={`${T.lord[lang]}: ${GRAHA[RASHI_LORD[kundli.grahas.Moon.rashi]][lang]}`} />
                <Fact
                  tone="dark"
                  label={T.nakshatra[lang]}
                  value={NAKSHATRA[lang][kundli.grahas.Moon.nakshatra]}
                  sub={`${T.pada[lang]}\u00A0${kundli.grahas.Moon.pada} • ${T.lord[lang]}: ${GRAHA[nakshatraLord(kundli.grahas.Moon.nakshatra)][lang]}`}
                />
                <Fact
                  tone="dark"
                  label={T.dashaNow[lang]}
                  value={extra.dasha ? `${GRAHA[extra.dasha.maha.lord][lang]} – ${GRAHA[extra.dasha.antar.lord][lang]}` : "—"}
                  sub={extra.dasha ? (lang === "en" ? `${T.until[lang]} ${formatMonthYear(lang, dateOf(extra.dasha.antar.end, kundli.birth.place.tz))}` : `${formatMonthYear(lang, dateOf(extra.dasha.antar.end, kundli.birth.place.tz))} ${T.until[lang]}`) : undefined}
                />
              </div>
            </section>

            {/* Charts */}
            <Panel>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-serif text-[24px] lg:text-[28px]">{T.charts[lang]}</h2>
                <div className="no-print">
                  <ChartStyleToggle style={style} onChange={setStyle} lang={lang} />
                </div>
              </div>
              <div className="mt-6 grid gap-8 md:grid-cols-2 md:gap-10">
                <figure>
                  <KundliChart style={style} lagnaRashi={kundli.lagna.rashi} grahas={d1} lang={lang} title={T.d1[lang]} className="w-full max-w-[440px] mx-auto" />
                  <figcaption className="mt-3 text-center text-[13.5px] text-[#5A4A3D]">{T.d1Note[lang]}</figcaption>
                </figure>
                <figure>
                  <KundliChart style={style} lagnaRashi={kundli.lagna.navamsa} grahas={d9} lang={lang} title={T.d9[lang]} className="w-full max-w-[440px] mx-auto" />
                  <figcaption className="mt-3 text-center text-[13.5px] text-[#5A4A3D]">{T.d9Note[lang]}</figcaption>
                </figure>
              </div>
              <p className="mt-6 text-[12.5px] leading-[1.6] text-[#6B5D52]">
                {style === "north" ? `${T.legendNumbers[lang]} ` : ""}
                {T.legendRetro[lang]} {T.settings[lang]} {formatDegree(kundli.ayanamsa)}{lang === "hi" ? "।" : "."}
              </p>
            </Panel>

            {/* Positions */}
            <Panel title={T.positions[lang]}>
              <div className="overflow-x-auto -mx-5 sm:mx-0">
                <table className="w-full min-w-[340px] text-left text-[14px] sm:text-[15px]">
                  <thead>
                    <tr className="border-b border-[#D4C4B0] text-[11.5px] font-semibold uppercase tracking-[0.12em] text-[#8A6A2F]">
                      <th scope="col" className="py-2 pl-5 sm:pl-0 pr-3 font-semibold">{T.graha[lang]}</th>
                      <th scope="col" className="py-2 pr-3 font-semibold">{T.sign[lang]}</th>
                      <th scope="col" className="py-2 pr-3 font-semibold">{T.nakshatra[lang]}</th>
                      <th scope="col" className="py-2 pr-5 sm:pr-0 font-semibold text-right">{T.house[lang]}</th>
                    </tr>
                  </thead>
                  <tbody className="tabular">
                    <tr className="border-b border-[#EFE6D8] bg-[#FFFBF2]">
                      <th scope="row" className="py-3 pl-5 sm:pl-0 pr-3 font-semibold text-[#7C2D2D]">{LAGNA[lang]}</th>
                      <td className="py-3 pr-3">
                        {RASHI[lang][kundli.lagna.rashi]} <span className="text-[#6B5D52]">{formatDegree(kundli.lagna.degree)}</span>
                      </td>
                      <td className="py-3 pr-3">
                        {NAKSHATRA[lang][kundli.lagna.nakshatra]} <span className="text-[#6B5D52]">{kundli.lagna.pada}</span>
                      </td>
                      <td className="py-3 pr-5 sm:pr-0 text-right">1</td>
                    </tr>
                    {GRAHAS.map((id) => {
                      const g = kundli.grahas[id];
                      return (
                        <tr key={id} className="border-b border-[#EFE6D8] align-top">
                          <th scope="row" className="py-3 pl-5 sm:pl-0 pr-3 font-semibold">
                            {GRAHA[id][lang]}
                            {lang === "en" && <span className="ml-1.5 font-normal text-[12.5px] text-[#6B5D52]">{GRAHA_WESTERN[id]}</span>}
                            <StateChips k={kundli} id={id} lang={lang} />
                          </th>
                          <td className="py-3 pr-3">
                            {RASHI[lang][g.rashi]} <span className="text-[#6B5D52]">{formatDegree(g.degree)}</span>
                          </td>
                          <td className="py-3 pr-3">
                            {NAKSHATRA[lang][g.nakshatra]} <span className="text-[#6B5D52]">{g.pada}</span>
                          </td>
                          <td className="py-3 pr-5 sm:pr-0 text-right">{g.house}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Panel>

            {/* Panchanga at birth */}
            <Panel title={T.birthPanchang[lang]}>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-5 md:grid-cols-3">
                {[
                  [T.vara[lang], VARA[lang][extra.panchang.weekday]],
                  [T.tithi[lang], `${PAKSHA[extra.panchang.paksha][lang]} ${tithiName(lang, extra.panchang.tithi)}`],
                  [T.nakshatra[lang], `${NAKSHATRA[lang][kundli.grahas.Moon.nakshatra]}, ${T.pada[lang]}\u00A0${kundli.grahas.Moon.pada}`],
                  [T.yoga[lang], YOGA[lang][extra.panchang.yoga]],
                  [T.karana[lang], KARANA[lang][extra.panchang.karana]],
                  [T.masa[lang], `${extra.panchang.masa.adhika ? `${ADHIKA[lang]} ` : ""}${MASA[lang][extra.panchang.masa.amanta]}`],
                  [T.sunrise[lang], extra.panchang.sunrise ? formatClock(extra.panchang.sunrise, kundli.birth.place.tz) : "—"],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-[#8A6A2F]">{label}</dt>
                    <dd className="mt-1 font-serif text-[20px] leading-[1.25]">{value}</dd>
                  </div>
                ))}
              </dl>
            </Panel>

            {/* Dasha */}
            <Panel title={T.dasha[lang]}>
              <p className="text-[14.5px] leading-[1.65] text-[#3D2F26] max-w-[720px]">{T.dashaIntro[lang]}</p>
              <ol className="mt-5 grid gap-px bg-[#E8DDD0] border border-[#E8DDD0] sm:grid-cols-3">
                {kundli.dashas.map((d, i) => {
                  const current = extra.dasha?.maha === d;
                  const start = i === 0 ? null : dateOf(d.start, kundli.birth.place.tz);
                  const end = dateOf(d.end, kundli.birth.place.tz);
                  return (
                    <li key={d.lord} className={`p-4 ${current ? "bg-[#FBF1DC]" : "bg-white"}`} aria-current={current ? "true" : undefined}>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-serif text-[20px]">{GRAHA[d.lord][lang]}</span>
                        {current && <span className="px-2 py-0.5 bg-[#7C2D2D] text-white text-[11px] font-semibold uppercase tracking-[0.08em]">{T.now[lang]}</span>}
                      </div>
                      <div className="mt-1 text-[13.5px] text-[#5A4A3D] tabular">
                        {start ? formatMonthYear(lang, start) : T.birth[lang]} – {formatMonthYear(lang, end)}
                      </div>
                    </li>
                  );
                })}
              </ol>

              {extra.dasha && (
                <div className="mt-7">
                  <h3 className="text-[15px] font-semibold text-[#1A0F0A]">
                    {T.antardasha[lang]} ({GRAHA[extra.dasha.maha.lord][lang]})
                  </h3>
                  <ol className="mt-3 border-t border-[#EFE6D8]">
                    {extra.dasha.maha.antardashas
                      .filter((a) => a.end.getTime() > kundli.instant.getTime())
                      .map((a) => {
                        const current = extra.dasha?.antar === a;
                        return (
                          <li key={a.lord} className={`flex items-center justify-between gap-3 py-2.5 px-3 border-b border-[#EFE6D8] text-[14.5px] ${current ? "bg-[#FBF1DC] font-semibold" : ""}`}>
                            <span>
                              {GRAHA[extra.dasha!.maha.lord][lang]} – {GRAHA[a.lord][lang]}
                            </span>
                            <span className="tabular text-[#5A4A3D] text-right">
                              {formatMonthYear(lang, dateOf(a.start, kundli.birth.place.tz))} – {formatMonthYear(lang, dateOf(a.end, kundli.birth.place.tz))}
                            </span>
                          </li>
                        );
                      })}
                  </ol>
                </div>
              )}
            </Panel>

            {/* Doshas in brief */}
            <Panel title={T.doshas[lang]}>
              <div className="grid gap-px bg-[#E8DDD0] border border-[#E8DDD0] sm:grid-cols-3">
                {[
                  {
                    label: T.manglik[lang],
                    value: kundli.manglik.fromLagna ? T.yes[lang] : kundli.manglik.fromMoon ? T.mild[lang] : T.no[lang],
                    note: `${GRAHA.Mars[lang]}: ${lang === "en" ? `${ordinal(lang, kundli.manglik.houseFromLagna)} house` : `${ordinal(lang, kundli.manglik.houseFromLagna)} ${T.house[lang]}`}`,
                    flag: kundli.manglik.fromLagna,
                  },
                  { label: T.kaalSarp[lang], value: kundli.kaalSarp.present ? T.yes[lang] : T.no[lang], note: `${GRAHA.Rahu[lang]}: ${lang === "en" ? `${ordinal(lang, kundli.kaalSarp.rahuHouse)} house` : `${ordinal(lang, kundli.kaalSarp.rahuHouse)} ${T.house[lang]}`}`, flag: kundli.kaalSarp.present },
                  {
                    label: T.sadeSati[lang],
                    value: extra.sadeSati.phase ? T.running[lang] : T.notRunning[lang],
                    note: `${GRAHA.Saturn[lang]}: ${RASHI[lang][extra.sadeSati.saturnRashi]}`,
                    flag: Boolean(extra.sadeSati.phase),
                  },
                ].map((item) => (
                  <div key={item.label} className="bg-white p-4">
                    <div className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-[#8A6A2F]">{item.label}</div>
                    <div className={`mt-1 font-serif text-[22px] ${item.flag ? "text-[#9B2C2C]" : "text-[#1F6B43]"}`}>{item.value}</div>
                    <div className="mt-0.5 text-[13px] text-[#6B5D52]">{item.note}</div>
                  </div>
                ))}
              </div>
              <Link href="/dosha-check?go=1" className="no-print mt-5 inline-flex items-center gap-2 text-[14.5px] font-semibold text-[#7C2D2D] underline underline-offset-4 decoration-[#C9A86A] hover:decoration-[#7C2D2D]">
                {T.doshaLink[lang]} <ArrowRight className="w-4 h-4" aria-hidden />
              </Link>
            </Panel>

            <ConsultCTA
              lang={lang}
              title={T.ctaTitle[lang]}
              body={T.ctaBody[lang]}
              message={whatsappMessage(kundli, extra.dasha ? `${GRAHA[extra.dasha.maha.lord].en} - ${GRAHA[extra.dasha.antar.lord].en}` : "")}
              price={price ? `${formatRupees(price.price)} • ${price.minutes} min` : undefined}
            />
          </div>
        )}
      </div>
    </>
  );
}
