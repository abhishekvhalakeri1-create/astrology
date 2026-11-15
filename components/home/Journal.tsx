"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ARTICLES, articleHref } from "@/lib/content";
import { useLang } from "@/lib/useLang";
import { HOME } from "./copy";

export function Journal() {
  const lang = useLang();
  const [lead, ...rest] = ARTICLES.slice(0, 3);
  return (
    <section id="journal" className="bg-white border-t border-[#E8DDD0]">
      <div className="max-w-[1280px] mx-auto px-4 lg:px-8 py-12 lg:py-20">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
          <div>
            <div className="eyebrow">{HOME.journalEyebrow[lang]}</div>
            <h2 className="mt-3 font-serif text-[32px] lg:text-[46px] text-[#1A0F0A]">{HOME.journal[lang]}</h2>
          </div>
          <Link href="/articles" className="inline-flex items-center gap-1.5 min-h-[44px] text-[14.5px] font-semibold text-[#7C2D2D] underline underline-offset-4 decoration-[#C9A86A] hover:decoration-[#7C2D2D]">
            {HOME.allArticles[lang]} <ArrowRight className="w-4 h-4" aria-hidden />
          </Link>
        </div>

        <div className="mt-8 lg:mt-12 grid gap-px bg-[#E8DDD0] border border-[#E8DDD0] lg:grid-cols-[1.25fr_1fr]" lang="en">
          <Link href={articleHref(lead)} className="group bg-[#FFFDF7] p-6 sm:p-8 lg:p-12 flex flex-col transition-colors hover:bg-[#FFFBF2]">
            <div className="eyebrow">{lead.category}</div>
            <h3 className="mt-4 font-serif text-[30px] lg:text-[44px] text-[#1A0F0A] group-hover:text-[#7C2D2D] transition-colors">{lead.title}</h3>
            <p className="mt-4 text-[16.5px] lg:text-[18px] leading-[1.65] text-[#3D2F26] max-w-[560px]">{lead.excerpt}</p>
            <ArrowRight className="mt-auto pt-6 w-6 h-12 text-[#7C2D2D] transition-transform group-hover:translate-x-1.5" aria-hidden />
          </Link>
          <div className="grid gap-px bg-[#E8DDD0]">
            {rest.map((article) => (
              <Link key={article.slug} href={articleHref(article)} className="group bg-white p-6 sm:p-8 flex flex-col justify-center transition-colors hover:bg-[#FFFBF2]">
                <div className="eyebrow">{article.category}</div>
                <h3 className="mt-3 font-serif text-[23px] lg:text-[27px] text-[#1A0F0A] group-hover:text-[#7C2D2D] transition-colors">{article.title}</h3>
                <p className="mt-2 text-[15px] leading-[1.6] text-[#5A4A3D]">{article.excerpt}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
