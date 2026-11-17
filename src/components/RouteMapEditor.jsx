import { useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, Polyline, Marker, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { routeLayers } from '../lib/routeGeometry'
import AnimatedPolyline from './AnimatedPolyline'

/**
 * Editor geográfico del diseñador de rutas:
 *  - Los destinos del catálogo aparecen como marcadores; un clic agrega o
 *    quita la parada de la secuencia.
 *  - Un clic en el mapa vacío crea un destino nuevo con lat/lon prefijadas
 *    (se pasa al formulario inline del padre).
 *  - Muestra la vista previa: línea punteada entre paradas y, cuando existe,
 *    el trazado real por carretera (persistido en RUTA_GEO).
 */

const COLOR = '#7E2E90'

function ClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng }),
  })
  return null
}

function AjustarVista({ points, fitKey }) {
  const map = useMap()
  useEffect(() => {
    const valid = (points ?? []).filter(([la, lo]) => Number.isFinite(la) && Number.isFinite(lo))
    if (valid.length > 1) {
      map.fitBounds(L.latLngBounds(valid), { padding: [40, 40], maxZoom: 10 })
    } else if (valid.length === 1) {
      map.setView(valid[0], 9)
    }
  }, [fitKey]) // eslint-disable-line react-hooks/exhaustive-deps
  return null
}

function paradaIcon(numero, activa = true) {
  return L.divIcon({
    html: `<div class="ruta-editor-pop" style="display:flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:50%;background:${activa ? COLOR : '#94a3b8'};color:#fff;font-size:11px;font-weight:700;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35)">${numero ?? ''}</div>`,
    className: 'ruta-editor-parada',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  })
}

// Caché de íconos: evita re-crear los divIcon en cada render (lo que haría
// re-disparar la animación de pop de las paradas).
const paradaIconCache = new Map()
const catalogoIconCache = new Map()

function paradaIconCached(numero, activa = true) {
  const key = `${numero ?? ''}|${activa ? 1 : 0}`
  if (!paradaIconCache.has(key)) paradaIconCache.set(key, paradaIcon(numero, activa))
  return paradaIconCache.get(key)
}

function catalogoIcon(color = '#16a34a') {
  return L.divIcon({
    html: `<div style="width:12px;height:12px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,.4)"></div>`,
    className: 'ruta-editor-dot',
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  })
}

function catalogoIconCached(color) {
  if (!catalogoIconCache.has(color)) catalogoIconCache.set(color, catalogoIcon(color))
  return catalogoIconCache.get(color)
}

export default function RouteMapEditor({
  destinos = [],
  seleccionados = [],
  geometria = null,
  trazando = false,
  onToggleParada,
  onMapClick,
  altura = '100%',
}) {
  const dark = document.documentElement.classList.contains('dark')

  // Paradas ya seleccionadas (con coordenadas) en orden.
  const paradas = useMemo(
    () =>
      seleccionados
        .map((d) => [Number(d.lat), Number(d.lng)])
        .filter(([la, lo]) => Number.isFinite(la) && Number.isFinite(lo) && la !== 0 && lo !== 0),
    [seleccionados],
  )

  const lineaRecta = paradas.length >= 2 ? paradas : null
  const trazadoReal = geometria && geometria.length >= 2 ? geometria : null

  // Clave del trazado real: cambia cuando llega una geometría nueva → re-anima el dibujado.
  const geoKey = trazadoReal
    ? `geo-${trazadoReal.length}-${trazadoReal[0][0].toFixed(3)},${trazadoReal[0][1].toFixed(3)}`
    : ''
  const layers = trazadoReal ? routeLayers(COLOR) : null

  return (
    <div
      style={{
        position: 'relative',
        height: altura,
        minHeight: 260,
        borderRadius: 12,
        overflow: 'hidden',
        border: '1px solid var(--color-input-border)',
      }}
    >
      <MapContainer
        center={[7.5, -66]}
        zoom={6}
        scrollWheelZoom
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap, &copy; CARTO'
          url={
            dark
              ? 'https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png'
              : 'https://basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png'
          }
          maxZoom={20}
        />
        <ClickHandler onMapClick={onMapClick} />
        <AjustarVista points={paradas} fitKey={paradas.length} />

        {/* Catálogo de destinos: clic para agregar/quitar parada */}
        {destinos.map((d) => {
          const lat = Number(d.lat)
          const lng = Number(d.lng)
          if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat === 0 || lng === 0) return null
          const idx = seleccionados.findIndex((s) => s.destinoId === d.id)
          return (
            <Marker
              key={d.id}
              position={[lat, lng]}
              icon={idx >= 0 ? paradaIconCached(idx + 1) : catalogoIconCached(roadColorOf(d.roadStatus))}
              eventHandlers={{ click: () => onToggleParada(d) }}
            >
              <Popup>
                <strong>{d.name}</strong>
                <br />
                <span style={{ fontSize: 11, color: '#64748b' }}>
                  {[d.municipality, d.estado].filter(Boolean).join(' · ')}
                </span>
                <br />
                <span style={{ fontSize: 11 }}>{idx >= 0 ? 'Clic para quitar de la ruta' : 'Clic para agregar como parada'}</span>
              </Popup>
            </Marker>
          )
        })}

        {/* Vista previa en línea recta */}
        {lineaRecta && (
          <Polyline
            positions={lineaRecta}
            pathOptions={{ color: '#94a3b8', weight: 2, dashArray: '6 6', opacity: 0.8 }}
          />
        )}

        {/* Trazado real por carretera: se "dibuja" de origen a destino */}
        {trazadoReal && layers && (
          <g key="trazado-real">
            <AnimatedPolyline positions={trazadoReal} pathOptions={layers.glow} animKey={geoKey} />
            <AnimatedPolyline positions={trazadoReal} pathOptions={layers.body} animKey={geoKey} />
            <AnimatedPolyline positions={trazadoReal} pathOptions={layers.core} animKey={geoKey} />
          </g>
        )}
      </MapContainer>

      <div
        style={{
          position: 'absolute',
          left: 10,
          bottom: 10,
          zIndex: 500,
          background: 'rgba(255,255,255,0.92)',
          color: '#0f172a',
          borderRadius: 8,
          padding: '5px 10px',
          fontSize: 11,
          fontWeight: 600,
          boxShadow: '0 1px 4px rgba(0,0,0,.25)',
        }}
      >
        {trazando
          ? 'Trazando por carretera…'
          : trazadoReal
            ? 'Trazado real por carretera ✓'
            : paradas.length >= 2
              ? 'Vista previa (línea recta)'
              : 'Clic en los destinos para armar la ruta · clic en el mapa vacío crea un destino'}
        {trazando && <span className="ruta-editor-trazando-dot" />}
      </div>
    </div>
  )
}

function roadColorOf(status) {
  const s = String(status ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
  if (s.includes('mal')) return '#ef4444'
  if (s.includes('regul')) return '#eab308'
  return '#16a34a'
}
