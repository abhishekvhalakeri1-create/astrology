"use client";
import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { horoscopes, zodiacSigns } from "@/lib/seedData";
import { zodiacInfo } from "@/lib/birthChart";
import { t as translate } from "@/lib/i18n";
import { Phone, MessageCircle } from "lucide-react";

export default function HoroscopePage() {
  const store = useAppStore();
  const language = store?.language || "en";
  const [selected, setSelected] = useState("Aries");
  const [period, setPeriod] = useState<"daily"|"weekly"|"monthly"|"yearly">("daily");
  const h = horoscopes[selected];
  const phone = "7892758565";
  const phoneWithCountry = `+91${phone}`;
  const whatsappNumber = `91${phone}`;

  const periodText = {
    daily: { love: h.love, career: h.career, money: h.money, health: h.health, family: h.family },
    weekly: { love: "This week brings deeper connections. Venus transit favors romance. Mid-week ideal for proposals.", career: "Career growth steady. New project starts Friday. Networking helps.", money: "Expenses higher early week, gains later. Avoid lending.", health: "Energy fluctuates. Yoga and hydration key.", family: "Family support strong. Elder's health improves." },
    monthly: { love: "Month of transformation in love. Singles find meaningful connection after 15th. Couples resolve old issues.", career: "Excellent month for career. Promotion or job change likely. Jupiter supports.", money: "Financial gains from unexpected source. Investment in learning pays.", health: "Overall good, but watch digestion. Include seasonal fruits.", family: "Harmony at home. Celebration possible. Children bring joy." },
    yearly: { love: "2024 is year of soulmate connections for you. Second half brings commitment. Learn to communicate openly.", career: "Major career shift year. First half preparation, second half execution. Success through discipline.", money: "Wealth creation year. Property or vehicle purchase favorable after June.", health: "Focus on holistic wellness. Ayurvedic practices benefit.", family: "Family expansion or reunion. Ancestral property matters resolve." },
  };

  const current = periodText[period];

  return (
    <div className="bg-[#FFFEFB] text-[#1A0F0A] min-h-screen overflow-x-hidden">
      <div className="max-w-[1280px] mx-auto px-4 lg:px-8 py-8 lg:py-12 pb-[100px] lg:pb-12">
        <div className="flex flex-col lg:flex-row justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-[11px] tracking-[0.14em] uppercase text-[#8B7355]">Daily • Written by Rajeshwari</span>
              <div className="h-px w-12 bg-[#C9A86A]/30" />
              <span className="text-[11px] text-[#8B7355]/60">Not computer generated</span>
            </div>
            <h1 className="mt-4 font-serif text-[28px] lg:text-[36px] leading-[1.1] tracking-[-0.02em]">{translate(language,'todaysHoroscope')}</h1>
            <p className="mt-3 text-[13px] leading-[1.6] text-[#6B5D52] max-w-[480px]">Select your Rashi. Written daily by me based on Chandra transit. For detailed reading, call {phone} directly. All links connected to {phone}.</p>
          </div>
          
          <div className="flex flex-col gap-3">
            <div className="flex gap-1 p-1 rounded-full bg-[#F5F1EB] border border-[#E8DDD0] w-fit">
              {(["daily","weekly","monthly","yearly"] as const).map(p=>(
                <button key={p} type="button" onClick={()=>setPeriod(p)} className={`px-4 py-2 rounded-full text-[12px] font-medium capitalize cursor-pointer min-h-[36px] ${period===p ? "bg-[#1A0F0A] text-white" : "text-[#8B7355] hover:text-[#1A0F0A] hover:bg-white"}`}>{p}</button>
              ))}
            </div>
            <div className="flex gap-2">
              <a href={`tel:${phoneWithCountry}`} className="h-10 px-4 inline-flex items-center justify-center gap-1.5 rounded-full bg-[#1A0F0A] text-white text-[11px] font-medium hover:bg-black cursor-pointer">
                <Phone className="w-3.5 h-3.5" /> Call {phone}
              </a>
              <a href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Namaste Rajeshwari madam, my rashi is ${selected}, I want horoscope consultation`)}`} target="_blank" rel="noopener noreferrer" className="h-10 px-4 inline-flex items-center justify-center gap-1.5 rounded-full bg-[#25D366] text-white text-[11px] font-medium hover:bg-[#128C7E] cursor-pointer">
                <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2">
          {zodiacSigns.map(sign=>{
            const isSel = selected===sign;
            return (
              <button key={sign} type="button" onClick={()=>setSelected(sign)} className={`rounded-[8px] p-3 border text-center cursor-pointer min-h-[72px] ${isSel ? "bg-[#1A0F0A] text-white border-[#1A0F0A] shadow-sm" : "bg-white border-[#E8DDD0] text-[#1A0F0A] hover:border-[#1A0F0A] hover:bg-[#FDF8F0]"}`}>
                <div className="text-[22px]">{zodiacInfo[sign].symbol}</div>
                <div className="text-[11px] font-semibold mt-1">{sign}</div>
                <div className="text-[9px] text-[#8B7355] mt-0.5">{zodiacInfo[sign].dates.split(' ')[0]}</div>
              </button>
            );
          })}
        </div>

        <div className="mt-8 grid lg:grid-cols-[320px_1fr] gap-6">
          <div className="bg-white border border-[#E8DDD0] p-6 text-center h-fit">
            <div className="w-20 h-20 mx-auto rounded-full bg-[#1A0F0A] text-[#C9A86A] flex items-center justify-center text-[32px] font-serif">{zodiacInfo[selected].symbol}</div>
            <h2 className="font-serif text-[22px] mt-4">{selected}</h2>
            <div className="text-[#8B7355] text-[12px] mt-1">{zodiacInfo[selected].dates} • {zodiacInfo[selected].element} • Lord {zodiacInfo[selected].lord}</div>
            <div className="grid grid-cols-2 gap-3 mt-6 text-left">
              <div className="rounded-[8px] bg-[#FDF8F0] border border-[#E8DDD0] p-3"><div className="text-[#8B7355] text-[10px] uppercase">Lucky Number</div><div className="text-[#8B4513] font-bold text-[16px] mt-1">{h.luckyNumber}</div></div>
              <div className="rounded-[8px] bg-[#FDF8F0] border border-[#E8DDD0] p-3"><div className="text-[#8B7355] text-[10px] uppercase">Lucky Color</div><div className="text-[#1A0F0A] font-bold text-[13px] mt-1">{h.luckyColor}</div></div>
            </div>
            <div className="mt-6 rounded-[8px] bg-[#FDF8F0] border border-[#C9A86A]/20 p-4 text-left">
              <div className="text-[#8B4513] text-[11px] font-semibold uppercase">Today's Advice</div>
              <div className="text-[#3D2F26] text-[13px] mt-2 leading-[1.6]">{h.advice}</div>
            </div>
            <div className="mt-6 flex gap-2">
              <a href={`tel:${phoneWithCountry}`} className="flex-1 h-11 bg-[#1A0F0A] text-white text-[11px] font-medium uppercase flex items-center justify-center hover:bg-black cursor-pointer">Call {phone}</a>
              <a href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Namaste Rajeshwari madam, my rashi is ${selected}`)}`} target="_blank" rel="noopener noreferrer" className="flex-1 h-11 bg-white border border-[#E8DDD0] text-[11px] font-medium uppercase flex items-center justify-center hover:border-[#1A0F0A] cursor-pointer">WhatsApp</a>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { key: "love", label: translate(language,'love'), icon: "♀", text: current.love },
                { key: "career", label: translate(language,'career'), icon: "♃", text: current.career },
                { key: "money", label: translate(language,'money'), icon: "☿", text: current.money },
                { key: "health", label: translate(language,'health'), icon: "☉", text: current.health },
                { key: "family", label: translate(language,'family'), icon: "☽", text: current.family },
              ].map(item=>(
                <div key={item.key} className="bg-white border border-[#E8DDD0] p-5">
                  <div className="flex items-center gap-2 mb-3"><span className="w-6 h-6 rounded-full bg-[#F5F1EB] border border-[#E8DDD0] flex items-center justify-center text-[12px]">{item.icon}</span><h3 className="font-serif text-[14px] font-medium">{item.label}</h3></div>
                  <p className="text-[#3D2F26] text-[13px] leading-[1.65]">{item.text}</p>
                </div>
              ))}
            </div>
            <div className="bg-[#FDF8F0] border border-[#E8DDD0] p-4">
              <p className="text-[#8B7355] text-[11px] text-center leading-[1.6]">{translate(language,'disclaimerHoroscope')} Call {phone} for direct consultation. All links connected to {phone}.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
