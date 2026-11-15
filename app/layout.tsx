import "@fontsource-variable/cormorant-garamond";
import "@fontsource-variable/source-sans-3";
import "@fontsource-variable/noto-sans-devanagari";
import "@fontsource-variable/noto-sans-kannada";
import "@fontsource-variable/noto-serif-devanagari";
import "@fontsource-variable/noto-serif-kannada";
import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FloatingContact } from "@/components/ui/FloatingContact";
import { BASE_PATH, BRAND, PHONE_DISPLAY, SITE_URL } from "@/lib/site";

const description =
  "Rajeshwari, Jyotish Acharya from Kashi, 15 years in Jayanagar, Bangalore. Free Kundli, Kundli matching (36 gunas), daily Panchanga, Rashi phala, dosha check and numerology — and personal consultations in Kannada, Hindi, English and Telugu. Call or WhatsApp 7892758565.";

export const metadata: Metadata = {
  // Full addresses for link previews can only be made when the site's own address was given at build time.
  metadataBase: SITE_URL ? new URL(`${SITE_URL}${BASE_PATH}/`) : undefined,
  title: {
    default: "Rajeshwari • Vedic Astrologer in Jayanagar, Bangalore • AstroConnect",
    template: "%s • Rajeshwari, Vedic Astrologer, Bangalore",
  },
  description,
  openGraph: {
    type: "website",
    siteName: BRAND,
    locale: "en_IN",
    images: SITE_URL ? [{ url: `${SITE_URL}${BASE_PATH}/og-image.jpg`, width: 1200, height: 630, alt: "Rajeshwari, Vedic astrologer in Jayanagar, Bangalore" }] : undefined,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FFFEFB",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#FFFEFB] text-[#1A0F0A]">
        <Header />
        <noscript>
          <p className="max-w-[1280px] mx-auto px-4 lg:px-8 py-3 text-[14.5px] leading-[1.6] text-[#5A4A3D] border-b border-[#E8DDD0]">
            The free calculators on this site need JavaScript, which is switched off in this browser. To book a consultation, call or WhatsApp {PHONE_DISPLAY}.
          </p>
        </noscript>
        <main className="min-h-[70vh]">{children}</main>
        <Footer />
        <FloatingContact />
      </body>
    </html>
  );
}
