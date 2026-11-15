/**
 * Shubh Muhurat — the electional calendar. Pick a purpose, a window of dates and
 * a city; every day is scored from the live pañcāṅga and the reasons are printed.
 * Nothing is random: the same engine the Panchang page uses, plus the kāla rules.
 */
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  AlertTriangle, ArrowRight, CalendarClock, Check, ChevronDown, Clock3, Compass, Flame, Info,
  Moon, Printer, ScrollText, Sparkles, Star, Sun, Sunset, Timer, X,
} from "lucide-react";
import { findMuhurat, MUHURAT_PURPOSES, type MuhuratDay, type MuhuratPurpose } from "../lib/astro/muhurat";
import { PLACES, zoneForLon, type Place } from "../data/places";
import { fmtDate, fmtTime, inr } from "../lib/format";
import { NAKSHATRAS, PLANET_BY_ID } from "../data/reference";
import { useApp } from "../store";
import { AddButton } from "../components/Cart";
import { Button, Card, Container, Divider, Eyebrow, ListItem, Modal, Pill, Row, Section, SectionHead, Tabs, cx } from "../components/ui";

const calCls =
  "rounded-xl border border-white/12 bg-night-950/60 px-3 py-2.5 text-[13.5px] text-white/85 outline-none [color-scheme:dark] focus:border-gold-500/70";

const iso = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86400000);

