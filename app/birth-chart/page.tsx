"use client";
import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { calculateBirthChart, zodiacInfo } from "@/lib/birthChart";
import { Phone, MessageCircle, Plus, Trash2 } from "lucide-react";

export default function BirthChartPage() {
  const store = useAppStore();
  const { birthProfiles, addBirthProfile, deleteBirthProfile, activeBirthProfileId, setActiveBirthProfileId } = store;
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ label: "My Chart", fullName: "", dob: "", tob: "", birthPlace: "", gender: "male" as const });
  const phone = "7892758565";
  const phoneWithCountry = `+91${phone}`;
  const whatsappNumber = `91${phone}`;

  const activeProfile = birthProfiles.find(p=>p.id===activeBirthProfileId) || birthProfiles[0];
  const chart = activeProfile ? calculateBirthChart(activeProfile) : null;

  const handleAdd = () => {
    if (!form.fullName || !form.dob || !form.tob || !form.birthPlace) return alert("Fill all fields");
    addBirthProfile({ id: `bp-${Date.now()}`, ...form });
    setShowAdd(false);
    setForm({ label: "Friend", fullName: "", dob: "", tob: "", birthPlace: "", gender: "male" });
  };

  if (!activeProfile) return <div className="p-6 bg-[#FFFEFB]">No birth profiles. Add one.</div>;

  return (
    <div className="bg-[#FFFEFB] text-[#1A0F0A] min-h-screen overflow-x-hidden">
      <div className="max-w-[1280px] mx-auto px-4 lg:px-8 py-8 lg:py-12 pb-[100px] lg:pb-12">
        <div className="flex flex-col lg:flex-row justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-[11px] tracking-[0.14em] uppercase text-[#8B7355]">Kundli • Hand Drawn Style</span>
              <div className="h-px w-12 bg-[#C9A86A]/30" />
              <span className="text-[11px] text-[#8B7355]/60">North Indian • Vedic</span>
            </div>
            <h1 className="mt-4 font-serif text-[28px] lg:text-[36px] leading-[1.1]">My Birth Chart</h1>
            <p className="mt-3 text-[13px] leading-[1.6] text-[#6B5D52] max-w-[480px]">Kundli generated using Vedic sidereal system. For accurate predictions, consult Rajeshwari directly on {phone}. Every chart studied by hand, not software. All links connected to {phone}.</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={()=>setShowAdd(!showAdd)} className="h-11 px-5 bg-[#1A0F0A] text-white text-[12px] font-medium hover:bg-black cursor-pointer inline-flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Profile
            </button>
            <a href={`tel:${phoneWithCountry}`} className="h-11 px-4 inline-flex items-center justify-center gap-1.5 border border-[#E8DDD0] bg-white text-[12px] font-medium hover:border-[#1A0F0A] cursor-pointer">
              <Phone className="w-4 h-4" /> Call {phone}
            </a>
          </div>
        </div>

        <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
          {birthProfiles.map(p=>(
            <button key={p.id} type="button" onClick={()=>setActiveBirthProfileId(p.id)} className={`shrink-0 px-4 py-2.5 rounded-full border text-[13px] flex items-center gap-2 cursor-pointer min-h-[40px] ${activeBirthProfileId===p.id ? "bg-[#1A0F0A] text-white border-[#1A0F0A]" : "bg-white border-[#E8DDD0] text-[#6B5D52] hover:border-[#1A0F0A]"}`}>
              {p.label}: {p.fullName.split(' ')[0]}
              {birthProfiles.length>1 && <span onClick={(e)=>{e.stopPropagation(); deleteBirthProfile(p.id)}} className="ml-1 hover:text-red-500 cursor-pointer"><Trash2 className="w-3 h-3" /></span>}
            </button>
          ))}
        </div>

        {showAdd && (
          <div className="mt-6 bg-white border border-[#E8DDD0] p-6">
            <h3 className="font-serif text-[18px]">Add Birth Profile</h3>
            <div className="mt-4 grid md:grid-cols-2 gap-4">
              <select value={form.label} onChange={e=>setForm({...form, label:e.target.value})} className="h-11 px-4 bg-white border border-[#E8DDD0] text-[13px]"><option>My Chart</option><option>Partner</option><option>Family Member</option><option>Friend</option><option>Child</option></select>
              <input placeholder="Full Name" value={form.fullName} onChange={e=>setForm({...form, fullName:e.target.value})} className="h-11 px-4 bg-white border border-[#E8DDD0] text-[13px]" />
              <input type="date" value={form.dob} onChange={e=>setForm({...form, dob:e.target.value})} className="h-11 px-4 bg-white border border-[#E8DDD0] text-[13px]" />
              <input type="time" value={form.tob} onChange={e=>setForm({...form, tob:e.target.value})} className="h-11 px-4 bg-white border border-[#E8DDD0] text-[13px]" />
              <input placeholder="Birth Place (City, State)" value={form.birthPlace} onChange={e=>setForm({...form, birthPlace:e.target.value})} className="h-11 px-4 bg-white border border-[#E8DDD0] text-[13px]" />
              <select value={form.gender} onChange={e=>setForm({...form, gender:e.target.value as any})} className="h-11 px-4 bg-white border border-[#E8DDD0] text-[13px]"><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select>
              <button type="button" onClick={handleAdd} className="md:col-span-2 h-11 bg-[#1A0F0A] text-white text-[12px] uppercase font-medium hover:bg-black cursor-pointer">Save Profile</button>
            </div>
          </div>
        )}

        {chart && (
          <div className="mt-8 space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white border border-[#E8DDD0] p-4 lg:p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="w-full md:w-[320px] aspect-square bg-[#FDF8F0] border border-[#E8DDD0] p-3 relative overflow-hidden shrink-0">
                    <div className="absolute inset-0 pointer-events-none"><div className="absolute inset-2 border border-[#C9A86A]/10" /></div>
                    <div className="relative z-10 h-full flex flex-col">
                      <div className="text-center mb-2"><div className="text-[#8B7355] text-[10px] tracking-[0.14em] uppercase">North Indian Kundli</div><div className="text-[#1A0F0A] font-serif font-bold text-[14px] mt-1">{activeProfile.fullName}</div><div className="text-[#8B7355] text-[11px] mt-0.5">{activeProfile.dob} • {activeProfile.tob} • {activeProfile.birthPlace}</div></div>
                      <div className="flex-1 grid grid-cols-4 grid-rows-4 gap-px bg-[#E8DDD0] p-px rounded-[4px] overflow-hidden">
                        {Array.from({length:16}).map((_,i)=>{ const houseNum = [12,1,2,3,11,0,0,4,10,0,0,5,9,8,7,6][i]; if (houseNum===0) return <div key={i} className="bg-[#FDF8F0] flex items-center justify-center"><div className="w-px h-6 bg-[#E8DDD0]/50 rotate-45" /></div>; const planetsInHouse = chart.planets.filter(p=>p.house===houseNum).map(p=>p.planet.slice(0,2)).join(" "); return (<div key={i} className="bg-[#FFFEFB] p-1.5"><div className="text-[9px] text-[#8B4513] font-medium">{houseNum}</div><div className="text-[8px] text-[#1A0F0A]/70 leading-tight mt-0.5">{planetsInHouse || ""}</div><div className="text-[7px] text-[#8B7355]/60 mt-1">{chart.houses[houseNum-1]?.sign.slice(0,3)}</div></div>); })}
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-[4px] bg-[#FDF8F0] border border-[#E8DDD0] p-3"><div className="text-[#8B7355] text-[10px] uppercase">Sun Sign</div><div className="text-[#1A0F0A] font-serif font-bold text-[14px] mt-1">{zodiacInfo[chart.sunSign]?.symbol} {chart.sunSign}</div><div className="text-[11px] text-[#8B7355] mt-1">{zodiacInfo[chart.sunSign]?.element} • Lord {zodiacInfo[chart.sunSign]?.lord}</div></div>
                      <div className="rounded-[4px] bg-[#FDF8F0] border border-[#E8DDD0] p-3"><div className="text-[#8B7355] text-[10px] uppercase">Moon Sign</div><div className="text-[#1A0F0A] font-serif font-bold text-[14px] mt-1">{zodiacInfo[chart.moonSign]?.symbol} {chart.moonSign}</div><div className="text-[11px] text-[#8B7355] mt-1">{zodiacInfo[chart.moonSign]?.element} • Mind</div></div>
                      <div className="rounded-[4px] bg-[#FDF8F0] border border-[#E8DDD0] p-3"><div className="text-[#8B7355] text-[10px] uppercase">Ascendant</div><div className="text-[#1A0F0A] font-bold text-[14px] mt-1">{chart.ascendant}</div><div className="text-[11px] text-[#8B7355] mt-1">Lagna • Self</div></div>
                      <div className="rounded-[4px] bg-[#FDF8F0] border border-[#E8DDD0] p-3"><div className="text-[#8B7355] text-[10px] uppercase">Nakshatra</div><div className="text-[#1A0F0A] font-bold text-[14px] mt-1">{chart.nakshatra}</div><div className="text-[11px] text-[#8B7355] mt-1">Birth Star</div></div>
                    </div>
                    <div className="rounded-[4px] bg-[#1A0F0A] text-[#E8DDD0] p-4"><div className="text-[#C9A86A] text-[10px] uppercase font-semibold">Current Dasha</div><div className="text-[#FFFEFB] text-[13px] mt-2"><span className="font-bold">{chart.dasha.currentDasha} Mahadasha</span> • {chart.dasha.currentAntardasha} Antardasha</div><div className="text-[#E8DDD0]/60 text-[11px] mt-1">Ends: {chart.dasha.mahadashaEnd} • Next: {chart.dasha.nextDasha}</div></div>
                    <div className="flex gap-2">
                      <a href={`tel:${phoneWithCountry}`} className="flex-1 h-11 bg-[#1A0F0A] text-white text-[11px] uppercase font-medium flex items-center justify-center gap-1.5 hover:bg-black cursor-pointer"><Phone className="w-3.5 h-3.5" /> Consult Rajeshwari {phone}</a>
                      <a href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Namaste Rajeshwari madam, I want Kundli reading")}`} target="_blank" rel="noopener noreferrer" className="flex-1 h-11 bg-[#25D366] text-white text-[11px] uppercase font-medium flex items-center justify-center gap-1.5 hover:bg-[#128C7E] cursor-pointer"><MessageCircle className="w-3.5 h-3.5" /> WhatsApp</a>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white border border-[#E8DDD0] p-5"><h3 className="font-serif text-[16px]">Need Detailed Reading?</h3><p className="text-[13px] leading-[1.6] text-[#6B5D52] mt-3">This is computer generated chart. For accurate predictions, Rajeshwari studies every chart by hand. Call {phone} directly. All links connected to {phone}.</p><div className="mt-4 p-4 bg-[#FDF8F0] border border-[#E8DDD0]"><div className="flex gap-3"><img src="/rajeshwari-thumb.webp" alt="Rajeshwari" width={40} height={40} className="w-10 h-10 rounded-full object-cover border border-[#E8DDD0]" /><div><div className="text-[13px] font-medium">Rajeshwari • 15 Years • 4.9★ • {phone}</div><div className="text-[11px] text-[#8B7355] mt-1">Direct: {phone} • Pay after • Jayanagar</div></div></div><div className="mt-4 grid grid-cols-2 gap-2"><a href={`tel:${phoneWithCountry}`} className="h-11 bg-[#1A0F0A] text-white text-[11px] font-medium uppercase flex items-center justify-center hover:bg-black cursor-pointer">Call Now {phone}</a><a href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Namaste Rajeshwari madam, I want Kundli reading")}`} target="_blank" rel="noopener noreferrer" className="h-11 border border-[#E8DDD0] bg-white text-[11px] font-medium uppercase flex items-center justify-center hover:border-[#1A0F0A] cursor-pointer">WhatsApp</a></div></div></div>
            </div>
            <div className="bg-white border border-[#E8DDD0] p-5"><h3 className="font-serif text-[18px]">Planetary Positions</h3><div className="mt-4 grid md:grid-cols-2 lg:grid-cols-3 gap-3">{chart.planets.map(p=>(<div key={p.planet} className="rounded-[4px] bg-[#FDF8F0] border border-[#E8DDD0] p-4"><div className="flex justify-between items-start"><div><div className="text-[#1A0F0A] font-semibold text-[13px] flex items-center gap-2">{p.planet} {p.isRetrograde && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#8B4513] text-white">R</span>}</div><div className="text-[#8B7355] text-[11px] mt-1">{p.sign} • House {p.house} • {p.degree}°</div><div className="text-[#8B7355]/70 text-[10px]">{p.nakshatra} Nakshatra</div></div><div className="text-[18px]">{zodiacInfo[p.sign]?.symbol}</div></div><div className="text-[#6B5D52] text-[12px] mt-3 leading-[1.6]">{p.description}</div></div>))}</div></div>
          </div>
        )}
      </div>
    </div>
  );
}
