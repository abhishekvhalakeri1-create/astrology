/**
 * Rāshifal — monthly & yearly horoscope generated from live transits and scored
 * per domain, not recycled prose. Pick Sun sign (default) or your Moon sign.
 */
import { useMemo, useState } from "react";
import { ArrowRight, CalendarRange, Compass, Info, Moon, Sun, TrendingUp } from "lucide-react";
import { horoscopeFor, sadeSati, upcomingTransits } from "../lib/astro/transits";
import { NAKSHATRAS, PLANET_BY_ID, SIGNS } from "../data/reference";
import { fmtDate } from "../lib/format";
import { useApp } from "../store";
import { AddButton } from "../components/Cart";
import { Button, Card, Container, Divider, Eyebrow, ListItem, Pill, Reveal, Row, Section, SectionHead, Tabs, cx } from "../components/ui";

type Mode = "month" | "year";

export function HoroscopePage() {
  const { kundli, activeProfile } = useApp();
  const [mode, setMode] = useState<Mode>("month");
  const [useMoon, setUseMoon] = useState(true);
  const [signIdx, setSignIdx] = useState<number>(() => kundli?.moonSign ?? 9);
  const [offset, setOffset] = useState(0); // months (or years) from now

  const now = useMemo(() => new Date(), []);
  const at = useMemo(() => {
    const d = new Date(now.getTime());
    if (mode === "month") d.setUTCMonth(d.getUTCMonth() + offset);
    else d.setUTCFullYear(d.getUTCFullYear() + offset);
    return d.getTime();
  }, [now, mode, offset]);

  const baseSign = kundli && useMoon ? kundli.moonSign : kundli?.sunSign ?? signIdx;
  const sign = kundli && useMoon ? baseSign : kundli ? baseSign : signIdx;
  const periodLabel = new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(at));

  const h = useMemo(() => horoscopeFor(sign, at, mode === "month" ? periodLabel : `${new Date(at).getUTCFullYear()}`), [sign, at, mode, periodLabel]);
  const nextSat = useMemo(() => upcomingTransits("Sa", Date.now(), 4), []);
  const nextJup = useMemo(() => upcomingTransits("Ju", Date.now(), 4), []);

  return (
    <>
      <Section className="pb-4 pt-10 sm:pt-14">
        <Container>
          <div className="grid items-end gap-6 lg:grid-cols-12">
            <div className="lg:col-span-9">
              <Eyebrow>राशिफल · transit-scored</Eyebrow>
              <h1 className="mt-3 font-display text-[2.2rem] leading-tight text-white sm:text-[3rem]">
                Your rāśi, <span className="text-gradient-gold">scored on today's sky</span>
              </h1>
              <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-white/60">
                Every sentence below is produced from where Jupiter, Saturn and the nodes actually sit relative to your sign
                right now — and it changes when they move. No twelve-paragraph template with the sign name swapped.
              </p>
            </div>
            <div className="lg:col-span-3">
              <Card className="p-4">
                <Row k="Saturn now" v={SIGNS[h.transits.find((t) => t.id === "Sa")?.sign ?? 0]?.name} />
                <Row k="Jupiter now" v={SIGNS[h.transits.find((t) => t.id === "Ju")?.sign ?? 0]?.name} />
                <Row k="Rāhu/Ketu axis" v={`${SIGNS[h.transits.find((t) => t.id === "Ra")?.sign ?? 0]?.name.split(" ")[0]}–${SIGNS[h.transits.find((t) => t.id === "Ke")?.sign ?? 0]?.name.split(" ")[0]}`} />
              </Card>
            </div>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Tabs
              active={mode}
              onChange={(v) => {
                setMode(v as Mode);
                setOffset(0);
              }}
              tabs={[
                { id: "month", label: <><CalendarRange size={13} /> This month</> },
                { id: "year", label: <><TrendingUp size={13} /> This year</> },
              ]}
            />
            {activeProfile ? (
              <Tabs
                active={useMoon ? "moon" : "sun"}
                onChange={(v) => setUseMoon(v === "moon")}
                tabs={[
                  { id: "moon", label: <><Moon size={13} /> Chandra ({kundli ? SIGNS[kundli.moonSign]?.name.split(" ")[0] : "—"}</> },
                  { id: "sun", label: <><Sun size={13} /> Sūrya ({kundli ? SIGNS[kundli.sunSign]?.name.split(" ")[0] : "—"})</> },
                ]}
              />
            ) : null}
            <div className="ml-auto flex items-center gap-1 rounded-full border border-white/12 bg-night-900/60 px-1.5 py-1">
              <button onClick={() => setOffset(offset - 1)} className="grid h-7 w-9 place-items-center rounded-full text-[12px] font-semibold text-white/60 hover:bg-white/8 hover:text-white">
                ← prev
              </button>
              <span className="px-2 text-[12.5px] font-semibold text-white/85">{periodLabel}</span>
              <button onClick={() => setOffset(offset + 1)} className="grid h-7 w-9 place-items-center rounded-full text-[12px] font-semibold text-white/60 hover:bg-white/8 hover:text-white">
                next →
              </button>
            </div>
          </div>

          {!activeProfile ? (
            <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-azure-500/25 bg-azure-500/[0.06] p-3.5 text-[13px] leading-relaxed text-azure-400">
              <Info size={15} className="mt-0.5 shrink-0" />
              <p>
                You are reading by Sun sign, which is the newspaper standard and about as precise as a horoscope can get.
                Generate your kundli free and this page switches to your Moon sign — the one Vedic rāshifal is actually written
                for.
                <Button size="sm" variant="outline" to="/kundli" className="ml-3">
                  <Compass size={13} /> Do that now
                </Button>
              </p>
            </div>
          ) : null}
        </Container>
      </Section>

      <Section className="pt-2">
        <Container>
          <div className="grid gap-4 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-8">
              <Card className={cx("relative overflow-hidden p-6", h.overall >= 66 ? "border-jade-500/35" : h.overall <= 42 ? "border-lotus-500/35" : "border-gold-500/30")}>
                <div className="aura pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gold-500/15 blur-3xl" />
                <div className="relative flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.22em] text-white/40">{h.periodLabel}</div>
                    <h2 className="mt-1.5 font-display text-[1.9rem] leading-tight text-white sm:text-[2.4rem]">
                      {h.signName}
                      <span className="ml-2 font-deva text-[15px] text-gold-400/80">{SIGNS[sign]?.sanskrit}</span>
                    </h2>
                    <p className="mt-2 max-w-xl text-[14.5px] leading-relaxed text-white/70">{h.headline}</p>
                  </div>
                  <div className="text-center">
                    <div className={cx("font-display text-[3rem] leading-none", h.overall >= 66 ? "text-jade-400" : h.overall <= 42 ? "text-lotus-400" : "text-gold-400")}>{h.overall}</div>
                    <div className="text-[10.5px] uppercase tracking-[0.18em] text-white/40">overall /100</div>
                  </div>
                </div>

                <div className="mt-5 space-y-2.5">
                  {h.domains.map((d) => (
                    <div key={d.key} className="grid grid-cols-[86px_1fr_auto] items-center gap-3">
                      <span className="text-[12.5px] font-semibold text-white/70">{d.label}</span>
                      <span className="h-2 overflow-hidden rounded-full bg-white/8">
                        <span
                          className={cx("block h-full rounded-full transition-all duration-700", d.score >= 66 ? "bg-gradient-to-r from-jade-500 to-jade-400" : d.score <= 42 ? "bg-gradient-to-r from-lotus-600 to-lotus-400" : "bg-gradient-to-r from-gold-600 to-gold-400")}
                          style={{ width: `${d.score}%` }}
                        />
                      </span>
                      <span className="w-[52px] text-right text-[12px] tabular text-white/55">{d.score}</span>
                      <span className="col-span-3 -mt-1 text-[12px] leading-snug text-white/45">{d.note}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-5 space-y-3">
                  {h.narrative.map((n, i) => (
                    <p key={i} className="text-[14px] leading-relaxed text-white/65">
                      {n}
                    </p>
                  ))}
                </div>
              </Card>

              <Card className="p-5">
                <SectionHead align="left" className="mb-3" eyebrow="why the score moved" title="Transit ledger for this period" />
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[520px] text-left text-[13px]">
                    <thead>
                      <tr className="border-b border-white/10 text-[10.5px] uppercase tracking-[0.14em] text-white/40">
                        <th className="py-2 pr-3">Graha</th>
                        <th className="py-2 pr-3">In</th>
                        <th className="py-2 pr-3">House for you</th>
                        <th className="py-2 pr-3">Motion</th>
                        <th className="py-2">Aspecting you</th>
                      </tr>
                    </thead>
                    <tbody>
                      {h.transits.map((t) => (
                        <tr key={t.id} className="border-b border-white/[0.05]">
                          <td className="py-2 pr-3 font-semibold text-white/85">
                            <span className="inline-flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full" style={{ background: PLANET_BY_ID[t.id]?.color }} />
                              {t.name}
                            </span>
                          </td>
                          <td className="py-2 pr-3 text-white/65">{SIGNS[t.sign]?.name}</td>
                          <td className="py-2 pr-3 tabular text-white/65">{t.house}</td>
                          <td className="py-2 pr-3">{t.retro ? <Pill tone="saffron">retrograde</Pill> : <span className="text-white/35">direct</span>}</td>
                          <td className="py-2">
                            {t.aspectingNative ? (
                              <Pill tone={t.tone === "benefic" ? "jade" : t.tone === "malefic" ? "lotus" : "muted"}>{t.tone === "benefic" ? "supporting" : t.tone === "malefic" ? "pressing" : "present"}</Pill>
                            ) : (
                              <span className="text-white/25">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="mt-3 text-[11.5px] leading-relaxed text-white/40">
                  Houses are counted from your rāśi (Chandra for registered charts, Sūrya otherwise). Scores move as these
                  nine rows move — refresh on the 15th and the numbers differ, which is the whole point.
                </p>
              </Card>
            </div>

            <div className="space-y-4 lg:col-span-4">
              <Card className="p-5">
                <div className="mb-2.5 text-[12px] font-semibold uppercase tracking-[0.16em] text-gold-500">Your kit for {h.periodLabel}</div>
                <Row k="Colour" v={<span className="text-gold-400">{h.lucky.colour}</span>} />
                <Row k="Number" v={h.lucky.number} mono />
                <Row k="Day" v={h.lucky.day} />
                <Row k="Support stone" v={h.lucky.gem} />
                <Divider />
                <ul className="space-y-1.5">
                  {h.remedies.map((r) => (
                    <ListItem key={r}>{r}</ListItem>
                  ))}
                </ul>
                <div className="mt-4 grid gap-2">
                  <AddButton id="gem-advise" full label="Get the stone checked · ₹999" />
                  <Button size="sm" variant="outline" to="/kundli">
                    See my full chart <ArrowRight size={13} />
                  </Button>
                </div>
              </Card>

              {kundli ? (
                <Card className={cx("p-5", h.sadeSati.active ? "border-lotus-500/35" : "")}>
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="text-[12px] font-semibold uppercase tracking-[0.16em] text-gold-500">Sadhe Satī</span>
                    <Pill tone={h.sadeSati.active ? "lotus" : "jade"}>{h.sadeSati.active ? "active" : "clear"}</Pill>
                  </div>
                  <div className="font-display text-[17px] text-white">{h.sadeSati.title}</div>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-white/60">{h.sadeSati.description}</p>
                  <div className="mt-3 space-y-1.5">
                    {h.sadeSati.windows.map((w) => (
                      <Row key={w.label} k={w.label} v={`${fmtDate(w.start)} → ${fmtDate(w.end)}`} mono />
                    ))}
                  </div>
                  <AddButton id="saade-sati-kit" className="mt-3" full label="Survival kit ₹349" />
                </Card>
              ) : null}

              <Card className="p-5">
                <div className="mb-2.5 text-[12px] font-semibold uppercase tracking-[0.16em] text-gold-500">Saturn's next moves</div>
                {nextSat.map((s) => (
                  <Row key={s.at} k={`enters ${SIGNS[s.sign]?.name}`} v={fmtDate(s.at)} mono />
                ))}
                <div className="my-2.5 h-px bg-white/8" />
                <div className="mb-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-jade-400">Jupiter's next moves</div>
                {nextJup.map((s) => (
                  <Row key={s.at} k={`enters ${SIGNS[s.sign]?.name}`} v={fmtDate(s.at)} mono />
                ))}
              </Card>

              {kundli ? (
                <Card className="p-5">
                  <div className="mb-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-gold-500">Your birth nakṣatra</div>
                  <div className="font-display text-[18px] text-white">{NAKSHATRAS[kundli.moonNakshatra]?.name}</div>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-white/55">
                    Ruled by {PLANET_BY_ID[NAKSHATRAS[kundli.moonNakshatra]?.lord]?.name}, deity {NAKSHATRAS[kundli.moonNakshatra]?.deity}.
                    {sadeSati(kundli.moonSign, Date.now()).active ? " Saturn is crossing your Moon now — read the kit." : ""}
                  </p>
                </Card>
              ) : null}
            </div>
          </div>

          <Divider label="all twelve signs" />
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
            {SIGNS.map((sg, i) => {
              const hs = horoscopeFor(i, at, periodLabel);
              return (
                <Reveal key={sg.name} delay={i * 0.02}>
                  <button
                    onClick={() => {
                      setSignIdx(i);
                      if (!activeProfile) setUseMoon(false);
                    }}
                    className={cx("w-full rounded-2xl border p-3.5 text-left transition hover:-translate-y-0.5", !activeProfile && sign === i ? "border-gold-500/60 bg-gold-500/[0.09]" : "border-white/10 bg-night-900/50 hover:border-gold-500/40")}
                  >
                    <div className="flex items-baseline justify-between">
                      <span className="font-deva text-[15px] text-gold-400/85">{sg.sanskrit}</span>
                      <span className={cx("font-display text-[17px]", hs.overall >= 66 ? "text-jade-400" : hs.overall <= 42 ? "text-lotus-400" : "text-white")}>{hs.overall}</span>
                    </div>
                    <div className="mt-1 text-[12.5px] font-semibold text-white/85">{sg.name}</div>
                    <div className="text-[11px] text-white/40">{sg.lord ? PLANET_BY_ID[sg.lord]?.name : ""}</div>
                  </button>
                </Reveal>
              );
            })}
          </div>
          <p className="mt-3 text-center text-[11.5px] text-white/35">
            Scores shown for {periodLabel}, computed from live sidereal positions with Lahiri ayanāṁsa.
          </p>
        </Container>
      </Section>
    </>
  );
}
