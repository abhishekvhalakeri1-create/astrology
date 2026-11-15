"use client";
import { cn } from "@/lib/utils";

export function Badge({ className, children, variant = "default" }: { className?: string; children: React.ReactNode; variant?: "default" | "success" | "gold" | "outline" }) {
  const variants = {
    default: "bg-white/10 text-white/80 border-white/10",
    success: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    gold: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    outline: "bg-transparent border-white/20 text-white/70"
  };
  return <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border", variants[variant], className)}>{children}</span>;
}
