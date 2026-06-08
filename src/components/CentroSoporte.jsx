import { useState } from 'react'
import RegionOverviewCard from './RegionOverviewCard.jsx'

const initialTickets = [
  { id: 1, visitorName: 'María González', email: 'maria@correo.com', subject: 'Información sobre rutas turísticas', message: '¿Qué rutas hay en San Cristóbal?', date: '2026-05-28', status: 'pendiente', response: '', region: 'los_andes' },
  { id: 2, visitorName: 'José Ramírez', email: 'jose@correo.com', subject: 'Calificación Pico Bolívar', message: 'Excelente experiencia en el Pico Bolívar.', date: '2026-05-25', status: 'respondido', response: 'Gracias por su comentario.', region: 'los_andes' },
  { id: 3, visitorName: 'Ana Lucía Méndez', email: 'ana@correo.com', subject: 'Consulta hospedaje', message: '¿Posadas cerca de La Laguna validadas?', date: '2026-05-22', status: 'pendiente', response: '', region: 'los_andes' },
  { id: 4, visitorName: 'Carlos Pereira', email: 'carlos@correo.com', subject: 'Sugerencia destino', message: 'Incluir Mirador de la Loma.', date: '2026-05-18', status: 'respondido', response: 'Gracias Carlos, lo evaluaremos.', region: 'central' },
  { id: 5, visitorName: 'Laura Martínez', email: 'laura@correo.com', subject: 'Playa El Agua accesible', message: '¿Hay rampas para discapacitados en Playa El Agua?', date: '2026-05-26', status: 'pendiente', response: '', region: 'insular' },
  { id: 6, visitorName: 'Roberto Díaz', email: 'roberto@correo.com', subject: 'Información sobre Los Llanos', message: '¿Cuál es la mejor época para visitar Los Llanos?', date: '2026-05-24', status: 'respondido', response: 'Le recomendamos la época de sequía (diciembre-abril).', region: 'llanos' },
  { id: 7, visitorName: 'Elena Vargas', email: 'elena@correo.com', subject: 'Vuelos a Canaima', message: '¿Qué aerolíneas tienen vuelos a Canaima?', date: '2026-05-20', status: 'pendiente', response: '', region: 'amazonica' },
  { id: 8, visitorName: 'Andrés Castillo', email: 'andres@correo.com', subject: 'Hotel en Cumaná', message: 'Busco hoteles cerca del malecón de Cumaná.', date: '2026-05-19', status: 'respondido', response: 'Le sugerimos Hotel Venetur Cumaná o Cumaná Beach Hotel.', region: 'oriental' },
  { id: 9, visitorName: 'Mónica Rivas', email: 'monica@correo.com', subject: 'Eventos en Barquisimeto', message: '¿Habrá conciertos en la Feria de Barquisimeto 2026?', date: '2026-05-16', status: 'pendiente', response: '', region: 'eje' },
  { id: 10, visitorName: 'Fernando Rojas', email: 'fernando@correo.com', subject: 'Calificación Teleférico de Mérida', message: 'Excelente experiencia, vistas espectaculares.', date: '2026-05-12', status: 'respondido', response: '¡Gracias por compartir su experiencia!', region: 'los_andes' },
]

const initialRatings = [
  { id: 1, destino: 'Parque Nacional El Ávila', visitor: 'Luisa Fernández', score: 5, comment: 'Hermoso lugar, muy bien cuidado.', date: '2026-05-20', region: 'central' },
  { id: 2, destino: 'Playa El Agua', visitor: 'Pedro Sánchez', score: 4, comment: 'Excelente playa, pero le falta señalización.', date: '2026-05-18', region: 'insular' },
  { id: 3, destino: 'Salto Ángel', visitor: 'Sofía Torres', score: 5, comment: 'Impresionante, una maravilla natural.', date: '2026-05-15', region: 'amazonica' },
  { id: 4, destino: 'Pico Bolívar', visitor: 'José Ramírez', score: 4, comment: 'Excelente experiencia, mejorar acceso vial.', date: '2026-05-14', region: 'los_andes' },
  { id: 5, destino: 'Médanos de Coro', visitor: 'Ricardo Salas', score: 3, comment: 'Muy caluroso.', date: '2026-05-10', region: 'eje' },
  { id: 6, destino: 'Parque Nacional Mochima', visitor: 'Diana López', score: 5, comment: 'Playas paradisíacas, imperdible.', date: '2026-05-22', region: 'oriental' },
  { id: 7, destino: 'Laguna de Mucubají', visitor: 'Andrés Méndez', score: 5, comment: 'Paisaje espectacular, muy frío pero vale la pena.', date: '2026-05-19', region: 'los_andes' },
  { id: 8, destino: 'Hato El Cedral', visitor: 'Gabriel Torres', score: 4, comment: 'Excelente avistamiento de fauna silvestre.', date: '2026-05-11', region: 'llanos' },
  { id: 9, destino: 'Castillo San Carlos de Borromeo', visitor: 'Valentina Ríos', score: 4, comment: 'Muy interesante desde el punto de vista histórico.', date: '2026-05-08', region: 'insular' },
  { id: 10, destino: 'Teleférico de Mérida', visitor: 'Fernando Rojas', score: 5, comment: 'El teleférico más alto del mundo, increíble.', date: '2026-05-06', region: 'los_andes' },
]

export default function CentroSoporte({ regionId = 'national', regionName = 'Visión Nacional' }) {
  const [tickets, setTickets] = useState(initialTickets)
  const [ratings] = useState(initialRatings)
  const [activeTab, setActiveTab] = useState('tickets')
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [responseText, setResponseText] = useState('')
  const [showRespondModal, setShowRespondModal] = useState(false)

  const handleRespond = (id) => {
    if (!responseText.trim()) return
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: 'respondido', response: responseText } : t))
    setShowRespondModal(false)
    setResponseText('')
    setSelectedTicket(null)
  }

  const filteredTickets = tickets.filter(t => regionId === 'national' ? true : t.region === regionId)
  const pendingCount = filteredTickets.filter(t => t.status === 'pendiente').length
  const filteredRatings = ratings.filter(r => regionId === 'national' ? true : r.region === regionId)

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
          {filteredTickets.length === 0 ? (
            <RegionOverviewCard moduleKey="soporte" regionId={regionId} regionName={regionName} />
          ) : (
              filteredTickets.map(t => (
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
                <div className="ticket-date">{new Date(t.date).toLocaleDateString('es-ES')}</div>
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
            <div className="stat-chip">Total: <strong>{filteredRatings.length}</strong> opiniones</div>
            <div className="stat-chip">Promedio: <strong>{(filteredRatings.reduce((a, r) => a + r.score, 0) / Math.max(1, filteredRatings.length)).toFixed(1)}</strong> / 5</div>
          </div>

          {filteredRatings.length === 0 ? (
            <RegionOverviewCard moduleKey="soporte" regionId={regionId} regionName={regionName} />
          ) : (
            <div className="ratings-list">
              {filteredRatings.map(r => (
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
                    <span>{new Date(r.date).toLocaleDateString('es-ES')}</span>
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
