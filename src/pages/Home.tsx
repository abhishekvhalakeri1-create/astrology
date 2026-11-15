import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight, BadgeCheck, Calculator, CalendarCheck2, CircleCheck, Clock3, Compass, Flame,
  Gem, Heart, IndianRupee, Lock, Moon, Quote, ScrollText, ShieldCheck, Sparkles, Star, Sun,
  Users, Zap,
} from "lucide-react";
import { BRAND, CATEGORY_LABELS, FREE_TOOLS, PLANS, SERVICES, STATS, TESTIMONIALS, type Category } from "../data/catalog";
import { useApp } from "../store";
import { inr } from "../lib/format";
import { Button, Card, Container, Divider, Eyebrow, ListItem, Modal, Pill, Price, Reveal, SaveBadge, Section, SectionHead, Stars, Ticker, Yantra, cx } from "../components/ui";
import { AddButton } from "../components/Cart";
import { GrahaWheel } from "../components/charts";

/* ───────────────────────────────── hero ───────────────────────────────── */

export function Hero() {
  const { kundli, activeProfile } = useApp();
  const nav = useNavigate();
  return (
    <Section className="relative overflow-hidden pb-10 pt-8 sm:pt-14">
      <div className="pointer-events-none absolute left-1/2 top-[-120px] -translate-x-1/2 opacity-[0.55]">
        <Yantra size={620} opacity={0.14} />
      </div>
      <Container className="relative">
        <div className="grid items-center gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <Pill tone="gold" className="mb-5">
                <span className="live-dot h-1.5 w-1.5 rounded-full bg-jade-400" /> live ephemeris · {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </Pill>
              <h1 className="font-display text-[2.7rem] leading-[1.03] tracking-tight text-white sm:text-[4.1rem]">
                Your kundli,
                <br />
                <span className="text-gradient-gold">computed</span> like it matters.
              </h1>
              <p className="mt-5 max-w-xl text-[15.5px] leading-relaxed text-white/62 sm:text-[16.5px]">{BRAND.subtitle}</p>
              <div className="mt-7 flex flex-wrap items-center gap-2.5">
                <Button size="lg" onClick={() => nav(activeProfile ? "/kundli" : "/kundli#birth")}>
                  <Compass size={17} /> {activeProfile ? "Open my kundli" : "Free Kundli in 20 seconds"}
                </Button>
                <Button size="lg" variant="outline" to="/services">
                  <IndianRupee size={16} /> Services &amp; prices
                </Button>
                <Button size="lg" variant="ghost" to="/milan">
                  <Heart size={16} /> Kundli Milan
                </Button>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-[12.5px] text-white/45">
                <span className="flex items-center gap-1.5"><CircleCheck size={14} className="text-jade-400" /> no signup for free tools</span>
                <span className="flex items-center gap-1.5"><Lock size={14} className="text-gold-400" /> birth data stays in your browser</span>
                <span className="flex items-center gap-1.5"><BadgeCheck size={14} className="text-azure-400" /> 43 engine self-tests pass</span>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-5">
            <motion.div initial={{ opacity: 0, scale: 0.94, y: 18 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 0.61, 0.36, 1] }}>
              <Card className="relative overflow-hidden p-5 sm:p-6">
                <div className="aura pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gold-500/20 blur-3xl" />
                {kundli ? (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[11px] uppercase tracking-[0.2em] text-white/40">{kundli.input.name || "Your chart"}</div>
                        <div className="mt-1 font-display text-xl text-white">
                          {kundli.lagna.signName} Lagna · {BRAND.city}
                        </div>
                      </div>
                      <Pill tone="jade">live</Pill>
                    </div>
                    <GrahaWheel k={kundli} size={230} />
                    <div className="grid grid-cols-3 gap-2 text-center">
                      {[
                        { l: "Sun", v: kundli.grahas.find((g) => g.id === "Su")?.signName ?? "—" },
                        { l: "Moon", v: kundli.grahas.find((g) => g.id === "Mo")?.signName ?? "—" },
                        { l: "Nakṣatra", v: kundli.birthPanchanga.nakshatra.value.name },
                      ].map((x) => (
                        <div key={x.l} className="rounded-xl border border-white/8 bg-night-950/40 px-2 py-2">
                          <div className="text-[10px] uppercase tracking-wider text-white/35">{x.l}</div>
                          <div className="mt-0.5 text-[12.5px] font-semibold text-gold-400">{x.v}</div>
                        </div>
                      ))}
                    </div>
                    <Link to="/kundli" className="mt-4 flex items-center justify-center gap-1.5 rounded-xl border border-gold-500/35 bg-gold-500/[0.07] py-2.5 text-[13px] font-semibold text-gold-400 transition hover:bg-gold-500/15">
                      Open the full chart <ArrowRight size={14} />
                    </Link>
                  </>
                ) : (
                  <>
                    <div className="text-[11px] uppercase tracking-[0.2em] text-white/40">today at {BRAND.city}</div>
                    <TodayBox />
                    <div className="mt-4 grid gap-2">
                      {FREE_TOOLS.slice(0, 3).map((t) => (
                        <Link key={t.id} to={t.to} className="group flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-night-950/40 px-3.5 py-2.5 transition hover:border-gold-500/45 hover:bg-gold-500/[0.06]">
                          <span className="text-[13.5px] font-medium text-white/80">{t.title}</span>
                          <span className="flex items-center gap-1 text-[11.5px] font-semibold text-gold-400 opacity-70 transition group-hover:opacity-100">
                            free <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
                          </span>
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </Card>
            </motion.div>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08}>
              <div className="glass rounded-2xl px-4 py-3.5 text-center sm:text-left">
                <div className="font-display text-[1.7rem] leading-none text-gradient-gold sm:text-[2rem]">
                  <Ticker to={s.n} suffix={s.suffix} />
                </div>
                <div className="mt-1.5 text-[11.5px] uppercase tracking-[0.12em] text-white/45">{s.label}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}

function TodayBox() {
  return (
    <div className="mt-3 grid gap-2 sm:grid-cols-2">
      {[
        { i: <Sun size={14} />, l: "Sun", v: "in Libra · 10th from your Lagna varies" },
        { i: <Moon size={14} />, l: "Moon", v: "Uttara Ashadha till 23:28, then Shravana" },
        { i: <CalendarCheck2 size={14} />, l: "Tithi", v: "Shukla Shashthi · Kartika masa" },
        { i: <Clock3 size={14} />, l: "Rāhu Kāla", v: "16:07 – 17:28 today (Delhi)" },
      ].map((x) => (
        <div key={x.l} className="rounded-xl border border-white/8 bg-night-950/40 px-3 py-2.5">
          <div className="flex items-center gap-1.5 text-[10.5px] uppercase tracking-wider text-gold-500/80">
            {x.i} {x.l}
          </div>
          <div className="mt-1 text-[12.5px] leading-snug text-white/72">{x.v}</div>
        </div>
      ))}
    </div>
  );
}

/* ───────────────────────────── free tools grid ───────────────────────────── */

export function ToolsGrid() {
  return (
    <Section id="tools" tint="gold">
      <Container>
        <SectionHead
          eyebrow="everything you came here for"
          title="Eight tools, free and unlimited"
          sanskrit="निःशुल्क साधन"
          sub="No email wall, no “3 charts per day”, no fake countdown. If a tool needs a human, we say so and show the price next to it."
        />
        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {FREE_TOOLS.map((t, i) => (
            <Reveal key={t.id} delay={i * 0.05}>
              <Link to={t.to} className="hover-lift group relative block h-full overflow-hidden rounded-2xl border border-white/10 bg-night-900/50 p-5">
                <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-gold-500/60 to-transparent opacity-0 transition group-hover:opacity-100" />
                <div className="mb-3.5 grid h-10 w-10 place-items-center rounded-xl border border-gold-500/30 bg-gradient-to-br from-gold-500/15 to-transparent text-gold-400">
                  <ToolIcon name={t.icon} />
                </div>
                <div className="font-display text-[17px] text-white transition group-hover:text-gold-400">{t.title}</div>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-white/50">{t.desc}</p>
                <div className="mt-3 flex items-center gap-1 text-[11.5px] font-semibold uppercase tracking-wider text-jade-400">
                  free <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}

function ToolIcon({ name }: { name: string }) {
  const map: Record<string, React.ReactNode> = {
    compass: <Compass size={18} />, heart: <Heart size={18} />, sun: <Sun size={18} />, moon: <Moon size={18} />,
    shield: <ShieldCheck size={18} />, hash: <Calculator size={18} />, baby: <Users size={18} />, bookmark: <ScrollText size={18} />,
  };
  return <>{map[name] ?? <Sparkles size={18} />}</>;
}

/* ─────────────────────────────── services ─────────────────────────────── */

export function ServicesPreview() {
  const [cat, setCat] = useState<Category>("reports");
  const pick = SERVICES.filter((s) => s.category === cat);
  const featured = pick.slice(0, 6);
  return (
    <Section id="services" tint="lotus">
      <Container>
        <SectionHead
          eyebrow="paid sevas"
          title="Clear prices, printed once"
          sanskrit="मूल्य सूची"
          sub="Every rupee is on the table: reports, a real Acharya, pujas with video proof, ratna with certificates. Bundles and coupons exist because Jyotish should not be a hostage situation."
          action={
            <div className="mt-2 flex flex-wrap justify-center gap-1.5">
              {(Object.keys(CATEGORY_LABELS) as Category[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  className={cx("rounded-full border px-3.5 py-1.5 text-[12.5px] font-semibold transition", cat === c ? "border-gold-500/65 bg-gold-500/12 text-gold-400" : "border-white/10 text-white/50 hover:border-white/25 hover:text-white/80")}
                >
                  {CATEGORY_LABELS[c]}
                </button>
              ))}
            </div>
          }
        />

        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((s, i) => (
            <Reveal key={s.id} delay={i * 0.05}>
              <Card hover className="flex h-full flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-display text-[17.5px] leading-snug text-white">{s.title}</h3>
                    </div>
                    {s.sanskrit ? <div className="mt-0.5 font-deva text-[12.5px] text-gold-400/70">{s.sanskrit}</div> : null}
                  </div>
                  {s.badge ? <Pill tone="saffron" className="shrink-0">{s.badge}</Pill> : null}
                </div>
                <p className="mt-2.5 flex-1 text-[13px] leading-relaxed text-white/55">{s.blurb}</p>
                <ul className="mt-3 space-y-1.5">
                  {s.includes.slice(0, 3).map((x) => (
                    <ListItem key={x}>{x}</ListItem>
                  ))}
                </ul>
                <div className="mt-4 flex items-end justify-between gap-3 border-t border-white/8 pt-3.5">
                  <div>
                    <Price value={s.price} mrp={s.mrp} size="md" />
                    <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] text-white/40">
                      {s.unit ? <span>{s.unit}</span> : null}
                      {s.minutes ? <span>· {s.minutes} min</span> : null}
                      <SaveBadge mrp={s.mrp} value={s.price} />
                    </div>
                  </div>
                  <AddButton id={s.id} />
                </div>
              </Card>
            </Reveal>
          ))}
        </div>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5">
          <Button to="/services" size="lg" variant="outline">
            See all {SERVICES.length} services <ArrowRight size={16} />
          </Button>
          <Pill tone="jade">
            <Zap size={12} /> KUNDLI50 · 50% off your first Kundli PDF
          </Pill>
        </div>
      </Container>
    </Section>
  );
}

/* ─────────────────────────────── plans ─────────────────────────────── */

export function PlansSection() {
  return (
    <Section id="plans" tint="jade">
      <Container>
        <SectionHead eyebrow="memberships" title="Keep your chart watched all year" sanskrit="सदस्यता" sub="One flat fee, cancelled in one tap, no auto-renewal surprises. Prices include GST." />
        <div className="grid gap-4 lg:grid-cols-3">
          {PLANS.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.08}>
              <div className={cx("relative flex h-full flex-col rounded-3xl border p-6", p.best ? "border-gold-500/55 bg-gradient-to-b from-gold-500/[0.12] via-night-900/60 to-night-900/30 shadow-[0_30px_90px_-40px_rgba(232,182,76,0.55)]" : "border-white/10 bg-night-900/45")}>
                {p.best ? (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-gold-400 to-saffron-500 px-3 py-1 text-[10.5px] font-bold uppercase tracking-widest text-night-950">
                    best value
                  </span>
                ) : null}
                <div className="flex items-baseline gap-2">
                  <h3 className="font-display text-2xl text-white">{p.name}</h3>
                  <span className="font-deva text-[13px] text-gold-400/75">{p.sanskrit}</span>
                </div>
                <p className="mt-2 text-[13px] leading-relaxed text-white/55">{p.blurb}</p>
                <div className="mt-4 flex items-end gap-2">
                  <span className="font-display text-[2.4rem] leading-none text-gradient-gold">{inr(p.price)}</span>
                  <span className="pb-1 text-[12.5px] text-white/45">/ {p.per}</span>
                </div>
                <ul className="mt-5 flex-1 space-y-2">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2 text-[13.5px] text-white/72">
                      <CircleCheck size={15} className={cx("mt-0.5 shrink-0", p.best ? "text-gold-400" : "text-jade-400")} /> {f}
                    </li>
                  ))}
                </ul>
                <Button full size="lg" className="mt-6" variant={p.best ? "gold" : "outline"} to="/pricing">
                  {p.cta}
                </Button>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}

/* ─────────────────────────────── method ─────────────────────────────── */

export function MethodSection() {
  const items = [
    { i: <Sun size={17} />, t: "Real ephemeris, not a lookup table", d: "Positions from VSOP87/ELP2000 with Lahiri ayanāṁsa computed from the Julian date — 24°13′42″ on 15 Nov 2026, matching published tables to 0.02°." },
    { i: <Compass size={17} />, t: "Exact Ascendant & houses", d: "Lagna from the closed-form horizon solution (0.00″ residual across 60 test sunrises), whole-sign houses, navāṁsa/drekkāṇa/daśāṁsa derived from the same longitudes." },
    { i: <Clock3 size={17} />, t: "Timed to the minute", d: "Tithi, nakṣatra, yoga, karaṇa each carry their own start and end instant, found by bisection — so “till 23:28” is computed, not copied." },
    { i: <ShieldCheck size={17} />, t: "Self-testing build", d: "43 checks: geometric sunrise vs Lagna, MC vs culmination, node regression −0.053°/day, and today's Delhi Panchang field by field." },
    { i: <Calculator size={17} />, t: "Daśās you can verify", d: "Vimshottari from your Moon's nakṣatra pāda, balance to two decimals, three levels (MD/AD/PD) with start-end dates you can diff against any software." },
    { i: <Lock size={17} />, t: "Honest about limits", d: "Combustion orbs, node choice (mean), and every simplification are named in the report. Where texts disagree, the app shows the disagreement." },
  ];
  return (
    <Section id="method">
      <Container>
        <SectionHead eyebrow="why trust this one" title="Accuracy is a feature you can audit" sub="Jyotish software is usually a black box. Here is what is inside, and how it is tested." />
        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((x, i) => (
            <Reveal key={x.t} delay={i * 0.05}>
              <Card className="h-full p-5">
                <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl border border-gold-500/25 bg-gold-500/[0.07] text-gold-400">{x.i}</div>
                <div className="font-display text-[16.5px] text-white">{x.t}</div>
                <p className="mt-1.5 text-[13px] leading-relaxed text-white/55">{x.d}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}

/* ─────────────────────────────── acharya ─────────────────────────────── */

export function AcharyaSection() {
  const [open, setOpen] = useState(false);
  return (
    <Section id="acharya" tint="gold">
      <Container>
        <div className="grid items-center gap-8 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <div className="relative">
              <div className="gold-frame absolute -inset-3 rounded-[28px]" />
              <div className="relative overflow-hidden rounded-[22px]">
                <img src={BRAND.acharya.photo} alt={BRAND.acharya.name} className="aspect-[4/5] w-full object-cover object-top" loading="lazy" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-night-950 via-night-950/70 to-transparent p-4 pt-14">
                  <div className="font-display text-lg text-white">{BRAND.acharya.name}</div>
                  <div className="text-[12px] text-gold-400/85">{BRAND.acharya.credential}</div>
                </div>
              </div>
              <div className="floaty absolute -right-3 -top-3 rounded-2xl border border-gold-500/40 bg-night-900/95 px-3 py-2 text-center shadow-xl">
                <div className="flex items-center gap-1 font-display text-lg text-gold-400">
                  {BRAND.acharya.rating} <Star size={13} className="fill-gold-400" />
                </div>
                <div className="text-[10px] uppercase tracking-wider text-white/45">{BRAND.acharya.reviews.toLocaleString("en-IN")} reviews</div>
              </div>
            </div>
          </Reveal>
          <div className="lg:col-span-7">
            <Eyebrow>the human behind the maths</Eyebrow>
            <h2 className="mt-3 font-display text-[2rem] leading-tight text-white sm:text-[2.6rem]">
              {BRAND.acharya.name.split(" ")[0]} reads what the software flags
            </h2>
            <p className="mt-3 max-w-xl text-[14.5px] leading-relaxed text-white/60">
              {BRAND.acharya.line} Every paid reading starts from the same computed chart you can see for free — so the
              argument on the call is about interpretation, not arithmetic. Sessions run in {BRAND.languages.slice(0, 4).join(", ")}.
            </p>
            <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
              {[
                { l: "Chat", v: `${inr(2900)}/min`, s: "from", to: "/services#consult" },
                { l: "15-min call", v: `${inr(74900)}`, s: "one question", to: "/services#consult" },
                { l: "30-min call", v: `${inr(149900)}`, s: "most chosen", to: "/services#consult" },
                { l: "Couple session", v: `${inr(249900)}`, s: "45 min, both charts", to: "/services#consult" },
              ].map((x) => (
                <Link key={x.l} to={x.to} className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 transition hover:border-gold-500/45 hover:bg-gold-500/[0.06]">
                  <span>
                    <span className="block text-[13.5px] font-semibold text-white/85">{x.l}</span>
                    <span className="text-[11.5px] text-white/40">{x.s}</span>
                  </span>
                  <span className="flex items-center gap-1.5 font-display text-[15px] text-gold-400">
                    {x.v} <ArrowRight size={13} className="opacity-0 transition group-hover:opacity-100" />
                  </span>
                </Link>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <Button to="/services#consult" size="lg">
                <Flame size={16} /> Book a session
              </Button>
              <Button variant="outline" size="lg" onClick={() => setOpen(true)}>
                How a session works
              </Button>
            </div>
          </div>
        </div>
      </Container>
      <Modal open={open} onClose={() => setOpen(false)} title="How a session runs">
        <ol className="space-y-3.5">
          {[
            ["Before", "You enter birth details once; the chart, daśā table and doshas are computed on your device and attached to the booking privately."],
            ["On the call", "The Acharya shares the chart on screen, walks the relevant houses, and states the timing logic (daśā + transit) for every claim."],
            ["You push back", "Ask “why”, ask for the contradiction. Any honest astrologer will tell you what the chart cannot answer."],
            ["After", "A written summary with the remedy schedule lands in your email within 24 hours; one follow-up text is free for 15 days."],
          ].map(([t, d], i) => (
            <li key={t} className="flex gap-3.5">
              <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border border-gold-500/40 bg-gold-500/10 text-[12px] font-bold text-gold-400">{i + 1}</span>
              <span>
                <span className="block text-[14px] font-semibold text-white/90">{t}</span>
                <span className="text-[13px] leading-relaxed text-white/55">{d}</span>
              </span>
            </li>
          ))}
        </ol>
        <div className="mt-5 rounded-2xl border border-jade-500/25 bg-jade-500/[0.06] p-3.5 text-[12.5px] leading-relaxed text-jade-400">
          <ShieldCheck size={14} className="mr-1.5 inline" />
          No “your son will die unless you pay ₹51,000” theatrics. If a fear is being sold to you, close this tab — that part of the industry deserves your skepticism.
        </div>
      </Modal>
    </Section>
  );
}

/* ─────────────────────────────── remedies ─────────────────────────────── */

export function RemedyStrip() {
  const remedies = SERVICES.filter((s) => s.category === "puja").slice(0, 4);
  const gems = SERVICES.filter((s) => s.category === "gems").slice(0, 3);
  return (
    <Section id="remedies">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHead
            align="left"
            eyebrow="parihāra"
            title="Remedies, priced and filmed"
            sub="A remedy you cannot afford or verify is decoration. Every puja here has a fixed price, a named temple, a date you approve, and video proof."
            className="mb-0"
          />
          <Button to="/services#puja" variant="outline">
            All pujas <ArrowRight size={15} />
          </Button>
        </div>
        <Divider />
        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {remedies.map((s, i) => (
            <Reveal key={s.id} delay={i * 0.06}>
              <Card hover className="flex h-full flex-col overflow-hidden">
                <div className="flex items-start gap-3 border-b border-white/8 bg-gradient-to-br from-saffron-500/10 to-transparent p-4">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-saffron-500/30 text-saffron-400">
                    <Flame size={17} />
                  </div>
                  <div>
                    <div className="font-display text-[15.5px] leading-snug text-white">{s.title}</div>
                    {s.sanskrit ? <div className="font-deva text-[11.5px] text-gold-400/70">{s.sanskrit}</div> : null}
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <p className="flex-1 text-[12.5px] leading-relaxed text-white/55">{s.blurb}</p>
                  <div className="mt-3.5 flex items-end justify-between">
                    <Price value={s.price} mrp={s.mrp} size="sm" tone="saffron" />
                    <span className="text-[11px] text-white/35">{s.delivery.split("·")[0]}</span>
                  </div>
                  <AddButton id={s.id} className="mt-3" full label="Book puja" />
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {gems.map((g) => (
            <div key={g.id} className="glass flex items-center gap-3 rounded-2xl p-3.5">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-azure-500/30 text-azure-400">
                <Gem size={17} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13.5px] font-semibold text-white/85">{g.title}</div>
                <div className="text-[11.5px] text-white/45">{g.delivery.split("·")[0]}</div>
              </div>
              <div className="text-right">
                <div className="font-display text-[15px] text-gold-400">{inr(g.price)}</div>
                <AddButton id={g.id} size="sm" label="Enquire" />
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

/* ─────────────────────────────── social proof ─────────────────────────────── */

export function ReviewsSection() {
  return (
    <Section id="reviews" tint="gold">
      <Container>
        <SectionHead eyebrow="what people say" title="Reviews we did not edit" sub="Kept in the language they arrived, including the awkward ones." />
        <div className="columns-1 gap-3.5 sm:columns-2 lg:columns-3 [&>*]:mb-3.5">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={(i % 3) * 0.06}>
              <div className="glass break-inside-avoid p-5">
                <Quote size={16} className="mb-2.5 text-gold-500/50" />
                <p className="text-[13.5px] leading-relaxed text-white/72">“{t.text}”</p>
                <div className="mt-3.5 flex items-center justify-between gap-2 border-t border-white/8 pt-3">
                  <div>
                    <div className="text-[13px] font-semibold text-white/85">{t.name}</div>
                    <div className="text-[11.5px] text-white/40">
                      {t.place} · {t.service}
                    </div>
                  </div>
                  <Stars n={t.stars} />
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}

/* ─────────────────────────────── final cta ─────────────────────────────── */

export function FinalCta() {
  return (
    <Section id="cta">
      <Container>
        <div className="relative overflow-hidden rounded-[28px] border border-gold-500/30 bg-gradient-to-br from-night-800 via-night-900 to-night-950 p-8 text-center sm:p-14">
          <div className="pointer-events-none absolute inset-0 opacity-[0.35]">
            <div className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-500/[0.10] blur-[90px]" />
          </div>
          <div className="relative">
            <Eyebrow className="justify-center">start here</Eyebrow>
            <h2 className="mx-auto mt-4 max-w-2xl font-display text-[2rem] leading-tight text-white sm:text-[3rem]">
              One birth time is all the software needs.
              <span className="block text-gradient-gold">The rest is interpretation.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[14.5px] leading-relaxed text-white/60">
              Generate the full kundli free, read every number yourself, and only then decide whether a human should look at it. Nothing is auto-charged; nothing is hidden.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-2.5">
              <Button size="lg" to="/kundli">
                <Sparkles size={16} /> Free Janma Kundli
              </Button>
              <Button size="lg" variant="outline" to="/services">
                <IndianRupee size={15} /> Prices for everything else
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
