"use client";
import { useParams, useSearchParams } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { reviews } from "@/lib/seedData";
import { Star, MessageCircle, Phone, Video, Clock, Shield, Award, Calendar, Check } from "lucide-react";
import Link from "next/link";

export default function AstrologerProfilePage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const initialAction = searchParams.get('action');
  const { astrologers, addBooking, createChatRoom, walletBalance, deductMoney, addMoney, language } = useAppStore();
  const astro = astrologers.find(a=>a.id===id);
  const [selectedType, setSelectedType] = useState<"chat"|"voice"|"video">((initialAction as any) || "chat");
  const [duration, setDuration] = useState(20);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState("10:00");
  const [showBooking, setShowBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  if (!astro) return <div className="p-6 text-white">Astrologer not found</div>;

  const price = astro.pricePerMinute * duration;
  const astroReviews = reviews.filter(r=>r.astrologerId===astro.id);

  const handleBook = () => {
    if (walletBalance < price) {
      alert(`Insufficient wallet balance. Need ${formatCurrency(price)}, you have ${formatCurrency(walletBalance)}. Please add money.`);
      return;
    }
    const ok = deductMoney(price, `${selectedType} with ${astro.name} - ${duration} mins`);
    if (!ok) return;
    const booking = {
      id: `book-${Date.now()}`,
      userId: "user-1",
      astrologerId: astro.id,
      astrologerName: astro.name,
      astrologerAvatar: astro.avatar,
      type: selectedType,
      date: selectedDate,
      time: selectedTime,
      duration,
      price,
      status: "confirmed" as const,
      createdAt: new Date().toISOString()
    };
    addBooking(booking);
    if (selectedType==="chat") {
      const roomId = createChatRoom(astro.id, booking.id, duration*60);
      window.location.href = `/chat/${roomId}`;
    } else {
      setBookingSuccess(true);
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1100px] mx-auto">
      <Link href="/astrologers" className="text-violet-300 text-sm hover:text-white">← Back to astrologers</Link>
      
      <div className="grid lg:grid-cols-[1fr_380px] gap-6">
        <div className="space-y-6">
          <Card className="overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-violet-700 to-indigo-700 relative">
              <div className="absolute -bottom-10 left-6 w-20 h-20 rounded-2xl overflow-hidden border-4 border-[#0a0a24] bg-[#0a0a24]">
                <img src={astro.avatar} alt={astro.name} className="w-full h-full object-cover" />
              </div>
              <div className="absolute top-4 right-4 flex gap-2">
                {astro.verified && <Badge variant="success" className="bg-white text-black">✓ Verified</Badge>}
                <Badge variant="gold">{astro.isOnline ? "● Available Now" : "Offline"}</Badge>
              </div>
            </div>
            <CardContent className="pt-12 p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold text-white flex items-center gap-2">{astro.name} {astro.verified && <Shield className="w-5 h-5 text-blue-400" />}</h1>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="flex items-center gap-1 text-amber-300"><Star className="w-4 h-4 fill-amber-300" /> {astro.rating} • {astro.reviewCount} reviews</span>
                    <span className="text-white/50 text-sm">{astro.consultationCount.toLocaleString()} consultations</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">{formatCurrency(astro.pricePerMinute)}<span className="text-sm font-normal text-white/50">/min</span></div>
                  <div className="text-xs text-white/50">{astro.availableHours}</div>
                </div>
              </div>
              <p className="text-white/70 text-sm mt-4 leading-relaxed">{astro.bio}</p>
              
              <div className="grid grid-cols-3 gap-3 mt-6">
                <div className="rounded-xl bg-white/5 p-3 text-center">
                  <div className="text-white/40 text-xs">Experience</div>
                  <div className="text-white font-bold">{astro.experience} Years</div>
                </div>
                <div className="rounded-xl bg-white/5 p-3 text-center">
                  <div className="text-white/40 text-xs">Languages</div>
                  <div className="text-white font-bold text-xs">{astro.languages.slice(0,2).join(", ")}</div>
                </div>
                <div className="rounded-xl bg-white/5 p-3 text-center">
                  <div className="text-white/40 text-xs">Rating</div>
                  <div className="text-white font-bold">{astro.rating}/5</div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-semibold mb-2">Specializations</h3>
                <div className="flex flex-wrap gap-2">
                  {astro.specializations.map(s=><Badge key={s} variant="outline">{s}</Badge>)}
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-semibold mb-2">Certifications</h3>
                <div className="flex flex-wrap gap-2">
                  {astro.certifications.map(c=><div key={c} className="px-3 py-1 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-300 text-xs flex items-center gap-1"><Award className="w-3 h-3" /> {c}</div>)}
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-semibold mb-3">Availability</h3>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { type: "chat", label: "Chat", available: astro.chatAvailable, icon: MessageCircle },
                    { type: "voice", label: "Voice Call", available: astro.callAvailable, icon: Phone },
                    { type: "video", label: "Video Call", available: astro.videoAvailable, icon: Video },
                  ].map(t=>{
                    const Icon = t.icon;
                    return (
                      <div key={t.type} className={`rounded-xl border p-3 text-center ${t.available ? "bg-emerald-500/10 border-emerald-500/20" : "bg-white/5 border-white/10 opacity-50"}`}>
                        <Icon className={`w-5 h-5 mx-auto mb-1 ${t.available ? "text-emerald-400" : "text-white/40"}`} />
                        <div className={`text-xs font-medium ${t.available ? "text-emerald-300" : "text-white/40"}`}>{t.label}</div>
                        <div className="text-[10px] text-white/40">{t.available ? "Available" : "Not Available"}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><h3 className="font-bold">Customer Reviews ({astroReviews.length})</h3></CardHeader>
            <CardContent className="space-y-4">
              {astroReviews.map(r=>(
                <div key={r.id} className="border-b border-white/10 last:border-0 pb-4 last:pb-0">
                  <div className="flex justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-xs font-bold">{r.userName[0]}</div>
                      <div>
                        <div className="text-white text-sm font-medium">{r.userName}</div>
                        <div className="flex gap-0.5">{Array.from({length:5}).map((_,i)=><Star key={i} className={`w-3 h-3 ${i<r.rating ? "fill-amber-400 text-amber-400" : "text-white/20"}`} />)}</div>
                      </div>
                    </div>
                    <div className="text-white/40 text-xs">{new Date(r.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div className="text-white/70 text-sm mt-2">{r.comment}</div>
                  {r.verified && <Badge variant="success" className="mt-2 text-[10px]">Verified Consultation</Badge>}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="sticky top-[80px]">
            <CardHeader>
              <h3 className="font-bold text-lg">Book Consultation</h3>
              <p className="text-white/50 text-xs">Select type, duration and time</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs text-white/60 mb-2 block">Consultation Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "chat", label: "Chat", icon: MessageCircle, enabled: astro.chatAvailable },
                    { id: "voice", label: "Call", icon: Phone, enabled: astro.callAvailable },
                    { id: "video", label: "Video", icon: Video, enabled: astro.videoAvailable },
                  ].map(t=>{
                    const Icon = t.icon;
                    const selected = selectedType===t.id;
                    return (
                      <button key={t.id} disabled={!t.enabled} onClick={()=>setSelectedType(t.id as any)} className={`h-16 rounded-xl border flex flex-col items-center justify-center gap-1 transition ${selected ? "bg-violet-600 border-violet-500 text-white" : t.enabled ? "bg-white/5 border-white/10 text-white/70 hover:bg-white/10" : "bg-white/5 border-white/5 text-white/20"}`}>
                        <Icon className="w-5 h-5" />
                        <span className="text-xs">{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs text-white/60 mb-2 block">Duration</label>
                <div className="grid grid-cols-3 gap-2">
                  {[10,20,30,45,60].map(d=>(
                    <button key={d} onClick={()=>setDuration(d)} className={`h-10 rounded-xl border text-sm font-medium transition ${duration===d ? "bg-amber-500 border-amber-500 text-black" : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"}`}>
                      {d} min
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white/60 mb-1 block">Date</label>
                  <input type="date" value={selectedDate} onChange={e=>setSelectedDate(e.target.value)} className="w-full h-10 px-3 rounded-xl bg-white/[0.06] border border-white/10 text-sm text-white" />
                </div>
                <div>
                  <label className="text-xs text-white/60 mb-1 block">Time</label>
                  <select value={selectedTime} onChange={e=>setSelectedTime(e.target.value)} className="w-full h-10 px-3 rounded-xl bg-white/[0.06] border border-white/10 text-sm text-white">
                    {Array.from({length:12}).map((_,i)=>{
                      const hour = 9+i;
                      return <option key={hour} value={`${hour}:00`} className="bg-[#0a0a24]">{hour}:00 {hour>=12 ? "PM" : "AM"}</option>;
                    })}
                  </select>
                </div>
              </div>

              <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3 space-y-2">
                <div className="flex justify-between text-sm"><span className="text-white/50">Price ({duration} min × {formatCurrency(astro.pricePerMinute)})</span><span className="text-white">{formatCurrency(price)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-white/50">GST (5%)</span><span className="text-white">{formatCurrency(Math.round(price*0.05))}</span></div>
                <div className="flex justify-between text-sm font-bold border-t border-white/10 pt-2"><span className="text-white">Total</span><span className="text-amber-300">{formatCurrency(price + Math.round(price*0.05))}</span></div>
                <div className="text-xs text-white/40">Wallet Balance: {formatCurrency(walletBalance)}</div>
              </div>

              {bookingSuccess ? (
                <div className="rounded-xl bg-emerald-500/20 border border-emerald-500/30 p-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center mx-auto mb-2"><Check className="w-6 h-6 text-white" /></div>
                  <div className="text-white font-bold">Booking Confirmed!</div>
                  <div className="text-emerald-200 text-xs mt-1">Your {selectedType} consultation is scheduled for {selectedDate} at {selectedTime}</div>
                  <div className="flex gap-2 mt-3">
                    <Link href="/bookings" className="flex-1"><Button variant="secondary" className="w-full">View Bookings</Button></Link>
                    <Link href={`/chat`} className="flex-1"><Button variant="gold" className="w-full">Go to Chat</Button></Link>
                  </div>
                </div>
              ) : (
                <Button onClick={handleBook} variant="gold" size="lg" className="w-full rounded-xl">
                  <Calendar className="w-4 h-4 mr-2" /> Confirm Booking • {formatCurrency(price + Math.round(price*0.05))}
                </Button>
              )}

              <div className="text-[11px] text-white/40 text-center">Secure payment via UPI, Cards, NetBanking, Wallet. 100% refund if astrologer doesn't join.</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
