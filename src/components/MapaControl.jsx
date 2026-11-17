import { useEffect, useMemo, useRef, useState } from 'react'
import { MapContainer, TileLayer, Polyline, Tooltip, useMap } from 'react-leaflet'
import L from 'leaflet'
import '../lib/leafletPlugins'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster'
import 'leaflet.heat'
import { useTheme } from '../hooks/useTheme'
import { lightenHex, useRouteGeometries } from '../lib/routeGeometry'
import { destinosService } from '../services/destinos'
import { prestadoresService } from '../services/prestadores'
import { rutasService } from '../services/rutas'
import { eventosService } from '../services/eventos'
import { metricasService } from '../services/metricas'
import { useFeedback } from './feedbackContext.js'

const CARTO_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attribution/">CARTO</a>'

const CHOROPLETH_SCALE = [
  { limit: 0, color: '#e2e8f0', label: '0' },
  { limit: 3, color: '#bbf7d0', label: '1–3' },
  { limit: 8, color: '#4ade80', label: '4–8' },
  { limit: 15, color: '#16a34a', label: '9–15' },
  { limit: Infinity, color: '#15803d', label: '16+' },
]

const PRESTADOR_COLORS = {
  validado: '#16a34a',
  pendiente: '#eab308',
  rechazado: '#ef4444',
}

const RUTA_COLORS = ['#F37021', '#7E2E90', '#0EA5E9', '#16A34A', '#DC2626', '#CA8A04', '#4F46E5', '#059669']

// Períodos y tipos de evento del mapa de calor (telemetría TM_MEVEN).
const PERIODOS_CALOR = [
  { key: '7', label: 'Últimos 7 días', dias: 7 },
  { key: '30', label: 'Últimos 30 días', dias: 30 },
  { key: '90', label: 'Últimos 90 días', dias: 90 },
  { key: '365', label: 'Último año', dias: 365 },
]

const TIPOS_EVENTO = [
  { key: '', label: 'Todos los eventos' },
  { key: 'ver_destino', label: 'Vistas de destinos' },
  { key: 'ver_evento', label: 'Vistas de eventos' },
  { key: 'busqueda', label: 'Búsquedas' },
  { key: 'itinerario', label: 'Itinerarios generados' },
  { key: 'ruta_trazada', label: 'Rutas trazadas' },
  { key: 'pois_consulta', label: 'Servicios en ruta' },
]

const NOMBRE_TIPO = Object.fromEntries(TIPOS_EVENTO.filter((t) => t.key).map((t) => [t.key, t.label]))

const CALOR_VACIO = { puntos: [], topEtiquetas: [], conteoTipos: [], total: 0 }

function normName(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function colorForCount(count) {
  return CHOROPLETH_SCALE.find((s) => count < s.limit)?.color ?? '#15803d'
}

function roadColor(status) {
  const s = normName(status)
  if (s.includes('mal')) return '#ef4444'
  if (s.includes('regul')) return '#eab308'
  if (s.includes('buen')) return '#16a34a'
  return '#2563eb'
}

function hasCoords(item) {
  const lat = Number(item.lat)
  const lng = Number(item.lng)
  return Number.isFinite(lat) && Number.isFinite(lng) && lat !== 0 && lng !== 0
}

async function fetchAllPages(fetchFn, key, params = {}, maxPages = 20) {
  const all = []
  for (let page = 1; page <= maxPages; page++) {
    const res = await fetchFn({ ...params, page, limit: 100 })
    const chunk = res?.[key] ?? []
    all.push(...chunk)
    if (!res?.meta?.hasNextPage || chunk.length === 0) break
  }
  return all
}

function ClusterLayer({ items }) {
  const map = useMap()
  useEffect(() => {
    if (!items.length) return undefined
    const group = L.markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 48,
      iconCreateFunction: (cluster) =>
        L.divIcon({
          html: `<div class="mintur-cluster">${cluster.getChildCount()}</div>`,
          className: 'mintur-cluster-wrap',
          iconSize: L.point(38, 38),
          iconAnchor: L.point(19, 19),
        }),
    })
    const markers = items.map((it) =>
      L.marker([it.lat, it.lng], {
        icon: L.divIcon({
          html: `<div class="mintur-dot" style="background:${it.color}"></div>`,
          className: 'mintur-dot-wrap',
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        }),
        title: it.title,
      }).bindPopup(it.popup),
    )
    group.addLayers(markers)
    map.addLayer(group)
    return () => map.removeLayer(group)
  }, [map, items])
  return null
}

