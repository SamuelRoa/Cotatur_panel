import api from './api';

function mapEvento(e) {
  return {
    id: e.EVEN_COD,
    title: e.EVEN_NOM,
    description: e.EVEN_DES,
    date: e.EVEN_FI,
    endDate: e.EVEN_FF,
    eventTypeId: e.EVEN_TE,
    eventType: e.TM_TIEVE?.TIEV_NOM,
    destinoId: e.EVEN_DI,
    destinoName: e.TM_DESTI?.DEST_NOM,
    municipality: e.TM_DESTI?.TM_MUNIC?.MUNI_NOM,
    _raw: e,
  };
}

export const eventosService = {
  getAll: async (params) => {
    const res = await api.get('/eventos', { params });
    const data = res.data || res;
    return {
      eventos: (data.eventos || []).map(mapEvento),
      meta: data.meta,
    };
  },
  getById: async (id) => {
    const res = await api.get(`/eventos/${id}`);
    return mapEvento(res.data || res);
  },
  create: (data) => api.post('/eventos', data),
  update: (id, data) => api.put(`/eventos/${id}`, data),
  delete: (id) => api.delete(`/eventos/${id}`),
};
