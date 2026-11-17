import { useState, useEffect, useRef } from 'react'
import { rutasService } from '../services/rutas'
import { destinosService } from '../services/destinos'
import { geoService } from '../services/geo'
import { routingService } from '../services/routing'
import { useFeedback } from './feedbackContext.js'
import { generarReportePdf, traerTodo, usuarioActual } from '../lib/reportes.js'
import BtnReporte from './BtnReporte.jsx'
import BusquedaSelect from './BusquedaSelect.jsx'
import RouteMapEditor from './RouteMapEditor.jsx'
import { IconCheck } from './Icons.jsx'

const tourismTypesFallback = ['Ecoturismo', 'Sol y Playa', 'Aventura', 'Cultural', 'Gastronómico', 'Religioso']
const roadStatuses = ['Buena', 'Regular', 'Mala']

const emptyNewDest = () => ({
  name: '',
  description: '',
  tourismTypeId: '',
  municipalityId: '',
  lat: '',
  lng: '',
  roadStatus: 'Buena',
})

export default function RouteDesigner({ regionId = null, regionName = 'Visión Nacional' }) {
  const { toast, confirm } = useFeedback()
  const loadErrorRef = useRef(false)
  const [exportando, setExportando] = useState(false)

  // Reporte PDF con identidad institucional: rutas completas según la región
  const handleReporte = async () => {
    if (exportando) return
    setExportando(true)
    toast.info('Se está generando el reporte de rutas. La descarga comenzará en unos segundos.', {
      title: 'Descarga en curso',
    })
    try {
      const rId = filterRegion || regionId
      const lista = await traerTodo(rutasService.getAll, 'rutas', rId ? { regionId: rId } : {})
      const conTrazado = lista.filter((r) => r.geometry).length
      await generarReportePdf({
        titulo: 'Reporte de Rutas Turísticas',
        subtitulo: 'Corredores turísticos registrados, con distancias y estado de vialidad.',
        region: regionName,
        usuario: usuarioActual(),
        resumen: [
          { etiqueta: 'Total de rutas', valor: lista.length },
          { etiqueta: 'Con trazado persistido', valor: conTrazado },
          { etiqueta: 'Distancia promedio', valor: `${Math.round(lista.reduce((s, r) => s + (r.distanceKm || 0), 0) / (lista.length || 1))} km` },
          { etiqueta: 'Vías en mal estado', valor: lista.filter((r) => String(r.roadStatus || '').toLowerCase().includes('mala')).length },
        ],
        secciones: [{
          titulo: `Listado de rutas (${lista.length})`,
          columnas: [
            { titulo: 'Ruta', ancho: 2.2 },
            { titulo: 'Tipo de turismo', ancho: 1.4 },
            { titulo: 'Duración (h)', ancho: 1, alinear: 'derecha' },
            { titulo: 'Distancia (km)', ancho: 1, alinear: 'derecha' },
            { titulo: 'Vía', ancho: 0.9 },
            { titulo: 'Paradas', ancho: 1.5 },
          ],
          filas: lista.map((r) => [
            r.name,
            r.tourismType || '—',
            r.durationHours ?? '—',
            r.distanceKm != null ? r.distanceKm : '—',
            r.roadStatus || '—',
            (r.destinos || []).map((d) => d.name).filter(Boolean).slice(0, 4).join(', ') +
              ((r.destinos || []).length > 4 ? ` (+${r.destinos.length - 4})` : '') || '—',
          ]),
        }],
        notas: [
          'El trazado persistido corresponde a la polilínea real por carretera trazada con OSRM y guardada en RUTA_GEO.',
          'Documento de uso interno; no distribuir fuera de la corporación.',
        ],
        firmas: ['Elaborado por', 'Revisado por', 'Aprobado por'],
        nombreArchivo: `Reporte-Rutas-${new Date().toISOString().slice(0, 10)}.pdf`,
      })
      toast.success('El reporte de rutas se generó y descargó correctamente.', { title: 'Reporte listo' })
    } catch (err) {
      toast.error('No se pudo generar el reporte PDF. Detalle técnico: ' + (err.message || 'desconocido'), {
        title: 'Descarga fallida',
      })
    } finally {
      setExportando(false)
    }
  }
  const [routes, setRoutes] = useState([])
  const [loading, setLoading] = useState(true)
  const [availableDestinations, setAvailableDestinations] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [detail, setDetail] = useState(null)
  const [filterRegion, setFilterRegion] = useState(regionId || '')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  // Wizard & Form states
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  // Marca de tiempo al entrar al paso 3: el botón "Guardar Ruta" aparece donde
  // estaba "Siguiente"; el segundo clic de un doble clic accidental terminaba
  // guardando la ruta sin pasar por el paso 3.
  const step3EnteredAtRef = useRef(0)
  const [errors, setErrors] = useState({})
  const [destSearch, setDestSearch] = useState('')
  const [destRegionFilter, setDestRegionFilter] = useState('')

  const [form, setForm] = useState({
    name: '',
    description: '',
    roadStatus: 'Buena',
    tourismType: 'Ecoturismo',
    duration: '',
    distance: '',
    destinations: [], // array of destination IDs in order
    geometria: [], // polilínea trazada por OSRM (RUTA_GEO)
  })
  const [trazando, setTrazando] = useState(false)
  const [trazoInfo, setTrazoInfo] = useState(null)

  const [regions, setRegions] = useState([])

  // Datos para crear destinos inline desde la ruta
  const [showNewDest, setShowNewDest] = useState(false)
  const [savingDest, setSavingDest] = useState(false)
  const [tiposTurismo, setTiposTurismo] = useState([])
  const [municipios, setMunicipios] = useState([])
  const [newDest, setNewDest] = useState(emptyNewDest())
  const [newDestErrors, setNewDestErrors] = useState({})

  useEffect(() => {
    geoService.getRegiones().then((res) => {
      setRegions(res.data || res || [])
    }).catch(() => {})
    // Tipos y municipios reales de la BD para el formulario de destino inline
    geoService.getTiposTurismo().then((res) => {
      setTiposTurismo(res.data || res || [])
    }).catch(() => {})
    geoService.getMunicipios().then((res) => {
      setMunicipios(res.data || res || [])
    }).catch(() => {})
  }, [])

  const loadData = () => {
    setLoading(true)
    const rId = filterRegion || regionId
    const destParams = { limit: 100 }
    if (rId) destParams.regionId = rId
    const routeParams = { page, limit: 10 }
    if (rId) routeParams.regionId = rId
    Promise.all([
      rutasService.getAll(routeParams),
      destinosService.getAll(destParams),
    ]).then(([routesRes, destinosRes]) => {
      const routesData = routesRes.rutas || []
      const destsData = destinosRes.destinos || []
      // Listas vacías = sin resultados reales. Nunca se pintan datos ficticios.
      setRoutes(routesData)
      setTotalItems(routesRes.meta?.total ?? routesData.length)
      setTotalPages(Math.max(1, Math.ceil((routesRes.meta?.total ?? routesData.length) / 10)))
      setAvailableDestinations(destsData)
      loadErrorRef.current = false
      setLoading(false)
    }).catch(() => {
      if (!loadErrorRef.current) {
        loadErrorRef.current = true
        toast.error('No se pudo cargar la información desde el servidor. Verifica tu conexión e intenta de nuevo.', { title: 'Error de conexión' })
      }
      setRoutes([])
      setTotalItems(0)
      setTotalPages(1)
      setAvailableDestinations([])
      setLoading(false)
    })
  }

  useEffect(() => {
    loadData()
  }, [regionId, filterRegion, page])

  const openForm = (route = null) => {
    setStep(1)
    setErrors({})
    setDestSearch('')
    setDestRegionFilter('')
    if (route) {
      setEditing(route.id)
      setForm({
        name: route.name,
        description: route.description || '',
        roadStatus: roadStatuses.includes(route.roadStatus) ? route.roadStatus : 'Buena',
        tourismType: route.tourismType || 'Ecoturismo',
        duration: String(route.durationHours || ''),
        distance: String(route.distanceKm || ''),
        destinations: (route.destinos || []).map(d => d.destinoId),
        geometria: route.geometry ?? [],
      })
    } else {
      setEditing(null)
      setForm({
        name: '',
        description: '',
        roadStatus: 'Buena',
        tourismType: 'Ecoturismo',
        duration: '',
        distance: '',
        destinations: [],
        geometria: [],
      })
    }
    setTrazoInfo(null)
    setTrazando(false)
    setShowForm(true)
  }

  const validateStep = (s) => {
    const errs = {}
    if (s === 1) {
      if (!form.name.trim()) errs.name = 'El nombre de la ruta es obligatorio.'
    }
    if (s === 2) {
      if (form.destinations.length === 0) errs.destinations = 'Agrega al menos un destino a la ruta.'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleNext = () => {
    if (validateStep(step)) {
      const next = Math.min(step + 1, 3)
      if (next === 3) step3EnteredAtRef.current = Date.now()
      setStep(next)
    }
  }

  const handlePrev = () => {
    setErrors({})
    setStep(s => Math.max(s - 1, 1))
  }

  const addDestination = (destId) => {
    if (!form.destinations.includes(destId)) {
      setForm(p => ({ ...p, destinations: [...p.destinations, destId] }))
      setErrors(p => ({ ...p, destinations: '' }))
    }
  }

  const removeDestination = (destId) => {
    setForm(p => ({ ...p, destinations: p.destinations.filter(id => id !== destId) }))
  }

  // Clic en un marcador del mapa: agrega o quita la parada.
  const toggleParadaDesdeMapa = (dest) => {
    if (form.destinations.includes(dest.id)) removeDestination(dest.id)
    else addDestination(dest.id)
  }

  // Clic en el mapa vacío: abre el formulario inline con las coordenadas
  // del punto elegido ya prefijadas.
  const prefillNuevoDestino = ({ lat, lng }) => {
    setNewDest(p => ({ ...p, lat: lat.toFixed(5), lng: lng.toFixed(5) }))
    setShowNewDest(true)
  }

  // Trazado real por carretera vía el proxy del backend (OSRM): llena
  // automáticamente duración/distancia y guarda la polilínea (RUTA_GEO).
  const handleTrazar = async () => {
    const paradas = form.destinations
      .map(id => getDest(id))
      .filter(Boolean)
      .map(d => [Number(d.lat), Number(d.lng)])
      .filter(([la, lo]) => Number.isFinite(la) && Number.isFinite(lo) && la !== 0 && lo !== 0)
    if (paradas.length < 2) {
      toast.warning('Agrega al menos 2 paradas con coordenadas para trazar la ruta por carretera.')
      return
    }
    setTrazando(true)
    try {
      const res = await routingService.trazar(paradas)
      setForm(p => ({
        ...p,
        geometria: res.geometria,
        duration: String(Math.max(1, Math.round(res.duracionHoras))),
        distance: String(res.distanciaKm),
      }))
      setTrazoInfo(res)
      toast.success(
        `Trazado: ${res.distanciaKm} km · ~${Math.round(res.duracionHoras)} h` +
          (res.fuente === 'recta' ? ' (sin conexión: línea recta)' : ' (por carretera)'),
        { title: 'Ruta trazada' },
      )
    } catch (err) {
      toast.error('No se pudo trazar la ruta: ' + (err.message || 'error desconocido'))
    } finally {
      setTrazando(false)
    }
  }

  const moveDestination = (index, direction) => {
    const newIdx = index + direction
    if (newIdx < 0 || newIdx >= form.destinations.length) return
    const list = [...form.destinations]
    const [moved] = list.splice(index, 1)
    list.splice(newIdx, 0, moved)
    setForm(p => ({ ...p, destinations: list }))
  }

  const handleSave = async (e) => {
    if (e) e.preventDefault()
    if (saving) return
    // Ignora un envío dentro de los 500 ms posteriores a llegar al paso 3:
    // es el segundo clic de un doble clic sobre "Siguiente", no un guardado real.
    if (Date.now() - step3EnteredAtRef.current < 500) return
    if (!validateStep(1)) {
      setStep(1)
      toast.warning('Por favor ingresa el nombre de la ruta.')
      return
    }
    if (!validateStep(2)) {
      setStep(2)
      toast.warning('Por favor agrega al menos un destino al itinerario.')
      return
    }

    setSaving(true)
    try {
      const destinosPayload = form.destinations.map((destinoId, i) => ({
        destinoId,
        orden: i + 1,
      }))
      const payload = {
        nombre: form.name.trim(),
        descripcion: form.description?.trim() || undefined,
        vialidad: form.roadStatus,
        tipoTurismoId:
          tiposTurismo.find(t => t.TITU_NOM === form.tourismType)?.TITU_COD ||
          tourismTypesFallback.indexOf(form.tourismType) + 1,
        duracionHoras: form.duration ? parseInt(form.duration) : undefined,
        distanciaKm: form.distance ? parseFloat(form.distance) : undefined,
        destinos: destinosPayload,
        // Polilínea trazada: se persiste en RUTA_GEO para render instantáneo
        // y modo offline.
        ...(form.geometria?.length >= 2 ? { geometria: form.geometria } : {}),
      }
      if (editing) {
        await rutasService.update(editing, payload)
      } else {
        await rutasService.create(payload)
      }
      toast.success(
        editing
          ? `La ruta «${form.name}» fue actualizada correctamente.`
          : `La ruta «${form.name}» fue creada correctamente.`,
        { title: editing ? 'Ruta actualizada' : 'Ruta creada' },
      )
      loadData()
      setShowForm(false)
      setEditing(null)
    } catch (err) {
      toast.error('No se pudo guardar la ruta: ' + (err.message || 'error desconocido'))
    } finally {
      setSaving(false)
    }
  }

  /**
   * Crea un destino real (no ad-hoc) directamente desde el diseñador de rutas.
   * Debe existir como registro del catálogo para que páginas de detalle,
   * opiniones, eventos y prestadores puedan vincularse a él.
   */
  const handleCreateDestinoDesdeRuta = async () => {
    const errs = {}
    if (!newDest.name.trim()) errs.name = 'El nombre es obligatorio.'
    if (!newDest.tourismTypeId) errs.tourismTypeId = 'Seleccione el tipo de turismo.'
    if (!newDest.municipalityId) errs.municipalityId = 'Seleccione el municipio.'
    if (!newDest.lat || isNaN(parseFloat(newDest.lat))) errs.lat = 'Latitud requerida (ej. 7.8939).'
    if (!newDest.lng || isNaN(parseFloat(newDest.lng))) errs.lng = 'Longitud requerida (ej. -67.4711).'
    setNewDestErrors(errs)
    if (Object.keys(errs).length > 0) return

    setSavingDest(true)
    try {
      const res = await destinosService.create({
        nombre: newDest.name.trim(),
        descripcion: newDest.description.trim() || undefined,
        vialidad: newDest.roadStatus,
        tipoTurismoId: parseInt(newDest.tourismTypeId),
        municipioId: parseInt(newDest.municipalityId),
        lat: parseFloat(newDest.lat),
        lon: parseFloat(newDest.lng),
      })
      // success() devuelve { data: { destino } } o el destino directo según el wrapper
      const raw = res?.data?.data ?? res?.data ?? res
      const newId = raw?.DEST_COD ?? raw?.id
      setForm(p => ({
        ...p,
        destinations: (newId && !p.destinations.includes(newId))
          ? [...p.destinations, newId]
          : p.destinations,
      }))
      toast.success(`El destino «${newDest.name.trim()}» fue creado y agregado como parada.`, {
        title: 'Destino creado',
      })
      setNewDest(emptyNewDest())
      setNewDestErrors({})
      setShowNewDest(false)
      loadData() // refresca la lista de destinos disponibles
    } catch (err) {
      toast.error('No se pudo crear el destino: ' + (err.message || 'error desconocido'))
    } finally {
      setSavingDest(false)
    }
  }

  const handleDelete = async (route) => {
    const ok = await confirm({
      title: 'Eliminar ruta turística',
      message: `¿Seguro que deseas enviar a la papelera la ruta «${route.name}»? Un administrador podrá restaurarla.`,
      confirmText: 'Sí, eliminar',
      cancelText: 'Cancelar',
      tone: 'danger',
    })
    if (!ok) return
    try {
      await rutasService.delete(route.id)
      setRoutes(prev => prev.filter(r => r.id !== route.id))
      toast.success(`La ruta «${route.name}» fue enviada a la papelera.`, { title: 'Ruta eliminada' })
    } catch (err) {
      toast.error('No se pudo eliminar la ruta: ' + (err.message || 'error desconocido'))
    }
  }

  const getDest = (id) => availableDestinations.find(d => d.id === id)
  const getDestName = (id) => getDest(id)?.name || 'Destino ' + id

  const filteredCandidateDestinations = availableDestinations.filter(d => {
    if (form.destinations.includes(d.id)) return false
    if (destRegionFilter && d.regionId !== parseInt(destRegionFilter) && d.regionId !== destRegionFilter) return false
    if (destSearch) {
      const q = destSearch.toLowerCase()
      const matchName = d.name?.toLowerCase().includes(q)
      const matchEstado = d.estado?.toLowerCase().includes(q)
      if (!matchName && !matchEstado) return false
    }
    return true
  })

  if (loading) {
    return <div className="module-container"><p className="module-subtitle">Cargando rutas...</p></div>
  }

  return (
    <div className="module-container">
      <div className="module-header">
        <div>
          <h3 className="module-title">Diseñador de Rutas Turísticas</h3>
          <p className="module-subtitle">Construcción y trazado de rutas turísticas - Contexto: {regionName}.</p>
        </div>
        <div className="module-header-actions">
          <BtnReporte onClick={handleReporte} cargando={exportando} />
          <select className="module-filter-select" value={filterRegion} onChange={e => { setFilterRegion(e.target.value); setPage(1) }}>
            <option value="">Todas las regiones</option>
            {regions.map(r => <option key={r.REGI_COD} value={r.REGI_COD}>{r.REGI_NOM}</option>)}
          </select>
          <button className="btn-module-primary" onClick={() => openForm()}>+ Nueva Ruta</button>
        </div>
      </div>

      <div className="routes-list">
        {routes.length === 0 ? (
          <div className="module-subtitle" style={{ textAlign: 'center', padding: '40px 0' }}>No se encontraron rutas turísticas con los filtros actuales.</div>
        ) : (
          routes.map(r => (
            <div key={r.id} className="card-modern" onClick={() => setDetail(r)}>
              <div className="card-header">
                <div className="card-tags">
                  {r.tourismType && <span className="tag-type">{r.tourismType}</span>}
                </div>
                <span className="card-region-badge">{r.roadStatus || ''}</span>
              </div>
              <h4 className="card-title">{r.name}</h4>
              <p className="card-desc">{r.description}</p>
              <div className="card-meta">
                <span className="card-meta-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                  {r.durationHours ? `${r.durationHours} hrs` : '—'}
                </span>
                <span className="card-meta-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" /><circle cx="12" cy="10" r="3" /></svg>
                  {r.distanceKm ? `${r.distanceKm} km` : '—'}
                </span>
                <span className="card-meta-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" /><line x1="9" y1="3" x2="9" y2="18" /><line x1="15" y1="6" x2="15" y2="21" /></svg>
                  {(r.destinos || []).length} paradas
                </span>
              </div>
              <div className="route-destinations-preview">
                {(r.destinos || []).map((d, idx) => (
                  <span key={d.destinoId || idx} className="route-dest-tag">
                    {idx + 1}. {d.name || getDestName(d.destinoId)}
                  </span>
                ))}
              </div>
              <div className="card-actions">
                <button className="btn-icon-sm" onClick={(e) => { e.stopPropagation(); openForm(r) }} title="Editar">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                </button>
                <button className="btn-icon-sm btn-icon-danger" onClick={(e) => { e.stopPropagation(); handleDelete(r) }} title="Eliminar">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="table-pagination-footer">
          <span className="pagination-info">Página {page} de {totalPages} ({totalItems} rutas)</span>
          <div className="pagination-controls">
            <button className="btn-page-arrow" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} title="Anterior"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg></button>
            {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map(p => (
              <button key={p} className={`btn-page-num ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
            ))}
            <button className="btn-page-arrow" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} title="Siguiente"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg></button>
          </div>
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content wizard-modal modal-form-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editing ? 'Editar Ruta Turística' : 'Nueva Ruta Turística'}</h3>
              <button className="modal-close-btn" onClick={() => setShowForm(false)}>&times;</button>
            </div>

            {/* Stepper Header */}
            <div className="wizard-stepper">
              <div
                className={`wizard-step-indicator ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}
                onClick={() => step > 1 && setStep(1)}
              >
                <div className="wizard-step-circle">{step > 1 ? <IconCheck size={15} /> : '1'}</div>
                <div className="wizard-step-label">Datos de la Ruta</div>
              </div>
              <div className={`wizard-connector ${step > 1 ? 'completed' : ''}`} />
              <div
                className={`wizard-step-indicator ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}
                onClick={() => (step > 2 || validateStep(1)) && setStep(2)}
              >
                <div className="wizard-step-circle">{step > 2 ? <IconCheck size={15} /> : '2'}</div>
                <div className="wizard-step-label">Paradas / Itinerario</div>
              </div>
              <div className={`wizard-connector ${step > 2 ? 'completed' : ''}`} />
              <div
                className={`wizard-step-indicator ${step >= 3 ? 'active' : ''}`}
                onClick={() => validateStep(1) && validateStep(2) && setStep(3)}
              >
                <div className="wizard-step-circle">3</div>
                <div className="wizard-step-label">Estimaciones</div>
              </div>
            </div>

            <form
              onSubmit={handleSave}
              onKeyDown={(e) => {
                // Evita el envío implícito del formulario con Enter (igual que
                // en el wizard de destinos). El textarea conserva su salto.
                if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') e.preventDefault()
              }}
            >
              <div className="modal-body wizard-body">
                {step === 1 && (
                  <div className="wizard-step-content">
                    <h4 className="wizard-step-title">Información Básica de la Ruta</h4>
                    <p className="wizard-step-desc">Identificación, tipo de turismo y estado de vialidad.</p>

                    <div className="form-modal-group">
                      <label>Nombre de la Ruta <span className="required-star">*</span></label>
                      <input
                        type="text"
                        className={`form-modal-input ${errors.name ? 'input-error' : ''}`}
                        placeholder="Ej. Ruta del Café Tachirense, Ruta de los Médanos…"
                        value={form.name}
                        onChange={e => {
                          setForm(p => ({ ...p, name: e.target.value }))
                          setErrors(p => ({ ...p, name: '' }))
                        }}
                        autoFocus
                      />
                      {errors.name && <span className="field-error">{errors.name}</span>}
                    </div>

                    <div className="wizard-form-grid two-col">
                      <div className="form-modal-group">
                        <label>Tipo de Turismo <span className="required-star">*</span></label>
                        <select
                          className="form-modal-select"
                          value={form.tourismType}
                          onChange={e => setForm(p => ({ ...p, tourismType: e.target.value }))}
                        >
                          {(tiposTurismo.length ? tiposTurismo.map(t => t.TITU_NOM) : tourismTypesFallback).map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>

                      <div className="form-modal-group">
                        <label>Estado de la Vía <span className="required-star">*</span></label>
                        <select
                          className="form-modal-select"
                          value={form.roadStatus}
                          onChange={e => setForm(p => ({ ...p, roadStatus: e.target.value }))}
                        >
                          {roadStatuses.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="form-modal-group">
                      <label>Descripción de la Experiencia <span style={{ fontWeight: 400, color: 'var(--color-text-light)' }}>(opcional)</span></label>
                      <textarea
                        className="form-modal-textarea"
                        rows="3"
                        placeholder="Recorrido histórico, recomendaciones de viaje, puntos de interés…"
                        value={form.description}
                        onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                      />
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="wizard-step-content">
                    <h4 className="wizard-step-title">Itinerario de Paradas</h4>
                    <p className="wizard-step-desc">
                      Selecciona los destinos turísticos y ordénalos en la secuencia de la ruta. En el
                      mapa: clic en un marcador agrega o quita la parada; clic en el mapa vacío crea un
                      destino nuevo con esas coordenadas.
                    </p>

                    {/* Mapa geográfico del itinerario */}
                    <div style={{ marginBottom: 14 }}>
                      <RouteMapEditor
                        destinos={availableDestinations}
                        seleccionados={form.destinations.map(id => ({ destinoId: id, ...(getDest(id) || {}) }))}
                        geometria={form.geometria}
                        trazando={trazando}
                        onToggleParada={toggleParadaDesdeMapa}
                        onMapClick={prefillNuevoDestino}
                        altura="300px"
                      />
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
                        <button
                          type="button"
                          className="btn-modal-action approve"
                          disabled={trazando || form.destinations.length < 2}
                          onClick={handleTrazar}
                          style={{ opacity: form.destinations.length < 2 ? 0.5 : 1 }}
                        >
                          {trazando ? 'Trazando…' : '⟐ Trazar ruta real por carretera'}
                        </button>
                        {trazoInfo && (
                          <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                            {trazoInfo.distanciaKm} km · ~{Math.round(trazoInfo.duracionHoras)} h
                            {trazoInfo.fuente === 'recta' ? ' (aprox.)' : ''}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Sequential Stops List */}
                    <div className="form-modal-group">
                      <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Secuencia de Paradas ({form.destinations.length})</span>
                        <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--color-text-light)' }}>
                          {form.destinations.length >= 2 ? '✓ Listo para trazar ruta' : 'Se sugieren 2 o más paradas'}
                        </span>
                      </label>

                      {form.destinations.length === 0 ? (
                        <div style={{
                          padding: '24px 16px',
                          border: '2px dashed var(--color-border-soft)',
                          borderRadius: 12,
                          textAlign: 'center',
                          color: 'var(--color-text-light)',
                          fontSize: 13,
                        }}>
                          Aún no has agregado paradas. Haz clic en los destinos disponibles abajo para agregarlos al recorrido.
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 220, overflowY: 'auto', paddingRight: 4 }}>
                          {form.destinations.map((dId, idx) => {
                            const dest = getDest(dId)
                            return (
                              <div
                                key={dId}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: '8px 12px',
                                  background: 'rgba(76, 140, 36, 0.06)',
                                  border: '1px solid var(--color-border-soft)',
                                  borderRadius: 10,
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                  <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: 24,
                                    height: 24,
                                    borderRadius: '50%',
                                    background: 'var(--color-primary-solid)',
                                    color: '#fff',
                                    fontSize: 12,
                                    fontWeight: 700,
                                  }}>
                                    {idx + 1}
                                  </span>
                                  <div>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-main)' }}>
                                      {dest?.name || 'Destino ' + dId}
                                    </div>
                                    <div style={{ fontSize: 11, color: 'var(--color-text-light)' }}>
                                      {dest?.estado || 'Destino turístico'}
                                    </div>
                                  </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <button
                                    type="button"
                                    className="btn-icon-sm"
                                    disabled={idx === 0}
                                    onClick={() => moveDestination(idx, -1)}
                                    title="Subir orden"
                                    style={{ opacity: idx === 0 ? 0.3 : 1 }}
                                  >
                                    ↑
                                  </button>
                                  <button
                                    type="button"
                                    className="btn-icon-sm"
                                    disabled={idx === form.destinations.length - 1}
                                    onClick={() => moveDestination(idx, 1)}
                                    title="Bajar orden"
                                    style={{ opacity: idx === form.destinations.length - 1 ? 0.3 : 1 }}
                                  >
                                    ↓
                                  </button>
                                  <button
                                    type="button"
                                    className="btn-icon-sm btn-icon-danger"
                                    onClick={() => removeDestination(dId)}
                                    title="Quitar parada"
                                  >
                                    ✕
                                  </button>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                      {errors.destinations && <span className="field-error">{errors.destinations}</span>}
                    </div>

                    {/* Candidate destinations selector */}
                    <div className="form-modal-group" style={{ marginTop: 14 }}>
                      <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Agregar Destinos Disponibles</span>
                        <button
                          type="button"
                          onClick={() => { setShowNewDest(v => !v); setNewDestErrors({}) }}
                          style={{
                            background: showNewDest ? 'none' : 'var(--color-primary-solid)',
                            color: showNewDest ? 'var(--color-primary)' : '#fff',
                            border: showNewDest ? '1px solid var(--color-primary)' : 'none',
                            borderRadius: 8,
                            padding: '5px 12px',
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          {showNewDest ? '✕ Cancelar destino' : '＋ Crear destino'}
                        </button>
                      </label>

                      {showNewDest && (
                        <div style={{
                          border: '1px solid var(--color-input-border)',
                          borderRadius: 10,
                          padding: 12,
                          marginBottom: 10,
                          background: 'var(--color-card-bg)',
                        }}>
                          <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 8 }}>
                            El destino se guarda en el catálogo general y queda como parada de esta ruta.
                          </div>
                          <div className="wizard-form-grid two-col">
                            <div className="form-modal-group">
                              <label>Nombre <span className="required-star">*</span></label>
                              <input
                                type="text"
                                className="form-modal-input"
                                placeholder="Ej. Toma de Santa Bárbara"
                                value={newDest.name}
                                onChange={e => setNewDest(p => ({ ...p, name: e.target.value }))}
                              />
                              {newDestErrors.name && <span className="field-error">{newDestErrors.name}</span>}
                            </div>

                            <div className="form-modal-group">
                              <label>Tipo de turismo <span className="required-star">*</span></label>
                              <select
                                className="form-modal-select"
                                value={newDest.tourismTypeId}
                                onChange={e => setNewDest(p => ({ ...p, tourismTypeId: e.target.value }))}
                              >
                                <option value="">Seleccione tipo…</option>
                                {tiposTurismo.map(t => (
                                  <option key={t.TITU_COD} value={t.TITU_COD}>{t.TITU_NOM}</option>
                                ))}
                              </select>
                              {newDestErrors.tourismTypeId && <span className="field-error">{newDestErrors.tourismTypeId}</span>}
                            </div>

                            <div className="form-modal-group" style={{ gridColumn: '1 / -1' }}>
                              <label>Municipio <span className="required-star">*</span></label>
                              <BusquedaSelect
                                value={newDest.municipalityId}
                                onChange={v => setNewDest(p => ({ ...p, municipalityId: String(v) }))}
                                options={municipios.map(m => ({
                                  value: m.MUNI_COD,
                                  label: `${m.MUNI_NOM} — ${m.TM_ESTADO?.ESTA_NOM ?? ''}`,
                                }))}
                                placeholder="Escribe para buscar municipio…"
                                ariaLabel="Municipio del destino"
                              />
                              {newDestErrors.municipalityId && <span className="field-error">{newDestErrors.municipalityId}</span>}
                            </div>

                            <div className="form-modal-group">
                              <label>Latitud <span className="required-star">*</span></label>
                              <input
                                type="text"
                                className="form-modal-input"
                                placeholder="Ej. 7.8939"
                                value={newDest.lat}
                                onChange={e => setNewDest(p => ({ ...p, lat: e.target.value }))}
                              />
                              {newDestErrors.lat && <span className="field-error">{newDestErrors.lat}</span>}
                            </div>

                            <div className="form-modal-group">
                              <label>Longitud <span className="required-star">*</span></label>
                              <input
                                type="text"
                                className="form-modal-input"
                                placeholder="Ej. -67.4711"
                                value={newDest.lng}
                                onChange={e => setNewDest(p => ({ ...p, lng: e.target.value }))}
                              />
                              {newDestErrors.lng && <span className="field-error">{newDestErrors.lng}</span>}
                            </div>

                            <div className="form-modal-group" style={{ gridColumn: '1 / -1' }}>
                              <label>Descripción</label>
                              <textarea
                                rows={2}
                                className="form-modal-input"
                                placeholder="¿Qué ofrece este destino a los visitantes?"
                                value={newDest.description}
                                onChange={e => setNewDest(p => ({ ...p, description: e.target.value }))}
                              />
                            </div>

                            <div className="form-modal-group">
                              <label>Vialidad</label>
                              <select
                                className="form-modal-select"
                                value={newDest.roadStatus}
                                onChange={e => setNewDest(p => ({ ...p, roadStatus: e.target.value }))}
                              >
                                {roadStatuses.map(r => <option key={r} value={r}>{r}</option>)}
                              </select>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                              <button
                                type="button"
                                className="btn-modal-action approve"
                                disabled={savingDest}
                                onClick={handleCreateDestinoDesdeRuta}
                              >
                                {savingDest ? 'Guardando…' : 'Crear destino'}
                              </button>
                              <button
                                type="button"
                                className="btn-modal-action"
                                onClick={() => setShowNewDest(false)}
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="wizard-form-grid two-col" style={{ marginBottom: 8 }}>
                        <input
                          type="text"
                          className="form-modal-input"
                          placeholder="Buscar por nombre o estado…"
                          value={destSearch}
                          onChange={e => setDestSearch(e.target.value)}
                        />
                        <select
                          className="form-modal-select"
                          value={destRegionFilter}
                          onChange={e => setDestRegionFilter(e.target.value)}
                        >
                          <option value="">Todas las regiones</option>
                          {regions.map(r => <option key={r.REGI_COD} value={r.REGI_COD}>{r.REGI_NOM}</option>)}
                        </select>
                      </div>

                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 6,
                        maxHeight: 140,
                        overflowY: 'auto',
                        padding: 8,
                        background: 'rgba(0, 0, 0, 0.02)',
                        border: '1px solid var(--color-border-soft)',
                        borderRadius: 10,
                      }}>
                        {filteredCandidateDestinations.length === 0 ? (
                          <span style={{ fontSize: 12, color: 'var(--color-text-light)', padding: 6 }}>
                            {availableDestinations.length === 0
                              ? 'Aún no hay destinos en el catálogo. Usa el botón ＋ Crear destino para agregar el primero desde aquí.'
                              : 'No hay más destinos que coincidan con la búsqueda.'}
                          </span>
                        ) : (
                          filteredCandidateDestinations.map(d => (
                            <button
                              key={d.id}
                              type="button"
                              onClick={() => addDestination(d.id)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                padding: '5px 10px',
                                background: 'var(--color-card-bg)',
                                border: '1px solid var(--color-input-border)',
                                borderRadius: 8,
                                fontSize: 12,
                                color: 'var(--color-text-main)',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                              }}
                              onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--color-primary)' }}
                              onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--color-input-border)' }}
                            >
                              <span>＋</span>
                              <span>{d.name}</span>
                              {d.estado && <span style={{ fontSize: 10, color: 'var(--color-text-light)' }}>({d.estado})</span>}
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="wizard-step-content">
                    <h4 className="wizard-step-title">Estimaciones y Resumen de Ruta</h4>
                    <p className="wizard-step-desc">Métricas estimadas y confirmación del recorrido.</p>

                    <div className="wizard-form-grid two-col">
                      <div className="form-modal-group">
                        <label>Duración Estimada (horas)</label>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          className="form-modal-input"
                          placeholder="Ej. 6"
                          value={form.duration}
                          onChange={e => setForm(p => ({ ...p, duration: e.target.value }))}
                        />
                      </div>

                      <div className="form-modal-group">
                        <label>Distancia Estimada (km)</label>
                        <input
                          type="number"
                          step="any"
                          min="0"
                          className="form-modal-input"
                          placeholder="Ej. 145.5"
                          value={form.distance}
                          onChange={e => setForm(p => ({ ...p, distance: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div style={{
                      marginTop: 16,
                      padding: 16,
                      background: 'rgba(76, 140, 36, 0.05)',
                      borderRadius: 14,
                      border: '1px solid rgba(76, 140, 36, 0.15)',
                    }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-primary-solid)', marginBottom: 8 }}>
                        {form.name || 'Sin título'}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 12 }}>
                        {form.tourismType} • Vía: {form.roadStatus} • {form.destinations.length} paradas
                        {form.duration ? ` • ${form.duration} hrs` : ''}
                        {form.distance ? ` • ${form.distance} km` : ''}
                      </div>

                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-main)', marginBottom: 6 }}>
                        Itinerario secuencial:
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                        {form.destinations.map((dId, idx) => (
                          <div key={dId} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <span style={{
                              padding: '3px 8px',
                              background: 'var(--color-card-bg)',
                              borderRadius: 6,
                              fontSize: 11,
                              fontWeight: 600,
                              border: '1px solid var(--color-border-soft)',
                            }}>
                              {idx + 1}. {getDestName(dId)}
                            </span>
                            {idx < form.destinations.length - 1 && <span style={{ color: 'var(--color-text-light)' }}>➔</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer wizard-footer">
                {step > 1 && (
                  <button type="button" className="btn-modal-action cancel" onClick={handlePrev}>
                    ← Anterior
                  </button>
                )}
                {step < 3 ? (
                  <button type="button" className="btn-modal-action approve" onClick={handleNext}>
                    Siguiente →
                  </button>
                ) : (
                  <button type="submit" className="btn-modal-action approve" disabled={saving}>
                    {saving ? 'Guardando…' : (editing ? 'Actualizar Ruta' : 'Guardar y Publicar Ruta')}
                  </button>
                )}
                <button type="button" className="btn-modal-action cancel" onClick={() => setShowForm(false)}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {detail && (
        <div className="modal-overlay" onClick={() => setDetail(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{detail.name}</h3>
              <button className="modal-close-btn" onClick={() => setDetail(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="modal-details-card">
                <div className="detail-row"><span className="detail-label">Tipo:</span><span className="detail-value">{detail.tourismType || 'Ecoturismo'}</span></div>
                <div className="detail-row"><span className="detail-label">Estado de la Vía:</span><span className="detail-value">{detail.roadStatus || 'Buena'}</span></div>
                <div className="detail-row"><span className="detail-label">Distancia:</span><span className="detail-value">{detail.distanceKm ? `${detail.distanceKm} km` : '—'}</span></div>
                <div className="detail-row"><span className="detail-label">Duración:</span><span className="detail-value">{detail.durationHours ? `${detail.durationHours} hrs` : '—'}</span></div>
                <div className="detail-row"><span className="detail-label">Descripción:</span><span className="detail-value">{detail.description || '—'}</span></div>
                <div className="detail-row">
                  <span className="detail-label">Paradas ({detail.destinos?.length || 0}):</span>
                  <span className="detail-value">
                    {(detail.destinos || []).map((d, i) => `${i + 1}. ${d.name || getDestName(d.destinoId)}`).join('  ➔  ')}
                  </span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="modal-action-btn" onClick={() => setDetail(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
