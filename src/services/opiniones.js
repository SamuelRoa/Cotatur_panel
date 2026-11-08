import api from './api';

function mapOpinion(o) {
  return {
    id: o.RECO_COD,
    calificacion: o.RECO_CAL,
    comentario: o.RECO_COM,
    fecha: o.RECO_FEO,
    usuarioId: o.RECO_USU,
    usuarioName: o.TM_USUAR?.USUAR_NM,
    destinoId: o.RECO_DES,
    destinoName: o.TM_DESTI?.DEST_NOM,
    _raw: o,
  };
}

export const opinionesService = {
  getAll: async (params) => {
    const res = await api.get('/opiniones', { params });
    const data = res.data || res;
    return {
      opiniones: (data.opiniones || []).map(mapOpinion),
      meta: data.meta,
    };
  },
  create: (data) => api.post('/opiniones', data),
  delete: (id) => api.delete(`/opiniones/${id}`),
  getPapelera: async (params) => {
    const res = await api.get('/opiniones/papelera', { params });
    const data = res.data || res;
    return { opiniones: (data.opiniones || []).map(o => ({ ...mapOpinion(o), deletedAt: o.deletedAt, deletedBy: o.deletedBy })), meta: data.meta };
  },
  restaurar: (id) => api.patch(`/opiniones/${id}/restaurar`),
  deletePermanente: (id) => api.delete(`/opiniones/${id}/permanente`),
};
