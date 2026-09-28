"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, User, Star, FileText, Calendar } from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();
  const items = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/birth-chart", icon: Star, label: "Kundli" },
    { href: "/horoscope", icon: Calendar, label: "Rashi" },
    { href: "/articles", icon: FileText, label: "Articles" },
    { href: "/#about", icon: User, label: "About" },
  ];
  return (
    <nav className="lg:hidden fixed bottom-[68px] left-0 right-0 z-30 bg-white/95 border-t border-[#E8DDD0]">
      <div className="flex justify-around items-center h-[52px] px-2">
        {items.map(it=>{
          const active = pathname === it.href;
          return (
            <Link key={it.href} href={it.href} className={`flex flex-col items-center gap-0.5 px-3 py-1 transition-colors ${active ? "text-[#1A0F0A]" : "text-[#8B7355]"}`}>
              <it.icon className={`w-5 h-5 ${active ? "fill-[#1A0F0A]" : ""}`} />
              <span className="text-[10px] font-medium">{it.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
