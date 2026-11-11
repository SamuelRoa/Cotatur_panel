import { useCallback, useEffect, useRef, useState } from "react";
import api from "../services/api";
import { connectionEvents, sessionEvents } from "../lib/connection";
import { useFeedback } from "./feedbackContext.js";

/**
 * Banner global de conectividad del panel.
 *
 * Indica en todo momento si hay comunicación con el backend:
 *  - "down-net": sin internet en el equipo (evento offline del navegador).
 *  - "down-server": el backend no respondió (red caída, servicio detenido…).
 *  - Al recuperarse, confirma con un toast de éxito.
 *
 * El estado lo alimentan los interceptores de api.js con cada petición real.
 * También recoge el aviso de sesión expirada cuando falla el refresh del
 * token. Cuando todo está bien no ocupa espacio (renderiza null).
 */
export function ConnectionBanner() {
  const [status, setStatus] = useState(connectionEvents.status);
  const [checking, setChecking] = useState(false);
  const { toast } = useFeedback();
  const prevStatus = useRef(status);

  useEffect(() => connectionEvents.subscribe(setStatus), []);

  // El navegador avisa por su cuenta cuando cambia el internet del equipo.
  useEffect(() => {
    const goOffline = () => connectionEvents.down("net");
    const goOnline = () => connectionEvents.up();
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  // Confirmación al pasar de "caído" a "restablecido".
  useEffect(() => {
    if (prevStatus.current !== "up" && status === "up") {
      toast.success("Conexión restablecida con el servidor.", { title: "Conectado" });
    }
    prevStatus.current = status;
  }, [status, toast]);

  // La sesión expiró tras un fallo de refresh: un solo aviso.
  useEffect(
    () =>
      sessionEvents.subscribe(() => {
        toast.warning("Tu sesión expiró. Inicia sesión de nuevo para continuar.", {
          title: "Sesión cerrada",
        });
      }),
    [toast],
  );

  const check = useCallback(async () => {
    setChecking(true);
    try {
      await api.get("/health", { timeout: 8000 });
      connectionEvents.up();
    } catch (err) {
      toast.error(err.message || "El servidor sigue sin responder.", {
        title: "Comprobación manual",
      });
      connectionEvents.down(navigator.onLine ? "server" : "net");
    } finally {
      setChecking(false);
    }
  }, [toast]);

  if (status === "up") return null;

  const isNet = status === "down-net";
  return (
    <div className={`connection-banner ${isNet ? "connection-banner--net" : "connection-banner--server"}`} role="status" aria-live="polite">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {isNet ? (
          <>
            <line x1="1" y1="1" x2="23" y2="23" />
            <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55M5 12.55a10.94 10.94 0 0 1 5.17-2.39M10.71 5.05A16 16 0 0 1 22.58 9M1.42 9a15.91 15.91 0 0 1 4.7-2.88M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01" />
          </>
        ) : (
          <>
            <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
            <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
            <line x1="6" y1="6" x2="6.01" y2="6" />
            <line x1="6" y1="18" x2="6.01" y2="18" />
          </>
        )}
      </svg>
      <span className="connection-banner__text">
        {isNet
          ? "Sin conexión a internet en este equipo. Los datos no se cargarán hasta que se restablezca."
          : "No hay conexión con el servidor. No se pueden cargar ni guardar datos en este momento."}
      </span>
      <button type="button" className="connection-banner__retry" onClick={check} disabled={checking}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={checking ? "connection-banner__spin" : undefined} aria-hidden="true">
          <polyline points="23 4 23 10 17 10" />
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
        </svg>
        {checking ? "Comprobando…" : "Reintentar"}
      </button>
    </div>
  );
}
