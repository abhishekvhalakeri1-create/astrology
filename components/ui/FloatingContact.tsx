"use client";
import { useState } from "react";
import { Phone, MessageCircle, X, Instagram } from "lucide-react";

export function FloatingContact() {
  const [open, setOpen] = useState(false);
  const phone = "7892758565";
  const phoneWithCountry = `+91${phone}`;
  const whatsappNumber = `91${phone}`;
  const instagramUrl = "https://www.instagram.com/shivohamastro66";
  const whatsappMsg = encodeURIComponent("Namaste Rajeshwari madam, I want astrology consultation. My birth details:");

  return (
    <>
      {/* Desktop Floating */}
      <div className="hidden lg:flex fixed bottom-6 right-5 z-[60] flex-col items-end gap-3">
        {open && (
          <div className="bg-white border border-[#E8DDD0] rounded-[12px] p-4 w-[300px] shadow-xl">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="font-serif text-[15px] font-bold">Contact Rajeshwari</div>
                <div className="text-[11px] text-[#8B7355] mt-1">Direct • Personal • {phone}</div>
              </div>
              <button type="button" onClick={()=>setOpen(false)} className="w-8 h-8 rounded-full bg-[#F5F1EB] flex items-center justify-center hover:bg-[#E8DDD0] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-2">
              <a href={`tel:${phoneWithCountry}`} className="flex items-center gap-3 h-[48px] px-4 bg-[#1A0F0A] text-white hover:bg-black cursor-pointer">
                <Phone className="w-4 h-4" />
                <div className="flex-1">
                  <div className="text-[13px] font-medium">Call +91 {phone}</div>
                  <div className="text-[11px] text-white/60">9AM-9PM All Days • Direct</div>
                </div>
              </a>

              <a href={`https://wa.me/${whatsappNumber}?text=${whatsappMsg}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 h-[48px] px-4 bg-[#25D366] text-white hover:bg-[#128C7E] cursor-pointer">
                <MessageCircle className="w-4 h-4" />
                <div className="flex-1">
                  <div className="text-[13px] font-medium">WhatsApp {phone}</div>
                  <div className="text-[11px] text-white/80">Fast reply • 2 hours • Direct</div>
                </div>
              </a>

              <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 h-[44px] px-4 border border-[#E8DDD0] bg-white hover:border-[#1A0F0A] hover:bg-[#F5F1EB] cursor-pointer">
                <Instagram className="w-4 h-4" />
                <div className="flex-1">
                  <div className="text-[13px] font-medium">Instagram</div>
                  <div className="text-[11px] text-[#8B7355]">shivohamastro66 • Daily Panchanga</div>
                </div>
              </a>
            </div>

            <div className="mt-4 pt-4 border-t border-[#F5F1EB] text-[11px] leading-[1.5] text-[#8B7355] text-center">
              Jayanagar, Bangalore • Kannada, Hindi, English, Telugu<br />
              Pay after • UPI • {phone} • Trust based
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <a href={`https://wa.me/${whatsappNumber}?text=${whatsappMsg}`} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-[#25D366] flex items-center justify-center hover:bg-[#128C7E] shadow-lg cursor-pointer">
            <MessageCircle className="w-6 h-6 text-white" />
          </a>
          <button type="button" onClick={()=>setOpen(!open)} className="w-12 h-12 rounded-full bg-[#1A0F0A] text-white flex items-center justify-center hover:bg-black shadow-lg cursor-pointer">
            {open ? <X className="w-6 h-6" /> : <Phone className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Bottom Bar - Direct Links to 7892758565 */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[70] bg-white border-t border-[#E8DDD0] flex h-[72px] shadow-[0_-2px_16px_rgba(0,0,0,0.08)]">
        <a href={`tel:${phoneWithCountry}`} className="flex-1 flex flex-col items-center justify-center gap-1 border-r border-[#F5F1EB] active:bg-[#F5F1EB] hover:bg-[#F5F1EB] cursor-pointer min-h-[72px]">
          <Phone className="w-6 h-6 text-[#1A0F0A]" />
          <span className="text-[11px] font-medium uppercase">Call</span>
          <span className="text-[9px] text-[#8B7355]">{phone}</span>
        </a>
        <a href={`https://wa.me/${whatsappNumber}?text=${whatsappMsg}`} target="_blank" rel="noopener noreferrer" className="flex-1 flex flex-col items-center justify-center gap-1 bg-[#25D366] text-white active:bg-[#128C7E] hover:bg-[#128C7E] cursor-pointer min-h-[72px]">
          <MessageCircle className="w-6 h-6" />
          <span className="text-[11px] font-medium uppercase">WhatsApp</span>
          <span className="text-[9px] text-white/80">Direct</span>
        </a>
        <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="flex-1 flex flex-col items-center justify-center gap-1 active:bg-[#F5F1EB] hover:bg-[#F5F1EB] cursor-pointer min-h-[72px]">
          <Instagram className="w-6 h-6 text-[#1A0F0A]" />
          <span className="text-[11px] font-medium uppercase">Instagram</span>
          <span className="text-[9px] text-[#8B7355]">shivohamastro66</span>
        </a>
      </div>

      <div className="lg:hidden h-[72px] w-full" />
    </>
  );
}
