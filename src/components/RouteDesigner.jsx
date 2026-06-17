import { useState, useEffect } from 'react'
import RegionOverviewCard from './RegionOverviewCard.jsx'
import { rutasService } from '../services/rutas'
import { destinosService } from '../services/destinos'
import { prestadoresService } from '../services/prestadores'

export default function RouteDesigner({ regionId = null, regionName = 'Visión Nacional' }) {
  const [routes, setRoutes] = useState([])
  const [loading, setLoading] = useState(true)
  const [availableDestinations, setAvailableDestinations] = useState([])
  const [accommodations, setAccommodations] = useState([])
  const [eateries, setEateries] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [detail, setDetail] = useState(null)
  const [form, setForm] = useState({ name: '', description: '', destinations: [], duration: '', distance: '' })

  useEffect(() => {
    setLoading(true)
    const destParams = {}
    if (regionId) destParams.regionId = regionId
    Promise.all([
      rutasService.getAll(regionId ? { regionId } : {}),
      destinosService.getAll(destParams),
      prestadoresService.getAll({ tipo: 'hosped' }),
      prestadoresService.getAll({ tipo: 'rest' }),
    ]).then(([routesRes, destinosRes, hospedRes, restRes]) => {
      setRoutes(routesRes.rutas || [])
      setAvailableDestinations(destinosRes.destinos || [])
      setAccommodations(hospedRes.prestadores || [])
      setEateries(restRes.prestadores || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [regionId])

  const openForm = (route = null) => {
    if (route) {
      setEditing(route.id)
      setForm({
        name: route.name,
        description: route.description || '',
        destinations: (route.destinos || []).map(d => d.destinoId),
        duration: route.durationHours ? `${route.durationHours} horas` : '',
        distance: route.distanceKm ? `${route.distanceKm} km` : '',
      })
    } else {
      setEditing(null)
      setForm({ name: '', description: '', destinations: [], duration: '', distance: '' })
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
        destinos: destinosPayload,
      }
      if (editing) {
        await rutasService.update(editing, payload)
      } else {
        await rutasService.create(payload)
      }
      const res = await rutasService.getAll(regionId ? { regionId } : {})
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
  const getAccName = (id) => accommodations.find(a => a.id === id)?.name || 'Desconocido'
  const getEatName = (id) => eateries.find(e => e.id === id)?.name || 'Desconocido'

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
          <button className="btn-module-primary" onClick={() => openForm()}>+ Nueva Ruta</button>
        </div>
      </div>

      <div className="routes-list">
        {routes.length === 0 ? (
          <RegionOverviewCard moduleKey="rutas" regionId={regionId} regionName={regionName} />
        ) : (
          routes.filter(r => !regionId || (r.destinos || []).some(d => {
            const dest = availableDestinations.find(ad => ad.id === d.destinoId)
            return dest && dest.regionId === regionId
          })).map(r => (
            <div key={r.id} className="route-card" onClick={() => setDetail(r)}>
              <div className="route-card-main">
                <h4 className="route-card-name">{r.name}</h4>
                <p className="route-card-desc">{r.description}</p>
                <div className="route-card-meta">
                  <span className="route-meta-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" /><circle cx="12" cy="10" r="3" /></svg>
                    {r.distanceKm ? `${r.distanceKm} km` : ''}
                  </span>
                  <span className="route-meta-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                    {r.durationHours ? `${r.durationHours} hrs` : ''}
                  </span>
                  <span className="route-meta-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M9 18l6-6-6-6" /></svg>
                    {(r.destinos || []).length} destinos
                  </span>
                </div>
                <div className="route-destinations-preview">
                  {(r.destinos || []).map(d => (
                    <span key={d.destinoId} className="route-dest-tag">{d.name || getDestName(d.destinoId)}</span>
                  ))}
                </div>
              </div>
              <div className="route-card-actions">
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
                <div className="form-modal-group">
                  <label>Destinos incluidos</label>
                  <div className="checkbox-grid">
                    {availableDestinations.map(d => (
                      <label key={d.id} className={`checkbox-chip ${form.destinations.includes(d.id) ? 'checked' : ''}`}>
                        <input type="checkbox" checked={form.destinations.includes(d.id)} onChange={() => setForm(p => ({ ...p, destinations: toggleArrayItem(p.destinations, d.id) }))} />
                        {d.name}
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
