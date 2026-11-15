"use client";
import type { ReactNode } from "react";
import type { GrahaId } from "@/lib/astro/core";
import { GRAHA_SHORT, LAGNA_SHORT, RASHI, type Lang } from "@/lib/astro/names";

export type ChartStyle = "north" | "south";

export interface ChartGraha {
  id: GrahaId;
  /** Rashi the graha occupies in this chart, 0 = Mesha. */
  rashi: number;
  retrograde?: boolean;
}

interface Props {
  style: ChartStyle;
  /** Rashi of the lagna in this chart, 0 = Mesha. */
  lagnaRashi: number;
  grahas: ChartGraha[];
  lang: Lang;
  /** Written in the middle of a South Indian chart and announced to screen readers. */
  title: string;
  /** Second line in the middle of a South Indian chart, e.g. a name. */
  subtitle?: string;
  className?: string;
}

const LINE = "#8B6B3D";
const BORDER = "#5C4326";
const INK = "#1A0F0A";
const MAROON = "#7C2D2D";
const MUTED = "#8A7256";
const RETRO: Record<Lang, string> = { en: "R", hi: "व", kn: "ವ" };

interface Mark {
  text: string;
  retrograde: boolean;
  lagna: boolean;
}

/** Lays marks out in centred rows around (cx, cy). */
function MarkRows({ marks, cx, cy, perRow, size, lang }: { marks: Mark[]; cx: number; cy: number; perRow: number; size: number; lang: Lang }) {
  const rows: Mark[][] = [];
  for (let i = 0; i < marks.length; i += perRow) rows.push(marks.slice(i, i + perRow));
  const lineHeight = size + 3;
  const top = cy - ((rows.length - 1) * lineHeight) / 2;
  return (
    <>
      {rows.map((row, r) => {
        const parts: ReactNode[] = [];
        let raised = false; // true while the pen is still up after a retrograde mark
        row.forEach((mark, i) => {
          parts.push(
            <tspan key={`m${i}`} dx={i === 0 ? 0 : size * 0.45} dy={raised ? size * 0.32 : 0} fill={mark.lagna ? MAROON : INK}>
              {mark.text}
            </tspan>,
          );
          raised = false;
          if (mark.retrograde) {
            parts.push(
              <tspan key={`r${i}`} dy={-size * 0.32} fontSize={size * 0.62} fill={MAROON}>
                {RETRO[lang]}
              </tspan>,
            );
            raised = true;
          }
        });
        return (
          <text key={r} x={cx} y={top + r * lineHeight} textAnchor="middle" dominantBaseline="central" fontSize={size} fontWeight={600}>
            {parts}
          </text>
        );
      })}
    </>
  );
}

/* ---------- North Indian: the houses stay put, the lagna is always the top diamond ---------- */

interface HouseSlot {
  /** Centre of the block of graha marks. */
  cx: number;
  cy: number;
  perRow: number;
  /** Where the rashi number is written. */
  nx: number;
  ny: number;
}

// Houses run anticlockwise from the top diamond.
const NORTH: HouseSlot[] = [
  { cx: 200, cy: 88, perRow: 3, nx: 200, ny: 176 },
  { cx: 100, cy: 34, perRow: 3, nx: 100, ny: 84 },
  { cx: 36, cy: 100, perRow: 2, nx: 84, ny: 100 },
  { cx: 100, cy: 200, perRow: 3, nx: 176, ny: 200 },
  { cx: 36, cy: 300, perRow: 2, nx: 84, ny: 300 },
  { cx: 100, cy: 366, perRow: 3, nx: 100, ny: 316 },
  { cx: 200, cy: 312, perRow: 3, nx: 200, ny: 224 },
  { cx: 300, cy: 366, perRow: 3, nx: 300, ny: 316 },
  { cx: 364, cy: 300, perRow: 2, nx: 316, ny: 300 },
  { cx: 300, cy: 200, perRow: 3, nx: 224, ny: 200 },
  { cx: 364, cy: 100, perRow: 2, nx: 316, ny: 100 },
  { cx: 300, cy: 34, perRow: 3, nx: 300, ny: 84 },
];