export function MuhuratPage() {
  const { activeProfile } = useApp();
  const today = new Date();
  // deep links from the Panchang / Doshas pages: #/muhurat?purpose=car&from=2026-12-01
  const [params] = useSearchParams();
  const qp = params.get("purpose") as MuhuratPurpose | null;
  const qFrom = params.get("from");
  const qTo = params.get("to");
  const validPurpose = MUHURAT_PURPOSES.some((d) => d.id === qp) ? (qp as MuhuratPurpose) : "vivah";
  const [purpose, setPurpose] = useState<MuhuratPurpose>(validPurpose);
  const [from, setFrom] = useState(qFrom && /^\d{4}-\d{2}-\d{2}$/.test(qFrom) ? qFrom : iso(today));
  const [to, setTo] = useState(qTo && /^\d{4}-\d{2}-\d{2}$/.test(qTo) ? qTo : iso(addDays(new Date(qFrom && /^\d{4}-\d{2}-\d{2}$/.test(qFrom) ? qFrom : today), 45)));
  const [place, setPlace] = useState<Place>(
    () => PLACES.find((p) => p.name === "New Delhi") ?? PLACES[0],
  );
  const [openDay, setOpenDay] = useState<MuhuratDay | null>(null);
  const [customPlace, setCustomPlace] = useState("");
  const [showAll, setShowAll] = useState(false);

  // a profile's city wins over the default, but only when it is sane
  const effPlace = useMemo(() => {
    if (customPlace) {
      const p = JSON.parse(customPlace) as Place;
      return p;
    }
    if (activeProfile?.place) return activeProfile.place as Place;
    return place;
  }, [customPlace, activeProfile, place]);

  const result = useMemo(() => {
    const a = Date.parse(`${from}T00:00:00Z`);
    const b = Date.parse(`${to}T00:00:00Z`);
    if (!Number.isFinite(a) || !Number.isFinite(b) || b < a) return null;
    const span = Math.min(120, Math.round((b - a) / 86400000) + 1);
    try {
      return findMuhurat({ purpose, fromISO: from, toISO: iso(addDays(new Date(a), span - 1)), place: effPlace, limit: 120 });
    } catch {
      return null;
    }
  }, [purpose, from, to, effPlace]);

  const def = MUHURAT_PURPOSES.find((d) => d.id === purpose)!;
  const ranked = result?.ranked ?? [];
  const shown = showAll ? ranked : ranked.slice(0, 8);
  const counts = useMemo(() => {
    const c = { best: 0, good: 0, fair: 0, avoid: 0 };
    for (const d of ranked) c[d.klass]++;
    return c;
  }, [ranked]);

  return (
    <>
      <Section className="pb-4 pt-10 sm:pt-14">
        <Container>
          <div className="grid items-end gap-6 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <Eyebrow>शुभ मुहूर्त · electional calendar</Eyebrow>
              <h1 className="mt-3 font-display text-[2.2rem] leading-tight text-white sm:text-[3.1rem]">
                Pick the day, <span className="text-gradient-gold">see why it won</span>
              </h1>
              <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-white/60">
                Ten activities, each with its own classical rule-set. Every date in your range is scored on nakṣatra, tithi,
                pakṣa, yoga, karaṇa and vāra, then the exact hours are cleared of Rāhu Kāla, Yamaghaṇṭa and Gulika. The ±
                beside each factor is the arithmetic — the same numbers the pañcāṅga page prints.
              </p>
            </div>
            <div className="lg:col-span-4">
              <Card className="p-4">
                <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-500">
                  <CalendarClock size={13} /> {result ? `${result.scanned} days scanned` : "pick a range"}
                </div>
                {result ? (
                  <>
                    <Row k="Excellent" v={`${counts.best} day${counts.best === 1 ? "" : "s"}`} />
                    <Row k="Good" v={`${counts.good}`} />
                    <Row k="Usable with care" v={`${counts.fair}`} />
                    <Row k="Refused" v={`${counts.avoid}`} />
                    <div className="mt-2 text-[11px] leading-relaxed text-white/40">
                      For {effPlace.name} · {effPlace.tz} · ayanāṁsa Lahiri
                    </div>
                  </>
                ) : (
                  <p className="text-[13px] text-white/50">The end date must be on or after the start date.</p>
                )}
              </Card>
            </div>
          </div>

          {/* ── controls ── */}
          <Card className="mt-7 p-4 sm:p-5">
            <div className="grid gap-4 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <Label>what are you choosing a date for</Label>
                <div className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                  {MUHURAT_PURPOSES.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => setPurpose(d.id)}
                      className={cx(
                        "flex items-center gap-2 rounded-xl border px-2.5 py-2 text-left text-[12.5px] font-semibold transition",
                        purpose === d.id ? "border-gold-500/60 bg-gold-500/[0.12] text-gold-400" : "border-white/10 text-white/60 hover:border-white/25 hover:text-white/85",
                      )}
                    >
                      <span aria-hidden className="text-[15px] leading-none">
                        {d.emoji}
                      </span>
                      <span className="min-w-0 flex-1 truncate">{d.label.split(" ")[0]}</span>
                      {purpose === d.id ? <Check size={12} /> : null}
                    </button>
                  ))}
                </div>
              </div>
              <div className="lg:col-span-3">
                <Label>date range</Label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={calCls} />
                  <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={calCls} />
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {[
                    ["30 days", 30],
                    ["90 days", 90],
                    ["this month", 0],
                  ].map(([l, n]) => (
                    <button
                      key={String(l)}
                      onClick={() => {
                        if (n === 0) {
                          const first = new Date(today.getFullYear(), today.getMonth(), 1);
                          setFrom(iso(first));
                          setTo(iso(new Date(today.getFullYear(), today.getMonth() + 1, 0)));
                        } else {
                          setFrom(iso(today));
                          setTo(iso(addDays(today, n as number)));
                        }
                      }}
                      className="rounded-full border border-white/12 px-2.5 py-1 text-[11.5px] font-semibold text-white/55 transition hover:border-gold-500/50 hover:text-gold-400"
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <div className="lg:col-span-4">
                <Label>city (the kālas are local)</Label>
                <select
                  value={customPlace ? "custom" : effPlace.name}
                  onChange={(e) => {
                    const p = PLACES.find((x) => x.name === e.target.value);
                    if (p) {
                      setPlace(p);
                      setCustomPlace("");
                    }
                  }}
                  className={cx(calCls, "mt-2 w-full")}
                >
                  {!PLACES.some((p) => p.name === effPlace.name) ? <option value={effPlace.name}>{effPlace.name} · from your chart</option> : null}
                  {PLACES.slice(0, 60).map((p) => (
                    <option key={p.name} value={p.name}>
                      {p.name}, {p.region}
                    </option>
                  ))}
                </select>
                <p className="mt-2 flex items-start gap-1.5 text-[11px] leading-relaxed text-white/40">
                  <Info size={12} className="mt-0.5 shrink-0 text-azure-400" />
                  {zoneForLon(effPlace.lon) !== effPlace.tz
                    ? "Note: this place's tz differs from its longitude band — the printed times follow the zone you chose."
                    : `Latitude ${effPlace.lat.toFixed(3)}°, longitude ${effPlace.lon.toFixed(3)}° — daylight is divided into 8 unequal parts here, so Rāhu Kāla moves by the season.`}
                </p>
              </div>
            </div>
          </Card>
        </Container>
      </Section>

      {/* ── the verdict ── */}
      <Section className="pt-2">
        <Container>
          {result?.best ? (
            <div className="grid gap-4 lg:grid-cols-12">
              <div data-muhurat-top={String(purpose)} className="gold-frame relative overflow-hidden rounded-3xl bg-gradient-to-br from-night-800/80 to-night-950/70 p-6 lg:col-span-8">
                <div className="aura pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-gold-500/25 blur-3xl" />
                <div className="relative flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Pill tone="gold">
                        <Star size={11} className="fill-gold-400" /> best for {def.label.toLowerCase()}
                      </Pill>
                      <Pill tone={result.best.klass === "best" ? "jade" : "saffron"}>{result.best.klass}</Pill>
                    </div>
                    <h2 className="mt-3 font-display text-[2rem] leading-tight text-white sm:text-[2.6rem]">{result.best.label}</h2>
                    <p className="mt-1 text-[13.5px] text-white/55">
                      {result.best.weekday} · {result.best.tithi.name} ({result.best.tithi.paksha.toLowerCase()} pakṣa) ·{" "}
                      {result.best.nakshatra.name} · {result.best.yoga?.name} yoga · {result.best.karana?.name} karaṇa
                    </p>
                  </div>
                  <ScoreRing score={result.best.score} />
                </div>

                {result.best.window ? (
                  <div className="relative mt-5 flex flex-wrap items-center gap-4 rounded-2xl border border-gold-500/30 bg-gold-500/[0.07] px-4 py-3.5">
                    <div className="grid h-11 w-11 place-items-center rounded-full border border-gold-500/40 text-gold-400">
                      {result.best.window.tone === "abhijit" ? <Sun size={19} /> : <Clock3 size={19} />}
                    </div>
                    <div className="min-w-[190px] flex-1">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-500">
                        {result.best.window.tone === "abhijit" ? "Abhijit Muhūrta · universally safe" : "cleansed horā window"}
                      </div>
                      <div className="mt-0.5 font-display text-[1.55rem] leading-none text-white tabular">
                        {fmtTime(result.best.window.start, effPlace.tz)} – {fmtTime(result.best.window.end, effPlace.tz)}
                        <span className="ml-2 align-middle text-[12px] font-normal text-white/45">IST</span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => setOpenDay(result.best!)}>
                      all windows <ArrowRight size={13} />
                    </Button>
                  </div>
                ) : (
                  <div className="relative mt-5 flex items-center gap-3 rounded-2xl border border-lotus-500/35 bg-lotus-500/[0.07] px-4 py-3.5">
                    <AlertTriangle size={18} className="text-lotus-400" />
                    <p className="text-[13px] leading-relaxed text-white/70">
                      No daylight block on this day survives the three kālas — do the ritual after sunset, or take the next day
                      in the list.
                    </p>
                  </div>
                )}

                <div className="relative mt-5 grid gap-2 sm:grid-cols-2">
                  {result.best.reasons.slice(0, 8).map((r, i) => (
                    <ReasonRow key={i} r={r} />
                  ))}
                </div>

                <div className="relative mt-5 flex flex-wrap items-center gap-2 border-t border-white/10 pt-4">
                  <span className="text-[12px] text-white/45">Want a human to check it against both families' charts?</span>
                  <AddButton id="muhurat-report" size="sm" label={`Muhūrta by Acharya ${inr(1500)}`} className="ml-auto" />
                  <Button size="sm" variant="ghost" onClick={() => window.print()}>
                    <Printer size={13} /> print
                  </Button>
                </div>
              </div>

              {/* next four */}
              <div className="space-y-3 lg:col-span-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">then these</div>
                {ranked.slice(1, 5).map((d) => (
                  <button key={d.iso} onClick={() => setOpenDay(d)} className="hover-lift flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-night-900/50 p-4 text-left transition hover:border-gold-500/45">
                    <ScoreRing score={d.score} small />
                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-[16.5px] text-white">{d.label}</span>
                      <span className="block truncate text-[11.5px] text-white/45">
                        {d.weekday} · {d.nakshatra.name} · {d.tithi.name}
                      </span>
                      {d.window ? (
                        <span className="mt-1 block text-[11.5px] font-semibold text-jade-400 tabular">
                          {fmtTime(d.window.start, effPlace.tz)}–{fmtTime(d.window.end, effPlace.tz)} · {d.window.label}
                        </span>
                      ) : (
                        <span className="mt-1 block text-[11.5px] text-lotus-400">no clean daylight window</span>
                      )}
                    </span>
                    <ChevronDown size={15} className="-rotate-90 shrink-0 text-white/35" />
                  </button>
                ))}
                <Card className="p-4">
                  <div className="mb-1.5 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-gold-500">
                    <Flame size={13} /> how {def.label.toLowerCase()} is judged
                  </div>
                  <p className="text-[12.5px] leading-relaxed text-white/55">{def.note}</p>
                </Card>
              </div>
            </div>
          ) : (
            <Card className="p-10 text-center">
              <Timer size={22} className="mx-auto text-gold-400/70" />
              <p className="mt-3 text-[14px] text-white/60">Choose a valid date range to compute the muhūrta list.</p>
            </Card>
          )}

          {/* ── full list ── */}
          {ranked.length > 0 ? (
            <div className="mt-10">
              <SectionHead
                eyebrow={`${ranked.length} days in range`}
                title="Every date, ranked"
                sub="Score is the sum of the printed factors — nothing else. Expand a day to see the hour-by-hour picture, including the kālas."
                action={
                  ranked.length > 8 ? (
                    <Button size="sm" variant="ghost" onClick={() => setShowAll(!showAll)}>
                      {showAll ? "show top 8" : `show all ${ranked.length}`}
                    </Button>
                  ) : null
                }
              />
              <div className="mt-4 grid gap-2.5">
                {shown.map((d, i) => (
                  <DayRow key={d.iso} d={d} rank={i + 1} tz={effPlace.tz} onOpen={() => setOpenDay(d)} />
                ))}
              </div>
            </div>
          ) : null}

          <Divider />

          {/* ── method + legend ── */}
          <div className="grid gap-4 lg:grid-cols-12">
            <Card className="p-6 lg:col-span-7">
              <SectionHead align="left" className="mb-3" eyebrow="the rule-book" title="What the score is made of" />
              <div className="grid gap-2 sm:grid-cols-2">
                {[
                  { i: <Moon size={14} />, t: "Nakṣatra (±14 / −18)", d: `Each activity has its own excellent / acceptable / refused list, taken from the Muhūrta-cintāmaṇi groupings (fixed, soft, sharp, moving, friendly). Lineages differ; ${def.label.toLowerCase()} uses the list printed above.` },
                  { i: <Sun size={14} />, t: "Tithi & pakṣa (±11 / −15)", d: "Bright-half tithis 2, 3, 5, 7, 10, 11, 13 for beginnings; Rikta (4, 9, 14) refused; Pūrṇimā and Amāvāsyā are treated per activity, not blanket-banned." },
                  { i: <Sparkles size={14} />, t: "Yoga (±8 / −12)", d: "The 27 nitya yogas split into auspicious, neutral and inauspicious; Vyatīpāta, Vaidhṛti, Śūla, Gaṇḍa, Parigha and Gaṇḍānta-type yogas pull a day down." },
                  { i: <Compass size={14} />, t: "Karaṇa (−20 for Viṣṭi)", d: "Viṣṭi (Bhadra) is the one karaṇa no beginning survives; the four fixed karaṇes are a mild penalty, the seven movable ones neutral-to-good." },
                  { i: <Clock3 size={14} />, t: "Vāra (±9)", d: "The weekday's lord must be friendly to the work: Śukra/Budha for marriage and trade, Guru for study and rites, Śani refused for most beginnings." },
                  { i: <Sunset size={14} />, t: "Hours (±8)", d: "Clean Abhijit is worth +8 and beats a horā; a friendly-lord horā is +3; a day with no kāla-free block loses 8 and says so." },
                ].map((x) => (
                  <div key={x.t} className="rounded-2xl border border-white/8 bg-night-950/35 p-3.5">
                    <div className="flex items-center gap-2 text-[13.5px] font-semibold text-white/90">
                      <span className="text-gold-400">{x.i}</span> {x.t}
                    </div>
                    <p className="mt-1 text-[12.5px] leading-relaxed text-white/50">{x.d}</p>
                  </div>
                ))}
              </div>
            </Card>
            <div className="space-y-4 lg:col-span-5">
              <Card className="p-5">
                <div className="mb-2 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-gold-500">
                  <ScrollText size={13} /> where this is not enough
                </div>
                <ul className="space-y-1.5">
                  <ListItem>Marriage and house entry also need the couple's or owner's own chart — a good generic day can still be a bad day for that Lagna.</ListItem>
                  <ListItem>Śrāddha and antyeṣṭi follow your family's paddhati and the guru's instruction; the calendar here is the almanac half, not the dīkṣā half.</ListItem>
                  <ListItem>Lagna-based muhūrta (choosing the hour by its rising sign, with a pañchāṅga-shuddhi of the Lagna) is a human job — that is what the ₹1,500 selection covers.</ListItem>
                  <ListItem>Place matters: the same date can be tithi 14 in Delhi and tithi 15 in Chennai near a boundary. Always set the city where the ritual happens.</ListItem>
                </ul>
                <Button size="sm" variant="outline" full className="mt-3" to="/services#reports">
                  get the Acharya's selection <ArrowRight size={13} />
                </Button>
              </Card>
              <Card className="p-5">
                <div className="mb-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-gold-500">
                  <CalendarClock size={13} /> quick jump
                </div>
                <Tabs
                  size="sm"
                  tabs={[
                    { id: "grihapravesh", label: "Griha pravesh" },
                    { id: "car", label: "Vehicle" },
                    { id: "study", label: "Vidyārambha" },
                    { id: "puja", label: "Puja / vrat" },
                  ]}
                  active={purpose}
                  onChange={(id) => setPurpose(id as MuhuratPurpose)}
                />
                <p className="mt-2 text-[11.5px] leading-relaxed text-white/40">
                  Today in {effPlace.name}: {fmtDate(Date.now(), effPlace.tz)} · sunrise {result?.days[0]?.sunrise ? fmtTime(result.days[0].sunrise, effPlace.tz) : "—"} · sunset{" "}
                  {result?.days[0]?.sunset ? fmtTime(result.days[0].sunset, effPlace.tz) : "—"}
                </p>
              </Card>
            </div>
          </div>
        </Container>
      </Section>

      <DayModal day={openDay} tz={effPlace.tz} def={def} onClose={() => setOpenDay(null)} />
    </>
  );
}

