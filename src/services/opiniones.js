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
};
