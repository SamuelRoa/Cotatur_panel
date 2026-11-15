import { useEffect, useState } from 'react'

import api from '../services/api'

const CACHE_PREFIX = 'ruta_geo_'
const MAX_TRACED = 12

export function lightenHex(hex, amount = 0.4) {
  const clean = String(hex ?? '').replace('#', '').trim()
  if (clean.length !== 6) return hex
  const num = Number.parseInt(clean, 16)
  if (Number.isNaN(num)) return hex
  const mix = (c) => Math.round(c + (255 - c) * amount)
  return `#${[mix((num >> 16) & 255), mix((num >> 8) & 255), mix(num & 255)]
    .map((c) => c.toString(16).padStart(2, '0'))
    .join('')}`
}

function waypointsKey(path) {
  return path.map(([lat, lng]) => `${lng.toFixed(4)},${lat.toFixed(4)}`).join(';')
}

// Trazado vía el proxy del backend (que llama a OSRM y, sin conexión,
// devuelve línea recta). El cliente nunca dependerá del servicio externo.
async function fetchOSRM(path, signal) {
  const res = await api.post('/geo/route', {
    waypoints: path.map(([lat, lng]) => [lat, lng]),
  }, { signal })
  const data = res.data || res
  if (!data?.geometria?.length) throw new Error('Sin ruta')
  return data.geometria
}

/**
 * Traza cada ruta por las carreteras usando OSRM.
 * Devuelve un mapa { [rutaId]: coordenadas }. Si OSRM falla, cae a la línea recta.
 */
export function useRouteGeometries(routes) {
  const [geometries, setGeometries] = useState({})

  useEffect(() => {
    const targets = (routes ?? []).filter((r) => r.path?.length > 1).slice(0, MAX_TRACED)
    if (targets.length === 0) return undefined

    const controller = new AbortController()
    let cancelled = false

    ;(async () => {
      const result = {}
      for (const route of targets) {
        if (cancelled) return
        const cacheKey = CACHE_PREFIX + waypointsKey(route.path)
        const cached = sessionStorage.getItem(cacheKey)
        if (cached) {
          try {
            result[route.id] = JSON.parse(cached)
            continue
          } catch {
            /* cache corrupta: se recalcula */
          }
        }
        try {
          const geo = await fetchOSRM(route.path, controller.signal)
          sessionStorage.setItem(cacheKey, JSON.stringify(geo))
          result[route.id] = geo
        } catch {
          result[route.id] = route.path
        }
      }
      if (!cancelled) setGeometries(result)
    })()

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [routes])

  return geometries
}
