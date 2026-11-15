/**
 * Cart drawer + checkout. Everything runs client-side: "payment" produces a
 * receipt and a booking record in localStorage so the flow is complete and
 * testable without a gateway. Swap `placeOrder()` for your API call when
 * wiring Razorpay/Stripe — the shape it returns is already what the UI needs.
 */
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Banknote, CheckCircle2, CreditCard, IndianRupee, QrCode, Receipt, ShieldCheck, ShoppingBag, Tag, Trash2, Wallet, X } from "lucide-react";
import QRCode from "qrcode";
import { BRAND, COUPONS, serviceById } from "../data/catalog";
import { useApp, type Booking } from "../store";
import { fmtDateTime, inr, isIndianMobile, uid } from "../lib/format";
import { Button, Modal, Row, cx } from "./ui";

const UPI_ID = "astrodrishti@icici";

export function CartDrawer() {
  const { cartOpen, setCartOpen, cartView, totals, dispatch } = useApp();
  const [checkout, setCheckout] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [couponMsg, setCouponMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!cartOpen) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && setCartOpen(false);
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [cartOpen, setCartOpen]);

  const applyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    const c = COUPONS[code];
    if (!c) return setCouponMsg(`${code} is not a valid code.`);
    if (totals.subtotal < c.min) return setCouponMsg(`Needs a cart of at least ${inr(c.min)}.`);
    dispatch({ type: "coupon", code });
    setCouponMsg(`${code} applied — ${c.label}`);
  };

  return (
    <>
      <AnimatePresence>
        {cartOpen ? (
          <motion.div className="fixed inset-0 z-[75]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-night-950/85 backdrop-blur-sm" onClick={() => setCartOpen(false)} />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 280, damping: 30 }}
              className="absolute right-0 top-0 flex h-full w-full max-w-[440px] flex-col border-l border-gold-500/25 bg-night-900/97 shadow-[0_0_120px_rgba(0,0,0,0.8)]"
            >
              <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
                <div className="flex items-center gap-2 font-display text-lg text-white">
                  <ShoppingBag size={17} className="text-gold-400" /> Your seva
                  {totals.count ? <span className="text-[12px] text-white/40">({totals.count})</span> : null}
                </div>
                <button onClick={() => setCartOpen(false)} className="rounded-full border border-white/12 p-1.5 text-white/60 hover:text-white" aria-label="Close cart">
                  <X size={15} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4">
                {cartView.length === 0 ? (
                  <div className="mt-16 text-center">
                    <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-gold-500/30 bg-gold-500/[0.06]">
                      <IndianRupee size={22} className="text-gold-400/70" />
                    </div>
                    <p className="mt-4 text-[14px] text-white/55">Nothing here yet.</p>
                    <p className="mx-auto mt-1 max-w-[26ch] text-[12.5px] leading-relaxed text-white/35">
                      Add a report, a puja or a call from Services &amp; Prices — the free tools never ask for money.
                    </p>
                    <Button to="/services" size="sm" variant="outline" className="mt-5" onClick={() => setCartOpen(false)}>
                      Browse services
                    </Button>
                  </div>
                ) : (
                  <ul className="space-y-2.5">
                    {cartView.map((l) => (
                      <li key={l.key} className="group rounded-2xl border border-white/8 bg-white/[0.02] p-3.5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-[14px] font-semibold leading-snug text-white/90">{l.title}</div>
                            <div className="mt-0.5 text-[11.5px] text-white/45">
                              {l.service?.delivery ?? l.plan?.per ?? "digital"}
                              {l.service?.minutes ? ` · ${l.service.minutes} min` : ""}
                            </div>
                            {l.meta ? (
                              <div className="mt-1 flex flex-wrap gap-1">
                                {Object.entries(l.meta).map(([k, v]) => (
                                  <span key={k} className="rounded-md bg-night-950/60 px-1.5 py-0.5 text-[10.5px] text-white/50">
                                    {k}: <span className="text-gold-400/90">{String(v)}</span>
                                  </span>
                                ))}
                              </div>
                            ) : null}
                          </div>
                          <button onClick={() => dispatch({ type: "cart:remove", key: l.key })} className="rounded-lg p-1 text-white/30 transition hover:bg-lotus-500/12 hover:text-lotus-400" aria-label="Remove">
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <div className="mt-2.5 flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <QtyBtn onClick={() => dispatch({ type: "cart:qty", key: l.key, qty: Math.max(1, l.qty - 1) })}>−</QtyBtn>
                            <span className="w-7 text-center text-[13px] font-semibold tabular text-white/80">{l.qty}</span>
                            <QtyBtn onClick={() => dispatch({ type: "cart:qty", key: l.key, qty: l.qty + 1 })}>+</QtyBtn>
                          </div>
                          <div className="text-right">
                            <div className="text-[15px] font-semibold text-gold-400 tabular">{inr(l.lineTotal)}</div>
                            {l.mrp > l.lineTotal ? <div className="text-[11px] text-white/30 line-through tabular">{inr(l.mrp)}</div> : null}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                {cartView.length ? (
                  <div className="mt-5 rounded-2xl border border-white/8 bg-night-950/40 p-3.5">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gold-500/60" />
                        <input
                          value={couponInput}
                          onChange={(e) => {
                            setCouponInput(e.target.value);
                            setCouponMsg(null);
                          }}
                          placeholder="Coupon code"
                          className="w-full rounded-xl border border-white/12 bg-night-900/60 py-2 pl-8 pr-3 text-[13px] uppercase outline-none placeholder:normal-case placeholder:text-white/30 focus:border-gold-500/60"
                        />
                      </div>
                      <Button size="sm" variant="outline" onClick={applyCoupon}>
                        Apply
                      </Button>
                    </div>
                    {couponMsg ? <p className="mt-2 text-[11.5px] text-jade-400">{couponMsg}</p> : null}
                    {state_couponHint()}
                  </div>
                ) : null}
              </div>

              {cartView.length ? (
                <div className="border-t border-white/8 bg-night-950/60 px-5 py-4">
                  <Row k="Subtotal" v={inr(totals.subtotal)} mono />
                  {totals.saved > 0 ? <Row k="You save" v={<span className="text-jade-400">−{inr(totals.saved)}</span>} mono /> : null}
                  <div className="my-2 h-px bg-gradient-to-r from-transparent via-gold-500/30 to-transparent" />
                  <div className="flex items-baseline justify-between">
                    <span className="text-[13px] uppercase tracking-wider text-white/50">Total</span>
                    <span className="font-display text-2xl text-gradient-gold tabular">{inr(totals.total)}</span>
                  </div>
                  <Button full size="lg" className="mt-3.5" onClick={() => setCheckout(true)}>
                    <ShieldCheck size={16} /> Pay securely · {inr(totals.total)}
                  </Button>
                  <p className="mt-2 text-center text-[11px] text-white/35">UPI · cards · net banking — no auto-renewal, cancel anytime</p>
                </div>
              ) : null}
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <CheckoutModal open={checkout} onClose={() => setCheckout(false)} onDone={() => { setCheckout(false); setCartOpen(false); }} />
    </>
  );
}

function state_couponHint() {
  return (
    <p className="mt-2 text-[11px] leading-snug text-white/35">
      Try <span className="text-gold-400/80">KUNDLI50</span> · <span className="text-gold-400/80">SATI10</span> ·{" "}
      <span className="text-gold-400/80">GANESH200</span> · <span className="text-gold-400/80">STUDENT30</span>
    </p>
  );
}

const QtyBtn = ({ children, onClick }: { children: React.ReactNode; onClick: () => void }) => (
  <button onClick={onClick} className="grid h-6 w-6 place-items-center rounded-lg border border-white/12 text-[14px] leading-none text-white/70 transition hover:border-gold-500/50 hover:text-gold-400">
    {children}
  </button>
);

/* ───────────────────────────── checkout ───────────────────────────── */

const DATES = (() => {
  const out: { value: string; label: string }[] = [];
  const d = new Date();
  for (let i = 1; i <= 12; i++) {
    const x = new Date(d.getTime() + i * 86400000);
    out.push({ value: x.toISOString().slice(0, 10), label: x.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }) });
  }
  return out;
})();

const SLOTS = ["07:00–09:00", "09:00–11:00", "11:00–13:00", "14:00–16:00", "16:00–18:00", "19:00–21:00"];

function CheckoutModal({ open, onClose, onDone }: { open: boolean; onClose: () => void; onDone: () => void }) {
  const { cartView, totals, dispatch, activeProfile, state } = useApp();
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [date, setDate] = useState(DATES[1]?.value ?? "");
  const [slot, setSlot] = useState(SLOTS[3]);
  const [mode, setMode] = useState<Booking["mode"]>("call");
  const [question, setQuestion] = useState("");
  const [method, setMethod] = useState<"upi" | "card" | "netbanking" | "cash">("upi");
  const [qr, setQr] = useState<string | null>(null);
  const [ref, setRef] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const needsSlot = cartView.some((l) => l.service?.category === "consultation" || l.service?.category === "puja" || l.service?.category === "matching");

  useEffect(() => {
    if (!open) return;
    setStep(0);
    setRef(null);
  }, [open]);

  useEffect(() => {
    if (method !== "upi" || totals.total <= 0) return setQr(null);
    const amount = (totals.total / 100).toFixed(0);
    const note = encodeURIComponent(cartView.map((l) => l.service?.title ?? l.title).join(", ").slice(0, 60));
    QRCode.toDataURL(`upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(BRAND.name)}&am=${amount}&cu=INR&tn=${note}`, { margin: 1, width: 320, color: { dark: "#0a0820", light: "#f7dc98" } })
      .then(setQr)
      .catch(() => setQr(null));
  }, [method, totals.total, cartView]);

  const placeOrder = () => {
    setBusy(true);
    const id = `AD-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    window.setTimeout(() => {
      for (const l of cartView) {
        dispatch({
          type: "booking:add",
          booking: {
            id: uid("bk"),
            serviceId: l.serviceId,
            title: l.title,
            price: l.lineTotal,
            date: needsSlot ? date : "as soon as possible",
            slot: needsSlot ? slot : method.toUpperCase(),
            mode,
            contact: contact || email,
            question,
            profileId: activeProfile?.id,
            createdAt: Date.now(),
            status: "confirmed",
          },
        });
        if (l.service?.category === "reports" || l.service?.category === "numbers") {
          dispatch({ type: "unlock", id: l.serviceId });
        }
      }
      dispatch({ type: "cart:clear" });
      setRef(id);
      setBusy(false);
      setStep(2);
    }, 900);
  };

  const contactOk = method === "upi" || isIndianMobile(contact) || /.+@.+\..+/.test(contact) || contact.length > 8;

  return (
    <Modal open={open} onClose={onClose} wide title={step === 2 ? "Order confirmed" : "Checkout"}>
      {cartView.length === 0 && step !== 2 ? (
        <p className="text-[14px] text-white/60">Your cart is empty.</p>
      ) : (
        <div>
          <div className="mb-5 flex items-center gap-2">
            {["Details", "Payment", "Receipt"].map((label, i) => (
              <div key={label} className="flex flex-1 items-center gap-2">
                <div className={cx("grid h-6 w-6 shrink-0 place-items-center rounded-full border text-[11px] font-bold", step >= i ? "border-gold-500/70 bg-gold-500/15 text-gold-400" : "border-white/12 text-white/30")}>
                  {step > i ? <CheckCircle2 size={13} /> : i + 1}
                </div>
                <span className={cx("text-[12px] font-semibold", step === i ? "text-white" : "text-white/40")}>{label}</span>
                {i < 2 ? <span className="h-px flex-1 bg-white/10" /> : null}
              </div>
            ))}
          </div>

          {step === 0 ? (
            <div className="grid gap-3.5 sm:grid-cols-2">
              <Field label={mode === "video" ? "WhatsApp / mobile for the video link" : "Mobile number"}>
                <input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="+91 98450 00000" className={inp} />
              </Field>
              <Field label="Email for the report / receipt">
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inp} />
              </Field>
              {needsSlot ? (
                <>
                  <Field label="Preferred date">
                    <select value={date} onChange={(e) => setDate(e.target.value)} className={inp}>
                      {DATES.map((d) => (
                        <option key={d.value} value={d.value}>
                          {d.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Time window (IST)">
                    <select value={slot} onChange={(e) => setSlot(e.target.value)} className={inp}>
                      {SLOTS.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="How shall we meet?">
                    <div className="flex flex-wrap gap-1.5">
                      {(["call", "video", "chat", "temple", "puja-visit"] as const).map((m) => (
                        <Chip key={m} active={mode === m} onClick={() => setMode(m)}>
                          {m === "puja-visit" ? "at my home" : m}
                        </Chip>
                      ))}
                    </div>
                  </Field>
                  <Field label="Chart on file">
                    <div className="rounded-xl border border-white/10 bg-night-950/50 px-3 py-2.5 text-[12.5px] text-white/60">
                      {activeProfile ? `${activeProfile.name || "Unnamed"} · ${activeProfile.dob} ${activeProfile.tob} · ${activeProfile.place.name}` : "No saved chart — the Acharya will ask for details."}
                    </div>
                  </Field>
                </>
              ) : null}
              <div className="sm:col-span-2">
                <Field label="Your question / sankalp details (kept private)">
                  <textarea value={question} onChange={(e) => setQuestion(e.target.value)} rows={3} placeholder="e.g. Marriage timing; son's name is being decided on Sunday; gotra: Kashyap." className={cx(inp, "resize-y")} />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Button full size="lg" onClick={() => setStep(1)} disabled={!contactOk && !email}>
                  Continue to payment
                </Button>
                <p className="mt-2 text-center text-[11px] text-white/35">
                  {contactOk || email ? "We'll confirm the slot within 30 minutes on working days." : "Add a mobile number or an email so we can reach you."}
                </p>
              </div>
            </div>
          ) : step === 1 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">Pay {inr(totals.total)}</div>
                <div className="space-y-1.5">
                  {[
                    { id: "upi", label: "UPI — GPay / PhonePe / Paytm", icon: <QrCode size={15} /> },
                    { id: "card", label: "Card (Razorpay)", icon: <CreditCard size={15} /> },
                    { id: "netbanking", label: "Net banking / RTGS", icon: <Wallet size={15} /> },
                    { id: "cash", label: "Pay at the temple / on delivery", icon: <Banknote size={15} /> },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setMethod(m.id as typeof method)}
                      className={cx("flex w-full items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left text-[13.5px] transition", method === m.id ? "border-gold-500/60 bg-gold-500/10 text-gold-400" : "border-white/10 text-white/60 hover:border-white/25")}
                    >
                      {m.icon} {m.label}
                      {method === m.id ? <CheckCircle2 size={15} className="ml-auto" /> : null}
                    </button>
                  ))}
                </div>
                <div className="mt-3 rounded-xl border border-white/8 bg-night-950/50 p-3">
                  <Row k="Items" v={cartView.length} mono />
                  {state.plan ? <Row k="Membership discount" v={<span className="text-jade-400">−{inr(totals.couponOff)}</span>} mono /> : <Row k="Discounts" v={inr(totals.couponOff)} mono />}
                  <Row k="GST (18%, included)" v={inr(Math.round((totals.total * 18) / 118))} mono />
                  <div className="mt-1.5 flex items-baseline justify-between border-t border-white/8 pt-2">
                    <span className="text-[12px] uppercase tracking-wider text-white/45">Payable</span>
                    <span className="font-display text-xl text-gradient-gold tabular">{inr(totals.total)}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-gold-500/25 bg-gradient-to-b from-gold-500/[0.07] to-transparent p-4 text-center">
                {method === "upi" && qr ? (
                  <>
                    <img src={qr} alt="UPI QR code" className="mx-auto w-40 rounded-xl" />
                    <p className="mt-2 text-[12px] text-white/60">
                      Scan with any UPI app · <span className="text-gold-400">{UPI_ID}</span>
                    </p>
                  </>
                ) : method === "upi" ? (
                  <p className="py-10 text-[13px] text-white/50">QR unavailable offline — pay to {UPI_ID} and tap the button below.</p>
                ) : (
                  <div className="py-6 text-[13px] leading-relaxed text-white/60">
                    {method === "cash" ? (
                      <>No payment now. {BRAND.legal} will collect {inr(totals.total)} at the samagri handover.</>
                    ) : (
                      <>
                        In production this button opens the Razorpay sheet for{" "}
                        <span className="text-gold-400">{inr(totals.total)}</span>. This build keeps the flow honest by
                        recording the order locally instead of faking a gateway.
                      </>
                    )}
                  </div>
                )}
                <Button full size="lg" className="mt-3" onClick={placeOrder} disabled={busy}>
                  {busy ? "Confirming…" : method === "cash" ? "Book it" : `I've paid ${inr(totals.total)}`}
                </Button>
                <button onClick={() => setStep(0)} className="mt-2 text-[12px] text-white/45 hover:text-white/70">
                  ← back to details
                </button>
              </div>
            </div>
          ) : (
            <ReceiptView refId={ref ?? ""} onDone={onDone} />
          )}
        </div>
      )}
    </Modal>
  );
}

