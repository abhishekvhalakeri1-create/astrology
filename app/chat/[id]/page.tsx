"use client";
import { useParams } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { formatTime, generateId } from "@/lib/utils";
import { Send, Phone, Video, Mic, Image as ImageIcon, MoreVertical, Star } from "lucide-react";
import Link from "next/link";

export default function ChatRoomPage() {
  const { id } = useParams();
  const { chatRooms, astrologers, addMessage, user } = useAppStore();
  const room = chatRooms.find(r=>r.id===id);
  const astro = astrologers.find(a=>a.id===room?.astrologerId);
  const [input, setInput] = useState("");
  const [balance, setBalance] = useState(room?.balanceSeconds || 600);
  const [isTyping, setIsTyping] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [callActive, setCallActive] = useState<null|"voice"|"video">(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(()=>{
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [room?.messages]);

  useEffect(()=>{
    if (!room?.isActive) return;
    const timer = setInterval(()=>{
      setBalance(prev=>{
        if (prev<=1) {
          clearInterval(timer);
          setShowRating(true);
          return 0;
        }
        return prev-1;
      });
    }, 1000);
    return ()=>clearInterval(timer);
  }, [room?.isActive]);

  if (!room || !astro) return <div className="p-6 text-white">Chat not found</div>;

  const handleSend = () => {
    if (!input.trim()) return;
    const msg = {
      id: generateId(),
      chatRoomId: room.id,
      senderId: user?.id || "user-1",
      senderName: user?.name || "You",
      content: input,
      type: "text" as const,
      timestamp: new Date().toISOString(),
      read: false
    };
    addMessage(room.id, msg);
    setInput("");
    setIsTyping(true);
    setTimeout(()=>{
      setIsTyping(false);
      const replies = [
        "I understand your concern. Let me check your chart.",
        "Your Jupiter is well placed. Good time for new beginnings.",
        "Saturn's transit requires patience. Chant Shani mantra 108 times.",
        "Based on your Dasha, next 3 months are crucial. Stay focused.",
        "I see strong yogas for success. Keep faith and do remedies."
      ];
      const reply = {
        id: generateId(),
        chatRoomId: room.id,
        senderId: astro.id,
        senderName: astro.name,
        content: replies[Math.floor(Math.random()*replies.length)],
        type: "text" as const,
        timestamp: new Date().toISOString(),
        read: false
      };
      addMessage(room.id, reply);
    }, 1500 + Math.random()*1000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px-68px)] lg:h-[calc(100vh-64px)] max-w-[900px] mx-auto">
      {/* Header */}
      <div className="h-[64px] flex items-center justify-between px-4 border-b border-white/10 bg-[#0f0f3a]/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link href="/chat" className="lg:hidden text-white/60">←</Link>
          <img src={astro.avatar} alt={astro.name} className="w-10 h-10 rounded-full object-cover" />
          <div>
            <div className="text-white font-medium text-sm flex items-center gap-1.5">{astro.name} {astro.verified && <span className="w-3 h-3 rounded-full bg-blue-500 flex items-center justify-center text-[8px]">✓</span>}</div>
            <div className="text-emerald-300 text-xs flex items-center gap-1">{isTyping ? "Typing..." : "Online"} • {astro.rating}★</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-mono">⏱ {formatTime(balance)}</div>
          <Button size="icon" variant="ghost" className="rounded-full" onClick={()=>setCallActive("voice")}><Phone className="w-5 h-5" /></Button>
          <Button size="icon" variant="ghost" className="rounded-full" onClick={()=>setCallActive("video")}><Video className="w-5 h-5" /></Button>
          <Button size="icon" variant="ghost" className="rounded-full"><MoreVertical className="w-5 h-5" /></Button>
        </div>
      </div>

      {/* Call Modal */}
      {callActive && (
        <div className="absolute inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-6">
          <div className="w-full max-w-[400px] rounded-[24px] bg-[#15154f] border border-white/10 p-6 text-center">
            <img src={astro.avatar} alt={astro.name} className="w-24 h-24 rounded-full mx-auto mb-4" />
            <div className="text-white font-bold text-lg">{astro.name}</div>
            <div className="text-white/50 text-sm">{callActive==="voice" ? "Voice Call" : "Video Call"} • {formatTime(balance)}</div>
            <div className="flex justify-center gap-4 mt-8">
              <button onClick={()=>setCallActive(null)} className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center"><Phone className="w-6 h-6 text-white rotate-[135deg]" /></button>
              <button className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center"><Mic className="w-6 h-6 text-white" /></button>
              {callActive==="video" && <button className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center"><Video className="w-6 h-6 text-white" /></button>}
            </div>
            <div className="text-white/40 text-xs mt-6">Secure WebRTC • Encrypted</div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0a0a24]">
        <div className="text-center py-2">
          <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/40 text-xs">Consultation started • {room.messages.length} messages • Secure & private</span>
        </div>
        {room.messages.map(m=>{
          const isMe = m.senderId===user?.id || m.senderId==="user-1";
          const isSystem = m.type==="system";
          if (isSystem) return <div key={m.id} className="text-center"><span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">{m.content}</span></div>;
          return (
            <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${isMe ? "bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-br-sm" : "bg-white/[0.08] border border-white/10 text-white rounded-bl-sm"}`}>
                <div className="text-sm">{m.content}</div>
                <div className={`text-[10px] mt-1 ${isMe ? "text-white/60" : "text-white/40"}`}>{new Date(m.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} {isMe && "✓✓"}</div>
              </div>
            </div>
          );
        })}
        {isTyping && <div className="flex justify-start"><div className="bg-white/[0.06] border border-white/10 rounded-2xl rounded-bl-sm px-4 py-3"><div className="flex gap-1"><span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" /><span className="w-2 h-2 bg-white/40 rounded-full animate-bounce [animation-delay:0.2s]" /><span className="w-2 h-2 bg-white/40 rounded-full animate-bounce [animation-delay:0.4s]" /></div></div></div>}
        <div ref={endRef} />
      </div>

      {/* Rating Modal */}
      {showRating && (
        <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="w-full max-w-[360px] rounded-2xl bg-[#15154f] border border-white/10 p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-3 text-2xl">★</div>
            <h3 className="text-white font-bold">Consultation Ended</h3>
            <p className="text-white/60 text-sm mt-1">How was your experience with {astro.name}?</p>
            <div className="flex justify-center gap-1 mt-4">
              {[1,2,3,4,5].map(i=><button key={i} className="w-10 h-10 rounded-full bg-white/5 hover:bg-amber-500/20 text-xl">★</button>)}
            </div>
            <textarea placeholder="Write a review (optional)" className="w-full mt-4 p-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30" rows={3} />
            <div className="flex gap-2 mt-4">
              <Button variant="secondary" className="flex-1" onClick={()=>setShowRating(false)}>Skip</Button>
              <Button variant="gold" className="flex-1" onClick={()=>{setShowRating(false); window.location.href="/bookings"}}>Submit</Button>
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-white/10 bg-[#0f0f3a]/90 backdrop-blur-xl">
        <div className="flex items-center gap-2 max-w-[900px] mx-auto">
          <Button variant="ghost" size="icon" className="rounded-full shrink-0"><ImageIcon className="w-5 h-5" /></Button>
          <div className="flex-1 relative">
            <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter" && handleSend()} placeholder="Type your message..." className="w-full h-11 pl-4 pr-12 rounded-full bg-white/[0.06] border border-white/10 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500/40" />
            <button onClick={handleSend} className="absolute right-1 top-1 w-9 h-9 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 flex items-center justify-center text-white"><Send className="w-4 h-4" /></button>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full shrink-0"><Mic className="w-5 h-5" /></Button>
        </div>
        <div className="text-center text-[10px] text-white/30 mt-2">🔒 End-to-end encrypted • {formatTime(balance)} remaining • Session auto-ends when time expires</div>
      </div>
    </div>
  );
}
