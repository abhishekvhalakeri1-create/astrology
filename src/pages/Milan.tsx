/**
 * Kuṇḍlī Milan — 36-point Aṣṭakūṭa matching, with every kooṭa's working shown
 * (the part free generators hide) and the Maṅgālīka cross-check.
 */
import { useMemo, useState } from "react";
import { AlertTriangle, ArrowRight, Check, Heart, Minus, ShieldAlert, Sparkles, Users2, X } from "lucide-react";
import { matchKundlis, type KootaResult } from "../lib/astro/milan";
import { NAKSHATRAS, PLANET_BY_ID, SIGNS } from "../data/reference";
import { type BirthInput } from "../lib/astro/kundli";
import { inr } from "../lib/format";
import { serviceById } from "../data/catalog";
import { useApp } from "../store";
import { AddButton } from "../components/Cart";
import { BirthForm, emptyDraft, validateDraft, type Draft } from "../components/BirthForm";
import { NorthChart } from "../components/charts";
import type { Place } from "../data/places";
import { Button, Card, Container, Divider, Eyebrow, ListItem, Modal, Pill, Price, Row, Section, SectionHead, cx } from "../components/ui";

const toInput = (d: Draft, fallbackName: string): BirthInput => ({
  name: d.name || fallbackName,
  dob: d.dob,
  tob: d.tob,
  place: d.place as Place,
  ayanamsa: d.ayanamsa,
  topocentric: d.topocentric,
  gender: d.gender,
});

const sample = (i: 0 | 1): Draft =>
  i === 0
    ? { ...emptyDraft(), name: "Groom (example)", dob: "1993-05-12", tob: "07:20", place: { name: "Pune", lat: 18.5204, lon: 73.8567, tz: "Asia/Kolkata" } as Place, gender: "male" }
    : { ...emptyDraft(), name: "Bride (example)", dob: "1996-11-03", tob: "18:05", place: { name: "Nagpur", lat: 21.1458, lon: 79.0882, tz: "Asia/Kolkata" } as Place, gender: "female" };

