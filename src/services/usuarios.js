import api from './api';

function mapUsuario(u) {
  return {
    id: u.USUA_COD,
    name: u.USUAR_NM,
    email: u.USUAR_EM,
    active: u.USUAR_AC,
    roleId: u.USUAR_RO,
    roleName: u.TM_ROLES?.ROLE_NOM,
    estadoId: u.ESTA_COD ?? null,
    estadoName: u.TM_ESTADO?.ESTA_NOM ?? null,
    paisName: u.TM_PAISE?.PAIS_NOM,
    createdAt: u.USUAR_FR,
    regiones: (u.TR_USU_REGI || []).map((r) => ({
      id: r.TM_REGION?.REGI_COD,
      name: r.TM_REGION?.REGI_NOM,
    })),
    _raw: u,
  };
}

export const usuariosService = {
  getAll: async (params) => {
    const res = await api.get('/usuarios', { params });
    const data = res.data || res;
    return {
      usuarios: (data.usuarios || []).map(mapUsuario),
      meta: data.meta,
    };
  },
  getById: async (id) => {
    const res = await api.get(`/usuarios/${id}`);
    return mapUsuario(res.data || res);
  },
  create: (data) => api.post('/usuarios', data),
  update: (id, data) => api.put(`/usuarios/${id}`, data),
  delete: (id) => api.delete(`/usuarios/${id}`),
  getRoles: () => api.get('/usuarios/roles'),
  getPapelera: async (params) => {
    const res = await api.get('/usuarios/papelera', { params });
    const data = res.data || res;
    return { usuarios: (data.usuarios || []).map(u => ({ ...mapUsuario(u), deletedAt: u.deletedAt, deletedBy: u.deletedBy })), meta: data.meta };
  },
  restaurar: (id) => api.patch(`/usuarios/${id}/restaurar`),
  deletePermanente: (id) => api.delete(`/usuarios/${id}/permanente`),
};
