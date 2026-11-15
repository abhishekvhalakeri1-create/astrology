"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { Menu, X } from "lucide-react";

export function Header() {
  const pathname = usePathname();
  const store = useAppStore();
  const language = store?.language || "en";
  const setLanguage = store?.setLanguage;
  const [mobileOpen, setMobileOpen] = useState(false);
  const phone = "7892758565";
  const phoneWithCountry = `+91${phone}`;
  const whatsappNumber = `91${phone}`;
  const instagramUrl = "https://www.instagram.com/shivohamastro66";

  const navItems = [
    { href: "/horoscope", label: language === "hi" ? "राशिफल" : language === "kn" ? "ಭವಿಷ್ಯ" : "Horoscope" },
    { href: "/birth-chart", label: language === "hi" ? "कुंडली" : language === "kn" ? "ಕುಂಡಲಿ" : "Kundli" },
    { href: "/#astrologer", label: language === "hi" ? "ज्योतिषी" : language === "kn" ? "ಜ್ಯೋತಿಷಿ" : "Astrologer" },
    { href: "/#services", label: language === "hi" ? "सेवाएं" : language === "kn" ? "ಸೇವೆಗಳು" : "Services" },
    { href: "/#reviews", label: language === "hi" ? "समीक्षा" : language === "kn" ? "ವಿಮರ್ಶೆ" : "Reviews" },
    { href: "/articles", label: language === "hi" ? "लेख" : language === "kn" ? "ಲೇಖನ" : "Journal" },
  ];

  const handleLanguage = (lang: string) => {
    try {
      if (setLanguage) setLanguage(lang as any);
      if (typeof window !== "undefined") {
        localStorage.setItem("astro-lang", lang);
        localStorage.setItem("astroconnect-storage", JSON.stringify({ state: { language: lang } }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FFFEFB] border-b border-[#E8DDD0]">
      <div className="max-w-[1280px] mx-auto px-4 lg:px-8 h-[64px] lg:h-[72px] flex items-center justify-between">
        <div className="flex items-center gap-6 lg:gap-10">
          <Link href="/" className="flex items-center gap-2.5 cursor-pointer">
            <img src="/logo-icon-small.webp" alt="AstroConnect" width={36} height={36} className="w-9 h-9 lg:w-10 lg:h-10 rounded-full border border-[#E8DDD0] object-cover" />
            <div>
              <div className="font-serif text-[15px] lg:text-[17px] font-bold tracking-[-0.01em] leading-none">AstroConnect</div>
              <div className="text-[9px] lg:text-[10px] tracking-[0.12em] uppercase text-[#8B7355] mt-0.5">Rajeshwari • Since 2009</div>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-7">
            {navItems.map(item=>{
              const active = pathname === item.href;
              return (
                <Link key={item.href} href={item.href} className={`text-[13px] tracking-wide cursor-pointer ${active ? "text-[#1A0F0A] font-medium border-b border-[#1A0F0A] pb-1" : "text-[#6B5D52] hover:text-[#1A0F0A]"}`}>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2 lg:gap-3">
          {/* Language - Working */}
          <div className="flex items-center rounded-full border border-[#E8DDD0] bg-white p-0.5">
            {[
              { code: "en", label: "EN" },
              { code: "hi", label: "हि" },
              { code: "kn", label: "ಕ" },
            ].map(l=>(
              <button
                key={l.code}
                type="button"
                onClick={()=>handleLanguage(l.code)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-medium cursor-pointer min-w-[36px] min-h-[28px] transition-colors ${language===l.code ? "bg-[#1A0F0A] text-white" : "text-[#8B7355] hover:text-[#1A0F0A] hover:bg-[#F5F1EB]"}`}
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* WhatsApp - Direct Link to 7892758565 */}
          <a 
            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Namaste Rajeshwari madam")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex h-9 px-4 items-center justify-center rounded-full border border-[#E8DDD0] bg-white text-[12px] font-medium text-[#1A0F0A] hover:border-[#1A0F0A] hover:bg-[#F5F1EB] cursor-pointer"
          >
            WhatsApp
          </a>

          {/* Book Consultation - Direct Call to 7892758565 */}
          <a 
            href={`tel:${phoneWithCountry}`}
            className="hidden md:inline-flex h-9 px-5 items-center justify-center rounded-full bg-[#1A0F0A] text-white text-[12px] font-medium hover:bg-black cursor-pointer"
          >
            Book Consultation
          </a>

          <button type="button" onClick={()=>setMobileOpen(!mobileOpen)} className="lg:hidden w-10 h-10 rounded-full border border-[#E8DDD0] bg-white flex items-center justify-center cursor-pointer hover:bg-[#F5F1EB]">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-[#E8DDD0] bg-[#FFFEFB] px-4 py-6">
          <nav className="flex flex-col gap-1">
            {navItems.map(item=>(
              <Link key={item.href} href={item.href} onClick={()=>setMobileOpen(false)} className="py-4 px-4 rounded-[8px] text-[16px] font-medium text-[#1A0F0A] hover:bg-[#F5F1EB] active:bg-[#E8DDD0] flex justify-between items-center cursor-pointer min-h-[48px]">
                {item.label}
                <span className="text-[#C9A86A]">→</span>
              </Link>
            ))}
          </nav>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <a href={`tel:${phoneWithCountry}`} onClick={()=>setMobileOpen(false)} className="h-14 rounded-full bg-[#1A0F0A] text-white flex items-center justify-center gap-2 text-[14px] font-medium cursor-pointer">
              Call {phone}
            </a>
            <a href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Namaste Rajeshwari madam")}`} target="_blank" rel="noopener noreferrer" onClick={()=>setMobileOpen(false)} className="h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center gap-2 text-[14px] font-medium cursor-pointer">
              WhatsApp
            </a>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-2">
            <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="h-11 rounded-full border border-[#E8DDD0] bg-white flex items-center justify-center gap-2 text-[13px] font-medium cursor-pointer hover:border-[#1A0F0A]">
              Instagram • shivohamastro66
            </a>
          </div>
          <div className="mt-4 text-center text-[11px] text-[#8B7355]">Direct: {phone} • 9AM-9PM • Pay after • No middleman</div>
        </div>
      )}
    </header>
  );
}