/* ───────────────────────────── pieces ───────────────────────────── */

function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">{children}</div>;
}

function ScoreRing({ score, small }: { score: number; small?: boolean }) {
  const r = small ? 22 : 34;
  const c = 2 * Math.PI * r;
  const tone = score >= 78 ? "var(--color-jade-400)" : score >= 64 ? "var(--color-gold-400)" : score >= 48 ? "var(--color-saffron-400)" : "var(--color-lotus-400)";
  return (
    <div className={cx("relative grid shrink-0 place-items-center", small ? "h-13 w-13" : "h-[86px] w-[86px]")}>
      <svg viewBox={`0 0 ${r * 2 + 12} ${r * 2 + 12}`} className={small ? "h-[52px] w-[52px]" : "h-[86px] w-[86px]"}>
        <circle cx={r + 6} cy={r + 6} r={r} fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth={small ? 4 : 5} />
        <circle
          cx={r + 6}
          cy={r + 6}
          r={r}
          fill="none"
          stroke={tone}
          strokeWidth={small ? 4 : 5}
          strokeLinecap="round"
          strokeDasharray={`${(score / 100) * c} ${c}`}
          transform={`rotate(-90 ${r + 6} ${r + 6})`}
          style={{ transition: "stroke-dasharray 700ms ease" }}
        />
      </svg>
      <div className="absolute text-center">
        <div className={cx("font-display leading-none text-white", small ? "text-[13px]" : "text-[24px]")}>{score}</div>
        {!small ? <div className="text-[9.5px] uppercase tracking-[0.16em] text-white/40">score</div> : null}
      </div>
    </div>
  );
}

