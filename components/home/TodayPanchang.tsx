"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Fact } from "@/components/astro/ui";
import { clockOn, formatDate } from "@/lib/astro/format";
import { ADHIKA, MASA, NAKSHATRA, PAKSHA, VARA, tithiName, type Tri } from "@/lib/astro/names";
import type { Span } from "@/lib/astro/panchang";
import { formatClock } from "@/lib/astro/time";
import { useLang } from "@/lib/useLang";
import { useSky } from "./useSky";

const T = {
  eyebrow: { en: "Today’s Panchanga", hi: "आज का पंचांग", kn: "ಇಂದಿನ ಪಂಚಾಂಗ" },
  loading: { en: "Reading today’s sky…", hi: "आज का आकाश पढ़ा जा रहा है…", kn: "ಇಂದಿನ ಆಕಾಶವನ್ನು ಓದಲಾಗುತ್ತಿದೆ…" },
  tithi: { en: "Tithi", hi: "तिथि", kn: "ತಿಥಿ" },
  nakshatra: { en: "Nakshatra", hi: "नक्षत्र", kn: "ನಕ್ಷತ್ರ" },
  sun: { en: "Sunrise – Sunset", hi: "सूर्योदय – सूर्यास्त", kn: "ಸೂರ್ಯೋದಯ – ಸೂರ್ಯಾಸ್ತ" },
  rahu: { en: "Rahu Kala", hi: "राहु काल", kn: "ರಾಹು ಕಾಲ" },
  until: { en: "until", hi: "तक", kn: "ವರೆಗೆ" },
  avoid: { en: "Avoid starting new work", hi: "नया कार्य आरंभ न करें", kn: "ಹೊಸ ಕೆಲಸ ಆರಂಭಿಸಬೇಡಿ" },
  running: { en: "Running now", hi: "अभी चल रहा है", kn: "ಈಗ ನಡೆಯುತ್ತಿದೆ" },
  over: { en: "Over for today", hi: "आज के लिए समाप्त", kn: "ಇಂದಿಗೆ ಮುಗಿದಿದೆ" },
  masa: { en: "masa", hi: "मास", kn: "ಮಾಸ" },
  full: { en: "Full Panchanga", hi: "पूरा पंचांग", kn: "ಪೂರ್ಣ ಪಂಚಾಂಗ" },
} satisfies Record<string, Tri>;

/** The stretch in force at `at`: the first one that has not ended yet. */
const current = (spans: Span[], at: Date): Span => spans.find((s) => s.end.getTime() > at.getTime()) ?? spans[spans.length - 1];

export function TodayPanchang() {
  const lang = useLang();
  const { sky, failed } = useSky();
  const p = sky?.panchang ?? null;
  const tz = p?.place.tz ?? "Asia/Kolkata";

  const until = (instant: Date) => {
    const time = p ? clockOn(lang, instant, tz, p.date) : "";
    return lang === "en" ? `${T.until[lang]} ${time}` : `${time} ${T.until[lang]}`;
  };
  const tithi = p && sky ? current(p.tithis, sky.at) : null;
  const nakshatra = p && sky ? current(p.nakshatras, sky.at) : null;
  const rahuNote = () => {
    if (!p?.rahuKala || !sky) return T.avoid[lang];
    const t = sky.at.getTime();
    if (t >= p.rahuKala.end.getTime()) return T.over[lang];
    return t >= p.rahuKala.start.getTime() ? T.running[lang] : T.avoid[lang];
  };
  const blank = <span className="inline-block h-[0.8em] w-[6.5em] max-w-full bg-[#FFFEFB]/10 animate-pulse align-middle" aria-hidden />;

  return (
    <section className="night text-[#FFFEFB]" aria-labelledby="today-heading">
      <div className="max-w-[1280px] mx-auto px-4 lg:px-8 py-8 lg:py-11">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <div className="min-w-0">
            <div className="eyebrow !text-[#C9A86A]">
              {T.eyebrow[lang]}
              {p ? ` • ${p.place.name}` : ""}
            </div>
            <h2 id="today-heading" className="mt-2 font-serif text-[29px] sm:text-[34px] lg:text-[40px] text-[#FFFEFB]">
              {p ? `${VARA[lang][p.weekday]}, ${formatDate(lang, p.date)}` : failed ? T.eyebrow[lang] : T.loading[lang]}
            </h2>
            <p className="mt-1.5 min-h-[1.5em] text-[16px] lg:text-[18px] text-[#E8C99A]">
              {p ? `${p.masa.adhika ? `${ADHIKA[lang]} ` : ""}${MASA[lang][p.masa.amanta]} ${T.masa[lang]} • ${PAKSHA[p.paksha][lang]}` : ""}
            </p>
          </div>
          <Link href="/panchang" className="btn btn-gold !min-h-[46px] !px-5 shrink-0">
            {T.full[lang]} <ArrowRight className="w-4 h-4" aria-hidden />
          </Link>
        </div>

        {!failed && (
          <dl className="mt-6 lg:mt-8 grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-6 pt-6 border-t border-[#C9A86A]/25" aria-busy={!p}>
            <Fact tone="dark" label={T.tithi[lang]} value={tithi ? tithiName(lang, tithi.index) : blank} sub={tithi ? until(tithi.end) : "\u00a0"} />
            <Fact tone="dark" label={T.nakshatra[lang]} value={nakshatra ? NAKSHATRA[lang][nakshatra.index] : blank} sub={nakshatra ? until(nakshatra.end) : "\u00a0"} />
            <Fact
              tone="dark"
              label={T.sun[lang]}
              value={p ? <span className="tabular">{p.sunrise && p.sunset ? `${formatClock(p.sunrise, tz)} – ${formatClock(p.sunset, tz)}` : "—"}</span> : blank}
              sub={p ? p.place.name : "\u00a0"}
            />
            <Fact
              tone="dark"
              label={T.rahu[lang]}
              value={p ? <span className="tabular">{p.rahuKala ? `${formatClock(p.rahuKala.start, tz)} – ${formatClock(p.rahuKala.end, tz)}` : "—"}</span> : blank}
              sub={p ? rahuNote() : "\u00a0"}
            />
          </dl>
        )}
      </div>
    </section>
  );
}
