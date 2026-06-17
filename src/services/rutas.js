import api from './api';

function mapRuta(r) {
  return {
    id: r.RUTA_COD,
    name: r.RUTA_NOM,
    description: r.RUTA_DES,
    durationHours: r.RUTA_DUH,
    distanceKm: r.RUTA_DIS,
    roadStatus: r.RUTA_VIA,
    tourismTypeId: r.RUTA_TTU,
    tourismType: r.TM_TITUR?.TITU_NOM,
    destinos: (r.TR_RUTDE || []).map((rd) => ({
      id: rd.RTDE_COD,
      destinoId: rd.RTDE_DES,
      order: rd.RTDE_ORD,
      name: rd.TM_DESTI?.DEST_NOM,
      lat: rd.TM_DESTI?.TM_UBDES?.UBDE_LAT ? Number(rd.TM_DESTI.TM_UBDES.UBDE_LAT) : null,
      lng: rd.TM_DESTI?.TM_UBDES?.UBDE_LON ? Number(rd.TM_DESTI.TM_UBDES.UBDE_LON) : null,
      municipio: rd.TM_DESTI?.TM_MUNIC?.MUNI_NOM,
      estado: rd.TM_DESTI?.TM_MUNIC?.TM_ESTADO?.ESTA_NOM,
      regionId: rd.TM_DESTI?.TM_MUNIC?.TM_ESTADO?.ESTA_REGI,
    })),
    _raw: r,
  };
}

export const rutasService = {
  getAll: async (params) => {
    const res = await api.get('/rutas', { params });
    const data = res.data || res;
    return {
      rutas: (data.rutas || []).map(mapRuta),
      meta: data.meta,
    };
  },
  getById: async (id) => {
    const res = await api.get(`/rutas/${id}`);
    return mapRuta(res.data || res);
  },
  create: (data) => api.post('/rutas', data),
  update: (id, data) => api.put(`/rutas/${id}`, data),
  delete: (id) => api.delete(`/rutas/${id}`),
};
