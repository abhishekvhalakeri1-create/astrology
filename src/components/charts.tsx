/**
 * Kundli renderers — the two layouts every Indian astrology app shows:
 * North Indian (fixed houses, diamond) and South Indian (fixed signs, 4×3).
 * Both are pure SVG so they print and scale perfectly.
 */
import { PLANET_BY_ID, SIGNS, type Graha } from "../data/reference";
import type { KundliResult } from "../lib/astro/kundli";
import { cx } from "./ui";

const SHORT: Record<Graha, string> = { Su: "Su", Mo: "Mo", Ma: "Ma", Me: "Me", Ju: "Ju", Ve: "Ve", Sa: "Sa", Ra: "Ra", Ke: "Ke" };

/* ───────────────────────────── North Indian ───────────────────────────── */
// Correct diamond-grid geometry for the classic North chart (200×200 box):
const NORTH: { n: number; points: string; tx: number; ty: number }[] = [
  { n: 1, points: "100,8 192,100 100,192 8,100", tx: 100, ty: 62 },
  { n: 2, points: "8,8 100,8 8,100", tx: 44, ty: 44 },
  { n: 12, points: "100,8 192,8 192,100", tx: 156, ty: 44 },
  { n: 3, points: "192,8 192,100 100,100 192,192", tx: 156, ty: 78 },
  { n: 11, points: "8,8 8,192 100,100 8,100", tx: 44, ty: 78 },
  { n: 4, points: "8,100 100,100 8,192", tx: 46, ty: 132 },
  { n: 10, points: "192,100 192,192 100,100", tx: 154, ty: 132 },
  { n: 5, points: "8,192 100,192 100,100", tx: 52, ty: 168 },
  { n: 9, points: "192,192 100,192 100,100", tx: 148, ty: 168 },
  { n: 6, points: "8,192 60,192 8,140", tx: 26, ty: 182 },
  { n: 8, points: "192,192 140,192 192,140", tx: 174, ty: 182 },
  { n: 7, points: "100,100 192,192 8,192", tx: 100, ty: 168 },
];

/**
 * North Indian: fixed houses, signs written as numerals in each cell.
 * `d9` renders the Navāṁsa (D-9) chart in the same frame.
 */