function HeatLayer({ points, dark }) {
  const map = useMap()
  useEffect(() => {
    if (!points.length) return undefined
    // Peso normalizado al máximo: los hotspots dominan el gradiente.
    const maxPeso = Math.max(...points.map((p) => p[2]), 1)
    const layer = L.heatLayer(points, {
      radius: 30,
      blur: 22,
      maxZoom: 11,
      minOpacity: 0.25,
      max: maxPeso,
      gradient: dark
        ? { 0.2: '#7e22ce', 0.4: '#a855f7', 0.6: '#f37021', 0.8: '#fbbf24', 1: '#fef08a' }
        : { 0.2: '#4ade80', 0.5: '#facc15', 0.75: '#f37021', 1: '#dc2626' },
    })
    map.addLayer(layer)
    return () => map.removeLayer(layer)
  }, [map, points, dark])
  return null
}

function ChoroplethLayer({ geo, counts, selected, onSelect, metricaNombre }) {
  const map = useMap()
  useEffect(() => {
    if (!geo) return undefined
    const layer = L.geoJSON(geo, {
      style: (feature) => {
        const name = feature?.properties?.shapeName ?? ''
        const isSelected = selected && normName(selected) === normName(name)
        return {
          fillColor: colorForCount(counts.get(normName(name)) ?? 0),
          weight: isSelected ? 2.5 : 1,
          color: isSelected ? '#0ea5e9' : '#64748b',
          fillOpacity: 0.55,
        }
      },
      onEachFeature: (feature, lyr) => {
        const name = feature?.properties?.shapeName ?? ''
        const n = counts.get(normName(name)) ?? 0
        lyr.bindTooltip(`${name} · ${n} ${metricaNombre}${n === 1 ? '' : 's'}`, { sticky: true })
        lyr.on('click', () => onSelect(name))
      },
    })
    map.addLayer(layer)
    return () => map.removeLayer(layer)
  }, [geo, counts, selected, onSelect, metricaNombre, map])
  return null
}

function FitBounds({ bounds }) {
  const map = useMap()
  useEffect(() => {
    if (bounds && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 9 })
    }
  }, [bounds, map])
  return null
}

function countByEstado(items) {
  const map = new Map()
  for (const item of items) {
    const key = normName(item.estado)
    if (!key) continue
    map.set(key, (map.get(key) ?? 0) + 1)
  }
  return map
}

