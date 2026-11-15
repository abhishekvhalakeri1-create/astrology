/**
 * App state: birth profiles, cart, bookings, unlocks — all persisted in
 * localStorage. Nothing is sent anywhere; the app is fully client-side.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import { computeKundli, type BirthInput, type KundliResult } from "./lib/astro/kundli";
import { COUPON_FLAT, COUPONS, PLANS, SERVICES, type Plan, type Service } from "./data/catalog";
import { uid } from "./lib/format";

export interface Profile extends BirthInput {
  id: string;
  label?: string;
  createdAt: number;
}

export interface CartLine {
  key: string;
  serviceId: string;
  qty: number;
  meta?: Record<string, string | number>;
}

export interface Booking {
  id: string;
  serviceId: string;
  title: string;
  price: number;
  date: string;
  slot: string;
  mode: "call" | "video" | "chat" | "puja-visit" | "temple";
  contact: string;
  question: string;
  profileId?: string;
  createdAt: number;
  status: "requested" | "confirmed";
}

interface State {
  profiles: Profile[];
  activeId: string | null;
  cart: CartLine[];
  bookings: Booking[];
  unlocked: string[];
  coupon: string | null;
  plan: string | null;
  consent: boolean;
}

type Action =
  | { type: "hydrate"; state: State }
  | { type: "profile:add"; profile: Profile }
  | { type: "profile:update"; profile: Profile }
  | { type: "profile:remove"; id: string }
  | { type: "profile:active"; id: string | null }
  | { type: "cart:add"; line: Omit<CartLine, "key"> & { key?: string } }
  | { type: "cart:qty"; key: string; qty: number }
  | { type: "cart:remove"; key: string }
  | { type: "cart:clear" }
  | { type: "coupon"; code: string | null }
  | { type: "unlock"; id: string }
  | { type: "plan"; id: string | null }
  | { type: "booking:add"; booking: Booking }
  | { type: "booking:confirm"; id: string }
  | { type: "consent"; value: boolean }
  | { type: "wipe" };

const KEY = "astrodrishti.v1";

const EMPTY: State = {
  profiles: [],
  activeId: null,
  cart: [],
  bookings: [],
  unlocked: [],
  coupon: null,
  plan: null,
  consent: true,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "hydrate":
      return { ...EMPTY, ...action.state };
    case "profile:add":
      return {
        ...state,
        profiles: [action.profile, ...state.profiles].slice(0, 40),
        activeId: action.profile.id,
      };
    case "profile:update":
      return {
        ...state,
        profiles: state.profiles.map((p) => (p.id === action.profile.id ? action.profile : p)),
      };
    case "profile:remove": {
      const profiles = state.profiles.filter((p) => p.id !== action.id);
      return {
        ...state,
        profiles,
        activeId: state.activeId === action.id ? (profiles[0]?.id ?? null) : state.activeId,
      };
    }
    case "profile:active":
      return { ...state, activeId: action.id };
    case "cart:add": {
      const key = action.line.key ?? `${action.line.serviceId}:${JSON.stringify(action.line.meta ?? {})}`;
      const existing = state.cart.find((l) => l.key === key);
      return {
        ...state,
        cart: existing
          ? state.cart.map((l) => (l.key === key ? { ...l, qty: l.qty + action.line.qty } : l))
          : [...state.cart, { ...action.line, key }],
      };
    }
    case "cart:qty":
      return {
        ...state,
        cart: state.cart
          .map((l) => (l.key === action.key ? { ...l, qty: action.qty } : l))
          .filter((l) => l.qty > 0),
      };
    case "cart:remove":
      return { ...state, cart: state.cart.filter((l) => l.key !== action.key) };
    case "cart:clear":
      return { ...state, cart: [], coupon: null };
    case "coupon":
      return { ...state, coupon: action.code };
    case "unlock":
      return { ...state, unlocked: [...new Set([...state.unlocked, action.id])] };
    case "plan":
      return { ...state, plan: action.id };
    case "booking:add":
      return { ...state, bookings: [action.booking, ...state.bookings] };
    case "booking:confirm":
      return {
        ...state,
        bookings: state.bookings.map((b) => (b.id === action.id ? { ...b, status: "confirmed" } : b)),
      };
    case "consent":
      return { ...state, consent: action.value };
    case "wipe":
      return EMPTY;
    default:
      return state;
  }
}

export interface CartLineView extends CartLine {
  service?: Service;
  plan?: Plan;
  lineTotal: number;
  mrp: number;
  title: string;
}

interface Ctx {
  state: State;
  dispatch: React.Dispatch<Action>;
  activeProfile: Profile | null;
  kundli: KundliResult | null;
  kundliError: string | null;
  cartView: CartLineView[];
  totals: {
    subtotal: number;
    mrp: number;
    saved: number;
    couponOff: number;
    total: number;
    count: number;
  };
  addProfile: (input: BirthInput, opts?: { updateId?: string; label?: string }) => string;
  isUnlocked: (id: string) => boolean;
  unlock: (id: string) => void;
  addService: (serviceId: string, opts?: { qty?: number; meta?: Record<string, string | number> }) => void;
  addPlan: (planId: string) => void;
  openCart: () => void;
  cartOpen: boolean;
  setCartOpen: (v: boolean) => void;
}

const AppContext = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, EMPTY);
  const [cartOpen, setCartOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) dispatch({ type: "hydrate", state: JSON.parse(raw) as State });
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* storage full / private mode */
    }
  }, [state, hydrated]);

  const activeProfile = useMemo(
    () => state.profiles.find((p) => p.id === state.activeId) ?? state.profiles[0] ?? null,
    [state.profiles, state.activeId],
  );

  const [kundli, kundliError] = useMemo((): [KundliResult | null, string | null] => {
    if (!activeProfile) return [null, null];
    try {
      return [computeKundli(activeProfile), null];
    } catch (e) {
      return [null, e instanceof Error ? e.message : String(e)];
    }
  }, [activeProfile]);

  const addProfile = useCallback(
    (input: BirthInput, opts?: { updateId?: string; label?: string }) => {
      if (opts?.updateId) {
        dispatch({ type: "profile:update", profile: { ...input, id: opts.updateId, createdAt: Date.now() } });
        return opts.updateId;
      }
      const id = uid("ku");
      dispatch({ type: "profile:add", profile: { ...input, id, createdAt: Date.now(), label: opts?.label } });
      return id;
    },
    [],
  );

  const addService = useCallback(
    (serviceId: string, opts?: { qty?: number; meta?: Record<string, string | number> }) => {
      dispatch({ type: "cart:add", line: { serviceId, qty: opts?.qty ?? 1, meta: opts?.meta } });
      setCartOpen(true);
    },
    [setCartOpen],
  );

  const addPlan = useCallback(
    (planId: string) => {
      dispatch({ type: "cart:add", line: { key: `plan:${planId}`, serviceId: planId, qty: 1 } });
      dispatch({ type: "plan", id: planId });
      setCartOpen(true);
    },
    [setCartOpen],
  );

  const cartView = useMemo<CartLineView[]>(
    () =>
      state.cart.map((l) => {
        const service = SERVICES.find((s) => s.id === l.serviceId);
        const plan = PLANS.find((p) => p.id === l.serviceId);
        const unit = service?.price ?? plan?.price ?? 0;
        const mrpUnit = service?.mrp ?? unit;
        return {
          ...l,
          service,
          plan,
          lineTotal: unit * l.qty,
          mrp: mrpUnit * l.qty,
          title: service?.title ?? plan?.name ?? l.serviceId,
        };
      }),
    [state.cart],
  );

  const totals = useMemo(() => {
    const subtotal = cartView.reduce((a, b) => a + b.lineTotal, 0);
    const mrp = cartView.reduce((a, b) => a + Math.max(b.mrp, b.lineTotal), 0);
    let couponOff = 0;
    const code = state.coupon ? COUPONS[state.coupon] : null;
    if (code && subtotal >= code.min) {
      couponOff = code.off > 0 ? Math.round(subtotal * code.off) : (COUPON_FLAT[state.coupon!] ?? 0);
    }
    // membership perks: Guru/Darshan holders get 12% off a-la-carte items
    const memberOff = state.plan ? Math.round((subtotal - couponOff) * 0.12) : 0;
    const total = Math.max(0, subtotal - couponOff - memberOff);
    return {
      subtotal,
      mrp,
      saved: Math.max(0, mrp - subtotal) + couponOff + memberOff,
      couponOff: couponOff + memberOff,
      total,
      count: cartView.reduce((a, b) => a + b.qty, 0),
    };
  }, [cartView, state.coupon, state.plan]);

  const value: Ctx = {
    state,
    dispatch,
    activeProfile,
    kundli,
    kundliError,
    cartView,
    totals,
    addProfile,
    isUnlocked: (id: string) => state.unlocked.includes(id),
    unlock: (id: string) => dispatch({ type: "unlock", id }),
    addService,
    addPlan,
    cartOpen,
    setCartOpen,
    openCart: () => setCartOpen(true),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): Ctx {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
}

/** Kundli for an arbitrary input (used by Milan, second charts, previews). */
export function useKundli(input: BirthInput | null): { kundli: KundliResult | null; error: string | null } {
  return useMemo(() => {
    if (!input) return { kundli: null, error: null };
    try {
      return { kundli: computeKundli(input), error: null };
    } catch (e) {
      return { kundli: null, error: e instanceof Error ? e.message : String(e) };
    }
  }, [input]);
}
