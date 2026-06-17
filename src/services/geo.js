import api from './api';

export const geoService = {
  getRegiones: (params) => api.get('/geo/regiones', { params }),
  getEstados: (params) => api.get('/geo/estados', { params }),
  getMunicipios: (params) => api.get('/geo/municipios', { params }),
  getParroquias: (params) => api.get('/geo/parroquias', { params }),
  getCorporaciones: (params) => api.get('/geo/corporaciones', { params }),
  getPaises: (params) => api.get('/geo/paises', { params }),
  getTiposTurismo: (params) => api.get('/geo/tipos-turismo', { params }),
  getTiposEvento: (params) => api.get('/geo/tipos-evento', { params }),
};
