"use client";
import { useEffect, useState, type ReactNode } from "react";
import { Lock, MessageCircle, Phone } from "lucide-react";
import type { Lang, Tri } from "@/lib/astro/names";
import { CHANDRASHTAMA, FAVOURABLE, NEEDS_CARE } from "@/lib/astro/rashiText";
import { FAVOURABLE_HOUSES } from "@/lib/astro/zodiac";
import { PHONE_DISPLAY, TEL_HREF, whatsappHref } from "@/lib/site";
import type { ChartStyle } from "./KundliChart";

/* ---------- decorative line art ---------- */

/**
 * Sines and cosines differ in their last digit between the server and a browser. Drawn coordinates are rounded
 * so that the markup the server sends is exactly what the browser would have produced.
 */
export const round2 = (n: number): number => Math.round(n * 100) / 100;

/** A twelve-spoked wheel: the zodiac as it is drawn on temple ceilings. Purely ornamental. */
export function Chakra({ className, spokes = 12 }: { className?: string; spokes?: number }) {
  const lines = Array.from({ length: spokes }, (_, i) => {
    const a = (i * 2 * Math.PI) / spokes;
    return { x1: round2(100 + 34 * Math.cos(a)), y1: round2(100 + 34 * Math.sin(a)), x2: round2(100 + 78 * Math.cos(a)), y2: round2(100 + 78 * Math.sin(a)) };
  });
  const ticks = Array.from({ length: 108 }, (_, i) => {
    const a = (i * 2 * Math.PI) / 108;
    const inner = i % 4 === 0 ? 86 : 89;
    return { x1: round2(100 + inner * Math.cos(a)), y1: round2(100 + inner * Math.sin(a)), x2: round2(100 + 92 * Math.cos(a)), y2: round2(100 + 92 * Math.sin(a)) };
  });
  const petals = Array.from({ length: spokes }, (_, i) => {
    const a = ((i + 0.5) * 2 * Math.PI) / spokes;
    return { cx: round2(100 + 56 * Math.cos(a)), cy: round2(100 + 56 * Math.sin(a)) };
  });
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="0.6">
      <circle cx="100" cy="100" r="98" />
      <circle cx="100" cy="100" r="92" />
      <circle cx="100" cy="100" r="78" />
      <circle cx="100" cy="100" r="34" />
      <circle cx="100" cy="100" r="28" strokeDasharray="1.5 3" />
      {lines.map((l, i) => (
        <line key={i} {...l} />
      ))}
      {ticks.map((l, i) => (
        <line key={`t${i}`} {...l} />
      ))}
      {petals.map((p, i) => (
        <circle key={`p${i}`} cx={p.cx} cy={p.cy} r="1.6" fill="currentColor" stroke="none" />
      ))}
    </svg>
  );
}

