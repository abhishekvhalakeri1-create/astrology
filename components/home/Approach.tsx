"use client";
import { Check } from "lucide-react";
import { useLang } from "@/lib/useLang";
import { HOME } from "./copy";

export function Approach() {
  const lang = useLang();
  return (
    <section className="border-y border-[#E8DDD0] bg-white">
      <div className="max-w-[1280px] mx-auto px-4 lg:px-8 py-12 lg:py-24">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <div>
            <div className="eyebrow">{HOME.approach[lang]}</div>
            <h2 className="mt-3 lg:mt-5 font-serif text-[34px] lg:text-[50px] text-[#1A0F0A]">
              <span className="block">{HOME.ancient1[lang]}</span>
              <span className={`block text-[#7C2D2D] ${lang === "en" ? "italic font-medium" : ""}`}>{HOME.ancient2[lang]}</span>
            </h2>
            <div className="mt-6 lg:mt-8 w-16 h-px bg-[#C9A86A]" />
          </div>
          <div className="max-w-[620px]">
            <p className="font-serif !font-medium text-[22px] lg:text-[26px] !leading-[1.4] !tracking-[-0.01em] text-[#1A0F0A]">{HOME.approachP1[lang]}</p>
            <p className="mt-5 text-[16px] lg:text-[17px] leading-[1.7] text-[#3D2F26]">{HOME.approachP2[lang]}</p>
            <p className="mt-4 text-[16px] lg:text-[17px] leading-[1.7] text-[#3D2F26]">{HOME.approachP3[lang]}</p>
          </div>
        </div>

        <ul className="mt-10 lg:mt-16 grid grid-cols-2 lg:grid-cols-4 gap-px bg-[#E8DDD0] border border-[#E8DDD0]">
          {HOME.promises[lang].split("|").map((promise) => (
            <li key={promise} className="bg-[#FFFDF7] px-4 py-4 lg:px-6 lg:py-5 flex items-start gap-2.5 text-[14.5px] lg:text-[15.5px] font-semibold leading-snug text-[#1A0F0A]">
              <Check className="w-[18px] h-[18px] mt-[2px] shrink-0 text-[#1F6B43]" strokeWidth={2.4} aria-hidden />
              {promise}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
