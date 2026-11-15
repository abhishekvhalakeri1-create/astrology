/**
 * Janma Kuṇḍlī — the flagship page. Free to read, printable, with the paid
 * PDF / consultation upsells wired to the cart.
 */
import { useMemo, useState } from "react";
import {
  ArrowRight, BadgeCheck, BookOpenCheck, CalendarClock, ChevronDown, Compass, Eye, Flame, Gem,
  Heart, Image as ImageIcon, IndianRupee, Info, Layers, Moon, Printer, Sparkles, Sun, Target, TrendingUp,
} from "lucide-react";
import { NAKSHATRAS, PLANET_BY_ID, SIGNS } from "../data/reference";
import { dms, type KundliResult } from "../lib/astro/kundli";
import { DASHA_THEMES, dashaRange } from "../lib/astro/dasha";
import { SERVICES, serviceById } from "../data/catalog";
import { fmtDate, fmtTime, inr, yearsToYm } from "../lib/format";
import { sadeSati } from "../lib/astro/transits";
import { useApp } from "../store";
import { BirthForm, FormShell, ProfileBar, type Draft, emptyDraft, validateDraft } from "../components/BirthForm";
import { AddButton } from "../components/Cart";
import { D10Strip, GrahaWheel, NorthChart, SouthChart } from "../components/charts";
import { Button, Card, Container, Divider, Eyebrow, ListItem, Modal, Pill, Price, Row, Section, SectionHead, Tabs, cx } from "../components/ui";
import type { Place } from "../data/places";

export function KundliPage() {
  const { kundli, activeProfile, addProfile, state, kundliError } = useApp();
  const [draft, setDraft] = useState<Draft>(() =>
    activeProfile
      ? { name: activeProfile.name, dob: activeProfile.dob, tob: activeProfile.tob, place: activeProfile.place as Place, tz: activeProfile.place.tz, ayanamsa: activeProfile.ayanamsa ?? "lahiri", topocentric: !!activeProfile.topocentric, gender: activeProfile.gender ?? "male" }
      : emptyDraft(),
  );
  const [tab, setTab] = useState("chart");

  const submit = () => {
    if (validateDraft(draft)) return;
    const existing = state.profiles.find((p) => p.name.trim().toLowerCase() === draft.name.trim().toLowerCase() && p.dob === draft.dob && p.tob === draft.tob);
    addProfile({ name: draft.name.trim(), dob: draft.dob, tob: draft.tob, place: draft.place as Place, ayanamsa: draft.ayanamsa, topocentric: draft.topocentric, gender: draft.gender }, existing ? { updateId: existing.id } : undefined);
    setTimeout(() => document.getElementById("result")?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
  };

  return (
    <>
      <Section className="pb-2 pt-10 sm:pt-14">
        <Container>
          <div className="grid items-end gap-6 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <Eyebrow>जन्म कुण्डली · free &amp; unlimited</Eyebrow>
              <h1 className="mt-3 font-display text-[2.3rem] leading-[1.06] text-white sm:text-[3.2rem]">
                Janma Kundli, <span className="text-gradient-gold">to the arcsecond</span>
              </h1>
              <p className="mt-3.5 max-w-2xl text-[15px] leading-relaxed text-white/60">
                Nine graha positions, Lagna and navāṁsa, whole-sign houses, Vimshottari daśās, yoga and dosha detection —
                computed in your browser from a live ephemeris. Nothing is hidden behind a signup; the paid part is the
                typeset PDF and a human's reading, both optional.
              </p>
            </div>
            <div className="lg:col-span-4">
              <div className="glass flex items-center gap-3 rounded-2xl p-4">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-jade-500/30 text-jade-400">
                  <BadgeCheck size={19} />
                </div>
                <div className="text-[12.5px] leading-snug text-white/65">
                  Engine verified against the 15 Nov 2026 Delhi Panchang &amp; 60 sunrise cases.
                  <span className="text-white/40"> See the method tab below.</span>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <FormShell title={activeProfile ? "Edit or add a chart" : "Enter birth details"}>
        <Container className="px-0">
          <ProfileBar onNew={() => setDraft(emptyDraft())} />
          <BirthForm draft={draft} setDraft={setDraft} onSubmit={submit} submitLabel={activeProfile ? "Update / add chart" : "Generate my Kundli"} error={kundliError} />
        </Container>
      </FormShell>

      {!kundli ? (
        <Section className="pt-2">
          <Container>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { t: "What you need handy", d: "Birth date, the clock time as written on the hospital card or the family diary, and the city. If the time is approximate, say so in the consultation." },
                { t: "Why minutes matter", d: "The Lagna moves ~1° in 4 minutes. A 15-minute error can shift a graha between houses and change the whole reading." },
                { t: "Your data", d: "Everything is computed locally and stored in this browser only. No server, no profile, no resale — and one button wipes it." },
              ].map((x) => (
                <Card key={x.t} className="p-5">
                  <div className="mb-2 flex items-center gap-2 text-[13.5px] font-semibold text-gold-400">
                    <Info size={14} /> {x.t}
                  </div>
                  <p className="text-[13px] leading-relaxed text-white/55">{x.d}</p>
                </Card>
              ))}
            </div>
          </Container>
        </Section>
      ) : (
        <Section id="result" className="pt-4">
          <Container>
            <ChartHeader k={kundli} />

            <div className="mt-7 mb-5 flex justify-center sm:justify-start">
              <Tabs
                active={tab}
                onChange={setTab}
                tabs={[
                  { id: "chart", label: <><Layers size={13} /> Charts</> },
                  { id: "grahas", label: <><Target size={13} /> Graha positions</> },
                  { id: "houses", label: <><Compass size={13} /> 12 Bhāvas</> },
                  { id: "dasha", label: <><CalendarClock size={13} /> Daśā</> },
                  { id: "yogas", label: <><Sparkles size={13} /> Yogas</> },
                  { id: "doshas", label: <><Flame size={13} /> Doshas</> },
                  { id: "remedies", label: <><Gem size={13} /> Remedies</> },
                ]}
              />
            </div>

            <div className="print-hide">
              {tab === "chart" ? <ChartTab k={kundli} /> : null}
              {tab === "grahas" ? <GrahaTab k={kundli} /> : null}
              {tab === "houses" ? <HouseTab k={kundli} /> : null}
              {tab === "dasha" ? <DashaTab k={kundli} /> : null}
              {tab === "yogas" ? <YogaTab k={kundli} /> : null}
              {tab === "doshas" ? <DoshaTab k={kundli} /> : null}
              {tab === "remedies" ? <RemedyTab k={kundli} /> : null}
            </div>

            <PrintSheet k={kundli} />
            <MethodNote />
          </Container>
        </Section>
      )}
    </>
  );
}