export function MilanPage() {
  const { activeProfile } = useApp();
  const [a, setA] = useState<Draft>(() => (activeProfile ? { name: activeProfile.name, dob: activeProfile.dob, tob: activeProfile.tob, place: activeProfile.place as Place, tz: activeProfile.place.tz, ayanamsa: activeProfile.ayanamsa ?? "lahiri", topocentric: !!activeProfile.topocentric, gender: activeProfile.gender ?? "male" } : sample(0)));
  const [b, setB] = useState<Draft>(sample(1));
  const [showB, setShowB] = useState(true);
  const [detail, setDetail] = useState<KootaResult | null>(null);
  const ready = !validateDraft(a) && !validateDraft(b);

  const m = useMemo(() => (ready ? matchKundlis(toInput(a, "Partner A"), toInput(b, "Partner B")) : null), [a, b, ready]);

  return (
    <>
      <Section className="pb-4 pt-10 sm:pt-14">
        <Container>
          <div className="grid items-end gap-6 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <Eyebrow>अष्टकूट मिलन · 36 points</Eyebrow>
              <h1 className="mt-3 font-display text-[2.2rem] leading-tight text-white sm:text-[3.1rem]">
                Kundli Milan, <span className="text-gradient-gold">with the workings visible</span>
              </h1>
              <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-white/60">
                Every free matcher prints a number and a scare. Here each of the eight kooṭas shows the two signs, the rule
                applied, the points awarded and — when points are lost — the parihāra. The Maṅgālīka check runs on both charts,
                Lagna and Moon, with the five classical cancellations.
              </p>
            </div>
            <div className="lg:col-span-4">
              <Card className="p-4">
                <div className="flex items-center gap-2 text-[12.5px] font-semibold text-gold-400">
                  <ShieldAlert size={14} /> A low score is not a rejection
                </div>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-white/55">
                  Nāḍī (8 points) is the one most software scores on nakṣatra arithmetic alone; the real test is gotra and
                  lineage, which no app can know. We flag it and move on.
                </p>
              </Card>
            </div>
          </div>
        </Container>
      </Section>

      <Section className="pt-2">
        <Container>
          <div className="grid gap-4 lg:grid-cols-2">
            <ChartPanel title="Partner A" tag="वर / वरा" draft={a} setDraft={setA} />
            {showB ? (
              <ChartPanel title="Partner B" tag="कन्या" draft={b} setDraft={setB} onRemove={() => setShowB(false)} />
            ) : (
              <button onClick={() => setShowB(true)} className="grid min-h-[220px] place-items-center rounded-3xl border border-dashed border-gold-500/35 bg-night-900/40 text-[14px] text-gold-400 transition hover:bg-gold-500/[0.06]">
                <Users2 size={16} className="mr-2 inline" /> Add the second chart
              </button>
            )}
          </div>

          {!m ? (
            <div className="mt-6 rounded-3xl border border-white/10 bg-night-900/50 p-6 text-center">
              <p className="text-[14px] text-white/60">Fill both charts — the match is computed as you type, on your device.</p>
            </div>
          ) : (
            <>
              <Divider label="the result" />
              <Verdict m={m} />

              <div className="mt-6 grid gap-4 lg:grid-cols-12">
                <Card className="p-5 lg:col-span-8">
                  <SectionHead align="left" className="mb-4" eyebrow="kooṭa by kooṭa" title="Ashtakoot scorecard" />
                  <div className="space-y-2">
                    {m.kootas.map((kk) => (
                      <button key={kk.id} onClick={() => setDetail(kk)} className={cx("group flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left transition", kk.score === kk.max ? "border-jade-500/30 bg-jade-500/[0.05] hover:bg-jade-500/[0.09]" : kk.score === 0 ? "border-lotus-500/30 bg-lotus-500/[0.05] hover:bg-lotus-500/[0.09]" : "border-white/8 bg-night-950/35 hover:border-gold-500/40")}>
                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.03]">
                          <span className="font-display text-[15px] text-white">{kk.score}</span>
                          <span className="-mt-1 text-[9px] text-white/40">/{kk.max}</span>
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-baseline gap-2">
                            <span className="font-display text-[16.5px] text-white">{kk.name}</span>
                            <span className="font-deva text-[12px] text-gold-400/75">{kk.sanskrit}</span>
                          </span>
                          <span className="mt-0.5 block truncate text-[12px] text-white/50">{kk.detail}</span>
                        </span>
                        <span className="hidden w-28 shrink-0 sm:block">
                          <span className="block h-1.5 overflow-hidden rounded-full bg-white/10">
                            <span className={cx("block h-full rounded-full", kk.score === kk.max ? "bg-jade-400" : kk.score === 0 ? "bg-lotus-400" : "bg-gold-500")} style={{ width: `${(kk.score / kk.max) * 100}%` }} />
                          </span>
                        </span>
                        <span className="shrink-0 text-white/25 transition group-hover:text-gold-400">
                          {kk.score === kk.max ? <Check size={16} /> : kk.score === 0 ? <X size={16} /> : <Minus size={16} />}
                        </span>
                      </button>
                    ))}
                  </div>
                  <p className="mt-3 text-[11.5px] leading-relaxed text-white/40">
                    Tap a kooṭa for the rule, the exception that may apply, and what to do if points were lost. Maxima: Vārna 1,
                    Vaśya 2, Tārā 3, Yoni 4, Grha Maitrī 5, Gaṇa 6, Bhakūt 7, Nāḍī 8.
                  </p>
                </Card>

                <div className="space-y-4 lg:col-span-4">
                  <Card className="p-5">
                    <div className="mb-2 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-gold-500">
                      <Heart size={13} /> Maṅgālīka (Kuja)
                    </div>
                    <ManglikRow m={m} />
                    <p className="mt-2.5 text-[12.5px] leading-relaxed text-white/55">{m.manglik.note}</p>
                  </Card>
                  <Card className="p-5">
                    <div className="mb-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-gold-500">Nāḍī &amp; gotra</div>
                    <p className="text-[13px] leading-relaxed text-white/60">{m.nadiNote}</p>
                  </Card>
                  <Card className="p-5">
                    <div className="mb-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-gold-500">Children &amp; longevity</div>
                    <Row k="Putra axis" v={m.children.yoga ? "indicated" : "quiet"} />
                    <p className="mt-1.5 text-[12px] leading-relaxed text-white/50">{m.children.note}</p>
                    <p className="mt-2 text-[12px] leading-relaxed text-white/50">{m.longevity.note}</p>
                  </Card>

                  <Card className="border-gold-500/30 p-5">
                    <div className="mb-1.5 flex items-center gap-2 text-[13px] font-semibold text-white">
                      <Sparkles size={14} className="text-gold-400" /> Human second opinion
                    </div>
                    <p className="text-[12.5px] leading-relaxed text-white/55">
                      {m.total < 18 ? "Below 18 the software must defer: an Acharya reads the cancellations, the families' customs and the two people." : "Even a good score deserves 20 minutes of human judgement about the two things that will actually matter."}
                    </p>
                    <div className="mt-3 grid gap-2">
                      <div className="flex items-center justify-between rounded-xl border border-white/8 bg-night-950/40 px-3 py-2">
                        <span className="text-[12.5px] text-white/70">Milan Report</span>
                        <Price value={serviceById("milan-report")!.price} mrp={serviceById("milan-report")!.mrp} size="sm" />
                      </div>
                      <AddButton id="milan-report" full label="Instant PDF" />
                      <div className="flex items-center justify-between rounded-xl border border-white/8 bg-night-950/40 px-3 py-2">
                        <span className="text-[12.5px] text-white/70">Milan + remedies &amp; muhūrta</span>
                        <Price value={serviceById("milan-premium")!.price} mrp={serviceById("milan-premium")!.mrp} size="sm" />
                      </div>
                      <AddButton id="milan-premium" full label="Add ₹749" />
                      <Button variant="outline" full to="/services#consult" className="mt-1">
                        Couple session ₹2,499 <ArrowRight size={14} />
                      </Button>
                    </div>
                  </Card>
                </div>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                <Card className="p-5">
                  <div className="mb-3 text-[12px] font-semibold uppercase tracking-[0.16em] text-gold-500">A's chart (Lagna-relative)</div>
                  <NorthChart k={m.a} className="mx-auto max-w-[360px]" />
                </Card>
                <Card className="p-5">
                  <div className="mb-3 text-[12px] font-semibold uppercase tracking-[0.16em] text-gold-500">B's chart (Lagna-relative)</div>
                  <NorthChart k={m.b} className="mx-auto max-w-[360px]" />
                </Card>
              </div>
            </>
          )}
        </Container>
      </Section>

      <MilanFaq />

      <Modal open={!!detail} onClose={() => setDetail(null)} title={detail ? `${detail.name} · ${detail.score}/${detail.max}` : ""} wide>
        {detail ? (
          <div className="space-y-3.5">
            <div className="flex flex-wrap items-center gap-2">
              <Pill tone={detail.score === detail.max ? "jade" : detail.score === 0 ? "lotus" : "gold"}>
                {detail.score} of {detail.max} points
              </Pill>
              <span className="font-deva text-[13px] text-gold-400/80">{detail.sanskrit}</span>
            </div>
            <p className="text-[14px] leading-relaxed text-white/72">{detail.detail}</p>
            {detail.remedy ? (
              <div className="rounded-2xl border border-jade-500/25 bg-jade-500/[0.06] p-3.5">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-jade-400">if points were lost</div>
                <p className="mt-1 text-[13px] leading-relaxed text-white/65">{detail.remedy}</p>
              </div>
            ) : null}
            <div className="rounded-2xl border border-white/8 bg-night-950/40 p-3.5">
              <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/45">the two charts</div>
              <ul className="space-y-1.5">
                {m && (
                  <>
                    <li className="text-[12.5px] text-white/60">A: Moon in {SIGNS[m.a.moonSign]?.name} · {NAKSHATRAS[m.a.moonNakshatra]?.name} pāda {m.a.moonPada} · {m.a.gana} gaṇa · {m.a.yoni} yoni</li>
                    <li className="text-[12.5px] text-white/60">B: Moon in {SIGNS[m.b.moonSign]?.name} · {NAKSHATRAS[m.b.moonNakshatra]?.name} pāda {m.b.moonPada} · {m.b.gana} gaṇa · {m.b.yoni} yoni</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        ) : null}
      </Modal>
    </>
  );
}

function ManglikRow({ m }: { m: NonNullable<ReturnType<typeof matchKundlis>> }) {
  const cell = (label: string, present: boolean, sev: string) => (
    <div className={cx("rounded-xl border px-3 py-2.5", present && sev !== "cancelled" ? "border-lotus-500/35 bg-lotus-500/[0.06]" : "border-white/8 bg-night-950/40")}>
      <div className="text-[11px] uppercase tracking-wider text-white/40">{label}</div>
      <div className={cx("mt-0.5 text-[14px] font-semibold", present && sev !== "cancelled" ? "text-lotus-400" : "text-jade-400")}>
        {present ? (sev === "cancelled" ? "present · cancelled" : `present · ${sev}`) : "not present"}
      </div>
    </div>
  );
  return (
    <div className="grid grid-cols-2 gap-2">
      {cell("Partner A", m.manglik.aPresent, m.manglik.aSeverity)}
      {cell("Partner B", m.manglik.bPresent, m.manglik.bSeverity)}
      <div className="col-span-2 rounded-xl border border-white/8 bg-night-950/40 px-3 py-2 text-[12.5px] text-white/60">
        {m.manglik.balanced ? (
          <span className="flex items-center gap-1.5 text-jade-400">
            <Check size={13} /> balanced — Mars does not sit alone against one partner
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-saffron-400">
            <AlertTriangle size={13} /> unbalanced — traditionally handled with Kuja–Kuja pairing or Mangal Shanti
          </span>
        )}
      </div>
    </div>
  );
}

function Verdict({ m }: { m: NonNullable<ReturnType<typeof matchKundlis>> }) {
  const pct = m.percent;
  const tone = m.verdict.tone;
  const R = 78;
  const C = 2 * Math.PI * R;
  return (
    <Card className={cx("relative overflow-hidden p-6", tone === "great" ? "border-jade-500/40" : tone === "care" ? "border-lotus-500/40" : "border-gold-500/35")}>
      <div className="aura pointer-events-none absolute -left-20 top-1/2 h-56 w-56 -translate-y-1/2 rounded-full bg-gold-500/15 blur-3xl" />
      <div className="relative grid items-center gap-6 sm:grid-cols-[auto_1fr]">
        <div className="relative mx-auto grid h-[190px] w-[190px] place-items-center">
          <svg viewBox="0 0 200 200" className="absolute inset-0 -rotate-90">
            <circle cx="100" cy="100" r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
            <circle cx="100" cy="100" r={R} fill="none" stroke={tone === "care" ? "#f4568c" : tone === "great" ? "#2fbf9b" : "#e8b64c"} strokeWidth="10" strokeLinecap="round" strokeDasharray={`${(pct / 100) * C} ${C}`} />
          </svg>
          <div className="text-center">
            <div className="font-display text-[2.6rem] leading-none text-white">{m.total}</div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-white/45">of 36</div>
          </div>
        </div>
        <div>
          <h2 className="font-display text-[1.6rem] leading-tight text-white sm:text-[2rem]">{m.verdict.title}</h2>
          <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-white/62">{m.verdict.text}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {m.recommendations.length ? m.recommendations.map((r) => <Pill key={r} tone="saffron">{r}</Pill>) : <Pill tone="jade">no weak kooṭa to repair</Pill>}
            <Pill tone="muted">
              {m.a.grahas.find((g) => g.id === "Mo")?.signName} × {m.b.grahas.find((g) => g.id === "Mo")?.signName} Moons
            </Pill>
            <Pill tone="muted">{PLANET_BY_ID[m.a.grahas.find((g) => g.id === "Ju")!.id]?.name}–{PLANET_BY_ID[m.b.grahas.find((g) => g.id === "Ju")!.id]?.name} Guru balance</Pill>
          </div>
        </div>
      </div>
    </Card>
  );
}

function ChartPanel({ title, tag, draft, setDraft, onRemove }: { title: string; tag: string; draft: Draft; setDraft: (d: Draft) => void; onRemove?: () => void }) {
  const err = validateDraft(draft);
  const { dispatch, state } = useApp();
  const [pickFromSaved, setPickFromSaved] = useState(false);
  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-baseline gap-2">
          <h3 className="font-display text-[19px] text-white">{title}</h3>
          <span className="font-deva text-[12px] text-gold-400/70">{tag}</span>
        </div>
        <div className="flex items-center gap-2">
          {state.profiles.length ? (
            <button onClick={() => setPickFromSaved(true)} className="text-[12px] font-semibold text-jade-400 hover:text-jade-500">
              from saved
            </button>
          ) : null}
          {onRemove ? (
            <button onClick={onRemove} className="text-[12px] text-white/40 hover:text-lotus-400">
              remove
            </button>
          ) : null}
        </div>
      </div>
      <BirthForm draft={draft} setDraft={setDraft} onSubmit={() => {}} compact hideActions />
      <p className="mt-2 text-[11.5px] text-white/35">{err ? `Still needed: ${err}` : "Both charts complete — the match updates as you edit."}</p>
      <Modal open={pickFromSaved} onClose={() => setPickFromSaved(false)} title="Pick a saved chart">
        <div className="space-y-2">
          {state.profiles.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setDraft({ name: p.name, dob: p.dob, tob: p.tob, place: p.place as Place, tz: p.place.tz, ayanamsa: p.ayanamsa ?? "lahiri", topocentric: !!p.topocentric, gender: p.gender ?? "male" });
                setPickFromSaved(false);
                dispatch({ type: "profile:active", id: p.id });
              }}
              className="flex w-full items-center justify-between rounded-xl border border-white/8 bg-night-950/40 px-3.5 py-2.5 text-left transition hover:border-gold-500/50"
            >
              <span className="text-[13.5px] text-white/85">{p.name || "Unnamed"}</span>
              <span className="text-[11.5px] tabular text-white/45">
                {p.dob} {p.tob}
              </span>
            </button>
          ))}
        </div>
      </Modal>
    </Card>
  );
}

