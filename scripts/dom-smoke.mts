/**
 * DOM smoke test with jsdom: mounts the real <App/>, waits for effects, then
 * clicks through every route and the cart/checkout flow. Catches effect-time
 * crashes that SSR cannot see (localStorage seeding, layout effects, QR code).
 */
import { JSDOM } from "jsdom";

const dom = new JSDOM("<!doctype html><html><body><div id='root'></div></body></html>", {
  url: "http://localhost:5173/",
  pretendToBeVisual: true,
});
const { window } = dom;
const globals = ["window", "document", "navigator", "HTMLElement", "HTMLButtonElement", "HTMLInputElement", "Element", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent", "requestAnimationFrame", "cancelAnimationFrame", "getComputedStyle", "localStorage", "location", "Blob", "URL", "Image"];
for (const k of globals) {
  const v = (window as unknown as Record<string, unknown>)[k];
  if (v === undefined) continue;
  try {
    Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
  } catch {
    /* some getters are frozen; the app tolerates the Node-side value */
  }
}
// seed one saved chart so the kundli-dependent branches render
window.localStorage.setItem(
  "astrodrishti.v1",
  JSON.stringify({
    profiles: [{ id: "ku-1", name: "Test Person", dob: "1990-08-15", tob: "06:30", place: { name: "New Delhi", lat: 28.6139, lon: 77.209, tz: "Asia/Kolkata" }, ayanamsa: "lahiri", topocentric: false, gender: "male", createdAt: Date.now() }],
    activeId: "ku-1", cart: [], bookings: [], unlocked: [], coupon: null, plan: null, consent: true,
  }),
);
window.scrollTo = () => {};
window.IntersectionObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof window.IntersectionObserver;
window.matchMedia = window.matchMedia ?? (() => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }));

const { createElement } = await import("react");
const { createRoot } = await import("react-dom/client");
const { default: App } = await import("../src/App.tsx");

const errors: string[] = [];
const origError = console.error;
console.error = (...a: unknown[]) => {
  const msg = a.map(String).join(" ");
  if (/act\(|not wrapped|Warning: /.test(msg)) return;
  errors.push(msg.slice(0, 300));
  origError("   ↳", msg.slice(0, 200));
};

const root = createRoot(window.document.getElementById("root")!);
root.render(createElement(App));
const tick = (ms = 240) => new Promise((r) => setTimeout(r, ms));
await tick(600);

// each route is pinned to the heading its own page must produce — testing the
// body text alone lets a still-mounted previous page satisfy the assertion
const routes: [string, RegExp][] = [
  ["#/", /computed like it matters/i],
  ["#/kundli", /Janma Kundli/i],
  ["#/panchang", /Panchang/i],
  ["#/milan", /Milan/i],
  ["#/horoscope", /rāśi/i],
  ["#/doshas", /answered with dates/i],
  ["#/numerology", /Numbers, /i],
  ["#/naamkaran", /where the Moon was/i],
  ["#/services", /price on it/i],
  ["#/pricing", /Prices,/i],
  ["#/acharya", /Acharya|Krishna/i],
  ["#/saved", /My Kundlis/i],
];
const headingText = () => [...window.document.querySelectorAll("h1")].map((e) => e.textContent ?? "").join(" / ").replace(/\s+/g, " ");
const text = () => (window.document.body.textContent ?? "").replace(/\s+/g, " ").trim();

const waitFor = async (fn: () => boolean, ms = 6000) => {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    if (fn()) return true;
    await tick(60);
  }
  return false;
};

for (const [r, marker] of routes) {
  const before = errors.length;
  window.location.hash = r;
  // jsdom does not always fire hashchange for a same-document assignment, and
  // react-router's HashRouter listens for it — dispatch explicitly.
  window.dispatchEvent(new window.Event("hashchange"));
  // heavy pages (two birth forms, 12 computed horoscopes) need longer in jsdom
  await waitFor(() => marker.test(headingText()));
  await tick(120);
  const t = text();
  const ok = marker.test(headingText()) && errors.length === before && t.length > 1200;
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${r.padEnd(14)} ${String(t.length).padStart(6)} chars${ok ? "" : ` — expected ${marker}`}`);
  if (!ok) {
    const h1 = window.document.querySelector("h1")?.textContent?.replace(/\s+/g, " ") ?? "(no h1)";
    console.log(`        hash=${window.location.hash} · h1="${headingText().slice(0, 90)}"`);
  }
}

// interaction: add a service to the cart and open checkout
const before = errors.length;
const btns = [...window.document.querySelectorAll("button")] as HTMLButtonElement[];
const addBtn = btns.find((b) => /Add to cart|Add bundle|₹/.test(b.textContent ?? ""));
if (addBtn) {
  addBtn.click();
  await tick(400);
  const pay = [...window.document.querySelectorAll("button")].find((b) => /Pay securely/.test(b.textContent ?? ""));
  console.log(`  ${pay ? "PASS" : "FAIL"}  cart drawer opened with a pay button`);
  if (pay) {
    pay.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
    await tick(400);
    const t = text();
    console.log(`  ${/Checkout|Details/.test(t) ? "PASS" : "FAIL"}  checkout modal shown`);
  }
} else {
  console.log("  FAIL  no add-to-cart button found on /saved");
}
if (errors.length !== before) console.log(`  note: ${errors.length - before} console error(s) during interaction`);

console.log(errors.length ? `\n❌ ${errors.length} runtime error(s):\n` + errors.slice(0, 8).map((e) => "   • " + e).join("\n") : "\n✅ no runtime errors across all routes\n");
process.exit(errors.length ? 1 : 0);
