"use client";
import { useAppStore } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Calendar, Clock, Phone, MessageCircle, Video, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function BookingsPage() {
  const { bookings, updateBookingStatus } = useAppStore();
  const [filter, setFilter] = useState<"all"|"upcoming"|"completed"|"cancelled">("all");

  const filtered = filter==="all" ? bookings : bookings.filter(b=> filter==="upcoming" ? ["upcoming","confirmed","pending"].includes(b.status) : b.status===filter);

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[900px] mx-auto">
      <h1 className="text-2xl font-bold">My Bookings</h1>
      <div className="flex gap-2">
        {[
          { id: "all", label: "All" },
          { id: "upcoming", label: "Upcoming" },
          { id: "completed", label: "Completed" },
          { id: "cancelled", label: "Cancelled" },
        ].map(f=>(
          <button key={f.id} onClick={()=>setFilter(f.id as any)} className={`px-4 py-2 rounded-full text-sm font-medium border transition ${filter===f.id ? "bg-white text-black border-white" : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"}`}>{f.label}</button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map(b=>(
          <Card key={b.id} className="hover:bg-white/[0.06] transition">
            <CardContent className="p-4">
              <div className="flex gap-4">
                <img src={b.astrologerAvatar} alt={b.astrologerName} className="w-14 h-14 rounded-2xl object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <div className="text-white font-semibold">{b.astrologerName}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={b.status==="completed" ? "success" : b.status==="cancelled" ? "outline" : "gold"} className="text-[10px]">{b.status.toUpperCase()}</Badge>
                        <span className="flex items-center gap-1 text-white/50 text-xs"><Calendar className="w-3 h-3" /> {b.date}</span>
                        <span className="flex items-center gap-1 text-white/50 text-xs"><Clock className="w-3 h-3" /> {b.time} • {b.duration} min</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-bold">{formatCurrency(b.price)}</div>
                      <div className="flex items-center gap-1 text-white/40 text-xs mt-1">
                        {b.type==="chat" && <MessageCircle className="w-3 h-3" />}
                        {b.type==="voice" && <Phone className="w-3 h-3" />}
                        {b.type==="video" && <Video className="w-3 h-3" />}
                        {b.type}
                      </div>
                    </div>
                  </div>
                  {b.notes && <div className="text-white/50 text-xs mt-2">Note: {b.notes}</div>}
                  <div className="flex gap-2 mt-3">
                    {b.status==="upcoming" || b.status==="confirmed" ? (
                      <>
                        <Link href={`/chat?booking=${b.id}`}><Button size="sm" variant="secondary" className="rounded-full">Join {b.type}</Button></Link>
                        <Button size="sm" variant="ghost" onClick={()=>updateBookingStatus(b.id, "cancelled")} className="rounded-full text-white/60"><X className="w-3 h-3 mr-1" /> Cancel</Button>
                      </>
                    ) : b.status==="completed" ? (
                      <Link href={`/astrologers/${b.astrologerId}`}><Button size="sm" variant="outline" className="rounded-full">Re-book</Button></Link>
                    ) : null}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length===0 && <div className="text-center py-16 text-white/40">No bookings in this category.<br/><Link href="/astrologers" className="text-violet-300 hover:text-white text-sm mt-2 inline-block">Find astrologers →</Link></div>}
      </div>
    </div>
  );
}
