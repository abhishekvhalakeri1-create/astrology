/**
 * Nāmakaraṇa — the janma nakṣatra pāda gives four syllables; we generate names
 * that honour them, score them on Chaldean number and family fit, and propose
 * the ceremony date from the Panchang.
 */
import { useMemo, useState } from "react";
import { ArrowRight, Baby, CalendarCheck2, Check, Copy, Heart, Sparkles, Star, Wand2 } from "lucide-react";
import { naamkaran, scoreName, type NameCandidate } from "../lib/astro/naamkaran";
import { computeKundli, type BirthInput } from "../lib/astro/kundli";
import { panchangaAt } from "../lib/astro/panchanga";
import { NAKSHATRAS, PLANET_BY_ID, SIGNS } from "../data/reference";
import { fmtDate, inr } from "../lib/format";
import { serviceById } from "../data/catalog";
import { useApp } from "../store";
import { AddButton } from "../components/Cart";
import { BirthForm, emptyDraft, validateDraft, type Draft } from "../components/BirthForm";
import type { Place } from "../data/places";
import { Button, Card, Container, Divider, Eyebrow, ListItem, Pill, Price, Reveal, Row, Section, SectionHead, Tabs, cx } from "../components/ui";

export function NaamkaranPage() {
  const { activeProfile } = useApp();
  const [draft, setDraft] = useState<Draft>(() => ({ ...emptyDraft(), name: "", dob: new Date().toISOString().slice(0, 10), tob: "07:15", place: (activeProfile?.place as Place) ?? ({ name: "Mumbai", lat: 19.076, lon: 72.8777, tz: "Asia/Kolkata" } as Place) }));
  const [gender, setGender] = useState<"m" | "f" | "any">("any");
  const [surname, setSurname] = useState("");
  const [custom, setCustom] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const err = validateDraft(draft);

  const input: BirthInput = {
    name: draft.name || "Child",
    dob: draft.dob,
    tob: draft.tob,
    place: (draft.place ?? emptyDraft().place) as Place,
    ayanamsa: draft.ayanamsa,
    topocentric: draft.topocentric,
  };
  const k = useMemo(() => {
    try {
      return computeKundli(input);
    } catch {
      return null;
    }
  }, [draft]);

  const res = useMemo(() => (k ? naamkaran(k.moonNakshatra, k.moonPada, { dob: new Date(`${draft.dob}T00:00:00Z`), gender, familySurname: surname || undefined }) : null), [k, gender, surname, draft.dob]);
  const customScore = custom.trim().length > 1 ? scoreName(custom.trim(), { dob: new Date(`${draft.dob}T00:00:00Z`), surname: surname || undefined }) : null;

  // ceremony candidates: 11th, 12th and 21st day, scored on the panchang
  const ceremonies = useMemo(() => {
    if (!k || !draft.place) return [];
    const out: { label: string; ms: number; panch: ReturnType<typeof panchangaAt>; ok: boolean; why: string }[] = [];
    for (const [label, delta] of [["11th day (Ekādaśī ceremony)", 11], ["12th day (nāmakaraṇa, usual)", 12], ["21st day (some families)", 21], ["3 months + pushya nakṣatra", 92]] as [string, number][]) {
      const ms = k.utcMs + delta * 86400000;
      const p = panchangaAt(ms, { lat: draft.place.lat, lon: draft.place.lon, tz: draft.place.tz }, "lahiri");
      const bad = ["Vyatipata", "Vaidhriti", "Ganda", "Vajra"].includes(p.yoga.value.name);
      const tithiGood = [1, 2, 3, 5, 7, 10, 11, 13, 14, 15].includes(p.tithi.value.number);
      const nakGood = ["Rohini", "Mrigashira", "Pushya", "Hasta", "Chitra", "Swati", "Anuradha", "Shravana", "Dhanishtha", "Uttara Phalguni", "Uttara Ashadha", "Uttara Bhadrapada", "Revati"].includes(p.nakshatra.value.name);
      const ok = !bad && tithiGood && nakGood && p.weekday !== "Tuesday" && p.weekday !== "Saturday";
      out.push({
        label,
        ms,
        panch: p,
        ok,
        why: bad ? `${p.yoga.value.name} yoga — avoid` : !tithiGood ? `${p.tithi.value.name} is not preferred for naming` : !nakGood ? `${p.nakshatra.value.name} is not in the naming list` : ok ? `${p.nakshatra.value.name} · ${p.tithi.value.name} · ${p.vara}` : "check locally",
      });
    }
    return out;
  }, [k, draft.place]);

  return (
    <>
      <Section className="pb-4 pt-10 sm:pt-14">
        <Container>
          <div className="grid items-end gap-6 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <Eyebrow>नामकरण · naming by the stars</Eyebrow>
              <h1 className="mt-3 font-display text-[2.2rem] leading-tight text-white sm:text-[3rem]">
                A name that starts <span className="text-gradient-gold">where the Moon was</span>
              </h1>
              <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-white/60">
                The 12th day after birth, the family priest usually asks for the janma nakṣatra and its pāda. That pāda fixes
                one of four starting syllables. Enter the birth details and you get the syllable, a scored shortlist, and
                three ceremony dates checked against the Panchang — then argue about it with the grandmother, as is traditional.
              </p>
            </div>
            <div className="lg:col-span-4">
              <Card className="p-4">
                <div className="mb-2 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-gold-500">
                  <Baby size={13} /> the newborn kit
                </div>
                <Row k="Child Kundli report" v={inr(serviceById("child-kundli")!.price)} mono />
                <Row k="Newborn Bundle (4 items)" v={inr(129900)} mono />
                <AddButton id="bundle-newborn" size="sm" label="Add Newborn Bundle ₹1,299" className="mt-2.5" full />
              </Card>
            </div>
          </div>
        </Container>
      </Section>

      <Section className="pt-2">
        <Container>
          <Card className="p-5 sm:p-6">
            <SectionHead align="left" className="mb-4" eyebrow="birth details" title="When did the child arrive?" />
            <BirthForm draft={draft} setDraft={setDraft} onSubmit={() => {}} compact hideActions />
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div>
                <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">Name for</span>
                <Tabs
                  active={gender}
                  onChange={(v) => setGender(v as typeof gender)}
                  size="sm"
                  tabs={[
                    { id: "m", label: "boy" },
                    { id: "f", label: "girl" },
                    { id: "any", label: "both" },
                  ]}
                />
              </div>
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">Surname (to test the full name)</span>
                <input value={surname} onChange={(e) => setSurname(e.target.value)} placeholder="e.g. Deshpande" className={inp} />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">Or score your own name</span>
                <input value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="e.g. Ananyagauri" className={inp} />
              </label>
            </div>
            {err ? <p className="mt-3 text-[12.5px] text-saffron-400">Still needed: {err}</p> : null}
          </Card>

          {res && k ? (
            <>
              <div className="mt-5 grid gap-4 lg:grid-cols-12">
                <Card className="p-6 lg:col-span-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Pill tone="gold">pāda {res.seed.pada}</Pill>
                    <Pill tone="jade">first syllable: {res.seed.syllable}</Pill>
                  </div>
                  <h2 className="mt-3 font-display text-[1.9rem] leading-tight text-white">
                    {NAKSHATRAS[k.moonNakshatra]?.name}
                    <span className="ml-2 font-deva text-[15px] text-gold-400/80">{NAKSHATRAS[k.moonNakshatra]?.sanskrit}</span>
                  </h2>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-white/60">
                    Moon at {k.moonPada === res.seed.pada ? `pāda ${k.moonPada}` : "—"} of {NAKSHATRAS[k.moonNakshatra]?.name} in{" "}
                    {SIGNS[k.moonSign]?.name}; lord {PLANET_BY_ID[NAKSHATRAS[k.moonNakshatra]?.lord]?.name}, deity{" "}
                    {NAKSHATRAS[k.moonNakshatra]?.deity}.
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {res.all.map((s) => (
                      <div key={s.pada} className={cx("rounded-2xl border px-3 py-2.5", s.pada === res.seed.pada ? "border-gold-500/55 bg-gold-500/[0.09]" : "border-white/8 bg-night-950/35")}>
                        <div className="flex items-center justify-between">
                          <span className="text-[10.5px] uppercase tracking-wider text-white/40">pāda {s.pada}</span>
                          {s.pada === res.seed.pada ? <Star size={11} className="fill-gold-400 text-gold-400" /> : null}
                        </div>
                        <div className="mt-0.5 font-deva text-[19px] text-white">{s.syllable}</div>
                      </div>
                    ))}
                  </div>
                  <Divider />
                  <ul className="space-y-1.5">
                    {res.notes.map((n) => (
                      <ListItem key={n}>{n}</ListItem>
                    ))}
                  </ul>
                </Card>

                <div className="space-y-4 lg:col-span-7">
                  <Card className="p-5">
                    <SectionHead align="left" className="mb-3" eyebrow="shortlist" title={`Names beginning with “${res.seed.syllable}”`} sub="Scored on the pāda rule, your Mulank, and the full name with your surname. This is a real shortlist, not a 500-name dump — add your own above." />
                    <div className="grid gap-2.5 sm:grid-cols-2">
                      {res.candidates.slice(0, 10).map((c, i) => (
                        <Reveal key={c.name} delay={(i % 2) * 0.04}>
                          <NameCard c={c} surname={surname} dob={draft.dob} copied={copied === c.name} onCopy={() => {
                            navigator.clipboard?.writeText(`${c.name}${surname ? ` ${surname}` : ""}`).catch(() => {});
                            setCopied(c.name);
                            setTimeout(() => setCopied(null), 1500);
                          }} />
                        </Reveal>
                      ))}
                      {res.candidates.length === 0 ? (
                        <p className="text-[13px] text-white/55">
                          The syllable {res.seed.syllable} has no curated entry — type your family's suggestion in the box above
                          and we will score it instead. The seed list covers the common names for every pāda; it is deliberately
                          finite.
                        </p>
                      ) : null}
                    </div>
                  </Card>

                  {customScore ? (
                    <Card className="p-5">
                      <div className="mb-2 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-gold-500">
                        <Wand2 size={13} /> your name, scored
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-display text-[22px] text-white">{custom.trim()}</span>
                        <Pill tone={customScore.friendly === false ? "lotus" : "jade"}>root {customScore.root}</Pill>
                        <Pill tone="muted">total {customScore.total}</Pill>
                        {customScore.full ? <Pill tone="azure">full name → {customScore.full}</Pill> : null}
                        <span className="ml-auto flex gap-1">
                          {customScore.letters.map((l, i) => (
                            <span key={i} className="rounded-md border border-white/10 px-1.5 py-0.5 text-[10.5px] text-white/60">
                              {l.letter.toUpperCase()}·{l.value}
                            </span>
                          ))}
                        </span>
                      </div>
                      <p className="mt-2 text-[13px] leading-relaxed text-white/60">{customScore.verdict}</p>
                      <p className="mt-2 text-[12.5px] leading-relaxed text-white/45">
                        Syllable check: this name {customScore.name.toLowerCase().startsWith(res.seed.syllable.toLowerCase().slice(0, 2)) ? <span className="text-jade-400">does</span> : <span className="text-saffron-400">does not</span>} start with{" "}
                        {res.seed.syllable}. Families that keep the nakṣatra rule strictly will prefer a name that does; many
                        today treat it as a courtesy.
                      </p>
                    </Card>
                  ) : null}
                </div>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-12">
                <Card className="p-5 lg:col-span-7">
                  <SectionHead align="left" className="mb-3" eyebrow="ceremony timing" title="Three dates the Panchang allows" sub="Scored at your city for the tithi, nakṣatra and yoga of the day — the 12th day convention, plus options if the family needs a weekend." />
                  <div className="space-y-2">
                    {ceremonies.map((c) => (
                      <div key={c.label} className={cx("flex flex-wrap items-center gap-3 rounded-2xl border p-3.5", c.ok ? "border-jade-500/35 bg-jade-500/[0.05]" : "border-white/8 bg-night-950/35")}>
                        <span className={cx("grid h-9 w-9 shrink-0 place-items-center rounded-xl border", c.ok ? "border-jade-500/45 text-jade-400" : "border-white/12 text-white/35")}>
                          {c.ok ? <Check size={15} /> : <CalendarCheck2 size={15} />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[13.5px] font-semibold text-white/85">{c.label}</span>
                          <span className="block text-[11.5px] text-white/45">{c.why}</span>
                        </span>
                        <span className="text-right">
                          <span className="block font-display text-[15px] text-gold-400">{fmtDate(c.ms, draft.place?.tz)}</span>
                          <span className="block text-[11px] tabular text-white/45">
                            sunrise {fmtDate(c.panch.sunrise ?? 0, draft.place?.tz).split(" ")[0]}
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-2.5 text-[11.5px] leading-relaxed text-white/40">
                    Abhijit muhūrta on the chosen day is the safest hour if the family wants a clock time; avoid Rāhu Kāla
                    ({ceremonies[1] ? `${fmtDate(ceremonies[1].panch.dayParts[0].start, draft.place?.tz).slice(0, 5)}` : "—"} onwards).
                  </p>
                </Card>
                <Card className="p-5 lg:col-span-5">
                  <div className="mb-2 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-gold-500">
                    <Heart size={13} /> the rest of the first year
                  </div>
                  <ul className="space-y-1.5 text-[13px] leading-relaxed text-white/60">
                    <ListItem>Ṣaṣṭhī (day 6), Sūryaśānti (day 11), Annaprāśana (6th month) and Chūḍakarṇa (tonsuring) each have their own muhūrta rules — the child kundli report lists all four with dates.</ListItem>
                    <ListItem>The naming ceremony itself is a 20-minute affair: the paternal aunt whispers the name in the right ear, then everyone says it aloud three times.</ListItem>
                  </ul>
                  <div className="mt-3.5 grid gap-2">
                    <div className="flex items-center justify-between rounded-xl border border-white/8 bg-night-950/40 px-3 py-2.5">
                      <span className="text-[13px] text-white/75">Child Kundli (0–12 yrs)</span>
                      <Price value={serviceById("child-kundli")!.price} mrp={serviceById("child-kundli")!.mrp} size="sm" />
                    </div>
                    <AddButton id="child-kundli" full label="Add ₹299" />
                    <div className="flex items-center justify-between rounded-xl border border-white/8 bg-night-950/40 px-3 py-2.5">
                      <span className="text-[13px] text-white/75">Newborn Bundle · saves 28%</span>
                      <Price value={129900} mrp={179700} size="sm" />
                    </div>
                    <Button size="sm" variant="outline" full to="/services#bundles">
                      See bundles <ArrowRight size={13} />
                    </Button>
                  </div>
                </Card>
              </div>
            </>
          ) : (
            <Card className="mt-5 p-8 text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-gold-500/30 bg-gold-500/[0.07]">
                <Sparkles size={20} className="text-gold-400" />
              </div>
              <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-white/60">
                Enter the birth date and time above — the syllable appears immediately, and the name shortlist with it. No
                account, no email, nothing stored.
              </p>
            </Card>
          )}
        </Container>
      </Section>
    </>
  );
}

function NameCard({ c, surname, dob, copied, onCopy }: { c: NameCandidate; surname: string; dob: string; copied: boolean; onCopy: () => void }) {
  return (
    <div className="group h-full rounded-2xl border border-white/8 bg-night-950/40 p-3.5 transition hover:border-gold-500/45 hover:bg-gold-500/[0.05]">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-display text-[19px] leading-tight text-white">
            {c.name}
            {surname ? <span className="text-white/45"> {surname}</span> : null}
          </div>
          <div className="mt-0.5 text-[11px] uppercase tracking-wider text-white/40">
            {c.kind === "boy" ? "boy" : c.kind === "girl" ? "girl" : "unisex"} · root {c.root} · total {c.total}
          </div>
        </div>
        <div className={cx("grid h-10 w-10 shrink-0 place-items-center rounded-xl border text-[13px] font-bold tabular", c.score >= 80 ? "border-jade-500/45 text-jade-400" : c.score >= 60 ? "border-gold-500/45 text-gold-400" : "border-white/12 text-white/40")}>
          {c.score}
        </div>
      </div>
      <ul className="mt-2 space-y-1">
        {c.why.slice(0, 3).map((w) => (
          <li key={w} className="text-[11.5px] leading-snug text-white/50">
            · {w}
          </li>
        ))}
      </ul>
      <div className="mt-2.5 flex items-center gap-2">
        <button onClick={onCopy} className="flex items-center gap-1.5 rounded-lg border border-white/10 px-2 py-1 text-[11.5px] text-white/60 transition hover:border-gold-500/45 hover:text-gold-400">
          <Copy size={12} /> {copied ? "copied" : "copy"}
        </button>
        {c.matchesMulank ? <Pill tone="jade" className="text-[10.5px]">number fits {dob.slice(-2)}</Pill> : <Pill tone="lotus" className="text-[10.5px]">number clash</Pill>}
      </div>
    </div>
  );
}

const inp =
  "w-full rounded-xl border border-white/12 bg-night-950/60 px-3.5 py-2.5 text-[14px] text-white outline-none transition placeholder:text-white/30 focus:border-gold-500/70 focus:ring-2 focus:ring-gold-500/12";
