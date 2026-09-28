"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, User, Calendar, Star, FileText, Phone, MessageCircle } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const phone = "7892758565";
  const whatsappLink = `https://wa.me/91${phone}?text=${encodeURIComponent("Namaste Rajeshwari madam")}`;
  const callLink = `tel:+91${phone}`;
  
  const items = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/#about", icon: User, label: "About" },
    { href: "/#reviews", icon: Star, label: "Reviews (847)" },
    { href: "/birth-chart", icon: Star, label: "Kundli" },
    { href: "/horoscope", icon: Calendar, label: "Horoscope" },
    { href: "/articles", icon: FileText, label: "Articles" },
  ];

  return (
    <aside className="hidden lg:flex w-[240px] shrink-0 flex-col sticky top-[64px] h-[calc(100vh-64px)] overflow-y-auto p-4 gap-4 bg-[#FFFEFB]">
      <div className="bg-white border border-[#E8DDD0] rounded-[12px] p-4">
        <div className="flex items-center gap-3">
          <img src="/rajeshwari-real.jpg" alt="Rajeshwari" width={48} height={48} className="w-12 h-12 rounded-full object-cover border border-[#E8DDD0]" />
          <div>
            <div className="font-medium text-[14px] text-[#1A0F0A]">Rajeshwari</div>
            <div className="text-[12px] text-[#6B5D52]">15 Years • 4.9★ • 847 reviews</div>
          </div>
        </div>
        
        <div className="mt-4 space-y-2">
          <a href={callLink} className="flex items-center justify-center gap-2 w-full h-9 rounded-full bg-[#1A0F0A] text-white text-[13px] font-medium hover:bg-black transition-colors">
            <Phone className="w-4 h-4" /> Call {phone}
          </a>
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full h-9 rounded-full bg-[#25D366] text-white text-[13px] font-medium hover:bg-[#128C7E] transition-colors">
            <MessageCircle className="w-4 h-4" /> WhatsApp
          </a>
        </div>
      </div>

      <div className="bg-white border border-[#E8DDD0] rounded-[12px] p-2">
        {items.map(it=>{
          const active = pathname === it.href;
          return (
            <Link key={it.href} href={it.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-[13px] font-medium transition-colors mb-0.5 ${active ? "bg-[#1A0F0A] text-white" : "text-[#3D2F26] hover:bg-[#F5F1EB]"}`}>
              <it.icon className="w-4 h-4" /> {it.label}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
