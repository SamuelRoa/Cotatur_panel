import api from './api';

function mapPrestador(p) {
  return {
    id: p.PROV_COD,
    name: p.PROV_NOM,
    category: p.PROV_TSE, // código del catálogo TM_TIPR (ej. 'hosped')
    categoryLabel: p.TIPO_NOM || p.PROV_TSE,
    tipo: p.PROV_TSE,
    rif: p.PROV_RIF,
    phone: p.PROV_TEL,
    email: p.PROV_EMA,
    web: p.PROV_WEB,
    status: p.PROV_ESV === 'pend' ? 'pendiente' : p.PROV_ESV,
    descripcion: p.PROV_DES,
    horaApertura: p.PROV_HOA,
    horaCierre: p.PROV_HOC,
    diasAtencion: p.PROV_DIA ? p.PROV_DIA.split(',') : [],
    sedes: p.PROV_SED,
    capacidad: p.PROV_CAP,
    servicios: p.PROV_SER ? p.PROV_SER.split(',') : [],
    foto: p.PROV_FOT,
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
    atrac: p.TM_ATRAC ? {
      tipoAtraccion: p.TM_ATRAC.ATRA_TAT,
      capacidad: p.TM_ATRAC.ATRA_CAP,
      horario: p.TM_ATRAC.ATRA_HOR,
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
  // Catálogo de tipos de prestador (TM_TIPR). Con { todos: true } incluye
  // inactivos (solo Administrador).
  getTipos: async (params) => {
    const res = await api.get('/prestadores/tipos', { params });
    const data = res.data || res;
    return data.tipos || [];
  },
  create: (data) => api.post('/prestadores', data),
  update: (id, data) => api.put(`/prestadores/${id}`, data),
  updateEstado: (id, estado) => api.put(`/prestadores/${id}/estado`, { estado }),
  delete: (id) => api.delete(`/prestadores/${id}`),
  getPapelera: async (params) => {
    const res = await api.get('/prestadores/papelera', { params });
    const data = res.data || res;
    return { prestadores: (data.prestadores || []).map(p => ({ ...mapPrestador(p), deletedAt: p.deletedAt, deletedBy: p.deletedBy })), meta: data.meta };
  },
  restaurar: (id) => api.patch(`/prestadores/${id}/restaurar`),
  deletePermanente: (id) => api.delete(`/prestadores/${id}/permanente`),
};