function NorthChart({ lagnaRashi, marksByRashi, lang }: { lagnaRashi: number; marksByRashi: Mark[][]; lang: Lang }) {
  return (
    <>
      <polygon points="200,0 100,100 200,200 300,100" fill="#FBF1DC" />
      <g stroke={LINE} strokeWidth={1.2} fill="none">
        <line x1="0" y1="0" x2="400" y2="400" />
        <line x1="400" y1="0" x2="0" y2="400" />
        <polygon points="200,0 400,200 200,400 0,200" />
      </g>
      {NORTH.map((slot, i) => {
        const rashi = (lagnaRashi + i) % 12;
        const marks = marksByRashi[rashi];
        // Top and bottom triangles narrow towards the centre, so a crowded house there needs smaller marks.
        const size = marks.length > slot.perRow * 2 ? 12 : marks.length > slot.perRow ? 13.5 : 15;
        const rows = Math.ceil(marks.length / slot.perRow);
        // Keep the first row of a top or bottom triangle against its wide edge.
        const shift = slot.perRow === 3 && (i === 1 || i === 11) ? ((rows - 1) * (size + 3)) / 2 : slot.perRow === 3 && (i === 5 || i === 7) ? -((rows - 1) * (size + 3)) / 2 : 0;
        return (
          <g key={i}>
            <text x={slot.nx} y={slot.ny} textAnchor="middle" dominantBaseline="central" fontSize={11} fill={MUTED} className="tabular">
              {rashi + 1}
            </text>
            <MarkRows marks={marks} cx={slot.cx} cy={slot.cy + shift} perRow={slot.perRow} size={size} lang={lang} />
          </g>
        );
      })}
    </>
  );
}

/* ---------- South Indian: the rashis stay put, Meena in the top-left corner, running clockwise ---------- */

// [column, row] of each rashi's box in the 4 × 4 grid.
const SOUTH: [number, number][] = [
  [1, 0], [2, 0], [3, 0], [3, 1], [3, 2], [3, 3], [2, 3], [1, 3], [0, 3], [0, 2], [0, 1], [0, 0],
];

function SouthChart({ lagnaRashi, marksByRashi, lang, title, subtitle }: { lagnaRashi: number; marksByRashi: Mark[][]; lang: Lang; title: string; subtitle?: string }) {
  const [lc, lr] = SOUTH[lagnaRashi];
  return (
    <>
      <rect x={lc * 100} y={lr * 100} width="100" height="100" fill="#FBF1DC" />
      <g stroke={LINE} strokeWidth={1.2} fill="none">
        <line x1="100" y1="0" x2="100" y2="400" />
        <line x1="300" y1="0" x2="300" y2="400" />
        <line x1="0" y1="100" x2="400" y2="100" />
        <line x1="0" y1="300" x2="400" y2="300" />
        <line x1="200" y1="0" x2="200" y2="100" />
        <line x1="200" y1="300" x2="200" y2="400" />
        <line x1="0" y1="200" x2="100" y2="200" />
        <line x1="300" y1="200" x2="400" y2="200" />
        {/* The lagna is marked with a stroke across the corner of its box. */}
        <line x1={lc * 100} y1={lr * 100 + 22} x2={lc * 100 + 22} y2={lr * 100} stroke={MAROON} strokeWidth={1.6} />
      </g>
      {SOUTH.map(([c, r], rashi) => {
        const marks = marksByRashi[rashi];
        const size = marks.length > 6 ? 12 : marks.length > 3 ? 13.5 : 15;
        return (
          <g key={rashi}>
            <text x={c * 100 + 94} y={r * 100 + 13} textAnchor="end" dominantBaseline="central" fontSize={lang === "en" ? 9.5 : 10.5} fill={MUTED}>
              {RASHI[lang][rashi]}
            </text>
            <MarkRows marks={marks} cx={c * 100 + 50} cy={r * 100 + 58} perRow={3} size={size} lang={lang} />
          </g>
        );
      })}
      <text x="200" y={subtitle ? 190 : 200} textAnchor="middle" dominantBaseline="central" fontSize={lang === "en" ? 24 : 20} fontWeight={600} fill={INK} className="font-serif">
        {title}
      </text>
      {subtitle && (
        <text x="200" y="218" textAnchor="middle" dominantBaseline="central" fontSize={12} fill={MUTED}>
          {subtitle}
        </text>
      )}
    </>
  );
}

export function KundliChart({ style, lagnaRashi, grahas, lang, title, subtitle, className }: Props) {
  const marksByRashi: Mark[][] = Array.from({ length: 12 }, () => []);
  marksByRashi[lagnaRashi].push({ text: LAGNA_SHORT[lang], retrograde: false, lagna: true });
  for (const g of grahas) marksByRashi[g.rashi].push({ text: GRAHA_SHORT[g.id][lang], retrograde: Boolean(g.retrograde), lagna: false });

  const description = `${title}. ${LAGNA_SHORT[lang]}: ${RASHI[lang][lagnaRashi]}. ` + grahas.map((g) => `${GRAHA_SHORT[g.id][lang]}: ${RASHI[lang][g.rashi]}`).join(", ");

  return (
    <svg viewBox="-3 -3 406 406" role="img" aria-label={description} className={className} xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="400" height="400" fill="#FFFDF7" />
      {style === "north" ? <NorthChart lagnaRashi={lagnaRashi} marksByRashi={marksByRashi} lang={lang} /> : <SouthChart lagnaRashi={lagnaRashi} marksByRashi={marksByRashi} lang={lang} title={title} subtitle={subtitle} />}
      <rect x="0" y="0" width="400" height="400" fill="none" stroke={BORDER} strokeWidth={2.2} />
    </svg>
  );
}