function ReceiptView({ refId, onDone }: { refId: string; onDone: () => void }) {
  const { state } = useApp();
  const last = state.bookings[0];
  const items = useMemo(() => state.bookings.slice(0, Math.max(1, state.bookings.length)).filter((b) => b.createdAt > Date.now() - 60000), [state.bookings]);
  return (
    <div className="text-center">
      <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 260, damping: 18 }} className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-jade-500/45 bg-jade-500/10">
        <CheckCircle2 size={28} className="text-jade-400" />
      </motion.div>
      <h3 className="mt-4 font-display text-2xl text-white">Swasti vacanam</h3>
      <p className="mx-auto mt-2 max-w-md text-[13.5px] leading-relaxed text-white/55">
        Order <span className="font-semibold text-gold-400">{refId}</span> is recorded
        {last ? <> for <span className="text-white/85">{last.date}</span>{last.slot ? <> · {last.slot}</> : null}</> : null}. A
        confirmation with the priest's / Acharya's number arrives on the contact you gave; the report unlocks instantly in your
        browser.
      </p>
      <div className="mt-5 rounded-2xl border border-white/10 bg-night-950/50 p-4 text-left">
        <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-500">
          <Receipt size={13} /> this order
        </div>
        {items.map((b) => (
          <Row key={b.id} k={b.title} v={`${inr(b.price)}`} mono />
        ))}
        <div className="mt-2 border-t border-white/8 pt-2 text-[11.5px] text-white/45">
          {BRAND.legal} · GSTIN {BRAND.gstin} · {fmtDateTime(Date.now())} IST
        </div>
      </div>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <Button onClick={onDone}>Done</Button>
        <Button variant="outline" to="/services" onClick={onDone}>
          Add a puja
        </Button>
      </div>
      <p className="mt-3 text-[11px] text-white/30">
        Nothing was charged in this demo build. Swap <span className="font-mono text-white/45">placeOrder()</span> in Cart.tsx for your gateway call.
      </p>
    </div>
  );
}

