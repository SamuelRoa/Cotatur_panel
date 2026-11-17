import api from './api';

/**
 * Servicio de telemetría de popularidad (mapa de calor).
 * Consulta los agregados de TM_MEVEN que genera el backend.
 */
export const metricasService = {
  /**
   * GET /api/metricas/calor?desde&hasta&tipo
   * Devuelve { puntos, topEtiquetas, conteoTipos, total }.
   * puntos: [[lat, lng, peso], ...] listo para leaflet.heat.
   */
  calor: async (params = {}) => {
    const res = await api.get('/metricas/calor', { params });
    const data = res.data || res;
    return {
      puntos: (data?.puntos || []).map(([lat, lng, peso]) => [
        Number(lat),
        Number(lng),
        Number(peso) || 1,
      ]),
      topEtiquetas: data?.topEtiquetas || [],
      conteoTipos: data?.conteoTipos || [],
      total: Number(data?.total) || 0,
    };
  },
};
