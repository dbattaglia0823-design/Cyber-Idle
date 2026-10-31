import { useEffect, useLayoutEffect, useRef, useState } from "react";

const prefix = "cyber-idle-ui-v1:";
export function readUiPreference<T>(key: string, fallback: T, allowed?: readonly T[]): T {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(prefix + key) ?? "null");
    if (allowed) return allowed.includes(value as T) ? value as T : fallback;
    if (fallback === null) return (value === null || typeof value === "string") ? value as T : fallback;
    return typeof value === typeof fallback ? value as T : fallback;
  } catch { return fallback; }
}
export function writeUiPreference(key: string, value: unknown) {
  try { localStorage.setItem(prefix + key, JSON.stringify(value)); } catch { /* Storage may be disabled. */ }
}
export function useRememberedState<T>(key: string, fallback: T, allowed?: readonly T[]) {
  const [value, setValue] = useState<T>(() => readUiPreference(key, fallback, allowed));
  useEffect(() => { writeUiPreference(key, value); }, [key, value]);
  return [value, setValue] as const;
}

export function useScreenScroll(key: string) {
  const position = useRef(0);
  useLayoutEffect(() => {
    let restoring = true;
    const saved = readUiPreference("scroll:" + key, 0);
    const target = Number.isFinite(saved) ? Math.max(0, saved) : 0;
    position.current = target;
    const first = requestAnimationFrame(() => {
      window.scrollTo({ top: target, behavior: "instant" }); restoring = false;
    });
    const record = () => { if (!restoring) position.current = window.scrollY; };
    const save = () => writeUiPreference("scroll:" + key, position.current);
    window.addEventListener("scroll", record, { passive: true });
    window.addEventListener("pagehide", save);
    return () => { cancelAnimationFrame(first); save(); window.removeEventListener("scroll", record); window.removeEventListener("pagehide", save); };
  }, [key]);
}
