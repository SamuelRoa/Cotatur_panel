import { useCallback, useSyncExternalStore } from "react";

const KEY = "cotatur-theme";

function systemDark() {
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
}

function resolveDark(mode) {
  return mode === "oscuro" || (mode === "sistema" && systemDark());
}

function readStoredMode() {
  try {
    return localStorage.getItem(KEY) || "sistema";
  } catch {
    return "sistema";
  }
}

let listeners = [];
let snapshot = { mode: "sistema", dark: false };

function emit() {
  listeners.forEach((listener) => listener());
}

function apply(next, persist) {
  const dark = resolveDark(next);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
  if (persist) {
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* ignore */
    }
  }
  snapshot = { mode: next, dark };
  emit();
}

if (typeof document !== "undefined") {
  const initial = readStoredMode();
  snapshot = { mode: initial, dark: resolveDark(initial) };
  document.documentElement.dataset.theme = snapshot.dark ? "dark" : "light";
  document.documentElement.style.colorScheme = snapshot.dark ? "dark" : "light";
  const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
  mq?.addEventListener?.("change", () => {
    if (snapshot.mode === "sistema") apply("sistema", false);
  });
}

export function useTheme() {
  const subscribe = useCallback((listener) => {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, []);

  const getSnapshot = useCallback(() => snapshot, []);
  const getServerSnapshot = useCallback(() => snapshot, []);

  const { mode, dark } = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setMode = useCallback((next) => apply(next, true), []);
  const cycle = useCallback(() => {
    const current = snapshot.mode;
    apply(current === "claro" ? "oscuro" : current === "oscuro" ? "sistema" : "claro", true);
  }, []);

  return { mode, dark, setMode, cycle };
}
