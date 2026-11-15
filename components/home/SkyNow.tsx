"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { KundliChart, type ChartGraha } from "@/components/astro/KundliChart";
import { ChartStyleToggle, useChartStyle } from "@/components/astro/ui";
import { dateOf, formatDate } from "@/lib/astro/format";
import { GRAHAS } from "@/lib/astro/graha";
import { LAGNA, NAKSHATRA, RASHI, type Tri } from "@/lib/astro/names";
import { formatClock } from "@/lib/astro/time";
import { useLang } from "@/lib/useLang";
import { HOME } from "./copy";
import { useSky } from "./useSky";

const T = {
  chartTitle: { en: "The sky right now", hi: "इस क्षण का आकाश", kn: "ಈ ಕ್ಷಣದ ಆಕಾಶ" },
  moon: { en: "Moon in", hi: "चंद्र", kn: "ಚಂದ್ರ" },
  live: {
    en: "This is a real chart, calculated on your device when the page opened. Yours is made the same way, from your time and place of birth.",
    hi: "यह वास्तविक कुंडली है, पृष्ठ खुलते ही आपके उपकरण पर गणित की गई। आपकी कुंडली भी इसी तरह बनती है — आपके जन्म समय और स्थान से।",
    kn: "ಇದು ನಿಜವಾದ ಕುಂಡಲಿ, ಪುಟ ತೆರೆದಾಗ ನಿಮ್ಮ ಸಾಧನದಲ್ಲೇ ಲೆಕ್ಕ ಹಾಕಿದ್ದು. ನಿಮ್ಮ ಕುಂಡಲಿಯೂ ಹೀಗೆಯೇ ರಚನೆಯಾಗುತ್ತದೆ — ನಿಮ್ಮ ಹುಟ್ಟಿದ ಸಮಯ ಮತ್ತು ಸ್ಥಳದಿಂದ.",
  },
} satisfies Record<string, Tri>;

export function SkyNow() {
  const lang = useLang();
  const { sky, failed } = useSky();
  const [style, setStyle] = useChartStyle();

  const grahas: ChartGraha[] = sky ? GRAHAS.map((id) => ({ id, rashi: sky.transits[id].rashi, retrograde: sky.transits[id].retrograde })) : [];
  const tz = sky?.place.tz ?? "Asia/Kolkata";

  return (
    <section className="bg-white border-y border-[#E8DDD0]">
      <div className="max-w-[1280px] mx-auto px-4 lg:px-8 py-12 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-20 items-center">
          <div>
            <div className="eyebrow">{HOME.kundliEyebrow[lang]}</div>
            <h2 className="mt-3 font-serif text-[32px] lg:text-[46px] text-[#1A0F0A]">{HOME.kundliTitle[lang]}</h2>
            <p className="mt-5 text-[16px] lg:text-[17px] leading-[1.7] text-[#3D2F26] max-w-[540px]">{HOME.kundliDesc1[lang]}</p>
            <p className="mt-3 text-[16px] lg:text-[17px] leading-[1.7] text-[#3D2F26] max-w-[540px]">{HOME.kundliDesc2[lang]}</p>
            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <Link href="/birth-chart" className="btn btn-maroon !min-h-[52px]">
                {HOME.makeKundli[lang]} <ArrowRight className="w-4 h-4" aria-hidden />
              </Link>
              <Link href="/kundali-matching" className="btn btn-outline !min-h-[52px]">
                {HOME.matchKundli[lang]}
              </Link>
            </div>
          </div>

          {!failed && (
            <figure className="frame bg-[#FFFDF7] p-5 sm:p-7 lg:p-9 w-full max-w-[540px] mx-auto lg:mx-0 lg:justify-self-end">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="eyebrow">
                  {T.chartTitle[lang]}
                  {sky ? ` • ${sky.place.name}` : ""}
                </div>
                <ChartStyleToggle style={style} onChange={setStyle} lang={lang} />
              </div>
              <div className="mt-5 aspect-square w-full">
                {sky ? (
                  <KundliChart style={style} lagnaRashi={sky.lagnaRashi} grahas={grahas} lang={lang} title={T.chartTitle[lang]} subtitle={sky.place.name} className="w-full h-full" />
                ) : (
                  <div className="w-full h-full border border-[#E8DDD0] bg-[#FBF5EA] animate-pulse" aria-hidden />
                )}
              </div>
              <figcaption className="mt-5 text-[13.5px] leading-[1.6] text-[#5A4A3D]">
                <span className="block min-h-[1.6em] font-semibold text-[#1A0F0A] tabular">
                  {sky
                    ? `${formatDate(lang, dateOf(sky.at, tz))}, ${formatClock(sky.at, tz)} • ${RASHI[lang][sky.lagnaRashi]} ${LAGNA[lang]} • ${T.moon[lang]} ${RASHI[lang][sky.transits.Moon.rashi]} (${NAKSHATRA[lang][sky.transits.Moon.nakshatra]})`
                    : ""}
                </span>
                <span className="mt-1 block">{T.live[lang]}</span>
              </figcaption>
            </figure>
          )}
        </div>
      </div>
    </section>
  );
}
