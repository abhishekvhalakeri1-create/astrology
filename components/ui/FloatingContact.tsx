"use client";
import { useEffect, useRef, useState } from "react";
import { Instagram, MessageCircle, Phone, X } from "lucide-react";
import type { Tri } from "@/lib/astro/names";
import { DEFAULT_WHATSAPP_MESSAGE, INSTAGRAM_HANDLE, INSTAGRAM_URL, PHONE_DISPLAY, TEL_HREF, whatsappHref } from "@/lib/site";
import { useLang } from "@/lib/useLang";

const T = {
  call: { en: "Call", hi: "कॉल करें", kn: "ಕರೆ ಮಾಡಿ" },
  contact: { en: "Contact Rajeshwari", hi: "राजेश्वरी से संपर्क करें", kn: "ರಾಜೇಶ್ವರಿ ಅವರನ್ನು ಸಂಪರ್ಕಿಸಿ" },
  personal: { en: "Her personal number, not a call centre", hi: "उनका निजी नंबर, कोई कॉल सेंटर नहीं", kn: "ಅವರ ವೈಯಕ್ತಿಕ ಸಂಖ್ಯೆ, ಕಾಲ್ ಸೆಂಟರ್ ಅಲ್ಲ" },
  hours: { en: "9 AM – 9 PM, all days", hi: "सुबह 9 – रात 9, सभी दिन", kn: "ಬೆಳಿಗ್ಗೆ 9 – ರಾತ್ರಿ 9, ಎಲ್ಲಾ ದಿನ" },
  whatsappSub: { en: "Send your birth details", hi: "अपना जन्म विवरण भेजें", kn: "ನಿಮ್ಮ ಜನ್ಮ ವಿವರ ಕಳುಹಿಸಿ" },
  foot: {
    en: "Jayanagar, Bangalore • Kannada, Hindi, English, Telugu • Pay after the consultation, by UPI",
    hi: "जयनगर, बैंगलोर • कन्नड़, हिंदी, अंग्रेज़ी, तेलुगु • परामर्श के बाद UPI से भुगतान",
    kn: "ಜಯನಗರ, ಬೆಂಗಳೂರು • ಕನ್ನಡ, ಹಿಂದಿ, ಇಂಗ್ಲಿಷ್, ತೆಲುಗು • ಸಮಾಲೋಚನೆ ನಂತರ UPI ಮೂಲಕ ಪಾವತಿ",
  },
  options: { en: "Contact options", hi: "संपर्क के विकल्प", kn: "ಸಂಪರ್ಕ ಆಯ್ಕೆಗಳು" },
  close: { en: "Close", hi: "बंद करें", kn: "ಮುಚ್ಚಿ" },
  whatsappLabel: { en: "Message Rajeshwari on WhatsApp", hi: "राजेश्वरी को WhatsApp पर संदेश भेजें", kn: "ರಾಜೇಶ್ವರಿ ಅವರಿಗೆ WhatsApp ಸಂದೇಶ ಕಳುಹಿಸಿ" },
} satisfies Record<string, Tri>;

/**
 * The always-present way to reach Rajeshwari: a three-button bar along the bottom of a phone screen,
 * and two round buttons in the corner of a wide one.
 */
