/**
 * Services & Prices — the whole catalogue: search, filter, sort, bundles,
 * coupons, memberships, FAQ, refunds and the disclaimer. This page is the
 * "prices for services" the app promises; everything is priced in INR, GST
 * included, and nothing is added to the cart without a click.
 */
import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowRight, BadgeCheck, Banknote, ChevronDown, Clock3, Flame, Gem, GraduationCap, Heart, IndianRupee,
  Check, CircleCheck, Info, MessageSquare, Phone, Quote, Search, ShieldCheck, Sparkles, Tag, Users,
} from "lucide-react";
import {
  BRAND, BUNDLES, CATEGORY_LABELS, COUPONS, DISCLAIMER, FAQS, FREE_TOOLS, PLANS, SERVICES, STATS,
  TESTIMONIALS, discountPct, type Category, type Service,
} from "../data/catalog";
import { inr } from "../lib/format";
import { useApp } from "../store";
import { AddButton } from "../components/Cart";
import { Button, Card, Container, Divider, Eyebrow, ListItem, Modal, Pill, Price, Reveal, Row, SaveBadge, Section, SectionHead, Stars, Ticker, cx } from "../components/ui";

const CAT_ICON: Record<Category, React.ReactNode> = {
  reports: <BadgeCheck size={16} />,
  consultation: <Phone size={16} />,
  matching: <Heart size={16} />,
  puja: <Flame size={16} />,
  gems: <Gem size={16} />,
  numbers: <Sparkles size={16} />,
  education: <GraduationCap size={16} />,
};

type Sort = "popular" | "low" | "high" | "save";

