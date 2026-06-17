import { useState, useEffect } from 'react'
import RegionOverviewCard from './RegionOverviewCard.jsx'
import { eventosService } from '../services/eventos'
import { geoService } from '../services/geo'

const eventTypes = ['Cultural', 'Feria', 'Gastronómico', 'Deportivo', 'Religioso', 'Musical']
const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

function getMonthEvents(events, monthIndex) {
  return events.filter(e => {
    const d = new Date(e.date)
    return d.getMonth() === monthIndex
  })
}

export default function GestionEventos({ regionId = null, regionName = 'Visión Nacional' }) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [detail, setDetail] = useState(null)
  const [filterRegion, setFilterRegion] = useState(regionId || '')
  const [form, setForm] = useState({ title: '', description: '', date: '', regionId: '', destinoId: '', eventType: 'Cultural', status: 'activo' })
  const [geoError, setGeoError] = useState('')

  const [regions, setRegions] = useState([])

  useEffect(() => {
    geoService.getRegiones().then((res) => {
      setRegions(res.data || res || [])
    }).catch(() => {})
  }, [])

  useEffect(() => {
    const params = {}
    const rId = filterRegion || regionId
    if (rId) params.regionId = rId
    eventosService.getAll(params).then((res) => {
      setEvents(res.eventos || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [regionId, filterRegion])

  const openForm = (ev = null) => {
    if (ev) {
      setEditing(ev.id)
      setForm({
        title: ev.title,
        description: ev.description || '',
        date: ev.date ? ev.date.slice(0, 10) : '',
        regionId: ev.regionId || '',
        destinoId: ev.destinoId || '',
        eventType: ev.eventType || 'Cultural',
        status: 'activo',
      })
    } else {
      setEditing(null)
      setForm({ title: '', description: '', date: '', regionId: '', destinoId: '', eventType: 'Cultural', status: 'activo' })
    }
    setShowForm(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setGeoError('')
    if (!form.title.trim() || !form.date) return
    const destId = parseInt(form.destinoId)
    if (!destId || destId < 1) {
      setGeoError('Debe ingresar un ID de destino válido (1-3).')
      return
    }
    try {
      const payload = {
        nombre: form.title,
        descripcion: form.description,
        fechaInicio: form.date,
        tipoEventoId: eventTypes.indexOf(form.eventType) + 1,
        destinoId: destId,
      }
      if (editing) {
        await eventosService.update(editing, payload)
      } else {
        await eventosService.create(payload)
      }
      const params = {}
      const rId = filterRegion || regionId
      if (rId) params.regionId = rId
      const res = await eventosService.getAll(params)
      setEvents(res.eventos || [])
      setShowForm(false)
      setEditing(null)
      setGeoError('')
    } catch (err) {
      setGeoError(err.message)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este evento?')) return
    try {
      await eventosService.delete(id)
      setEvents(prev => prev.filter(ev => ev.id !== id))
    } catch (err) {
      alert('Error al eliminar: ' + err.message)
    }
  }

  const monthEvents = getMonthEvents(events, currentMonth)

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1) }
    else { setCurrentMonth(m => m - 1) }
  }

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1) }
    else { setCurrentMonth(m => m + 1) }
  }

  const getRegionName = (rId) => regions.find(r => r.REGI_COD === rId)?.REGI_NOM || ''

  if (loading) {
    return <div className="module-container"><p className="module-subtitle">Cargando eventos...</p></div>
  }

  return (
    <div className="module-container">
      <div className="module-header">
        <div>
          <h3 className="module-title">Gestión de Eventos</h3>
          <p className="module-subtitle">Calendario y planificación de eventos - Contexto: {regionName}.</p>
        </div>
        <div className="module-header-actions">
          <select className="module-filter-select" value={filterRegion} onChange={e => setFilterRegion(e.target.value)}>
            <option value="">Todas las regiones</option>
            {regions.map(r => <option key={r.REGI_COD} value={r.REGI_COD}>{r.REGI_NOM}</option>)}
          </select>
          <button className="btn-module-primary" onClick={() => openForm()}>+ Nuevo Evento</button>
        </div>
      </div>

      <div className="event-calendar-header">
        <button className="btn-month-nav" onClick={prevMonth}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <h3 className="calendar-month-label">{months[currentMonth]} {currentYear}</h3>
        <button className="btn-month-nav" onClick={nextMonth}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><polyline points="9 18 15 12 9 6" /></svg>
        </button>
      </div>

      <div className="event-cards-list">
        {monthEvents.length === 0 ? (
          <RegionOverviewCard moduleKey="eventos" regionId={regionId} regionName={regionName} />
        ) : (
          monthEvents.map(ev => (
            <div key={ev.id} className="card-modern card-event" onClick={() => setDetail(ev)}>
              <div className="event-card-date">
                <span className="event-card-day">{new Date(ev.date).getDate()}</span>
                <span className="event-card-month">{months[new Date(ev.date).getMonth()].slice(0, 3)}</span>
              </div>
              <div className="card-event-body">
                <div className="card-tags">
                  <span className="tag-type">{ev.eventType}</span>
                  {ev.regionId && <span className="card-region-badge">{getRegionName(ev.regionId)}</span>}
                </div>
                <h4 className="card-title">{ev.title}</h4>
                <p className="card-desc">{ev.description}</p>
                <div className="card-meta">
                  <span className="card-meta-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" /><line x1="9" y1="3" x2="9" y2="18" /><line x1="15" y1="6" x2="15" y2="21" /></svg>
                    {ev.destinoName}
                  </span>
                  {ev.estado && (
                    <span className="card-meta-item">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                      {ev.estado}
                    </span>
                  )}
                </div>
              </div>
              <div className="card-actions card-actions-vert">
                <button className="btn-icon-sm" onClick={(e) => { e.stopPropagation(); openForm(ev) }} title="Editar">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                </button>
                <button className="btn-icon-sm btn-icon-danger" onClick={(e) => { e.stopPropagation(); handleDelete(ev.id) }} title="Eliminar">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="all-events-section">
        <h4 className="providers-category-title">Todos los Eventos</h4>
        <div className="table-responsive">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th className="table-th">Título</th>
                <th className="table-th">Fecha</th>
                <th className="table-th">Destino</th>
                <th className="table-th">Estado</th>
                <th className="table-th">Tipo</th>
              </tr>
            </thead>
            <tbody>
              {events.map(ev => (
                <tr key={ev.id} style={{ cursor: 'pointer' }} onClick={() => setDetail(ev)}>
                  <td className="table-td">{ev.title}</td>
                  <td className="table-td">{new Date(ev.date).toLocaleDateString('es-ES')}</td>
                  <td className="table-td">{ev.destinoName}</td>
                  <td className="table-td">{ev.estado || '—'}</td>
                  <td className="table-td">{ev.eventType}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editing ? 'Editar Evento' : 'Nuevo Evento'}</h3>
              <button className="modal-close-btn" onClick={() => setShowForm(false)}>&times;</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-modal-group">
                  <label>Título del Evento *</label>
                  <input type="text" className="form-modal-input" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
                </div>
                <div className="form-modal-group">
                  <label>Descripción</label>
                  <textarea className="form-modal-textarea" rows="2" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
                </div>
                <div className="form-row">
                  <div className="form-modal-group flex-1">
                    <label>Fecha *</label>
                    <input type="date" className="form-modal-input" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} required />
                  </div>
                  <div className="form-modal-group flex-1">
                    <label>Tipo de Evento</label>
                    <select className="form-modal-select" value={form.eventType} onChange={e => setForm(p => ({ ...p, eventType: e.target.value }))}>
                      {eventTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-section-title">Ubicación</div>
                <div className="form-row">
                  <div className="form-modal-group flex-1">
                    <label>Región</label>
                    <select className="form-modal-select" value={form.regionId} onChange={e => setForm(p => ({ ...p, regionId: e.target.value }))}>
                      <option value="">Seleccione...</option>
                      {regions.map(r => <option key={r.REGI_COD} value={r.REGI_COD}>{r.REGI_NOM}</option>)}
                    </select>
                  </div>
                  <div className="form-modal-group flex-1">
                    <label>ID Destino <span className="required-star">*</span></label>
                    <input type="number" min="1" max="3" className="form-modal-input" value={form.destinoId} onChange={e => setForm(p => ({ ...p, destinoId: e.target.value }))} placeholder="1, 2 o 3" />
                    <small style={{ color: '#888', fontSize: '11px', display: 'block', marginTop: 4 }}>IDs válidos: 1, 2, 3 (destinos existentes)</small>
                  </div>
                </div>
                {geoError && <p style={{ color: '#e3342f', fontSize: 12, marginTop: 8 }}>{geoError}</p>}
              </div>
              <div className="modal-footer">
                <button type="submit" className="btn-modal-action approve">{editing ? 'Actualizar' : 'Guardar'}</button>
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
              <h3 className="modal-title">{detail.title}</h3>
              <button className="modal-close-btn" onClick={() => setDetail(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="modal-details-card">
                <div className="detail-row"><span className="detail-label">Descripción:</span><span className="detail-value">{detail.description}</span></div>
                <div className="detail-row"><span className="detail-label">Fecha:</span><span className="detail-value">{new Date(detail.date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
                <div className="detail-row"><span className="detail-label">Destino:</span><span className="detail-value">{detail.destinoName}</span></div>
                <div className="detail-row"><span className="detail-label">Región:</span><span className="detail-value">{getRegionName(detail.regionId)}</span></div>
                <div className="detail-row"><span className="detail-label">Estado:</span><span className="detail-value">{detail.estado || '—'}</span></div>
                <div className="detail-row"><span className="detail-label">Tipo:</span><span className="detail-value">{detail.eventType}</span></div>
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
