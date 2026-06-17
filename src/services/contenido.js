import api from './api';

function mapInstitucional(c) {
  return {
    id: c.CINS_COD,
    titulo: c.CINS_TIT,
    tipo: c.CINS_TCO,
    descripcion: c.CINS_DES,
    url: c.CINS_URL,
    fecha: c.CINS_FPU,
    autorName: c.TM_USUAR?.USUAR_NM,
    _raw: c,
  };
}

function mapTuristico(c) {
  return {
    id: c.CTUR_COD,
    titulo: c.CTUR_TIT,
    tipo: c.CTUR_TCO,
    descripcion: c.CTUR_DES,
    url: c.CTUR_URL,
    fecha: c.CTUR_FPU,
    autorName: c.TM_USUAR?.USUAR_NM,
    destinoId: c.CTUR_DET,
    destinoName: c.TM_DESTI?.DEST_NOM,
    _raw: c,
  };
}

export const contenidoService = {
  // Institucional
  getInstitucional: async (params) => {
    const res = await api.get('/contenido/institucional', { params });
    const data = res.data || res;
    return {
      contenidos: (data.contenidos || []).map(mapInstitucional),
      meta: data.meta,
    };
  },
  createInstitucional: (data) => api.post('/contenido/institucional', data),
  updateInstitucional: (id, data) => api.put(`/contenido/institucional/${id}`, data),
  deleteInstitucional: (id) => api.delete(`/contenido/institucional/${id}`),

  // Turístico
  getTuristico: async (params) => {
    const res = await api.get('/contenido/turistico', { params });
    const data = res.data || res;
    return {
      contenidos: (data.contenidos || []).map(mapTuristico),
      meta: data.meta,
    };
  },
  createTuristico: (data) => api.post('/contenido/turistico', data),
  updateTuristico: (id, data) => api.put(`/contenido/turistico/${id}`, data),
  deleteTuristico: (id) => api.delete(`/contenido/turistico/${id}`),
};
