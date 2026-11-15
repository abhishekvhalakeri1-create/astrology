/**
 * Dosha centre: Sadhe Satī timeline, Kāla Sarpa, Maṅgālīka, Gāṇḍānta and Pitṛ
 * dosha — with the cancellation logic exposed, and remedies priced.
 */
import { useMemo, useState } from "react";
import { AlertTriangle, ArrowRight, CalendarRange, Check, Compass, Flame, Moon, ShieldCheck, Timer, TriangleAlert } from "lucide-react";
import { findSignEntry, sadeSati, siderealAt, upcomingTransits } from "../lib/astro/transits";
import { KAAL_SARP_TYPES, NAKSHATRAS, PLANET_BY_ID, SIGNS } from "../data/reference";
import { fmtDate, inr } from "../lib/format";
import { SERVICES, serviceById } from "../data/catalog";
import { useApp } from "../store";
import { AddButton } from "../components/Cart";
import { Button, Card, Container, Divider, Eyebrow, ListItem, Pill, Price, Reveal, Row, Section, SectionHead, Tabs, cx } from "../components/ui";

const DAY = 86400000;

export function DoshasPage() {
  const { kundli, activeProfile } = useApp();
  const [tab, setTab] = useState("sati");
  const moonSign = kundli?.moonSign ?? 9;
  const at = Date.now();
  const st = useMemo(() => sadeSati(moonSign, at, kundli?.ayanamsaKind ?? "lahiri"), [moonSign, at, kundli]);

  return (
    <>
      <Section className="pb-4 pt-10 sm:pt-14">
        <Container>
          <div className="grid items-end gap-6 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <Eyebrow>दोष केंद्र · diagnosis &amp; parihāra</Eyebrow>
              <h1 className="mt-3 font-display text-[2.2rem] leading-tight text-white sm:text-[3rem]">
                The four things families argue about,{" "}
                <span className="text-gradient-gold">answered with dates</span>
              </h1>
              <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-white/60">
                Sadhe Satī, Kāla Sarpa, Maṅgālīka and Gāṇḍānta are each computed from your chart, checked against the
                classical cancellation rules, and then — only if they survive the checks — given a remedy with a price next to
                it. If the dosha does not apply, this page tells you so plainly.
              </p>
            </div>
            <div className="lg:col-span-4">
              <Card className="p-4">
                {!activeProfile ? (
                  <p className="text-[13px] leading-relaxed text-white/60">
                    Showing a default Capricorn Moon so you can see the method. Add your chart for your real answer.
                    <Button size="sm" variant="outline" to="/kundli" className="mt-2.5 w-full">
                      <Compass size={13} /> Free kundli
                    </Button>
                  </p>
                ) : (
                  <>
                    <Row k="Your Moon" v={`${SIGNS[moonSign]?.name} · ${NAKSHATRAS[kundli!.moonNakshatra]?.name}`} />
                    <Row k="Saturn now in" v={SIGNS[Math.floor(siderealAt("Sa", at) / 30) % 12]?.name} />
                    <Row k="House from Moon" v={st.houseFromMoon} mono />
                    <Row k="Doshas active" v={`${kundli!.doshas.filter((d) => d.present && !d.cancelled).length} of ${kundli!.doshas.length}`} mono />
                  </>
                )}
              </Card>
            </div>
          </div>

          <div className="mt-7 flex justify-center sm:justify-start">
            <Tabs
              active={tab}
              onChange={setTab}
              tabs={[
                { id: "sati", label: <><Timer size={13} /> Sadhe Satī</> },
                { id: "kaalsarp", label: <><Flame size={13} /> Kāla Sarpa</> },
                { id: "mangal", label: <><AlertTriangle size={13} /> Maṅgālīka</> },
                { id: "others", label: <><ShieldCheck size={13} /> Gāṇḍānta &amp; Pitṛ</> },
                { id: "shop", label: <><CalendarRange size={13} /> Remedies</> },
              ]}
            />
          </div>
        </Container>
      </Section>

      <Section className="pt-2">
        <Container>
          {tab === "sati" ? <SadeSatiPanel moonSign={moonSign} st={st} /> : null}
          {tab === "kaalsarp" ? <KaalaSarpPanel /> : null}
          {tab === "mangal" ? <MangalPanel /> : null}
          {tab === "others" ? <OthersPanel /> : null}
          {tab === "shop" ? <RemedyShop /> : null}
        </Container>
      </Section>
    </>
  );
}

