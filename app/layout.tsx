import "./globals.css";
import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { FloatingContact } from "@/components/ui/FloatingContact";

export const metadata: Metadata = {
  title: "Rajeshwari • Vedic Astrology • Bangalore • 15 Years • AstroConnect",
  description: "Rajeshwari - Jyotish Acharya from Kashi. 15 years, 5234 consultations. Marriage compatibility, career guidance, Kundli reading. Direct contact 7892758565. Bangalore Jayanagar. No middleman, honest guidance in Kannada, Hindi, English, Telugu. Instagram shivohamastro66.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FFFEFB"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#FFFEFB] text-[#1A0F0A] paper">
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <FloatingContact />
      </body>
    </html>
  );
}
