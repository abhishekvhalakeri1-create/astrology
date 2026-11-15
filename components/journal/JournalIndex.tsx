"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ConsultCTA, ToolHero } from "@/components/astro/ui";
import { ARTICLES, articleHref } from "@/lib/content";
import { DEFAULT_WHATSAPP_MESSAGE } from "@/lib/site";
import { useLang } from "@/lib/useLang";
import { JOURNAL } from "./copy";

/** The journal's front page: every note, newest first, as it is listed in lib/content.ts. */
export function JournalIndex() {
  const lang = useLang();
  return (
    <>
      <ToolHero eyebrow={JOURNAL.eyebrow[lang]} title={JOURNAL.title[lang]} intro={JOURNAL.intro[lang]} />

      <div className="max-w-[1280px] mx-auto px-4 lg:px-8 py-8 lg:py-12 space-y-8 lg:space-y-10">
        <ol className="grid gap-px bg-[#E8DDD0] border border-[#E8DDD0] md:grid-cols-2">
          {ARTICLES.map((article, i) => (
            <li key={article.slug} className="flex bg-white">
              <Link href={articleHref(article)} className="group flex-1 flex gap-4 sm:gap-6 p-5 sm:p-8 lg:p-10 transition-colors hover:bg-[#FFFBF2]">
                <span className="w-8 shrink-0 font-serif text-[26px] leading-none text-[#A68B5B] tabular" aria-hidden>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex-1 min-w-0 flex flex-col">
                  <span className="eyebrow" lang="en">
                    {article.category}
                  </span>
                  <span className="mt-3 block font-serif text-[25px] sm:text-[29px] leading-[1.15] text-[#1A0F0A] group-hover:text-[#7C2D2D] transition-colors" lang="en">
                    {article.title}
                  </span>
                  <span className="mt-3 block text-[15.5px] leading-[1.65] text-[#5A4A3D]" lang="en">
                    {article.excerpt}
                  </span>
                  <span className="mt-auto pt-5 inline-flex items-center gap-1.5 text-[14.5px] font-semibold text-[#7C2D2D]">
                    {JOURNAL.read[lang]} <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden />
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ol>

        <ConsultCTA lang={lang} title={JOURNAL.ctaTitle[lang]} body={JOURNAL.ctaBody[lang]} message={DEFAULT_WHATSAPP_MESSAGE} />
      </div>
    </>
  );
}