/** Small drawn icons for the six tools, keyed by route. */
export function ToolIcon({ href, className }: { href: string; className?: string }) {
  const common = { viewBox: "0 0 40 40", className, fill: "none", stroke: "currentColor", strokeWidth: 1.4, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  switch (href) {
    case "/birth-chart":
      return (
        <svg {...common}>
          <rect x="5" y="5" width="30" height="30" />
          <path d="M5 5l30 30M35 5L5 35M20 5l15 15-15 15L5 20z" />
        </svg>
      );
    case "/kundali-matching":
      return (
        <svg {...common}>
          <circle cx="15" cy="20" r="9.5" />
          <circle cx="25" cy="20" r="9.5" />
          <path d="M20 16.5c1.6-2 4.6-.8 4.6 1.5 0 2.4-2.6 4.2-4.6 5.6-2-1.4-4.6-3.2-4.6-5.6 0-2.3 3-3.5 4.6-1.5z" fill="currentColor" stroke="none" opacity=".85" />
        </svg>
      );
    case "/panchang":
      return (
        <svg {...common}>
          <circle cx="20" cy="20" r="6" />
          <path d="M20 5v4M20 31v4M5 20h4M31 20h4M9.4 9.4l2.8 2.8M27.8 27.8l2.8 2.8M30.6 9.4l-2.8 2.8M12.2 27.8l-2.8 2.8" />
        </svg>
      );
    case "/horoscope":
      return (
        <svg {...common}>
          <circle cx="20" cy="20" r="15" />
          <circle cx="20" cy="20" r="6.5" />
          <path d="M20 5v8.5M20 26.5V35M5 20h8.5M26.5 20H35M9.4 9.4l6 6M24.6 24.6l6 6M30.6 9.4l-6 6M15.4 24.6l-6 6" />
        </svg>
      );
    case "/articles":
      return (
        <svg {...common}>
          <path d="M9 5h17l5 5v25H9z" />
          <path d="M26 5v5h5M14 17h12M14 22h12M14 27h8" />
        </svg>
      );
    case "/dosha-check":
      return (
        <svg {...common}>
          <path d="M20 4.5l12.5 4.5v9.5c0 8-5.3 13.4-12.5 17-7.2-3.6-12.5-9-12.5-17V9z" />
          <path d="M14.5 20.5l4 4 7.5-8.5" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <rect x="5" y="5" width="30" height="30" />
          <path d="M15 5v30M25 5v30M5 15h30M5 25h30" />
          <circle cx="20" cy="20" r="1.8" fill="currentColor" stroke="none" />
          <circle cx="10" cy="10" r="1.3" fill="currentColor" stroke="none" />
          <circle cx="30" cy="30" r="1.3" fill="currentColor" stroke="none" />
        </svg>
      );
  }
}

/* ---------- page furniture ---------- */

export function ToolHero({ eyebrow, title, intro, children }: { eyebrow: string; title: string; intro: string; children?: ReactNode }) {
  return (
    <section className="wash-warm border-b border-[#E8DDD0] overflow-hidden">
      <div className="relative max-w-[1280px] mx-auto px-4 lg:px-8 pt-9 pb-9 lg:pt-14 lg:pb-14">
        <Chakra className="pointer-events-none absolute -right-24 -top-24 w-[380px] h-[380px] text-[#C9A86A] opacity-50 hidden md:block" />
        <div className="relative max-w-[720px]">
          <div className="eyebrow">{eyebrow}</div>
          <h1 className="mt-3 font-serif text-[34px] sm:text-[42px] lg:text-[54px] leading-[1.05] text-[#1A0F0A]">{title}</h1>
          <p className="mt-4 text-[16px] lg:text-[17px] leading-[1.65] text-[#3D2F26]">{intro}</p>
          {children}
        </div>
      </div>
    </section>
  );
}

export function Panel({ title, kicker, children, className = "", id }: { title?: string; kicker?: string; children: ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={`card p-5 sm:p-6 lg:p-8 ${className}`}>
      {kicker && <div className="eyebrow mb-2">{kicker}</div>}
      {title && <h2 className="font-serif text-[24px] lg:text-[28px] text-[#1A0F0A]">{title}</h2>}
      <div className={title || kicker ? "mt-5" : ""}>{children}</div>
    </section>
  );
}

export interface AsideItem {
  title: string;
  text: string;
}

/**
 * A tool's form with a short list of what the result holds beside it.
 * The list shows on wide screens only, where the form would otherwise leave half the row empty;
 * on a phone the heading above has said the same and the form should come first.
 */
export function FormWithAside({ children, title, items }: { children: ReactNode; title: string; items: readonly AsideItem[] }) {
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,720px)_minmax(0,1fr)] lg:gap-12 lg:items-start">
      {children}
      <aside className="no-print hidden lg:block pt-1">
        <div className="eyebrow">{title}</div>
        <ol className="mt-4 border-t border-[#E8DDD0]">
          {items.map((item, i) => (
            <li key={item.title} className="flex gap-4 py-4 border-b border-[#E8DDD0]">
              <span className="w-6 shrink-0 font-serif text-[22px] leading-[1.1] text-[#A68B5B] tabular" aria-hidden>
                {i + 1}
              </span>
              <div>
                <div className="text-[15.5px] font-semibold text-[#1A0F0A]">{item.title}</div>
                <p className="mt-1 text-[14px] leading-[1.6] text-[#5A4A3D]">{item.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </aside>
    </div>
  );
}

/** A label above a value, used in summary strips. */
export function Fact({ label, value, sub, tone = "light" }: { label: string; value: ReactNode; sub?: ReactNode; tone?: "light" | "dark" }) {
  return (
    <div>
      <div className={`text-[11.5px] font-semibold uppercase tracking-[0.12em] ${tone === "dark" ? "text-[#C9A86A]" : "text-[#8A6A2F]"}`}>{label}</div>
      <div className={`mt-1 font-serif text-[21px] lg:text-[24px] leading-[1.2] ${tone === "dark" ? "text-[#FFFEFB]" : "text-[#1A0F0A]"}`}>{value}</div>
      {sub && <div className={`mt-0.5 text-[13px] leading-snug ${tone === "dark" ? "text-[#E8DDD0]/75" : "text-[#6B5D52]"}`}>{sub}</div>}
    </div>
  );
}

const CTA = {
  eyebrow: { en: "Personal consultation", hi: "व्यक्तिगत परामर्श", kn: "ವೈಯಕ್ತಿಕ ಸಮಾಲೋಚನೆ" },
  whatsapp: { en: "Send on WhatsApp", hi: "WhatsApp पर भेजें", kn: "WhatsApp ನಲ್ಲಿ ಕಳುಹಿಸಿ" },
  call: { en: "Call", hi: "कॉल करें", kn: "ಕರೆ ಮಾಡಿ" },
  terms: {
    en: "9 AM – 9 PM, all days • Kannada, Hindi, English, Telugu • Pay after the consultation",
    hi: "सुबह 9 – रात 9, सभी दिन • कन्नड़, हिंदी, अंग्रेज़ी, तेलुगु • परामर्श के बाद भुगतान",
    kn: "ಬೆಳಿಗ್ಗೆ 9 – ರಾತ್ರಿ 9, ಎಲ್ಲಾ ದಿನ • ಕನ್ನಡ, ಹಿಂದಿ, ಇಂಗ್ಲಿಷ್, ತೆಲುಗು • ಸಮಾಲೋಚನೆ ನಂತರ ಪಾವತಿ",
  },
} satisfies Record<string, Tri>;

/** The hand-over from a calculator to Rajeshwari: WhatsApp opens with the result already written out. */
export function ConsultCTA({ lang, title, body, message, price }: { lang: Lang; title: string; body: string; message: string; price?: string }) {
  return (
    <section className="night text-[#FFFEFB] p-6 sm:p-8 lg:p-10 no-print">
      <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="max-w-[640px]">
          <div className="eyebrow !text-[#C9A86A]">
            {CTA.eyebrow[lang]}
            {price ? ` • ${price}` : ""}
          </div>
          <h2 className="mt-3 font-serif text-[26px] lg:text-[32px] text-[#FFFEFB]">{title}</h2>
          <p className="mt-3 text-[15px] leading-[1.65] text-[#E8DDD0]/85">{body}</p>
          <p className="mt-4 text-[13px] leading-[1.5] text-[#E8DDD0]/60">{CTA.terms[lang]}</p>
        </div>
        <div className="flex flex-col gap-2.5 sm:flex-row lg:flex-col lg:min-w-[250px]">
          <a href={whatsappHref(message)} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp">
            <MessageCircle className="w-4 h-4" aria-hidden /> {CTA.whatsapp[lang]}
          </a>
          <a href={TEL_HREF} className="btn btn-gold">
            <Phone className="w-4 h-4" aria-hidden /> {CTA.call[lang]} <span className="tabular">{PHONE_DISPLAY}</span>
          </a>
        </div>
      </div>
    </section>
  );
}

const PRIVACY: Tri = {
  en: "Calculated on your own phone or computer. Your birth details are not sent anywhere; this browser remembers them so you do not have to type them again.",
  hi: "गणना आपके अपने फ़ोन या कंप्यूटर पर होती है। जन्म विवरण कहीं नहीं भेजा जाता; यह ब्राउज़र उसे याद रखता है ताकि दोबारा लिखना न पड़े।",
  kn: "ಲೆಕ್ಕಾಚಾರ ನಿಮ್ಮ ಫೋನ್ ಅಥವಾ ಕಂಪ್ಯೂಟರ್‌ನಲ್ಲೇ ನಡೆಯುತ್ತದೆ. ಜನ್ಮ ವಿವರ ಎಲ್ಲಿಗೂ ಕಳುಹಿಸುವುದಿಲ್ಲ; ಮತ್ತೆ ಬರೆಯಬೇಕಾಗದಂತೆ ಈ ಬ್ರೌಸರ್ ಅದನ್ನು ನೆನಪಿಟ್ಟುಕೊಳ್ಳುತ್ತದೆ.",
};

export function PrivacyNote({ lang, className = "" }: { lang: Lang; className?: string }) {
  return (
    <p className={`flex items-start gap-2 text-[12.5px] leading-[1.55] text-[#6B5D52] ${className}`}>
      <Lock className="w-3.5 h-3.5 mt-[3px] shrink-0 text-[#A68B5B]" aria-hidden />
      <span>{PRIVACY[lang]}</span>
    </p>
  );
}

/** How the Moon's place sits with a rashi today: favourable, a day to go gently, or Chandrashtama (the 8th). */
export function MoonTone({ house, lang }: { house: number; lang: Lang }) {
  const badge = "inline-flex items-center px-2.5 py-1 text-[12.5px] font-semibold";
  if (house === 8) return <span className={`${badge} bg-[#FBEAEA] text-[#9B2C2C]`}>{CHANDRASHTAMA[lang]}</span>;
  return FAVOURABLE_HOUSES.Moon.includes(house) ? <span className={`${badge} bg-[#E8F3EC] text-[#1F6B43]`}>{FAVOURABLE[lang]}</span> : <span className={`${badge} bg-[#FBF1DC] text-[#8A5A0B]`}>{NEEDS_CARE[lang]}</span>;
}

/* ---------- North / South chart preference ---------- */

const STYLE_KEY = "astroconnect-chart-style";
const STYLE_LABEL: Record<ChartStyle, Tri> = {
  north: { en: "North Indian", hi: "उत्तर भारतीय", kn: "ಉತ್ತರ ಭಾರತೀಯ" },
  south: { en: "South Indian", hi: "दक्षिण भारतीय", kn: "ದಕ್ಷಿಣ ಭಾರತೀಯ" },
};

/** The chart style, remembered in this browser. North Indian is how Rajeshwari draws her charts; many families in Karnataka know the South Indian form. */
export function useChartStyle(): [ChartStyle, (s: ChartStyle) => void] {
  const [style, setStyle] = useState<ChartStyle>("north");
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STYLE_KEY);
      if (saved === "north" || saved === "south") setStyle(saved);
    } catch {
      /* storage unavailable: keep the default */
    }
  }, []);
  const update = (next: ChartStyle) => {
    setStyle(next);
    try {
      window.localStorage.setItem(STYLE_KEY, next);
    } catch {
      /* not remembered, nothing else to do */
    }
  };
  return [style, update];
}

export function ChartStyleToggle({ style, onChange, lang }: { style: ChartStyle; onChange: (s: ChartStyle) => void; lang: Lang }) {
  return (
    <div role="group" aria-label="Chart style" className="inline-flex border border-[#D4C4B0] bg-white p-0.5">
      {(["north", "south"] as const).map((s) => (
        <button key={s} type="button" aria-pressed={style === s} onClick={() => onChange(s)} className={`h-10 px-3.5 text-[13px] font-semibold transition-colors ${style === s ? "bg-[#1A0F0A] text-white" : "text-[#5A4A3D] hover:bg-[#F5F1EB]"}`}>
          {STYLE_LABEL[s][lang]}
        </button>
      ))}
    </div>
  );
}
