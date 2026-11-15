/**
 * UI primitives — the visual grammar of AstroDrishti.
 * Dark "night temple" palette: gold leaf, saffron, lotus, on deep indigo.
 */
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Sparkles, Star, X } from "lucide-react";
import { inr } from "../lib/format";

export const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(" ");

/**
 * Fire once when the node scrolls into view. Written by hand instead of using
 * framer-motion's useInView so that a missing IntersectionObserver (old Safari,
 * some webviews, jsdom) reveals the content instead of throwing inside an effect.
 */
function useInViewOnce(ref: React.RefObject<Element | null>): boolean {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    if (typeof IntersectionObserver === "undefined") {
      setSeen(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setSeen(true);
          io.disconnect();
        }
      },
      { rootMargin: "-60px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, seen]);
  return seen;
}

/* ───────────────────────────── layout ───────────────────────────── */

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx("mx-auto w-full max-w-[1220px] px-4 sm:px-6 lg:px-8", className)}>{children}</div>;
}

export function Section({
  id,
  children,
  className,
  tint,
}: {
  id?: string;
  children: ReactNode;
  className?: string;
  tint?: "none" | "gold" | "lotus" | "jade";
}) {
  const bg =
    tint === "gold"
      ? "bg-[radial-gradient(60%_50%_at_50%_0%,rgba(232,182,76,0.10),transparent_70%)]"
      : tint === "lotus"
        ? "bg-[radial-gradient(60%_50%_at_50%_0%,rgba(244,86,140,0.10),transparent_70%)]"
        : tint === "jade"
          ? "bg-[radial-gradient(60%_50%_at_50%_0%,rgba(47,191,155,0.10),transparent_70%)]"
          : "";
  return (
    <section id={id} className={cx("relative py-14 sm:py-20", bg, className)}>
      {children}
    </section>
  );
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cx("flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-gold-500", className)}>
      <span className="h-px w-6 bg-gradient-to-r from-transparent to-gold-500/80" />
      {children}
      <span className="h-px w-6 bg-gradient-to-l from-transparent to-gold-500/80" />
    </div>
  );
}

export function SectionHead({
  eyebrow,
  title,
  sanskrit,
  sub,
  align = "center",
  action,
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  sanskrit?: string;
  sub?: ReactNode;
  align?: "center" | "left";
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("flex flex-col gap-3", align === "center" ? "items-center text-center" : "items-start", className ?? "mb-9")}>
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h2 className="font-display text-3xl leading-tight text-white sm:text-[2.6rem]">
        {title}
        {sanskrit ? <span className="ml-3 align-middle font-deva text-base text-gold-400/80">{sanskrit}</span> : null}
      </h2>
      {sub ? <p className={cx("max-w-2xl text-[15px] leading-relaxed text-white/60", align === "center" && "mx-auto")}>{sub}</p> : null}
      {action}
    </div>
  );
}

export const Card = ({
  children,
  className,
  glass = true,
  hover = false,
}: {
  children: ReactNode;
  className?: string;
  glass?: boolean;
  hover?: boolean;
}) => (
  <div className={cx(glass && "glass", hover && "hover-lift", "rounded-2xl", className)}>{children}</div>
);

/* ───────────────────────────── buttons ───────────────────────────── */

type BtnProps = {
  children: ReactNode;
  onClick?: () => void;
  to?: string;
  variant?: "gold" | "ghost" | "outline" | "saffron" | "danger";
  size?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
  full?: boolean;
  type?: "button" | "submit";
};

export function Button({ children, onClick, to, variant = "gold", size = "md", className, disabled, full, type = "button" }: BtnProps) {
  const base =
    "group relative inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-wide transition-all duration-200 select-none disabled:opacity-45 disabled:pointer-events-none";
  const sizes = { sm: "px-3.5 py-1.5 text-[13px]", md: "px-5 py-2.5 text-sm", lg: "px-7 py-3.5 text-[15px]" }[size];
  const variants = {
    gold: "text-night-950 bg-gradient-to-br from-gold-400 via-gold-500 to-gold-600 shadow-[0_10px_30px_-12px_rgba(232,182,76,0.75)] hover:shadow-[0_14px_40px_-10px_rgba(232,182,76,0.95)] hover:-translate-y-0.5",
    saffron: "text-night-950 bg-gradient-to-br from-saffron-400 to-saffron-600 shadow-[0_10px_30px_-12px_rgba(255,138,61,0.8)] hover:-translate-y-0.5",
    outline: "text-gold-400 border border-gold-500/45 bg-gold-500/[0.06] hover:bg-gold-500/15 hover:border-gold-400/70",
    ghost: "text-white/75 hover:text-white hover:bg-white/[0.07]",
    danger: "text-lotus-400 border border-lotus-500/40 hover:bg-lotus-500/12",
  }[variant];
  const cls = cx(base, sizes, variants, full && "w-full", className);
  if (to)
    return (
      <Link to={to} className={cls}>
        {children}
      </Link>
    );
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls}>
      {children}
    </button>
  );
}

