"use client";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Moon, Sunrise, Sunset } from "lucide-react";
import { PlacePicker } from "@/components/astro/PlacePicker";
import { ConsultCTA, Panel, ToolHero } from "@/components/astro/ui";
import { clockOn, formatDate, formatDayMonth, sameDay, type YMD } from "@/lib/astro/format";
import type { Place } from "@/lib/astro/kundli";
import { ADHIKA, KARANA, MASA, NAKSHATRA, PAKSHA, RASHI, VARA, YOGA, tithiName, type Lang, type Tri } from "@/lib/astro/names";
import { dayPanchang, type DayPanchang, type Span, type TimeWindow } from "@/lib/astro/panchang";
import { BENGALURU, placeLabel } from "@/lib/astro/places";
import { formatClock, formatOffset, offsetMinutes, todayIn } from "@/lib/astro/time";
import { loadPanchangPlace, savePanchangPlace } from "@/lib/prefs";
import { useLang } from "@/lib/useLang";

const T = {
  eyebrow: { en: "Free tool • Daily Panchanga", hi: "निःशुल्क साधन • दैनिक पंचांग", kn: "ಉಚಿತ ಸಾಧನ • ದಿನದ ಪಂಚಾಂಗ" },
  title: { en: "Panchanga", hi: "पंचांग", kn: "ಪಂಚಾಂಗ" },
  intro: {
    en: "The five limbs of the day — tithi, vara, nakshatra, yoga and karana — with the time each one ends, sunrise and sunset, and Rahu Kala, worked out for your own town.",
    hi: "दिन के पाँच अंग — तिथि, वार, नक्षत्र, योग और करण — हर एक के समाप्ति समय, सूर्योदय-सूर्यास्त और राहु काल सहित, आपके अपने शहर के लिए।",
    kn: "ದಿನದ ಐದು ಅಂಗಗಳು — ತಿಥಿ, ವಾರ, ನಕ್ಷತ್ರ, ಯೋಗ ಮತ್ತು ಕರಣ — ಪ್ರತಿಯೊಂದರ ಮುಕ್ತಾಯ ಸಮಯ, ಸೂರ್ಯೋದಯ-ಸೂರ್ಯಾಸ್ತ ಮತ್ತು ರಾಹು ಕಾಲದೊಂದಿಗೆ, ನಿಮ್ಮ ಊರಿಗೇ ಲೆಕ್ಕ ಹಾಕಿ.",
  },
  date: { en: "Date", hi: "दिनांक", kn: "ದಿನಾಂಕ" },
  place: { en: "Place", hi: "स्थान", kn: "ಸ್ಥಳ" },
  today: { en: "Today", hi: "आज", kn: "ಇಂದು" },
  prev: { en: "Previous day", hi: "पिछला दिन", kn: "ಹಿಂದಿನ ದಿನ" },
  next: { en: "Next day", hi: "अगला दिन", kn: "ಮುಂದಿನ ದಿನ" },
  sunrise: { en: "Sunrise", hi: "सूर्योदय", kn: "ಸೂರ್ಯೋದಯ" },
  sunset: { en: "Sunset", hi: "सूर्यास्त", kn: "ಸೂರ್ಯಾಸ್ತ" },
  moonrise: { en: "Moonrise", hi: "चंद्रोदय", kn: "ಚಂದ್ರೋದಯ" },
  moonset: { en: "Moonset", hi: "चंद्रास्त", kn: "ಚಂದ್ರಾಸ್ತ" },
  five: { en: "The five limbs", hi: "पाँच अंग", kn: "ಪಂಚ ಅಂಗಗಳು" },
  vara: { en: "Vara", hi: "वार", kn: "ವಾರ" },
  tithi: { en: "Tithi", hi: "तिथि", kn: "ತಿಥಿ" },
  nakshatra: { en: "Nakshatra", hi: "नक्षत्र", kn: "ನಕ್ಷತ್ರ" },
  yoga: { en: "Yoga", hi: "योग", kn: "ಯೋಗ" },
  karana: { en: "Karana", hi: "करण", kn: "ಕರಣ" },
  until: { en: "until", hi: "तक", kn: "ವರೆಗೆ" },
  then: { en: "then", hi: "फिर", kn: "ನಂತರ" },
  timings: { en: "Timings of the day", hi: "दिन के मुहूर्त", kn: "ದಿನದ ಕಾಲಗಳು" },
  rahu: { en: "Rahu Kala", hi: "राहु काल", kn: "ರಾಹು ಕಾಲ" },
  yama: { en: "Yamaganda", hi: "यमगंड", kn: "ಯಮಗಂಡ ಕಾಲ" },
  gulika: { en: "Gulika Kala", hi: "गुलिक काल", kn: "ಗುಳಿಕ ಕಾಲ" },
  abhijit: { en: "Abhijit Muhurta", hi: "अभिजित मुहूर्त", kn: "ಅಭಿಜಿತ್ ಮುಹೂರ್ತ" },
  avoid: { en: "Avoid starting new work", hi: "नया कार्य आरंभ न करें", kn: "ಹೊಸ ಕೆಲಸ ಆರಂಭಿಸಬೇಡಿ" },
  good: { en: "Good for beginnings", hi: "शुभारंभ के लिए उत्तम", kn: "ಶುಭಾರಂಭಕ್ಕೆ ಉತ್ತಮ" },
  abhijitWed: { en: "Not used on Wednesdays", hi: "बुधवार को वर्जित", kn: "ಬುಧವಾರ ಬಳಸುವುದಿಲ್ಲ" },
  masa: { en: "Lunar month", hi: "चंद्र मास", kn: "ಚಾಂದ್ರ ಮಾಸ" },
  paksha: { en: "Paksha", hi: "पक्ष", kn: "ಪಕ್ಷ" },
  sunSign: { en: "Sun in", hi: "सूर्य राशि", kn: "ಸೂರ್ಯ ರಾಶಿ" },
  moonSign: { en: "Moon in", hi: "चंद्र राशि", kn: "ಚಂದ್ರ ರಾಶಿ" },
  north: { en: "in the North Indian (purnimanta) reckoning", hi: "उत्तर भारतीय (पूर्णिमांत) गणना में", kn: "ಉತ್ತರ ಭಾರತದ (ಪೂರ್ಣಿಮಾಂತ) ಗಣನೆಯಲ್ಲಿ" },
  week: { en: "The week ahead", hi: "आने वाला सप्ताह", kn: "ಮುಂದಿನ ವಾರ" },
  atSunrise: { en: "Tithi and nakshatra at sunrise", hi: "सूर्योदय के समय तिथि और नक्षत्र", kn: "ಸೂರ್ಯೋದಯ ಕಾಲದ ತಿಥಿ ಮತ್ತು ನಕ್ಷತ್ರ" },
  timesFor: { en: "Times are on the clock of", hi: "समय इस स्थान की घड़ी के अनुसार:", kn: "ಸಮಯ ಈ ಸ್ಥಳದ ಗಡಿಯಾರದಂತೆ:" },
  method: {
    en: "The day runs from sunrise to the next sunrise. Sunrise is the moment the Sun’s upper edge appears. Lahiri ayanamsa; the lunar month is named in the amanta reckoning used in Karnataka.",
    hi: "दिन सूर्योदय से अगले सूर्योदय तक चलता है। सूर्योदय वह क्षण है जब सूर्य का ऊपरी किनारा दिखता है। लाहिरी अयनांश; चंद्र मास कर्नाटक में प्रचलित अमांत गणना से।",
    kn: "ದಿನ ಸೂರ್ಯೋದಯದಿಂದ ಮುಂದಿನ ಸೂರ್ಯೋದಯದವರೆಗೆ. ಸೂರ್ಯನ ಮೇಲಂಚು ಕಾಣುವ ಕ್ಷಣವೇ ಸೂರ್ಯೋದಯ. ಲಾಹಿರಿ ಅಯನಾಂಶ; ಚಾಂದ್ರ ಮಾಸ ಕರ್ನಾಟಕದಲ್ಲಿ ಬಳಕೆಯಲ್ಲಿರುವ ಅಮಾಂತ ಗಣನೆಯಂತೆ.",
  },
  polar: { en: "The Sun does not rise or set at this place on this day.", hi: "इस दिन इस स्थान पर सूर्य उदय या अस्त नहीं होता।", kn: "ಈ ದಿನ ಈ ಸ್ಥಳದಲ್ಲಿ ಸೂರ್ಯ ಉದಯಿಸುವುದಿಲ್ಲ ಅಥವಾ ಅಸ್ತಮಿಸುವುದಿಲ್ಲ." },
  ctaTitle: { en: "Planning something important?", hi: "कोई महत्वपूर्ण कार्य की योजना है?", kn: "ಮುಖ್ಯವಾದ ಕೆಲಸದ ಯೋಜನೆ ಇದೆಯೇ?" },
  ctaBody: {
    en: "The panchanga describes the day for everyone. How a day sits with your own nakshatra and chart is a personal question — ask me directly.",
    hi: "पंचांग दिन को सबके लिए बताता है। कोई दिन आपके अपने नक्षत्र और कुंडली के साथ कैसा बैठता है, यह व्यक्तिगत प्रश्न है — सीधे मुझसे पूछिए।",
    kn: "ಪಂಚಾಂಗ ದಿನವನ್ನು ಎಲ್ಲರಿಗೂ ಸಾಮಾನ್ಯವಾಗಿ ತಿಳಿಸುತ್ತದೆ. ಒಂದು ದಿನ ನಿಮ್ಮ ನಕ್ಷತ್ರ ಮತ್ತು ಜಾತಕಕ್ಕೆ ಹೇಗೆ ಹೊಂದುತ್ತದೆ ಎಂಬುದು ವೈಯಕ್ತಿಕ ಪ್ರಶ್ನೆ — ನೇರವಾಗಿ ನನ್ನನ್ನು ಕೇಳಿ.",
  },
} satisfies Record<string, Tri>;

