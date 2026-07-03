import api from './api';

function mapPrestador(p) {
  return {
    id: p.PROV_COD,
    name: p.PROV_NOM,
    category: p.PROV_TSE === 'hosped' ? 'Alojamiento Turístico'
      : p.PROV_TSE === 'rest' ? 'Gastronomía Regional'
      : p.PROV_TSE === 'transp' ? 'Transporte Turístico'
      : p.PROV_TSE === 'agencia' ? 'Agencia de Viajes'
      : p.PROV_TSE === 'guia' ? 'Guía de Turismo'
      : 'Otros',
    tipo: p.PROV_TSE,
    rif: p.PROV_RIF,
    phone: p.PROV_TEL,
    email: p.PROV_EMA,
    web: p.PROV_WEB,
    status: p.PROV_ESV === 'pend' ? 'pendiente' : p.PROV_ESV,
    municipalityId: p.PROV_MUN,
    municipality: p.TM_MUNIC?.MUNI_NOM,
    estado: p.TM_MUNIC?.TM_ESTADO?.ESTA_NOM,
    regionId: p.TM_MUNIC?.TM_ESTADO?.ESTA_REGI,
    lat: p.TM_UBSER?.UBSR_LAT ? Number(p.TM_UBSER.UBSR_LAT) : null,
    lng: p.TM_UBSER?.UBSR_LON ? Number(p.TM_UBSER.UBSR_LON) : null,
    address: p.TM_UBSER?.UBSR_DIR,
    subtipo: p.subtipo,
    hospe: p.TM_HOSPE ? {
      categoria: p.TM_HOSPE.HOSP_CAT,
      numHabitaciones: p.TM_HOSPE.HOSP_NDH,
      horario: p.TM_HOSPE.HOSP_HOR,
    } : null,
    gastr: p.TM_GASTR ? {
      tipoGastronomia: p.TM_GASTR.GAST_TIG,
      horario: p.TM_GASTR.GAST_HOR,
    } : null,
    trans: p.TM_TRANS ? {
      tipoVehiculo: p.TM_TRANS.TRAN_TVE,
      capacidad: p.TM_TRANS.TRAN_CPA,
      ruc: p.TM_TRANS.TRAN_RUC,
    } : null,
    _raw: p,
  };
}

export const prestadoresService = {
  getAll: async (params) => {
    const res = await api.get('/prestadores', { params });
    const data = res.data || res;
    return {
      prestadores: (data.prestadores || []).map(mapPrestador),
      meta: data.meta,
    };
  },
  getById: async (id) => {
    const res = await api.get(`/prestadores/${id}`);
    return mapPrestador(res.data || res);
  },
  create: (data) => api.post('/prestadores', data),
  update: (id, data) => api.put(`/prestadores/${id}`, data),
  updateEstado: (id, estado) => api.put(`/prestadores/${id}/estado`, { estado }),
  delete: (id) => api.delete(`/prestadores/${id}`),
};
