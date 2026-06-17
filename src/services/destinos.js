import api from './api';

function mapDestino(d) {
  return {
    id: d.DEST_COD,
    name: d.DEST_NOM,
    description: d.DEST_DES,
    roadStatus: d.DEST_VIA,
    tourismTypeId: d.DEST_TTU,
    tourismType: d.TM_TITUR?.TITU_NOM,
    municipalityId: d.DEST_MUN,
    municipality: d.TM_MUNIC?.MUNI_NOM,
    estado: d.TM_MUNIC?.TM_ESTADO?.ESTA_NOM,
    regionId: d.TM_MUNIC?.TM_ESTADO?.ESTA_REGI,
    lat: d.TM_UBDES?.UBDE_LAT ? Number(d.TM_UBDES.UBDE_LAT) : null,
    lng: d.TM_UBDES?.UBDE_LON ? Number(d.TM_UBDES.UBDE_LON) : null,
    address: d.TM_UBDES?.UBDE_DIR,
    _raw: d,
  };
}

export const destinosService = {
  getAll: async (params) => {
    const res = await api.get('/destinos', { params });
    const data = res.data || res;
    return {
      destinos: (data.destinos || []).map(mapDestino),
      meta: data.meta,
    };
  },
  getById: async (id) => {
    const res = await api.get(`/destinos/${id}`);
    return mapDestino(res.data || res);
  },
  create: (data) => api.post('/destinos', data),
  update: (id, data) => api.put(`/destinos/${id}`, data),
  delete: (id) => api.delete(`/destinos/${id}`),
};
