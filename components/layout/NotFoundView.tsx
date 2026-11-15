"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ToolIcon } from "@/components/astro/ui";
import type { Tri } from "@/lib/astro/names";
import { JOURNAL_LINK, TOOLS } from "@/lib/nav";
import { useLang } from "@/lib/useLang";

const T = {
  eyebrow: { en: "Page not found", hi: "पृष्ठ नहीं मिला", kn: "ಪುಟ ಸಿಗಲಿಲ್ಲ" },
  title: { en: "This page is not here", hi: "यह पृष्ठ यहाँ नहीं है", kn: "ಈ ಪುಟ ಇಲ್ಲಿ ಇಲ್ಲ" },
  body: {
    en: "The address may be mistyped, or the page may have moved. These are the pages people usually come for.",
    hi: "हो सकता है पता ग़लत लिखा गया हो, या पृष्ठ कहीं और चला गया हो। लोग प्रायः इन पृष्ठों के लिए आते हैं।",
    kn: "ವಿಳಾಸ ತಪ್ಪಾಗಿ ಬರೆದಿರಬಹುದು, ಅಥವಾ ಪುಟ ಬೇರೆಡೆಗೆ ಹೋಗಿರಬಹುದು. ಜನರು ಸಾಮಾನ್ಯವಾಗಿ ಈ ಪುಟಗಳಿಗಾಗಿ ಬರುತ್ತಾರೆ.",
  },
  home: { en: "Go to the home page", hi: "मुख्य पृष्ठ पर जाएँ", kn: "ಮುಖಪುಟಕ್ಕೆ ಹೋಗಿ" },
} satisfies Record<string, Tri>;

export function NotFoundView() {
  const lang = useLang();
  return (
    <div className="max-w-[1280px] mx-auto px-4 lg:px-8 py-12 lg:py-20">
      <div className="max-w-[720px]">
        <div className="eyebrow">{T.eyebrow[lang]}</div>
        <h1 className="mt-3 font-serif text-[36px] sm:text-[46px] lg:text-[58px] leading-[1.05] text-[#1A0F0A]">{T.title[lang]}</h1>
        <p className="mt-4 text-[16.5px] lg:text-[18px] leading-[1.65] text-[#3D2F26]">{T.body[lang]}</p>
        <Link href="/" className="btn btn-maroon mt-7">
          {T.home[lang]} <ArrowRight className="w-4 h-4" aria-hidden />
        </Link>
      </div>

      <ul className="mt-10 lg:mt-14 grid gap-px bg-[#E8DDD0] border border-[#E8DDD0] sm:grid-cols-2 lg:grid-cols-3">
        {[...TOOLS, { ...JOURNAL_LINK, blurb: null }].map((item) => (
          <li key={item.href} className="flex bg-white">
            <Link href={item.href} className="group flex-1 flex items-center gap-4 p-5 sm:p-6 transition-colors hover:bg-[#FFFBF2]">
              <ToolIcon href={item.href} className="w-9 h-9 shrink-0 text-[#7C2D2D]" />
              <span className="flex-1 min-w-0">
                <span className="block font-serif text-[22px] leading-tight text-[#1A0F0A]">{item.label[lang]}</span>
                {item.blurb && <span className="mt-1 block text-[14px] leading-[1.5] text-[#5A4A3D]">{item.blurb[lang]}</span>}
              </span>
              <ArrowRight className="w-4 h-4 shrink-0 text-[#A68B5B] transition-transform group-hover:translate-x-1" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
