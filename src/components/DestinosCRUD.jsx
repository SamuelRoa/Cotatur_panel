import { useState, useEffect } from 'react'
import RegionOverviewCard from './RegionOverviewCard.jsx'
import { destinosService } from '../services/destinos'
import { geoService } from '../services/geo'

const tourismTypes = ['Ecoturismo', 'Sol y Playa', 'Aventura', 'Cultural', 'Gastronómico', 'Religioso']
const roadStatuses = ['Buena', 'Regular', 'Mala', 'En construcción']

export default function DestinosCRUD({ regionId = null, regionName = 'Visión Nacional' }) {
  const [destinos, setDestinos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ name: '', description: '', lat: '', lng: '', tourismType: 'Ecoturismo', roadStatus: 'Buena', municipioId: '', parish: '' })
  const [detail, setDetail] = useState(null)
  const [municipios, setMunicipios] = useState([])

  useEffect(() => {
    geoService.getMunicipios().then((res) => {
      const data = res.data || res
      setMunicipios(data || [])
    }).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = {}
    if (regionId) params.regionId = regionId
    destinosService.getAll(params)
      .then((res) => {
        setDestinos(res.destinos || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [regionId])

  const openForm = (destino = null) => {
    if (destino) {
      setEditing(destino.id)
      setForm({
        name: destino.name,
        description: destino.description || '',
        lat: String(destino.lat || ''),
        lng: String(destino.lng || ''),
        tourismType: destino.tourismType || 'Ecoturismo',
        roadStatus: destino.roadStatus || 'Buena',
        municipioId: destino.municipalityId || '',
        parish: '',
      })
    } else {
      setEditing(null)
      setForm({ name: '', description: '', lat: '', lng: '', tourismType: 'Ecoturismo', roadStatus: 'Buena', municipioId: '', parish: '' })
    }
    setShowForm(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.lat || !form.lng) return
    try {
      const payload = {
        nombre: form.name,
        descripcion: form.description,
        lat: parseFloat(form.lat),
        lon: parseFloat(form.lng),
        vialidad: form.roadStatus,
        tipoTurismoId: tourismTypes.indexOf(form.tourismType) + 1,
        municipioId: form.municipioId ? parseInt(form.municipioId) : undefined,
      }
      if (editing) {
        await destinosService.update(editing, payload)
      } else {
        await destinosService.create(payload)
      }
      const params = {}
      if (regionId) params.regionId = regionId
      const res = await destinosService.getAll(params)
      setDestinos(res.destinos || [])
      setShowForm(false)
      setEditing(null)
    } catch (err) {
      alert('Error al guardar: ' + err.message)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este destino turístico?')) return
    try {
      await destinosService.delete(id)
      setDestinos(prev => prev.filter(d => d.id !== id))
    } catch (err) {
      alert('Error al eliminar: ' + err.message)
    }
  }

  const filtered = destinos.filter(d =>
    !search ||
    (d.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (d.municipality || '').toLowerCase().includes(search.toLowerCase()) ||
    (d.tourismType || '').toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return <div className="module-container"><p className="module-subtitle">Cargando destinos...</p></div>
  }

  return (
    <div className="module-container">
      <div className="module-header">
        <div>
          <h3 className="module-title">Gestión de Destinos Georreferenciados</h3>
          <p className="module-subtitle">Registro y edición de atractivos turísticos - Contexto: {regionName}.</p>
        </div>
        <div className="module-header-actions">
          <input type="text" className="module-search" placeholder="Buscar destino..." value={search} onChange={e => setSearch(e.target.value)} />
          <button className="btn-module-primary" onClick={() => openForm()}>+ Nuevo Destino</button>
        </div>
      </div>

      <div className="destinos-grid">
        {filtered.length === 0 ? (
          <RegionOverviewCard moduleKey="destinos" regionId={regionId} regionName={regionName} />
        ) : (
          filtered.map(d => (
            <div key={d.id} className="destino-card" onClick={() => setDetail(d)}>
              <div className="destino-card-header">
                <span className={`road-badge ${(d.roadStatus || '').toLowerCase().replace(/\s+/g, '-')}`}>{d.roadStatus}</span>
                <span className="tourism-tag">{d.tourismType}</span>
              </div>
              <h4 className="destino-card-title">{d.name}</h4>
              <p className="destino-card-desc">{d.description}</p>
              <div className="destino-card-coords">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                {d.lat ? `${d.lat.toFixed(4)}, ${d.lng.toFixed(4)}` : 'Sin coordenadas'}
              </div>
              <div className="destino-card-footer">
                <span className="destino-municipio">{d.municipality || ''}</span>
                <div className="destino-card-actions">
                  <button className="btn-icon-sm" onClick={(e) => { e.stopPropagation(); openForm(d) }} title="Editar">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                  </button>
                  <button className="btn-icon-sm btn-icon-danger" onClick={(e) => { e.stopPropagation(); handleDelete(d.id) }} title="Eliminar">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content modal-form-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editing ? 'Editar Destino' : 'Nuevo Destino Turístico'}</h3>
              <button className="modal-close-btn" onClick={() => setShowForm(false)}>&times;</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-modal-group flex-1">
                    <label>Nombre del Destino *</label>
                    <input type="text" className="form-modal-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
                  </div>
                </div>
                <div className="form-modal-group">
                  <label>Descripción</label>
                  <textarea className="form-modal-textarea" rows="3" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
                </div>
                <div className="form-row">
                  <div className="form-modal-group flex-1">
                    <label>Latitud *</label>
                    <input type="number" step="any" className="form-modal-input" value={form.lat} onChange={e => setForm(p => ({ ...p, lat: e.target.value }))} required />
                  </div>
                  <div className="form-modal-group flex-1">
                    <label>Longitud *</label>
                    <input type="number" step="any" className="form-modal-input" value={form.lng} onChange={e => setForm(p => ({ ...p, lng: e.target.value }))} required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-modal-group flex-1">
                    <label>Tipo de Turismo</label>
                    <select className="form-modal-select" value={form.tourismType} onChange={e => setForm(p => ({ ...p, tourismType: e.target.value }))}>
                      {tourismTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="form-modal-group flex-1">
                    <label>Estado de la Vía</label>
                    <select className="form-modal-select" value={form.roadStatus} onChange={e => setForm(p => ({ ...p, roadStatus: e.target.value }))}>
                      {roadStatuses.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-modal-group flex-1">
                    <label>Municipio</label>
                    <select className="form-modal-select" value={form.municipioId} onChange={e => setForm(p => ({ ...p, municipioId: e.target.value }))}>
                      <option value="">Seleccione...</option>
                      {municipios.map(m => (
                        <option key={m.MUNI_COD || m.id} value={m.MUNI_COD || m.id}>{m.MUNI_NOM || m.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-modal-group flex-1">
                    <label>Parroquia</label>
                    <input type="text" className="form-modal-input" value={form.parish} onChange={e => setForm(p => ({ ...p, parish: e.target.value }))} />
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
              <h3 className="modal-title">{detail.name}</h3>
              <button className="modal-close-btn" onClick={() => setDetail(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="modal-details-card">
                <div className="detail-row"><span className="detail-label">Descripción:</span><span className="detail-value">{detail.description}</span></div>
                <div className="detail-row"><span className="detail-label">Coordenadas:</span><span className="detail-value">{detail.lat ? `${detail.lat}, ${detail.lng}` : 'N/A'}</span></div>
                <div className="detail-row"><span className="detail-label">Tipo Turismo:</span><span className="detail-value">{detail.tourismType}</span></div>
                <div className="detail-row"><span className="detail-label">Vía:</span><span className="detail-value"><span className={`road-badge ${(detail.roadStatus || '').toLowerCase().replace(/\s+/g, '-')}`}>{detail.roadStatus}</span></span></div>
                <div className="detail-row"><span className="detail-label">Municipio:</span><span className="detail-value">{detail.municipality}</span></div>
                {detail.parish && <div className="detail-row"><span className="detail-label">Parroquia:</span><span className="detail-value">{detail.parish}</span></div>}
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
