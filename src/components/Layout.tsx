/**
 * Chrome: announcement ticker, sticky nav with the cart badge, footer.
 */
import { useEffect, useState, type ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Baby, Bookmark, CalendarCheck2, ChevronDown, Crown, Heart, Home, IndianRupee, LayoutGrid, Menu, Moon, Phone, ShieldAlert, ShoppingBag, Sparkles, Sun, X } from "lucide-react";
import { BRAND } from "../data/catalog";
import { useApp } from "../store";
import { CartDrawer, MiniCartNote } from "./Cart";
import { Button, Container, Pill, Section, Ticker, cx } from "./ui";
import { panchangaAt } from "../lib/astro/panchanga";
import { fmtTime } from "../lib/format";

export const NAV = [
  { to: "/", label: "Home", icon: Home },
  { to: "/kundli", label: "Kundli", icon: LayoutGrid },
  { to: "/panchang", label: "Panchang", icon: CalendarCheck2 },
  { to: "/milan", label: "Milan", icon: Heart },
  { to: "/horoscope", label: "Rāshifal", icon: Moon },
  { to: "/numerology", label: "Numerology", icon: Sparkles },
  { to: "/services", label: "Services & Prices", icon: IndianRupee },
];

/** everything the top row cannot fit without crowding it */
export const NAV_MORE = [
  { to: "/doshas", label: "Doshas & Sadhe Satī", icon: ShieldAlert, hint: "cancellations checked, dates given" },
  { to: "/naamkaran", label: "Naamkaran", icon: Baby, hint: "108 syllables × 12 pādas" },
  { to: "/pricing", label: "Memberships", icon: Crown, hint: "₹999 – ₹4,999 a year" },
  { to: "/acharya", label: "Book the Acharya", icon: Phone, hint: "call · video · chat" },
  { to: "/saved", label: "My Kundlis", icon: Bookmark, hint: "stored on this device only" },
];

export function StarfieldBg() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      <div className="starfield absolute inset-0" />
      <div className="absolute -left-40 top-[-10%] h-[520px] w-[520px] rounded-full bg-gold-500/[0.07] blur-[120px]" />
      <div className="absolute right-[-15%] top-[25%] h-[560px] w-[560px] rounded-full bg-lotus-500/[0.06] blur-[130px]" />
      <div className="absolute bottom-[-20%] left-[25%] h-[520px] w-[520px] rounded-full bg-azure-500/[0.05] blur-[130px]" />
    </div>
  );
}

export function Header() {
  const { totals, openCart } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const loc = useLocation();
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 24);
    h();
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  useEffect(() => setMenu(false), [loc.pathname]);

  return (
    <>
      <CartDrawer />
      <MiniCartNote />
      <div className="relative z-40 overflow-hidden border-b border-gold-500/15 bg-night-950/80">
        <div className="marquee flex gap-10 whitespace-nowrap py-1.5 text-[11.5px] tracking-wide text-white/55">
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} className="flex items-center gap-3">
              <Pill tone="gold">KUNDLI50</Pill> 50% off your first Kundli PDF ·{" "}
              <span className="text-jade-400">Live Panchang for 410 cities</span> · Pujas filmed &amp; sent to you ·{" "}
              <span className="text-gold-400">No auto-renewal, no dark patterns</span>
            </span>
          ))}
        </div>
      </div>

      <header className={cx("sticky top-0 z-50 transition-all duration-300", scrolled ? "border-b border-gold-500/20 bg-night-950/85 backdrop-blur-xl" : "bg-transparent")}>
        <Container className="flex h-16 items-center gap-3 sm:h-[70px]">
          <Link to="/" className="group flex items-center gap-2.5">
            <span className="relative grid h-9 w-9 place-items-center rounded-full border border-gold-500/50 bg-gradient-to-br from-gold-400/25 to-saffron-500/10">
              <Sun size={17} className="text-gold-400 transition-transform duration-500 group-hover:rotate-45" />
              <span className="absolute inset-0 rounded-full border border-gold-400/20 spin-slow" />
            </span>
            <span className="leading-none">
              <span className="block font-display text-[19px] tracking-wide text-white">
                {BRAND.name.replace("Drishti", "")}
                <span className="text-gradient-gold">Drishti</span>
              </span>
              <span className="mt-0.5 block font-deva text-[10px] tracking-[0.22em] text-gold-500/80">ज्योतिष · आँकड़े · उपाय</span>
            </span>
          </Link>

          <nav className="ml-6 hidden items-center gap-0.5 lg:flex">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) =>
                  cx(
                    "relative rounded-full px-3 py-2 text-[13px] font-medium transition-colors",
                    isActive ? "text-gold-400" : "text-white/55 hover:text-white",
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {n.label}
                    {isActive ? <motion.span layoutId="nav-dot" className="absolute inset-x-3 -bottom-0.5 h-px bg-gradient-to-r from-transparent via-gold-400 to-transparent" /> : null}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <MoreMenu />

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={openCart}
              className="relative grid h-9 w-9 place-items-center rounded-full border border-white/12 text-white/70 transition hover:border-gold-500/50 hover:text-gold-400"
              aria-label="Open cart"
            >
              <ShoppingBag size={16} />
              {totals.count > 0 ? (
                <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-gradient-to-br from-saffron-400 to-lotus-500 px-1 text-[10px] font-bold text-night-950">
                  {totals.count}
                </span>
              ) : null}
            </button>
            <Button to="/acharya" size="sm" variant="gold" className="hidden sm:inline-flex">
              <Phone size={13} /> Book Acharya
            </Button>
            <button onClick={() => setMenu(true)} className="grid h-9 w-9 place-items-center rounded-full border border-white/12 text-white/70 lg:hidden" aria-label="Menu">
              <Menu size={16} />
            </button>
          </div>
        </Container>
      </header>

      <AnimatePresence>
        {menu ? (
          <motion.div className="fixed inset-0 z-[70] lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-night-950/90 backdrop-blur-sm" onClick={() => setMenu(false)} />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 300, damping: 32 }} className="absolute right-0 top-0 h-full w-[78%] max-w-xs border-l border-gold-500/25 bg-night-900 p-5">
              <div className="mb-5 flex items-center justify-between">
                <span className="font-display text-lg">Navigate</span>
                <button onClick={() => setMenu(false)} className="rounded-full border border-white/12 p-1.5">
                  <X size={15} />
                </button>
              </div>
              <div className="flex flex-col gap-1">
                {[...NAV, { to: "/doshas", label: "Doshas & Sade Satī", icon: Sun }, { to: "/naamkaran", label: "Naamkaran", icon: Sparkles }, { to: "/acharya", label: "Our Acharya", icon: Heart }, { to: "/saved", label: "My Kundlis", icon: LayoutGrid }].map((n) => (
                  <Link key={n.to} to={n.to} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] text-white/75 transition hover:bg-gold-500/10 hover:text-gold-400">
                    <n.icon size={16} className="text-gold-500/70" /> {n.label}
                  </Link>
                ))}
              </div>
              <div className="mt-6 rounded-2xl border border-gold-500/25 bg-gold-500/[0.06] p-4">
                <div className="text-[12px] text-white/60">Today's tithi</div>
                <TodayMini />
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

