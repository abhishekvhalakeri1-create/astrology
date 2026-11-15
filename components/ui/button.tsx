"use client";
import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline" | "gold";
  size?: "sm" | "md" | "lg" | "icon";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    const base = "inline-flex items-center justify-center font-medium rounded-full transition-colors duration-150 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";
    const variants = {
      primary: "bg-gray-900 text-white hover:bg-black",
      secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-200",
      ghost: "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
      outline: "border border-gray-300 text-gray-900 hover:bg-gray-50",
      gold: "bg-amber-600 text-white hover:bg-amber-700"
    };
    const sizes = {
      sm: "px-3 py-1.5 text-sm h-8",
      md: "px-5 py-2.5 text-sm h-10",
      lg: "px-6 py-3 text-sm h-11",
      icon: "w-10 h-10 p-0"
    };
    return <button ref={ref} className={cn(base, variants[variant], sizes[size], className)} {...props} />;
  }
);
Button.displayName = "Button";
