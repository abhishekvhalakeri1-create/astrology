"use client";
import Link from "next/link";
import { ArrowRight, MessageCircle, Phone, Star } from "lucide-react";
import { round2 } from "@/components/astro/ui";
import { DEFAULT_WHATSAPP_MESSAGE, PHONE_DISPLAY, TEL_HREF, asset, whatsappHref } from "@/lib/site";
import type { Lang } from "@/lib/astro/names";
import { useLang } from "@/lib/useLang";
import { HOME } from "./copy";

/** The ring of a zodiac dial: 108 ticks, a long one at each of the twelve rashi boundaries. */
function Dial({ className }: { className?: string }) {
  const ticks = Array.from({ length: 108 }, (_, i) => {
    const a = (i * 2 * Math.PI) / 108;
    const inner = i % 9 === 0 ? 89.5 : 93.5;
    return { x1: round2(100 + inner * Math.cos(a)), y1: round2(100 + inner * Math.sin(a)), x2: round2(100 + 96.5 * Math.cos(a)), y2: round2(100 + 96.5 * Math.sin(a)) };
  });
  const beads = Array.from({ length: 12 }, (_, i) => {
    const a = ((i + 0.5) * 2 * Math.PI) / 12;
    return { cx: round2(100 + 86 * Math.cos(a)), cy: round2(100 + 86 * Math.sin(a)) };
  });
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="0.45">
      <circle cx="100" cy="100" r="99.4" />
      <circle cx="100" cy="100" r="96.5" />
      <circle cx="100" cy="100" r="82.5" />
      {ticks.map((t, i) => (
        <line key={i} {...t} />
      ))}
      {beads.map((b, i) => (
        <circle key={i} cx={b.cx} cy={b.cy} r="0.9" fill="currentColor" stroke="none" />
      ))}
    </svg>
  );
}

/** Latin display type can be set large and tight; Devanagari and Kannada need room above and below the line. */
const HEADLINE_SIZE: Record<Lang, string> = {
  en: "text-[44px] sm:text-[56px] lg:text-[72px] xl:text-[80px] !leading-[0.98] !tracking-[-0.035em]",
  hi: "text-[36px] sm:text-[48px] lg:text-[58px] !leading-[1.3]",
  kn: "text-[31px] sm:text-[42px] lg:text-[50px] !leading-[1.38]",
};