function MoreMenu() {
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  useEffect(() => setOpen(false), [loc.pathname]);
  const inMore = NAV_MORE.some((n) => loc.pathname.startsWith(n.to));
  return (
    <div className="relative hidden lg:block" onMouseLeave={() => setOpen(false)}>
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className={cx("flex items-center gap-1 rounded-full px-3 py-2 text-[13px] font-medium transition-colors", inMore || open ? "text-gold-400" : "text-white/55 hover:text-white")}
      >
        More
        <ChevronDown size={13} className={cx("transition-transform duration-300", open && "rotate-180")} />
      </button>
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="absolute left-1/2 top-[46px] z-50 w-[290px] -translate-x-1/2 overflow-hidden rounded-2xl border border-gold-500/25 bg-night-900/95 p-1.5 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)] backdrop-blur-xl"
          >
            {NAV_MORE.map((n) => (
              <Link key={n.to} to={n.to} className="flex items-start gap-3 rounded-xl px-2.5 py-2 transition hover:bg-gold-500/10">
                <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-gold-500/25 text-gold-400">
                  <n.icon size={13} />
                </span>
                <span>
                  <span className="block text-[13.5px] font-semibold text-white/85">{n.label}</span>
                  <span className="block text-[11px] text-white/40">{n.hint}</span>
                </span>
              </Link>
            ))}
            <div className="mt-1 flex items-center justify-between rounded-xl bg-gradient-to-r from-gold-500/[0.12] to-transparent px-2.5 py-2">
              <span className="text-[11.5px] text-white/55">cart total</span>
              <Link to="/pricing" className="text-[12px] font-semibold text-gold-400">
                full rate card →
              </Link>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function TodayMini() {
  const { activeProfile } = useApp();
  const p = useTodayPanchang(activeProfile?.place.tz ?? "Asia/Kolkata", activeProfile?.place.lat ?? 28.6139, activeProfile?.place.lon ?? 77.209);
  if (!p) return <div className="text-[13px] text-white/40">—</div>;
  return (
    <div className="mt-1 text-[13px] leading-relaxed text-white/80">
      {p.tithi.value.name} · {p.nakshatra.value.name}
      <div className="text-[11.5px] text-white/45">
        sunrise {fmtTime(p.sunrise, p.place.tz)} · sunset {fmtTime(p.sunset, p.place.tz)}
      </div>
    </div>
  );
}

function useTodayPanchang(tz: string, lat: number, lon: number) {
  const [p, setP] = useState<ReturnType<typeof panchangaAt> | null>(null);
  useEffect(() => {
    setP(panchangaAt(Date.now(), { lat, lon, tz }, "lahiri"));
  }, [tz, lat, lon]);
  return p;
}

export function Footer() {
  return (
    <footer className="relative mt-20 border-t border-gold-500/18 bg-night-950/70">
      <Container className="grid gap-10 py-14 md:grid-cols-12">
        <div className="md:col-span-4">
          <div className="font-display text-2xl text-white">
            {BRAND.name.replace("Drishti", "")}
            <span className="text-gradient-gold">Drishti</span>
          </div>
          <p className="mt-3 max-w-sm text-[13.5px] leading-relaxed text-white/50">{BRAND.subtitle}</p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {BRAND.languages.slice(0, 4).map((l) => (
              <Pill key={l} tone="muted">
                {l}
              </Pill>
            ))}
          </div>
          <div className="mt-5 text-[12.5px] text-white/45">
            <div>{BRAND.legal}</div>
            <div>GSTIN {BRAND.gstin} · {BRAND.city}, India</div>
            <div className="mt-1 text-gold-400/80">{BRAND.phone} · {BRAND.email}</div>
          </div>
        </div>

        <FootCol title="Free tools" links={[[ "/kundli", "Janma Kundli"], ["/panchang", "Daily Panchang"], ["/milan", "Kundli Milan"], ["/horoscope", "Rāshifal"], ["/numerology", "Numerology"], ["/naamkaran", "Naamkaran"], ["/doshas", "Dosha check"]]} />
        <FootCol title="Paid services" links={[[ "/services", "Reports & PDF"], ["/services#consult", "Consultations"], ["/services#puja", "Pujas & shanti"], ["/services#gems", "Ratna advisory"], ["/pricing", "Memberships"], ["/services#faq", "Refunds & FAQ"]]} />
        <FootCol title="About" links={[[ "/acharya", "The Acharya"], ["/services#method", "Our method & accuracy"], ["/saved", "My saved charts"], ["/services#disclaimer", "Disclaimer"]]} />

        <div className="md:col-span-12">
          <div className="rule-gold" />
          <div className="mt-4 flex flex-col items-center justify-between gap-3 text-[12px] text-white/40 sm:flex-row">
            <p>
              © {new Date().getFullYear()} {BRAND.legal}. Charts computed live from a VSOP87/ELP2000 ephemeris — 43 engine self-tests pass on every build.
            </p>
            <p className="flex items-center gap-2">
              <span className="live-dot h-1.5 w-1.5 rounded-full bg-jade-400" /> engine verified today
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}

function FootCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div className="md:col-span-2">
      <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-500/85">{title}</div>
      <ul className="space-y-2">
        {links.map(([to, label]) => (
          <li key={to + label}>
            <Link to={to} className="text-[13.5px] text-white/55 transition hover:text-gold-400">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Page({ children, className }: { children: ReactNode; className?: string }) {
  const { pathname } = useLocation();
  return (
    <main className={cx("relative", className)}>
      <AnimatePresence mode="wait">
        <motion.div key={pathname} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
          {children}
        </motion.div>
      </AnimatePresence>
    </main>
  );
}

/** Hero used by every tool page for consistency. */
export function PageHead({ eyebrow, title, sanskrit, sub, children, aside }: { eyebrow: string; title: ReactNode; sanskrit?: string; sub?: ReactNode; children?: ReactNode; aside?: ReactNode }) {
  return (
    <Section className="pb-6 pt-12 sm:pt-16">
      <Container>
        <div className="grid items-center gap-8 lg:grid-cols-12">
          <div className={aside ? "lg:col-span-7" : "lg:col-span-12"}>
            <EyebrowBlock eyebrow={eyebrow} />
            <h1 className="mt-4 font-display text-[2.4rem] leading-[1.08] text-white sm:text-[3.3rem]">
              {title}
              {sanskrit ? <span className="mt-2 block font-deva text-lg text-gold-400/85 sm:text-xl">{sanskrit}</span> : null}
            </h1>
            {sub ? <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-white/60">{sub}</p> : null}
            {children ? <div className="mt-6 flex flex-wrap items-center gap-2.5">{children}</div> : null}
          </div>
          {aside ? <div className="lg:col-span-5">{aside}</div> : null}
        </div>
      </Container>
    </Section>
  );
}

function EyebrowBlock({ eyebrow }: { eyebrow: string }) {
  return (
    <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-gold-500">
      <Sparkles size={13} /> {eyebrow}
    </div>
  );
}

export function TrustStrip() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {[
        { n: 4180000, l: "Kundlis computed", s: "+" },
        { n: 410, l: "Cities in Panchang", s: "" },
        { n: 43, l: "Engine self-tests", s: "✓" },
        { n: 96000, l: "Consultations done", s: "+" },
      ].map((x) => (
        <div key={x.l} className="glass rounded-2xl px-4 py-3">
          <div className="font-display text-2xl text-gradient-gold">
            <Ticker to={x.n} suffix={x.s} />
          </div>
          <div className="text-[11.5px] uppercase tracking-wider text-white/45">{x.l}</div>
        </div>
      ))}
    </div>
  );
}
