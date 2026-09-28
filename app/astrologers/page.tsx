"use client";
import { useState, useMemo } from "react";
import { useAppStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { Star, MessageCircle, Phone, Video, Search, SlidersHorizontal, Clock } from "lucide-react";

export default function AstrologersPage() {
  const { astrologers, language, searchQuery, favorites, toggleFavorite } = useAppStore();
  const [filters, setFilters] = useState({ price: "all", rating: "all", language: "all", spec: "all", online: false, type: "all" });
  const [sortBy, setSortBy] = useState("rating");

  const filtered = useMemo(()=>{
    let list = [...astrologers];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(a=> a.name.toLowerCase().includes(q) || a.specializations.join(" ").toLowerCase().includes(q) || a.languages.join(" ").toLowerCase().includes(q));
    }
    if (filters.price !== "all") {
      if (filters.price === "low") list = list.filter(a=>a.pricePerMinute <= 20);
      if (filters.price === "mid") list = list.filter(a=>a.pricePerMinute >20 && a.pricePerMinute <=35);
      if (filters.price === "high") list = list.filter(a=>a.pricePerMinute >35);
    }
    if (filters.rating !== "all") list = list.filter(a=>a.rating >= parseFloat(filters.rating));
    if (filters.language !== "all") list = list.filter(a=>a.languages.includes(filters.language));
    if (filters.spec !== "all") list = list.filter(a=>a.specializations.includes(filters.spec));
    if (filters.online) list = list.filter(a=>a.isOnline);
    if (filters.type !== "all") {
      if (filters.type==="chat") list = list.filter(a=>a.chatAvailable);
      if (filters.type==="call") list = list.filter(a=>a.callAvailable);
      if (filters.type==="video") list = list.filter(a=>a.videoAvailable);
    }
    if (sortBy==="rating") list.sort((a,b)=>b.rating-a.rating);
    if (sortBy==="price_low") list.sort((a,b)=>a.pricePerMinute-b.pricePerMinute);
    if (sortBy==="price_high") list.sort((a,b)=>b.pricePerMinute-a.pricePerMinute);
    if (sortBy==="experience") list.sort((a,b)=>b.experience-a.experience);
    return list;
  }, [astrologers, searchQuery, filters, sortBy]);

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex flex-col lg:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Find Your Astrologer</h1>
          <p className="text-white/50 text-sm">{filtered.length} verified astrologers available</p>
        </div>
        <div className="flex gap-2">
          <select value={sortBy} onChange={e=>setSortBy(e.target.value)} className="h-10 px-3 rounded-xl bg-white/[0.06] border border-white/10 text-sm text-white">
            <option value="rating" className="bg-[#0a0a24]">Top Rated</option>
            <option value="price_low" className="bg-[#0a0a24]">Price Low to High</option>
            <option value="price_high" className="bg-[#0a0a24]">Price High to Low</option>
            <option value="experience" className="bg-[#0a0a24]">Experience</option>
          </select>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3"><SlidersHorizontal className="w-4 h-4" /> <span className="font-medium text-sm">Filters</span></div>
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
            <select value={filters.price} onChange={e=>setFilters({...filters, price:e.target.value})} className="h-9 px-2 rounded-xl bg-white/[0.06] border border-white/10 text-xs text-white">
              <option value="all" className="bg-[#0a0a24]">All Prices</option>
              <option value="low" className="bg-[#0a0a24]">Under ₹20/min</option>
              <option value="mid" className="bg-[#0a0a24]">₹20-35/min</option>
              <option value="high" className="bg-[#0a0a24]">Above ₹35/min</option>
            </select>
            <select value={filters.rating} onChange={e=>setFilters({...filters, rating:e.target.value})} className="h-9 px-2 rounded-xl bg-white/[0.06] border border-white/10 text-xs text-white">
              <option value="all" className="bg-[#0a0a24]">All Ratings</option>
              <option value="4.5" className="bg-[#0a0a24]">4.5+ Stars</option>
              <option value="4.8" className="bg-[#0a0a24]">4.8+ Stars</option>
              <option value="5" className="bg-[#0a0a24]">5 Stars</option>
            </select>
            <select value={filters.language} onChange={e=>setFilters({...filters, language:e.target.value})} className="h-9 px-2 rounded-xl bg-white/[0.06] border border-white/10 text-xs text-white">
              <option value="all" className="bg-[#0a0a24]">All Languages</option>
              <option value="Hindi" className="bg-[#0a0a24]">Hindi</option>
              <option value="English" className="bg-[#0a0a24]">English</option>
              <option value="Kannada" className="bg-[#0a0a24]">Kannada</option>
              <option value="Tamil" className="bg-[#0a0a24]">Tamil</option>
            </select>
            <select value={filters.spec} onChange={e=>setFilters({...filters, spec:e.target.value})} className="h-9 px-2 rounded-xl bg-white/[0.06] border border-white/10 text-xs text-white">
              <option value="all" className="bg-[#0a0a24]">All Specializations</option>
              <option value="Vedic Astrology" className="bg-[#0a0a24]">Vedic</option>
              <option value="Love & Relationship" className="bg-[#0a0a24]">Love</option>
              <option value="Career" className="bg-[#0a0a24]">Career</option>
              <option value="Business" className="bg-[#0a0a24]">Business</option>
              <option value="Tarot" className="bg-[#0a0a24]">Tarot</option>
            </select>
            <select value={filters.type} onChange={e=>setFilters({...filters, type:e.target.value})} className="h-9 px-2 rounded-xl bg-white/[0.06] border border-white/10 text-xs text-white">
              <option value="all" className="bg-[#0a0a24]">All Types</option>
              <option value="chat" className="bg-[#0a0a24]">Chat</option>
              <option value="call" className="bg-[#0a0a24]">Call</option>
              <option value="video" className="bg-[#0a0a24]">Video</option>
            </select>
            <label className="flex items-center gap-2 px-3 h-9 rounded-xl bg-white/[0.06] border border-white/10 text-xs cursor-pointer">
              <input type="checkbox" checked={filters.online} onChange={e=>setFilters({...filters, online:e.target.checked})} /> Available Now
            </label>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(astro=>(
          <Card key={astro.id} className="hover:bg-white/[0.08] transition">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <div className="relative">
                  <img src={astro.avatar} alt={astro.name} className="w-14 h-14 rounded-2xl object-cover" />
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#0a0a24] ${astro.isOnline ? "bg-emerald-500" : "bg-gray-500"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-white font-semibold text-sm truncate">{astro.name}</span>
                    {astro.verified && <span className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-[10px] text-white">✓</span>}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="flex items-center gap-1 text-amber-300 text-xs"><Star className="w-3 h-3 fill-amber-300" /> {astro.rating} ({astro.reviewCount})</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {astro.specializations.slice(0,2).map((s:string)=><Badge key={s} variant="outline" className="text-[10px] px-1.5 py-0">{s}</Badge>)}
                  </div>
                </div>
                <button onClick={()=>toggleFavorite(astro.id)} className={`w-8 h-8 rounded-full flex items-center justify-center border ${favorites.includes(astro.id) ? "bg-pink-500/20 border-pink-500/30 text-pink-400" : "bg-white/5 border-white/10 text-white/40"}`}>♥</button>
              </div>
              <div className="mt-3 text-xs text-white/50 line-clamp-2">{astro.bio}</div>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-3 text-[11px] text-white/50">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {astro.experience} yrs</span>
                  <span>{astro.languages.slice(0,2).join(", ")}</span>
                </div>
                <div className="text-right">
                  <div className="text-white font-bold text-sm">{formatCurrency(astro.pricePerMinute)}<span className="text-white/40 font-normal text-xs">{t(language,'perMinute')}</span></div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3">
                <Link href={`/astrologers/${astro.id}?action=chat`} className="h-9 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center gap-1.5 text-xs text-white hover:bg-white/10"><MessageCircle className="w-3.5 h-3.5" /> Chat</Link>
                <Link href={`/astrologers/${astro.id}?action=voice`} className="h-9 rounded-xl bg-violet-600 hover:bg-violet-700 flex items-center justify-center gap-1.5 text-xs text-white"><Phone className="w-3.5 h-3.5" /> Call</Link>
                <Link href={`/astrologers/${astro.id}`} className="h-9 rounded-xl bg-amber-500 hover:bg-amber-600 flex items-center justify-center gap-1.5 text-xs text-black font-semibold">Book</Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {filtered.length===0 && <div className="text-center py-20 text-white/50">No astrologers found matching your filters. Try adjusting filters.</div>}
    </div>
  );
}