const pad = (n: number) => String(n).padStart(2, "0");
const toInputValue = (d: YMD) => `${d.year}-${pad(d.month)}-${pad(d.day)}`;

function shiftDay(d: YMD, days: number): YMD {
  const t = new Date(Date.UTC(d.year, d.month - 1, d.day + days));
  return { year: t.getUTCFullYear(), month: t.getUTCMonth() + 1, day: t.getUTCDate() };
}

/** "Shukla Saptami until 2:14 PM, then Ashtami until 12:40 PM, 16 Nov" laid out as rows. */
function Limb({ label, spans, name, p, lang }: { label: string; spans: Span[]; name: (index: number) => string; p: DayPanchang; lang: Lang }) {
  return (
    <div className="grid grid-cols-[92px_1fr] sm:grid-cols-[150px_1fr] gap-x-4 py-4 border-b border-[#EFE6D8] last:border-b-0">
      <dt className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-[#8A6A2F] pt-1.5">{label}</dt>
      <dd className="space-y-1.5">
        {spans.map((s, i) => {
          const time = clockOn(lang, s.end, p.place.tz, p.date);
          return (
            <div key={`${s.index}-${i}`} className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
              <span className={i === 0 ? "font-serif text-[22px] leading-[1.25] text-[#1A0F0A]" : "text-[15.5px] text-[#3D2F26]"}>
                {i > 0 && <span className="text-[#6B5D52]">{T.then[lang]} </span>}
                {name(s.index)}
              </span>
              <span className="text-[14px] text-[#5A4A3D] tabular">{lang === "en" ? `${T.until[lang]} ${time}` : `${time} ${T.until[lang]}`}</span>
            </div>
          );
        })}
      </dd>
    </div>
  );
}

function Slot({ label, w, tz, note, tone }: { label: string; w: TimeWindow | null; tz: string; note: string; tone: "avoid" | "good" }) {
  return (
    <div className={`p-4 border ${tone === "good" ? "border-[#CFE3D6] bg-[#F3F9F5]" : "border-[#E8DDD0] bg-white"}`}>
      <div className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-[#8A6A2F]">{label}</div>
      <div className="mt-1 font-serif text-[21px] leading-[1.25] tabular">{w ? `${formatClock(w.start, tz)} – ${formatClock(w.end, tz)}` : "—"}</div>
      <div className={`mt-1 text-[13px] ${tone === "good" ? "text-[#1F6B43]" : "text-[#6B5D52]"}`}>{note}</div>
    </div>
  );
}

export function PanchangTool() {
  const lang = useLang();
  const [place, setPlace] = useState<Place>(BENGALURU);
  const [pending, setPending] = useState<Place | null>(BENGALURU); // what the place box shows while a new place is being typed
  const [date, setDate] = useState<YMD | null>(null);
  const [today, setToday] = useState<YMD | null>(null);

  // Today's date depends on the visitor's clock, so it is set only in the browser.
  useEffect(() => {
    const saved = loadPanchangPlace() ?? BENGALURU;
    setPlace(saved);
    setPending(saved);
    const now = todayIn(saved.tz);
    setToday(now);
    setDate(now);
  }, []);

  const choosePlace = (next: Place | null) => {
    setPending(next);
    if (!next) return;
    setPlace(next);
    setToday(todayIn(next.tz));
    savePanchangPlace(next);
  };

  const p = useMemo(() => (date ? dayPanchang(date, place) : null), [date, place]);
  const week = useMemo(() => (date ? Array.from({ length: 7 }, (_, i) => dayPanchang(shiftDay(date, i + 1), place)) : []), [date, place]);

  const tz = place.tz;
  const offset = useMemo(() => {
    if (!p) return "";
    try {
      return formatOffset(offsetMinutes(tz, p.sunrise ?? new Date(Date.UTC(p.date.year, p.date.month - 1, p.date.day, 6))));
    } catch {
      return "";
    }
  }, [p, tz]);

  const tithiLabel = (index: number) => `${PAKSHA[index < 15 ? "shukla" : "krishna"][lang]} ${tithiName(lang, index)}`;
  const isToday = date && today ? sameDay(date, today) : false;

  return (
    <>
      <ToolHero eyebrow={T.eyebrow[lang]} title={T.title[lang]} intro={T.intro[lang]} />

      <div className="max-w-[1280px] mx-auto px-4 lg:px-8 py-8 lg:py-12 space-y-6 lg:space-y-8">
        {/* Controls */}
        <div className="card p-4 sm:p-5 grid gap-4 md:grid-cols-[auto_1fr] md:items-end no-print">
          <div>
            <label htmlFor="panchang-date" className="field-label">
              {T.date[lang]}
            </label>
            <div className="flex items-stretch gap-2">
              <button type="button" aria-label={T.prev[lang]} onClick={() => date && setDate(shiftDay(date, -1))} className="w-12 h-12 shrink-0 border border-[#D4C4B0] bg-white flex items-center justify-center hover:border-[#1A0F0A]">
                <ChevronLeft className="w-5 h-5" aria-hidden />
              </button>
              <input
                id="panchang-date"
                type="date"
                className="field tabular min-w-0 flex-1 md:w-[190px]"
                min="1900-01-01"
                max="2100-12-31"
                value={date ? toInputValue(date) : ""}
                onChange={(e) => {
                  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(e.target.value);
                  if (m && Number(m[1]) >= 1900 && Number(m[1]) <= 2100) setDate({ year: Number(m[1]), month: Number(m[2]), day: Number(m[3]) });
                }}
              />
              <button type="button" aria-label={T.next[lang]} onClick={() => date && setDate(shiftDay(date, 1))} className="w-12 h-12 shrink-0 border border-[#D4C4B0] bg-white flex items-center justify-center hover:border-[#1A0F0A]">
                <ChevronRight className="w-5 h-5" aria-hidden />
              </button>
              <button type="button" disabled={isToday} onClick={() => today && setDate(today)} className="h-12 px-4 shrink-0 border border-[#D4C4B0] bg-white text-[14px] font-semibold hover:border-[#1A0F0A] disabled:opacity-45 disabled:hover:border-[#D4C4B0]">
                {T.today[lang]}
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="panchang-place" className="field-label">
              {T.place[lang]}
            </label>
            <PlacePicker id="panchang-place" value={pending} onChange={choosePlace} lang={lang} />
          </div>
        </div>

        {!p && <div className="h-[420px] card animate-pulse bg-[#FBF7EF]" aria-hidden />}

        {p && (
          <>
            {/* The day at a glance */}
            <section className="night text-[#FFFEFB] p-5 sm:p-8 lg:p-10" aria-live="polite">
              <div className="eyebrow !text-[#C9A86A]">
                {placeLabel(place)}
                {isToday ? ` • ${T.today[lang]}` : ""}
              </div>
              <h2 className="mt-2 font-serif text-[30px] sm:text-[38px] lg:text-[46px] text-[#FFFEFB]">
                {VARA[lang][p.weekday]}, {formatDate(lang, p.date)}
              </h2>
              <p className="mt-2 text-[17px] lg:text-[19px] text-[#E8C99A]">
                {p.masa.adhika ? `${ADHIKA[lang]} ` : ""}
                {MASA[lang][p.masa.amanta]} • {tithiLabel(p.tithis[0].index)} • {NAKSHATRA[lang][p.nakshatras[0].index]}
              </p>
              <div className="mt-7 grid grid-cols-2 gap-x-6 gap-y-5 md:grid-cols-4 pt-6 border-t border-[#C9A86A]/25">
                {[
                  { icon: <Sunrise className="w-4 h-4" aria-hidden />, label: T.sunrise[lang], at: p.sunrise },
                  { icon: <Sunset className="w-4 h-4" aria-hidden />, label: T.sunset[lang], at: p.sunset },
                  { icon: <Moon className="w-4 h-4" aria-hidden />, label: T.moonrise[lang], at: p.moonrise },
                  { icon: <Moon className="w-4 h-4 opacity-60" aria-hidden />, label: T.moonset[lang], at: p.moonset },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex items-center gap-1.5 text-[11.5px] font-semibold uppercase tracking-[0.12em] text-[#C9A86A]">
                      {item.icon}
                      {item.label}
                    </div>
                    <div className="mt-1 font-serif text-[24px] lg:text-[28px] tabular">{item.at ? clockOn(lang, item.at, tz, p.date) : "—"}</div>
                  </div>
                ))}
              </div>
              {(!p.sunrise || !p.sunset) && <p className="mt-4 text-[14px] text-[#E8DDD0]/80">{T.polar[lang]}</p>}
            </section>

            <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr] lg:gap-8 lg:items-start">
              <Panel title={T.five[lang]}>
                <dl>
                  <div className="grid grid-cols-[92px_1fr] sm:grid-cols-[150px_1fr] gap-x-4 py-4 border-b border-[#EFE6D8]">
                    <dt className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-[#8A6A2F] pt-1.5">{T.vara[lang]}</dt>
                    <dd className="font-serif text-[22px] leading-[1.25]">{VARA[lang][p.weekday]}</dd>
                  </div>
                  <Limb label={T.tithi[lang]} spans={p.tithis} name={tithiLabel} p={p} lang={lang} />
                  <Limb label={T.nakshatra[lang]} spans={p.nakshatras} name={(i) => NAKSHATRA[lang][i]} p={p} lang={lang} />
                  <Limb label={T.yoga[lang]} spans={p.yogas} name={(i) => YOGA[lang][i]} p={p} lang={lang} />
                  <Limb label={T.karana[lang]} spans={p.karanas} name={(i) => KARANA[lang][i]} p={p} lang={lang} />
                </dl>
              </Panel>

              <div className="space-y-6 lg:space-y-8">
                <Panel title={T.timings[lang]}>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                    <Slot label={T.rahu[lang]} w={p.rahuKala} tz={tz} note={T.avoid[lang]} tone="avoid" />
                    <Slot label={T.abhijit[lang]} w={p.abhijit} tz={tz} note={p.weekday === 3 ? T.abhijitWed[lang] : T.good[lang]} tone={p.weekday === 3 ? "avoid" : "good"} />
                    <Slot label={T.yama[lang]} w={p.yamaganda} tz={tz} note={T.avoid[lang]} tone="avoid" />
                    <Slot label={T.gulika[lang]} w={p.gulika} tz={tz} note={T.avoid[lang]} tone="avoid" />
                  </div>
                </Panel>

                <Panel>
                  <dl className="grid grid-cols-2 gap-x-6 gap-y-5">
                    <div className="col-span-2">
                      <dt className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-[#8A6A2F]">{T.masa[lang]}</dt>
                      <dd className="mt-1 font-serif text-[21px] leading-[1.25]">
                        {p.masa.adhika ? `${ADHIKA[lang]} ` : ""}
                        {MASA[lang][p.masa.amanta]}
                      </dd>
                      {p.masa.purnimanta !== p.masa.amanta && (
                        <dd className="mt-0.5 text-[13px] text-[#6B5D52]">
                          {MASA[lang][p.masa.purnimanta]} {T.north[lang]}
                        </dd>
                      )}
                    </div>
                    <div>
                      <dt className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-[#8A6A2F]">{T.paksha[lang]}</dt>
                      <dd className="mt-1 font-serif text-[21px] leading-[1.25]">{PAKSHA[p.paksha][lang]}</dd>
                    </div>
                    <div />
                    <div>
                      <dt className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-[#8A6A2F]">{T.sunSign[lang]}</dt>
                      <dd className="mt-1 font-serif text-[21px] leading-[1.25]">{RASHI[lang][p.sunRashi]}</dd>
                    </div>
                    <div>
                      <dt className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-[#8A6A2F]">{T.moonSign[lang]}</dt>
                      <dd className="mt-1 font-serif text-[21px] leading-[1.25]">{RASHI[lang][p.moonRashi]}</dd>
                    </div>
                  </dl>
                </Panel>
              </div>
            </div>

            <Panel title={T.week[lang]} kicker={T.atSunrise[lang]}>
              <ul className="border-t border-[#EFE6D8]">
                {week.map((d) => (
                  <li key={toInputValue(d.date)} className="border-b border-[#EFE6D8]">
                    <button type="button" onClick={() => setDate(d.date)} className="w-full grid grid-cols-[84px_1fr] sm:grid-cols-[150px_1fr_1fr_96px] gap-x-4 gap-y-0.5 items-baseline py-3 px-1 text-left hover:bg-[#FBF7EF]">
                      <span className="tabular">
                        <span className="block text-[15px] font-semibold text-[#1A0F0A]">{formatDayMonth(lang, d.date)}</span>
                        <span className="block text-[13px] text-[#6B5D52]">{VARA[lang][d.weekday]}</span>
                      </span>
                      <span className="text-[15px] text-[#1A0F0A]">
                        {tithiLabel(d.tithis[0].index)}
                        <span className="sm:hidden text-[#5A4A3D]"> • {NAKSHATRA[lang][d.nakshatras[0].index]}</span>
                      </span>
                      <span className="hidden sm:block text-[15px] text-[#3D2F26]">{NAKSHATRA[lang][d.nakshatras[0].index]}</span>
                      <span className="hidden sm:block text-right text-[14px] text-[#5A4A3D] tabular">{d.sunrise ? formatClock(d.sunrise, tz) : "—"}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </Panel>

            <p className="text-[12.5px] leading-[1.65] text-[#6B5D52] max-w-[820px]">
              {T.timesFor[lang]} {placeLabel(place)}
              {offset ? ` (UTC${offset})` : ""}
              {lang === "hi" ? "। " : ". "}
              {T.method[lang]}
            </p>

            <ConsultCTA
              lang={lang}
              title={T.ctaTitle[lang]}
              body={T.ctaBody[lang]}
              message={`Namaste Rajeshwari madam, I was looking at the Panchanga for ${formatDate("en", p.date)} (${placeLabel(place)}) on your website and would like to consult you.`}
            />
          </>
        )}
      </div>
    </>
  );
}