/* ───────────────────────────────── header card ───────────────────────────────── */

function ChartHeader({ k }: { k: KundliResult }) {
  const [open, setOpen] = useState(false);
  const p = k.birthPanchanga;
  const rows: [string, React.ReactNode][] = [
    ["Name", k.input.name || "—"],
    ["Sex", k.input.gender ?? "—"],
    ["Birth", `${fmtDate(k.utcMs, k.input.place.tz)} · ${fmtTime(k.utcMs, k.input.place.tz)} (local)`],
    ["Place", `${k.input.place.name}${k.input.place.region ? `, ${k.input.place.region}` : ""} · ${k.input.place.lat.toFixed(4)}°, ${k.input.place.lon.toFixed(4)}°`],
    ["Time zone", `${k.input.place.tz} · UTC ${new Date(k.utcMs).toISOString().slice(11, 16)}Z`],
    ["Ayanāṁsa", `${k.ayanamsaKind === "kp" ? "KP" : "Lahiri"} ${k.ayanamsaDeg.toFixed(4)}°`],
    ["Positions", k.input.topocentric ? "topocentric (parallax applied)" : "geocentric (almanac convention)"],
    ["Lagna", `${k.lagna.signName} ${dms(k.lagna.degInSign)} · ${k.lagna.nakshatraName} pāda ${k.lagna.pada}`],
    ["Chandra", `${SIGNS[k.moonSign]?.name} · ${NAKSHATRAS[k.moonNakshatra]?.name} pāda ${k.moonPada}`],
    ["Sūrya", `${SIGNS[k.sunSign]?.name}`],
    ["Nakṣatra gaṇa / yoni / varṇa", `${k.gana} · ${k.yoni} · ${k.varna}`],
    ["Masa / pakṣa", `${p.masa} · ${p.paksha}`],
    ["Tithi at birth", `${p.tithi.value.name}`],
    ["Yoga / Karaṇa at birth", `${p.yoga.value.name} · ${p.karana.value.name}`],
  ];
  return (
    <div className="relative overflow-hidden rounded-3xl border border-gold-500/25 bg-gradient-to-br from-night-800/80 via-night-900/70 to-night-950 p-5 sm:p-7">
      <div className="aura pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-gold-500/15 blur-3xl" />
      <div className="relative grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <div className="flex flex-wrap items-center gap-2">
            <Pill tone="gold">
              <Sun size={11} /> {SIGNS[k.sunSign]?.name}
            </Pill>
            <Pill tone="azure">
              <Moon size={11} /> {SIGNS[k.moonSign]?.name}
            </Pill>
            <Pill tone="jade">
              <Compass size={11} /> {k.lagna.signName} Lagna
            </Pill>
            <Pill tone="lotus">
              <Sparkles size={11} /> {NAKSHATRAS[k.moonNakshatra]?.name}
            </Pill>
          </div>
          <h2 className="mt-3.5 font-display text-[1.9rem] leading-tight text-white sm:text-[2.4rem]">
            {k.input.name || "Untitled chart"}
            <span className="ml-2 align-middle font-deva text-base text-gold-400/80">जन्मपत्रिका</span>
          </h2>
          <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-white/55">
            Lagna at {dms(k.lagna.degInSign)} of {k.lagna.signName}; Moon in {NAKSHATRAS[k.moonNakshatra]?.name} pāda {k.moonPada} — so the
            Vimshottari cycle begins with {PLANET_BY_ID[k.dasha.startLord]?.name} mahādaśā, {k.dasha.balanceYears.toFixed(2)} years remaining at birth.
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {[
              { l: "Current Mahādaśā", v: k.dasha.current ? `${PLANET_BY_ID[k.dasha.current.md.lord]?.name}` : "—", s: k.dasha.current ? `${dashaRange(k.dasha.current.md.start, k.dasha.current.md.end, k.input.place.tz)}` : "" },
              { l: "Running Antardaśā", v: k.dasha.current ? `${PLANET_BY_ID[k.dasha.current.ad.lord]?.name} of ${PLANET_BY_ID[k.dasha.current.md.lord]?.name}` : "—", s: k.dasha.current ? dashaRange(k.dasha.current.ad.start, k.dasha.current.ad.end, k.input.place.tz) : "" },
              { l: "Next Mahādaśā", v: k.dasha.nextMd ? `${PLANET_BY_ID[k.dasha.nextMd.lord]?.name}` : "—", s: k.dasha.nextMd ? `${yearsToYm(k.dasha.nextMd.years)} from ${fmtDate(k.dasha.nextMd.start, k.input.place.tz)}` : "" },
            ].map((x) => (
              <div key={x.l} className="rounded-2xl border border-white/8 bg-night-950/45 px-3.5 py-3">
                <div className="text-[10.5px] uppercase tracking-[0.14em] text-white/40">{x.l}</div>
                <div className="mt-1 font-display text-[17px] text-gold-400">{x.v}</div>
                <div className="mt-0.5 text-[11px] text-white/45 tabular">{x.s}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-4">
          <div className="rounded-2xl border border-white/8 bg-night-950/40 p-3.5">
            <button onClick={() => setOpen(true)} className="mb-3 flex w-full items-center justify-between text-left text-[12.5px] font-semibold text-white/75 hover:text-gold-400">
              All birth data &amp; panchanga <ChevronDown size={14} />
            </button>
            <Row k="Yogās found" v={`${k.yogas.length}`} mono />
            <Row k="Doshas active" v={`${k.doshas.filter((d) => d.present && !d.cancelled).length}`} mono />
            <Row k="Strongest graha" v={k.strengths[0]?.name ?? "—"} />
            <Row k="Auspicious day" v={k.luck.day} />
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button size="sm" variant="outline" onClick={() => window.print()}>
                <Printer size={13} /> Print / PDF
              </Button>
              <AddButton id="kundli-pdf" size="sm" label="Buy PDF ₹199" />
            </div>
          </div>
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Birth data, as used" wide>
        <div className="grid gap-x-6 sm:grid-cols-2">
          {rows.map(([kk, vv]) => (
            <Row key={kk} k={kk} v={vv} />
          ))}
        </div>
        <p className="mt-4 text-[12px] leading-relaxed text-white/45">
          {k.notes.slice(0, 3).join(" ")}
        </p>
      </Modal>
    </div>
  );
}

/* ───────────────────────────────── tabs ───────────────────────────────── */

function ChartTab({ k }: { k: KundliResult }) {
  const [style, setStyle] = useState<"north" | "south">("north");
  const [d9, setD9] = useState(false);
  return (
    <div className="grid gap-4 lg:grid-cols-12">
      <Card className="p-5 lg:col-span-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-1.5">
            <ChipA active={style === "north"} onClick={() => setStyle("north")}>
              North Indian
            </ChipA>
            <ChipA active={style === "south"} onClick={() => setStyle("south")}>
              South Indian
            </ChipA>
          </div>
          <div className="flex gap-1.5">
            <ChipA active={!d9} onClick={() => setD9(false)}>
              D-1 Rāsi
            </ChipA>
            <ChipA active={d9} onClick={() => setD9(true)}>
              D-9 Navāṁsa
            </ChipA>
          </div>
        </div>
        <div className="mx-auto max-w-[560px]">
          {style === "north" ? <NorthChart k={k} d9={d9} /> : <SouthChart k={k} d9={d9} />}
        </div>
        <p className="mt-4 text-center text-[11.5px] leading-relaxed text-white/40">
          {d9
            ? "Navāṁsa (D-9): each sign divided into nine parts of 3°20′ — the fruit of the tree, read for marriage and for the strength of a graha."
            : "Whole-sign (rāsi) houses: the Lagna sign is house 1 and every sign is one house end-to-end — the system Varāhamihira and most South-Indian almanacs use."}
        </p>
      </Card>

      <div className="space-y-4 lg:col-span-4">
        <Card className="p-5">
          <div className="mb-3 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-gold-500">
            <ImageIcon size={13} /> Graha map
          </div>
          <GrahaWheel k={k} size={240} />
        </Card>
        <Card className="p-5">
          <div className="mb-2.5 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-gold-500">
            <Layers size={13} /> Daśāṁsa (D-10) · career
          </div>
          <D10Strip k={k} />
          <p className="mt-3 text-[11.5px] leading-relaxed text-white/45">
            D-10 is the standard check on profession: a graha strong in D-1 but fallen in D-10 usually means the career
            result is real but the work itself will not satisfy.
          </p>
        </Card>
      </div>

      <Card className="p-5 lg:col-span-12">
        <div className="mb-3 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-gold-500">
          <TrendingUp size={13} /> Sign occupancy
        </div>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
          {SIGNS.map((sg, i) => {
            const list = k.bySign[i] ?? [];
            const isLagna = k.lagna.sign === i;
            return (
              <div key={sg.name} className={cx("rounded-xl border px-3 py-2.5", isLagna ? "border-gold-500/50 bg-gold-500/[0.08]" : "border-white/8 bg-night-950/35")}>
                <div className="flex items-baseline justify-between">
                  <span className="font-deva text-[13px] text-gold-400/85">{sg.sanskrit}</span>
                  {isLagna ? <span className="text-[9.5px] font-bold uppercase tracking-wider text-gold-400">Lagna</span> : null}
                </div>
                <div className="mt-0.5 text-[11px] text-white/45">
                  {sg.name} · {i + 1}
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {list.length === 0 ? <span className="text-[11px] text-white/25">empty</span> : null}
                  {list.map((g) => (
                    <span key={g} className="rounded-md bg-white/8 px-1.5 py-0.5 text-[10.5px] font-semibold text-white/80">
                      {PLANET_BY_ID[g]?.name.slice(0, 4)}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function GrahaTab({ k }: { k: KundliResult }) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[780px] text-left">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.02] text-[10.5px] uppercase tracking-[0.14em] text-white/45">
              {["Graha", "Sign", "Degree", "House", "Nakṣatra", "Pāda", "Dignity", "Retro", "Combust", "Aspects", "D-9"].map((h) => (
                <th key={h} className="px-3 py-2.5 font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {k.grahas.map((g) => (
              <tr key={g.id} className="border-b border-white/[0.05] text-[13px] transition hover:bg-gold-500/[0.04]">
                <td className="px-3 py-2.5">
                  <span className="flex items-center gap-2">
                    <span className="grid h-6 w-6 place-items-center rounded-md border text-[10px] font-bold" style={{ borderColor: `${PLANET_BY_ID[g.id]?.color}55`, color: PLANET_BY_ID[g.id]?.color }}>
                      {g.glyph}
                    </span>
                    <span>
                      <span className="block font-semibold text-white/90">{g.name}</span>
                      <span className="block font-deva text-[10.5px] text-white/40">{g.sanskrit}</span>
                    </span>
                  </span>
                </td>
                <td className="px-3 py-2.5">
                  <span className="text-white/80">{g.signName}</span>
                  <span className="ml-1 font-deva text-[11px] text-gold-400/70">{SIGNS[g.sign]?.sanskrit}</span>
                </td>
                <td className="px-3 py-2.5 tabular text-white/70">{dms(g.degInSign)}</td>
                <td className="px-3 py-2.5 tabular text-white/70">{g.house}</td>
                <td className="px-3 py-2.5 text-white/70">{g.nakshatraName}</td>
                <td className="px-3 py-2.5 tabular text-white/60">{g.pada}</td>
                <td className="px-3 py-2.5">
                  <DignityPill d={g.dignity} score={g.dignityScore} />
                </td>
                <td className="px-3 py-2.5 text-white/70">{g.retro ? <Pill tone="saffron">℞ {Math.abs(g.speed).toFixed(2)}°/d</Pill> : <span className="text-white/30">direct</span>}</td>
                <td className="px-3 py-2.5">{g.combust ? <Pill tone="lotus">burnt {g.combustOrb.toFixed(1)}°</Pill> : <span className="text-white/30">—</span>}</td>
                <td className="px-3 py-2.5 text-[11.5px] text-white/55">
                  {g.aspectsOn.length ? g.aspectsOn.map((a) => `${PLANET_BY_ID[a.by]?.name.slice(0, 2)}${a.kind === "conjunction" ? "" : "✓"}`).join(" ") : "—"}
                </td>
                <td className="px-3 py-2.5 text-[12px] text-white/60">{SIGNS[g.navamsaSign]?.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid gap-2 border-t border-white/8 bg-night-950/40 p-4 text-[11.5px] leading-relaxed text-white/45 sm:grid-cols-3">
        <p><span className="text-gold-400/80">Combust</span> — within {k.grahas.find((g) => g.combust)?.combustOrb.toFixed(1) ?? "≤10"}° of the Sun by each graha's own orb (Budha 12°, Shukra 8°…); a burnt graha gives its results with difficulty.</p>
        <p><span className="text-gold-400/80">Aspects</span> — Vedic dr̥ṣṭi: all grahas take the 7th; Mars adds 4th &amp; 8th, Jupiter 5th &amp; 9th, Saturn 3rd &amp; 10th.</p>
        <p><span className="text-gold-400/80">Retro</span> — apparent backward motion in the sidereal zodiac; a retro graha is treated as strong in Phaladeepa, weak in some KP texts. We show both.</p>
      </div>
    </Card>
  );
}

const DignityPill = ({ d, score }: { d: string; score: number }) => {
  const tone = d === "exalted" || d === "own" ? "jade" : d === "debilitated" || d === "enemy" ? "lotus" : d === "node" ? "muted" : "azure";
  return (
    <span className="inline-flex items-center gap-1.5">
      <Pill tone={tone as "jade"}>{d}</Pill>
      <span className="text-[10.5px] tabular text-white/35">{score}</span>
    </span>
  );
};

function HouseTab({ k }: { k: KundliResult }) {
  const [sel, setSel] = useState(1);
  const h = k.houses[sel - 1];
  return (
    <div className="grid gap-4 lg:grid-cols-12">
      <Card className="p-4 lg:col-span-4">
        <div className="grid grid-cols-3 gap-2">
          {k.houses.map((hh) => (
            <button
              key={hh.n}
              onClick={() => setSel(hh.n)}
              className={cx("rounded-xl border px-2 py-2.5 text-left transition", sel === hh.n ? "border-gold-500/60 bg-gold-500/12" : "border-white/8 bg-night-950/40 hover:border-white/22")}
            >
              <div className="flex items-baseline justify-between">
                <span className="text-[10.5px] font-bold tabular text-gold-400/80">{hh.n}</span>
                {hh.planets.length ? <span className="h-1.5 w-1.5 rounded-full bg-jade-400" /> : null}
              </div>
              <div className="mt-0.5 truncate text-[11.5px] text-white/70">{hh.name}</div>
              <div className="truncate font-deva text-[10.5px] text-white/35">{SIGNS[hh.sign]?.sanskrit}</div>
            </button>
          ))}
        </div>
      </Card>
      <Card className="p-6 lg:col-span-8">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-display text-2xl text-white">
            House {h.n} · {h.name}
          </h3>
          <span className="font-deva text-[13px] text-gold-400/75">{h.sanskrit}</span>
          <Pill tone="azure" className="ml-auto">
            {SIGNS[h.sign]?.name}
          </Pill>
        </div>
        <p className="mt-3 text-[14px] leading-relaxed text-white/65">{h.theme}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/8 bg-night-950/40 p-3.5">
            <Row k="Lord" v={`${PLANET_BY_ID[h.lord]?.name} (${h.lordDignity})`} />
            <Row k="Lord sits in" v={`house ${h.lordHouse}`} mono />
            <Row k="Occupants" v={h.planets.length ? h.planets.map((p) => PLANET_BY_ID[p]?.name).join(", ") : "empty"} />
            <Row k="Aspected by" v={h.aspects.length ? h.aspects.map((p) => PLANET_BY_ID[p]?.name).join(", ") : "none"} />
          </div>
          <div className="rounded-2xl border border-white/8 bg-night-950/40 p-3.5">
            <div className="text-[10.5px] uppercase tracking-[0.14em] text-white/40">classical rules applied</div>
            <ul className="mt-2 space-y-1.5">
              <ListItem>{h.rules}</ListItem>
              {h.planets.length === 0 ? <ListItem>An empty house borrows its results from the lord's placement and the aspects it receives — absence is not a denial.</ListItem> : null}
              {h.aspects.includes("Sa") ? <ListItem>Saturn's aspect here slows, but structure lasts: expect delayed rather than denied results.</ListItem> : null}
              {h.aspects.includes("Ju") ? <ListItem>Jupiter's aspect here protects: the area tends to recover from mismanagement.</ListItem> : null}
              {h.planets.includes("Ra") ? <ListItem>Rāhu here amplifies and destabilises simultaneously — the domain becomes obsession-prone.</ListItem> : null}
              {h.planets.includes("Ke") ? <ListItem>Ketu here subtracts: detachment or shortfall in this area, until the daśā flips it.</ListItem> : null}
            </ul>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button size="sm" variant="outline" to="/services#consult">
            Ask the Acharya about house {h.n} <ArrowRight size={13} />
          </Button>
          {sel < 12 ? (
            <Button size="sm" variant="ghost" onClick={() => setSel(sel + 1)}>
              next house <ArrowRight size={13} />
            </Button>
          ) : null}
        </div>
      </Card>
    </div>
  );
}

function DashaTab({ k }: { k: KundliResult }) {
  const tz = k.input.place.tz;
  const now = Date.now();
  const md = k.dasha.current?.md ?? k.dasha.mahadashas[0];
  const [level, setLevel] = useState<"ad" | "pd">("ad");
  const rows = useMemo(() => (level === "ad" ? md.antardashas : (k.dasha.current?.ad?.pratyantardashas ?? [])), [md, k.dasha.current, level]);
  return (
    <div className="grid gap-4 lg:grid-cols-12">
      <Card className="p-5 lg:col-span-7">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="font-display text-xl text-white">Vimṣottarī mahādaśā</h3>
          <Pill tone="muted">120-year cycle · {k.dasha.nakshatraName}</Pill>
        </div>
        <div className="space-y-2">
          {k.dasha.mahadashas.map((m) => {
            const active = m === md;
            const pct = Math.max(0, Math.min(1, (now - m.start) / (m.end - m.start))) * 100;
            return (
              <div key={m.start + m.lord} className={cx("rounded-2xl border p-3.5 transition", active ? "border-gold-500/55 bg-gold-500/[0.07]" : "border-white/8 bg-night-950/30")}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-lg border text-[11px] font-bold" style={{ borderColor: `${PLANET_BY_ID[m.lord]?.color}66`, color: PLANET_BY_ID[m.lord]?.color }}>
                    {PLANET_BY_ID[m.lord]?.glyph.slice(0, 2)}
                  </span>
                  <span className="font-display text-[16px] text-white">
                    {PLANET_BY_ID[m.lord]?.name}
                    <span className="ml-2 text-[12px] font-normal text-white/45">{yearsToYm(m.years)}</span>
                  </span>
                  {m.isNatalBalance ? <Pill tone="saffron">natal balance</Pill> : null}
                  {active ? <Pill tone="jade">running now</Pill> : null}
                  <span className="ml-auto text-[11.5px] tabular text-white/50">{dashaRange(m.start, m.end, tz)}</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/8">
                  <div className={cx("h-full rounded-full", active ? "bg-gradient-to-r from-gold-400 to-saffron-500" : "bg-white/15")} style={{ width: `${active ? pct : now > m.end ? 100 : 0}%` }} />
                </div>
                {active ? (
                  <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
                    <div className="rounded-xl border border-white/8 bg-night-950/40 p-2.5 text-[12px] leading-relaxed text-white/65">
                      <span className="text-jade-400">When favoured:</span> {DASHA_THEMES[m.lord]?.positive}
                    </div>
                    <div className="rounded-xl border border-white/8 bg-night-950/40 p-2.5 text-[12px] leading-relaxed text-white/65">
                      <span className="text-lotus-400">When strained:</span> {DASHA_THEMES[m.lord]?.challenging}
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </Card>

      <div className="space-y-4 lg:col-span-5">
        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="font-display text-[17px] text-white">
              {level === "ad" ? "Antardaśā inside" : "Pratyantara inside"} {PLANET_BY_ID[md.lord]?.name}
            </h3>
            <Tabs
              size="sm"
              active={level}
              onChange={(v) => setLevel(v as "ad" | "pd")}
              tabs={[
                { id: "ad", label: "AD" },
                { id: "pd", label: "PD" },
              ]}
            />
          </div>
          <ul className="space-y-1.5">
            {rows.map((r) => {
              const active = now >= r.start && now < r.end;
              return (
                <li key={r.start + r.lord} className={cx("flex items-center justify-between gap-3 rounded-xl border px-3 py-2 text-[12.5px]", active ? "border-jade-500/45 bg-jade-500/[0.07] text-white" : "border-white/8 text-white/60")}>
                  <span className="flex items-center gap-2">
                    {active ? <span className="live-dot h-1.5 w-1.5 rounded-full bg-jade-400" /> : null}
                    <span className="font-semibold">{PLANET_BY_ID[r.lord]?.name}</span>
                    <span className="text-white/35">{yearsToYm(r.years)}</span>
                  </span>
                  <span className="tabular text-[11px] text-white/45">{dashaRange(r.start, r.end, tz)}</span>
                </li>
              );
            })}
          </ul>
          {level === "pd" && !k.dasha.current ? <p className="mt-2 text-[11.5px] text-white/40">Pratyantara daśās are shown once you are inside a running antardaśā.</p> : null}
        </Card>

        <Card className="p-5">
          <div className="mb-2.5 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-gold-500">
            <BookOpenCheck size={13} /> Read it yourself
          </div>
          <ul className="space-y-1.5 text-[13px] leading-relaxed text-white/60">
            <ListItem>The balance is what remained of the Moon's nakṣatra lord's period at birth: {k.dasha.balanceYears.toFixed(2)} years of {PLANET_BY_ID[k.dasha.startLord]?.name}.</ListItem>
            <ListItem>Each mahādaśā divides into antardaśās in the same 120-year order, scaled to that lord's length — that is why Saturn's AD inside Venus's MD lasts 3 yrs 4 m.</ListItem>
            <ListItem>Results = lord's nature × house it owns and sits in × dignity here × the daśā of its disposer. The app prints the raw material; interpretation is where a human earns their fee.</ListItem>
          </ul>
          <div className="mt-4 rounded-2xl border border-gold-500/25 bg-gold-500/[0.06] p-3.5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[13px] font-semibold text-white/90">3-year daśā + transit read</div>
                <div className="text-[11.5px] text-white/50">month-by-month for the next 36 months</div>
              </div>
              <Price value={serviceById("kundli-detailed")!.price} mrp={serviceById("kundli-detailed")!.mrp} size="sm" />
            </div>
            <AddButton id="kundli-detailed" className="mt-3" full label="Add to cart" />
          </div>
        </Card>
      </div>
    </div>
  );
}

function YogaTab({ k }: { k: KundliResult }) {
  const good = k.yogas.filter((y) => y.nature !== "inauspicious");
  const bad = k.yogas.filter((y) => y.nature === "inauspicious");
  return (
    <div className="grid gap-4 lg:grid-cols-12">
      <Card className="p-5 lg:col-span-8">
        <SectionHead align="left" className="mb-4" eyebrow="combinations" title={`Yogās present in this chart (${k.yogas.length})`} />
        {k.yogas.length === 0 ? (
          <p className="text-[13.5px] text-white/55">
            None of the 25 checked combinations fires in this chart. That is normal and not a defect — most charts have one or
            two; the ones that have none still do very well under the right daśā.
          </p>
        ) : null}
        <div className="space-y-3">
          {[...good, ...bad].map((y) => (
            <div key={y.id} className={cx("rounded-2xl border p-4", y.nature === "inauspicious" ? "border-lotus-500/30 bg-lotus-500/[0.05]" : "border-jade-500/25 bg-jade-500/[0.05]")}>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-display text-[17px] text-white">{y.name}</span>
                <span className="font-deva text-[12px] text-gold-400/75">{y.sanskrit}</span>
                <Pill tone={y.nature === "auspicious" ? "jade" : y.nature === "mixed" ? "gold" : "lotus"} className="ml-auto capitalize">
                  {y.nature}
                </Pill>
              </div>
              <p className="mt-2 text-[13.5px] leading-relaxed text-white/65">{y.text}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-[11.5px] text-white/45">
                <span>Grahas:</span>
                {y.grahas.map((g) => (
                  <Pill key={g} tone="muted">
                    {PLANET_BY_ID[g]?.name}
                  </Pill>
                ))}
                <span className="ml-2">Houses {y.houses.join(", ")}</span>
                <span className="ml-auto flex items-center gap-1.5">
                  strength
                  <span className="inline-block h-1.5 w-20 overflow-hidden rounded-full bg-white/10 align-middle">
                    <span className="block h-full rounded-full bg-gradient-to-r from-gold-400 to-saffron-500" style={{ width: `${y.strength}%` }} />
                  </span>
                  <span className="tabular">{y.strength}</span>
                </span>
              </div>
              <div className="mt-3 rounded-xl border border-white/8 bg-night-950/45 p-3 text-[12.5px] leading-relaxed text-white/60">
                <span className="text-gold-400">Parihāra:</span> {y.remedy}
              </div>
              {y.services.length ? (
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {y.services.map((sid) => (
                    <AddButton key={sid} id={sid} size="sm" label={`+ ${serviceById(sid)?.title.slice(0, 26)}`} />
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </Card>
      <Card className="p-5 lg:col-span-4">
        <div className="mb-3 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-gold-500">
          <Eye size={13} /> Graha strength ranking
        </div>
        <ul className="space-y-2">
          {k.strengths.map((x) => (
            <li key={x.id} className="flex items-center gap-3 rounded-xl border border-white/8 bg-night-950/35 px-3 py-2">
              <span className="w-4 text-[11px] font-bold tabular text-gold-400/70">{x.rank}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-semibold text-white/85">{x.name}</span>
                <span className="block truncate text-[11px] text-white/45">{x.note}</span>
              </span>
              <span className="font-display text-[15px] tabular text-jade-400">{x.score}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[11.5px] leading-relaxed text-white/40">
          Shadbala-lite: sign dignity (exaltation/own/enemy), navāṁsa dignity, angularity, retrocity and combustion, each on a
          documented scale. Not a substitute for the full 6-factor Shadbala of Bṛhat Parāśara Horā Śāstra.
        </p>
      </Card>
    </div>
  );
}

function DoshaTab({ k }: { k: KundliResult }) {
  const tz = k.input.place.tz;
  const ss = k.doshas.find((d) => d.id === "kaalsarp");
  return (
    <div className="grid gap-4 lg:grid-cols-12">
      <div className="space-y-4 lg:col-span-8">
        {k.doshas.map((d) => (
          <Card key={d.id} className={cx("p-5", d.present && !d.cancelled ? "border-lotus-500/35" : d.cancelled ? "border-jade-500/30" : "")}>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-display text-[18px] text-white">{d.name}</span>
              <span className="font-deva text-[12px] text-gold-400/75">{d.sanskrit}</span>
              <Pill tone={d.present ? (d.cancelled ? "jade" : d.severity === "strong" ? "lotus" : "saffron") : "muted"} className="ml-auto capitalize">
                {d.present ? (d.cancelled ? "cancelled" : `${d.severity}`) : "not present"}
              </Pill>
            </div>
            <p className="mt-2.5 text-[13.5px] leading-relaxed text-white/65">{d.detail}</p>
            {d.cancelReason ? <p className="mt-2 rounded-xl border border-jade-500/25 bg-jade-500/[0.06] p-2.5 text-[12.5px] leading-relaxed text-jade-400">{d.cancelReason}</p> : null}
            <p className="mt-2.5 text-[13px] leading-relaxed text-white/55">
              <span className="text-gold-400">Upāya:</span> {d.remedy}
            </p>
            {d.services.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {d.services.map((sid) => (
                  <Button key={sid} size="sm" variant="outline" to="/services">
                    {serviceById(sid)?.title ?? sid} · {inr(serviceById(sid)?.price ?? 0)}
                  </Button>
                ))}
              </div>
            ) : null}
          </Card>
        ))}
        <Card className="p-5">
          <div className="mb-2 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-gold-500">
            <Heart size={13} /> Saturn over the Moon — Sadhe Satī
          </div>
          <SadheSatiBox k={k} tz={tz} />
        </Card>
      </div>
      <Card className="p-5 lg:col-span-4">
        <div className="mb-2 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-gold-500">
          <Flame size={13} /> Kāla Sarpa audit
        </div>
        <p className="text-[13px] leading-relaxed text-white/60">{ss?.detail}</p>
        <ul className="mt-3 space-y-1.5">
          <ListItem>Sarala (straight), Ajagra / Śāphā (head), Mūṣa (tail), Puṣpaṇḍa (flowers), Śaṅkha / Padma, Kṣetra / Gṛda, Hāla, Dāmadāma, Kuṭa, Nāga, Śṛṅgāṭaka — 12 named varieties, priced separately by most temples.</ListItem>
          <ListItem>Exception: if Jupiter aspects Rāhu or occupies the axis, most authorities treat the binding as much lighter. We check that for you.</ListItem>
        </ul>
        <div className="mt-4 rounded-2xl border border-gold-500/25 bg-gold-500/[0.06] p-3.5">
          <div className="text-[13px] font-semibold text-white/90">Kāla Sarpa &amp; Pitṛ report</div>
          <div className="mt-0.5 text-[11.5px] text-white/50">type, severity, cancellation and the temple-level parihāra</div>
          <div className="mt-2.5 flex items-center justify-between">
            <Price value={serviceById("kaal-sarp-report")!.price} mrp={serviceById("kaal-sarp-report")!.mrp} size="sm" />
            <AddButton id="kaal-sarp-report" size="sm" />
          </div>
        </div>
      </Card>
    </div>
  );
}

function SadheSatiBox({ k, tz }: { k: KundliResult; tz: string }) {
  const st = sadeSati(k.moonSign, Date.now(), k.ayanamsaKind);
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <Pill tone={st.active ? "lotus" : "jade"}>{st.active ? "active now" : "outside the period"}</Pill>
        <span className="text-[13px] text-white/75">{st.title}</span>
      </div>
      <p className="mt-2 text-[13px] leading-relaxed text-white/60">{st.description}</p>
      <div className="mt-3 space-y-1.5">
        {st.windows.map((w) => (
          <Row key={w.label} k={w.label} v={`${fmtDate(w.start, tz)} → ${fmtDate(w.end, tz)}`} mono />
        ))}
      </div>
      {st.nextShift ? (
        <p className="mt-2 text-[12px] text-gold-400/85">Saturn changes sign on {fmtDate(st.nextShift, tz)} — the phase flips then, not before.</p>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-2">
        <Button size="sm" variant="outline" to="/doshas">
          Full Sadhe Satī kit <ArrowRight size={13} />
        </Button>
        <AddButton id="saade-sati-kit" size="sm" label="Add kit ₹349" />
      </div>
    </div>
  );
}

/** remedy services relevant to this chart: dosha-linked first, then generic */
function servicesFor(k: KundliResult) {
  const wanted = new Set(k.doshas.filter((d) => d.present && !d.cancelled).flatMap((d) => d.services));
  const pool = SERVICES.filter((x) => x.category === "puja" || x.category === "gems");
  return [...pool.filter((x) => wanted.has(x.id)), ...pool.filter((x) => !wanted.has(x.id))];
}

function RemedyTab({ k }: { k: KundliResult }) {
  const l = k.luck;
  const items = [
    ["Gemstone (primary)", l.gemstone],
    ["If that is unaffordable", l.altGemstone],
    ["Colour to wear", l.colour],
    ["Lucky number", String(l.number)],
    ["Day for new work", l.day],
    ["Facing direction", l.direction],
    ["Metal", l.metal],
    ["Tree to serve", l.tree],
    ["Deity", l.deity],
  ] as [string, string][];
  return (
    <div className="grid gap-4 lg:grid-cols-12">
      <Card className="p-6 lg:col-span-7">
        <SectionHead align="left" className="mb-4" eyebrow="your prescription" title="What to actually do with this chart" />
        <div className="grid gap-2 sm:grid-cols-2">
          {items.map(([kk, vv]) => (
            <Row key={kk} k={kk} v={<span className="text-gold-400">{vv}</span>} />
          ))}
        </div>
        <p className="mt-4 rounded-2xl border border-white/8 bg-night-950/40 p-3.5 text-[13px] leading-relaxed text-white/60">{l.note}</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/8 bg-night-950/40 p-3.5">
            <div className="mb-1.5 text-[10.5px] uppercase tracking-[0.14em] text-gold-500/85">Japa</div>
            <p className="text-[13px] leading-relaxed text-white/70">{l.mantra}</p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-night-950/40 p-3.5">
            <div className="mb-1.5 text-[10.5px] uppercase tracking-[0.14em] text-gold-500/85">Dāna</div>
            <p className="text-[13px] leading-relaxed text-white/70">{l.charity}</p>
          </div>
        </div>
      </Card>
      <div className="space-y-4 lg:col-span-5">
        <Card className="p-5">
          <div className="mb-3 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-gold-500">
            <IndianRupee size={13} /> Remedies you can order
          </div>
          {servicesFor(k)
            .slice(0, 4)
            .map((s) => (
              <div key={s.id} className="flex items-start justify-between gap-3 border-b border-white/[0.07] py-2.5 last:border-0">
                <div className="min-w-0">
                  <div className="truncate text-[13.5px] font-semibold text-white/85">{s.title}</div>
                  <div className="text-[11.5px] leading-snug text-white/45">{s.delivery}</div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="font-display text-[14px] text-gold-400">{inr(s.price)}</div>
                  <AddButton id={s.id} size="sm" label="Add" className="mt-1" />
                </div>
              </div>
            ))}
        </Card>
        <Card className="p-5">
          <div className="mb-2.5 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-gold-500">
            <Sparkles size={13} /> Free of charge, always
          </div>
          <ul className="space-y-1.5 text-[13px] leading-relaxed text-white/62">
            <ListItem>Saturday oil-lamp and Thursday fast — no vendor needed for either.</ListItem>
            <ListItem>Water in a copper vessel facing east before sunrise; costs nothing, works on the nervous system as much as the graha.</ListItem>
            <ListItem>One honest conversation with the person your chart says you avoid.</ListItem>
          </ul>
        </Card>
      </div>
    </div>
  );
}

function MethodNote() {
  return (
    <div className="mt-10">
      <Divider label="method" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { t: "Ephemeris", d: "astronomy-engine (VSOP87/82D + ELP/MEEUS), apparent geocentric places, converted to sidereal with the Lahiri or KP ayanāṁsa you selected." },
          { t: "Nodes", d: "Mean (Vakya) node — the same choice as most almanac software. True-node charts differ by up to 0°20′ in extreme cases; we say which we used." },
          { t: "Houses", d: "Whole-sign from the exact closed-form Ascendant. If you want Śrī Pāda / Placidus cusps, the paid report includes both." },
          { t: "Self-test", d: "`npm run check:astro` → 43 assertions incl. sunrise-Lagna agreement, MC vs culmination, and today's published Delhi tithi/nakṣatra/yoga/karaṇa." },
        ].map((x) => (
          <div key={x.t} className="glass p-4">
            <div className="text-[12.5px] font-semibold text-gold-400">{x.t}</div>
            <p className="mt-1 text-[12px] leading-relaxed text-white/50">{x.d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───────────────── print sheet (the "PDF" people expect) ───────────────── */

function PrintSheet({ k }: { k: KundliResult }) {
  return (
    <div className="print-sheet hidden bg-white p-8 text-[#14102a]">
      <div className="border-2 border-[#c9922c] p-6">
        <div className="text-center">
          <div className="font-deva text-[22px]">॥ श्री गणेशाय नमः ॥</div>
          <h2 className="mt-1 font-display text-[26px]">जन्मपत्रिका · Janma Kuṇḍlī</h2>
          <div className="text-[12px]">
            {k.input.name} · {k.input.place.name} · {fmtDate(k.utcMs, k.input.place.tz)} {fmtTime(k.utcMs, k.input.place.tz)}
          </div>
        </div>
        <table className="mt-5 w-full border-collapse text-[12px]">
          <thead>
            <tr>
              {["House", "Sign", "Lord", "Occupants", "Aspected by"].map((h) => (
                <th key={h} className="border border-[#c9922c]/60 bg-[#fdf6e4] px-2 py-1 text-left">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {k.houses.map((h) => (
              <tr key={h.n}>
                <td className="border border-[#c9922c]/40 px-2 py-1">{h.n}</td>
                <td className="border border-[#c9922c]/40 px-2 py-1">{SIGNS[h.sign]?.name}</td>
                <td className="border border-[#c9922c]/40 px-2 py-1">{PLANET_BY_ID[h.lord]?.name}</td>
                <td className="border border-[#c9922c]/40 px-2 py-1">{h.planets.map((p) => PLANET_BY_ID[p]?.name).join(", ") || "—"}</td>
                <td className="border border-[#c9922c]/40 px-2 py-1">{h.aspects.map((p) => PLANET_BY_ID[p]?.name).join(", ") || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 text-center text-[10px]">Generated by {BRAND_LOCAL} · {k.ayanamsaKind} ayanāṁsa {k.ayanamsaDeg.toFixed(3)}° · not a substitute for medical, legal or financial advice</div>
      </div>
    </div>
  );
}

const BRAND_LOCAL = "AstroDrishti";

function ChipA({ children, active, onClick }: { children: React.ReactNode; active?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} className={cx("rounded-full border px-3 py-1.5 text-[12px] font-semibold transition", active ? "border-gold-500/60 bg-gold-500/12 text-gold-400" : "border-white/10 text-white/50 hover:border-white/25")}>
      {children}
    </button>
  );
}
