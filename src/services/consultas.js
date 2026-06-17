import api from './api';

function mapConsulta(c) {
  return {
    id: c.CONS_COD,
    contenido: c.CONS_CON,
    respuesta: c.CONS_RES,
    canal: c.CONS_CAN,
    estado: c.CONS_EST,
    fecha: c.CONS_FYH,
    usuarioId: c.CONS_USU,
    usuarioName: c.TM_USUAR_CONS_USU?.USUAR_NM,
    usuarioEmail: c.TM_USUAR_CONS_USU?.USUAR_EM,
    atendedorName: c.TM_USUAR_CONS_ATE?.USUAR_NM,
    _raw: c,
  };
}

export const consultasService = {
  getAll: async (params) => {
    const res = await api.get('/consultas', { params });
    const data = res.data || res;
    return {
      consultas: (data.consultas || []).map(mapConsulta),
      meta: data.meta,
    };
  },
  getById: async (id) => {
    const res = await api.get(`/consultas/${id}`);
    return mapConsulta(res.data || res);
  },
  create: (data) => api.post('/consultas', data),
  responder: (id, data) => api.put(`/consultas/${id}/responder`, data),
};
