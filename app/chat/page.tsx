"use client";
import { useAppStore } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { MessageCircle, Phone, Video } from "lucide-react";

export default function ChatListPage() {
  const { chatRooms, astrologers } = useAppStore();
  return (
    <div className="p-4 lg:p-6 max-w-[700px] mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Chats</h1>
      <div className="space-y-3">
        {chatRooms.map(room=>{
          const astro = astrologers.find(a=>a.id===room.astrologerId);
          const lastMsg = room.messages[room.messages.length-1];
          return (
            <Link key={room.id} href={`/chat/${room.id}`}>
              <Card className="hover:bg-white/[0.08] transition mb-3">
                <CardContent className="p-4 flex gap-3">
                  <div className="relative">
                    <img src={astro?.avatar} alt={astro?.name} className="w-12 h-12 rounded-full object-cover" />
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-[#0a0a24] ${room.isActive ? "bg-emerald-500" : "bg-gray-500"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <div className="text-white font-medium text-sm">{astro?.name}</div>
                      <div className="text-white/40 text-xs">{new Date(lastMsg.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                    </div>
                    <div className="text-white/50 text-xs truncate mt-1">{lastMsg.content}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${room.isActive ? "bg-emerald-500/20 text-emerald-300" : "bg-white/5 text-white/40"}`}>{room.isActive ? `Active • ${Math.floor(room.balanceSeconds/60)}m left` : "Ended"}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
        {chatRooms.length===0 && <div className="text-center py-16 text-white/40">No chats yet.<br/>Start a consultation with an astrologer.</div>}
      </div>
    </div>
  );
}