export function FloatingContact() {
  const lang = useLang();
  const [open, setOpen] = useState(false);
  const corner = useRef<HTMLDivElement>(null);
  const whatsapp = whatsappHref(DEFAULT_WHATSAPP_MESSAGE);

  // The desktop card closes on Escape and on a click anywhere outside it.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onDown = (e: MouseEvent) => {
      if (corner.current && !corner.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [open]);

  return (
    <>
      {/* Wide screens: two round buttons in the corner */}
      <div ref={corner} className="hidden lg:flex fixed bottom-6 right-6 z-[60] flex-col items-end gap-3 no-print">
        {open && (
          <div className="w-[320px] bg-white border border-[#D4C4B0] p-5 shadow-[0_18px_48px_rgba(26,15,10,0.18)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-serif text-[20px] leading-tight text-[#1A0F0A]">{T.contact[lang]}</div>
                <div className="mt-1 text-[13px] leading-[1.5] text-[#6B5D52]">{T.personal[lang]}</div>
              </div>
              <button type="button" aria-label={T.close[lang]} onClick={() => setOpen(false)} className="w-9 h-9 shrink-0 flex items-center justify-center border border-[#E8DDD0] hover:border-[#1A0F0A]">
                <X className="w-4 h-4" aria-hidden />
              </button>
            </div>

            <div className="mt-4 space-y-2">
              <a href={TEL_HREF} className="flex items-center gap-3 min-h-[56px] px-4 bg-[#1A0F0A] text-white hover:bg-black">
                <Phone className="w-[18px] h-[18px] shrink-0" aria-hidden />
                <span>
                  <span className="block text-[14.5px] font-semibold tabular">
                    {T.call[lang]} {PHONE_DISPLAY}
                  </span>
                  <span className="block text-[12.5px] text-white/70">{T.hours[lang]}</span>
                </span>
              </a>
              <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 min-h-[56px] px-4 bg-[#0F7F43] text-white hover:bg-[#0B6635]">
                <MessageCircle className="w-[18px] h-[18px] shrink-0" aria-hidden />
                <span>
                  <span className="block text-[14.5px] font-semibold">WhatsApp</span>
                  <span className="block text-[12.5px] text-white/80">{T.whatsappSub[lang]}</span>
                </span>
              </a>
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 min-h-[52px] px-4 border border-[#D4C4B0] bg-white hover:border-[#1A0F0A]">
                <Instagram className="w-[18px] h-[18px] shrink-0" aria-hidden />
                <span>
                  <span className="block text-[14.5px] font-semibold">Instagram</span>
                  <span className="block text-[12.5px] text-[#6B5D52]">@{INSTAGRAM_HANDLE}</span>
                </span>
              </a>
            </div>

            <p className="mt-4 pt-4 border-t border-[#EFE6D8] text-[12.5px] leading-[1.6] text-[#6B5D52]">{T.foot[lang]}</p>
          </div>
        )}

        <div className="flex gap-2">
          <a href={whatsapp} target="_blank" rel="noopener noreferrer" aria-label={T.whatsappLabel[lang]} className="w-12 h-12 rounded-full bg-[#0F7F43] text-white flex items-center justify-center shadow-[0_6px_18px_rgba(26,15,10,0.22)] hover:bg-[#0B6635]">
            <MessageCircle className="w-[22px] h-[22px]" aria-hidden />
          </a>
          <button
            type="button"
            aria-label={open ? T.close[lang] : T.options[lang]}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            className="w-12 h-12 rounded-full bg-[#1A0F0A] text-white flex items-center justify-center shadow-[0_6px_18px_rgba(26,15,10,0.22)] hover:bg-black"
          >
            {open ? <X className="w-[22px] h-[22px]" aria-hidden /> : <Phone className="w-[22px] h-[22px]" aria-hidden />}
          </button>
        </div>
      </div>

      {/* Phones: a bar along the bottom edge */}
      <nav aria-label={T.contact[lang]} className="lg:hidden fixed bottom-0 inset-x-0 z-[70] no-print bg-white border-t border-[#E8DDD0] shadow-[0_-2px_16px_rgba(26,15,10,0.08)] pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-3 h-[60px]">
          <a href={TEL_HREF} className="flex flex-col items-center justify-center gap-1 text-[#1A0F0A] active:bg-[#F5F1EB]">
            <Phone className="w-5 h-5" aria-hidden />
            <span className="text-[12.5px] font-semibold leading-none">{T.call[lang]}</span>
          </a>
          <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center gap-1 bg-[#0F7F43] text-white active:bg-[#0B6635]">
            <MessageCircle className="w-5 h-5" aria-hidden />
            <span className="text-[12.5px] font-semibold leading-none">WhatsApp</span>
          </a>
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center gap-1 text-[#1A0F0A] active:bg-[#F5F1EB]">
            <Instagram className="w-5 h-5" aria-hidden />
            <span className="text-[12.5px] font-semibold leading-none">Instagram</span>
          </a>
        </div>
      </nav>

      {/* Keeps the end of the page clear of the bar */}
      <div className="lg:hidden h-[60px] no-print" aria-hidden />
    </>
  );
}
