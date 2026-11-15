"use client";
import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return <input ref={ref} className={cn("w-full h-11 px-4 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition", className)} {...props} />;
  }
);
Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return <textarea ref={ref} className={cn("w-full min-h-[100px] p-4 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition", className)} {...props} />;
  }
);
Textarea.displayName = "Textarea";
