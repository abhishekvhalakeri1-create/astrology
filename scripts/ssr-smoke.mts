/**
 * Server-render smoke test: mounts every page in a MemoryRouter and renders it
 * to a string. Catches runtime errors (bad hook order, undefined data, missing
 * exports) that type-checking cannot, without needing a browser.
 */
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { createElement, type ComponentType } from "react";
import { AppProvider } from "../src/store.tsx";
import { Hero, ServicesPreview, PlansSection, MethodSection, AcharyaSection, RemedyStrip, ReviewsSection, ToolsGrid, FinalCta } from "../src/pages/Home.tsx";
import { KundliPage } from "../src/pages/Kundli.tsx";
import { PanchangPage } from "../src/pages/Panchang.tsx";
import { MilanPage } from "../src/pages/Milan.tsx";
import { HoroscopePage } from "../src/pages/Horoscope.tsx";
import { DoshasPage } from "../src/pages/Doshas.tsx";
import { NumerologyPage } from "../src/pages/Numerology.tsx";
import { NaamkaranPage } from "../src/pages/Naamkaran.tsx";
import { ServicesPage } from "../src/pages/Services.tsx";
import { PricingPage } from "../src/pages/Pricing.tsx";
import { AcharyaPage } from "../src/pages/Acharya.tsx";
import { SavedPage } from "../src/pages/Saved.tsx";

const pages: [string, ComponentType][] = [
  ["Home", () => createElement("div", null,
    createElement(Hero, null),
    createElement(ToolsGrid, null),
    createElement(ServicesPreview, null),
    createElement(PlansSection, null),
    createElement(MethodSection, null),
    createElement(AcharyaSection, null),
    createElement(RemedyStrip, null),
    createElement(ReviewsSection, null),
    createElement(FinalCta, null))],
  ["Kundli", KundliPage],
  ["Panchang", PanchangPage],
  ["Milan", MilanPage],
  ["Horoscope", HoroscopePage],
  ["Doshas", DoshasPage],
  ["Numerology", NumerologyPage],
  ["Naamkaran", NaamkaranPage],
  ["Services", ServicesPage],
  ["Pricing", PricingPage],
  ["Acharya", AcharyaPage],
  ["Saved", SavedPage],
];

let failed = 0;
for (const [name, C] of pages) {
  try {
    const html = renderToString(createElement(MemoryRouter, null, createElement(AppProvider, null, createElement(C as any, null))));
    const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    if (text.length < 200) {
      console.log(`  FAIL  ${name}: rendered only ${text.length} chars of text`);
      failed++;
      continue;
    }
    if (/undefined|NaN|\[object Object\]/.test(text)) {
      const bad = text.match(/.{0,60}(undefined|NaN|\[object Object\]).{0,60}/g)?.slice(0, 3) ?? [];
      console.log(`  WARN  ${name}: suspicious output → ${bad.join(" | ")}`);
    }
    console.log(`  PASS  ${name}: ${text.length} chars of text, ${(html.length / 1024).toFixed(0)} kB of markup`);
  } catch (e) {
    console.log(`  FAIL  ${name}: ${e instanceof Error ? e.message : String(e)}`);
    if (e instanceof Error && e.stack) console.log(e.stack.split("\n").slice(1, 4).join("\n"));
    failed++;
  }
}
console.log(failed === 0 ? "\n✅ every page renders\n" : `\n❌ ${failed} page(s) failed to render\n`);
process.exit(failed === 0 ? 0 : 1);
