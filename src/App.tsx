import { Suspense, lazy, useEffect } from "react";
import { HashRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AppProvider } from "./store";
import { Footer, Header, StarfieldBg } from "./components/Layout";
import { Container, Section } from "./components/ui";
import { AcharyaSection, FinalCta, Hero, MethodSection, PlansSection, RemedyStrip, ReviewsSection, ServicesPreview, ToolsGrid } from "./pages/Home";

/**
 * Each tool is its own chunk: the landing page ships only what it needs, and
 * the ephemeris work is fetched the moment a chart page is opened.
 */
const KundliPage = lazy(() => import("./pages/Kundli").then((m) => ({ default: m.KundliPage })));
const PanchangPage = lazy(() => import("./pages/Panchang").then((m) => ({ default: m.PanchangPage })));
const MilanPage = lazy(() => import("./pages/Milan").then((m) => ({ default: m.MilanPage })));
const HoroscopePage = lazy(() => import("./pages/Horoscope").then((m) => ({ default: m.HoroscopePage })));
const DoshasPage = lazy(() => import("./pages/Doshas").then((m) => ({ default: m.DoshasPage })));
const NumerologyPage = lazy(() => import("./pages/Numerology").then((m) => ({ default: m.NumerologyPage })));
const NaamkaranPage = lazy(() => import("./pages/Naamkaran").then((m) => ({ default: m.NaamkaranPage })));
const ServicesPage = lazy(() => import("./pages/Services").then((m) => ({ default: m.ServicesPage })));
const PricingPage = lazy(() => import("./pages/Pricing").then((m) => ({ default: m.PricingPage })));
const AcharyaPage = lazy(() => import("./pages/Acharya").then((m) => ({ default: m.AcharyaPage })));
const SavedPage = lazy(() => import("./pages/Saved").then((m) => ({ default: m.SavedPage })));
const MuhuratPage = lazy(() => import("./pages/Muhurat").then((m) => ({ default: m.MuhuratPage })));

/** shown while a route chunk is fetching — a turning mandala, not a spinner */
function RouteFallback() {
  return (
    <div className="grid min-h-[60vh] place-items-center px-6 text-center">
      <div>
        <svg viewBox="0 0 100 100" className="spin-slow mx-auto h-16 w-16 text-gold-400/80" aria-hidden>
          <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1.5" />
          <path d="M50 6a44 44 0 0 1 44 44" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i * Math.PI) / 6;
            return (
              <line
                key={i}
                x1={50 + 30 * Math.cos(a)}
                y1={50 + 30 * Math.sin(a)}
                x2={50 + 38 * Math.cos(a)}
                y2={50 + 38 * Math.sin(a)}
                stroke="currentColor"
                strokeOpacity="0.4"
                strokeWidth="1"
              />
            );
          })}
        </svg>
        <p className="mt-4 font-display text-[15px] tracking-wide text-white/60">Consulting the ephemeris…</p>
      </div>
    </div>
  );
}

/** hash-aware scrolling: /services#puja should land on the puja block */
function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const id = decodeURIComponent(hash.replace("#", ""));
      const el = document.getElementById(id);
      if (el) {
        // jsdom and a few older webviews lack scrollIntoView — never let a
        // scroll helper break a page render
        window.requestAnimationFrame(() => el.scrollIntoView?.({ behavior: "smooth", block: "start" }));
        return;
      }
    }
    window.scrollTo?.({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname, hash]);
  return null;
}

function Home() {
  return (
    <>
      <Hero />
      <ToolsGrid />
      <ServicesPreview />
      <PlansSection />
      <MethodSection />
      <AcharyaSection />
      <RemedyStrip />
      <ReviewsSection />
      <FinalCta />
    </>
  );
}

function NotFound() {
  return (
    <Section className="pt-24">
      <Container className="text-center">
        <div className="font-display text-[5rem] leading-none text-gradient-gold">ॐ</div>
        <h1 className="mt-4 font-display text-[2rem] text-white">That path is not in this chart</h1>
        <p className="mx-auto mt-2 max-w-md text-[14px] leading-relaxed text-white/55">
          The page moved, or the link was mistyped. The kundli, panchang, milan and numerology tools are all one click away —
          and free.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2.5">
          <a href="#/" className="rounded-full bg-gradient-to-br from-gold-400 to-gold-600 px-6 py-3 text-[14px] font-semibold text-night-950">
            Back to home
          </a>
          <a href="#/kundli" className="rounded-full border border-gold-500/45 px-6 py-3 text-[14px] font-semibold text-gold-400">
            Generate a kundli
          </a>
        </div>
      </Container>
    </Section>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AppProvider>
        <StarfieldBg />
        <ScrollManager />
        <div className="flex min-h-screen flex-col">
          <Header />
          <div className="flex-1">
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/kundli" element={<KundliPage />} />
                <Route path="/panchang" element={<PanchangPage />} />
                <Route path="/milan" element={<MilanPage />} />
                <Route path="/horoscope" element={<HoroscopePage />} />
                <Route path="/doshas" element={<DoshasPage />} />
                <Route path="/numerology" element={<NumerologyPage />} />
                <Route path="/naamkaran" element={<NaamkaranPage />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/acharya" element={<AcharyaPage />} />
                <Route path="/saved" element={<SavedPage />} />
                <Route path="/remedies" element={<Navigate to="/services" replace />} />
                <Route path="/rashifal" element={<Navigate to="/horoscope" replace />} />
                <Route path="/muhurat" element={<MuhuratPage />} />
                <Route path="/shubh-muhurat" element={<Navigate to="/muhurat" replace />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </div>
          <Footer />
        </div>
      </AppProvider>
    </HashRouter>
  );
}
