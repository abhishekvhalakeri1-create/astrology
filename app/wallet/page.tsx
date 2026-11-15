"use client";
import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Wallet, Plus, ArrowUpRight, ArrowDownRight, CreditCard, Smartphone } from "lucide-react";
import { useState } from "react";

export default function WalletPage() {
  const { walletBalance, transactions, addMoney } = useAppStore();
  const [amount, setAmount] = useState(500);
  const [method, setMethod] = useState("upi");

  const handleAdd = () => {
    addMoney(amount, method);
    alert(`${formatCurrency(amount)} added via ${method.toUpperCase()}!`);
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[800px] mx-auto">
      <h1 className="text-2xl font-bold">Wallet</h1>

      <Card className="bg-gradient-to-br from-violet-700 to-indigo-800 border-violet-500/30 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-40 h-40 bg-amber-400/20 rounded-full blur-2xl" />
        <CardContent className="p-6 relative z-10">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-white/60 text-sm flex items-center gap-2"><Wallet className="w-4 h-4" /> Wallet Balance</div>
              <div className="text-4xl font-black text-white mt-2">{formatCurrency(walletBalance)}</div>
              <div className="text-white/50 text-xs mt-1">Available for consultations • Instant refund</div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">✦</div>
          </div>
          <div className="flex gap-2 mt-6">
            <Button variant="gold" className="rounded-full" onClick={()=>document.getElementById('add-money')?.scrollIntoView({behavior:'smooth'})}><Plus className="w-4 h-4 mr-1" /> Add Money</Button>
            <Button variant="secondary" className="rounded-full">History</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card id="add-money">
          <CardHeader><h3 className="font-bold">Add Money</h3></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {[100,500,1000,2000,5000].map(a=>(
                <button key={a} onClick={()=>setAmount(a)} className={`h-12 rounded-xl border font-bold text-sm transition ${amount===a ? "bg-amber-500 border-amber-500 text-black" : "bg-white/5 border-white/10 text-white hover:bg-white/10"}`}>{formatCurrency(a)}</button>
              ))}
              <div className="col-span-3 flex gap-2">
                <input type="number" value={amount} onChange={e=>setAmount(parseInt(e.target.value)||0)} className="flex-1 h-11 px-4 rounded-xl bg-white/[0.06] border border-white/10 text-white text-sm" placeholder="Custom amount" />
              </div>
            </div>
            <div>
              <div className="text-xs text-white/60 mb-2">Payment Method</div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "upi", label: "UPI", icon: Smartphone },
                  { id: "card", label: "Card", icon: CreditCard },
                  { id: "netbanking", label: "Net Banking", icon: Wallet },
                  { id: "wallet", label: "Paytm/PhonePe", icon: Wallet },
                ].map(m=>{
                  const Icon = m.icon;
                  return (
                    <button key={m.id} onClick={()=>setMethod(m.id)} className={`h-14 rounded-xl border flex items-center gap-2 px-3 text-sm transition ${method===m.id ? "bg-violet-600 border-violet-500 text-white" : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"}`}>
                      <Icon className="w-4 h-4" /> {m.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="rounded-xl bg-white/5 p-3 text-xs space-y-1">
              <div className="flex justify-between"><span className="text-white/50">Amount</span><span className="text-white">{formatCurrency(amount)}</span></div>
              <div className="flex justify-between"><span className="text-white/50">Bonus (10% on ₹1000+)</span><span className="text-emerald-300">{amount>=1000 ? formatCurrency(Math.floor(amount*0.1)) : "₹0"}</span></div>
              <div className="flex justify-between font-bold border-t border-white/10 pt-1"><span className="text-white">You Get</span><span className="text-amber-300">{formatCurrency(amount + (amount>=1000 ? Math.floor(amount*0.1) : 0))}</span></div>
            </div>
            <Button onClick={handleAdd} variant="gold" size="lg" className="w-full rounded-xl">Add {formatCurrency(amount)} • Secure Pay</Button>
            <div className="text-[11px] text-white/40 text-center">🔒 Secure via Razorpay • UPI • 256-bit SSL • Never store card details</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><h3 className="font-bold">Transaction History</h3></CardHeader>
          <CardContent className="space-y-3 max-h-[420px] overflow-y-auto">
            {transactions.map(tx=>(
              <div key={tx.id} className="flex gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${tx.type==="credit" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                  {tx.type==="credit" ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium truncate">{tx.description}</div>
                  <div className="text-white/40 text-xs">{new Date(tx.createdAt).toLocaleString()} • {tx.method?.toUpperCase() || "Wallet"} • {tx.status}</div>
                </div>
                <div className={`font-bold text-sm ${tx.type==="credit" ? "text-emerald-400" : "text-white"}`}>{tx.type==="credit" ? "+" : "-"}{formatCurrency(tx.amount)}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