/* ─────────────────────────── small shared bits ─────────────────────────── */

export const inp =
  "w-full rounded-xl border border-white/12 bg-night-950/60 px-3 py-2.5 text-[13.5px] text-white outline-none transition placeholder:text-white/30 focus:border-gold-500/70 focus:ring-2 focus:ring-gold-500/12";

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">{label}</span>
      {children}
    </label>
  );
}

export function Chip({ children, active, onClick }: { children: React.ReactNode; active?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} className={cx("rounded-full border px-3 py-1.5 text-[12.5px] font-medium capitalize transition", active ? "border-gold-500/60 bg-gold-500/12 text-gold-400" : "border-white/10 text-white/50 hover:border-white/25 hover:text-white/80")}>
      {children}
    </button>
  );
}

/** Add-to-cart button wired to the catalogue; used by every service card. */
export function AddButton({ id, size = "sm", className, label = "Add to cart", meta, full }: { id: string; size?: "sm" | "md"; className?: string; label?: string; meta?: Record<string, string | number>; full?: boolean }) {
  const { addService, cartView } = useApp();
  const inCart = cartView.find((l) => l.serviceId === id);
  const s = serviceById(id);
  if (!s) return null;
  return (
    <Button size={size} onClick={() => addService(id, { meta })} className={className} full={full} variant={inCart ? "outline" : "gold"}>
      {inCart ? <span className="flex items-center gap-1.5"><CheckCircle2 size={14} /> in cart · {inCart.qty}</span> : <span className="flex items-center gap-1.5"><ShoppingBag size={14} /> {label}</span>}
    </Button>
  );
}

export function MiniCartNote() {
  const { totals, openCart } = useApp();
  if (!totals.count) return null;
  return (
    <div className="fixed bottom-4 left-1/2 z-[60] -translate-x-1/2 sm:hidden">
      <button onClick={openCart} className="flex items-center gap-2 rounded-full bg-gradient-to-r from-gold-400 to-gold-600 px-4 py-2.5 text-[13px] font-semibold text-night-950 shadow-[0_12px_40px_-10px_rgba(232,182,76,0.8)]">
        <ShoppingBag size={14} /> {totals.count} · {inr(totals.total)}
      </button>
    </div>
  );
}
