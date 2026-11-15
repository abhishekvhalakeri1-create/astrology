"use client";
import Link from "next/link";
import { Instagram, MessageCircle, Phone } from "lucide-react";
import { useLang, useThisYear } from "@/lib/useLang";
import type { Tri } from "@/lib/astro/names";
import { ABOUT_LINK, JOURNAL_LINK, SERVICES_LINK, TOOLS } from "@/lib/nav";
import { DEFAULT_WHATSAPP_MESSAGE, INSTAGRAM_HANDLE, INSTAGRAM_URL, PHONE_DISPLAY, TEL_HREF, asset, whatsappHref } from "@/lib/site";

const T = {
  about: {
    en: "Rajeshwari, Jyotish Acharya (Kashi). Fifteen years reading charts by hand in Jayanagar, Bangalore. Direct consultation — no call centre, no middleman.",
    hi: "राजेश्वरी, ज्योतिष आचार्य (काशी)। जयनगर, बैंगलोर में पंद्रह वर्षों से हाथ से कुंडली देख रही हैं। सीधा परामर्श — कोई कॉल सेंटर नहीं, कोई बिचौलिया नहीं।",
    kn: "ರಾಜೇಶ್ವರಿ, ಜ್ಯೋತಿಷ ಆಚಾರ್ಯ (ಕಾಶಿ). ಬೆಂಗಳೂರಿನ ಜಯನಗರದಲ್ಲಿ ಹದಿನೈದು ವರ್ಷಗಳಿಂದ ಕೈಯಿಂದ ಜಾತಕ ನೋಡುತ್ತಿದ್ದಾರೆ. ನೇರ ಸಮಾಲೋಚನೆ — ಕಾಲ್ ಸೆಂಟರ್ ಇಲ್ಲ, ಮಧ್ಯವರ್ತಿ ಇಲ್ಲ.",
  },
  tools: { en: "Free tools", hi: "निःशुल्क साधन", kn: "ಉಚಿತ ಸಾಧನಗಳು" },
  practice: { en: "The practice", hi: "परामर्श", kn: "ಸಮಾಲೋಚನೆ" },
  contact: { en: "Contact", hi: "संपर्क", kn: "ಸಂಪರ್ಕ" },
  hours: { en: "9 AM – 9 PM, all days", hi: "सुबह 9 – रात 9, सभी दिन", kn: "ಬೆಳಿಗ್ಗೆ 9 – ರಾತ್ರಿ 9, ಎಲ್ಲಾ ದಿನ" },
  place: { en: "Jayanagar, Bangalore", hi: "जयनगर, बैंगलोर", kn: "ಜಯನಗರ, ಬೆಂಗಳೂರು" },
  pay: { en: "Pay after the consultation, by UPI", hi: "परामर्श के बाद UPI से भुगतान", kn: "ಸಮಾಲೋಚನೆ ನಂತರ UPI ಮೂಲಕ ಪಾವತಿ" },
  reviews: { en: "Reviews", hi: "समीक्षाएं", kn: "ವಿಮರ್ಶೆಗಳು" },
  note: {
    en: "The free tools are calculators: Lahiri ayanamsa, mean nodes, whole-sign houses. They give the numbers; reading a chart is done by hand, in consultation.",
    hi: "निःशुल्क साधन गणक हैं: लाहिरी अयनांश, मध्यम राहु-केतु, राशि-भाव पद्धति। वे अंक देते हैं; कुंडली का वाचन परामर्श में हाथ से होता है।",
    kn: "ಉಚಿತ ಸಾಧನಗಳು ಗಣಕಗಳು: ಲಾಹಿರಿ ಅಯನಾಂಶ, ಮಧ್ಯಮ ರಾಹು-ಕೇತು, ರಾಶಿ-ಭಾವ ಪದ್ಧತಿ. ಅವು ಅಂಕಗಳನ್ನು ನೀಡುತ್ತವೆ; ಜಾತಕದ ವಾಚನ ಸಮಾಲೋಚನೆಯಲ್ಲಿ ಕೈಯಿಂದಲೇ.",
  },
  credit: { en: "Place data © GeoNames (CC BY 4.0)", hi: "स्थान डेटा © GeoNames (CC BY 4.0)", kn: "ಸ್ಥಳ ದತ್ತಾಂಶ © GeoNames (CC BY 4.0)" },
} satisfies Record<string, Tri>;

export function Footer() {
  const lang = useLang();
  const year = useThisYear();
  const linkClass = "text-[14px] text-[#5A4A3D] hover:text-[#1A0F0A] hover:underline underline-offset-4 decoration-[#C9A86A]";

  return (
    <footer className="border-t border-[#E8DDD0] bg-[#FBF7EF] no-print">
      <div className="max-w-[1280px] mx-auto px-4 lg:px-8 py-10 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr_1fr_1.1fr]">
          <div>
            <div className="flex items-center gap-3">
              <img src={asset("/logo-icon-small.webp")} alt="" width={44} height={44} className="w-11 h-11 rounded-full border border-[#E8DDD0] object-cover" loading="lazy" />
              <div className="font-serif text-[20px] font-bold">AstroConnect</div>
            </div>
            <p className="mt-4 text-[14px] leading-[1.65] text-[#5A4A3D] max-w-[380px]">{T.about[lang]}</p>
          </div>

          <nav aria-label={T.tools[lang]}>
            <div className="eyebrow">{T.tools[lang]}</div>
            <ul className="mt-4 space-y-2.5">
              {TOOLS.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={linkClass}>
                    {item.label[lang]}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label={T.practice[lang]}>
            <div className="eyebrow">{T.practice[lang]}</div>
            <ul className="mt-4 space-y-2.5">
              {[ABOUT_LINK, SERVICES_LINK, { href: "/#reviews", label: T.reviews }, JOURNAL_LINK].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={linkClass}>
                    {item.label[lang]}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <div className="eyebrow">{T.contact[lang]}</div>
            <ul className="mt-4 space-y-2.5 text-[14px] text-[#5A4A3D]">
              <li>
                <a href={TEL_HREF} className="inline-flex items-center gap-2 font-semibold text-[#1A0F0A] hover:underline underline-offset-4">
                  <Phone className="w-4 h-4 text-[#8A6A2F]" aria-hidden /> <span className="tabular">{PHONE_DISPLAY}</span>
                </a>
              </li>
              <li>
                <a href={whatsappHref(DEFAULT_WHATSAPP_MESSAGE)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-[#1A0F0A] hover:underline underline-offset-4">
                  <MessageCircle className="w-4 h-4 text-[#8A6A2F]" aria-hidden /> WhatsApp
                </a>
              </li>
              <li>
                <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-[#1A0F0A] hover:underline underline-offset-4">
                  <Instagram className="w-4 h-4 text-[#8A6A2F]" aria-hidden /> @{INSTAGRAM_HANDLE}
                </a>
              </li>
              <li className="pt-1">{T.place[lang]}</li>
              <li>{T.hours[lang]}</li>
              <li>{T.pay[lang]}</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[#E8DDD0] grid gap-3 lg:grid-cols-[1fr_auto] text-[12.5px] leading-[1.6] text-[#6B5D52]">
          <p className="max-w-[760px]">{T.note[lang]}</p>
          <p className="lg:text-right">
            © {year} AstroConnect • Rajeshwari
            <br />
            {T.credit[lang]}
          </p>
        </div>
      </div>
    </footer>
  );
}
