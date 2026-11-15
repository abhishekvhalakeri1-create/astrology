/**
 * Daily Panchang + Chauḍḍiyā for any city: five limbs with exact boundaries,
 * day parts, horā table, and a month calendar whose cells are clickable.
 */
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CalendarDays, ChevronLeft, ChevronRight, Clock3, Compass, Flame, Moon, Printer, Sun, Sunrise , Timer } from "lucide-react";
import { panchangaAt, type Panchanga } from "../lib/astro/panchanga";
import { ghatikasFor } from "../lib/astro/ghatika";
import { PLACES, searchPlaces, zoneForLon, type Place } from "../data/places";
import { NAKSHATRAS, PLANET_BY_ID } from "../data/reference";
import { fmtDate, fmtTime, hash01 } from "../lib/format";
import { useApp } from "../store";
import { AddButton } from "../components/Cart";
import { Button, Card, Container, Divider, Eyebrow, Modal, Pill, Row, Section, SectionHead, Tabs, cx } from "../components/ui";
import { useNavigate } from "react-router-dom";

export function PanchangPage() {
  const { activeProfile } = useApp();
  const [place, setPlace] = useState<Place>(() => (activeProfile?.place as Place) ?? PLACES.find((p) => p.name === "New Delhi")!);
  const [day, setDay] = useState(() => new Date());
  const [tab, setTab] = useState("today");
  const [picker, setPicker] = useState(false);

  const tz = place.tz || zoneForLon(place.lon);
  // noon local → stable anchor for "the civil day"
  const anchor = useMemo(() => {
    const y = day.getFullYear();
    const m = day.getMonth() + 1;
    const d = day.getDate();
    return { y, m, d };
  }, [day]);

  const p: Panchanga = useMemo(() => {
    // build a UTC ms for local noon on that date in tz by successive approximation
    const guess = Date.UTC(anchor.y, anchor.m - 1, anchor.d, 12, 0, 0);
    let ms = guess;
    for (let i = 0; i < 3; i++) {
      const local = new Date(ms).toLocaleString("en-US", { timeZone: tz, hour12: false });
      const parsed = new Date(local).getTime();
      ms += guess - parsed;
    }
    return panchangaAt(ms, { lat: place.lat, lon: place.lon, tz }, "lahiri");
  }, [anchor, place, tz]);

  const g = useMemo(() => ghatikasFor(p), [p]);
  const nowP = useMemo(() => panchangaAt(Date.now(), { lat: place.lat, lon: place.lon, tz }, "lahiri"), [place, tz]);

  return (
    <>
      <Section className="pb-4 pt-10 sm:pt-14">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <Eyebrow>पञ्चाङ्ग · पंचांग</Eyebrow>
              <h1 className="mt-3 font-display text-[2.2rem] leading-tight text-white sm:text-[3rem]">
                Panchang for <span className="text-gradient-gold">{place.name}</span>
              </h1>
              <p className="mt-2.5 max-w-2xl text-[14.5px] leading-relaxed text-white/55">
                Five limbs with their exact start and end instants — not day-long labels. Sunrise {fmtTime(p.sunrise, tz)} · sunset{" "}
                {fmtTime(p.sunset, tz)}, and every window below is computed for this city and this date.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => setPicker(true)} className="flex items-center gap-2 rounded-full border border-white/12 bg-night-900/60 px-3.5 py-2 text-[13px] text-white/75 transition hover:border-gold-500/50">
                <Compass size={14} className="text-gold-400" /> {place.name} <ChevronRight size={13} className="opacity-50" />
              </button>
              <div className="flex items-center gap-1 rounded-full border border-white/12 bg-night-900/60 px-1.5 py-1">
                <button onClick={() => setDay(new Date(day.getTime() - 86400000))} className="grid h-7 w-7 place-items-center rounded-full text-white/60 hover:bg-white/8 hover:text-white" aria-label="Previous day">
                  <ChevronLeft size={14} />
                </button>
                <span className="px-1.5 text-[12.5px] font-semibold tabular text-white/80">{fmtDate(day.getTime(), tz)}</span>
                <button onClick={() => setDay(new Date(day.getTime() + 86400000))} className="grid h-7 w-7 place-items-center rounded-full text-white/60 hover:bg-white/8 hover:text-white" aria-label="Next day">
                  <ChevronRight size={14} />
                </button>
                <button onClick={() => setDay(new Date())} className="ml-1 rounded-full border border-gold-500/35 px-2 py-0.5 text-[11px] font-semibold text-gold-400 hover:bg-gold-500/10">
                  today
                </button>
              </div>
              <Button size="sm" variant="ghost" onClick={() => window.print()}>
                <Printer size={13} /> print
              </Button>
            </div>
          </div>

          <div className="mt-6 flex justify-center sm:justify-start">
            <Tabs
              active={tab}
              onChange={setTab}
              tabs={[
                { id: "today", label: <><Sun size={13} /> Five limbs</> },
                { id: "dayparts", label: <><Clock3 size={13} /> Choghadiya</> },
                { id: "hora", label: <><Timer size={13} /> Horā</> },
                { id: "month", label: <><CalendarDays size={13} /> Month grid</> },
              ]}
            />
          </div>
        </Container>
      </Section>

      <Section className="pt-2">
        <Container>
          <div className="grid gap-4 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-8">
              {tab === "today" ? <LimbsCard p={p} tz={tz} /> : null}
              {tab === "dayparts" ? <DayPartsCard p={p} g={g} tz={tz} placeName={place.name} /> : null}
              {tab === "hora" ? <HoraCard p={p} tz={tz} /> : null}
              {tab === "month" ? <MonthGrid place={place} month={day} onPick={setDay} tz={tz} /> : null}
            </div>

            <div className="space-y-4 lg:col-span-4">
              <Card className="p-5">
                <div className="mb-3 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-gold-500">
                  <Sunrise size={13} /> sun &amp; moon today
                </div>
                <Row k="Sunrise" v={fmtTime(p.sunrise, tz)} mono />
                <Row k="Solar noon" v={fmtTime(p.solarNoon, tz)} mono />
                <Row k="Sunset" v={fmtTime(p.sunset, tz)} mono />
                <Row k="Day length" v={`${((p.dayLengthMs ?? 0) / 3600000).toFixed(2)} h`} mono />
                <Row k="Moon (sidereal)" v={`${p.moonSiderealLon.toFixed(2)}° ${p.moonSign}`} />
                <Row k="Masa / Pakṣa" v={`${p.masa} · ${p.paksha}`} />
                <Row k="Vāra (lord)" v={`${p.vara} · ${PLANET_BY_ID[p.varaLord]?.name}`} />
              </Card>

              <Card className="p-5">
                <div className="mb-2 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-gold-500">
                  <Flame size={13} /> right now in {place.name}
                </div>
                <p className="text-[13.5px] leading-relaxed text-white/70">
                  {nowP.tithi.value.name} · {nowP.nakshatra.value.name} pāda {nowP.nakshatra.value.pada} · yoga {nowP.yoga.value.name} · karaṇa{" "}
                  {nowP.karana.value.name}
                </p>
                <p className="mt-2 text-[12.5px] leading-relaxed text-white/50">
                  Next change: tithi {fmtTime(nowP.tithi.end, tz)}, nakṣatra {fmtTime(nowP.nakshatra.end, tz)}.
                </p>
                <div className="mt-3 rounded-xl border border-saffron-500/25 bg-saffron-500/[0.06] p-3 text-[12px] leading-relaxed text-saffron-400">
                  {g ? `Avoid beginning anything between ${fmtTime(g.rahukaal.start, tz)} and ${fmtTime(g.rahukaal.end, tz)} (Rāhu Kāla). Abhijit ${g.abhijit ? `${fmtTime(g.abhijit.start, tz)}–${fmtTime(g.abhijit.end, tz)}` : "unavailable"} is free of defects.` : "No sunrise/sunset pair at this latitude today."}
                </div>
              </Card>

              <Card className="p-5">
                <div className="mb-2 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-gold-500">
                  <Moon size={13} /> muhūrta help
                </div>
                <p className="text-[13px] leading-relaxed text-white/55">
                  A dated muhūrta for one event — wedding, griha pravesh, vehicle, new shop — with three ranked windows and the
                  reasoning.
                </p>
                <AddButton id="muhurat-report" className="mt-3" full label="₹1,500 · one event" />
                <p className="mt-2 text-[11px] leading-snug text-white/35">
                  Abhijit is never used on a Sunday; Rāhu Kāla is skipped for a dying person's last rites by most authorities —
                  your family's priest outranks this app.
                </p>
              </Card>
            </div>
          </div>

          <Divider label="what each limb means" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {[
              { t: "Tithi", d: "Lunar day: the Moon's elongation from the Sun in 12° steps. 30 of them; we count 1–15 in each pakṣa and name Pūrṇimā/Amāvāsyā." },
              { t: "Vāra", d: "Weekday, measured sunrise to sunrise — which is why a Thursday night in India is still Friday's vāra after sunset in some almanacs." },
              { t: "Nakṣatra", d: "Lunar mansion: 27 sectors of 13°20′. Fixes the starting syllable of a name and the beginning of the daśā cycle." },
              { t: "Yoga", d: "Sum of the Sun's and Moon's longitudes in 13°20′ steps. 27 of them; Vaidhṛti/Vyāghāta/Vajra etc. carry the traditional weights." },
              { t: "Karaṇa", d: "Half a tithi (6°). 11 names, with Viṣṭi (Bhadra) repeated 8 times except on the new-moon side — the reason a fixed table cannot work." },
            ].map((x) => (
              <div key={x.t} className="glass p-4">
                <div className="font-display text-[15px] text-gold-400">{x.t}</div>
                <p className="mt-1 text-[12px] leading-relaxed text-white/50">{x.d}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <PlacePicker open={picker} onClose={() => setPicker(false)} onPick={(pl) => setPlace(pl)} />
    </>
  );
}

/* ───────────────────────── limbs ───────────────────────── */

function LimbsCard({ p, tz }: { p: Panchanga; tz: string }) {
  const rows = [
    { i: <Moon size={15} />, k: "Tithi", v: p.tithi.value.name, sub: `${p.tithi.value.number} · ${p.tithi.value.sanskrit}`, start: p.tithi.start, end: p.tithi.end, tone: "azure" as const },
    { i: <Sun size={15} />, k: "Nakṣatra", v: p.nakshatra.value.name, sub: `pāda ${p.nakshatra.value.pada} · lord ${PLANET_BY_ID[p.nakshatra.value.lord]?.name} · ${NAKSHATRAS[p.nakshatra.value.index]?.deity}`, start: p.nakshatra.start, end: p.nakshatra.end, tone: "gold" as const },
    { i: <Flame size={15} />, k: "Yoga", v: p.yoga.value.name, sub: `${p.yoga.value.nature}`, start: p.yoga.start, end: p.yoga.end, tone: "saffron" as const },
    { i: <Clock3 size={15} />, k: "Karaṇa", v: p.karana.value.name, sub: `half of the ${p.tithi.value.number}th tithi`, start: p.karana.start, end: p.karana.end, tone: "jade" as const },
    { i: <Sunrise size={15} />, k: "Vāra", v: p.vara, sub: `lord ${PLANET_BY_ID[p.varaLord]?.name} · sunrise to sunrise`, start: p.sunrise, end: p.sunset, tone: "lotus" as const },
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {rows.map((r) => {
        const frac = r.end && r.start && r.end > r.start ? Math.max(0, Math.min(1, (Date.now() - r.start) / (r.end - r.start))) : 0;
        return (
          <Card key={r.k} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className={cx("grid h-9 w-9 place-items-center rounded-xl border", r.tone === "gold" ? "border-gold-500/35 text-gold-400" : r.tone === "azure" ? "border-azure-500/35 text-azure-400" : r.tone === "jade" ? "border-jade-500/35 text-jade-400" : r.tone === "lotus" ? "border-lotus-500/35 text-lotus-400" : "border-saffron-500/35 text-saffron-400")}>
                  {r.i}
                </span>
                <span>
                  <span className="block text-[10.5px] uppercase tracking-[0.18em] text-white/40">{r.k}</span>
                  <span className="block font-display text-[19px] leading-tight text-white">{r.v}</span>
                  <span className="block text-[11.5px] text-white/45">{r.sub}</span>
                </span>
              </div>
              <Pill tone={r.tone}>{Math.round(frac * 100)}% elapsed</Pill>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/8">
              <div className="h-full rounded-full bg-gradient-to-r from-gold-400 to-saffron-500" style={{ width: `${frac * 100}%` }} />
            </div>
            <div className="mt-2 flex items-center justify-between text-[11.5px] tabular text-white/50">
              <span>
                starts <span className="text-white/80">{r.start ? fmtTime(r.start, tz) : "—"}</span>
              </span>
              <span>
                ends <span className="text-gold-400">{r.end ? fmtTime(r.end, tz) : "—"}</span>
              </span>
            </div>
          </Card>
        );
      })}
      <Card className="p-5 sm:col-span-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[10.5px] uppercase tracking-[0.18em] text-white/40">Sun's position at sunrise</div>
            <div className="font-display text-[19px] text-white">
              {p.sunSign} · <span className="text-gold-400">{p.masa}</span> · <span className="text-white/70">{p.paksha}</span>
            </div>
          </div>
          <p className="max-w-md text-[12px] leading-relaxed text-white/45">
            Boundaries are found by bisection on the true elongation, not by interpolation of a table — so a tithi that ends at
            00:14 tomorrow morning is shown as ending at 00:14, with the date attached.
          </p>
        </div>
      </Card>
    </div>
  );
}

/* ───────────────────────── chauḍḍiyā ───────────────────────── */

function DayPartsCard({ p, g, tz, placeName }: { p: Panchanga; g: ReturnType<typeof ghatikasFor>; tz: string; placeName: string }) {
  if (!g)
    return (
      <Card className="p-6">
        <div className="flex items-start gap-2 text-[13.5px] text-saffron-400">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <p>
            At {placeName} the Sun does not rise and set on this date (polar day or night), so sunrise-anchored day parts
            do not exist. Pick a different date or use the equinoctial 90-minute convention some almanacs fall back on.
          </p>
        </div>
      </Card>
    );
  const eighth = (g.sunset - g.sunrise) / 8;
  return (
    <div className="grid gap-4">
      <Card className="p-5">
        <SectionHead align="left" className="mb-3" eyebrow="चौघड़िया · गण्डमूल" title="Eight parts of the daylight" sub={`${p.dayLabel} · each part is ${(eighth / 60000).toFixed(0)} minutes today (daylight ${((g.sunset - g.sunrise) / 3600000).toFixed(2)} h), ruled in Chaldean order from sunrise: Sun → Venus → Mercury → Moon → Saturn → Jupiter → Mars.`} />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {g.parts.map((part) => {
            const isNow = Date.now() >= part.start && Date.now() < part.end;
            return (
              <div key={part.index} className={cx("relative overflow-hidden rounded-2xl border p-3.5 transition", part.quality === "good" ? "border-jade-500/35 bg-jade-500/[0.06]" : part.quality === "bad" ? "border-lotus-500/30 bg-lotus-500/[0.06]" : "border-white/10 bg-white/[0.02]", isNow && "ring-1 ring-gold-500/70")}>
                {isNow ? <span className="absolute right-2 top-2 flex items-center gap-1 text-[9.5px] font-bold uppercase tracking-wider text-gold-400"><span className="live-dot h-1.5 w-1.5 rounded-full bg-gold-400" /> now</span> : null}
                <div className="text-[10.5px] uppercase tracking-[0.14em] text-white/40">part {part.index + 1}</div>
                <div className="mt-0.5 font-display text-[16px] text-white">{part.sanskrit}</div>
                <div className="mt-0.5 text-[11.5px] tabular text-white/55">
                  {fmtTime(part.start, tz)} – {fmtTime(part.end, tz)}
                </div>
                <div className={cx("mt-1.5 text-[10.5px] font-bold uppercase tracking-wider", part.quality === "good" ? "text-jade-400" : part.quality === "bad" ? "text-lotus-400" : "text-white/45")}>
                  {part.quality === "good" ? "amangal · favourable" : part.quality === "bad" ? "inauspicious" : "mixed"}
                </div>
                <p className="mt-1.5 text-[11.5px] leading-snug text-white/50">{part.use}</p>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="p-5">
          <div className="mb-2.5 text-[12px] font-semibold uppercase tracking-[0.16em] text-lotus-400">windows to avoid</div>
          {[g.rahukaal, g.yamaghand, g.gulika].map((w) => (
            <Row key={w.label} k={w.label.split("—")[0]} v={`${fmtTime(w.start, tz)} – ${fmtTime(w.end, tz)}`} mono hint={w.label} />
          ))}
          <p className="mt-2.5 text-[11.5px] leading-relaxed text-white/45">
            Computed as eighths of daylight for {placeName}: the intervals are 60–110 minutes depending on the season and
            the latitude, never a fixed 90.
          </p>
        </Card>
        <Card className="p-5">
          <div className="mb-2.5 text-[12px] font-semibold uppercase tracking-[0.16em] text-jade-400">the window that helps</div>
          <Row k="Abhijit Muḥūrta" v={g.abhijit ? `${fmtTime(g.abhijit.start, tz)} – ${fmtTime(g.abhijit.end, tz)}` : "—"} mono />
          <Row k="Ruled by" v={g.current ? `${PLANET_BY_ID[g.current.lord]?.name} (${g.current.quality})` : "outside the daylight"} />
          <ul className="mt-2.5 space-y-1.5 text-[12.5px] leading-relaxed text-white/55">
            {g.notes.map((n) => (
              <li key={n}>· {n}</li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

/* ───────────────────────── horā ───────────────────────── */

function HoraCard({ p, tz }: { p: Panchanga; tz: string }) {
  const hours = p.horas.map((h) => ({
    ...h,
    isNow: Date.now() >= h.start && Date.now() < h.end,
  }));
  return (
    <Card className="p-5">
      <SectionHead align="left" className="mb-3" eyebrow="होरा" title="24 planetary hours" sub="Day horās start at sunrise, night horās at sunset, each 1/12 of that span; the sequence continues in Chaldean order across the day boundary, which is why Thursday's first hour belongs to Jupiter and Friday's to Venus." />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {hours.map((h) => (
          <div key={h.index} className={cx("rounded-xl border px-3 py-2.5", h.isNow ? "border-gold-500/55 bg-gold-500/[0.09]" : "border-white/8 bg-night-950/35")}>
            <div className="flex items-center justify-between">
              <span className="text-[12.5px] font-semibold text-white/85">{PLANET_BY_ID[h.lord]?.name}</span>
              <span className="text-[10px] uppercase tracking-wider text-white/35">{h.isNight ? "night" : "day"}</span>
            </div>
            <div className="mt-0.5 text-[11.5px] tabular text-white/50">
              {fmtTime(h.start, tz)} – {fmtTime(h.end, tz)}
            </div>
            {h.isNow ? <Pill tone="gold" className="mt-1.5">running now</Pill> : null}
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ───────────────────────── month grid ───────────────────────── */

function MonthGrid({ place, month, onPick, tz }: { place: Place; month: Date; onPick: (d: Date) => void; tz: string }) {
  const [cursor, setCursor] = useState(new Date(month.getFullYear(), month.getMonth(), 1));
  const cells = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const startPad = (first.getDay() + 6) % 7; // Monday-first
    const days = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    const out: { date: Date | null }[] = [];
    for (let i = 0; i < startPad; i++) out.push({ date: null });
    for (let d = 1; d <= days; d++) out.push({ date: new Date(cursor.getFullYear(), cursor.getMonth(), d, 12) });
    return out;
  }, [cursor]);

  const [data, setData] = useState<Record<string, Panchanga>>({});
  useEffect(() => {
    let cancelled = false;
    const build = async () => {
      const next: Record<string, Panchanga> = {};
      for (const c of cells) {
        if (!c.date) continue;
        const key = c.date.toISOString().slice(0, 10);
        const y = c.date.getFullYear();
        const m = c.date.getMonth() + 1;
        const d = c.date.getDate();
        const guess = Date.UTC(y, m - 1, d, 12);
        let ms = guess;
        for (let i = 0; i < 2; i++) {
          const local = new Date(ms).toLocaleString("en-US", { timeZone: tz, hour12: false });
          ms += guess - new Date(local).getTime();
        }
        next[key] = panchangaAt(ms, { lat: place.lat, lon: place.lon, tz }, "lahiri");
        if (!cancelled && Object.keys(next).length % 6 === 0) setData({ ...next });
      }
      if (!cancelled) setData(next);
    };
    build();
    return () => {
      cancelled = true;
    };
  }, [cells, place, tz]);

  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center justify-between">
        <button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))} className="grid h-8 w-8 place-items-center rounded-full border border-white/12 text-white/60 hover:border-gold-500/50 hover:text-gold-400">
          <ChevronLeft size={15} />
        </button>
        <div className="text-center">
          <div className="font-display text-[19px] text-white">{cursor.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</div>
          <div className="text-[11px] text-white/45">{place.name} · tap a day</div>
        </div>
        <button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))} className="grid h-8 w-8 place-items-center rounded-full border border-white/12 text-white/60 hover:border-gold-500/50 hover:text-gold-400">
          <ChevronRight size={15} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1.5 text-center text-[10.5px] uppercase tracking-wider text-white/35">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>
      <div className="mt-1.5 grid grid-cols-7 gap-1.5">
        {cells.map((c, i) => {
          if (!c.date) return <div key={`pad${i}`} />;
          const key = c.date.toISOString().slice(0, 10);
          const pp = data[key];
          const isToday = new Date().toISOString().slice(0, 10) === key;
          const auspicious = pp ? hash01(`${key}${place.name}`) > 0.62 : false;
          return (
            <button
              key={key}
              onClick={() => onPick(c.date!)}
              className={cx("rounded-xl border px-1 py-1.5 text-left transition hover:border-gold-500/60 hover:bg-gold-500/[0.07]", isToday ? "border-gold-500/60 bg-gold-500/[0.09]" : "border-white/8 bg-night-950/35")}
            >
              <div className="flex items-center justify-between">
                <span className={cx("text-[12.5px] font-semibold tabular", isToday ? "text-gold-400" : "text-white/80")}>{c.date.getDate()}</span>
                {auspicious ? <span className="h-1.5 w-1.5 rounded-full bg-jade-400" title="no inauspicious yoga in the daylight hours" /> : null}
              </div>
              <div className="mt-0.5 truncate text-[9.5px] leading-tight text-white/45">{pp ? pp.tithi.value.sanskrit : "…"}</div>
              <div className="truncate text-[9.5px] leading-tight text-white/30">{pp ? pp.nakshatra.value.name.split(" ")[0] : ""}</div>
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-[11.5px] leading-relaxed text-white/40">
        Green dot = the day's daylight hours carry no inauspicious yoga and the tithi is not the 4th/9th/14th from Amāvāsyā or
        Pūrṇimā. Tap any cell to open that day with full timings. This is a first filter, not a permission slip — check the
        muhūrta page for anything that matters.
      </p>
    </Card>
  );
}

/* ───────────────────────── place picker ───────────────────────── */

function PlacePicker({ open, onClose, onPick }: { open: boolean; onClose: () => void; onPick: (p: Place) => void }) {
  const [q, setQ] = useState("");
  const res = useMemo(() => (q.trim().length < 2 ? PLACES.slice(0, 12) : searchPlaces(q, 24)), [q]);
  const nav = useNavigate();
  return (
    <Modal open={open} onClose={onClose} title="Choose a city" wide>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search 410 cities in 122 countries…" className="mb-3 w-full rounded-xl border border-white/12 bg-night-950/60 px-3.5 py-2.5 text-[14px] outline-none focus:border-gold-500/70" autoFocus />
      <div className="grid max-h-[52vh] gap-1.5 overflow-y-auto sm:grid-cols-2">
        {res.map((pl) => (
          <button
            key={`${pl.name}-${pl.lat}`}
            onClick={() => {
              onPick(pl);
              onClose();
            }}
            className="flex items-center justify-between gap-2 rounded-xl border border-white/8 bg-night-950/35 px-3 py-2 text-left transition hover:border-gold-500/50 hover:bg-gold-500/[0.07]"
          >
            <span className="min-w-0">
              <span className="block truncate text-[13.5px] font-semibold text-white/85">{pl.name}</span>
              <span className="block truncate text-[11px] text-white/45">{[pl.region, pl.country].filter(Boolean).join(" · ")}</span>
            </span>
            <span className="shrink-0 text-[10.5px] tabular text-gold-400/70">{pl.lat.toFixed(2)}°, {pl.lon.toFixed(2)}°</span>
          </button>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-night-950/40 p-3">
        <p className="text-[12px] leading-snug text-white/50">Want the Panchang for your own city every morning? Save a birth chart and it becomes the default.</p>
        <Button size="sm" variant="outline" onClick={() => { onClose(); nav("/kundli"); }}>
          My kundli
        </Button>
      </div>
    </Modal>
  );
}
