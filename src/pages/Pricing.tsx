/**
 * Memberships + the full rate card, in one scrollable table — the page people
 * screenshot to show the family that nothing here is a mystery.
 */
import { useMemo, useState } from "react";
import { ArrowRight, Check, Crown, Gem, IndianRupee, Printer, Sparkles, Star } from "lucide-react";
import { BRAND, CATEGORY_LABELS, COUPONS, FREE_TOOLS, PLANS, SERVICES, type Category } from "../data/catalog";
import { inr } from "../lib/format";
import { useApp } from "../store";
import { AddButton } from "../components/Cart";
import { Button, Card, Container, Divider, Eyebrow, ListItem, Pill, Price, Row, Section, SectionHead, cx } from "../components/ui";

export function PricingPage() {
  const [dense, setDense] = useState(true);
  const grouped = useMemo(() => {
    const cats = Object.keys(CATEGORY_LABELS) as Category[];
    return cats.map((c) => ({ cat: c, items: SERVICES.filter((s) => s.category === c) }));
  }, []);
  const min = Math.min(...SERVICES.map((s) => s.price));
  const max = Math.max(...SERVICES.map((s) => s.price));
  const avg = Math.round(SERVICES.reduce((a, s) => a + s.price, 0) / SERVICES.length / 100) * 100;

  return (
    <>
      <Section className="pb-4 pt-10 sm:pt-14">
        <Container>
          <div className="grid items-end gap-6 lg:grid-cols-12">
            <div className="lg:col-span-9">
              <Eyebrow>मूल्य सूची · rate card</Eyebrow>
              <h1 className="mt-3 font-display text-[2.2rem] leading-tight text-white sm:text-[3.1rem]">
                Prices, <span className="text-gradient-gold">in one place</span>
              </h1>
              <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-white/60">
                {SERVICES.length} paid items, from {inr(min)} to {inr(max)}, GST included, with the list price struck through
                where a discount is running. Membership is the only recurring thing here, and it is yearly on purpose.
              </p>
            </div>
            <div className="lg:col-span-3">
              <Card className="p-4">
                <Row k="cheapest item" v={inr(min)} mono />
                <Row k="average" v={inr(avg)} mono />
                <Row k="most expensive" v={inr(max)} mono />
                <Row k="free tools" v={`${FREE_TOOLS.length} · unlimited`} mono />
                <button onClick={() => window.print()} className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/12 py-2 text-[12.5px] font-semibold text-white/65 hover:border-gold-500/50 hover:text-gold-400">
                  <Printer size={13} /> print this list
                </button>
              </Card>
            </div>
          </div>
        </Container>
      </Section>

      {/* ── plans ── */}
      <Section className="pt-2" tint="gold">
        <Container>
          <SectionHead eyebrow="memberships" title="Three levels of being looked after" sanskrit="सदस्यता" sub="Cancel in one tap from this page; the year simply runs out. Nothing auto-charges." />
          <div className="grid gap-4 lg:grid-cols-3">
            {PLANS.map((p) => (
              <div key={p.id} className={cx("relative flex h-full flex-col rounded-3xl border p-6", p.best ? "border-gold-500/55 bg-gradient-to-b from-gold-500/[0.12] to-night-900/40 shadow-[0_30px_90px_-45px_rgba(232,182,76,0.6)]" : "border-white/10 bg-night-900/45")}>
                {p.best ? (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-gold-400 to-saffron-500 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-night-950">
                    chosen by most
                  </span>
                ) : null}
                <div className="flex items-center gap-2">
                  <span className={cx("grid h-9 w-9 place-items-center rounded-xl border", p.best ? "border-gold-500/50 text-gold-400" : "border-white/12 text-white/50")}>
                    {p.tone === "silver" ? <Star size={16} /> : p.tone === "gold" ? <Crown size={16} /> : <Gem size={16} />}
                  </span>
                  <div>
                    <div className="font-display text-[20px] text-white">{p.name}</div>
                    <div className="font-deva text-[11.5px] text-gold-400/70">{p.sanskrit}</div>
                  </div>
                </div>
                <p className="mt-3 text-[13px] leading-relaxed text-white/55">{p.blurb}</p>
                <div className="mt-4 flex items-end gap-1.5">
                  <span className="font-display text-[2.2rem] leading-none text-gradient-gold">{inr(p.price)}</span>
                  <span className="pb-1 text-[12px] text-white/45">/ {p.per}</span>
                </div>
                <div className="mt-1 text-[11.5px] text-white/35">≈ {inr(Math.round(p.price / 12 / 100) * 100)} a month, if you think in months</div>
                <ul className="mt-4 flex-1 space-y-2">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2 text-[13px] text-white/70">
                      <Check size={14} className={cx("mt-0.5 shrink-0", p.best ? "text-gold-400" : "text-jade-400")} /> {f}
                    </li>
                  ))}
                </ul>
                <PlanCta id={p.id} best={!!p.best} label={p.cta} />
              </div>
            ))}
          </div>

          {/* ── comparison ── */}
          <div className="mt-8 overflow-hidden rounded-3xl border border-white/10">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02] text-[10.5px] uppercase tracking-[0.14em] text-white/45">
                  <th className="px-4 py-2.5">what you get</th>
                  {PLANS.map((p) => (
                    <th key={p.id} className={cx("px-4 py-2.5 text-center", p.best && "text-gold-400")}>
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {([
                  ["Free tools stay free", "✓", "✓", "✓"],
                  ["Saved kundlis", "10", "unlimited", "unlimited"],
                  ["Transit & Sadhe Satī alerts", "✓", "✓", "✓"],
                  ["Monthly PDF horoscope", "—", "✓", "✓"],
                  ["Kundli PDF for the family", "—", "4 / year", "8 / year"],
                  ["Human consultation", "—", "30 min × 4", "60 min + unlimited chat"],
                  ["Muhūrta selections", "—", "1 / quarter", "any event"],
                  ["Discount on pujas & ratna", "5%", "12%", "18%"],
                  ["WhatsApp priority window", "—", "48 h", "same day"],
                  ["Annual report update", "—", "✓", "✓ + free re-run"],
                  ["Price", inr(PLANS[0].price), inr(PLANS[1].price), inr(PLANS[2].price)],
                ] as [string, string, string, string][]).map((r, ri) => (
                  <tr key={r[0]} className={cx("border-b border-white/[0.05] last:border-0", ri === 10 && "bg-gold-500/[0.04]")}>
                    <td className="px-4 py-2.5 text-white/70">{r[0]}</td>
                    {r.slice(1).map((v, i) => (
                      <td key={i} className={cx("px-4 py-2.5 text-center", v === "✓" ? "text-jade-400" : v === "—" ? "text-white/22" : ri === 10 ? "font-display text-gold-400" : "text-white/80")}>
                        {v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Container>
      </Section>

      {/* ── rate card ── */}
      <Section className="pt-4">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <SectionHead align="left" className="mb-0" eyebrow="à la carte" title="Every service, priced" sub="Click a row to add it — the cart shows the tax and the coupon before you pay." />
            <button onClick={() => setDense(!dense)} className="rounded-full border border-white/12 px-3 py-1.5 text-[12px] font-semibold text-white/60 hover:border-gold-500/50 hover:text-gold-400">
              {dense ? "show descriptions" : "compact rows"}
            </button>
          </div>
          <div className="mt-6 space-y-7">
            {grouped.map(({ cat, items }) => (
              <div key={cat}>
                <div className="mb-2.5 flex items-center gap-2.5">
                  <span className="text-gold-400">
                    <Sparkles size={14} />
                  </span>
                  <h3 className="font-display text-[18px] text-white">{CATEGORY_LABELS[cat]}</h3>
                  <span className="text-[11.5px] text-white/35">{items.length} items</span>
                  <span className="ml-auto hidden items-center gap-2 sm:flex">
                    <span className="text-[11px] uppercase tracking-wider text-white/30">from</span>
                    <span className="font-display text-[15px] text-gold-400">{inr(Math.min(...items.map((i) => i.price)))}</span>
                  </span>
                </div>
                <div className="overflow-hidden rounded-2xl border border-white/10">
                  {items.map((s, i) => (
                    <div key={s.id} className={cx("flex flex-wrap items-center gap-3 px-4 py-3 transition hover:bg-gold-500/[0.04]", i % 2 ? "bg-white/[0.012]" : "bg-transparent", i > 0 && "border-t border-white/[0.06]")}>
                      <div className="min-w-[190px] flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[14px] font-semibold text-white/88">{s.title}</span>
                          {s.sanskrit ? <span className="font-deva text-[11px] text-gold-400/65">{s.sanskrit}</span> : null}
                          {s.popular ? <Pill tone="gold">popular</Pill> : null}
                        </div>
                        {dense ? (
                          <div className="mt-0.5 text-[11.5px] text-white/40">
                            {s.delivery}
                            {s.minutes ? ` · ${s.minutes} min` : ""}
                            {s.unit ? ` · ${s.unit}` : ""}
                          </div>
                        ) : (
                          <p className="mt-1 max-w-2xl text-[12.5px] leading-relaxed text-white/50">{s.blurb}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <Price value={s.price} mrp={s.mrp} size="sm" />
                        {s.mrp && s.mrp > s.price ? <Pill tone="jade">{Math.round((1 - s.price / s.mrp) * 100)}%</Pill> : null}
                        <AddButton id={s.id} size="sm" label="Add" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <Divider />
          <div className="grid gap-4 lg:grid-cols-12">
            <Card className="p-5 lg:col-span-4">
              <div className="mb-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-gold-500">
                <IndianRupee size={13} className="mr-1 inline" /> coupons
              </div>
              {Object.entries(COUPONS).map(([code, c]) => (
                <Row key={code} k={<span className="font-mono text-[12px] text-gold-400">{code}</span>} v={c.label} />
              ))}
              <p className="mt-2 text-[11.5px] text-white/40">One coupon per order; membership discount stacks on top.</p>
            </Card>
            <Card className="p-5 lg:col-span-4">
              <div className="mb-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-gold-500">what is never charged</div>
              <ul className="space-y-1.5">
                {FREE_TOOLS.map((t) => (
                  <li key={t.id} className="flex items-center gap-2 text-[13px] text-white/65">
                    <Check size={13} className="text-jade-400" /> {t.title}
                  </li>
                ))}
              </ul>
              <p className="mt-2.5 text-[11.5px] leading-relaxed text-white/40">
                No SMS credits, no “premium unlock”, no per-query fees on the calculators, no paywall on the Panchang.
              </p>
            </Card>
            <Card className="p-5 lg:col-span-4">
              <div className="mb-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-gold-500">how to pay</div>
              <ul className="space-y-1.5">
                <ListItem>UPI to {BRAND.email.split("@")[1]} handle <span className="font-mono text-gold-400">astrodrishti@icici</span></ListItem>
                <ListItem>Card / net banking via Razorpay (checkout step 2)</ListItem>
                <ListItem>Cash on samagri delivery for pujas within India</ListItem>
                <ListItem>RTGS for orders over ₹1,00,000 (GST invoice issued)</ListItem>
              </ul>
              <Button size="sm" variant="outline" full className="mt-3" to="/services">
                browse by category <ArrowRight size={13} />
              </Button>
            </Card>
          </div>

          <p className="mt-6 text-center text-[11.5px] leading-relaxed text-white/35">
            Prices are in Indian rupees and include GST at the applicable rate. Rates for stones track the market and are
            revised on the 1st of each month; a quote held for 7 days at the time you added it to the cart.
          </p>
        </Container>
      </Section>
    </>
  );
}

function PlanCta({ id, best, label }: { id: string; best?: boolean; label: string }) {
  const { addPlan, state } = useApp();
  const active = state.plan === id;
  return (
    <Button full size="lg" className="mt-6" variant={best ? "gold" : "outline"} onClick={() => addPlan(id)}>
      {active ? <span className="flex items-center gap-1.5"><Check size={15} /> in cart</span> : label}
    </Button>
  );
}
