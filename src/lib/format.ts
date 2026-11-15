import { NAKSHATRAS, SIGNS } from "../data/reference";

export const inr = (paise: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise / 100);

export const inrPlain = (paise: number) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(paise / 100);

/** rupees → paise (all prices are stored as integer paise to avoid float drift) */
export const rupees = (r: number) => Math.round(r * 100);

export const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export const pct = (n: number) => `${Math.round(n * 100)}%`;

export const signName = (i: number) => SIGNS[((i % 12) + 12) % 12]?.name ?? "—";
export const nakName = (i: number) => NAKSHATRAS[((i % 27) + 27) % 27]?.name ?? "—";

export const fmtTime = (ms: number | null | undefined, tz = "Asia/Kolkata", withSeconds = false) => {
  if (ms == null || !Number.isFinite(ms)) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    ...(withSeconds ? { second: "2-digit" as const } : {}),
  }).format(new Date(ms));
};

export const fmtDate = (ms: number | null | undefined, tz = "Asia/Kolkata") => {
  if (ms == null || !Number.isFinite(ms)) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: tz,
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(ms));
};

export const fmtDateTime = (ms: number | null | undefined, tz = "Asia/Kolkata") =>
  ms == null ? "—" : `${fmtDate(ms, tz)}, ${fmtTime(ms, tz)}`;

export const fmtDayMonth = (ms: number, tz = "Asia/Kolkata") =>
  new Intl.DateTimeFormat("en-GB", { timeZone: tz, day: "2-digit", month: "short" }).format(new Date(ms));

/** "2 yr 4 m" from a duration in years */
export function yearsToYm(years: number): string {
  const totalMonths = Math.round(years * 12);
  const y = Math.floor(totalMonths / 12);
  const m = totalMonths % 12;
  if (y === 0) return `${m} m`;
  return m === 0 ? `${y} yr` : `${y} yr ${m} m`;
}

export const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

export const titleCase = (s: string) =>
  s.replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase());

/** stable pseudo-random in [0,1) from a string — used only for cosmetic ordering */
export function hash01(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 10000) / 10000;
}

export const uid = (prefix = "id") =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

/** Indian mobile / WhatsApp validation */
export const isIndianMobile = (v: string) => /^(\+91[\s-]?)?[6-9]\d{9}$/.test(v.replace(/[\s-]/g, ""));

export const debounce = <A extends unknown[]>(fn: (...a: A) => void, ms = 200) => {
  let t: ReturnType<typeof setTimeout> | undefined;
  return (...a: A) => {
    if (t) clearTimeout(t);
    t = setTimeout(() => fn(...a), ms);
  };
};
