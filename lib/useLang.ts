'use client';
import { useEffect, useState, useSyncExternalStore } from 'react';
import type { Lang } from '@/lib/astro/names';

/**
 * A static page is built once: in English, on the day of the build. The hooks in this file let a component
 * start from exactly what was built — so the page takes over cleanly in the browser — and then switch to
 * what is true for the visitor: their language, and today's date.
 */

/** Where the chosen language is kept in the browser. The shape is the one earlier versions of the site saved. */
const STORAGE_KEY = 'astroconnect-storage';

const listeners = new Set<() => void>();
let current: Lang | null = null;

function readSaved(): Lang {
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? 'null')?.state?.language;
    return saved === 'hi' || saved === 'kn' ? saved : 'en';
  } catch {
    return 'en'; // storage is switched off, or holds something unreadable
  }
}

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  // A change made in another tab of the same browser arrives here.
  const onStorage = (e: StorageEvent) => {
    if (e.key !== null && e.key !== STORAGE_KEY) return;
    current = readSaved();
    onChange();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener('storage', onStorage);
  };
}

const getSnapshot = (): Lang => (current ??= readSaved());
const getBuiltSnapshot = (): Lang => 'en';

/** Changes the language of the whole site and remembers it for the next visit. */
export function setLang(lang: Lang): void {
  current = lang;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ state: { language: lang }, version: 0 }));
  } catch {
    /* the choice still holds until the tab is closed */
  }
  listeners.forEach((notify) => notify());
}

/** The language chosen in the header: English in the built page, the saved choice once the page is live. */
export function useLang(): Lang {
  return useSyncExternalStore(subscribe, getSnapshot, getBuiltSnapshot);
}

/** True once the component is running in the browser — for anything that depends on today's date. */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

/** The year the site was built; next.config.js records it. */
const BUILD_YEAR = Number(process.env.NEXT_PUBLIC_BUILD_YEAR) || 2026;

/** The current year: the build year in the built page, the visitor's own once the page is live. */
export function useThisYear(): number {
  const [year, setYear] = useState(BUILD_YEAR);
  useEffect(() => setYear(new Date().getFullYear()), []);
  return year;
}
