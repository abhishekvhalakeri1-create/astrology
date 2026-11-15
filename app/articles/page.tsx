"use client";
import { useState } from "react";
import { articles } from "@/lib/seedData";
import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { Phone, MessageCircle } from "lucide-react";

export default function ArticlesPage() {
  const { searchQuery } = useAppStore();
  const [cat, setCat] = useState("All");
  const phone = "7892758565";
  const categories = ["All","Astrology","Zodiac Signs","Planetary Movements","Relationships","Career","Numerology","Tarot","Vastu","Spirituality"];
  const filtered = articles.filter(a=> {
    const matchesCat = cat==="All" || a.category===cat;
    const matchesSearch = !searchQuery || a.title.toLowerCase().includes(searchQuery.toLowerCase()) || a.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="bg-[#FFFEFB] text-[#1A0F0A] min-h-screen">
      <div className="max-w-[1280px] mx-auto px-4 lg:px-8 py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-[11px] tracking-[0.14em] uppercase text-[#8B7355]">Journal • Written by Rajeshwari</span>
              <div className="h-px w-12 bg-[#C9A86A]/30" />
              <span className="text-[11px] text-[#8B7355]/60">Simple language • Not AI</span>
            </div>
            <h1 className="mt-4 font-serif text-[28px] lg:text-[36px] leading-[1.1] tracking-[-0.02em]">Astrology Journal</h1>
            <p className="mt-3 text-[13px] leading-[1.6] text-[#6B5D52] max-w-[480px]">Written by me in simple language. Based on 15 years experience. For personal consultation, call {phone} directly.</p>
          </div>
          <div className="flex gap-2">
            <a href={`tel:+91${phone}`} className="h-10 px-4 inline-flex items-center justify-center gap-1.5 rounded-full bg-[#1A0F0A] text-white text-[11px] font-medium hover:bg-black transition-colors">
              <Phone className="w-3.5 h-3.5" /> Call {phone}
            </a>
          </div>
        </div>

        <div className="mt-8 flex gap-2 overflow-x-auto pb-2">
          {categories.map(c=>(
            <button key={c} onClick={()=>setCat(c)} className={`shrink-0 px-4 py-2 rounded-full text-[13px] border transition ${cat===c ? "bg-[#1A0F0A] text-white border-[#1A0F0A]" : "bg-white border-[#E8DDD0] text-[#6B5D52] hover:border-[#1A0F0A] hover:text-[#1A0F0A]"}`}>{c}</button>
          ))}
        </div>

        <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(art=>(
            <Link key={art.id} href={`/articles/${art.id}`} className="group bg-white border border-[#E8DDD0] overflow-hidden hover:border-[#C9A86A]/40 transition-colors">
              <div className="h-48 overflow-hidden bg-[#F5F1EB]"><img src={art.image} alt={art.title} className="w-full h-full object-cover group-hover:scale-[1.02] transition duration-700" loading="lazy" /></div>
              <div className="p-5">
                <div className="text-[10px] tracking-[0.08em] uppercase text-[#8B7355]">{art.category}</div>
                <div className="font-serif text-[16px] leading-[1.3] tracking-[-0.01em] mt-2 line-clamp-2 group-hover:text-[#8B4513] transition-colors">{art.title}</div>
                <div className="text-[#6B5D52] text-[12px] mt-2 line-clamp-2 leading-[1.6]">{art.excerpt}</div>
                <div className="flex justify-between items-center mt-4 text-[11px] text-[#8B7355]">
                  <span>{art.author}</span><span>{art.readTime} min • {art.views.toLocaleString()} views</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
