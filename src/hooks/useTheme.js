import { useCallback, useEffect, useState } from "react";

const KEY = "cotatur-theme";

function systemDark() {
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
}

function resolveDark(mode) {
  return mode === "oscuro" || (mode === "sistema" && systemDark());
}

export function useTheme() {
  const [mode, setMode] = useState(() => {
    try {
      return localStorage.getItem(KEY) || "sistema";
    } catch {
      return "sistema";
    }
  });

  useEffect(() => {
    const dark = resolveDark(mode);
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    document.documentElement.style.colorScheme = dark ? "dark" : "light";
    try {
      localStorage.setItem(KEY, mode);
    } catch {
      /* ignore */
    }
    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (mode === "sistema") {
        const d = systemDark();
        document.documentElement.dataset.theme = d ? "dark" : "light";
      }
    };
    mq?.addEventListener?.("change", onChange);
    return () => mq?.removeEventListener?.("change", onChange);
  }, [mode]);

  const cycle = useCallback(() => {
    setMode((m) => (m === "claro" ? "oscuro" : m === "oscuro" ? "sistema" : "claro"));
  }, []);

  return { mode, dark: resolveDark(mode), setMode, cycle };
}
