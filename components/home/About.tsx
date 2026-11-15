"use client";
import { MessageCircle, Phone, Star } from "lucide-react";
import { DEFAULT_WHATSAPP_MESSAGE, PHONE_DISPLAY, TEL_HREF, asset, whatsappHref } from "@/lib/site";
import { useLang } from "@/lib/useLang";
import { HOME } from "./copy";

export function About() {
  const lang = useLang();
  const facts = [
    { label: HOME.specialitiesLabel[lang], value: HOME.specialities[lang] },
    { label: HOME.languagesLabel[lang], value: HOME.languages[lang] },
    { label: HOME.whereLabel[lang], value: HOME.where[lang] },
    { label: HOME.trainingLabel[lang], value: HOME.training[lang] },
  ];
  return (
    <section id="astrologer" className="max-w-[1280px] mx-auto px-4 lg:px-8 py-12 lg:py-20 scroll-mt-20">
      <div className="frame bg-white p-5 sm:p-8 lg:p-14">
        <div className="grid gap-8 lg:grid-cols-[300px_1fr] lg:gap-14 items-start">
          <div className="flex items-center gap-5 lg:block">
            <img
              src={asset("/rajeshwari-portrait.webp")}
              srcSet={`${asset("/rajeshwari-portrait-small.webp")} 176w, ${asset("/rajeshwari-portrait.webp")} 880w`}
              sizes="(min-width: 1024px) 300px, 116px"
              alt={HOME.name[lang]}
              width={880}
              height={880}
              loading="lazy"
              decoding="async"
              className="w-[116px] h-[116px] lg:w-[300px] lg:h-[300px] shrink-0 rounded-full object-cover bg-[#E8DDD0] ring-1 ring-[#C9A86A] ring-offset-4 ring-offset-white"
            />
            <div className="lg:mt-7 lg:text-center">
              <div className="flex items-center gap-1 lg:justify-center" role="img" aria-label="4.9 / 5">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} className="w-[18px] h-[18px] fill-[#C9A86A] text-[#C9A86A]" aria-hidden />
                ))}
                <span className="ml-1.5 font-serif text-[22px] !leading-none tabular">4.9</span>
              </div>
              <div className="mt-1.5 text-[13.5px] text-[#5A4A3D]">{HOME.reviewsLabel[lang]}</div>
            </div>
          </div>

          <div>
            <div className="eyebrow">{HOME.featured[lang]}</div>
            <h2 className="mt-2 font-serif text-[40px] lg:text-[58px] text-[#1A0F0A]">{HOME.name[lang]}</h2>
            <div className="mt-1 text-[16px] lg:text-[18px] text-[#7C2D2D] font-semibold">{HOME.nameplate[lang]}</div>

            <p className="mt-6 font-serif !font-medium text-[21px] lg:text-[25px] !leading-[1.45] !tracking-[-0.01em] text-[#1A0F0A] max-w-[720px]">{HOME.bio[lang]}</p>

            <dl className="mt-8 grid gap-x-10 gap-y-5 sm:grid-cols-2 pt-7 border-t border-[#E8DDD0]">
              {facts.map((fact) => (
                <div key={fact.label}>
                  <dt className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-[#8A6A2F]">{fact.label}</dt>
                  <dd className="mt-1.5 text-[15.5px] leading-[1.6] text-[#1A0F0A]">{fact.value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <a href={whatsappHref(DEFAULT_WHATSAPP_MESSAGE)} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp !min-h-[52px]">
                <MessageCircle className="w-[18px] h-[18px]" aria-hidden /> WhatsApp
              </a>
              <a href={TEL_HREF} className="btn btn-outline !min-h-[52px]">
                <Phone className="w-[18px] h-[18px]" aria-hidden /> {HOME.call[lang]} <span className="tabular">{PHONE_DISPLAY}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
