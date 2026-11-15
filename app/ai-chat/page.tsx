"use client";
import { useState, useRef, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { generateId } from "@/lib/utils";
import { Bot, Send, Sparkles, AlertTriangle } from "lucide-react";
import { calculateBirthChart } from "@/lib/birthChart";

interface AIMessage { id: string; role: "user"|"assistant"; content: string; timestamp: string; }

export default function AIChatPage() {
  const { birthProfiles, activeBirthProfileId, language } = useAppStore();
  const activeProfile = birthProfiles.find(p=>p.id===activeBirthProfileId);
  const chart = activeProfile ? calculateBirthChart(activeProfile) : null;
  const [messages, setMessages] = useState<AIMessage[]>([
    { id: "1", role: "assistant", content: `Namaste! I am AstroAI, your Vedic astrology guide. ${activeProfile ? `I can see you are ${chart?.sunSign} with ${chart?.moonSign} Moon and ${chart?.ascendant} Ascendant.` : ""} Ask me anything about career, love, marriage, or your birth chart. Remember, my guidance is for self-reflection, not guaranteed predictions.`, timestamp: new Date().toISOString() }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(()=>{ endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const getAIResponse = (q: string): string => {
    const lower = q.toLowerCase();
    if (lower.includes("job") || lower.includes("career")) {
      return `Based on ${chart ? `${chart.sunSign} Sun and 10th house lord ${chart.houses[9]?.lord}` : "your chart"}, career prospects look promising. ${chart?.dasha ? `You are in ${chart.dasha.currentDasha} Dasha - good for growth if you work hard.` : ""} Jupiter transit in your 10th house from June brings opportunities. Focus on skill upgrade, networking, and avoid job hopping now. Remedy: Chant Guru mantra Thursday and wear yellow. Remember this is guidance, not guarantee - your effort matters most.`;
    }
    if (lower.includes("marriage") || lower.includes("love")) {
      return `Love & marriage: ${chart ? `Your 7th house is ${chart.houses[6]?.sign} with lord ${chart.houses[6]?.lord}. Venus position indicates` : ""} affectionate nature. If single, Oct-Dec favorable for meeting someone meaningful. For married, communication is key - Mercury retrograde may cause misunderstandings. Be patient, listen. Remedy: Strengthen Venus with white flowers Friday, respect partner. Astrology shows tendencies, your choices create reality.`;
    }
    if (lower.includes("moon") || lower.includes("sun") || lower.includes("ascendant") || lower.includes("birth chart")) {
      if (!chart) return "Please add your birth details in Birth Chart section to get personalized chart explanation.";
      return `Your chart: Sun in ${chart.sunSign} - your soul purpose is ${chart.planets.find(p=>p.planet==="Sun")?.description}. Moon in ${chart.moonSign} - mind is ${chart.moonSign==="Cancer" ? "emotional and nurturing" : "analytical"}. Ascendant ${chart.ascendant} - how world sees you. Strongest planet: ${chart.planets.sort((a,b)=>b.degree-a.degree)[0]?.planet}. Current Dasha ${chart.dasha.currentDasha} teaches ${chart.dasha.currentDasha==="Saturn" ? "discipline" : chart.dasha.currentDasha==="Jupiter" ? "wisdom" : "transformation"}. For detailed analysis, consult verified astrologer.`;
    }
    if (lower.includes("money") || lower.includes("finance")) {
      return `Finance: ${chart ? `2nd house ${chart.houses[1]?.sign} and 11th house ${chart.houses[10]?.sign} indicate` : ""} steady income but avoid speculation during Rahu period. Best investments: learning, health, long-term. Avoid lending to friends now. Save 20% monthly. Remedy: Lakshmi puja Friday, keep North direction clean (Vastu). This is not financial advice - consult professional for investments.`;
    }
    if (lower.includes("health")) {
      return `Health astrology: Moon indicates mental peace, Saturn discipline. Current transit suggests watch diet, include water, light exercise. Moon in ${chart?.moonSign || "favorable"} supports recovery if you maintain routine. Sleep before 11pm, avoid excess screen. For serious concerns, see doctor - astrology is complementary, not medical advice. Remedy: Surya Namaskar daily, chant Maha Mrityunjaya for vitality.`;
    }
    return `Thank you for asking: "${q}". Based on Vedic principles and ${chart ? `your ${chart.sunSign} nature` : "general transits"}, I see this as time for introspection and action. Planetary positions show opportunities when you align effort with timing. Focus on what you can control, do simple remedies with faith, and consult verified astrologer for birth-specific guidance. Remember, astrology is map, you are driver. Would you like to know about specific area like career, love, or Dasha?`;
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: AIMessage = { id: generateId(), role: "user", content: input, timestamp: new Date().toISOString() };
    setMessages(prev=>[...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    setTimeout(()=>{
      const aiMsg: AIMessage = { id: generateId(), role: "assistant", content: getAIResponse(userMsg.content), timestamp: new Date().toISOString() };
      setMessages(prev=>[...prev, aiMsg]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px-68px)] lg:h-[calc(100vh-64px)] max-w-[800px] mx-auto">
      <div className="p-4 border-b border-white/10 bg-[#0f0f3a]/80 backdrop-blur-xl flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center"><Bot className="w-5 h-5 text-white" /></div>
        <div>
          <div className="text-white font-bold flex items-center gap-2">AstroAI <Sparkles className="w-4 h-4 text-amber-300" /></div>
          <div className="text-white/50 text-xs">AI Astrologer • Instant • 24/7 • {activeProfile ? `Using ${activeProfile.fullName}'s chart` : "Add birth details for personalized reading"}</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0a0a24]">
        <Card className="bg-amber-500/10 border-amber-500/20">
          <CardContent className="p-3 flex gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
            <p className="text-amber-200/80 text-xs">AI-generated astrology guidance is not guaranteed or professional financial, medical, or legal advice. For serious decisions, consult qualified professional and verified astrologer. For entertainment & self-reflection.</p>
          </CardContent>
        </Card>

        {messages.map(m=>(
          <div key={m.id} className={`flex ${m.role==="user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${m.role==="user" ? "bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-br-sm" : "bg-white/[0.06] border border-white/10 text-white rounded-bl-sm"}`}>
              {m.role==="assistant" && <div className="flex items-center gap-1.5 mb-1"><Bot className="w-3 h-3 text-violet-300" /><span className="text-[10px] text-violet-300 uppercase tracking-widest">AstroAI</span></div>}
              <div className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</div>
              <div className="text-[10px] opacity-50 mt-1">{new Date(m.timestamp).toLocaleTimeString()}</div>
            </div>
          </div>
        ))}
        {isTyping && <div className="flex justify-start"><div className="bg-white/[0.06] border border-white/10 rounded-2xl rounded-bl-sm px-4 py-3"><div className="flex gap-1"><span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" /><span className="w-2 h-2 bg-white/40 rounded-full animate-bounce [animation-delay:0.2s]" /><span className="w-2 h-2 bg-white/40 rounded-full animate-bounce [animation-delay:0.4s]" /></div></div></div>}
        <div ref={endRef} />

        <div className="flex flex-wrap gap-2 pt-2">
          {["Will I get a job soon?","When is good period for marriage?","What does my birth chart say about career?","What does my Moon sign mean?"].map(q=>(
            <button key={q} onClick={()=>setInput(q)} className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs hover:bg-white/10 hover:text-white transition">{q}</button>
          ))}
        </div>
      </div>

      <div className="p-3 border-t border-white/10 bg-[#0f0f3a]/90 backdrop-blur-xl">
        <div className="flex gap-2 max-w-[800px] mx-auto">
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter" && handleSend()} placeholder="Ask about career, love, chart, remedies..." className="flex-1 h-11 px-4 rounded-full bg-white/[0.06] border border-white/10 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500/40" />
          <Button onClick={handleSend} variant="primary" size="icon" className="rounded-full shrink-0"><Send className="w-4 h-4" /></Button>
        </div>
      </div>
    </div>
  );
}
