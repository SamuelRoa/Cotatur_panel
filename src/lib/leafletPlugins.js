import L from "leaflet";

// Los plugins clásicos de Leaflet (markercluster, heat) esperan el global `L`.
if (typeof window !== "undefined" && !window.L) {
  window.L = L;
}

export default L;
