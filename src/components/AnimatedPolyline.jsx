import { useEffect, useRef } from 'react'
import { Polyline } from 'react-leaflet'

/**
 * Polyline que "se dibuja" de origen a destino: mide el <path> SVG que genera
 * Leaflet y anima stroke-dashoffset con una transición CSS (GPU). Al terminar
 * limpia el dash para que las capas se superpongan limpias.
 *
 * Props extra sobre las normales de <Polyline>:
 *  - duration: ms de la animación (default 1100)
 *  - delay: ms de espera antes de iniciar (para escalonar rutas/días)
 *  - animKey: cambia este valor para repetir la animación
 */
export default function AnimatedPolyline({ duration = 1100, delay = 0, animKey, ...props }) {
  const ref = useRef(null)

  useEffect(() => {
    const path = ref.current?.getElement?.()
    if (!path || typeof path.getTotalLength !== 'function') return undefined
    const len = path.getTotalLength()
    if (!len) return undefined

    path.style.transition = 'none'
    path.style.strokeDasharray = `${len} ${len}`
    path.style.strokeDashoffset = `${len}`
    // fuerza reflow para que el estado inicial se aplique antes de animar
    void path.getBoundingClientRect()

    const start = setTimeout(() => {
      path.style.transition = `stroke-dashoffset ${duration}ms cubic-bezier(0.22, 1, 0.36, 1)`
      path.style.strokeDashoffset = '0'
    }, delay)
    const done = setTimeout(() => {
      path.style.transition = ''
      path.style.strokeDasharray = ''
      path.style.strokeDashoffset = ''
    }, delay + duration + 80)

    return () => {
      clearTimeout(start)
      clearTimeout(done)
    }
  }, [animKey, duration, delay])

  return <Polyline ref={ref} {...props} />
}