export function NorthChart({ k, d9 = false, className }: { k: KundliResult; d9?: boolean; className?: string }) {
  const perSign = new Map<number, { id: Graha; label: string }[]>();
  for (let s = 0; s < 12; s++) perSign.set(s, []);
  for (const g of k.grahas) {
    const sign = d9 ? g.navamsaSign : g.sign;
    perSign.get(sign)?.push({ id: g.id, label: SHORT[g.id] + (!d9 && g.retro ? "℞" : "") });
  }
  // house n holds sign (lagnaSign + n - 1)
  const lagnaSign = k.lagna.sign;
  return (
    <svg viewBox="0 0 200 200" className={cx("w-full", className)} role="img" aria-label={d9 ? "Navamsa chart" : "North Indian kundli"}>
      <defs>
        <linearGradient id="nch" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e8b64c" stopOpacity="0.20" />
          <stop offset="1" stopColor="#ff8a3d" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="192" height="192" rx="6" fill="url(#nch)" stroke="#e8b64c" strokeOpacity="0.55" strokeWidth="1.2" />
      {NORTH.map((cell) => {
        const sign = (lagnaSign + cell.n - 1) % 12;
        const planets = d9 ? planetsInNavamsaSign(k, cell.n, lagnaSign) : (perSign.get(sign) ?? []);
        return (
          <g key={cell.n}>
            <polygon points={cell.points} fill="rgba(255,255,255,0.02)" stroke="#e8b64c" strokeOpacity="0.4" strokeWidth="0.7" />
            <text x={cell.tx} y={cell.ty - 14} textAnchor="middle" className="fill-white/45" style={{ fontSize: 7.5, fontFamily: "Inter, sans-serif" }}>
              {cell.n}
            </text>
            <text x={cell.tx} y={cell.ty - 4} textAnchor="middle" className="fill-gold-400/80" style={{ fontSize: 8, fontFamily: "Inter, sans-serif" }}>
              {sign + 1}
            </text>
            {planets.length ? (
              <text x={cell.tx} y={cell.ty + 9} textAnchor="middle" className="fill-white" style={{ fontSize: 8.6, fontWeight: 600, fontFamily: "Inter, sans-serif" }}>
                {planets.map((p) => p.label).join(" ")}
              </text>
            ) : null}
            {cell.n === 1 ? (
              <text x={cell.tx} y={cell.ty + 19} textAnchor="middle" className="fill-saffron-400" style={{ fontSize: 7, fontFamily: "Inter, sans-serif" }}>
                Lagna
              </text>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}

function planetsInNavamsaSign(k: KundliResult, house: number, lagnaSign: number) {
  const sign = (lagnaSign + house - 1) % 12;
  return k.grahas.filter((g) => g.navamsaSign === sign).map((g) => ({ id: g.id, label: SHORT[g.id] }));
}

/* ───────────────────────────── South Indian ───────────────────────────── */
// fixed 4×3 grid of SIGNS, read clockwise. Row1: Pisces(11) Aries(0) Taurus(1) Gemini(2)
// Row2: Cancer(3) [        empty        ] Leo(4)
// Row3: Virgo(5) Libra(6) Scorpio(7) Sagittarius(8)  → Capricorn(9) Aquarius(10) under row1?
// Standard layout is 12 cells: top row 4, middle row 2 (outer only), bottom row 4, plus 2 vertical? Use the common arrangement:
const SOUTH_CELLS: { sign: number; x: number; y: number }[] = [
  { sign: 11, x: 0, y: 0 }, { sign: 0, x: 1, y: 0 }, { sign: 1, x: 2, y: 0 }, { sign: 2, x: 3, y: 0 },
  { sign: 10, x: 0, y: 1 }, { sign: 3, x: 3, y: 1 },
  { sign: 9, x: 0, y: 2 }, { sign: 4, x: 3, y: 2 },
  { sign: 8, x: 0, y: 3 }, { sign: 7, x: 1, y: 3 }, { sign: 6, x: 2, y: 3 }, { sign: 5, x: 3, y: 3 },
];

/** South Indian: fixed signs, clockwise, diagonal slash on the Lagna cell. */
export function SouthChart({ k, d9 = false, className }: { k: KundliResult; d9?: boolean; className?: string }) {
  const CW = 100, CH = 80;
  const items = SOUTH_CELLS.map((c) => {
    const planets = k.grahas.filter((g) => (d9 ? g.navamsaSign : g.sign) === c.sign);
    return { ...c, planets };
  });
  return (
    <svg viewBox={`0 0 ${CW * 4} ${CH * 4}`} className={cx("w-full", className)} role="img" aria-label="South Indian kundli">
      <defs>
        <linearGradient id="sch" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e8b64c" stopOpacity="0.16" />
          <stop offset="1" stopColor="#f4568c" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width={CW * 4 - 2} height={CH * 4 - 2} rx="8" fill="url(#sch)" stroke="#e8b64c" strokeOpacity="0.55" strokeWidth="1.2" />
      {items.map(({ sign, x, y, planets }) => {
        const px = x * CW, py = y * CH;
        const isLagna = !d9 && k.lagna.sign === sign;
        return (
          <g key={sign}>
            <rect x={px} y={py} width={CW} height={CH} fill="none" stroke="#e8b64c" strokeOpacity="0.35" strokeWidth="0.7" />
            {isLagna ? (
              <>
                <line x1={px + 4} y1={py + 4} x2={px + CW - 4} y2={py + CH - 4} stroke="#ff8a3d" strokeOpacity="0.5" strokeWidth="0.8" />
                <line x1={px + CW - 4} y1={py + 4} x2={px + 4} y2={py + CH - 4} stroke="#ff8a3d" strokeOpacity="0.5" strokeWidth="0.8" />
              </>
            ) : null}
            <text x={px + 8} y={py + 15} className="fill-gold-400/85" style={{ fontSize: 9.5, fontFamily: "Inter, sans-serif", fontWeight: 600 }}>
              {SIGNS[sign]?.sanskrit}
            </text>
            <text x={px + 8} y={py + 26} className="fill-white/40" style={{ fontSize: 7.5, fontFamily: "Inter, sans-serif" }}>
              {d9 ? "" : k.houses.find((h) => h.sign === sign)?.n ?? "•"}
            </text>
            {planets.length ? (
              <g transform={`translate(${px + 12}, ${py + 46})`}>
                {planets.map((p, i) => (
                  <text key={p.id} x={i * 22} y={0} textAnchor="middle" className="fill-white" style={{ fontSize: 11, fontWeight: 600, fontFamily: "Inter, sans-serif" }}>
                    {SHORT[p.id]}
                    {!d9 && p.retro ? "℞" : ""}
                  </text>
                ))}
              </g>
            ) : null}
          </g>
        );
      })}
      <text x={CW * 2} y={CH * 2 - 4} textAnchor="middle" className="fill-white/25" style={{ fontSize: 12, fontFamily: "Marcellus, serif" }}>
        {d9 ? "D-9 · Navāṁsa" : `Rāsi · ${k.lagna.signName}`}
      </text>
      <text x={CW * 2} y={CH * 2 + 12} textAnchor="middle" className="fill-gold-400/60" style={{ fontSize: 9, fontFamily: "Inter, sans-serif" }}>
        {k.input.name || "—"}
      </text>
    </svg>
  );
}

/** D-10 (Daśāṁsa) as a compact strip — career chart, AstroSage shows it too */
export function D10Strip({ k }: { k: KundliResult }) {
  return (
    <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-10">
      {k.grahas.map((g) => (
        <div key={g.id} className="chart-cell rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1.5 text-center">
          <div className="text-[11px] font-semibold text-gold-400">{SHORT[g.id]}</div>
          <div className="text-[10px] text-white/55">{SIGNS[g.dashamsaSign]?.name.split(" ")[0]}</div>
        </div>
      ))}
    </div>
  );
}

/** Mini wheel: graha glyphs around the 12 signs, for hero cards. */
export function GrahaWheel({ k, size = 210 }: { k: KundliResult; size?: number }) {
  const R = 50;
  const cx0 = 60;
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} className="mx-auto block" aria-hidden>
      <circle cx={cx0} cy={cx0} r={R + 6} fill="none" stroke="#e8b64c" strokeOpacity="0.35" strokeWidth="0.6" />
      <circle cx={cx0} cy={cx0} r={R - 14} fill="none" stroke="#e8b64c" strokeOpacity="0.22" strokeWidth="0.5" />
      {Array.from({ length: 12 }).map((_, i) => {
        const a = ((i * 30 - 90) * Math.PI) / 180;
        const x = cx0 + (R + 6) * Math.cos(a);
        const y = cx0 + (R + 6) * Math.sin(a);
        const x2 = cx0 + (R - 14) * Math.cos(a);
        const y2 = cx0 + (R - 14) * Math.sin(a);
        return <line key={i} x1={x} y1={y} x2={x2} y2={y2} stroke="#e8b64c" strokeOpacity="0.2" strokeWidth="0.4" />;
      })}
      {k.grahas.map((g, i) => {
        const a = ((g.sid - 90) * Math.PI) / 180;
        const rr = R - 4 - (i % 3) * 6;
        return (
          <g key={g.id}>
            <circle cx={cx0 + rr * Math.cos(a)} cy={cx0 + rr * Math.sin(a)} r="4.6" fill="#0a0820" stroke={PLANET_BY_ID[g.id]?.color ?? "#e8b64c"} strokeWidth="0.9" />
            <text x={cx0 + rr * Math.cos(a)} y={cx0 + rr * Math.sin(a) + 1.7} textAnchor="middle" style={{ fontSize: 4.6, fontWeight: 700 }} fill={PLANET_BY_ID[g.id]?.color ?? "#e8b64c"}>
              {SHORT[g.id]}
            </text>
          </g>
        );
      })}
      <text x={cx0} y={cx0 - 2} textAnchor="middle" className="fill-gold-400/85" style={{ fontSize: 7, fontFamily: "Marcellus, serif" }}>
        {k.lagna.signName}
      </text>
      <text x={cx0} y={cx0 + 7} textAnchor="middle" className="fill-white/45" style={{ fontSize: 5, fontFamily: "Inter, sans-serif" }}>
        Lagna
      </text>
    </svg>
  );
}

export const houseShort = (n: number) => `H${n}`;