function ReasonRow({ r }: { r: MuhuratDay["reasons"][number] }) {
  const pos = r.delta > 0;
  return (
    <div className={cx("flex items-start gap-2 rounded-xl border px-3 py-2", pos ? "border-jade-500/22 bg-jade-500/[0.05]" : r.delta < 0 ? "border-lotus-500/22 bg-lotus-500/[0.05]" : "border-white/8 bg-white/[0.02]")}>
      <span className={cx("mt-0.5 grid h-5 w-8 shrink-0 place-items-center rounded-md text-[11px] font-bold tabular", pos ? "bg-jade-500/15 text-jade-400" : r.delta < 0 ? "bg-lotus-500/15 text-lotus-400" : "bg-white/8 text-white/45")}>
        {r.delta > 0 ? `+${r.delta}` : r.delta}
      </span>
      <span className="text-[12.5px] leading-snug text-white/70">{r.text}</span>
    </div>
  );
}

function DayRow({ d, rank, tz, onOpen }: { d: MuhuratDay; rank: number; tz: string; onOpen: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={cx("overflow-hidden rounded-2xl border transition", d.klass === "best" ? "border-gold-500/40 bg-gold-500/[0.05]" : d.klass === "avoid" ? "border-white/8 bg-night-950/40 opacity-70" : "border-white/10 bg-night-900/45")}>
      <div className="flex flex-wrap items-center gap-3 p-3.5">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-white/12 text-[11px] font-bold text-white/45 tabular">{rank}</span>
        <ScoreRing score={d.score} small />
        <div className="min-w-[170px] flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-display text-[17px] text-white">{d.label}</span>
            <Pill tone={d.klass === "best" ? "gold" : d.klass === "good" ? "jade" : d.klass === "fair" ? "saffron" : "muted"}>{d.klass}</Pill>
          </div>
          <div className="mt-0.5 text-[12px] text-white/45">
            {d.weekday} · {d.tithi.name} ({d.tithi.paksha.toLowerCase()}) · {d.nakshatra.name} · {d.yoga?.name} · {d.karana?.name}
          </div>
        </div>
        <div className="min-w-[190px]">
          {d.window ? (
            <>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-gold-500">
                {d.window.tone === "abhijit" ? <Sun size={11} /> : <Clock3 size={11} />} {d.window.label}
              </div>
              <div className="text-[15px] font-semibold text-white tabular">
                {fmtTime(d.window.start, tz)} – {fmtTime(d.window.end, tz)}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-1.5 text-[12.5px] text-lotus-400">
              <X size={13} /> no clean window in daylight
            </div>
          )}
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <button onClick={() => setOpen(!open)} className="rounded-lg border border-white/12 px-2.5 py-1.5 text-[11.5px] font-semibold text-white/60 transition hover:border-gold-500/50 hover:text-gold-400">
            {open ? "hide factors" : `${d.reasons.length} factors`}
          </button>
          <Button size="sm" variant="outline" onClick={onOpen}>
            open
          </Button>
        </div>
      </div>
      <div className={cx("grid transition-all duration-300", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
        <div className="overflow-hidden">
          <div className="grid gap-2 border-t border-white/8 p-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {d.reasons.map((r, i) => (
              <ReasonRow key={i} r={r} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DayModal({ day, tz, def, onClose }: { day: MuhuratDay | null; tz: string; def: MuhuratDefLike; onClose: () => void }) {
  if (!day) return null;
  const nak = NAKSHATRAS[day.nakshatra.index];
  return (
    <Modal open={!!day} onClose={onClose} title={`${day.label} · ${def.label}`} wide>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Row k="Vāra" v={day.weekday} />
          <Row k="Tithi" v={`${day.tithi.name} · ${day.tithi.sanskrit} (${day.tithi.number}, ${day.tithi.paksha.toLowerCase()} pakṣa)`} />
          <Row k="Nakṣatra" v={`${day.nakshatra.name} · ${day.nakshatra.sanskrit}`} />
          <Row k="Yoga" v={day.yoga?.name ?? "—"} />
          <Row k="Karaṇa" v={day.karana?.name ?? "—"} />
          <Row k="Māsa" v={day.masa} />
          <Row k="Sunrise" v={day.sunrise ? fmtTime(day.sunrise, tz) : "—"} mono />
          <Row k="Sunset" v={day.sunset ? fmtTime(day.sunset, tz) : "—"} mono />
        </div>
        <div className="rounded-2xl border border-white/10 bg-night-950/45 p-4">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-500">the hours</div>
          <div className="space-y-1.5">
            {day.window ? (
              <div className="rounded-xl border border-gold-500/35 bg-gold-500/[0.07] px-3 py-2.5">
                <div className="text-[11px] uppercase tracking-wider text-gold-500">{day.window.tone === "abhijit" ? "use this" : "prefer this"}</div>
                <div className="font-display text-[19px] text-white tabular">
                  {fmtTime(day.window.start, tz)} – {fmtTime(day.window.end, tz)}
                </div>
                <div className="text-[12px] text-white/55">{day.window.label}</div>
              </div>
            ) : (
              <div className="rounded-xl border border-lotus-500/30 bg-lotus-500/[0.06] px-3 py-2.5 text-[13px] text-lotus-400">
                No window: every daylight block is occupied by a kāla.
              </div>
            )}
            {day.blocked.map((b) => (
              <div key={b.label} className="flex items-center justify-between rounded-xl border border-white/8 px-3 py-2">
                <span className="text-[12.5px] text-white/55">{b.label}</span>
                <span className="text-[13px] font-semibold text-lotus-400 tabular">
                  {fmtTime(b.start, tz)}–{fmtTime(b.end, tz)}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11.5px] leading-relaxed text-white/40">
            Times are {tz}. Rāhu Kāla and the others are eighths of the daylight span, so they move with the season — at
            {day.sunrise && day.sunset ? ` ${Math.round((day.sunset - day.sunrise) / 3600000)}h` : " this"} of daylight here.
          </p>
        </div>
      </div>
      <Divider label="why this day scored this way" />
      <div className="grid gap-2 sm:grid-cols-2">
        {day.reasons.map((r, i) => (
          <ReasonRow key={i} r={r} />
        ))}
      </div>
      {nak ? (
        <div className="mt-4 rounded-2xl border border-azure-500/25 bg-azure-500/[0.05] p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[13px] font-semibold text-white/85">{nak.name} · deity {nak.deity}</span>
            <Pill tone="muted">
              <Star size={10} /> lord {PLANET_BY_ID[nak.lord]?.name ?? nak.lord}
            </Pill>
            <Pill tone="muted">{nak.gana} gaṇa</Pill>
            <Pill tone="muted">{nak.yoni} yoni</Pill>
          </div>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-white/55">{nak.nature}</p>
        </div>
      ) : null}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
        <p className="max-w-md text-[12px] leading-relaxed text-white/45">
          Save or print this screen for the priest; the {def.label.toLowerCase()} rules used here are listed on the page above.
          For a muhūrta that also satisfies both families' kuṇḍalīs, the Acharya's selection covers Lagna-śuddhi and
          dishā-shuddhi.
        </p>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onClose}>
            close
          </Button>
          <AddButton id="muhurat-report" size="md" label={`Verify with Acharya ${inr(1500)}`} />
        </div>
      </div>
    </Modal>
  );
}

type MuhuratDefLike = (typeof MUHURAT_PURPOSES)[number];