export function MilanFaq() {
  return (
    <Section>
      <Container>
        <SectionHead eyebrow="about matching" title="What Milan can and cannot decide" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { t: "It can flag real risk", d: "Same nakṣatra (gotra), Gaṇa mismatch with no cancellation, Kuja on one side only, Bhakūt 2/10 — these are the four that correlate with what families actually fight about." },
            { t: "It cannot see the couple", d: "Two people with 14/36 and honest communication outperform 34/36 with silence. The score is a risk register, not a verdict." },
            { t: "Nāḍī is over-priced", d: "8 of 36 points rest on a criterion software cannot evaluate (lineage/health temperament). Many almanacs award 8 by default; we show what we did." },
            { t: "Marriage timing is separate", d: "Whether the daśās open in the same window matters more than the score. That is in the paid Milan + muhūrta report." },
            { t: "Cancellations are real", d: "Gana-drushya, Samananya, Piṇḍa — the classical exceptions can lift a 'no'. We list them instead of silently ignoring them." },
            { t: "Families need a witness", d: "The pre-marriage couple session exists because a third party in the room changes what gets said. ₹2,499 for 45 minutes." },
          ].map((x) => (
            <Card key={x.t} className="p-5">
              <div className="font-display text-[15.5px] text-gold-400">{x.t}</div>
              <p className="mt-1.5 text-[13px] leading-relaxed text-white/55">{x.d}</p>
            </Card>
          ))}
        </div>
        <ul className="mt-6 space-y-1.5">
          <ListItem>
            <span className="text-white/50">Families using this page for an arranged match: send both charts to the Acharya before the rishta is accepted — {inr(serviceById("milan-reject")!.price)} is cheaper than a wedding cancelled in March.</span>
          </ListItem>
        </ul>
      </Container>
    </Section>
  );
}
