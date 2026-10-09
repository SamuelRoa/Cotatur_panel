import api from "./api";

export const siteService = {
  getSite: () => api.get("/site"),
  upsert: (data) => api.put("/site", data),
  getRegionesCms: () => api.get("/regiones-cms"),
  getRegionCms: (id) => api.get(`/regiones-cms/${id}`),
  upsertRegion: (data) => api.put("/regiones-cms", data),
};