export default function MapaControl({ regionId = null, regionName = 'Visión Nacional' }) {
  const { dark } = useTheme()
  const { toast } = useFeedback()
  const loadErrorRef = useRef(false)
  const cartoKey = import.meta.env.VITE_CARTO_API_KEY || ''

  const [loadedKey, setLoadedKey] = useState(null)
  const [destinos, setDestinos] = useState([])
  const [prestadores, setPrestadores] = useState([])
  const [rutas, setRutas] = useState([])
  const [eventos, setEventos] = useState([])
  const [geo, setGeo] = useState(null)
  const [selectedState, setSelectedState] = useState(null)
  // Métrica que colorea la coropleta (análisis multi-capa).
  const [metrica, setMetrica] = useState('destinos')
  // Mapa de calor de popularidad (telemetría anónima TM_MEVEN).
  const [periodoCalor, setPeriodoCalor] = useState('30')
  const [tipoCalor, setTipoCalor] = useState('')
  const [calor, setCalor] = useState(CALOR_VACIO)
  const [calorClave, setCalorClave] = useState('')
  const [layers, setLayers] = useState({
    coropleta: true,
    destinos: true,
    prestadores: true,
    eventos: false,
    rutas: true,
    heat: false,
    flujos: true,
  })

  // Configuración de métricas de la coropleta (derivadas de datos reales).
  const METRICAS = useMemo(() => ([
    { key: 'destinos', label: 'Destinos por estado', nombre: 'destino' },
    { key: 'prestadores', label: 'Prestadores por estado', nombre: 'prestador' },
    { key: 'pendientes', label: 'Pendientes de validar', nombre: 'prestador pendiente' },
    { key: 'eventos', label: 'Eventos por estado', nombre: 'evento' },
    { key: 'rutas', label: 'Rutas que tocan el estado', nombre: 'ruta' },
  ]), [])

  useEffect(() => {
    let cancelled = false
    fetch('/geo/estados-venezuela.geojson')
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('geojson'))))
      .then((data) => { if (!cancelled) setGeo(data) })
      .catch(() => { if (!cancelled) setGeo(null) })
    return () => { cancelled = true }
  }, [])

  const regionKey = regionId ? String(regionId) : 'nacional'

  // Carga de la telemetría solo cuando la capa de calor está activa.
  const claveCalor = `${periodoCalor}|${tipoCalor}`
  useEffect(() => {
    if (!layers.heat) return undefined
    let cancelled = false
    const dias = (PERIODOS_CALOR.find((p) => p.key === periodoCalor) ?? PERIODOS_CALOR[1]).dias
    const desde = new Date(Date.now() - dias * 86400000).toISOString()
    metricasService
      .calor({ desde, tipo: tipoCalor || undefined })
      .then((d) => {
        if (!cancelled) setCalor(d)
      })
      .catch(() => {
        if (!cancelled && !loadErrorRef.current) {
          loadErrorRef.current = true
          toast.error('No se pudo cargar el mapa de calor. Verifica tu conexión e intenta de nuevo.', {
            title: 'Error de conexión',
          })
        }
        if (!cancelled) setCalor(CALOR_VACIO)
      })
      .finally(() => {
        if (!cancelled) setCalorClave(claveCalor)
      })
    return () => {
      cancelled = true
    }
  }, [layers.heat, claveCalor]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let cancelled = false
    const params = regionId ? { regionId } : {}
    let failed = 0
    Promise.all([
      fetchAllPages(destinosService.getAll, 'destinos', params).catch(() => { failed += 1; return [] }),
      fetchAllPages(prestadoresService.getAll, 'prestadores', params).catch(() => { failed += 1; return [] }),
      fetchAllPages(rutasService.getAll, 'rutas', params).catch(() => { failed += 1; return [] }),
      fetchAllPages(eventosService.getAll, 'eventos', params).catch(() => { failed += 1; return [] }),
    ]).then(([d, p, r, e]) => {
      if (cancelled) return
      if (failed > 0 && !loadErrorRef.current) {
        loadErrorRef.current = true
        toast.error('No se pudo cargar toda la información del mapa. Verifica tu conexión e intenta de nuevo.', { title: 'Error de conexión' })
      } else if (failed === 0) {
        loadErrorRef.current = false
      }
      setDestinos(d)
      setPrestadores(p)
      setRutas(r)
      setEventos(e)
      setSelectedState(null)
      setLoadedKey(regionKey)
    })
    return () => { cancelled = true }
  }, [regionId, regionKey, toast])

  const loading = loadedKey !== regionKey

  const destinosConCoords = useMemo(() => destinos.filter(hasCoords), [destinos])
  const prestadoresConCoords = useMemo(() => prestadores.filter(hasCoords), [prestadores])

  const coordsByDestino = useMemo(() => {
    const map = new Map()
    destinosConCoords.forEach((d) => map.set(d.id, d))
    return map
  }, [destinosConCoords])

  const eventosConCoords = useMemo(
    () => eventos.map((e) => {
      const d = coordsByDestino.get(e.destinoId)
      return d ? { ...e, lat: d.lat, lng: d.lng } : null
    }).filter(Boolean),
    [eventos, coordsByDestino],
  )

  const countsDestinos = useMemo(() => countByEstado(destinos), [destinos])
  const countsPrestadores = useMemo(() => countByEstado(prestadores), [prestadores])

  // Conteos por estado según la métrica activa de la coropleta.
  const countsMetrica = useMemo(() => {
    if (metrica === 'destinos') return countsDestinos
    if (metrica === 'prestadores') return countsPrestadores
    if (metrica === 'eventos') return countByEstado(eventos)
    if (metrica === 'pendientes') {
      return countByEstado(prestadores.filter((p) => normName(p.status) === 'pendiente'))
    }
    if (metrica === 'rutas') {
      // Una ruta "toca" a todos los estados de sus paradas.
      const map = new Map()
      for (const r of rutas) {
        const estados = new Set(
          (r.destinos ?? []).map((s) => normName(s.estado)).filter(Boolean),
        )
        for (const e of estados) map.set(e, (map.get(e) ?? 0) + 1)
      }
      return map
    }
    return countsDestinos
  }, [metrica, countsDestinos, countsPrestadores, eventos, prestadores, rutas])

  const metricaActual = METRICAS.find((m) => m.key === metrica) ?? METRICAS[0]

  // Centroides de cada estado a partir del GeoJSON (para dibujar flujos).
  const centroides = useMemo(() => {
    const map = new Map()
    if (!geo?.features) return map
    for (const f of geo.features) {
      const name = normName(f.properties?.shapeName)
      if (!name || map.has(name)) continue
      try {
        const center = L.geoJSON(f).getBounds().getCenter()
        map.set(name, [center.lat, center.lng])
      } catch {
        /* geometría inválida: se omite el estado */
      }
    }
    return map
  }, [geo])

  // Flujos entre estados: pares origen→destino derivados de la secuencia de
  // destinos de cada ruta turística real. No hay datos inventados: si no hay
  // rutas que conecten dos estados, no se dibuja corredor.
  const flujos = useMemo(() => {
    const pares = new Map()
    const nombres = new Map()
    for (const r of rutas) {
      const stops = (r.destinos ?? []).slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      const estados = stops.map((s) => normName(s.estado)).filter(Boolean)
      // nombre visible por estado (el primero que aparezca)
      for (const s of stops) {
        const k = normName(s.estado)
        if (k && !nombres.has(k) && s.estado) nombres.set(k, s.estado)
      }
      for (let i = 0; i < estados.length - 1; i++) {
        if (estados[i] === estados[i + 1]) continue
        const key = [estados[i], estados[i + 1]].sort().join('→')
        const entry = pares.get(key) ?? { a: estados[i], b: estados[i + 1], rutas: new Set() }
        entry.rutas.add(r.id)
        pares.set(key, entry)
      }
    }
    return [...pares.values()]
      .map((e) => ({
        key: `${e.a}↔${e.b}`,
        a: e.a,
        b: e.b,
        nombreA: nombres.get(e.a) ?? e.a,
        nombreB: nombres.get(e.b) ?? e.b,
        rutas: e.rutas.size,
      }))
      .filter((f) => centroides.has(f.a) && centroides.has(f.b))
      .sort((x, y) => y.rutas - x.rutas)
  }, [rutas, centroides])

  const topEstados = useMemo(() => {
    const names = new Set([...countsDestinos.keys(), ...countsPrestadores.keys()])
    return [...names]
      .map((name) => ({
        name,
        destinos: countsDestinos.get(name) ?? 0,
        prestadores: countsPrestadores.get(name) ?? 0,
      }))
      .sort((a, b) => (b.destinos + b.prestadores) - (a.destinos + a.prestadores))
      .slice(0, 8)
  }, [countsDestinos, countsPrestadores])

  const maxTopValue = useMemo(
    () => Math.max(1, ...topEstados.map((s) => s.destinos + s.prestadores)),
    [topEstados],
  )

  const destinoMarkers = useMemo(
    () => destinosConCoords.map((d) => ({
      lat: Number(d.lat),
      lng: Number(d.lng),
      color: roadColor(d.roadStatus),
      title: d.name,
      popup:
        `<strong>${escapeHtml(d.name)}</strong>` +
        `<br/><span class="mapa-popup-sub">${escapeHtml([d.municipality, d.estado].filter(Boolean).join(' · '))}</span>` +
        (d.tourismType ? `<br/><span class="mapa-popup-tag">${escapeHtml(d.tourismType)}</span>` : ''),
    })),
    [destinosConCoords],
  )

  const prestadorMarkers = useMemo(
    () => prestadoresConCoords.map((p) => ({
      lat: Number(p.lat),
      lng: Number(p.lng),
      color: PRESTADOR_COLORS[p.status] ?? '#2563eb',
      title: p.name,
      popup:
        `<strong>${escapeHtml(p.name)}</strong>` +
        `<br/><span class="mapa-popup-sub">${escapeHtml([p.category, p.municipality].filter(Boolean).join(' · '))}</span>` +
        `<br/><span class="mapa-popup-tag">${escapeHtml(p.status ?? 'sin estado')}</span>`,
    })),
    [prestadoresConCoords],
  )

  const eventoMarkers = useMemo(
    () => eventosConCoords.map((e) => ({
      lat: Number(e.lat),
      lng: Number(e.lng),
      color: '#7e22ce',
      title: e.title,
      popup:
        `<strong>${escapeHtml(e.title)}</strong>` +
        `<br/><span class="mapa-popup-sub">${escapeHtml([e.destinoName, e.estado].filter(Boolean).join(' · '))}</span>` +
        (e.date ? `<br/><span class="mapa-popup-tag">${escapeHtml(e.date)}</span>` : ''),
    })),
    [eventosConCoords],
  )

  // Puntos de calor = telemetría real de popularidad ([[lat, lng, peso]]).
  const heatPoints = useMemo(() => calor.puntos, [calor.puntos])

  const rutasLines = useMemo(
    () => rutas.map((r, i) => {
      // Prioriza la geometría persistida (RUTA_GEO): polilínea real por
      // carretera trazada desde el diseñador. Fallback: destinos ordenados.
      const path = (r.geometry?.length >= 2
        ? r.geometry
        : (r.destinos ?? [])
          .slice()
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          .filter((s) => Number.isFinite(Number(s.lat)) && Number(s.lat) !== 0)
          .map((s) => [Number(s.lat), Number(s.lng)]))
      return path.length > 1
        ? { id: r.id, name: r.name, color: RUTA_COLORS[i % RUTA_COLORS.length], path, persistida: r.geometry?.length >= 2 }
        : null
    }).filter(Boolean),
    [rutas],
  )

  const rutaGeometries = useRouteGeometries(rutasLines)

  const selectedData = useMemo(() => {
    if (!selectedState) return null
    const key = normName(selectedState)
    return {
      name: selectedState,
      destinos: destinos.filter((d) => normName(d.estado) === key),
      prestadores: prestadores.filter((p) => normName(p.estado) === key),
      eventos: eventos.filter((e) => normName(e.estado) === key),
    }
  }, [selectedState, destinos, prestadores, eventos])

  const selectedBounds = useMemo(() => {
    if (!selectedState || !geo?.features) return null
    const feature = geo.features.find((f) => normName(f.properties?.shapeName) === normName(selectedState))
    return feature ? L.geoJSON(feature).getBounds() : null
  }, [selectedState, geo])

  const offlineTileUrl = dark
    ? (import.meta.env.VITE_TILE_URL_DARK || import.meta.env.VITE_TILE_URL)
    : import.meta.env.VITE_TILE_URL
  const tileUrl = offlineTileUrl || (cartoKey
    ? (dark
      ? `https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png?key=${cartoKey}`
      : `https://basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png?key=${cartoKey}`)
    : (dark
      ? 'https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}'
      : 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'))
  const attribution = offlineTileUrl || cartoKey ? CARTO_ATTRIBUTION : (dark ? 'Esri, HERE, Garmin, OpenStreetMap contributors' : '&copy; OpenStreetMap contributors')

  const toggleLayer = (key) => setLayers((prev) => ({ ...prev, [key]: !prev[key] }))

  if (loading) {
    return (
      <div className="module-container">
        <h3 className="module-title">Control cartográfico del turismo</h3>
        <p className="module-subtitle">Cargando capas de {regionName}…</p>
        <div className="mapa-skeleton" />
      </div>
    )
  }

  const pendientes = prestadores.filter((p) => normName(p.status) === 'pendiente').length

  return (
    <div className="module-container">
      <div className="module-header">
        <div>
          <h3 className="module-title">Control cartográfico del turismo</h3>
          <p className="module-subtitle">Cobertura de destinos, prestadores, eventos y rutas — {regionName}.</p>
        </div>
        <div className="module-header-actions">
          <span className="mapa-updated">Actualizado: {new Date().toLocaleDateString('es-VE')}</span>
        </div>
      </div>

      <section className="metrics-grid mapa-kpis">
        <div className="metric-card">
          <div className="metric-data">
            <span className="metric-title">Destinos</span>
            <span className="metric-value">{destinos.length}</span>
            <span className="metric-trend blue">◉ {destinosConCoords.length} con coordenadas</span>
          </div>
          <div className="metric-icon-box blue">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" /><line x1="9" y1="3" x2="9" y2="18" /><line x1="15" y1="6" x2="15" y2="21" /></svg>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-data">
            <span className="metric-title">Prestadores</span>
            <span className="metric-value">{prestadores.length}</span>
            <span className="metric-trend green">▲ {prestadoresConCoords.length} en mapa</span>
          </div>
          <div className="metric-icon-box green">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-data">
            <span className="metric-title">Pendientes de validar</span>
            <span className="metric-value">{pendientes}</span>
            <span className="metric-trend orange">⟲ requieren revisión</span>
          </div>
          <div className="metric-icon-box orange">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-data">
            <span className="metric-title">Eventos</span>
            <span className="metric-value">{eventos.length}</span>
            <span className="metric-trend purple">◆ {eventosConCoords.length} georreferenciados</span>
          </div>
          <div className="metric-icon-box purple">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-data">
            <span className="metric-title">Rutas</span>
            <span className="metric-value">{rutas.length}</span>
            <span className="metric-trend blue">⟐ {rutas.filter((r) => r.geometry).length} con trazado persistido de {rutasLines.length} dibujadas</span>
          </div>
          <div className="metric-icon-box blue">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
          </div>
        </div>
      </section>

      <div className="mapa-toolbar">
        <div className="mapa-toggles">
          {[
            { key: 'coropleta', label: 'Coropleta por estado' },
            { key: 'destinos', label: 'Destinos' },
            { key: 'prestadores', label: 'Prestadores' },
            { key: 'rutas', label: 'Rutas' },
            { key: 'eventos', label: 'Eventos' },
            { key: 'flujos', label: 'Flujos entre estados' },
            { key: 'heat', label: 'Mapa de calor (visitas)' },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              className={`mapa-toggle ${layers[item.key] ? 'active' : ''}`}
              onClick={() => toggleLayer(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>
        {layers.heat && (
          <div className="mapa-legend">
            <select
              className="module-filter-select"
              style={{ maxWidth: 170 }}
              value={periodoCalor}
              onChange={(e) => setPeriodoCalor(e.target.value)}
              title="Período de análisis"
            >
              {PERIODOS_CALOR.map((p) => (
                <option key={p.key} value={p.key}>{p.label}</option>
              ))}
            </select>
            <select
              className="module-filter-select"
              style={{ maxWidth: 200 }}
              value={tipoCalor}
              onChange={(e) => setTipoCalor(e.target.value)}
              title="Tipo de evento"
            >
              {TIPOS_EVENTO.map((t) => (
                <option key={t.key} value={t.key}>{t.label}</option>
              ))}
            </select>
            {['Baja', 'Media', 'Alta', 'Muy alta'].map((nivel, i) => (
              <span key={nivel} className="mapa-legend-item">
                <i style={{ background: dark
                  ? ['#7e22ce', '#f37021', '#fbbf24', '#fef08a'][i]
                  : ['#4ade80', '#facc15', '#f37021', '#dc2626'][i] }} />
                {nivel}
              </span>
            ))}
            <span className="mapa-updated">
              {calorClave !== claveCalor ? 'Cargando…' : `${calor.total} eventos · ${calor.puntos.length} puntos`}
            </span>
          </div>
        )}
        {layers.coropleta && (
          <div className="mapa-legend">
            <select
              className="module-filter-select"
              style={{ maxWidth: 220 }}
              value={metrica}
              onChange={(e) => setMetrica(e.target.value)}
              title="Métrica de la coropleta"
            >
              {METRICAS.map((m) => (
                <option key={m.key} value={m.key}>{m.label}</option>
              ))}
            </select>
            {CHOROPLETH_SCALE.map((step) => (
              <span key={step.label} className="mapa-legend-item">
                <i style={{ background: step.color }} />
                {step.label}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mapa-layout">
        <div className="mapa-map-wrap">
          <MapContainer center={[7.5, -66]} zoom={6} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
            <TileLayer
              url={tileUrl}
              attribution={attribution}
              maxZoom={20}
              maxNativeZoom={offlineTileUrl ? 9 : undefined}
            />
            {layers.coropleta && geo && (
              <ChoroplethLayer
                geo={geo}
                counts={countsMetrica}
                selected={selectedState}
                onSelect={setSelectedState}
                metricaNombre={metricaActual.nombre}
              />
            )}
            {layers.coropleta && selectedBounds && <FitBounds bounds={selectedBounds} />}
            {layers.destinos && <ClusterLayer items={destinoMarkers} />}
            {layers.prestadores && <ClusterLayer items={prestadorMarkers} />}
            {layers.eventos && <ClusterLayer items={eventoMarkers} />}
            {layers.rutas && rutasLines.map((line) => {
              const positions = rutaGeometries[line.id] ?? line.path
              const core = lightenHex(line.color, 0.55)
              return (
                <g key={line.id}>
                  <Polyline
                    positions={positions}
                    pathOptions={{
                      color: line.color,
                      weight: 14,
                      opacity: 0.18,
                      lineCap: 'round',
                      lineJoin: 'round',
                    }}
                    className="mapa-ruta-glow"
                  />
                  <Polyline
                    positions={positions}
                    pathOptions={{
                      color: line.color,
                      weight: 6,
                      opacity: 0.95,
                      lineCap: 'round',
                      lineJoin: 'round',
                    }}
                  />
                  <Polyline
                    positions={positions}
                    pathOptions={{
                      color: core,
                      weight: 2,
                      opacity: 1,
                      lineCap: 'round',
                      lineJoin: 'round',
                    }}
                  />
                </g>
              )
            })}
            {layers.flujos && flujos.map((flujo) => {
              const from = centroides.get(flujo.a)
              const to = centroides.get(flujo.b)
              // Grosor del corredor según nº de rutas que conectan el par.
              const weight = Math.min(1 + flujo.rutas * 1.5, 9)
              return (
                <Polyline
                  key={flujo.key}
                  positions={[from, to]}
                  pathOptions={{
                    color: '#7E2E90',
                    weight,
                    opacity: 0.55,
                    dashArray: '10 10',
                    lineCap: 'round',
                    className: 'mapa-flujo',
                  }}
                >
                  <Tooltip sticky>
                    <strong>{flujo.nombreA} ↔ {flujo.nombreB}</strong>
                    <br />
                    {flujo.rutas} {flujo.rutas === 1 ? 'ruta conecta' : 'rutas conectan'} estos estados
                  </Tooltip>
                </Polyline>
              )
            })}
            {layers.heat && <HeatLayer points={heatPoints} dark={dark} />}
          </MapContainer>
        </div>

        <aside className="mapa-side">
          {layers.heat && calor.topEtiquetas.length > 0 && !selectedData && (
            <div className="mapa-side-card">
              <div className="mapa-side-head">
                <h4>Top destinos y búsquedas</h4>
              </div>
              {calor.topEtiquetas.slice(0, 10).map((t) => (
                <div key={t.etiqueta} className="mapa-bar-row" style={{ cursor: 'default' }}>
                  <span className="mapa-bar-label" title={t.etiqueta}>{t.etiqueta}</span>
                  <span className="mapa-bar-track">
                    <span className="mapa-bar-fill" style={{ width: `${(t.total / Math.max(...calor.topEtiquetas.map((x) => x.total), 1)) * 100}%` }} />
                  </span>
                  <span className="mapa-side-list-sub">{t.total}</span>
                </div>
              ))}
            </div>
          )}
          {selectedData ? (
            <div className="mapa-side-card">
              <div className="mapa-side-head">
                <h4>{selectedData.name}</h4>
                <button type="button" className="mapa-side-close" onClick={() => setSelectedState(null)}>×</button>
              </div>
              <div className="mapa-side-stats">
                <span className="mapa-chip blue">{selectedData.destinos.length} destinos</span>
                <span className="mapa-chip green">{selectedData.prestadores.length} prestadores</span>
                <span className="mapa-chip purple">{selectedData.eventos.length} eventos</span>
              </div>
              {selectedData.destinos.length > 0 && (
                <ul className="mapa-side-list">
                  {selectedData.destinos.slice(0, 12).map((d) => (
                    <li key={d.id}>
                      <span className="mapa-dot" style={{ background: roadColor(d.roadStatus) }} />
                      <span className="mapa-side-list-name">{d.name}</span>
                      <span className="mapa-side-list-sub">{d.municipality}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <div className="mapa-side-card">
              <div className="mapa-side-head">
                <h4>Top estados por actividad</h4>
              </div>
              {topEstados.length === 0 && <p className="mapa-side-empty">Sin datos para mostrar.</p>}
              {topEstados.map((s) => (
                <button
                  key={s.name}
                  type="button"
                  className="mapa-bar-row"
                  onClick={() => setSelectedState(s.name)}
                >
                  <span className="mapa-bar-label">{s.name}</span>
                  <span className="mapa-bar-track">
                    <span
                      className="mapa-bar-fill"
                      style={{ width: `${((s.destinos + s.prestadores) / maxTopValue) * 100}%` }}
                    />
                  </span>
                  <span className="mapa-bar-count">{s.destinos + s.prestadores}</span>
                </button>
              ))}
              <p className="mapa-side-hint">Haz clic en un estado del mapa o de la lista para ver el detalle.</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
