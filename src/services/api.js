import axios from "axios";

const baseURL =
  import.meta.env.MODE === "production"
    ? import.meta.env.VITE_API_URL_PROD
    : import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshing = null;

async function tryRefresh() {
  if (!refreshing) {
    refreshing = (async () => {
      const refreshToken = localStorage.getItem("auth_refresh");
      if (!refreshToken) return null;
      try {
        const res = await axios.post(`${baseURL}/auth/refresh`, { refreshToken }, { timeout: 15000 });
        const data = res.data?.data || res.data;
        if (data?.accessToken) {
          localStorage.setItem("auth_token", data.accessToken);
          if (data.refreshToken) localStorage.setItem("auth_refresh", data.refreshToken);
          return data.accessToken;
        }
        return null;
      } catch {
        return null;
      } finally {
        refreshing = null;
      }
    })();
  }
  return refreshing;
}

function logout() {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("auth_refresh");
  localStorage.removeItem("auth_user");
}

function friendlyError(error) {
  if (error.code === "ECONNABORTED" || /timeout/i.test(error.message || "")) {
    return "El servidor tardó demasiado en responder. Intenta de nuevo.";
  }
  if (!error.response || error.code === "ERR_NETWORK") {
    return "No se pudo conectar con el servidor. Verifica tu conexión e intenta de nuevo.";
  }
  return error.message || "Error inesperado. Intenta de nuevo.";
}

api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && original && !original._retried) {
      original._retried = true;
      const token = await tryRefresh();
      if (token) {
        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      }
      logout();
    }
    const message = error.response?.data?.message || friendlyError(error);
    return Promise.reject(new Error(message));
  },
);

export default api;
