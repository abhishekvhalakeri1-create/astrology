"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MoonTone } from "@/components/astro/ui";
import { clockOn, dateOf } from "@/lib/astro/format";
import { RASHI, RASHI_WESTERN, type Tri } from "@/lib/astro/names";
import { MOON_HOUSE_TEXT } from "@/lib/astro/rashiText";
import { ordinal } from "@/lib/astro/words";
import { houseFrom } from "@/lib/astro/zodiac";
import { loadRashi, saveRashi } from "@/lib/prefs";
import { useLang } from "@/lib/useLang";
import { HOME } from "./copy";
import { useSky } from "./useSky";

const T = {
  choose: { en: "Choose your rashi", hi: "अपनी राशि चुनें", kn: "ನಿಮ್ಮ ರಾಶಿ ಆಯ್ಕೆ ಮಾಡಿ" },
  until: { en: "until", hi: "तक", kn: "ವರೆಗೆ" },
  full: { en: "The week ahead, Shani and Guru", hi: "आने वाला सप्ताह, शनि और गुरु", kn: "ಮುಂದಿನ ವಾರ, ಶನಿ ಮತ್ತು ಗುರು" },
  moonRashi: {
    en: "Your rashi is the sign the Moon was in at your birth, not your Sun sign.",
    hi: "आपकी राशि वह है जिसमें जन्म के समय चंद्र था — सूर्य राशि नहीं।",
    kn: "ನಿಮ್ಮ ರಾಶಿ ಎಂದರೆ ನೀವು ಹುಟ್ಟಿದಾಗ ಚಂದ್ರ ಇದ್ದ ರಾಶಿ — ಸೂರ್ಯ ರಾಶಿ ಅಲ್ಲ.",
  },
} satisfies Record<string, Tri>;

export function RashiToday() {
  const lang = useLang();
  const { sky, failed } = useSky();
  const [rashi, setRashi] = useState(0);

  useEffect(() => {
    const saved = loadRashi();
    if (saved !== null) setRashi(saved);
  }, []);

  const choose = (r: number) => {
    setRashi(r);
    saveRashi(r);
  };

  const moon = sky ? sky.transits.Moon.rashi : null;
  const house = moon !== null ? houseFrom(rashi, moon) : null;
  const tz = sky?.place.tz ?? "Asia/Kolkata";
  const leaves = sky ? clockOn(lang, sky.moonLeaves, tz, dateOf(sky.at, tz)) : "";

  return (
    <section className="wash-warm border-b border-[#E8DDD0]">
      <div className="max-w-[1280px] mx-auto px-4 lg:px-8 py-12 lg:py-20">
        <div className="max-w-[720px]">
          <div className="eyebrow">{HOME.rashiEyebrow[lang]}</div>
          <h2 className="mt-3 font-serif text-[32px] lg:text-[46px] text-[#1A0F0A]">{HOME.rashiTitle[lang]}</h2>
          <p className="mt-4 text-[16px] lg:text-[17px] leading-[1.65] text-[#3D2F26]">{HOME.rashiNote[lang]}</p>
        </div>

        <div className="mt-8 lg:mt-10 grid gap-5 lg:grid-cols-[1fr_1.05fr] lg:gap-8 items-start">
          <div>
            <div role="group" aria-label={T.choose[lang]} className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-4 gap-1.5 sm:gap-2">
              {RASHI[lang].map((name, r) => (
                <button
                  key={r}
                  type="button"
                  aria-pressed={rashi === r}
                  onClick={() => choose(r)}
                  className={`min-h-[56px] px-1 py-2 border text-center transition-colors ${rashi === r ? "bg-[#7C2D2D] border-[#7C2D2D] text-white" : "bg-white border-[#D4C4B0] text-[#1A0F0A] hover:border-[#7C2D2D]"}`}
                >
                  <span className="block font-serif text-[16.5px] sm:text-[18px] !leading-[1.2]">{name}</span>
                  <span className={`block text-[11px] mt-0.5 ${rashi === r ? "text-white/75" : "text-[#6B5D52]"}`}>{RASHI_WESTERN[r]}</span>
                </button>
              ))}
            </div>
            <p className="mt-3 text-[13px] leading-[1.55] text-[#5A4A3D]">{T.moonRashi[lang]}</p>
          </div>

          <div className="frame bg-white p-5 sm:p-7 lg:p-9 min-h-[250px]" aria-live="polite">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <h3 className="font-serif text-[32px] lg:text-[40px] text-[#1A0F0A]">{RASHI[lang][rashi]}</h3>
              {house !== null && <MoonTone house={house} lang={lang} />}
            </div>
            {house !== null && moon !== null ? (
              <>
                <p className="mt-2 font-serif text-[20px] lg:text-[23px] !leading-[1.3] text-[#7C2D2D]">
                  {lang === "hi"
                    ? `चंद्र ${RASHI.hi[moon]} में — आपकी राशि से ${ordinal(lang, house)}`
                    : lang === "kn"
                      ? `ಚಂದ್ರ ${RASHI.kn[moon]} ರಾಶಿಯಲ್ಲಿ — ನಿಮ್ಮ ರಾಶಿಯಿಂದ ${ordinal(lang, house)} ಸ್ಥಾನ`
                      : `Moon in ${RASHI.en[moon]} — the ${ordinal(lang, house)} from your rashi`}
                </p>
                <p className="mt-4 text-[16.5px] leading-[1.7] text-[#1A0F0A]">{MOON_HOUSE_TEXT[house - 1][lang]}</p>
                <p className="mt-3 text-[13.5px] text-[#5A4A3D] tabular">{lang === "en" ? `${T.until[lang]} ${leaves}` : `${leaves} ${T.until[lang]}`}</p>
              </>
            ) : (
              !failed && (
                <div className="mt-4 space-y-3 animate-pulse" aria-hidden>
                  <div className="h-5 w-2/3 bg-[#F1E8DA]" />
                  <div className="h-4 w-full bg-[#F5EEE3]" />
                  <div className="h-4 w-5/6 bg-[#F5EEE3]" />
                </div>
              )
            )}
            <Link href="/horoscope" className="mt-5 inline-flex items-center gap-1.5 min-h-[44px] text-[14.5px] font-semibold text-[#7C2D2D] underline underline-offset-4 decoration-[#C9A86A] hover:decoration-[#7C2D2D]">
              {T.full[lang]} <ArrowRight className="w-4 h-4" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
