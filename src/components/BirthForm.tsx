/**
 * Birth-detail capture — the single most important form in the app.
 * Place search is local (410 cities, 122 countries) and the timezone is
 * derived from the chosen city, with an override for unusual cases.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, Calendar, Clock, Compass, MapPin, Save, Sparkles, Sunrise, Users2 } from "lucide-react";
import { PLACES, searchPlaces, zoneForLon, type Place } from "../data/places";
import { useApp } from "../store";
import { isValidZone, type AyanamsaId } from "../lib/astro/core";
import { Button, Pill, Section, cx } from "./ui";

export interface Draft {
  name: string;
  dob: string; // YYYY-MM-DD
  tob: string; // HH:MM
  place: Place | null;
  tz: string;
  ayanamsa: AyanamsaId;
  topocentric: boolean;
  gender: "male" | "female" | "other";
}

export const emptyDraft = (): Draft => ({
  name: "",
  dob: "",
  tob: "",
  place: null,
  tz: "Asia/Kolkata",
  ayanamsa: "lahiri",
  topocentric: false,
  gender: "male",
});

const AYANAMSA_HELP: Record<AyanamsaId, string> = {
  lahiri: "Lahiri (Chitrapaksha) — the government-of-India standard, used by AstroSage and almost every almanac. Keep this unless you know why you want KP.",
  kp: "KP (Krishnamurti) — slightly larger offset, used by Prashna and KP practitioners; sub-divisions differ.",
};

export function validateDraft(d: Draft): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d.dob)) return "Enter the date of birth as YYYY-MM-DD.";
  if (!/^\d{2}:\d{2}$/.test(d.tob)) return "Enter the birth time as HH:MM (24-hour clock).";
  const [y, m, day] = d.dob.split("-").map(Number);
  if (y < 1700 || y > new Date().getFullYear()) return "Year should be between 1700 and today.";
  if (m < 1 || m > 12 || day < 1 || day > 31) return "Check the month and day.";
  const [hh, mm] = d.tob.split(":").map(Number);
  if (hh > 23 || mm > 59) return "Birth time must be a valid 24-hour clock time.";
  if (!d.place) return "Pick your city from the place list (or type its name).";
  if (!isValidZone(d.tz)) return `Timezone "${d.tz}" is not available on this device — pick one from the list.`;
  return null;
}

export function BirthForm({
  draft,
  setDraft,
  onSubmit,
  submitLabel = "Build my Kundli",
  compact,
  error,
  extra,
  hideActions,
}: {
  draft: Draft;
  setDraft: (d: Draft) => void;
  onSubmit: () => void;
  submitLabel?: string;
  compact?: boolean;
  error?: string | null;
  extra?: React.ReactNode;
  hideActions?: boolean;
}) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [unknownTz, setUnknownTz] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft({ ...draft, [k]: v });

  const results = useMemo(() => (q.trim().length < 2 ? PLACES.slice(0, 8) : searchPlaces(q, 10)), [q]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const zones = useMemo(() => {
    const s = new Set<string>();
    for (const p of PLACES) if (p.tz) s.add(p.tz);
    s.add("Asia/Kolkata");
    return [...s].sort();
  }, []);

  const err = validateDraft(draft);

  return (
    <div className={cx("grid gap-4", compact ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-12")}>
      <Field label="Full name" icon={<Users2 size={13} />} className={compact ? "" : "lg:col-span-6"}>
        <input
          value={draft.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="e.g. Abhishek V. Kulkarni"
          className={inputCls}
        />
      </Field>

      <Field label="Date of birth" icon={<Calendar size={13} />} className={compact ? "" : "lg:col-span-3"}>
        <input type="date" value={draft.dob} min="1700-01-01" max={new Date().toISOString().slice(0, 10)} onChange={(e) => set("dob", e.target.value)} className={inputCls} />
      </Field>

      <Field
        label="Time of birth"
        icon={<Clock size={13} />}
        hint="Accuracy matters: 4 minutes of clock time moves the Lagna by about 1°."
        className={compact ? "" : "lg:col-span-3"}
      >
        <input type="time" value={draft.tob} onChange={(e) => set("tob", e.target.value)} className={inputCls} />
      </Field>

      <Field label="Place of birth" icon={<MapPin size={13} />} className={compact ? "" : "lg:col-span-6"}>
        <div ref={boxRef} className="relative">
          <input
            value={q || (draft.place ? `${draft.place.name}${draft.place.region ? `, ${draft.place.region}` : ""}${draft.place.country ? `, ${draft.place.country}` : ""}` : "")}
            onChange={(e) => {
              setQ(e.target.value);
              setOpen(true);
              if (draft.place) set("place", null);
            }}
            onFocus={() => setOpen(true)}
            placeholder="Type a city — Mumbai, London, Dubai…"
            className={cx(inputCls, "pr-9")}
          />
          <Compass size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gold-500/60" />
          {open ? (
            <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-40 max-h-72 overflow-y-auto rounded-2xl border border-gold-500/25 bg-night-900/98 p-1.5 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)] backdrop-blur-xl">
              {results.length === 0 ? (
                <div className="px-3 py-2.5 text-[13px] text-white/50">
                  Not in the 410-city list — pick the nearest city, then correct latitude/longitude below.
                </div>
              ) : null}
              {results.map((p) => (
                <button
                  key={`${p.name}-${p.lat}-${p.lon}`}
                  onClick={() => {
                    setDraft({ ...draft, place: p, tz: p.tz || zoneForLon(p.lon) });
                    setQ("");
                    setOpen(false);
                    setUnknownTz(false);
                  }}
                  className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-gold-500/10"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-[13.5px] font-semibold text-white/90">{p.name}</span>
                    <span className="block truncate text-[11.5px] text-white/45">
                      {[p.region, p.country].filter(Boolean).join(" · ")}
                    </span>
                  </span>
                  <span className="shrink-0 text-right text-[11px] tabular text-gold-400/70">
                    {p.lat.toFixed(2)}°, {p.lon.toFixed(2)}°
                  </span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </Field>

      <Field
        label="Timezone"
        icon={<GlobeIcon />}
        hint={unknownTz ? "This zone id is not built into your browser — pick the nearest one from the list." : undefined}
        className={compact ? "" : "lg:col-span-3"}
        error={unknownTz}
      >
        <select
          value={draft.tz}
          onChange={(e) => {
            set("tz", e.target.value);
            setUnknownTz(!isValidZone(e.target.value));
          }}
          className={inputCls}
        >
          {zones.map((z) => (
            <option key={z} value={z}>
              {z}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Ayanāṁsa" icon={<Sparkles size={13} />} hint={AYANAMSA_HELP[draft.ayanamsa]} className={compact ? "" : "lg:col-span-3"}>
        <div className="flex gap-1.5">
          {(["lahiri", "kp"] as AyanamsaId[]).map((a) => (
            <button
              key={a}
              onClick={() => set("ayanamsa", a)}
              className={cx(
                "flex-1 rounded-xl border px-3 py-2.5 text-[13px] font-semibold capitalize transition",
                draft.ayanamsa === a ? "border-gold-500/60 bg-gold-500/12 text-gold-400" : "border-white/10 text-white/50 hover:border-white/25",
              )}
            >
              {a === "lahiri" ? "Lahiri" : "KP"}
            </button>
          ))}
        </div>
      </Field>

      <div className={cx("flex flex-wrap items-end justify-between gap-3", compact ? "" : "lg:col-span-12", hideActions && "hidden")}>
        <label className="flex cursor-pointer items-center gap-2.5 text-[13px] text-white/60">
          <input
            type="checkbox"
            checked={draft.topocentric}
            onChange={(e) => set("topocentric", e.target.checked)}
            className="h-4 w-4 accent-[#e8b64c]"
          />
          <Sunrise size={13} className="text-saffron-400" />
          Topocentric positions (observer at your city; adds parallax — some KPs prefer it)
        </label>
        <div className="flex items-center gap-2">
          <Pill tone="muted" className={hideActions ? "hidden" : ""}>whole-sign houses</Pill>
          <Button onClick={onSubmit} disabled={!!err} size="md">
            <Save size={15} /> {submitLabel}
          </Button>
        </div>
      </div>

      {extra}

      {err && draft.dob ? (
        <div className={cx("flex items-start gap-2 rounded-xl border border-saffron-500/30 bg-saffron-500/[0.07] px-3 py-2 text-[12.5px] text-saffron-400", compact ? "sm:col-span-2" : "lg:col-span-12")}>
          <AlertTriangle size={14} className="mt-0.5 shrink-0" /> {err}
        </div>
      ) : null}
      {error ? (
        <div className={cx("rounded-xl border border-lotus-500/40 bg-lotus-500/[0.08] px-3 py-2 text-[12.5px] text-lotus-400", compact ? "sm:col-span-2" : "lg:col-span-12")}>
          {error}
        </div>
      ) : null}
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-white/12 bg-night-950/60 px-3.5 py-2.5 text-[14px] text-white outline-none transition placeholder:text-white/30 focus:border-gold-500/70 focus:bg-night-950/80 focus:ring-2 focus:ring-gold-500/15";

function GlobeIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15 15 0 0 1 0 20a15 15 0 0 1 0-20" />
    </svg>
  );
}

function Field({
  label,
  icon,
  children,
  hint,
  className,
  error,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  hint?: string;
  className?: string;
  error?: boolean;
}) {
  return (
    <label className={cx("block", className)}>
      <span className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">
        <span className={error ? "text-lotus-400" : "text-gold-500/80"}>{icon}</span>
        {label}
      </span>
      {children}
      {hint ? <span className="mt-1 block text-[11.5px] leading-snug text-white/35">{hint}</span> : null}
    </label>
  );
}

/** Small profile switcher used at the top of every tool page. */
export function ProfileBar({ onNew }: { onNew?: () => void }) {
  const { state, dispatch, activeProfile } = useApp();
  if (state.profiles.length === 0) return null;
  return (
    <div className="mb-5 flex flex-wrap items-center gap-2">
      <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">Saved charts</span>
      <div className="flex flex-wrap gap-1.5">
        {state.profiles.map((p) => (
          <button
            key={p.id}
            onClick={() => dispatch({ type: "profile:active", id: p.id })}
            className={cx(
              "group rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition",
              activeProfile?.id === p.id
                ? "border-gold-500/60 bg-gold-500/12 text-gold-400"
                : "border-white/10 text-white/55 hover:border-white/25 hover:text-white/80",
            )}
          >
            {p.name || "Unnamed"}{" "}
            <span className="text-white/30">· {p.dob}</span>
          </button>
        ))}
      </div>
      {onNew ? (
        <button onClick={onNew} className="ml-auto text-[12.5px] font-semibold text-jade-400 hover:text-jade-500">
          + new chart
        </button>
      ) : null}
    </div>
  );
}

export function FormShell({ children, title = "Birth details" }: { children: React.ReactNode; title?: string }) {
  return (
    <Section id="birth" tint="gold">
      <div className="mx-auto w-full max-w-[1220px] px-4 sm:px-6 lg:px-8">
        <div className="gold-frame relative rounded-3xl bg-night-900/70 p-5 sm:p-8">
          <div className="mb-6 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-gold-500">
            <Sparkles size={13} /> {title}
          </div>
          {children}
        </div>
      </div>
    </Section>
  );
}