export const Pill = ({ children, tone = "gold", className }: { children: ReactNode; tone?: "gold" | "jade" | "lotus" | "azure" | "muted" | "saffron"; className?: string }) => {
  const tones = {
    gold: "border-gold-500/35 bg-gold-500/10 text-gold-400",
    saffron: "border-saffron-500/35 bg-saffron-500/10 text-saffron-400",
    jade: "border-jade-500/35 bg-jade-500/10 text-jade-400",
    lotus: "border-lotus-500/35 bg-lotus-500/10 text-lotus-400",
    azure: "border-azure-500/35 bg-azure-500/10 text-azure-400",
    muted: "border-white/12 bg-white/[0.04] text-white/60",
  }[tone];
  return <span className={cx("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide", tones, className)}>{children}</span>;
};

export const Stars = ({ n, size = 12 }: { n: number; size?: number }) => (
  <span className="inline-flex items-center gap-0.5 text-gold-400">
    {[0, 1, 2, 3, 4].map((i) => (
      <Star key={i} size={size} className={i < Math.round(n) ? "fill-gold-400" : "opacity-30"} strokeWidth={1.5} />
    ))}
  </span>
);

/* ─────────────────────────────── motion ─────────────────────────────── */

export function Reveal({ children, delay = 0, y = 26, className }: { children: ReactNode; delay?: number; y?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInViewOnce(ref);
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration: 0.65, delay, ease: [0.22, 0.61, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function Ticker({ to, prefix = "", suffix = "", duration = 1400 }: { to: number; prefix?: string; suffix?: string; duration?: number }) {
  const [v, setV] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInViewOnce(ref);
  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const t0 = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      setV(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);
  return (
    <span ref={ref} className="tabular">
      {prefix}
      {v.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}

/* ─────────────────────────────── modal ─────────────────────────────── */

export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title?: ReactNode; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", h);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open ? (
        <motion.div className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-night-950/85 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ y: 40, scale: 0.98, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            className={cx("relative max-h-[92vh] w-full overflow-y-auto rounded-t-3xl border border-gold-500/22 bg-night-900/95 p-5 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.9)] sm:rounded-3xl sm:p-7", wide ? "sm:max-w-3xl" : "sm:max-w-xl")}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div className="font-display text-xl text-white">{title}</div>
              <button onClick={onClose} className="rounded-full border border-white/12 p-1.5 text-white/60 transition hover:border-gold-500/40 hover:text-gold-400" aria-label="Close">
                <X size={16} />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

/* ─────────────────────────── price presentation ─────────────────────────── */

export function Price({ value, mrp, size = "md", tone = "gold" }: { value: number; mrp?: number; size?: "sm" | "md" | "lg"; tone?: "gold" | "saffron" | "jade" }) {
  const s = { sm: "text-base", md: "text-2xl", lg: "text-[2.1rem]" }[size];
  const c = { gold: "text-gold-400", saffron: "text-saffron-400", jade: "text-jade-400" }[tone];
  return (
    <span className="inline-flex flex-wrap items-baseline gap-2">
      <span className={cx("font-display font-semibold tracking-tight", s, c)}>{inr(value)}</span>
      {mrp && mrp > value ? <span className="text-xs text-white/35 line-through">{inr(mrp)}</span> : null}
    </span>
  );
}

export const SaveBadge = ({ mrp, value }: { mrp?: number; value: number }) => {
  if (!mrp || mrp <= value) return null;
  const pct = Math.round((1 - value / mrp) * 100);
  return <Pill tone="jade">save {pct}% · {inr(mrp - value)}</Pill>;
};

/* ───────────────────────────── tabs / lists ───────────────────────────── */

export function Tabs({ tabs, active, onChange, size = "md" }: { tabs: { id: string; label: ReactNode }[]; active: string; onChange: (id: string) => void; size?: "sm" | "md" }) {
  return (
    <div className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto rounded-full border border-white/10 bg-night-950/60 p-1 backdrop-blur">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={cx(
            "relative shrink-0 rounded-full px-4 font-semibold transition-colors",
            size === "sm" ? "py-1.5 text-[12.5px]" : "py-2 text-[13.5px]",
            active === t.id ? "text-night-950" : "text-white/55 hover:text-white",
          )}
        >
          {active === t.id ? <motion.span layoutId="tab-pill" className="absolute inset-0 rounded-full bg-gradient-to-r from-gold-400 to-gold-600" transition={{ type: "spring", stiffness: 400, damping: 34 }} /> : null}
          <span className="relative flex items-center gap-1.5">{t.label}</span>
        </button>
      ))}
    </div>
  );
}

