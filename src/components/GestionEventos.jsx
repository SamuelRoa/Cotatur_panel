import { useState } from 'react'
import RegionOverviewCard from './RegionOverviewCard.jsx'

const initialEvents = [
  { id: 1, title: 'Feria Internacional de San Sebastián', description: 'Evento cultural y ferial con exposiciones agropecuarias, artesanales y musicales.', date: '2026-01-20', destination: 'San Cristóbal', eventType: 'Feria', status: 'activo', region: 'los_andes' },
  { id: 2, title: 'Ferias de Colón', description: 'Evento cultural y religioso en el municipio Ayacucho', date: '2026-04-02', destination: 'Colón', eventType: 'Cultural', status: 'finalizado', region: 'central' },
  { id: 3, title: 'Festival Gastronómico de Capacho', description: 'Evento gastronómico con degustaciones y concursos.', date: '2026-08-15', destination: 'Capacho', eventType: 'Gastronómico', status: 'activo', region: 'los_andes' },
  { id: 4, title: 'Expo Turismo Táchira 2026', description: 'Exposición de la oferta turística regional con rueda de negocios.', date: '2026-11-10', destination: 'San Cristóbal', eventType: 'Feria', status: 'planificado', region: 'los_andes' },
  { id: 5, title: 'Carnaval de Margarita', description: 'Desfiles y comparsas en las calles de Porlamar y Pampatar.', date: '2026-02-14', destination: 'Porlamar', eventType: 'Cultural', status: 'finalizado', region: 'insular' },
  { id: 6, title: 'Feria Internacional de Barquisimeto', description: 'Evento ferial con exposiciones, conciertos y actividades culturales.', date: '2026-09-14', destination: 'Barquisimeto', eventType: 'Feria', status: 'planificado', region: 'eje' },
  { id: 7, title: 'Feria de la Chinita', description: 'La celebración más importante del Zulia en honor a la Virgen de la Chiquinquirá.', date: '2026-11-18', destination: 'Maracaibo', eventType: 'Religioso', status: 'planificado', region: 'eje' },
  { id: 8, title: 'Festival del Joropo', description: 'Música, baile y tradición llanera en San Fernando de Apure.', date: '2026-03-20', destination: 'San Fernando', eventType: 'Cultural', status: 'finalizado', region: 'llanos' },
  { id: 9, title: 'Exposición Indígena y Artesanal', description: 'Muestra de artesanía y cultura de los pueblos indígenas amazónicos.', date: '2026-10-12', destination: 'Puerto Ayacucho', eventType: 'Cultural', status: 'planificado', region: 'amazonica' },
  { id: 10, title: 'Carnaval de Cumaná', description: 'Uno de los carnavales más tradicionales del oriente venezolano.', date: '2026-02-14', destination: 'Cumaná', eventType: 'Cultural', status: 'finalizado', region: 'oriental' },
  { id: 11, title: 'Feria de la Virgen del Valle', description: 'Celebración religiosa en honor a la patrona del oriente venezolano.', date: '2026-09-08', destination: 'El Valle', eventType: 'Religioso', status: 'planificado', region: 'oriental' },
  { id: 12, title: 'Semana Santa en La Grita', description: 'Una de las celebraciones religiosas más importantes de Venezuela.', date: '2026-04-01', destination: 'La Grita', eventType: 'Religioso', status: 'activo', region: 'los_andes' },
]

const eventTypes = ['Cultural', 'Feria', 'Gastronómico', 'Deportivo', 'Religioso', 'Musical']
const destinations = ['San Cristóbal', 'Mérida', 'Tovar', 'Colón', 'Ayacucho', 'Jáuregui', 'La Grita']

const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

function getMonthEvents(events, monthIndex) {
  return events.filter(e => {
    const m = new Date(e.date).getMonth()
    return m === monthIndex
  })
}

