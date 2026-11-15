"use client";
import { Instagram, MessageCircle, Phone } from "lucide-react";
import { Chakra } from "@/components/astro/ui";
import { DEFAULT_WHATSAPP_MESSAGE, INSTAGRAM_URL, PHONE_DISPLAY, TEL_HREF, whatsappHref } from "@/lib/site";
import { useLang } from "@/lib/useLang";
import { HOME } from "./copy";

export function BookingCTA() {
  const lang = useLang();
  return (
    <section className="night text-[#FFFEFB] overflow-hidden">
      <div className="relative max-w-[1280px] mx-auto px-4 lg:px-8 py-14 lg:py-24">
        <Chakra className="pointer-events-none absolute -right-28 top-1/2 -translate-y-1/2 w-[460px] h-[460px] text-[#C9A86A] opacity-25 hidden md:block" />
        <div className="relative max-w-[760px]">
          <div className="eyebrow !text-[#C9A86A]">{HOME.ctaEyebrow[lang]}</div>
          <h2 className="mt-4 font-serif text-[36px] sm:text-[44px] lg:text-[60px] text-[#FFFEFB]">
            <span className="block">{HOME.ctaTitle1[lang]}</span>
            <span className="block text-[#E8C99A]">{HOME.ctaTitle2[lang]}</span>
          </h2>
          <p className="mt-5 text-[16.5px] lg:text-[18px] leading-[1.65] text-[#E8DDD0]/85 max-w-[600px]">{HOME.ctaDesc[lang]}</p>
          <div className="mt-8 flex flex-col sm:flex-row sm:flex-wrap gap-3">
            <a href={TEL_HREF} className="btn btn-gold !min-h-[56px] !text-[16px] sm:!px-7">
              <Phone className="w-[18px] h-[18px]" aria-hidden /> {HOME.call[lang]} <span className="tabular">{PHONE_DISPLAY}</span>
            </a>
            <a href={whatsappHref(DEFAULT_WHATSAPP_MESSAGE)} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp !min-h-[56px] !text-[16px] sm:!px-7">
              <MessageCircle className="w-[18px] h-[18px]" aria-hidden /> WhatsApp
            </a>
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="btn !min-h-[56px] !text-[16px] sm:!px-7 border border-[#C9A86A]/50 text-[#E8C99A] hover:bg-[#C9A86A] hover:text-[#1A0F0A]">
              <Instagram className="w-[18px] h-[18px]" aria-hidden /> Instagram
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