export const Row = ({ k, v, mono, hint }: { k: ReactNode; v: ReactNode; mono?: boolean; hint?: string }) => (
  <div className="flex items-baseline justify-between gap-4 border-b border-white/[0.07] py-2 last:border-0" title={hint}>
    <span className="text-[13px] text-white/55">{k}</span>
    <span className={cx("text-right text-[13.5px] font-medium text-white/90", mono && "tabular")}>{v}</span>
  </div>
);

export const ListItem = ({ children, tone = "gold" }: { children: ReactNode; tone?: "gold" | "jade" | "lotus" }) => (
  <li className="flex gap-2.5 text-[14px] leading-relaxed text-white/72">
    <span className={cx("mt-[7px] h-1.5 w-1.5 shrink-0 rotate-45", tone === "jade" ? "bg-jade-400" : tone === "lotus" ? "bg-lotus-400" : "bg-gold-500")} />
    <span>{children}</span>
  </li>
);

export const MoreLink = ({ to, children }: { to: string; children: ReactNode }) => (
  <Link to={to} className="group inline-flex items-center gap-1 text-[13px] font-semibold text-gold-400 hover:text-gold-500">
    {children}
    <ChevronRight size={14} className="transition-transform group-hover:translate-x-0.5" />
  </Link>
);

/* ───────────────────────────── ornaments ───────────────────────────── */

/** slow-turning yantra used behind section headers */
export function Yantra({ size = 460, className, opacity = 0.1 }: { size?: number; className?: string; opacity?: number }) {
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} className={cx("pointer-events-none spin-slower", className)} style={{ opacity }} aria-hidden>
      <g fill="none" stroke="url(#yan)" strokeWidth="0.6">
        <circle cx="100" cy="100" r="96" />
        <circle cx="100" cy="100" r="78" />
        <circle cx="100" cy="100" r="54" />
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i * Math.PI) / 6;
          return <line key={i} x1={100} y1={100} x2={100 + 96 * Math.cos(a)} y2={100 + 96 * Math.sin(a)} />;
        })}
        {Array.from({ length: 8 }).map((_, i) => {
          const a = (i * Math.PI) / 4;
          const b = a + Math.PI / 4;
          return <polygon key={`t${i}`} points={`100,100 ${100 + 78 * Math.cos(a)},${100 + 78 * Math.sin(a)} ${100 + 78 * Math.cos(b)},${100 + 78 * Math.sin(b)}`} />;
        })}
        <polygon points="100,26 164,138 36,138" />
        <polygon points="100,174 36,62 164,62" />
      </g>
      <defs>
        <linearGradient id="yan" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f7dc98" />
          <stop offset="1" stopColor="#ff8a3d" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export const Divider = ({ label }: { label?: string }) => (
  <div className="rule-gold my-8 flex items-center justify-center gap-3">
    {label ? <span className="px-3 text-[11px] uppercase tracking-[0.3em] text-gold-500/70">{label}</span> : <Sparkles size={13} className="text-gold-500/60" />}
  </div>
);

/** small mandala divider used inside cards */
export const Dot = () => <span className="inline-block h-1 w-1 rounded-full bg-gold-500/70" />;