/* ───────────────────────── Sadhe Satī ───────────────────────── */

function SadeSatiPanel({ moonSign, st }: { moonSign: number; st: ReturnType<typeof sadeSati> }) {
  const at = Date.now();
  const saturnSign = Math.floor(siderealAt("Sa", at) / 30) % 12;
  // build the three-phase timeline from real sign entries
  const seq = useMemo(() => {
    const phases = [
      { label: "Phase 1 · 12th from Moon (rising)", sign: (moonSign + 11) % 12, tone: "onset" },
      { label: "Phase 2 · over the Moon (peak)", sign: moonSign, tone: "peak" },
      { label: "Phase 3 · 2nd from Moon (setting)", sign: (moonSign + 1) % 12, tone: "release" },
    ];
    return phases.map((p) => {
      const entering = findSignEntry("Sa", p.sign, at - 400 * DAY, 800);
      const leaving = findSignEntry("Sa", (p.sign + 1) % 12, entering ?? at, 800);
      const nextIn = findSignEntry("Sa", p.sign, at + DAY, 1400);
      return { ...p, start: entering, end: leaving, next: nextIn };
    });
  }, [moonSign, at]);

  const current = seq.find((s) => (s.start ?? 0) <= at && (s.end ?? Infinity) > at);

  return (
    <div className="grid gap-4 lg:grid-cols-12">
      <div className="space-y-4 lg:col-span-8">
        <Card className={cx("relative overflow-hidden p-6", st.active ? "border-lotus-500/40" : "border-jade-500/30")}>
          <div className="aura pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-lotus-500/15 blur-3xl" />
          <div className="relative">
            <div className="flex flex-wrap items-center gap-2">
              <Pill tone={st.active ? "lotus" : "jade"}>{st.active ? "running now" : "not running"}</Pill>
              <Pill tone="muted">Saturn in {SIGNS[saturnSign]?.name}</Pill>
              <Pill tone="muted">house {st.houseFromMoon} from your Moon</Pill>
            </div>
            <h2 className="mt-3 font-display text-[1.8rem] leading-tight text-white sm:text-[2.3rem]">{st.title}</h2>
            <p className="mt-2.5 max-w-2xl text-[14.5px] leading-relaxed text-white/65">{st.description}</p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/8">
              <div className="h-full rounded-full bg-gradient-to-r from-lotus-500 via-saffron-500 to-gold-400 transition-all duration-700" style={{ width: `${Math.round(st.progress * 100)}%` }} />
            </div>
            <p className="mt-1.5 text-[11.5px] text-white/40">{Math.round(st.progress * 100)}% of the current leg elapsed{st.nextShift ? ` · Saturn shifts sign on ${fmtDate(st.nextShift)}` : ""}</p>
          </div>
        </Card>

        <Card className="p-5">
          <SectionHead align="left" className="mb-4" eyebrow="the 7½ years" title="Your three legs, with dates" sub="Each leg is Saturn transiting the 12th, 1st and 2nd from your Moon — 2½ years each, but not consecutive: retrogrades stretch them." />
          <div className="space-y-2.5">
            {seq.map((s) => (
              <div key={s.label} className={cx("rounded-2xl border p-4", current?.label === s.label ? "border-gold-500/55 bg-gold-500/[0.07]" : "border-white/8 bg-night-950/35")}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-display text-[16px] text-white">{s.label}</span>
                  <Pill tone="muted">Saturn through {SIGNS[s.sign]?.name}</Pill>
                  {current?.label === s.label ? <Pill tone="saffron">you are here</Pill> : null}
                  {s.next && s.next > at ? <Pill tone="azure">again from {fmtDate(s.next)}</Pill> : null}
                </div>
                <div className="mt-2 grid gap-1.5 sm:grid-cols-3">
                  <Row k="begins" v={s.start ? fmtDate(s.start) : "already past"} mono />
                  <Row k="ends" v={s.end ? fmtDate(s.end) : "—"} mono />
                  <Row k="duration" v={s.start && s.end ? `${(((s.end - s.start) / DAY) / 30.44).toFixed(1)} months` : "—"} mono />
                </div>
                {current?.label === s.label ? (
                  <p className="mt-2 text-[12.5px] leading-relaxed text-white/55">
                    {s.tone === "onset"
                      ? "The 12th house leg: expenses, sleep, foreign distance, things leaving your life. Most people feel it as leakage rather than loss."
                      : s.tone === "peak"
                        ? "Over the Moon: the mind, the mother, public mood and fluid-related health. Do not start a war in this leg; do finish the one already running."
                        : "The 2nd house leg: money, speech, family. Recovery, but you are still being audited — settle accounts and old obligations."}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11.5px] leading-relaxed text-white/40">
            Dates are computed from the ephemeris (Lahiri), which is why they can sit a day off a printed almanac that uses
            mean ayanāṁsa or true nodes. Both are "correct"; ours is reproducible.
          </p>
        </Card>
      </div>

      <div className="space-y-4 lg:col-span-4">
        <Card className="p-5">
          <div className="mb-2.5 text-[12px] font-semibold uppercase tracking-[0.16em] text-gold-500">what actually helps</div>
          <ul className="space-y-1.5">
            <ListItem>Saturday discipline: early rise, oil lamp, no new debt, no harsh words to servants and staff — the classical list is behavioural on purpose.</ListItem>
            <ListItem>Feed crows / stray dogs on Saturday morning; Hanuman worship on Tuesday keeps the fear component down.</ListItem>
            <ListItem>Do not start a business, marry, or shift cities in the peak leg unless the daśā supports it. This page can tell you the exact overlap.</ListItem>
          </ul>
          <div className="mt-3.5 grid gap-2">
            <div className="rounded-2xl border border-white/8 bg-night-950/40 p-3">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-semibold text-white/85">Shani Sadhe Satī Puja</span>
                <Price value={serviceById("puja-shani")!.price} mrp={serviceById("puja-shani")!.mrp} size="sm" />
              </div>
              <p className="mt-1 text-[11.5px] text-white/45">{serviceById("puja-shani")!.delivery}</p>
              <AddButton id="puja-shani" className="mt-2.5" full label="Book puja" />
            </div>
            <AddButton id="saade-sati-kit" full label="Survival Kit ₹349" />
            <Button size="sm" variant="outline" to="/services#consult" full>
              Ask whether the daśā supports it <ArrowRight size={13} />
            </Button>
          </div>
        </Card>
        <Card className="p-5">
          <div className="mb-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-gold-500">Saturn's own daśā</div>
          <p className="text-[13px] leading-relaxed text-white/60">
            Sadhe Satī is a transit; Saturn's mahādaśā is a timing. If the two overlap, the leg is heavier and the remedy
            should be done before the peak, not after.
          </p>
          {kundliHasDasha() ? <SatiDashaNote /> : null}
        </Card>
      </div>
    </div>
  );
}

function kundliHasDasha() {
  return typeof window !== "undefined";
}

function SatiDashaNote() {
  const { kundli } = useApp();
  const md = kundli?.dasha.mahadashas.find((m) => m.lord === "Sa");
  if (!md || !kundli) return null;
  const active = Date.now() >= md.start && Date.now() < md.end;
  return (
    <div className={cx("mt-3 rounded-xl border p-3 text-[12.5px] leading-relaxed", active ? "border-lotus-500/40 bg-lotus-500/[0.07] text-lotus-400" : "border-white/8 bg-night-950/40 text-white/55")}>
      Saturn's mahādaśā in your chart: {fmtDate(md.start)} → {fmtDate(md.end)}
      {active ? " — running now, so the transit and the daśā stack. Do the work early." : " — outside it, so the transit alone is the load."}
    </div>
  );
}

/* ───────────────────────── Kāla Sarpa ───────────────────────── */

function KaalaSarpPanel() {
  const { kundli } = useApp();
  const d = kundli?.doshas.find((x) => x.id === "kaalsarp");
  const present = !!d?.present && !d?.cancelled;
  const rahuHouse = kundli?.grahas.find((g) => g.id === "Ra")?.house ?? 0;
  const type = KAAL_SARP_TYPES[(rahuHouse - 1 + 12) % 12];
  const rows = upcomingTransits("Ra", Date.now(), 3);
  return (
    <div className="grid gap-4 lg:grid-cols-12">
      <Card className="p-6 lg:col-span-7">
        <div className="flex flex-wrap items-center gap-2">
          <Pill tone={present ? "lotus" : "jade"}>{present ? "present" : d?.cancelled ? "present · cancelled" : "not present"}</Pill>
          {present ? <Pill tone="saffron">{type?.name}</Pill> : null}
          {kundli ? <Pill tone="muted">Rāhu in house {rahuHouse}</Pill> : null}
        </div>
        <h2 className="mt-3 font-display text-[1.7rem] leading-tight text-white">Kāla Sarpa Doṣa</h2>
        <p className="mt-2.5 text-[14px] leading-relaxed text-white/65">
          {d?.detail ?? "Add a chart and this checks whether all seven grahas sit between Rāhu and Ketu — and which of the 12 named varieties applies."}
        </p>
        {d?.cancelReason ? <p className="mt-2.5 rounded-2xl border border-jade-500/25 bg-jade-500/[0.06] p-3 text-[13px] leading-relaxed text-jade-400">{d.cancelReason}</p> : null}
        <Divider label="the 12 varieties" />
        <div className="grid gap-1.5 sm:grid-cols-2">
          {KAAL_SARP_TYPES.map((t, i) => (
            <div key={t.name} className={cx("flex items-start gap-2 rounded-xl border px-3 py-2", present && rahuHouse === i + 1 ? "border-gold-500/50 bg-gold-500/[0.08]" : "border-white/8 bg-night-950/30")}>
              <span className="mt-0.5 text-[10.5px] font-bold tabular text-gold-400/70">{i + 1}</span>
              <span className="min-w-0">
                <span className="block text-[13px] font-semibold text-white/85">{t.name}</span>
                <span className="block text-[11.5px] leading-snug text-white/45">{t.impact}</span>
              </span>
            </div>
          ))}
        </div>
      </Card>
      <div className="space-y-4 lg:col-span-5">
        <Card className="p-5">
          <div className="mb-2 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-gold-500">
            <TriangleAlert size={13} /> why software gets this wrong
          </div>
          <ul className="space-y-1.5">
            <ListItem>Most apps include the Moon in the test; most almanac software excludes it. We exclude it and say so.</ListItem>
            <ListItem>Jupiter aspects, Kendra occupancy, and Rāhu in 6/10/12 all weaken or cancel the doṣa in the standard exception lists — checked here.</ListItem>
            <ListItem>Navāṁsa placement of Rāhu changes the flavour; the paid report includes D-9 Kāla Sarpa.</ListItem>
          </ul>
        </Card>
        <Card className="p-5">
          <div className="mb-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-gold-500">Rāhu's next moves</div>
          {rows.map((r) => (
            <Row key={r.at} k={`enters ${SIGNS[r.sign]?.name}`} v={fmtDate(r.at)} mono />
          ))}
          <p className="mt-2 text-[11.5px] leading-relaxed text-white/40">The nodes change sign every ~18 months and retrograde; your Kāla Sarpa geometry literally changes with them.</p>
        </Card>
        <Card className="p-5">
          <div className="mb-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-gold-500">Parihāra, priced</div>
          {SERVICES.filter((s) => s.id === "puja-rahu" || s.id === "puja-navagraha" || s.id === "kaal-sarp-report").map((s) => (
            <div key={s.id} className="flex items-start justify-between gap-3 border-b border-white/[0.06] py-2.5 last:border-0">
              <div className="min-w-0">
                <div className="text-[13.5px] font-semibold text-white/85">{s.title}</div>
                <div className="text-[11.5px] leading-snug text-white/45">{s.delivery}</div>
              </div>
              <div className="shrink-0 text-right">
                <div className="font-display text-[14px] text-gold-400">{inr(s.price)}</div>
                <AddButton id={s.id} size="sm" label="Add" className="mt-1" />
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

/* ───────────────────────── Maṅgālīka ───────────────────────── */

function MangalPanel() {
  const { kundli } = useApp();
  const d = kundli?.doshas.find((x) => x.id === "mangal");
  const ma = kundli?.grahas.find((g) => g.id === "Ma");
  const fromMoon = kundli ? ((ma!.house + ((kundli.moonSign - kundli.lagna.sign + 12) % 12)) - 1) % 12 + 1 : 0;
  const houses = [1, 2, 4, 7, 8, 12];
  return (
    <div className="grid gap-4 lg:grid-cols-12">
      <Card className="p-6 lg:col-span-7">
        <div className="flex flex-wrap items-center gap-2">
          <Pill tone={d?.present && !d?.cancelled ? "lotus" : "jade"}>{d ? (d.cancelled ? "cancelled" : d.present ? `${d.severity} kuja` : "no kuja") : "add a chart"}</Pill>
          {ma ? <Pill tone="muted">Mars in {SIGNS[ma.sign]?.name}, house {ma.house}</Pill> : null}
          {kundli ? <Pill tone="muted">house {fromMoon} from Moon</Pill> : null}
        </div>
        <h2 className="mt-3 font-display text-[1.7rem] leading-tight text-white">Maṅgālīka (KuJa) Doṣa</h2>
        <p className="mt-2.5 text-[14px] leading-relaxed text-white/65">{d?.detail ?? "Mars in the 1st, 2nd, 4th, 7th, 8th or 12th from the Lagna — or the same from the Moon — with five classical cancellations applied."}</p>
        <div className="mt-4 grid grid-cols-6 gap-1.5">
          {houses.map((h) => {
            const hit = ma?.house === h;
            return (
              <div key={h} className={cx("rounded-xl border px-2 py-2 text-center", hit ? "border-lotus-500/50 bg-lotus-500/[0.12]" : "border-white/8 bg-night-950/30")}>
                <div className="text-[10.5px] uppercase tracking-wider text-white/40">house</div>
                <div className={cx("font-display text-[17px]", hit ? "text-lotus-400" : "text-white/60")}>{h}</div>
                {hit ? <Check size={12} className="mx-auto mt-0.5 text-lotus-400" /> : null}
              </div>
            );
          })}
        </div>
        <Divider />
        <div className="grid gap-2 sm:grid-cols-2">
          {[
            "If Mars sits in its own or exalted sign (Aries, Scorpio, Capricorn) the doṣa is much lighter.",
            "Benefic aspect on Mars (Jupiter, or Moon) cancels or halves it in most authorities.",
            "Kuja–Kuja marriage neutralises it — the reason 'find another Mangalik' exists.",
            "In the 2nd from Lagna, Mars also gives Dhana-yoga flavour: not pure trouble.",
            "After the 30th year (some say after marriage) the intensity drops materially in practice.",
          ].map((x) => (
            <p key={x} className="text-[12.5px] leading-relaxed text-white/55">
              · {x}
            </p>
          ))}
        </div>
      </Card>
      <div className="space-y-4 lg:col-span-5">
        <Card className="p-5">
          <div className="mb-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-gold-500">Second opinion before you reject a proposal</div>
          <div className="flex items-center justify-between gap-3">
            <div className="text-[13px] leading-relaxed text-white/60">
              A 'no-match' verdict is the expensive mistake. {inr(serviceById("milan-reject")!.price)} for 20 minutes of human cancellation audit.
            </div>
            <Price value={serviceById("milan-reject")!.price} size="sm" />
          </div>
          <AddButton id="milan-reject" className="mt-3" full label="Book second opinion" />
          <div className="mt-2 rounded-xl border border-white/8 bg-night-950/40 p-3">
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-white/80">Mangal Dosh Nivaran puja</span>
              <Price value={serviceById("puja-mangal")!.price} mrp={serviceById("puja-mangal")!.mrp} size="sm" />
            </div>
            <AddButton id="puja-mangal" className="mt-2.5" full label="Book puja ₹7,100" />
          </div>
        </Card>
        <Card className="p-5">
          <div className="mb-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-gold-500">Mars in your chart</div>
          {ma ? (
            <>
              <Row k="Sign / house" v={`${ma.signName} · H${ma.house}`} />
              <Row k="Degree" v={`${ma.degInSign.toFixed(2)}°`} mono />
              <Row k="Nakṣatra" v={`${ma.nakshatraName} pāda ${ma.pada}`} />
              <Row k="Dignity" v={ma.dignity} />
              <Row k="Retrograde" v={ma.retro ? "yes" : "no"} />
              <Row k="Aspects from" v={ma.aspectsOn.length ? ma.aspectsOn.map((a) => PLANET_BY_ID[a.by]?.name).join(", ") : "none"} />
            </>
          ) : (
            <p className="text-[13px] text-white/50">Add a chart.</p>
          )}
        </Card>
      </div>
    </div>
  );
}

/* ───────────────────────── others ───────────────────────── */

function OthersPanel() {
  const { kundli } = useApp();
  const others = (kundli?.doshas ?? []).filter((d) => d.id !== "mangal" && d.id !== "kaalsarp");
  return (
    <div className="grid gap-4 lg:grid-cols-12">
      <div className="space-y-4 lg:col-span-8">
        {others.length === 0 ? (
          <Card className="p-6">
            <p className="text-[14px] leading-relaxed text-white/65">
              Gāṇḍānta and Pitṛ doṣa need a chart to check. Gāṇḍānta asks whether the Moon (or the Lagna) sits on a
              water–fire junction of nakṣatras; Pitṛ asks about the 9th house, the Sun and ancestral obligations.
            </p>
            <Button to="/kundli" size="sm" variant="outline" className="mt-3">
              Generate free kundli <ArrowRight size={13} />
            </Button>
          </Card>
        ) : null}
        {others.map((d, i) => (
          <Reveal key={d.id} delay={i * 0.05}>
            <Card className={cx("p-5", d.present && !d.cancelled ? "border-saffron-500/35" : "")}>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-display text-[17.5px] text-white">{d.name}</span>
                <span className="font-deva text-[12px] text-gold-400/75">{d.sanskrit}</span>
                <Pill tone={d.present ? (d.cancelled ? "jade" : "saffron") : "muted"} className="ml-auto">
                  {d.present ? (d.cancelled ? "cancelled" : d.severity) : "not present"}
                </Pill>
              </div>
              <p className="mt-2 text-[13.5px] leading-relaxed text-white/65">{d.detail}</p>
              {d.cancelReason ? <p className="mt-2 text-[12.5px] leading-relaxed text-jade-400">{d.cancelReason}</p> : null}
              <p className="mt-2 text-[13px] leading-relaxed text-white/55">
                <span className="text-gold-400">Upāya:</span> {d.remedy}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {d.services.map((sid) => (
                  <AddButton key={sid} id={sid} size="sm" label={`+ ${serviceById(sid)?.title.slice(0, 24)}`} />
                ))}
              </div>
            </Card>
          </Reveal>
        ))}
      </div>
      <Card className="p-5 lg:col-span-4">
        <div className="mb-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-gold-500">
          <Moon size={13} className="mr-1.5 inline" /> the honest framing
        </div>
        <ul className="space-y-1.5">
          <ListItem>A doṣa is a risk factor with a timing, not a curse. It says where friction concentrates, and when.</ListItem>
          <ListItem>Cancellation rules are not optional extras — they are in the same source texts. Any app that skips them is selling fear.</ListItem>
          <ListItem>Pitṛ obligations are largely behavioural: unpaid debts, unperformed śrāddha, broken promises to the dead.</ListItem>
          <ListItem>If a remedy costs more than your month's expenses, it is the wrong remedy.</ListItem>
        </ul>
        <div className="mt-4 rounded-2xl border border-gold-500/25 bg-gold-500/[0.06] p-3.5">
          <div className="text-[13px] font-semibold text-white/90">Pitṛ Tarpaṇa &amp; Śrāddha</div>
          <div className="mt-0.5 text-[11.5px] text-white/50">Amāvāsyā at Gaya or your city · gotra-correct sankalp</div>
          <div className="mt-2 flex items-center justify-between">
            <Price value={serviceById("puja-pitru")!.price} mrp={serviceById("puja-pitru")!.mrp} size="sm" />
            <AddButton id="puja-pitru" size="sm" />
          </div>
        </div>
      </Card>
    </div>
  );
}

/* ───────────────────────── shop ───────────────────────── */

function RemedyShop() {
  const list = SERVICES.filter((s) => s.category === "puja" || s.category === "gems");
  const [filter, setFilter] = useState<"all" | "puja" | "gems">("all");
  const shown = list.filter((s) => filter === "all" || s.category === filter);
  return (
    <div>
      <SectionHead eyebrow="parihāra" title="Every remedy, one price list" sub="No 'only today' pricing, no escalating sankalp. Fixed rupees, fixed temple, video proof." action={<div className="mt-3 flex justify-center"><Tabs active={filter} onChange={(v) => setFilter(v as typeof filter)} size="sm" tabs={[{ id: "all", label: "all" }, { id: "puja", label: "pujas" }, { id: "gems", label: "ratna" }]} /></div>} />
      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((s, i) => (
          <Reveal key={s.id} delay={(i % 3) * 0.05}>
            <Card hover className="flex h-full flex-col p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="font-display text-[16.5px] leading-snug text-white">{s.title}</div>
                {s.badge ? <Pill tone="saffron">{s.badge}</Pill> : null}
              </div>
              <p className="mt-2 flex-1 text-[12.5px] leading-relaxed text-white/55">{s.blurb}</p>
              <ul className="mt-3 space-y-1">
                {s.includes.slice(0, 3).map((x) => (
                  <ListItem key={x}>{x}</ListItem>
                ))}
              </ul>
              <div className="mt-3.5 flex items-end justify-between border-t border-white/8 pt-3">
                <Price value={s.price} mrp={s.mrp} />
                <AddButton id={s.id} />
              </div>
            </Card>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
