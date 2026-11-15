"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronRight, Instagram, Menu, MessageCircle, Phone, X } from "lucide-react";
import { setLang, useLang } from "@/lib/useLang";
import type { Lang, Tri } from "@/lib/astro/names";
import { ABOUT_LINK, JOURNAL_LINK, SERVICES_LINK, TOOLS } from "@/lib/nav";
import { DEFAULT_WHATSAPP_MESSAGE, INSTAGRAM_HANDLE, INSTAGRAM_URL, PHONE, TEL_HREF, asset, whatsappHref } from "@/lib/site";

const LANGUAGES: { code: Lang; label: string; name: string }[] = [
  { code: "en", label: "EN", name: "English" },
  { code: "hi", label: "हि", name: "हिन्दी" },
  { code: "kn", label: "ಕ", name: "ಕನ್ನಡ" },
];

const T = {
  since: { en: "Rajeshwari • Since 2009", hi: "राजेश्वरी • 2009 से", kn: "ರಾಜೇಶ್ವರಿ • 2009 ರಿಂದ" },
  book: { en: "Book a Reading", hi: "परामर्श लें", kn: "ಸಮಾಲೋಚನೆ" },
  call: { en: "Call", hi: "कॉल करें", kn: "ಕರೆ ಮಾಡಿ" },
  menu: { en: "Menu", hi: "मेनू", kn: "ಮೆನು" },
  close: { en: "Close menu", hi: "मेनू बंद करें", kn: "ಮೆನು ಮುಚ್ಚಿ" },
  tools: { en: "Free tools", hi: "निःशुल्क साधन", kn: "ಉಚಿತ ಸಾಧನಗಳು" },
  more: { en: "The practice", hi: "परामर्श", kn: "ಸಮಾಲೋಚನೆ" },
  hours: {
    en: "9 AM – 9 PM, all days • Pay after the consultation",
    hi: "सुबह 9 – रात 9, सभी दिन • परामर्श के बाद भुगतान",
    kn: "ಬೆಳಿಗ್ಗೆ 9 – ರಾತ್ರಿ 9, ಎಲ್ಲಾ ದಿನ • ಸಮಾಲೋಚನೆ ನಂತರ ಪಾವತಿ",
  },
} satisfies Record<string, Tri>;

export function Header() {
  // Pages are built as <name>/index.html, so the address ends in a slash that the menu entries do not carry.
  const pathname = (usePathname() ?? "/").replace(/\/+$/, "") || "/";
  const lang = useLang();
  const [open, setOpen] = useState(false);

  // Screen readers and the script-specific type rules in globals.css both follow <html lang>.
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const desktopLinks = [...TOOLS, SERVICES_LINK];

  return (
    <header className="sticky top-0 z-40 bg-[#FFFEFB]/95 backdrop-blur border-b border-[#E8DDD0] no-print">
      <div className="max-w-[1280px] mx-auto px-4 lg:px-8 h-[64px] lg:h-[72px] flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <img src={asset("/logo-icon-small.webp")} alt="" width={40} height={40} className="w-9 h-9 lg:w-10 lg:h-10 rounded-full border border-[#E8DDD0] object-cover" />
          <span className="block">
            <span className="block font-serif text-[17px] lg:text-[19px] font-bold leading-none tracking-[-0.01em]">AstroConnect</span>
            <span className="block text-[10px] tracking-[0.1em] uppercase text-[#7A6548] mt-1 leading-none">{T.since[lang]}</span>
          </span>
        </Link>

        <nav aria-label="Main" className="hidden xl:flex items-center gap-x-6 min-w-0">
          {desktopLinks.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`whitespace-nowrap text-[14px] py-2 border-b-2 transition-colors ${active ? "text-[#1A0F0A] font-semibold border-[#7C2D2D]" : "text-[#5A4A3D] border-transparent hover:text-[#1A0F0A] hover:border-[#C9A86A]"}`}
              >
                {item.label[lang]}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 lg:gap-3 shrink-0">
          <div role="group" aria-label="Language" className="flex items-center rounded-full border border-[#E8DDD0] bg-white p-0.5">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => setLang(l.code)}
                aria-pressed={lang === l.code}
                aria-label={l.name}
                title={l.name}
                className={`min-w-[38px] h-9 px-2.5 rounded-full text-[13px] font-semibold transition-colors ${lang === l.code ? "bg-[#1A0F0A] text-white" : "text-[#6B5D52] hover:text-[#1A0F0A] hover:bg-[#F5F1EB]"}`}
              >
                {l.label}
              </button>
            ))}
          </div>

          <a href={TEL_HREF} className="hidden md:inline-flex h-10 px-5 items-center justify-center gap-2 rounded-full bg-[#1A0F0A] text-white text-[13px] font-semibold hover:bg-[#3D2F26] whitespace-nowrap">
            <Phone className="w-3.5 h-3.5" aria-hidden />
            {T.book[lang]}
          </a>

          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls="site-menu"
            aria-label={open ? T.close[lang] : T.menu[lang]}
            className="xl:hidden w-11 h-11 rounded-full border border-[#E8DDD0] bg-white flex items-center justify-center hover:bg-[#F5F1EB]"
          >
            {open ? <X className="w-5 h-5" aria-hidden /> : <Menu className="w-5 h-5" aria-hidden />}
          </button>
        </div>
      </div>

      {open && (
        <div id="site-menu" className="xl:hidden border-t border-[#E8DDD0] bg-[#FFFEFB] max-h-[calc(100dvh-64px)] overflow-y-auto overscroll-contain">
          <div className="max-w-[720px] mx-auto px-4 pt-5 pb-28">
            <div className="eyebrow">{T.tools[lang]}</div>
            <nav aria-label="Free tools" className="mt-2 border-t border-[#E8DDD0]">
              {TOOLS.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="flex items-center gap-3 py-3.5 border-b border-[#E8DDD0] active:bg-[#F5F1EB]">
                  <span className="flex-1 min-w-0">
                    <span className="block text-[16px] font-semibold text-[#1A0F0A]">{item.label[lang]}</span>
                    <span className="block text-[13px] leading-snug text-[#6B5D52] mt-0.5">{item.blurb[lang]}</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-[#A68B5B] shrink-0" aria-hidden />
                </Link>
              ))}
            </nav>

            <div className="eyebrow mt-7">{T.more[lang]}</div>
            <nav aria-label="The practice" className="mt-2 grid grid-cols-3 gap-2">
              {[SERVICES_LINK, ABOUT_LINK, JOURNAL_LINK].map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="h-12 flex items-center justify-center border border-[#E8DDD0] bg-white text-[14px] font-semibold text-[#1A0F0A] active:bg-[#F5F1EB]">
                  {item.label[lang]}
                </Link>
              ))}
            </nav>

            <div className="mt-6 grid grid-cols-2 gap-2">
              <a href={TEL_HREF} className="btn btn-ink">
                <Phone className="w-4 h-4" aria-hidden /> {T.call[lang]}
              </a>
              <a href={whatsappHref(DEFAULT_WHATSAPP_MESSAGE)} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp">
                <MessageCircle className="w-4 h-4" aria-hidden /> WhatsApp
              </a>
            </div>
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="btn btn-outline w-full mt-2">
              <Instagram className="w-4 h-4" aria-hidden /> @{INSTAGRAM_HANDLE}
            </a>
            <p className="mt-4 text-center text-[13px] text-[#6B5D52]">
              {PHONE} • {T.hours[lang]}
            </p>
          </div>
        </div>
      )}
    </header>
  );
}
