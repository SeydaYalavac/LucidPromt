"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "whats-happening:saved-trends";
const CHANGE_EVENT = "whats-happening:saved-trends-change";
const EMPTY: string[] = [];
let cachedRaw = "";
let cachedValue: string[] = EMPTY;

function getSnapshot() {
  const raw = window.localStorage.getItem(STORAGE_KEY) || "[]";
  if (raw === cachedRaw) return cachedValue;
  cachedRaw = raw;
  try {
    const value = JSON.parse(raw);
    cachedValue = Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : EMPTY;
  } catch {
    cachedValue = EMPTY;
  }
  return cachedValue;
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => { window.removeEventListener("storage", callback); window.removeEventListener(CHANGE_EVENT, callback); };
}

export function useSavedTrends() {
  const saved = useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
  const toggleSaved = useCallback((slug: string) => {
    const current = getSnapshot();
    const next = current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug];
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    cachedRaw = "";
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);
  return { saved, toggleSaved };
}
