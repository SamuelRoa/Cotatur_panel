import { useState, useEffect } from 'react'
import { rutasService } from '../services/rutas'
import { destinosService } from '../services/destinos'
import { geoService } from '../services/geo'
import mockData from '../services/mockData.js'

const tourismTypes = ['Ecoturismo', 'Sol y Playa', 'Aventura', 'Cultural', 'Gastronómico', 'Religioso']
const roadStatuses = ['Buena', 'Regular', 'Mala', 'En construcción']

export default function RouteDesigner({ regionId = null, regionName = 'Visión Nacional' }) {
  const [routes, setRoutes] = useState([])
  const [loading, setLoading] = useState(true)
  const [availableDestinations, setAvailableDestinations] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [detail, setDetail] = useState(null)
  const [filterRegion, setFilterRegion] = useState(regionId || '')
  const [form, setForm] = useState({ name: '', description: '', roadStatus: 'Buena', tourismType: 'Ecoturismo', duration: '', distance: '', destinations: [] })
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  const [regions, setRegions] = useState([])

  useEffect(() => {
    geoService.getRegiones().then((res) => {
      setRegions(res.data || res || [])
    }).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    const rId = filterRegion || regionId
    const destParams = rId ? { regionId: rId } : {}
    const routeParams = { page, limit: 10 }
    if (rId) routeParams.regionId = rId
    Promise.all([
      rutasService.getAll(routeParams),
      destinosService.getAll(destParams),
    ]).then(([routesRes, destinosRes]) => {
      let routesData = routesRes.rutas || []
      let destsData = destinosRes.destinos || []
      setRoutes(routesData)
      setTotalItems(routesRes.meta?.total ?? routesData.length)
      setTotalPages(Math.max(1, Math.ceil((routesRes.meta?.total ?? routesData.length) / 10)))
      setAvailableDestinations(destsData)
      if (routesData.length === 0 && destsData.length === 0) {
        const mockRutas = mockData.buildRutas()
        const mockDests = mockData.buildDestinos()
        routesData = rId ? mockRutas.filter(r => r.destinos.some(d => d.regionId === parseInt(rId) || d.regionId === rId)) : mockRutas
        destsData = rId ? mockDests.filter(d => d.regionId === parseInt(rId) || d.regionId === rId) : mockDests
        setRoutes(routesData)
        setAvailableDestinations(destsData)
        setTotalItems(routesData.length)
        setTotalPages(Math.max(1, Math.ceil(routesData.length / 10)))
      }
      setLoading(false)
    }).catch(() => {
      const mockRutas = mockData.buildRutas()
      const mockDests = mockData.buildDestinos()
      const rId = filterRegion || regionId
      const filtered = rId ? mockRutas.filter(r => r.destinos.some(d => d.regionId === parseInt(rId) || d.regionId === rId)) : mockRutas
      setRoutes(filtered)
      setTotalItems(filtered.length)
      setTotalPages(Math.max(1, Math.ceil(filtered.length / 10)))
      setAvailableDestinations(rId ? mockDests.filter(d => d.regionId === parseInt(rId) || d.regionId === rId) : mockDests)
      setLoading(false)
    })
  }, [regionId, filterRegion, page])

  const openForm = (route = null) => {
    if (route) {
      setEditing(route.id)
      setForm({
        name: route.name,
        description: route.description || '',
        roadStatus: route.roadStatus || 'Buena',
        tourismType: route.tourismType || 'Ecoturismo',
        duration: String(route.durationHours || ''),
        distance: String(route.distanceKm || ''),
        destinations: (route.destinos || []).map(d => d.destinoId),
      })
    } else {
      setEditing(null)
      setForm({ name: '', description: '', roadStatus: 'Buena', tourismType: 'Ecoturismo', duration: '', distance: '', destinations: [] })
    }
    setShowForm(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || form.destinations.length === 0) return
    try {
      const destinosPayload = form.destinations.map((destinoId, i) => ({
        destinoId,
        orden: i + 1,
      }))
      const payload = {
        nombre: form.name,
        descripcion: form.description,
        vialidad: form.roadStatus,
        tipoTurismoId: tourismTypes.indexOf(form.tourismType) + 1,
        duracionHoras: form.duration ? parseInt(form.duration) : undefined,
        distanciaKm: form.distance ? parseFloat(form.distance) : undefined,
        destinos: destinosPayload,
      }
      if (editing) {
        await rutasService.update(editing, payload)
      } else {
        await rutasService.create(payload)
      }
      const rId = filterRegion || regionId
      const res = await rutasService.getAll(rId ? { regionId: rId } : {})
      setRoutes(res.rutas || [])
      setShowForm(false)
      setEditing(null)
    } catch (err) {
      alert('Error al guardar: ' + err.message)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta ruta?')) return
    try {
      await rutasService.delete(id)
      setRoutes(prev => prev.filter(r => r.id !== id))
    } catch (err) {
      alert('Error al eliminar: ' + err.message)
    }
  }

  const toggleArrayItem = (arr, item) =>
    arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item]

  const getDestName = (id) => availableDestinations.find(d => d.id === id)?.name || 'Desconocido'

  const getRegionName = (rId) => regions.find(r => r.REGI_COD === rId)?.REGI_NOM || ''

  if (loading) {
    return <div className="module-container"><p className="module-subtitle">Cargando rutas...</p></div>
  }

  return (
    <div className="module-container">
      <div className="module-header">
        <div>
          <h3 className="module-title">Diseñador de Rutas</h3>
          <p className="module-subtitle">Construya rutas turísticas - Contexto: {regionName}.</p>
        </div>
        <div className="module-header-actions">
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
                  {r.durationHours ? `${r.durationHours} hrs` : ''}
                </span>
                <span className="card-meta-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" /><circle cx="12" cy="10" r="3" /></svg>
                  {r.distanceKm ? `${r.distanceKm} km` : ''}
                </span>
                <span className="card-meta-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" /><line x1="9" y1="3" x2="9" y2="18" /><line x1="15" y1="6" x2="15" y2="21" /></svg>
                  {(r.destinos || []).length} destinos
                </span>
              </div>
              <div className="route-destinations-preview">
                {(r.destinos || []).map(d => (
                  <span key={d.destinoId} className="route-dest-tag">{d.name || getDestName(d.destinoId)}</span>
                ))}
              </div>
              <div className="card-actions">
                <button className="btn-icon-sm" onClick={(e) => { e.stopPropagation(); openForm(r) }} title="Editar">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                </button>
                <button className="btn-icon-sm btn-icon-danger" onClick={(e) => { e.stopPropagation(); handleDelete(r.id) }} title="Eliminar">
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
          <div className="modal-content modal-form-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editing ? 'Editar Ruta' : 'Nueva Ruta Turística'}</h3>
              <button className="modal-close-btn" onClick={() => setShowForm(false)}>&times;</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-modal-group flex-1">
                    <label>Nombre de la Ruta *</label>
                    <input type="text" className="form-modal-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
                  </div>
                </div>
                <div className="form-modal-group">
                  <label>Descripción</label>
                  <textarea className="form-modal-textarea" rows="2" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
                </div>
                <div className="form-row">
                  <div className="form-modal-group flex-1">
                    <label>Tipo de Turismo <span className="required-star">*</span></label>
                    <select className="form-modal-select" value={form.tourismType} onChange={e => setForm(p => ({ ...p, tourismType: e.target.value }))}>
                      {tourismTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="form-modal-group flex-1">
                    <label>Estado de la Vía <span className="required-star">*</span></label>
                    <select className="form-modal-select" value={form.roadStatus} onChange={e => setForm(p => ({ ...p, roadStatus: e.target.value }))}>
                      {roadStatuses.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-modal-group flex-1">
                    <label>Duración (horas)</label>
                    <input type="number" min="0" className="form-modal-input" value={form.duration} onChange={e => setForm(p => ({ ...p, duration: e.target.value }))} />
                  </div>
                  <div className="form-modal-group flex-1">
                    <label>Distancia (km)</label>
                    <input type="number" step="any" min="0" className="form-modal-input" value={form.distance} onChange={e => setForm(p => ({ ...p, distance: e.target.value }))} />
                  </div>
                </div>
                <div className="form-section-title">Destinos de la Ruta</div>
                <div className="form-modal-group">
                  <label>Filtrar por región</label>
                  <select className="form-modal-select" value={filterRegion} onChange={e => setFilterRegion(e.target.value)}>
                    <option value="">Todas las regiones</option>
                    {regions.map(r => <option key={r.REGI_COD} value={r.REGI_COD}>{r.REGI_NOM}</option>)}
                  </select>
                </div>
                <div className="form-modal-group">
                  <label>Destinos incluidos *</label>
                  <div className="checkbox-grid">
                    {availableDestinations.map(d => (
                      <label key={d.id} className={`checkbox-chip ${form.destinations.includes(d.id) ? 'checked' : ''}`}>
                        <input type="checkbox" checked={form.destinations.includes(d.id)} onChange={() => setForm(p => ({ ...p, destinations: toggleArrayItem(p.destinations, d.id) }))} />
                        {d.name}
                        <span className="checkbox-chip-sub">{d.estado ? d.estado : ''}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="submit" className="btn-modal-action approve">{editing ? 'Actualizar' : 'Guardar Ruta'}</button>
                <button type="button" className="btn-modal-action cancel" onClick={() => setShowForm(false)}>Cancelar</button>
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
                <div className="detail-row"><span className="detail-label">Descripción:</span><span className="detail-value">{detail.description}</span></div>
                <div className="detail-row"><span className="detail-label">Distancia:</span><span className="detail-value">{detail.distanceKm ? `${detail.distanceKm} km` : '—'}</span></div>
                <div className="detail-row"><span className="detail-label">Duración:</span><span className="detail-value">{detail.durationHours ? `${detail.durationHours} hrs` : '—'}</span></div>
                <div className="detail-row"><span className="detail-label">Destinos:</span><span className="detail-value">{(detail.destinos || []).map(d => d.name || getDestName(d.destinoId)).join(', ')}</span></div>
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