export default function GestionEventos({ regionId = 'national', regionName = 'Visión Nacional' }) {
  const [events, setEvents] = useState(initialEvents)
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [detail, setDetail] = useState(null)
  const [form, setForm] = useState({ title: '', description: '', date: '', destination: 'San Cristóbal', eventType: 'Cultural', status: 'activo' })

  const openForm = (ev = null) => {
    if (ev) {
      setEditing(ev.id)
      setForm({ title: ev.title, description: ev.description, date: ev.date, destination: ev.destination, eventType: ev.eventType, status: ev.status })
    } else {
      setEditing(null)
      setForm({ title: '', description: '', date: '', destination: 'San Cristóbal', eventType: 'Cultural', status: 'activo' })
    }
    setShowForm(true)
  }

  const handleSave = (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.date) return
    if (editing) {
      setEvents(prev => prev.map(ev => ev.id === editing ? { ...ev, ...form } : ev))
    } else {
      setEvents(prev => [{ id: Date.now(), ...form }, ...prev])
    }
    setShowForm(false)
    setEditing(null)
  }

  const handleDelete = (id) => {
    if (window.confirm('¿Eliminar este evento?'))
      setEvents(prev => prev.filter(ev => ev.id !== id))
  }

  const monthEvents = getMonthEvents(events.filter(ev => regionId === 'national' ? true : ev.region === regionId), currentMonth)

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(y => y - 1)
    } else {
      setCurrentMonth(m => m - 1)
    }
  }

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(y => y + 1)
    } else {
      setCurrentMonth(m => m + 1)
    }
  }

  return (
    <div className="module-container">
      <div className="module-header">
        <div>
          <h3 className="module-title">Gestión de Eventos</h3>
          <p className="module-subtitle">Calendario y planificación de eventos - Contexto: {regionName}.</p>
        </div>
        <div className="module-header-actions">
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
            <div key={ev.id} className="event-card" onClick={() => setDetail(ev)}>
              <div className="event-card-date">
                <span className="event-card-day">{new Date(ev.date).getDate()}</span>
                <span className="event-card-month">{months[new Date(ev.date).getMonth()].slice(0, 3)}</span>
              </div>
              <div className="event-card-body">
                <h4 className="event-card-title">{ev.title}</h4>
                <p className="event-card-desc">{ev.description}</p>
                <div className="event-card-tags">
                  <span className="event-tag">{ev.eventType}</span>
                  <span className="event-tag">{ev.destination}</span>
                  <span className={`event-status-tag ${ev.status}`}>{ev.status}</span>
                </div>
              </div>
              <div className="event-card-actions-vert">
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
                <th className="table-th">Tipo</th>
                <th className="table-th">Estado</th>
              </tr>
            </thead>
            <tbody>
              {events.map(ev => (
                <tr key={ev.id} style={{ cursor: 'pointer' }} onClick={() => setDetail(ev)}>
                  <td className="table-td">{ev.title}</td>
                  <td className="table-td">{new Date(ev.date).toLocaleDateString('es-ES')}</td>
                  <td className="table-td">{ev.destination}</td>
                  <td className="table-td">{ev.eventType}</td>
                  <td className="table-td"><span className={`event-status-tag ${ev.status}`}>{ev.status}</span></td>
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
                    <label>Destino</label>
                    <select className="form-modal-select" value={form.destination} onChange={e => setForm(p => ({ ...p, destination: e.target.value }))}>
                      {destinations.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-modal-group flex-1">
                    <label>Tipo de Evento</label>
                    <select className="form-modal-select" value={form.eventType} onChange={e => setForm(p => ({ ...p, eventType: e.target.value }))}>
                      {eventTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="form-modal-group flex-1">
                    <label>Estado</label>
                    <select className="form-modal-select" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                      <option value="activo">Activo</option>
                      <option value="planificado">Planificado</option>
                      <option value="finalizado">Finalizado</option>
                    </select>
                  </div>
                </div>
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
                <div className="detail-row"><span className="detail-label">Destino:</span><span className="detail-value">{detail.destination}</span></div>
                <div className="detail-row"><span className="detail-label">Tipo:</span><span className="detail-value">{detail.eventType}</span></div>
                <div className="detail-row"><span className="detail-label">Estado:</span><span className="detail-value"><span className={`event-status-tag ${detail.status}`}>{detail.status}</span></span></div>
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
