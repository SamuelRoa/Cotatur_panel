/**
 * Bus de estado de conexión con el backend.
 *
 * api.js emite: cualquier respuesta OK = servidor arriba; cualquier fallo de
 * red/timeout = servidor abajo. ConnectionBanner escucha y pinta el estado,
 * así que refleja la realidad de las peticiones reales del panel.
 */

const listeners = new Set();
let currentStatus = "up"; // 'up' | 'down-server' | 'down-net'

export const connectionEvents = {
  get status() {
    return currentStatus;
  },
  up() {
    if (currentStatus === "up") return;
    currentStatus = "up";
    listeners.forEach((l) => l(currentStatus));
  },
  down(kind = "server") {
    const next = kind === "net" ? "down-net" : "down-server";
    if (currentStatus === next || (currentStatus === "down-net" && next === "down-server")) return;
    currentStatus = next;
    listeners.forEach((l) => l(currentStatus));
  },
  subscribe(l) {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  },
};

// ─── Aviso de sesión expirada ───────────────────────────────────────────────
// api.js lo emite cuando un refresh de token falla habiendo sesión activa;
// no se puede avisar con toast desde fuera de React, así que lo recoge el
// ConnectionBanner (siempre montado) y lo muestra con useFeedback.

const sessionListeners = new Set();

export const sessionEvents = {
  expired() {
    sessionListeners.forEach((l) => l());
  },
  subscribe(l) {
    sessionListeners.add(l);
    return () => {
      sessionListeners.delete(l);
    };
  },
};

// Deduplicación de avisos repetidos: si varias peticiones fallan a la vez
// (un listado que dispara 3 llamadas), solo se muestra un aviso por clave.
const lastShown = new Map();
const DEDUP_MS = 4000;

export function shouldNotify(key) {
  const now = Date.now();
  const prev = lastShown.get(key) ?? 0;
  lastShown.set(key, now);
  if (lastShown.size > 50) {
    for (const [k, t] of lastShown) if (now - t > DEDUP_MS) lastShown.delete(k);
  }
  return now - prev >= DEDUP_MS;
}
