import { useState } from 'react'
import RegionOverviewCard from './RegionOverviewCard.jsx'

const initialPosts = [
  { id: 1, title: 'Impulso al turismo sostenible', content: 'Plan de desarrollo turístico regional con capacitación a prestadores y promoción de rutas sostenibles.', type: 'noticia', date: '2026-05-20', published: true, destination: null, region: 'los_andes' },
  { id: 2, title: 'Ficha: Parque Nacional El Ávila', content: 'Ficha oficial del destino. Ubicado en la cordillera de la Costa, ideal para senderismo y avistamiento de aves.', type: 'ficha', date: '2026-05-15', published: true, destination: 1, region: 'central' },
  { id: 3, title: 'Comunicado: Nuevos horarios de atención', content: 'Se informa que los horarios de atención al público en oficinas regionales han sido extendidos.', type: 'comunicado', date: '2026-05-10', published: true, destination: null, region: 'los_andes' },
  { id: 4, title: 'Ficha: Salto Ángel', content: 'Ficha oficial del destino, patrimonio natural de la humanidad.', type: 'ficha', date: '2026-04-28', published: false, destination: 3, region: 'amazonica' },
  { id: 5, title: 'Ruta de los Páramos Andinos', content: 'Recorrido por los páramos más emblemáticos de Mérida y Táchira con guías especializados.', type: 'noticia', date: '2026-05-22', published: true, destination: null, region: 'los_andes' },
  { id: 6, title: 'Ficha: Parque Nacional Mochima', content: 'Ficha oficial del destino. Parque marino-costero con playas, islas y diversidad marina.', type: 'ficha', date: '2026-05-18', published: true, destination: 11, region: 'oriental' },
  { id: 7, title: 'Isla de Margarita: Temporada Alta 2026', content: 'Proyecciones de ocupación hotelera y recomendaciones para la temporada vacacional.', type: 'noticia', date: '2026-05-25', published: true, destination: null, region: 'insular' },
  { id: 8, title: 'Comunicado: Nuevas rutas aéricas a Canaima', content: 'Se han autorizado nuevas frecuencias de vuelos comerciales a Canaima desde Caracas y Porlamar.', type: 'comunicado', date: '2026-05-12', published: true, destination: null, region: 'amazonica' },
  { id: 9, title: 'Ficha: Dunes de Coro', content: 'Ficha oficial del destino. Parque nacional con dunas de arena y ecosistema xerófilo.', type: 'ficha', date: '2026-05-08', published: true, destination: 9, region: 'eje' },
  { id: 10, title: 'Turismo de Aventura en los Llanos', content: 'Cabalgatas, pesca deportiva y observación de fauna en los llanos venezolanos.', type: 'noticia', date: '2026-05-05', published: true, destination: null, region: 'llanos' },
  { id: 11, title: 'Ficha: Parque Nacional Canaima', content: 'Ficha oficial del destino. Patrimonio de la Humanidad con tepuyes y cascadas.', type: 'ficha', date: '2026-04-20', published: true, destination: 3, region: 'amazonica' },
  { id: 12, title: 'La Grita: Ciudad Mística de los Andes', content: 'Artículo especial sobre la historia y tradiciones religiosas de La Grita.', type: 'noticia', date: '2026-04-15', published: false, destination: null, region: 'los_andes' },
]

