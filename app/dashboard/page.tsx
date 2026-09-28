"use client";
import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { User, Wallet, Calendar, MessageCircle, Star, Settings, LogOut, FileText, HelpCircle } from "lucide-react";

export default function DashboardPage() {
  const { user, birthProfiles, bookings, favorites, astrologers, walletBalance, questions, logout } = useAppStore();
  const upcoming = bookings.filter(b=>["upcoming","confirmed"].includes(b.status)).length;

  return (
    <div className="p-4 lg:p-6 max-w-[1100px] mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <img src={user?.avatar} alt={user?.name} className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400/50" />
        <div>
          <h1 className="text-2xl font-bold">{user?.name}</h1>
          <div className="text-white/50 text-sm">{user?.email} • {user?.phone}</div>
          <div className="flex gap-2 mt-2">
            <span className="px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 text-xs">User</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs">{formatCurrency(walletBalance)} Wallet</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Bookings", value: bookings.length, icon: Calendar, href: "/bookings", color: "from-violet-600 to-indigo-600" },
          { label: "Birth Profiles", value: birthProfiles.length, icon: Star, href: "/birth-chart", color: "from-amber-500 to-orange-600" },
          { label: "Favorites", value: favorites.length, icon: User, href: "/astrologers", color: "from-pink-500 to-rose-600" },
          { label: "Questions", value: questions.length, icon: HelpCircle, href: "/ask-question", color: "from-emerald-500 to-teal-600" },
        ].map(c=>{
          const Icon = c.icon;
          return (
            <Link key={c.label} href={c.href} className={`rounded-2xl bg-gradient-to-br ${c.color} p-4 hover:scale-[1.02] transition`}>
              <Icon className="w-5 h-5 text-white mb-2" />
              <div className="text-2xl font-bold text-white">{c.value}</div>
              <div className="text-white/80 text-xs">{c.label}</div>
            </Link>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row justify-between items-center"><h3 className="font-bold">Birth Profiles</h3><Link href="/birth-chart"><Button size="sm" variant="secondary">Manage</Button></Link></CardHeader>
          <CardContent className="space-y-2">
            {birthProfiles.map(p=>(
              <div key={p.id} className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/10">
                <div><div className="text-white font-medium text-sm">{p.label} - {p.fullName}</div><div className="text-white/40 text-xs">{p.dob} • {p.birthPlace}</div></div>
                <div className="text-white/40 text-xs">{p.gender}</div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row justify-between items-center"><h3 className="font-bold">Favorite Astrologers</h3><Link href="/astrologers"><Button size="sm" variant="secondary">Browse</Button></Link></CardHeader>
          <CardContent className="space-y-2">
            {favorites.map(fid=>{
              const a = astrologers.find(x=>x.id===fid);
              if (!a) return null;
              return (
                <div key={fid} className="flex items-center gap-3 p-2 rounded-xl bg-white/5">
                  <img src={a.avatar} alt={a.name} className="w-10 h-10 rounded-full" />
                  <div className="flex-1"><div className="text-white text-sm font-medium">{a.name}</div><div className="text-white/40 text-xs">{a.specializations[0]} • {a.rating}★</div></div>
                  <Link href={`/astrologers/${a.id}`}><Button size="sm" variant="ghost">View</Button></Link>
                </div>
              );
            })}
            {favorites.length===0 && <div className="text-white/40 text-sm text-center py-4">No favorites yet.</div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><h3 className="font-bold">Quick Actions</h3></CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            <Link href="/wallet" className="h-12 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2 px-3 text-sm hover:bg-white/10"><Wallet className="w-4 h-4" /> Wallet</Link>
            <Link href="/bookings" className="h-12 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2 px-3 text-sm hover:bg-white/10"><Calendar className="w-4 h-4" /> Bookings</Link>
            <Link href="/chat" className="h-12 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2 px-3 text-sm hover:bg-white/10"><MessageCircle className="w-4 h-4" /> Chats</Link>
            <Link href="/articles" className="h-12 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2 px-3 text-sm hover:bg-white/10"><FileText className="w-4 h-4" /> Articles</Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><h3 className="font-bold">Settings</h3></CardHeader>
          <CardContent className="space-y-2">
            <button className="w-full h-11 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2 px-3 text-sm hover:bg-white/10 text-left"><Settings className="w-4 h-4" /> Account Settings</button>
            <button onClick={()=>{logout(); window.location.href="/"}} className="w-full h-11 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2 px-3 text-sm hover:bg-red-500/20 text-red-300 text-left"><LogOut className="w-4 h-4" /> Logout</button>
            <div className="text-[11px] text-white/30 pt-2">AstroConnect v1.0 • Made for low-end devices • Multi-language • Secure • Encrypted</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
