"use client";
import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Users, DollarSign, Calendar, Star, Shield, AlertTriangle, TrendingUp, Eye } from "lucide-react";

export default function AdminDashboard() {
  const { astrologers, bookings, user } = useAppStore();
  const [tab, setTab] = useState("overview");

  const stats = {
    totalUsers: 52340,
    totalAstrologers: astrologers.length,
    totalBookings: bookings.length + 1240,
    revenue: 1254000,
    pendingVerifications: astrologers.filter(a=>!a.verified).length,
    activeNow: astrologers.filter(a=>a.isOnline).length
  };

  return (
    <div className="p-4 lg:p-6 max-w-[1300px] mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <p className="text-white/50 text-sm">Manage users, astrologers, bookings, payments, content</p>
        </div>
        <Badge variant="gold">Admin • {user?.name}</Badge>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: "overview", label: "Overview" },
          { id: "users", label: "Users" },
          { id: "astrologers", label: "Astrologers" },
          { id: "bookings", label: "Bookings" },
          { id: "payments", label: "Payments" },
          { id: "content", label: "Content" },
          { id: "reports", label: "Reports" },
        ].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} className={`px-4 py-2 rounded-full text-sm font-medium border whitespace-nowrap transition ${tab===t.id ? "bg-white text-black border-white" : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"}`}>{t.label}</button>
        ))}
      </div>

      {tab==="overview" && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-violet-600 to-indigo-600 border-0"><CardContent className="p-4"><Users className="w-5 h-5 text-white/80 mb-2" /><div className="text-white/70 text-xs">Total Users</div><div className="text-white text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div><div className="text-white/60 text-xs mt-1">+12% this month</div></CardContent></Card>
            <Card className="bg-gradient-to-br from-emerald-600 to-teal-600 border-0"><CardContent className="p-4"><Shield className="w-5 h-5 text-white/80 mb-2" /><div className="text-white/70 text-xs">Astrologers</div><div className="text-white text-2xl font-bold">{stats.totalAstrologers}</div><div className="text-white/60 text-xs mt-1">{stats.activeNow} online now</div></CardContent></Card>
            <Card className="bg-gradient-to-br from-amber-500 to-orange-600 border-0"><CardContent className="p-4"><Calendar className="w-5 h-5 text-white/80 mb-2" /><div className="text-white/70 text-xs">Total Bookings</div><div className="text-white text-2xl font-bold">{stats.totalBookings.toLocaleString()}</div><div className="text-white/60 text-xs mt-1">+8% this week</div></CardContent></Card>
            <Card className="bg-gradient-to-br from-pink-500 to-rose-600 border-0"><CardContent className="p-4"><DollarSign className="w-5 h-5 text-white/80 mb-2" /><div className="text-white/70 text-xs">Revenue</div><div className="text-white text-2xl font-bold">{formatCurrency(stats.revenue)}</div><div className="text-white/60 text-xs mt-1">+15% this month</div></CardContent></Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><h3 className="font-bold flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-400" /> Pending Verifications ({stats.pendingVerifications})</h3></CardHeader>
              <CardContent className="space-y-3">
                {astrologers.filter(a=>!a.verified).map(a=>(
                  <div key={a.id} className="flex gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                    <img src={a.avatar} alt={a.name} className="w-12 h-12 rounded-full" />
                    <div className="flex-1"><div className="text-white font-medium text-sm">{a.name}</div><div className="text-white/50 text-xs">{a.experience} yrs • {a.specializations.join(", ")}</div><div className="text-white/40 text-xs">{a.certifications.join(", ")}</div></div>
                    <div className="flex flex-col gap-1"><Button size="sm" variant="gold" className="h-7 text-xs">Approve</Button><Button size="sm" variant="ghost" className="h-7 text-xs">Reject</Button></div>
                  </div>
                ))}
                {stats.pendingVerifications===0 && <div className="text-white/40 text-sm text-center py-6">All caught up! No pending verifications.</div>}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><h3 className="font-bold">Recent Bookings</h3></CardHeader>
              <CardContent className="space-y-2">
                {bookings.slice(0,5).map(b=>(
                  <div key={b.id} className="flex justify-between items-center p-2 rounded-xl bg-white/[0.03] border border-white/5">
                    <div className="flex items-center gap-2"><img src={b.astrologerAvatar} alt="" className="w-8 h-8 rounded-full" /><div><div className="text-white text-xs font-medium">{b.astrologerName}</div><div className="text-white/40 text-[11px]">{b.date} • {b.type} • {b.duration}m</div></div></div>
                    <div className="text-right"><div className="text-white text-xs font-bold">{formatCurrency(b.price)}</div><Badge variant={b.status==="completed" ? "success" : "gold"} className="text-[9px]">{b.status}</Badge></div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><h3 className="font-bold">Platform Commission</h3></CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-xl bg-white/5 p-3 flex justify-between"><span className="text-white/50 text-sm">Total Revenue</span><span className="text-white font-bold">{formatCurrency(stats.revenue)}</span></div>
                <div className="rounded-xl bg-white/5 p-3 flex justify-between"><span className="text-white/50 text-sm">Astrologer Payouts (90%)</span><span className="text-white font-bold">{formatCurrency(stats.revenue*0.9)}</span></div>
                <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 flex justify-between"><span className="text-amber-300 text-sm">Platform Commission (10%)</span><span className="text-amber-300 font-bold">{formatCurrency(stats.revenue*0.1)}</span></div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden"><div className="h-full w-[90%] bg-violet-500 rounded-full" /></div>
                <div className="text-[11px] text-white/40">Commission model: 90% to astrologer, 10% platform. Low commission to support astrologers.</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><h3 className="font-bold">Content Management</h3></CardHeader>
              <CardContent className="grid grid-cols-2 gap-2">
                <button className="h-14 rounded-xl bg-white/5 border border-white/10 text-sm hover:bg-white/10">Manage Horoscopes</button>
                <button className="h-14 rounded-xl bg-white/5 border border-white/10 text-sm hover:bg-white/10">Manage Articles</button>
                <button className="h-14 rounded-xl bg-white/5 border border-white/10 text-sm hover:bg-white/10">Banners & Offers</button>
                <button className="h-14 rounded-xl bg-white/5 border border-white/10 text-sm hover:bg-white/10">Notifications</button>
                <button className="h-14 rounded-xl bg-white/5 border border-white/10 text-sm hover:bg-white/10 col-span-2">Moderate Reviews</button>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {tab==="astrologers" && (
        <Card>
          <CardHeader><h3 className="font-bold">All Astrologers ({astrologers.length})</h3></CardHeader>
          <CardContent className="space-y-2">
            {astrologers.map(a=>(
              <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                <img src={a.avatar} alt={a.name} className="w-10 h-10 rounded-full" />
                <div className="flex-1 min-w-0"><div className="text-white text-sm font-medium flex items-center gap-2">{a.name} {a.verified ? <Badge variant="success" className="text-[9px]">Verified</Badge> : <Badge variant="outline" className="text-[9px]">Pending</Badge>}</div><div className="text-white/40 text-xs truncate">{a.specializations.join(", ")} • {a.experience}yrs • {a.rating}★ • {formatCurrency(a.pricePerMinute)}/min</div></div>
                <div className="flex gap-1"><Button size="sm" variant="ghost" className="h-8 w-8 p-0"><Eye className="w-4 h-4" /></Button><Button size="sm" variant={a.verified ? "secondary" : "gold"} className="h-8 text-xs">{a.verified ? "Suspend" : "Verify"}</Button></div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {tab!=="overview" && tab!=="astrologers" && (
        <Card><CardContent className="p-12 text-center text-white/40">Section "{tab}" - Admin functionality for {tab} management would be implemented here with full CRUD, search, filters, and moderation tools. Demo data shown in overview.</CardContent></Card>
      )}
    </div>
  );
}