export default function CentroDifusion({ regionId = 'national', regionName = 'Visión Nacional' }) {
  const [posts, setPosts] = useState(initialPosts)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [detail, setDetail] = useState(null)
  const [filterType, setFilterType] = useState('todas')
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ title: '', content: '', type: 'noticia', published: true, destination: '' })

  const openForm = (post = null) => {
    if (post) {
      setEditing(post.id)
      setForm({ title: post.title, content: post.content, type: post.type, published: post.published, destination: post.destination || '' })
    } else {
      setEditing(null)
      setForm({ title: '', content: '', type: 'noticia', published: true, destination: '' })
    }
    setShowForm(true)
  }

  const handleSave = (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.content.trim()) return
    const payload = { ...form, destination: form.destination ? Number(form.destination) : null }
    if (editing) {
      setPosts(prev => prev.map(p => p.id === editing ? { ...p, ...payload } : p))
    } else {
      setPosts(prev => [{ id: Date.now(), ...payload, date: new Date().toISOString().slice(0, 10) }, ...prev])
    }
    setShowForm(false)
    setEditing(null)
  }

  const handleDelete = (id) => {
    if (window.confirm('¿Eliminar esta publicación?'))
      setPosts(prev => prev.filter(p => p.id !== id))
  }

  const togglePublish = (id) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, published: !p.published } : p))
  }

  const filtered = posts.filter(p => {
    const matchType = filterType === 'todas' || p.type === filterType
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.content.toLowerCase().includes(search.toLowerCase())
    const matchRegion = regionId === 'national' ? true : p.region === regionId
    return matchType && matchSearch && matchRegion
  })

  const typeLabels = { noticia: 'Noticia', comunicado: 'Comunicado', ficha: 'Ficha de Destino' }

  return (
    <div className="module-container">
      <div className="module-header">
        <div>
          <h3 className="module-title">Centro de Difusión</h3>
          <p className="module-subtitle">Contenido institucional y fichas públicas - Contexto: {regionName}.</p>
        </div>
        <div className="module-header-actions">
          <input type="text" className="module-search" placeholder="Buscar contenido..." value={search} onChange={e => setSearch(e.target.value)} />
          <select className="module-filter-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="todas">Todo</option>
            <option value="noticia">Noticias</option>
            <option value="comunicado">Comunicados</option>
            <option value="ficha">Fichas de Destino</option>
          </select>
          <button className="btn-module-primary" onClick={() => openForm()}>+ Nueva Publicación</button>
        </div>
      </div>

      <div className="post-list">
        {filtered.length === 0 ? (
          <RegionOverviewCard moduleKey="difusion" regionId={regionId} regionName={regionName} />
        ) : (
          filtered.map(p => (
            <div key={p.id} className={`post-card ${!p.published ? 'post-draft' : ''}`} onClick={() => setDetail(p)}>
              <div className="post-card-left">
                <span className={`post-type-badge ${p.type}`}>{typeLabels[p.type]}</span>
                <div className="post-card-info">
                  <h4 className="post-card-title">{p.title}</h4>
                  <p className="post-card-excerpt">{p.content.slice(0, 120)}...</p>
                  <span className="post-card-date">{new Date(p.date).toLocaleDateString('es-ES')}</span>
                </div>
              </div>
              <div className="post-card-actions">
                {!p.published && <span className="post-draft-label">Borrador</span>}
                <button className="btn-icon-sm" onClick={(e) => { e.stopPropagation(); togglePublish(p.id) }} title={p.published ? 'Despublicar' : 'Publicar'}>
                  {p.published ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                  )}
                </button>
                <button className="btn-icon-sm" onClick={(e) => { e.stopPropagation(); openForm(p) }} title="Editar">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                </button>
                <button className="btn-icon-sm btn-icon-danger" onClick={(e) => { e.stopPropagation(); handleDelete(p.id) }} title="Eliminar">
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
              <h3 className="modal-title">{editing ? 'Editar Publicación' : 'Nueva Publicación'}</h3>
              <button className="modal-close-btn" onClick={() => setShowForm(false)}>&times;</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-modal-group flex-1">
                    <label>Título *</label>
                    <input type="text" className="form-modal-input" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
                  </div>
                  <div className="form-modal-group" style={{ minWidth: '140px' }}>
                    <label>Tipo</label>
                    <select className="form-modal-select" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                      <option value="noticia">Noticia</option>
                      <option value="comunicado">Comunicado</option>
                      <option value="ficha">Ficha de Destino</option>
                    </select>
                  </div>
                </div>
                <div className="form-modal-group">
                  <label>Contenido *</label>
                  <textarea className="form-modal-textarea" rows="5" value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} required />
                </div>
                <div className="form-row">
                  <div className="form-modal-group flex-1">
                    <label>Destino asociado (opcional)</label>
                    <input type="number" className="form-modal-input" placeholder="ID del destino" value={form.destination} onChange={e => setForm(p => ({ ...p, destination: e.target.value }))} />
                  </div>
                  <div className="form-modal-group" style={{ minWidth: '140px' }}>
                    <label>Estado</label>
                    <select className="form-modal-select" value={form.published} onChange={e => setForm(p => ({ ...p, published: e.target.value === 'true' }))}>
                      <option value="true">Publicado</option>
                      <option value="false">Borrador</option>
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
              <p><span className={`post-type-badge ${detail.type}`}>{typeLabels[detail.type]}</span></p>
              <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{detail.content}</p>
              <div className="modal-details-card" style={{ marginTop: '16px' }}>
                <div className="detail-row"><span className="detail-label">Fecha:</span><span className="detail-value">{new Date(detail.date).toLocaleDateString('es-ES')}</span></div>
                <div className="detail-row"><span className="detail-label">Estado:</span><span className="detail-value">{detail.published ? 'Publicado' : 'Borrador'}</span></div>
                {detail.destination && <div className="detail-row"><span className="detail-label">Destino ID:</span><span className="detail-value">{detail.destination}</span></div>}
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
