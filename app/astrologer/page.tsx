"use client";
import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Calendar, DollarSign, Star, Users, Clock, MessageCircle, Phone, Video, TrendingUp } from "lucide-react";

export default function AstrologerDashboard() {
  const { astrologers, bookings } = useAppStore();
  const me = astrologers[0]; // demo astrologer
  const [isOnline, setIsOnline] = useState(true);
  const [price, setPrice] = useState(me.pricePerMinute);

  const myBookings = bookings.filter(b=>b.astrologerId===me.id);
  const todayEarnings = 1240;
  const weekEarnings = 8650;
  const monthEarnings = 34200;
  const totalEarnings = 125400;

  return (
    <div className="p-4 lg:p-6 max-w-[1200px] mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Astrologer Dashboard</h1>
          <p className="text-white/50 text-sm">Welcome, {me.name} • {me.verified ? "Verified" : "Pending Verification"}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${isOnline ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-white/5 text-white/50"}`}>{isOnline ? "● Online" : "Offline"}</span>
          <Button size="sm" variant={isOnline ? "secondary" : "gold"} onClick={()=>setIsOnline(!isOnline)}>{isOnline ? "Go Offline" : "Go Online"}</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Today's Earnings", value: formatCurrency(todayEarnings), icon: DollarSign, color: "from-emerald-600 to-teal-600" },
          { label: "Weekly Earnings", value: formatCurrency(weekEarnings), icon: TrendingUp, color: "from-violet-600 to-indigo-600" },
          { label: "Monthly Earnings", value: formatCurrency(monthEarnings), icon: Calendar, color: "from-amber-500 to-orange-600" },
          { label: "Total Earnings", value: formatCurrency(totalEarnings), icon: Star, color: "from-pink-500 to-rose-600" },
        ].map(c=>{
          const Icon = c.icon;
          return (
            <Card key={c.label} className={`bg-gradient-to-br ${c.color} border-0`}>
              <CardContent className="p-4">
                <Icon className="w-5 h-5 text-white/80 mb-2" />
                <div className="text-white/70 text-xs">{c.label}</div>
                <div className="text-white text-xl font-bold mt-1">{c.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row justify-between items-center"><h3 className="font-bold">Upcoming Consultations</h3><Badge variant="gold">{myBookings.filter(b=>["upcoming","confirmed"].includes(b.status)).length} pending</Badge></CardHeader>
            <CardContent className="space-y-3">
              {myBookings.map(b=>(
                <div key={b.id} className="flex gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/10">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-sm font-bold">{b.astrologerName[0]}</div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div className="text-white text-sm font-medium">User Consultation • {b.duration} min • {b.type}</div>
                      <Badge variant={b.status==="completed" ? "success" : "gold"} className="text-[10px]">{b.status}</Badge>
                    </div>
                    <div className="text-white/50 text-xs mt-1">{b.date} at {b.time} • {formatCurrency(b.price)}</div>
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" variant="secondary" className="h-7 text-xs rounded-full">Accept</Button>
                      <Button size="sm" variant="ghost" className="h-7 text-xs rounded-full">Reschedule</Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><h3 className="font-bold">Recent Chats</h3></CardHeader>
            <CardContent className="space-y-2">
              {[
                { user: "Arjun Kumar", msg: "Will I get promotion?", time: "2m ago", unread: 2 },
                { user: "Priya S.", msg: "Thank you Guruji!", time: "15m ago", unread: 0 },
                { user: "Rahul M.", msg: "When is good muhurat?", time: "1h ago", unread: 1 },
              ].map((c,i)=>(
                <div key={i} className="flex gap-3 p-3 rounded-xl hover:bg-white/5 transition">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">{c.user[0]}</div>
                  <div className="flex-1"><div className="text-white text-sm font-medium">{c.user}</div><div className="text-white/50 text-xs truncate">{c.msg}</div></div>
                  <div className="text-right"><div className="text-white/30 text-xs">{c.time}</div>{c.unread>0 && <div className="w-5 h-5 rounded-full bg-violet-600 text-white text-xs flex items-center justify-center mt-1">{c.unread}</div>}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><h3 className="font-bold">Profile & Pricing</h3></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <img src={me.avatar} alt={me.name} className="w-16 h-16 rounded-2xl object-cover" />
                <div><div className="text-white font-bold">{me.name}</div><div className="text-white/50 text-xs">{me.experience} yrs • {me.rating}★ • {me.consultationCount} consultations</div><Badge variant="success" className="mt-1 text-[10px]">Verified</Badge></div>
              </div>
              <div>
                <label className="text-xs text-white/60">Price per minute</label>
                <div className="flex gap-2 mt-1">
                  <input type="number" value={price} onChange={e=>setPrice(parseInt(e.target.value)||0)} className="flex-1 h-10 px-3 rounded-xl bg-white/[0.06] border border-white/10 text-white text-sm" />
                  <Button size="sm" variant="gold">Update</Button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { type: "Chat", enabled: me.chatAvailable, icon: MessageCircle },
                  { type: "Call", enabled: me.callAvailable, icon: Phone },
                  { type: "Video", enabled: me.videoAvailable, icon: Video },
                ].map(t=>{
                  const Icon = t.icon;
                  return <div key={t.type} className={`h-16 rounded-xl border flex flex-col items-center justify-center gap-1 ${t.enabled ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300" : "bg-white/5 border-white/10 text-white/40"}`}><Icon className="w-4 h-4" /><span className="text-xs">{t.type}</span></div>;
                })}
              </div>
              <Button variant="secondary" className="w-full">Edit Profile</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><h3 className="font-bold">Earnings & Withdrawals</h3></CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-xl bg-white/5 p-3 flex justify-between"><span className="text-white/50 text-sm">Pending Withdrawal</span><span className="text-amber-300 font-bold">{formatCurrency(4500)}</span></div>
              <div className="rounded-xl bg-white/5 p-3 flex justify-between"><span className="text-white/50 text-sm">Available to Withdraw</span><span className="text-emerald-300 font-bold">{formatCurrency(12500)}</span></div>
              <Button variant="gold" className="w-full">Withdraw Earnings</Button>
              <div className="text-[11px] text-white/40 text-center">Payout via UPI/Bank • 24h processing • 10% platform commission</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><h3 className="font-bold">Stats</h3></CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/5 p-3 text-center"><div className="text-white/40 text-xs">Total Consultations</div><div className="text-white font-bold text-lg">{me.consultationCount}</div></div>
              <div className="rounded-xl bg-white/5 p-3 text-center"><div className="text-white/40 text-xs">Rating</div><div className="text-amber-300 font-bold text-lg">{me.rating}★</div></div>
              <div className="rounded-xl bg-white/5 p-3 text-center"><div className="text-white/40 text-xs">Response Time</div><div className="text-white font-bold">~2m</div></div>
              <div className="rounded-xl bg-white/5 p-3 text-center"><div className="text-white/40 text-xs">Online Hours</div><div className="text-white font-bold">8h/day</div></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
