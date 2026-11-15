"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ToolIcon } from "@/components/astro/ui";
import { TOOLS } from "@/lib/nav";
import { useLang } from "@/lib/useLang";
import { HOME } from "./copy";

export function ToolsGrid() {
  const lang = useLang();
  return (
    <section id="tools" className="max-w-[1280px] mx-auto px-4 lg:px-8 py-12 lg:py-20">
      <div className="max-w-[720px]">
        <div className="eyebrow">{HOME.toolsEyebrow[lang]}</div>
        <h2 className="mt-3 font-serif text-[32px] lg:text-[46px] text-[#1A0F0A]">{HOME.toolsTitle[lang]}</h2>
        <p className="mt-4 text-[16px] lg:text-[17px] leading-[1.65] text-[#3D2F26]">{HOME.toolsIntro[lang]}</p>
      </div>

      <ul className="mt-8 lg:mt-12 grid gap-px bg-[#E8DDD0] border border-[#E8DDD0] sm:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map((tool) => (
          <li key={tool.href} className="bg-white">
            <Link href={tool.href} className="group flex items-center gap-4 p-4 sm:items-start sm:flex-col sm:gap-0 sm:p-6 lg:p-8 h-full transition-colors hover:bg-[#FFFBF2] focus-visible:bg-[#FFFBF2]">
              <span className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center border border-[#E8DDD0] bg-[#FBF5EA] text-[#7C2D2D] transition-colors group-hover:border-[#C9A86A] group-hover:bg-white">
                <ToolIcon href={tool.href} className="w-8 h-8 sm:w-9 sm:h-9" />
              </span>
              <span className="min-w-0 flex-1 sm:mt-6">
                <span className="block font-serif text-[22px] sm:text-[26px] text-[#1A0F0A]">{tool.label[lang]}</span>
                <span className="mt-1 sm:mt-2 block text-[14px] sm:text-[15px] leading-[1.55] text-[#5A4A3D]">{tool.blurb[lang]}</span>
              </span>
              <span className="shrink-0 sm:mt-6 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[#7C2D2D]">
                <span className="hidden sm:inline">{HOME.open[lang]}</span>
                <ArrowRight className="w-[18px] h-[18px] transition-transform group-hover:translate-x-1" aria-hidden />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
