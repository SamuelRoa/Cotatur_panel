import api from './api';

/**
 * Routing vía el proxy del backend (`/api/geo/route`).
 * El backend llama a OSRM y, sin conexión, responde con línea recta
 * (fuente: 'recta'); el trazado persiste en TM_RUTAT.RUTA_GEO al guardar.
 */
export const routingService = {
  trazar: async (waypoints) => {
    const res = await api.post('/geo/route', { waypoints });
    const data = res.data || res;
    return data; // { fuente, geometria, distanciaKm, duracionHoras, detalle? }
  },
};