export function Hero() {
  const lang = useLang();
  return (
    <section className="paper border-b border-[#E8DDD0] overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-4 lg:px-8 pt-7 pb-10 lg:pt-16 lg:pb-20">
        <div className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-7 lg:grid-cols-[1.08fr_0.92fr] lg:gap-x-16 lg:gap-y-6">
          {/* Portrait: a small medallion beside the name on phones, the centre of the dial on wide screens. */}
          <div className="col-start-1 row-start-1 lg:col-start-2 lg:row-start-1 lg:justify-self-center lg:self-end">
            <div className="relative w-[92px] h-[92px] lg:w-[430px] lg:h-[430px] xl:w-[470px] xl:h-[470px]">
              <Dial className="hidden lg:block absolute inset-0 w-full h-full text-[#B8935A] animate-spin-slow" />
              <div className="absolute inset-0 lg:inset-[9.5%] rounded-full overflow-hidden bg-[#E8DDD0] ring-1 ring-[#C9A86A] ring-offset-[3px] ring-offset-[#FFFEFB] lg:ring-0 lg:ring-offset-0 lg:shadow-[0_24px_60px_-24px_rgba(26,15,10,0.45)]">
                <img
                  src={asset("/rajeshwari-portrait.webp")}
                  srcSet={`${asset("/rajeshwari-portrait-small.webp")} 176w, ${asset("/rajeshwari-portrait.webp")} 880w`}
                  sizes="(min-width: 1024px) 400px, 92px"
                  alt={`${HOME.name[lang]} — ${HOME.nameplate[lang]}`}
                  width={880}
                  height={880}
                  className="w-full h-full object-cover"
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                />
              </div>
            </div>
          </div>

          <div className="col-start-2 row-start-1 min-w-0 lg:col-start-2 lg:row-start-2 lg:justify-self-center lg:text-center lg:self-start">
            <div className="font-serif text-[24px] lg:text-[30px] leading-[1.15]">{HOME.name[lang]}</div>
            <div className="mt-0.5 text-[13.5px] lg:text-[14.5px] text-[#5A4A3D]">{HOME.nameplate[lang]}</div>
            <div className="mt-2 inline-flex items-center gap-2 text-[12.5px] lg:text-[13px] font-semibold text-[#1F6B43]">
              <span className="relative flex w-2 h-2" aria-hidden>
                <span className="absolute inset-0 rounded-full bg-[#1F6B43] opacity-40 animate-ping" />
                <span className="relative w-2 h-2 rounded-full bg-[#1F6B43]" />
              </span>
              {HOME.available[lang]}
            </div>
          </div>

          <div className="col-span-2 row-start-2 lg:col-span-1 lg:col-start-1 lg:row-start-1 lg:row-span-2 lg:self-center">
            <div className="eyebrow">
              {HOME.eyebrow[lang]}
              <span className="hidden sm:inline"> • {HOME.eyebrowSince[lang]}</span>
            </div>

            <h1 className={`mt-4 lg:mt-6 font-serif text-[#1A0F0A] ${HEADLINE_SIZE[lang]}`}>
              <span className="block">{HOME.headline1[lang]}</span>
              <span className="block">{HOME.headline2[lang]}</span>
              <span className={`block text-[#7C2D2D] ${lang === "en" ? "italic font-medium" : ""}`}>{HOME.headline3[lang]}</span>
            </h1>

            <div className="mt-6 lg:mt-8 max-w-[520px] border-l-2 border-[#C9A86A] pl-4 lg:pl-5">
              <p className="text-[16.5px] lg:text-[18px] leading-[1.6] text-[#2C1810]">{HOME.intro1[lang]}</p>
              <p className="mt-2.5 text-[14.5px] lg:text-[15.5px] leading-[1.6] text-[#5A4A3D]">{HOME.intro2[lang]}</p>
            </div>

            <div className="mt-7 lg:mt-9 flex flex-col sm:flex-row gap-3">
              <a href={whatsappHref(DEFAULT_WHATSAPP_MESSAGE)} target="_blank" rel="noopener noreferrer" className="btn btn-maroon !min-h-[54px] !text-[15.5px] sm:!px-7">
                <MessageCircle className="w-[18px] h-[18px]" aria-hidden /> {HOME.book[lang]}
              </a>
              <Link href="/birth-chart" className="btn btn-outline !min-h-[54px] !text-[15.5px] sm:!px-7">
                {HOME.freeKundli[lang]} <ArrowRight className="w-[18px] h-[18px]" aria-hidden />
              </Link>
            </div>
            <a href={TEL_HREF} className="mt-4 inline-flex items-center gap-2 text-[14.5px] text-[#3D2F26] hover:text-[#7C2D2D]">
              <Phone className="w-4 h-4 text-[#8A6A2F]" aria-hidden />
              <span>
                {HOME.call[lang]} <span className="font-semibold tabular underline underline-offset-4 decoration-[#C9A86A]">{PHONE_DISPLAY}</span>
              </span>
            </a>

            <dl className="mt-8 lg:mt-12 grid grid-cols-3 gap-4 max-w-[480px] pt-6 border-t border-[#E8DDD0]">
              <div>
                <dd className="font-serif text-[30px] lg:text-[38px] !leading-none tabular">15+</dd>
                <dt className="mt-1.5 text-[12px] lg:text-[13px] leading-snug text-[#5A4A3D]">{HOME.years[lang]}</dt>
              </div>
              <div>
                <dd className="font-serif text-[30px] lg:text-[38px] !leading-none tabular">5,234</dd>
                <dt className="mt-1.5 text-[12px] lg:text-[13px] leading-snug text-[#5A4A3D]">{HOME.charts[lang]}</dt>
              </div>
              <div>
                <dd className="font-serif text-[30px] lg:text-[38px] !leading-none tabular flex items-center gap-1.5">
                  4.9 <Star className="w-[18px] h-[18px] lg:w-[22px] lg:h-[22px] fill-[#C9A86A] text-[#C9A86A]" aria-hidden />
                </dd>
                <dt className="mt-1.5 text-[12px] lg:text-[13px] leading-snug text-[#5A4A3D]">{HOME.reviewsLabel[lang]}</dt>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
