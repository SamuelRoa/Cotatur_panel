import { useState, useEffect } from 'react'
import RegionOverviewCard from './RegionOverviewCard.jsx'
import { contenidoService } from '../services/contenido'

const typeLabels = { noticia: 'Noticia', comunicado: 'Comunicado', ficha: 'Ficha de Destino' }

export default function CentroDifusion({ regionId = null, regionName = 'Visión Nacional' }) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [detail, setDetail] = useState(null)
  const [filterType, setFilterType] = useState('todas')
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ titulo: '', contenido: '', tipo: 'noticia', published: true })

  useEffect(() => {
    setLoading(true)
    contenidoService.getInstitucional()
      .then((res) => {
        setPosts(res.contenidos || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const openForm = (post = null) => {
    if (post) {
      setEditing(post.id)
      setForm({ titulo: post.titulo, contenido: post.descripcion || '', tipo: post.tipo || 'noticia', published: true })
    } else {
      setEditing(null)
      setForm({ titulo: '', contenido: '', tipo: 'noticia', published: true })
    }
    setShowForm(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.titulo.trim() || !form.contenido.trim()) return
    try {
      const payload = { titulo: form.titulo, descripcion: form.contenido, tipo: form.tipo }
      if (editing) {
        await contenidoService.updateInstitucional(editing, payload)
      } else {
        await contenidoService.createInstitucional(payload)
      }
      const res = await contenidoService.getInstitucional()
      setPosts(res.contenidos || [])
      setShowForm(false)
      setEditing(null)
    } catch (err) {
      alert('Error al guardar: ' + err.message)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta publicación?')) return
    try {
      await contenidoService.deleteInstitucional(id)
      setPosts(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      alert('Error al eliminar: ' + err.message)
    }
  }

  const filtered = posts.filter(p => {
    const matchType = filterType === 'todas' || p.tipo === filterType
    const matchSearch = !search ||
      (p.titulo || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.descripcion || '').toLowerCase().includes(search.toLowerCase())
    return matchType && matchSearch
  })

  if (loading) {
    return <div className="module-container"><p className="module-subtitle">Cargando contenido...</p></div>
  }

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
            <div key={p.id} className="post-card" onClick={() => setDetail(p)}>
              <div className="post-card-left">
                <span className={`post-type-badge ${p.tipo}`}>{typeLabels[p.tipo] || p.tipo}</span>
                <div className="post-card-info">
                  <h4 className="post-card-title">{p.titulo}</h4>
                  <p className="post-card-excerpt">{(p.descripcion || '').slice(0, 120)}...</p>
                  <span className="post-card-date">{p.fecha ? new Date(p.fecha).toLocaleDateString('es-ES') : ''}</span>
                </div>
              </div>
              <div className="post-card-actions">
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
                    <input type="text" className="form-modal-input" value={form.titulo} onChange={e => setForm(p => ({ ...p, titulo: e.target.value }))} required />
                  </div>
                  <div className="form-modal-group" style={{ minWidth: '140px' }}>
                    <label>Tipo</label>
                    <select className="form-modal-select" value={form.tipo} onChange={e => setForm(p => ({ ...p, tipo: e.target.value }))}>
                      <option value="noticia">Noticia</option>
                      <option value="comunicado">Comunicado</option>
                      <option value="ficha">Ficha de Destino</option>
                    </select>
                  </div>
                </div>
                <div className="form-modal-group">
                  <label>Contenido *</label>
                  <textarea className="form-modal-textarea" rows="5" value={form.contenido} onChange={e => setForm(p => ({ ...p, contenido: e.target.value }))} required />
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
              <h3 className="modal-title">{detail.titulo}</h3>
              <button className="modal-close-btn" onClick={() => setDetail(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <p><span className={`post-type-badge ${detail.tipo}`}>{typeLabels[detail.tipo] || detail.tipo}</span></p>
              <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{detail.descripcion}</p>
              <div className="modal-details-card" style={{ marginTop: '16px' }}>
                <div className="detail-row"><span className="detail-label">Fecha:</span><span className="detail-value">{detail.fecha ? new Date(detail.fecha).toLocaleDateString('es-ES') : ''}</span></div>
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
