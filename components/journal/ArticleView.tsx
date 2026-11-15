"use client";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ConsultCTA, ToolIcon } from "@/components/astro/ui";
import { ARTICLES, articleHref, findArticle } from "@/lib/content";
import { TOOLS } from "@/lib/nav";
import { SERVICES, asset, formatRupees } from "@/lib/site";
import { useLang } from "@/lib/useLang";
import { JOURNAL } from "./copy";

/** One journal note, with the free tool and the consultation it leads to. */
export function ArticleView({ slug }: { slug: string }) {
  const lang = useLang();
  const article = findArticle(slug);
  if (!article) return null; // the page file only builds pages for notes that exist

  const paragraphs = article.body.split(/\n\s*\n/).filter(Boolean);
  const tool = TOOLS.find((t) => t.href === article.tool);
  const service = SERVICES.find((s) => s.id === article.service);
  // The next three notes in the list, wrapping round to the start.
  const at = ARTICLES.indexOf(article);
  const more = [1, 2, 3].map((step) => ARTICLES[(at + step) % ARTICLES.length]).filter((a) => a !== article);

  return (
    <article>
      <header className="wash-warm border-b border-[#E8DDD0]">
        <div className="max-w-[1280px] mx-auto px-4 lg:px-8 pt-5 pb-9 lg:pt-8 lg:pb-14">
          <Link href="/articles" className="no-print inline-flex items-center gap-1.5 min-h-[44px] text-[14.5px] font-semibold text-[#7C2D2D] underline underline-offset-4 decoration-[#C9A86A] hover:decoration-[#7C2D2D]">
            <ArrowLeft className="w-4 h-4" aria-hidden /> {JOURNAL.all[lang]}
          </Link>
          <div className="mt-4 max-w-[860px]" lang="en">
            <div className="eyebrow">{article.category}</div>
            <h1 className="mt-3 font-serif text-[34px] sm:text-[44px] lg:text-[58px] leading-[1.05] text-[#1A0F0A]">{article.title}</h1>
            <p className="mt-4 lg:mt-5 text-[18px] lg:text-[21px] leading-[1.55] text-[#3D2F26] max-w-[720px]">{article.excerpt}</p>
          </div>
        </div>
      </header>

      <div className="max-w-[1280px] mx-auto px-4 lg:px-8 py-9 lg:py-14 space-y-10 lg:space-y-14">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,720px)_minmax(0,1fr)] lg:gap-16 lg:items-start">
          <div>
            <div lang="en" className="space-y-5 text-[18px] lg:text-[19.5px] leading-[1.8] text-[#2C1810]">
              {paragraphs.map((text, i) => (
                <p key={i} className={i === 0 ? "first-letter:float-left first-letter:mr-2.5 first-letter:mt-1 first-letter:font-serif first-letter:text-[4.1em] first-letter:leading-[0.8] first-letter:text-[#7C2D2D]" : undefined}>
                  {text}
                </p>
              ))}
            </div>

            <div className="mt-9 pt-6 border-t border-[#E8DDD0] flex items-center gap-4">
              <img src={asset("/rajeshwari-portrait-small.webp")} alt="" width={176} height={176} loading="lazy" decoding="async" className="w-14 h-14 rounded-full object-cover bg-[#E8DDD0] ring-1 ring-[#C9A86A] ring-offset-2 ring-offset-[#FFFEFB]" />
              <div>
                <div className="font-serif text-[21px] leading-tight text-[#1A0F0A]">{JOURNAL.name[lang]}</div>
                <div className="mt-0.5 text-[13.5px] text-[#6B5D52]">{JOURNAL.credentials[lang]}</div>
              </div>
            </div>
            <p className="mt-6 text-[13px] leading-[1.6] text-[#6B5D52]">{JOURNAL.disclaimer[lang]}</p>
          </div>

          <aside className="no-print space-y-8 lg:sticky lg:top-28">
            {tool && (
              <Link href={tool.href} className="group block border border-[#D4C4B0] bg-[#FFFDF7] p-5 sm:p-6 transition-colors hover:border-[#7C2D2D]">
                <div className="eyebrow">{JOURNAL.toolEyebrow[lang]}</div>
                <div className="mt-4 flex items-start gap-4">
                  <ToolIcon href={tool.href} className="w-10 h-10 shrink-0 text-[#7C2D2D]" />
                  <div>
                    <div className="font-serif text-[25px] leading-tight text-[#1A0F0A]">{tool.label[lang]}</div>
                    <p className="mt-1.5 text-[14.5px] leading-[1.6] text-[#5A4A3D]">{tool.blurb[lang]}</p>
                  </div>
                </div>
                <div className="mt-5 inline-flex items-center gap-1.5 text-[14.5px] font-semibold text-[#7C2D2D]">
                  {JOURNAL.openTool[lang]} <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden />
                </div>
              </Link>
            )}

            <nav aria-label={JOURNAL.more[lang]}>
              <div className="eyebrow">{JOURNAL.more[lang]}</div>
              <ul className="mt-3 border-t border-[#E8DDD0]" lang="en">
                {more.map((other) => (
                  <li key={other.slug} className="border-b border-[#E8DDD0]">
                    <Link href={articleHref(other)} className="group flex items-center gap-3 py-4">
                      <span className="flex-1 min-w-0">
                        <span className="block text-[11.5px] font-semibold uppercase tracking-[0.12em] text-[#8A6A2F]">{other.category}</span>
                        <span className="mt-1 block font-serif text-[20px] leading-[1.2] text-[#1A0F0A] group-hover:text-[#7C2D2D] transition-colors">{other.title}</span>
                      </span>
                      <ArrowRight className="w-4 h-4 shrink-0 text-[#A68B5B] transition-transform group-hover:translate-x-1" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
        </div>

        <ConsultCTA
          lang={lang}
          title={JOURNAL.ctaTitle[lang]}
          body={JOURNAL.ctaBody[lang]}
          message={`Namaste Rajeshwari madam, I read your note "${article.title}" and would like a consultation.`}
          price={service ? `${formatRupees(service.price)} • ${service.minutes} min` : undefined}
        />
      </div>
    </article>
  );
}