export function ServicesPage() {
  const [cat, setCat] = useState<Category | "all">("all");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<Sort>("popular");
  const [open, setOpen] = useState<Service | null>(null);
  const loc = useLocation();

  // deep links: /services#consult, #puja, #gems, #bundles, #faq, #method
  const hash = (loc.hash || "").replace("#", "");
  const hashToCat: Record<string, Category> = { consult: "consultation", matching: "matching", puja: "puja", gems: "gems", numbers: "numbers", education: "education", reports: "reports" };
  const activeCat = (hashToCat[hash] ?? cat) as Category | "all";

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let out = SERVICES.filter((s) => (activeCat === "all" ? true : s.category === activeCat));
    if (needle)
      out = out.filter((s) => `${s.title} ${s.blurb} ${s.sanskrit ?? ""} ${s.includes.join(" ")}`.toLowerCase().includes(needle));
    const by: Record<Sort, (a: Service, b: Service) => number> = {
      popular: (a, b) => Number(!!b.popular) - Number(!!a.popular) || b.price - a.price,
      low: (a, b) => a.price - b.price,
      high: (a, b) => b.price - a.price,
      save: (a, b) => discountPct(b) - discountPct(a),
    };
    return [...out].sort(by[sort]);
  }, [activeCat, q, sort]);

  const cheapest = Math.min(...SERVICES.map((s) => s.price));

  return (
    <>
      {/* ── header ── */}
      <Section className="pb-4 pt-10 sm:pt-14">
        <Container>
          <div className="grid items-end gap-6 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <Eyebrow>सेवा एवं मूल्य · {SERVICES.length} services</Eyebrow>
              <h1 className="mt-3 font-display text-[2.2rem] leading-tight text-white sm:text-[3.1rem]">
                Everything we sell, <span className="text-gradient-gold">with the price on it</span>
              </h1>
              <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-white/60">
                From {inr(cheapest)} upward, GST included, no call-me-first quotes and no "starts at" asterisks. The eight
                calculation tools are free and stay free — you are paying for a typeset report, a priest's time, a certified
                stone, or an Acharya's judgement.
              </p>
            </div>
            <div className="lg:col-span-4">
              <Card className="p-4">
                <div className="mb-2 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-gold-500">
                  <Tag size={13} /> live coupons
                </div>
                {Object.entries(COUPONS).map(([code, c]) => (
                  <Row key={code} k={<span className="font-mono text-gold-400">{code}</span>} v={c.label} />
                ))}
                <p className="mt-2 text-[11px] text-white/40">Apply in the cart; the discount line is shown before you pay.</p>
              </Card>
            </div>
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="glass rounded-2xl px-4 py-3">
                <div className="font-display text-[1.6rem] leading-none text-gradient-gold">
                  <Ticker to={s.n} suffix={s.suffix} />
                </div>
                <div className="mt-1 text-[11px] uppercase tracking-[0.12em] text-white/45">{s.label}</div>
              </div>
            ))}
          </div>

          {/* ── controls ── */}
          <div className="mt-7 flex flex-col gap-3 rounded-2xl border border-white/10 bg-night-900/50 p-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gold-500/70" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search “mangal”, “pearl”, “wedding”, “course”…"
                className="w-full rounded-xl border border-white/10 bg-night-950/60 py-2.5 pl-9 pr-3 text-[13.5px] outline-none placeholder:text-white/30 focus:border-gold-500/60"
              />
            </div>
            <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
              <CatChip active={activeCat === "all"} onClick={() => setCat("all")}>
                all {SERVICES.length}
              </CatChip>
              {(Object.keys(CATEGORY_LABELS) as Category[]).map((c) => (
                <CatChip key={c} active={activeCat === c} onClick={() => setCat(c)}>
                  {CAT_ICON[c]} {CATEGORY_LABELS[c]}
                </CatChip>
              ))}
            </div>
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="rounded-xl border border-white/10 bg-night-950/60 px-3 py-2.5 text-[13px] text-white/75 outline-none focus:border-gold-500/60">
              <option value="popular">most chosen</option>
              <option value="low">price: low → high</option>
              <option value="high">price: high → low</option>
              <option value="save">biggest saving</option>
            </select>
          </div>
        </Container>
      </Section>

      {/* ── grid ── */}
      <Section id={hash} className="pt-2">
        <Container>
          {list.length === 0 ? (
            <Card className="p-10 text-center">
              <p className="text-[14px] text-white/60">Nothing matches “{q}”. Try “mangal”, “shani”, “pearl”, “career”, “course”.</p>
              <Button size="sm" variant="outline" className="mt-3" onClick={() => { setQ(""); setCat("all"); }}>
                clear filters
              </Button>
            </Card>
          ) : (
            <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((s, i) => (
                <Reveal key={s.id} delay={(i % 3) * 0.04}>
                  <ServiceCard s={s} onOpen={() => setOpen(s)} />
                </Reveal>
              ))}
            </div>
          )}

          {/* ── bundles ── */}
          <div id="bundles" className="mt-12">
            <Divider label="bundles" />
            <SectionHead eyebrow="cheaper together" title="Three bundles that cover the usual situations" />
            <div className="grid gap-3.5 lg:grid-cols-3">
              {BUNDLES.map((b, i) => (
                <Reveal key={b.id} delay={i * 0.06}>
                  <div className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-gold-500/30 bg-gradient-to-br from-night-800/70 to-night-950/60 p-5">
                    <div className="aura pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gold-500/20 blur-3xl" />
                    <div className="relative">
                      <div className="flex items-center gap-2">
                        <Pill tone="saffron">save {b.save}</Pill>
                        {i === 0 ? <Pill tone="gold">most booked</Pill> : null}
                      </div>
                      <h3 className="mt-2.5 font-display text-[20px] text-white">{b.title}</h3>
                      <p className="mt-1 text-[12.5px] text-white/50">{b.note}</p>
                      <ul className="mt-3 space-y-1.5">
                        {b.items.map((x) => (
                          <ListItem key={x} tone="gold">
                            {x}
                          </ListItem>
                        ))}
                      </ul>
                    </div>
                    <div className="relative mt-4 flex items-end justify-between border-t border-white/10 pt-3.5">
                      <Price value={b.price} mrp={b.mrp} />
                      <AddButton id={b.id} label="Add bundle" />
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* ── memberships ── */}
          <div id="plans" className="mt-12">
            <Divider label="memberships" />
            <SectionHead eyebrow="annual" title="Or keep the whole family covered" sub="One price a year, cancelled in a tap; includes the reports and the calls a household actually needs." />
            <div className="grid gap-4 lg:grid-cols-3">
              {PLANS.map((p, i) => (
                <Reveal key={p.id} delay={i * 0.06}>
                  <div className={cx("flex h-full flex-col rounded-3xl border p-6", p.best ? "border-gold-500/55 bg-gradient-to-b from-gold-500/[0.12] to-night-900/40" : "border-white/10 bg-night-900/45")}>
                    <div className="flex items-baseline gap-2">
                      <h3 className="font-display text-[22px] text-white">{p.name}</h3>
                      <span className="font-deva text-[13px] text-gold-400/75">{p.sanskrit}</span>
                      {p.best ? <Pill tone="gold" className="ml-auto">best value</Pill> : null}
                    </div>
                    <p className="mt-2 text-[13px] leading-relaxed text-white/55">{p.blurb}</p>
                    <div className="mt-4 flex items-end gap-1.5">
                      <span className="font-display text-[2.3rem] leading-none text-gradient-gold">{inr(p.price)}</span>
                      <span className="pb-1 text-[12px] text-white/45">/ {p.per}</span>
                    </div>
                    <ul className="mt-4 flex-1 space-y-2">
                      {p.features.map((f) => (
                        <li key={f} className="flex gap-2 text-[13px] text-white/70">
                          <CircleCheckLike /> {f}
                        </li>
                      ))}
                    </ul>
                    <PlanButton id={p.id} best={!!p.best} label={p.cta} />
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* ── how payment works ── */}
          <div className="mt-12 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { i: <ShieldCheck size={16} />, t: "What you pay includes GST", d: "18% on services, 3% on stones — shown as a line in the cart, never a surprise at the end." },
              { i: <Banknote size={16} />, t: "UPI, card, net banking, cash", d: "Temple visits and couriered samagri can be paid on delivery if you prefer." },
              { i: <Clock3 size={16} />, t: "Digital reports unlock instantly", d: "The 24-page PDF and the dosha reports are available the moment the order is recorded." },
              { i: <MessageSquare size={16} />, t: "Refunds we actually honour", d: "Undelivered report = full refund. Missed slot = refund. Puja: up to 48 h before sankalp." },
            ].map((x) => (
              <Card key={x.t} className="p-5">
                <div className="mb-2.5 grid h-9 w-9 place-items-center rounded-xl border border-gold-500/25 bg-gold-500/[0.06] text-gold-400">{x.i}</div>
                <div className="text-[14px] font-semibold text-white/90">{x.t}</div>
                <p className="mt-1 text-[12.5px] leading-relaxed text-white/50">{x.d}</p>
              </Card>
            ))}
          </div>

          {/* ── consultation desk ── */}
          <div id="consult" className="mt-12">
            <Divider label="consultations" />
            <div className="grid gap-4 lg:grid-cols-12">
              <Card className="overflow-hidden p-0 lg:col-span-5">
                <div className="relative">
                  <img src={BRAND.acharya.photo} alt={BRAND.acharya.name} className="aspect-[5/4] w-full object-cover object-top" loading="lazy" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-night-950 via-night-950/60 to-transparent p-5">
                    <div className="font-display text-[20px] text-white">{BRAND.acharya.name}</div>
                    <div className="mt-0.5 text-[12px] text-gold-400/85">{BRAND.acharya.credential}</div>
                    <div className="mt-2 flex items-center gap-2">
                      <Stars n={BRAND.acharya.rating} />
                      <span className="text-[11.5px] text-white/55">
                        {BRAND.acharya.rating} · {BRAND.acharya.reviews.toLocaleString("en-IN")} reviews
                      </span>
                      <Pill tone="jade" className="ml-auto">
                        <span className="live-dot h-1.5 w-1.5 rounded-full bg-jade-400" /> online now
                      </Pill>
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex flex-wrap gap-1.5">
                    <Pill tone="muted">
                      <Users size={11} /> {BRAND.acharya.languages}
                    </Pill>
                    <Pill tone="muted">
                      <IndianRupee size={11} /> {inr(SERVICES.find((s) => s.id === "consult-chat")!.price)}/min chat
                    </Pill>
                  </div>
                  <p className="mt-3 text-[13px] leading-relaxed text-white/60">
                    {BRAND.acharya.line} Trained in the Banaras lineage, {BRAND.established} onwards, {BRAND.acharya.reviews.toLocaleString("en-IN")}+
                    sessions recorded.
                  </p>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    <Button to="/acharya" full>
                      <Phone size={15} /> Book a slot
                    </Button>
                    <AddButton id="consult-30" full label="30-min call ₹1,499" />
                  </div>
                </div>
              </Card>

              <div className="space-y-3 lg:col-span-7">
                {SERVICES.filter((s) => s.category === "consultation").map((s) => (
                  <ServiceRow key={s.id} s={s} onOpen={() => setOpen(s)} />
                ))}
                <Card className="flex flex-wrap items-center justify-between gap-3 p-5">
                  <div>
                    <div className="flex items-center gap-2 text-[14px] font-semibold text-white/90">
                      <Info size={14} className="text-azure-400" /> Not sure which one?
                    </div>
                    <p className="mt-1 max-w-md text-[12.5px] leading-relaxed text-white/50">
                      Start with the free kundli. If a dosha or a daśā is the reason you are here, take the 30-minute call. If
                      the family has already decided to buy stones and pujas from a website, take the ₹999 second opinion
                      instead — it is the cheaper mistake.
                    </p>
                  </div>
                  <Button size="sm" variant="outline" to="/kundli">
                    free kundli first <ArrowRight size={13} />
                  </Button>
                </Card>
              </div>
            </div>
          </div>

          {/* ── free tools reminder ── */}
          <div className="mt-12 rounded-3xl border border-jade-500/25 bg-jade-500/[0.05] p-5 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-jade-400">
                  <Sparkles size={13} /> free forever
                </div>
                <h3 className="mt-2 font-display text-[1.5rem] text-white sm:text-[1.9rem]">These eight cost nothing, always</h3>
                <p className="mt-1.5 max-w-2xl text-[13.5px] leading-relaxed text-white/55">
                  If you only ever use these, that is a complete experience — the paid items exist for people who want the PDF,
                  the priest or the human.
                </p>
              </div>
              <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-4">
                {FREE_TOOLS.map((t) => (
                  <Link key={t.id} to={t.to} className="rounded-xl border border-white/10 bg-night-950/40 px-3 py-2 text-[12.5px] font-semibold text-white/75 transition hover:border-jade-500/45 hover:text-jade-400">
                    {t.title}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* ── reviews ── */}
          <div id="reviews" className="mt-12">
            <Divider label="reviews" />
            <SectionHead eyebrow="unfiltered" title="What buyers said afterwards" />
            <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
              {TESTIMONIALS.slice(0, 6).map((t, i) => (
                <Reveal key={t.name} delay={(i % 3) * 0.05}>
                  <Card className="flex h-full flex-col p-5">
                    <Quote size={15} className="text-gold-500/50" />
                    <p className="mt-2 flex-1 text-[13px] leading-relaxed text-white/68">“{t.text}”</p>
                    <div className="mt-3 flex items-center justify-between border-t border-white/8 pt-3">
                      <div>
                        <div className="text-[13px] font-semibold text-white/85">{t.name}</div>
                        <div className="text-[11px] text-white/40">{t.place} · {t.service}</div>
                      </div>
                      <Stars n={t.stars} />
                    </div>
                  </Card>
                </Reveal>
              ))}
            </div>
          </div>

          {/* ── faq ── */}
          <div id="faq" className="mt-12">
            <Divider label="questions" />
            <SectionHead eyebrow="before you pay" title="Straight answers" />
            <div className="mx-auto max-w-3xl space-y-2">
              {FAQS.map((f, i) => (
                <Faq key={f.q} q={f.q} a={f.a} defaultOpen={i === 0} />
              ))}
            </div>
          </div>

          {/* ── method & disclaimer ── */}
          <div id="method" className="mt-12 grid gap-4 lg:grid-cols-12">
            <Card className="p-6 lg:col-span-7">
              <SectionHead align="left" className="mb-3" eyebrow="our method" title="How a paid report is produced" />
              <ol className="space-y-3">
                {[
                  ["01", "The engine computes", "Your chart, daśās, transits and doshas are generated in the browser — the same code the free tools use, exported into the report so the numbers cannot drift."],
                  ["02", "The Acharya reads it", "Human review of the computed output: cancellation rules, family customs, and the questions the software should not answer. Every claim in the report cites the house, sign and daśā it came from."],
                  ["03", "You get a document", "Typeset PDF with the tables, plus a plain-language section you can read to your mother without translating. Re-runs are free if the birth time is corrected within 30 days."],
                  ["04", "Then, optionally, action", "Pujas booked with the temple, stones with certificates, muhūrta with exact timings. Nothing is bundled into the report you did not ask for."],
                ].map(([n, t, d]) => (
                  <li key={n} className="flex gap-3.5">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-gold-500/40 bg-gold-500/[0.07] text-[11px] font-bold text-gold-400">{n}</span>
                    <span>
                      <span className="block text-[14px] font-semibold text-white/90">{t}</span>
                      <span className="block text-[13px] leading-relaxed text-white/55">{d}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </Card>
            <Card className="p-6 lg:col-span-5">
              <div className="mb-2 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-lotus-400">
                <ShieldCheck size={13} /> disclaimer &amp; refunds
              </div>
              <p id="disclaimer" className="text-[13px] leading-relaxed text-white/60">
                {DISCLAIMER}
              </p>
              <Divider />
              <ul className="space-y-1.5">
                <ListItem>Undelivered digital reports: full refund, no questions.</ListItem>
                <ListItem>Consultations: reschedule freely; refunded if we miss the slot.</ListItem>
                <ListItem>Pujas: refund up to 48 hours before the sankalp (samagri and priests are booked by then).</ListItem>
                <ListItem>Gemstones: 7-day return if the certificate or weight does not match the invoice.</ListItem>
                <ListItem>Disputes: written reply within 3 working days from {BRAND.email}.</ListItem>
              </ul>
              <p className="mt-3 text-[11.5px] text-white/35">
                {BRAND.legal} · GSTIN {BRAND.gstin} · {BRAND.city}, India
              </p>
            </Card>
          </div>
        </Container>
      </Section>

      <ServiceModal s={open} onClose={() => setOpen(null)} />
    </>
  );
}

/* ───────────────────────────── cards ───────────────────────────── */

function ServiceCard({ s, onOpen }: { s: Service; onOpen: () => void }) {
  const off = discountPct(s);
  return (
    <div className="hover-lift relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-night-900/55 p-5">
      {s.popular ? <span className="absolute right-0 top-0 rounded-bl-xl bg-gradient-to-r from-gold-400 to-saffron-500 px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-widest text-night-950">popular</span> : null}
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-gold-500/25 bg-gold-500/[0.06] text-gold-400">{CAT_ICON[s.category]}</span>
        <span className="min-w-0">
          <span className="block font-display text-[16.5px] leading-snug text-white">{s.title}</span>
          {s.sanskrit ? <span className="block font-deva text-[11.5px] text-gold-400/70">{s.sanskrit}</span> : null}
        </span>
      </div>
      <p className="mt-3 flex-1 text-[13px] leading-relaxed text-white/55">{s.blurb}</p>
      <div className="mt-3 flex flex-wrap gap-1">
        {off > 0 ? <Pill tone="jade">{off}% off</Pill> : null}
        {s.minutes ? <Pill tone="muted"><Clock3 size={11} /> {s.minutes} min</Pill> : null}
        <Pill tone="muted"><BadgeCheck size={11} /> {s.delivery.length > 26 ? `${s.delivery.slice(0, 24)}…` : s.delivery}</Pill>
      </div>
      <div className="mt-4 flex items-end justify-between gap-2 border-t border-white/8 pt-3.5">
        <div>
          <Price value={s.price} mrp={s.mrp} />
          {s.unit ? <div className="text-[11px] text-white/40">{s.unit}</div> : null}
          <SaveBadge mrp={s.mrp} value={s.price} />
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <AddButton id={s.id} />
          <button onClick={onOpen} className="text-[11.5px] font-semibold text-white/45 transition hover:text-gold-400">
            what's included ↓
          </button>
        </div>
      </div>
    </div>
  );
}

function ServiceRow({ s, onOpen }: { s: Service; onOpen: () => void }) {
  return (
    <Card className="flex flex-wrap items-center gap-4 p-4">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-gold-500/25 bg-gold-500/[0.06] text-gold-400">{CAT_ICON[s.category]}</span>
      <span className="min-w-[180px] flex-1">
        <span className="block font-display text-[16px] text-white">{s.title}</span>
        <span className="block text-[12px] leading-snug text-white/45">{s.delivery}{s.minutes ? ` · ${s.minutes} min` : ""}</span>
      </span>
      <Price value={s.price} mrp={s.mrp} size="sm" />
      <span className="flex items-center gap-2">
        <AddButton id={s.id} />
        <button onClick={onOpen} className="text-[11.5px] font-semibold text-white/40 hover:text-gold-400">
          details
        </button>
      </span>
    </Card>
  );
}

function ServiceModal({ s, onClose }: { s: Service | null; onClose: () => void }) {
  const { isUnlocked, addService } = useApp();
  return (
    <Modal open={!!s} onClose={onClose} title={s?.title} wide>
      {s ? (
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Pill tone="gold">{CATEGORY_LABELS[s.category]}</Pill>
            {s.badge ? <Pill tone="saffron">{s.badge}</Pill> : null}
            {discountPct(s) > 0 ? <Pill tone="jade">{discountPct(s)}% off today</Pill> : null}
            {isUnlocked(s.id) ? <Pill tone="jade"><Check /> already in your account</Pill> : null}
          </div>
          <p className="mt-3 text-[14px] leading-relaxed text-white/70">{s.blurb}</p>
          <Divider label="included" />
          <ul className="grid gap-1.5 sm:grid-cols-2">
            {s.includes.map((x) => (
              <ListItem key={x}>{x}</ListItem>
            ))}
          </ul>
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            <Row k="Delivery" v={s.delivery} />
            <Row k="Duration" v={s.minutes ? `${s.minutes} minutes` : "asynchronous"} />
            <Row k="Unit" v={s.unit ?? "per order"} />
            <Row k="GST" v="included in the price shown" />
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gold-500/25 bg-gold-500/[0.06] p-4">
            <div>
              <Price value={s.price} mrp={s.mrp} size="lg" />
              <div className="mt-1 text-[11.5px] text-white/45">{s.free ? "free" : `refund per the policy below · ${inr(s.price)} incl. GST`}</div>
            </div>
            <div className="flex items-center gap-2">
              <AddButton id={s.id} size="md" label="Add to cart" />
              <Button size="md" variant="outline" onClick={() => { addService(s.id); onClose(); }}>
                Buy now <ArrowRight size={14} />
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}

function CatChip({ children, active, onClick }: { children: React.ReactNode; active?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} className={cx("flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px] font-semibold transition", active ? "border-gold-500/60 bg-gold-500/12 text-gold-400" : "border-white/10 text-white/50 hover:border-white/25 hover:text-white/80")}>
      {children}
    </button>
  );
}

function Faq({ q, a, defaultOpen }: { q: string; a: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className={cx("overflow-hidden rounded-2xl border transition", open ? "border-gold-500/40 bg-gold-500/[0.04]" : "border-white/10 bg-night-900/45")}>
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left">
        <span className={cx("text-[14.5px] font-semibold transition", open ? "text-gold-400" : "text-white/85")}>{q}</span>
        <ChevronDown size={16} className={cx("shrink-0 text-white/45 transition-transform duration-300", open && "rotate-180 text-gold-400")} />
      </button>
      <div className={cx("grid transition-all duration-300", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
        <div className="overflow-hidden">
          <p className="px-4 pb-4 text-[13.5px] leading-relaxed text-white/60">{a}</p>
        </div>
      </div>
    </div>
  );
}

const CircleCheckLike = () => <CircleCheck size={14} className="mt-0.5 shrink-0 text-gold-400" />;

function PlanButton({ id, best, label }: { id: string; best?: boolean; label: string }) {
  const { addPlan, state } = useApp();
  const chosen = state.plan === id;
  return (
    <Button full size="lg" className="mt-6" variant={best ? "gold" : "outline"} onClick={() => addPlan(id)}>
      {chosen ? <span className="flex items-center gap-1.5"><Check size={15} /> in cart · {label}</span> : label}
    </Button>
  );
}
