/**
 * The Acharya: profile, live-ish availability grid, and a booking flow that
 * writes into the same cart/checkout as everything else.
 */
import { useMemo, useState } from "react";
import { ArrowRight, BadgeCheck, CalendarCheck2, Check, Clock3, Globe2, IndianRupee, MessageSquare, Phone, PlayCircle, ShieldCheck, Sparkles, Star, Video, Users } from "lucide-react";
import { BRAND, SERVICES } from "../data/catalog";
import { fmtDate, hash01, inr } from "../lib/format";
import { useApp } from "../store";
import { AddButton } from "../components/Cart";
import { Button, Card, Container, Divider, Eyebrow, ListItem, Modal, Pill, Price, Row, Section, SectionHead, Stars, cx } from "../components/ui";

const SLOTS = ["07:00–07:15", "07:30–08:00", "09:00–09:30", "10:00–10:30", "11:00–11:30", "12:00–12:30", "15:00–15:30", "16:00–16:30", "18:00–18:30", "19:00–19:30", "20:00–20:30", "21:00–21:30"];

type SlotState = "free" | "held" | "busy";

export function AcharyaPage() {
  const [day, setDay] = useState(0);
  const [picked, setPicked] = useState<{ day: number; slot: string } | null>(null);
  const [detail, setDetail] = useState(false);
  const consults = SERVICES.filter((s) => s.category === "consultation");
  const chosen = consults.find((s) => s.id === "consult-30")!;

  const days = useMemo(() => {
    const out: { date: Date; label: string }[] = [];
    const now = new Date();
    for (let i = 0; i < 10; i++) {
      const d = new Date(now.getTime() + i * 86400000);
      out.push({ date: d, label: i === 0 ? "today" : i === 1 ? "tomorrow" : d.toLocaleDateString("en-IN", { weekday: "short" }) });
    }
    return out;
  }, []);

  const stateOf = (d: number, slot: string): SlotState => {
    const h = hash01(`${days[d].date.toISOString().slice(0, 10)}|${slot}`);
    const weekday = days[d].date.getUTCDay();
    if (weekday === 0 && h > 0.55) return "busy"; // Sundays mostly full
    if (h > 0.72) return "busy";
    if (h > 0.6) return "held";
    return "free";
  };

  const freeCount = (d: number) => SLOTS.filter((s) => stateOf(d, s) === "free").length;

  return (
    <>
      <Section className="pb-4 pt-10 sm:pt-14">
        <Container>
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <Eyebrow>आचार्य · the reader</Eyebrow>
              <h1 className="mt-3 font-display text-[2.2rem] leading-tight text-white sm:text-[3rem]">
                {BRAND.acharya.name}
              </h1>
              <p className="mt-2 text-[14px] leading-relaxed text-white/60">{BRAND.acharya.credential}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1.5">
                  <Stars n={BRAND.acharya.rating} />
                  <span className="text-[12.5px] text-white/55">
                    {BRAND.acharya.rating} · {BRAND.acharya.reviews.toLocaleString("en-IN")} reviews
                  </span>
                </span>
                <Pill tone="jade">
                  <span className="live-dot h-1.5 w-1.5 rounded-full bg-jade-400" /> online now
                </Pill>
                <Pill tone="muted">
                  <Globe2 size={11} /> {BRAND.acharya.languages}
                </Pill>
                <Pill tone="muted">
                  <Users size={11} /> {consults.length} formats
                </Pill>
              </div>
              <p className="mt-4 max-w-2xl text-[14.5px] leading-relaxed text-white/62">{BRAND.acharya.line}</p>
              <div className="mt-5 flex flex-wrap gap-2.5">
                <Button size="lg" onClick={() => setDetail(true)}>
                  <CalendarCheck2 size={16} /> Book a slot
                </Button>
                <AddButton id="consult-30" size="md" label="30-min call ₹1,499" />
                <Button size="lg" variant="outline" onClick={() => setDetail(true)}>
                  <MessageSquare size={15} /> Chat instead · {inr(consults.find((c) => c.id === "consult-chat")!.price)}/min
                </Button>
              </div>
            </div>

            <div className="lg:col-span-5">
              <Card className="overflow-hidden p-0">
                <div className="relative">
                  <img src={BRAND.acharya.photo} alt={BRAND.acharya.name} className="aspect-[4/3] w-full object-cover object-top" />
                  <div className="absolute inset-0 bg-gradient-to-t from-night-950 via-transparent to-transparent" />
                  <button className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full border border-white/20 bg-night-950/70 px-3 py-1.5 text-[12px] font-semibold text-white/85 backdrop-blur transition hover:border-gold-500/60 hover:text-gold-400">
                    <PlayCircle size={14} /> 90-second introduction
                  </button>
                  <div className="absolute right-3 top-3 grid h-11 w-11 place-items-center rounded-full border border-gold-500/50 bg-night-950/70 text-gold-400">
                    <BadgeCheck size={20} />
                  </div>
                </div>
                <div className="p-5">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {[
                      { l: "sessions", v: "18,400+" },
                      { l: "languages", v: "4" },
                      { l: "avg. reply", v: "3 min" },
                    ].map((x) => (
                      <div key={x.l} className="rounded-xl border border-white/8 bg-night-950/40 px-2 py-2">
                        <div className="font-display text-[16px] text-gold-400">{x.v}</div>
                        <div className="text-[10px] uppercase tracking-wider text-white/40">{x.l}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </Container>
      </Section>

      {/* ── availability ── */}
      <Section id="availability" className="pt-2">
        <Container>
          <SectionHead eyebrow="next 10 days" title="Pick a window" sub="Slots shown in IST. Everything is held for 10 minutes while you complete the cart — that hold is local to this browser, not a fake countdown." />
          <Card className="p-5">
            <div className="no-scrollbar -mx-1 mb-4 flex gap-1.5 overflow-x-auto px-1">
              {days.map((d, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setDay(i);
                    setPicked(null);
                  }}
                  className={cx("shrink-0 rounded-2xl border px-3.5 py-2 text-center transition", day === i ? "border-gold-500/60 bg-gold-500/12 text-gold-400" : "border-white/10 text-white/60 hover:border-white/25")}
                >
                  <div className="text-[10.5px] uppercase tracking-wider opacity-70">{d.label}</div>
                  <div className="text-[13px] font-semibold tabular">{d.date.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</div>
                  <div className="mt-0.5 text-[10px] opacity-60">{freeCount(i)} free</div>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {SLOTS.map((s) => {
                const st = stateOf(day, s);
                const isPicked = picked?.day === day && picked?.slot === s;
                return (
                  <button
                    key={s}
                    disabled={st === "busy"}
                    onClick={() => setPicked({ day, slot: s })}
                    className={cx(
                      "rounded-xl border px-3 py-2.5 text-left transition",
                      st === "busy" && "cursor-not-allowed border-white/6 bg-white/[0.01] text-white/22",
                      st === "held" && "border-saffron-500/30 bg-saffron-500/[0.05] text-saffron-400 hover:border-saffron-500/60",
                      st === "free" && !isPicked && "border-jade-500/30 bg-jade-500/[0.05] text-jade-400 hover:border-jade-500/60",
                      isPicked && "border-gold-500/70 bg-gold-500/15 text-gold-400 ring-1 ring-gold-500/40",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-semibold tabular">
                        <Clock3 size={12} className="mr-1 inline opacity-70" />
                        {s}
                      </span>
                      {isPicked ? <Check size={13} /> : null}
                    </div>
                    <div className="mt-0.5 text-[10.5px] uppercase tracking-wider opacity-70">
                      {st === "free" ? "available" : st === "held" ? "on hold by someone" : "fully booked"}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/8 pt-4">
              <p className="text-[12.5px] text-white/50">
                {picked ? (
                  <>
                    Selected <span className="text-gold-400">{picked.slot}</span> on{" "}
                    <span className="text-gold-400">{fmtDate(days[picked.day].date.getTime())}</span> · {chosen.title}
                  </>
                ) : (
                  "Choose a slot to attach it to the booking."
                )}
              </p>
              <Button disabled={!picked} onClick={() => setDetail(true)}>
                Continue · {inr(chosen.price)} <ArrowRight size={14} />
              </Button>
            </div>
          </Card>

          <Divider />
          <div className="grid gap-4 lg:grid-cols-12">
            <Card className="p-5 lg:col-span-7">
              <SectionHead align="left" className="mb-3" eyebrow="formats & prices" title="Four ways to ask" />
              <div className="space-y-2">
                {consults.map((s) => (
                  <div key={s.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/8 bg-night-950/35 p-3.5">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-gold-500/25 text-gold-400">
                      {s.id.includes("chat") ? <MessageSquare size={15} /> : s.id.includes("couple") ? <Users size={15} /> : s.id.includes("async") ? <Sparkles size={15} /> : s.minutes && s.minutes >= 60 ? <Video size={15} /> : <Phone size={15} />}
                    </span>
                    <span className="min-w-[160px] flex-1">
                      <span className="block text-[14px] font-semibold text-white/88">{s.title}</span>
                      <span className="block text-[11.5px] text-white/45">{s.delivery}</span>
                    </span>
                    <Price value={s.price} mrp={s.mrp} size="sm" />
                    <AddButton id={s.id} size="sm" />
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[11.5px] leading-relaxed text-white/40">
                Every format includes a written summary. Sessions are recorded only if you ask for it — say so in the booking
                note.
              </p>
            </Card>

            <Card className="p-5 lg:col-span-5">
              <div className="mb-2 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-gold-500">
                <ShieldCheck size={13} /> ground rules
              </div>
              <ul className="space-y-1.5">
                <ListItem>Two questions per 15 minutes; three per 30. Depth beats breadth — a real reading of one thing is worth more than a scan of eight.</ListItem>
                <ListItem>No medical diagnoses, no legal outcomes, no “the person will come back in 11 days”. Those are refused, politely.</ListItem>
                <ListItem>If the chart genuinely cannot answer, you are told that and not sold a puja.</ListItem>
                <ListItem>Reschedule freely up to 2 hours before; missed slots from our side are refunded same day.</ListItem>
              </ul>
              <div className="mt-4 rounded-2xl border border-jade-500/25 bg-jade-500/[0.06] p-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-semibold text-white/85">Not a paid question at all?</span>
                  <Pill tone="jade">free</Pill>
                </div>
                <p className="mt-1 text-[12.5px] leading-relaxed text-white/60">
                  The daily Panchang, your kundli, Milan, Sadhe Satī dates and Numerology are all free tools on this site.
                </p>
              </div>
              <div className="mt-3 flex items-center gap-2 text-[11.5px] text-white/40">
                <Star size={12} className="fill-gold-400 text-gold-400" /> {BRAND.acharya.rating} average across{" "}
                {BRAND.acharya.reviews.toLocaleString("en-IN")} verified bookings since {BRAND.established}
              </div>
            </Card>
          </div>
        </Container>
      </Section>

      <BookingModal open={detail} onClose={() => setDetail(false)} picked={picked} dateLabel={picked ? fmtDate(days[picked.day].date.getTime()) : ""} serviceId={chosen.id} />
    </>
  );
}

function BookingModal({ open, onClose, picked, dateLabel, serviceId }: { open: boolean; onClose: () => void; picked: { day: number; slot: string } | null; dateLabel: string; serviceId: string }) {
  const { dispatch, addService, activeProfile, state } = useApp();
  const [contact, setContact] = useState("");
  const [question, setQuestion] = useState("");
  const [mode, setMode] = useState<"call" | "video" | "chat">("call");
  const svc = SERVICES.find((s) => s.id === serviceId)!;
  if (!open) return null;
  return (
    <Modal open={open} onClose={onClose} title={`Confirm with ${BRAND.acharya.name.split(" ").slice(-1)}`} wide>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-gold-500/25 bg-gold-500/[0.05] p-4">
          <Row k="when" v={picked ? `${dateLabel} · ${picked.slot} IST` : "—"} />
          <Row k="format" v={mode} />
          <Row k="with" v={BRAND.acharya.name} />
          <Row k="languages" v={BRAND.acharya.languages} />
          <div className="mt-3 flex items-baseline justify-between border-t border-white/10 pt-3">
            <span className="text-[12px] uppercase tracking-wider text-white/45">price</span>
            <Price value={svc.price} mrp={svc.mrp} />
          </div>
        </div>
        <div className="space-y-2.5">
          <div className="flex gap-1.5">
            {(["call", "video", "chat"] as const).map((m) => (
              <button key={m} onClick={() => setMode(m)} className={cx("flex-1 rounded-xl border px-3 py-2 text-[12.5px] font-semibold capitalize transition", mode === m ? "border-gold-500/60 bg-gold-500/12 text-gold-400" : "border-white/10 text-white/50 hover:border-white/25")}>
                {m}
              </button>
            ))}
          </div>
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">Mobile / WhatsApp</span>
            <input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="+91…" className="w-full rounded-xl border border-white/12 bg-night-950/60 px-3 py-2.5 text-[13.5px] outline-none focus:border-gold-500/70" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">What do you want to ask?</span>
            <textarea rows={4} value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Marriage timing, and whether the Mars period is why the last two years went like this." className="w-full resize-y rounded-xl border border-white/12 bg-night-950/60 px-3 py-2.5 text-[13.5px] outline-none focus:border-gold-500/70" />
          </label>
          <div className="rounded-xl border border-white/8 bg-night-950/40 p-3 text-[12px] leading-relaxed text-white/55">
            {activeProfile ? (
              <>Chart attached: <span className="text-gold-400">{activeProfile.name || "unnamed"}</span> · {activeProfile.dob} {activeProfile.tob} · {activeProfile.place.name}. {state.profiles.length > 1 ? `${state.profiles.length} charts on this device — switch in My Kundlis.` : ""}</>
            ) : (
              <>No saved chart yet — add one on the Kundli page and it will be attached automatically.</>
            )}
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-sm text-[11.5px] leading-relaxed text-white/40">
          Adding this puts the {inr(svc.price)} session in your cart with the slot as a note. You confirm the payment yourself
          at checkout — nothing is charged by this button.
        </p>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onClose}>
            not now
          </Button>
          <Button
            size="lg"
            onClick={() => {
              if (picked) {
                dispatch({
                  type: "booking:add",
                  booking: {
                    id: `hold-${Date.now()}`,
                    serviceId,
                    title: svc.title,
                    price: svc.price,
                    date: dateLabel,
                    slot: picked.slot,
                    mode,
                    contact,
                    question,
                    profileId: activeProfile?.id,
                    createdAt: Date.now(),
                    status: "requested",
                  },
                });
              }
              addService(serviceId, { meta: { slot: picked?.slot ?? "next free", date: dateLabel, mode } });
              onClose();
            }}
          >
            <IndianRupee size={15} /> Hold slot &amp; go to cart
          </Button>
        </div>
      </div>
    </Modal>
  );
}
