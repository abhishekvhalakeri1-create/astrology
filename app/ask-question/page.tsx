"use client";
import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { generateId, formatCurrency } from "@/lib/utils";

export default function AskQuestionPage() {
  const { birthProfiles, questions, addQuestion, astrologers, walletBalance, deductMoney } = useAppStore();
  const [category, setCategory] = useState("career");
  const [question, setQuestion] = useState("");
  const [birthId, setBirthId] = useState(birthProfiles[0]?.id || "");
  const [selectedAstro, setSelectedAstro] = useState("any");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!question.trim()) return alert("Write a question");
    if (walletBalance < 99) return alert("Insufficient balance. Need ₹99");
    const ok = deductMoney(99, `Ask a question - ${category}`);
    if (!ok) return;
    addQuestion({
      id: generateId(),
      userId: "user-1",
      category: category as any,
      question,
      birthProfileId: birthId,
      astrologerId: selectedAstro==="any" ? undefined : selectedAstro,
      status: "pending",
      price: 99,
      createdAt: new Date().toISOString()
    });
    setSubmitted(true);
    setQuestion("");
  };

  return (
    <div className="p-4 lg:p-6 max-w-[800px] mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Ask an Astrologer</h1>
      <p className="text-white/50 text-sm">Get detailed answer within 24 hours • ₹99 per question • Verified astrologers</p>

      <Card>
        <CardHeader><h3 className="font-bold">Your Question</h3></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/60 mb-1 block">Category</label>
              <select value={category} onChange={e=>setCategory(e.target.value)} className="w-full h-11 px-3 rounded-xl bg-white/[0.06] border border-white/10 text-sm text-white">
                {["love","marriage","career","business","education","finance","family","general"].map(c=><option key={c} value={c} className="bg-[#0a0a24] capitalize">{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-white/60 mb-1 block">Birth Profile</label>
              <select value={birthId} onChange={e=>setBirthId(e.target.value)} className="w-full h-11 px-3 rounded-xl bg-white/[0.06] border border-white/10 text-sm text-white">
                {birthProfiles.map(p=><option key={p.id} value={p.id} className="bg-[#0a0a24]">{p.label} - {p.fullName}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-white/60 mb-1 block">Question (Be specific for accurate answer)</label>
            <Textarea value={question} onChange={e=>setQuestion(e.target.value)} placeholder="Example: I was born on 15 June 1995 at 8:30 AM in Bangalore. Will I get a job change this year? Which field is best for me?" rows={5} />
            <div className="text-[11px] text-white/40 mt-1">{question.length}/500 characters</div>
          </div>
          <div>
            <label className="text-xs text-white/60 mb-1 block">Choose Astrologer (Optional)</label>
            <select value={selectedAstro} onChange={e=>setSelectedAstro(e.target.value)} className="w-full h-11 px-3 rounded-xl bg-white/[0.06] border border-white/10 text-sm text-white">
              <option value="any" className="bg-[#0a0a24]">Any available astrologer (Faster)</option>
              {astrologers.slice(0,8).map(a=><option key={a.id} value={a.id} className="bg-[#0a0a24]">{a.name} - {a.specializations[0]} • {a.rating}★</option>)}
            </select>
          </div>
          <div className="rounded-xl bg-white/5 p-3 flex justify-between text-sm">
            <span className="text-white/50">Price</span><span className="text-white font-bold">{formatCurrency(99)}</span>
          </div>
          <Button onClick={handleSubmit} variant="gold" size="lg" className="w-full rounded-xl">Pay ₹99 & Ask Question</Button>
          <div className="text-[11px] text-white/40 text-center">Wallet Balance: {formatCurrency(walletBalance)} • Answer within 24h • Refund if not answered</div>
        </CardContent>
      </Card>

      {submitted && <Card className="bg-emerald-500/10 border-emerald-500/20"><CardContent className="p-4 text-center"><div className="text-emerald-300 font-bold">Question Submitted!</div><div className="text-white/60 text-sm mt-1">Astrologer will answer within 24 hours. You'll get notification.</div></CardContent></Card>}

      <Card>
        <CardHeader><h3 className="font-bold">Your Questions ({questions.length})</h3></CardHeader>
        <CardContent className="space-y-3">
          {questions.map(q=>(
            <div key={q.id} className="p-3 rounded-xl bg-white/[0.04] border border-white/10">
              <div className="flex justify-between">
                <span className="px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 text-xs capitalize">{q.category}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${q.status==="answered" ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"}`}>{q.status}</span>
              </div>
              <div className="text-white text-sm mt-2">{q.question}</div>
              {q.answer && <div className="mt-3 p-3 rounded-xl bg-[#15154f] border border-white/10"><div className="text-violet-300 text-xs font-semibold">Astrologer Answer:</div><div className="text-white/80 text-sm mt-1">{q.answer}</div></div>}
              <div className="text-white/30 text-xs mt-2">{new Date(q.createdAt).toLocaleString()} • {formatCurrency(q.price)}</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
