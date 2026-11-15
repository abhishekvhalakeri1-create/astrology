/**
 * Numerology — Chaldean name number, Mulank/Bhāgyāṅk, personal year, lucky
 * dates and name-correction candidates, read through the same graha map as the
 * kundli engine so the two systems cannot contradict each other.
 */
import { useMemo, useState } from "react";
import { ArrowRight, CalendarHeart, Calculator, Hash, Info, Phone, Sparkles, Wand2 } from "lucide-react";
import { lifePathFrom, numerologyReading, personalYear, reduce, nameNumber, compoundNameNumber, mulank } from "../lib/numerology";
import { PLANET_BY_ID } from "../data/reference";
import { serviceById } from "../data/catalog";
import { useApp } from "../store";
import { AddButton } from "../components/Cart";
import { Button, Card, Container, Divider, Eyebrow, ListItem, Pill, Price, Row, Section, SectionHead, cx } from "../components/ui";

export function NumerologyPage() {
  const { kundli, activeProfile } = useApp();
  const [name, setName] = useState(activeProfile?.name ?? "");
  const [dob, setDob] = useState(activeProfile?.dob ?? "1992-08-15");
  const [phone, setPhone] = useState("");
  const valid = /^\d{4}-\d{2}-\d{2}$/.test(dob);
  const r = useMemo(() => (valid ? numerologyReading(name || "Unnamed Person", dob) : null), [name, dob, valid]);
  const lp = valid ? lifePathFrom(dob) : null;
  const py = valid ? personalYear(dob, new Date().getUTCFullYear()) : 0;
  const dayNo = valid ? mulank(Number(dob.split("-")[2])) : 0;

  const phoneScore = useMemo(() => {
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) return null;
    const last10 = digits.slice(-10);
    const total = last10.split("").reduce((a, c) => a + Number(c), 0);
    const root = reduce(total);
    const core = r?.core ?? root;
    const lord = PLANET_BY_ID[Number(root) === 4 ? "Ra" : root === 9 ? "Ma" : root === 8 ? "Sa" : root === 1 ? "Su" : root === 2 ? "Mo" : root === 3 ? "Ju" : root === 5 ? "Me" : root === 6 ? "Ve" : "Ke"];
    const ok = (r?.friendly ?? []).includes(root);
    return { last10, total, root, lord, ok, core };
  }, [phone, r]);

  return (
    <>
      <Section className="pb-4 pt-10 sm:pt-14">
        <Container>
          <div className="grid items-end gap-6 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <Eyebrow>अङ्कशास्त्र · Chaldean + Vedic</Eyebrow>
              <h1 className="mt-3 font-display text-[2.2rem] leading-tight text-white sm:text-[3rem]">
                Numbers, <span className="text-gradient-gold">without the magic</span>
              </h1>
              <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-white/60">
                Your Mulank (birth number), Bhāgyāṅk (life path), the Chaldean total of every name you actually use, the
                personal year you are inside, and the smallest legal spelling change that improves it — each number mapped to a
                graha, because that is how Indian numerology is meant to be read.
              </p>
            </div>
            <div className="lg:col-span-4">
              <Card className="p-4">
                <div className="mb-2 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-gold-500">
                  <Info size={13} /> how we differ
                </div>
                <ul className="space-y-1.5 text-[12.5px] leading-relaxed text-white/55">
                  <li>· Chaldean (1–8, no 9 in the letter values) — not Pythagorean 1–9.</li>
                  <li>· Compound totals are shown, not only the root; most apps hide them.</li>
                  <li>· Every number is tied to its lord, gem, colour and day.</li>
                </ul>
              </Card>
            </div>
          </div>
        </Container>
      </Section>

      <Section className="pt-2">
        <Container>
          <div className="grid gap-4 lg:grid-cols-12">
            <Card className="p-5 lg:col-span-4">
              <SectionHead align="left" className="mb-4" eyebrow="inputs" title="Your three numbers" />
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">Name as written on documents</span>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Abhishek Kumar" className={inp} />
              </label>
              <label className="mt-3 block">
                <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">Date of birth</span>
                <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className={inp} />
              </label>
              {activeProfile && name !== activeProfile.name ? (
                <button onClick={() => setName(activeProfile.name)} className="mt-2 text-[12px] font-semibold text-jade-400 hover:text-jade-500">
                  use “{activeProfile.name}” from my chart
                </button>
              ) : null}
              <label className="mt-4 block">
                <span className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">
                  <Phone size={12} /> Mobile number (optional)
                </span>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98450 00000" className={inp} inputMode="tel" />
              </label>

              <div className="mt-4 grid grid-cols-3 gap-2">
                {[
                  { l: "Mulank", v: dayNo, s: "day" },
                  { l: "Bhāgyāṅk", v: lp?.number ?? 0, s: "life path" },
                  { l: "Name", v: name ? nameNumber(name) : 0, s: "Chaldean" },
                ].map((x) => (
                  <div key={x.l} className="rounded-2xl border border-gold-500/25 bg-gold-500/[0.06] p-3 text-center">
                    <div className="font-display text-[28px] leading-none text-gradient-gold">{x.v}</div>
                    <div className="mt-1 text-[10.5px] font-semibold uppercase tracking-wider text-white/50">{x.l}</div>
                    <div className="text-[10px] text-white/30">{x.s}</div>
                  </div>
                ))}
              </div>

              {phoneScore ? (
                <div className={cx("mt-3 rounded-2xl border p-3.5", phoneScore.ok ? "border-jade-500/35 bg-jade-500/[0.06]" : "border-lotus-500/30 bg-lotus-500/[0.06]")}>
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-semibold uppercase tracking-wider text-white/50">mobile root</span>
                    <span className="font-display text-[22px] text-white">{phoneScore.root}</span>
                  </div>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-white/65">
                    {phoneScore.last10} sums to {phoneScore.total} → {phoneScore.root}, ruled by{" "}
                    {phoneScore.lord?.name}. {phoneScore.ok ? `Compatible with your core ${phoneScore.core}.` : `Clashes with your core ${phoneScore.core} — a port is cheap insurance.`}
                  </p>
                  {!phoneScore.ok ? (
                    <div className="mt-2.5">
                      <AddButton id="mobile-number" size="sm" full label="Full number analysis ₹499" />
                    </div>
                  ) : null}
                </div>
              ) : null}
            </Card>

            <div className="space-y-4 lg:col-span-8">
              <Card className="relative overflow-hidden p-6">
                <div className="aura pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-azure-500/15 blur-3xl" />
                <div className="relative">
                  <div className="flex flex-wrap items-center gap-2">
                    <Pill tone="gold">
                      <Hash size={11} /> core {r?.core ?? 0}
                    </Pill>
                    <Pill tone="azure">personal year {py}</Pill>
                    <Pill tone="muted">compound name {r?.nameCompound ?? 0}</Pill>
                    {kundli ? <Pill tone="jade">chart's lucky number {kundli.luck.number}</Pill> : null}
                  </div>
                  <h2 className="mt-3 font-display text-[1.7rem] leading-tight text-white sm:text-[2.1rem]">{r?.headline}</h2>
                  <div className="mt-4 space-y-3">
                    {(r?.paragraphs ?? []).map((p, i) => (
                      <p key={i} className="text-[14px] leading-relaxed text-white/65">
                        {p}
                      </p>
                    ))}
                  </div>
                </div>
              </Card>

              <div className="grid gap-4 sm:grid-cols-2">
                <Card className="p-5">
                  <div className="mb-2.5 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-gold-500">
                    <Calculator size={13} /> letter by letter
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(r?.letters ?? []).map((l, i) => (
                      <span key={i} className="rounded-lg border border-white/10 bg-night-950/40 px-2 py-1 text-center">
                        <span className="block text-[12.5px] font-semibold text-white/85">{l.letter.toUpperCase()}</span>
                        <span className="block text-[10.5px] tabular text-gold-400">{l.value}</span>
                      </span>
                    ))}
                    <span className="flex items-center px-2 text-[13px] text-white/50">= {r?.nameCompound ?? 0} → {r?.nameNo ?? 0}</span>
                  </div>
                  <div className="mt-3 grid gap-1.5">
                    <Row k="Soul number (vowels)" v={r?.soulNo ?? 0} mono />
                    <Row k="Persona number (consonants)" v={r?.personaNo ?? 0} mono />
                    <Row k="Ruling lord" v={r?.lord?.name ?? "—"} />
                    <Row k="Support stone" v={r?.lord?.gem ?? "—"} />
                    <Row k="Wear / act on" v={r?.lord?.day ?? "—"} />
                  </div>
                </Card>

                <Card className="p-5">
                  <div className="mb-2.5 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-gold-500">
                    <CalendarHeart size={13} /> dates that cooperate
                  </div>
                  <p className="text-[13px] leading-relaxed text-white/60">
                    For core {r?.core}, the friendly set is <span className="text-jade-400">{(r?.friendly ?? []).join(", ")}</span>; the
                    difficult one is <span className="text-lotus-400">{(r?.difficult ?? []).join(", ")}</span>. Book the things
                    that matter on a friendly date — signing, moving, operations, launches.
                  </p>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {(r?.luckyDates ?? []).map((d) => (
                      <div key={d} className="rounded-xl border border-jade-500/30 bg-jade-500/[0.07] py-2 text-center">
                        <div className="font-display text-[18px] text-jade-400">{d}</div>
                        <div className="text-[10px] uppercase tracking-wider text-white/40">of month</div>
                      </div>
                    ))}
                  </div>
                  <p className="mt-2.5 text-[11.5px] leading-relaxed text-white/40">
                    Where a month has 31 days, the 30th and 31st inherit the 1st and 2nd — that is the standard Chaldean
                    handling, and it is why “the 27th” is fine in a 31-day month.
                  </p>
                </Card>
              </div>

              <Card className="p-5">
                <SectionHead align="left" className="mb-3" eyebrow="name correction" title="Spellings that move you to a friendly root" sub="Legal, small, and reversible: the point is not a new identity, it is a signature your bank accepts." />
                {(r?.nameFixes.length ?? 0) === 0 ? (
                  <p className="text-[13.5px] text-white/55">Your name already reduces to a supportive number — nothing to fix. Most advice columns invent a problem here; there isn't one.</p>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {(r?.nameFixes ?? []).map((f, idx) => (
                      <div key={`${f.suggestion}-${idx}`} className="rounded-2xl border border-white/8 bg-night-950/40 p-3.5 transition hover:border-gold-500/40">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-[15px] font-semibold text-white/90">{f.suggestion}</span>
                          <span className="font-display text-[18px] text-gold-400">{f.number}</span>
                        </div>
                        <div className="mt-1 text-[11.5px] text-white/45">
                          target root {f.target} · total {compoundNameNumber(f.suggestion)}
                        </div>
                        <button
                          onClick={() => setName(f.suggestion)}
                          className="mt-2 text-[12px] font-semibold text-jade-400 hover:text-jade-500"
                        >
                          try this spelling →
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <Divider />
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <ul className="space-y-1">
                    <ListItem>Use the chosen spelling everywhere: signature, email, visiting card, bank mandate.</ListItem>
                    <ListItem>A number only works if it is used; a certificate in a drawer does nothing.</ListItem>
                  </ul>
                  <div className="flex items-center gap-2">
                    <Price value={serviceById("numerology-report")!.price} mrp={serviceById("numerology-report")!.mrp} size="sm" />
                    <AddButton id="numerology-report" label="Full report" />
                  </div>
                </div>
              </Card>

              <Card className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 font-display text-[18px] text-white">
                      <Wand2 size={16} className="text-gold-400" /> Business name &amp; launch muhūrta
                    </div>
                    <p className="mt-1 max-w-xl text-[13px] leading-relaxed text-white/55">
                      Naming for the founder's number and the trade's graha, with a domain/trademark check and the launch hour.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Price value={serviceById("business-name")!.price} mrp={serviceById("business-name")!.mrp} size="sm" />
                    <AddButton id="business-name" label="Add ₹2,499" />
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </Container>
      </Section>
      <NumerologyFootnote />
    </>
  );
}

const inp =
  "w-full rounded-xl border border-white/12 bg-night-950/60 px-3.5 py-2.5 text-[14px] text-white outline-none transition placeholder:text-white/30 focus:border-gold-500/70 focus:ring-2 focus:ring-gold-500/12";

export function NumerologyFootnote() {
  return (
    <Section className="pt-0">
      <Container>
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/8 bg-night-900/50 p-4 text-[12.5px] text-white/50">
          <p className="max-w-2xl">
            Numerology is a symbolic system, not a physics. It is here because name-and-date discipline is genuinely useful
            — and because the numbers map to the same grahas your kundli uses, so the two readings cannot contradict each other.
          </p>
          <Button size="sm" variant="outline" to="/kundli">
            <Sparkles size={13} /> see the chart behind it <ArrowRight size={13} />
          </Button>
        </div>
      </Container>
    </Section>
  );
}
