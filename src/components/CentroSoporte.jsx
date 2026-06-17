import { useState, useEffect } from 'react'
import RegionOverviewCard from './RegionOverviewCard.jsx'
import { consultasService } from '../services/consultas'
import { opinionesService } from '../services/opiniones'

export default function CentroSoporte({ regionId = null, regionName = 'Visión Nacional' }) {
  const [tickets, setTickets] = useState([])
  const [ratings, setRatings] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('tickets')
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [responseText, setResponseText] = useState('')
  const [showRespondModal, setShowRespondModal] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const [consultasRes, opinionesRes] = await Promise.all([
        consultasService.getAll(),
        opinionesService.getAll(),
      ])
      setTickets(consultasRes.consultas || [])
      setRatings(opinionesRes.opiniones || [])
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  const handleRespond = async (id) => {
    if (!responseText.trim()) return
    try {
      await consultasService.responder(id, { respuesta: responseText })
      setShowRespondModal(false)
      setResponseText('')
      setSelectedTicket(null)
      loadData()
    } catch (err) {
      alert('Error al responder: ' + err.message)
    }
  }

  const uiTickets = tickets.map(t => ({
    id: t.id,
    visitorName: t.usuarioName || 'Anónimo',
    email: t.usuarioEmail || '',
    subject: (t.contenido || '').slice(0, 60) + ((t.contenido || '').length > 60 ? '...' : ''),
    message: t.contenido || '',
    date: t.fecha,
    status: t.estado === 'respondida' ? 'respondido' : 'pendiente',
    response: t.respuesta || '',
  }))

  const uiRatings = ratings.map(r => ({
    id: r.id,
    destino: r.destinoName || 'Desconocido',
    visitor: r.usuarioName || 'Anónimo',
    score: r.calificacion || 0,
    comment: r.comentario || '',
    date: r.fecha,
  }))

  const pendingCount = uiTickets.filter(t => t.status === 'pendiente').length

  if (loading) {
    return <div className="module-container"><p className="module-subtitle">Cargando soporte...</p></div>
  }

  return (
    <div className="module-container">
      <div className="module-header">
        <div>
          <h3 className="module-title">Centro de Soporte</h3>
          <p className="module-subtitle">Consultas de usuarios y monitoreo de opiniones - Contexto: {regionName}.</p>
        </div>
      </div>

      <div className="soporte-tabs">
        <button className={`soporte-tab ${activeTab === 'tickets' ? 'active' : ''}`} onClick={() => setActiveTab('tickets')}>
          Consultas {pendingCount > 0 && <span className="pending-badge">{pendingCount}</span>}
        </button>
        <button className={`soporte-tab ${activeTab === 'ratings' ? 'active' : ''}`} onClick={() => setActiveTab('ratings')}>
          Calificaciones y Opiniones
        </button>
      </div>

      {activeTab === 'tickets' ? (
        <div className="tickets-list">
          {uiTickets.length === 0 ? (
            <RegionOverviewCard moduleKey="soporte" regionId={regionId} regionName={regionName} />
          ) : (
              uiTickets.map(t => (
              <div key={t.id} className={`ticket-card ${t.status === 'pendiente' ? 'ticket-pending' : ''}`}>
                <div className="ticket-card-header">
                  <div className="ticket-card-from">
                    <strong>{t.visitorName}</strong>
                    <span className="ticket-email">{t.email}</span>
                  </div>
                  <span className={`ticket-status-badge ${t.status}`}>{t.status === 'pendiente' ? 'Pendiente' : 'Respondido'}</span>
                </div>
                <h4 className="ticket-subject">{t.subject}</h4>
                <p className="ticket-message">{t.message}</p>
                <div className="ticket-date">{t.date ? new Date(t.date).toLocaleDateString('es-ES') : ''}</div>
                {t.response && (
                  <div className="ticket-response">
                    <strong>Respuesta:</strong>
                    <p>{t.response}</p>
                  </div>
                )}
                <div className="ticket-card-footer">
                  {t.status === 'pendiente' && (
                    <button className="btn-module-primary btn-sm" onClick={() => { setSelectedTicket(t); setShowRespondModal(true) }}>
                      Responder
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="ratings-section">
          <div className="module-stats-row">
            <div className="stat-chip">Total: <strong>{uiRatings.length}</strong> opiniones</div>
            <div className="stat-chip">Promedio: <strong>{(uiRatings.reduce((a, r) => a + r.score, 0) / Math.max(1, uiRatings.length)).toFixed(1)}</strong> / 5</div>
          </div>

          {uiRatings.length === 0 ? (
            <RegionOverviewCard moduleKey="soporte" regionId={regionId} regionName={regionName} />
          ) : (
            <div className="ratings-list">
              {uiRatings.map(r => (
                <div key={r.id} className="rating-card">
                  <div className="rating-card-top">
                    <div className="rating-destino">{r.destino}</div>
                    <div className="rating-stars">
                      {[1, 2, 3, 4, 5].map(s => (
                        <span key={s} className={`star ${s <= r.score ? 'filled' : ''}`}>★</span>
                      ))}
                    </div>
                  </div>
                  <p className="rating-comment">"{r.comment}"</p>
                  <div className="rating-meta">
                    <span>{r.visitor}</span>
                    <span>{r.date ? new Date(r.date).toLocaleDateString('es-ES') : ''}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showRespondModal && selectedTicket && (
        <div className="modal-overlay" onClick={() => setShowRespondModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Responder Consulta</h3>
              <button className="modal-close-btn" onClick={() => setShowRespondModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="modal-details-card">
                <div className="detail-row"><span className="detail-label">De:</span><span className="detail-value">{selectedTicket.visitorName} ({selectedTicket.email})</span></div>
                <div className="detail-row"><span className="detail-label">Asunto:</span><span className="detail-value">{selectedTicket.subject}</span></div>
                <div className="detail-row"><span className="detail-label">Mensaje:</span><span className="detail-value">{selectedTicket.message}</span></div>
              </div>
              <div className="form-modal-group">
                <label>Su Respuesta</label>
                <textarea className="form-modal-textarea" rows="4" placeholder="Escriba su respuesta aquí..." value={responseText} onChange={e => setResponseText(e.target.value)} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-modal-action approve" onClick={() => handleRespond(selectedTicket.id)}>Enviar Respuesta</button>
              <button className="btn-modal-action cancel" onClick={() => setShowRespondModal(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
