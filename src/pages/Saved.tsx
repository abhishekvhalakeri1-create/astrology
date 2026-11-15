/**
 * My Kundlis — the local "account": saved charts, their essentials, export and
 * the one-tap wipe. Deliberately boring, because privacy should be.
 */
import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Archive, Copy, Database, Download, Heart, Plus, ShieldCheck, Trash2, User } from "lucide-react";
import { NAKSHATRAS, SIGNS } from "../data/reference";
import { computeKundli } from "../lib/astro/kundli";
import type { Profile } from "../store";
import { fmtDate } from "../lib/format";
import { useApp } from "../store";
import { NorthChart } from "../components/charts";
import { AddButton } from "../components/Cart";
import { Button, Card, Container, Divider, Eyebrow, ListItem, Modal, Pill, Row, Section , cx } from "../components/ui";

export function SavedPage() {
  const { state, dispatch, addProfile } = useApp();
  const nav = useNavigate();
  const [confirmWipe, setConfirmWipe] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const exportAll = () => {
    const blob = new Blob([JSON.stringify({ app: "astrodrishti", version: 1, profiles: state.profiles, bookings: state.bookings }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `astrodrishti-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importAll = async (f: File) => {
    try {
      const data = JSON.parse(await f.text());
      for (const p of data.profiles ?? []) {
        if (p?.dob && p?.tob && p?.place) addProfile({ name: p.name ?? "", gender: p.gender, dob: p.dob, tob: p.tob, place: p.place, ayanamsa: p.ayanamsa, topocentric: p.topocentric });
      }
    } catch {
      /* ignore malformed file */
    }
  };

  return (
    <Section className="pt-10 sm:pt-14">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow>मेरी कुण्डलियाँ · this device only</Eyebrow>
            <h1 className="mt-3 font-display text-[2rem] leading-tight text-white sm:text-[2.7rem]">My Kundlis</h1>
            <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-white/55">
              {state.profiles.length
                ? `${state.profiles.length} chart${state.profiles.length === 1 ? "" : "s"} stored in this browser's localStorage. No account, no server, no analytics on your birth time.`
                : "Nothing saved yet. Every chart you generate appears here, and stays only on this device."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => nav("/kundli")}>
              <Plus size={14} /> new chart
            </Button>
            <Button size="sm" variant="ghost" onClick={exportAll} disabled={!state.profiles.length}>
              <Download size={14} /> export json
            </Button>
            <button onClick={() => fileRef.current?.click()} className="rounded-full border border-white/12 px-3.5 py-1.5 text-[12.5px] font-semibold text-white/60 transition hover:border-gold-500/50 hover:text-gold-400">
              import
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) importAll(f);
                e.target.value = "";
              }}
            />
            <Button size="sm" variant="danger" onClick={() => setConfirmWipe(true)} disabled={!state.profiles.length && !state.bookings.length}>
              <Trash2 size={14} /> wipe everything
            </Button>
          </div>
        </div>

        <Divider />

        {state.profiles.length === 0 ? (
          <Card className="p-10 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-gold-500/30 bg-gold-500/[0.06]">
              <Archive size={20} className="text-gold-400/70" />
            </div>
            <p className="mt-3 text-[14px] text-white/60">No charts saved on this device yet.</p>
            <Button className="mt-4" onClick={() => nav("/kundli")}>
              Generate one free <Plus size={15} />
            </Button>
          </Card>
        ) : (
          <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {state.profiles.map((p) => {
              const active = state.activeId === p.id;
              return (
                <Card key={p.id} className={cx("flex h-full flex-col p-5", active && "border-gold-500/50")}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <User size={13} className="text-gold-400/80" />
                        <span className="truncate font-display text-[18px] text-white">{p.name || "Unnamed"}</span>
                      </div>
                      <div className="mt-0.5 text-[11.5px] tabular text-white/45">
                        {fmtDate(Date.parse(`${p.dob}T${p.tob}:00`), p.place.tz)} · {p.place.name}
                      </div>
                    </div>
                    {active ? <Pill tone="gold">active</Pill> : null}
                  </div>
                  <div className="mt-3 rounded-2xl border border-white/8 bg-night-950/40 p-3">
                    <ProfileMini id={p.id} />
                  </div>
                  <div className="mt-3 grid gap-1.5">
                    <SavedMiniInfo id={p.id} />
                    <Row k="Ayanāṁsa" v={p.ayanamsa === "kp" ? "KP" : "Lahiri"} />
                    <Row k="Positions" v={p.topocentric ? "topocentric" : "geocentric"} />
                  </div>
                  <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-4">
                    <Button size="sm" onClick={() => { dispatch({ type: "profile:active", id: p.id }); nav("/kundli"); }}>
                      open
                    </Button>
                    <button
                      onClick={() =>
                        addProfile({ name: `${p.name} (copy)`, gender: p.gender, dob: p.dob, tob: p.tob, place: p.place, ayanamsa: p.ayanamsa, topocentric: p.topocentric })
                      }
                      className="grid h-8 w-8 place-items-center rounded-lg border border-white/12 text-white/55 transition hover:border-gold-500/50 hover:text-gold-400"
                      title="duplicate"
                    >
                      <Copy size={13} />
                    </button>
                    <button
                      onClick={() => {
                        dispatch({ type: "profile:remove", id: p.id });
                      }}
                      className="grid h-8 w-8 place-items-center rounded-lg border border-white/12 text-white/55 transition hover:border-lotus-500/60 hover:text-lotus-400"
                      title="delete"
                    >
                      <Trash2 size={13} />
                    </button>
                    <Button size="sm" variant="ghost" to="/milan" className="ml-auto">
                      <Heart size={13} /> match
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {state.bookings.length > 0 ? (
          <>
            <Divider label="orders & bookings" />
            <Card className="overflow-hidden p-0">
              <table className="w-full text-left text-[13px]">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02] text-[10.5px] uppercase tracking-[0.14em] text-white/40">
                    {["service", "when", "amount", "status"].map((h) => (
                      <th key={h} className="px-4 py-2.5 font-semibold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {state.bookings.map((b) => (
                    <tr key={b.id} className="border-b border-white/[0.05] last:border-0">
                      <td className="px-4 py-2.5 text-white/85">{b.title}</td>
                      <td className="px-4 py-2.5 tabular text-white/55">
                        {b.date} {b.slot ? `· ${b.slot}` : ""}
                      </td>
                      <td className="px-4 py-2.5 tabular text-gold-400">₹{(b.price / 100).toLocaleString("en-IN")}</td>
                      <td className="px-4 py-2.5">
                        <Pill tone={b.status === "confirmed" ? "jade" : "saffron"}>{b.status}</Pill>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </>
        ) : null}

        <div className="mt-8 grid gap-4 lg:grid-cols-12">
          <Card className="p-5 lg:col-span-7">
            <div className="mb-2 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-gold-500">
              <Database size={13} /> where your data lives
            </div>
            <ul className="space-y-1.5">
              <ListItem>Birth details, saved charts and the cart live in <span className="font-mono text-[12px] text-gold-400/85">localStorage["astrodrishti.v1"]</span> on this device.</ListItem>
              <ListItem>Nothing is uploaded when you compute. Reports and bookings only need your contact details at checkout.</ListItem>
              <ListItem>Clearing site data (or the wipe button above) removes it permanently — we cannot restore it, which is the point.</ListItem>
              <ListItem>Export before you change phones; import restores charts (not unlocks, which are tied to the order).</ListItem>
            </ul>
          </Card>
          <Card className="p-5 lg:col-span-5">
            <div className="mb-2 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-gold-500">
              <ShieldCheck size={13} /> while you are here
            </div>
            <p className="text-[13px] leading-relaxed text-white/60">
              The lifetime report and annual updates are for people who want the same file kept current for the whole family.
            </p>
            <AddButton id="astro-lifetime" className="mt-3" full label="Lifetime + annual updates ₹4,999" />
          </Card>
        </div>
      </Container>

      <Modal open={confirmWipe} onClose={() => setConfirmWipe(false)} title="Erase everything on this device?">
        <p className="text-[14px] leading-relaxed text-white/65">
          This deletes {state.profiles.length} saved chart{state.profiles.length === 1 ? "" : "s"}, {state.bookings.length} booking
          record{state.bookings.length === 1 ? "" : "s"}, your cart and any unlocked reports. It cannot be undone — there is no
          server to recover from.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setConfirmWipe(false)}>
            keep them
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              dispatch({ type: "wipe" });
              setConfirmWipe(false);
            }}
          >
            <Trash2 size={15} /> erase everything
          </Button>
        </div>
      </Modal>
    </Section>
  );
}

/** per-card compute: nine bodies at one instant is cheap, and it never leaves the tab */
function useMini(p: Profile | undefined) {
  return useMemo(() => {
    if (!p) return null;
    try {
      return computeKundli({ name: p.name, gender: p.gender, dob: p.dob, tob: p.tob, place: p.place, ayanamsa: p.ayanamsa, topocentric: p.topocentric });
    } catch {
      return null;
    }
  }, [p]);
}

function ProfileMini({ id }: { id: string }) {
  const { state } = useApp();
  const p = state.profiles.find((x) => x.id === id);
  const k = useMini(p);
  if (!k) return <div className="h-[150px] animate-pulse rounded-xl bg-white/[0.03]" />;
  return <NorthChart k={k} />;
}

function SavedMiniInfo({ id }: { id: string }) {
  const { state } = useApp();
  const p = state.profiles.find((x) => x.id === id);
  const k = useMini(p);
  if (!k)
    return (
      <>
        <Row k="Lagna" v="—" />
        <Row k="Moon" v="—" />
      </>
    );
  return (
    <>
      <Row k="Lagna" v={SIGNS[k.lagna.sign]?.name} />
      <Row k="Moon" v={`${SIGNS[k.moonSign]?.name} · ${NAKSHATRAS[k.moonNakshatra]?.name} pāda ${k.moonPada}`} />
      <Row k="Gaṇa / Yoni" v={`${k.gana} · ${k.yoni}`} />
      <Row k="Current Mahādaśā" v={k.dasha.current ? `${k.dasha.current.md.lord} → ${k.dasha.current.ad.lord}` : "—"} />
    </>
  );
}
