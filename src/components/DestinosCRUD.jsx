import { useState, useEffect, useCallback } from 'react'
import { destinosService } from '../services/destinos'
import { geoService } from '../services/geo'
import mockData from '../services/mockData.js'

const tourismTypes = ['Ecoturismo', 'Sol y Playa', 'Aventura', 'Cultural', 'Gastronómico', 'Religioso']
const roadStatuses = ['Buena', 'Regular', 'Mala', 'En construcción']

const emptyForm = () => ({ name: '', description: '', lat: '', lng: '', tourismType: 'Ecoturismo', roadStatus: 'Buena', regionId: '', estadoId: '', municipioId: '', parish: '' })

export default function DestinosCRUD({ regionId = null, regionName = 'Visión Nacional' }) {
  const [destinos, setDestinos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [search, setSearch] = useState('')
  const [filterRegion, setFilterRegion] = useState(regionId || '')
  const [form, setForm] = useState(emptyForm())
  const [detail, setDetail] = useState(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  const [regions, setRegions] = useState([])

  useEffect(() => {
    geoService.getRegiones().then((res) => {
      setRegions(res.data || res || [])
    }).catch(() => {})
  }, [])

  const loadDestinos = useCallback(() => {
    setLoading(true)
    const params = { page, limit: 10 }
    const rId = filterRegion || regionId
    if (rId) params.regionId = rId
    if (search) params.search = search
    destinosService.getAll(params)
      .then((res) => {
        const data = res.destinos || []
        setDestinos(data)
        setTotalItems(res.meta?.total ?? data.length)
        setTotalPages(Math.max(1, Math.ceil((res.meta?.total ?? data.length) / 10)))
        if (data.length === 0) {
          const mock = mockData.buildDestinos()
          const filtered = rId ? mock.filter(d => d.regionId === parseInt(rId) || d.regionId === rId) : mock
          setDestinos(filtered)
          setTotalItems(filtered.length)
          setTotalPages(Math.max(1, Math.ceil(filtered.length / 10)))
        }
        setLoading(false)
      })
      .catch(() => {
        const mock = mockData.buildDestinos()
        const filtered = rId ? mock.filter(d => d.regionId === parseInt(rId) || d.regionId === rId) : mock
        setDestinos(filtered)
        setTotalItems(filtered.length)
        setTotalPages(Math.max(1, Math.ceil(filtered.length / 10)))
        setLoading(false)
      })
  }, [regionId, filterRegion, page, search])

  useEffect(() => { loadDestinos() }, [loadDestinos])

  const [geoError, setGeoError] = useState('')

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
        regionId: String(destino.regionId || ''),
        estadoId: String(destino.estado || ''),
        municipioId: String(destino.municipalityId || ''),
        parish: '',
      })
    } else {
      setEditing(null)
      setForm(emptyForm())
    }
    setShowForm(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setGeoError('')
    if (!form.name.trim() || !form.lat || !form.lng) return
    const munId = parseInt(form.municipioId)
    if (!munId || munId < 1) {
      setGeoError('Debe ingresar un ID de municipio válido (1-4).')
      return
    }
    if (!form.regionId) {
      setGeoError('Seleccione una región.')
      return
    }
    try {
      const payload = {
        nombre: form.name,
        descripcion: form.description,
        lat: parseFloat(form.lat),
        lon: parseFloat(form.lng),
        vialidad: form.roadStatus,
        tipoTurismoId: tourismTypes.indexOf(form.tourismType) + 1,
        municipioId: munId,
      }
      if (editing) {
        await destinosService.update(editing, payload)
      } else {
        await destinosService.create(payload)
      }
      loadDestinos()
      setShowForm(false)
      setEditing(null)
      setGeoError('')
    } catch (err) {
      setGeoError(err.message)
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

  const getRegionName = (rId) => regions.find(r => r.REGI_COD === rId)?.REGI_NOM || ''

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
          <input type="text" className="module-search" placeholder="Buscar destino..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
          <select className="module-filter-select" value={filterRegion} onChange={e => { setFilterRegion(e.target.value); setPage(1) }}>
            <option value="">Todas las regiones</option>
            {regions.map(r => <option key={r.REGI_COD} value={r.REGI_COD}>{r.REGI_NOM}</option>)}
          </select>
          <button className="btn-module-primary" onClick={() => openForm()}>+ Nuevo Destino</button>
        </div>
      </div>

      <div className="destinos-grid">
        {destinos.length === 0 ? (
          <div className="module-subtitle" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 0' }}>No se encontraron destinos con los filtros actuales.</div>
        ) : (
          destinos.map(d => (
            <div key={d.id} className="card-modern" onClick={() => setDetail(d)}>
              <div className="card-header">
                <div className="card-tags">
                  <span className={`tag-road ${(d.roadStatus || '').toLowerCase().replace(/\s+/g, '-')}`}>{d.roadStatus}</span>
                  <span className="tag-type">{d.tourismType}</span>
                </div>
                <span className="card-region-badge">{getRegionName(d.regionId)}</span>
              </div>
              <h4 className="card-title">{d.name}</h4>
              <p className="card-desc">{d.description}</p>
              <div className="card-meta">
                <span className="card-meta-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                  {d.estado}, {d.municipality}
                </span>
                <span className="card-meta-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                  {d.lat ? `${d.lat.toFixed(4)}, ${d.lng.toFixed(4)}` : 'Sin coords'}
                </span>
              </div>
              <div className="card-actions">
                <button className="btn-icon-sm" onClick={(e) => { e.stopPropagation(); openForm(d) }} title="Editar">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                </button>
                <button className="btn-icon-sm btn-icon-danger" onClick={(e) => { e.stopPropagation(); handleDelete(d.id) }} title="Eliminar">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="table-pagination-footer">
          <span className="pagination-info">Página {page} de {totalPages} ({totalItems} destinos)</span>
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
                <div className="form-section-title">Ubicación Geográfica</div>
                <div className="form-row">
                  <div className="form-modal-group flex-1">
                    <label>Región <span className="required-star">*</span></label>
                    <select className="form-modal-select" value={form.regionId} onChange={e => setForm(p => ({ ...p, regionId: e.target.value }))}>
                      <option value="">Seleccione...</option>
                      {regions.map(r => <option key={r.REGI_COD} value={r.REGI_COD}>{r.REGI_NOM}</option>)}
                    </select>
                  </div>
                  <div className="form-modal-group flex-1">
                    <label>Estado</label>
                    <input type="text" className="form-modal-input" value={form.estadoId} onChange={e => setForm(p => ({ ...p, estadoId: e.target.value }))} placeholder="Ej: Táchira" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-modal-group flex-1">
                    <label>ID Municipio <span className="required-star">*</span></label>
                    <input type="number" min="1" max="4" className="form-modal-input" value={form.municipioId} onChange={e => setForm(p => ({ ...p, municipioId: e.target.value }))} placeholder="1=San Cristóbal, 2=San José, 3=Libertador, 4=Maneiro" />
                    <small style={{ color: '#888', fontSize: '11px', display: 'block', marginTop: 4 }}>IDs válidos: 1 (Táchira), 2 (Táchira), 3 (Mérida), 4 (Nueva Esparta)</small>
                  </div>
                  <div className="form-modal-group flex-1">
                    <label>Parroquia</label>
                    <input type="text" className="form-modal-input" value={form.parish} onChange={e => setForm(p => ({ ...p, parish: e.target.value }))} placeholder="Opcional" />
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
              <h3 className="modal-title">{detail.name}</h3>
              <button className="modal-close-btn" onClick={() => setDetail(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="modal-details-card">
                <div className="detail-row"><span className="detail-label">Descripción:</span><span className="detail-value">{detail.description}</span></div>
                <div className="detail-row"><span className="detail-label">Coordenadas:</span><span className="detail-value">{detail.lat ? `${detail.lat}, ${detail.lng}` : 'N/A'}</span></div>
                <div className="detail-row"><span className="detail-label">Tipo Turismo:</span><span className="detail-value">{detail.tourismType}</span></div>
                <div className="detail-row"><span className="detail-label">Vía:</span><span className="detail-value"><span className={`tag-road ${(detail.roadStatus || '').toLowerCase().replace(/\s+/g, '-')}`}>{detail.roadStatus}</span></span></div>
                <div className="detail-row"><span className="detail-label">Región:</span><span className="detail-value">{getRegionName(detail.regionId)}</span></div>
                <div className="detail-row"><span className="detail-label">Estado:</span><span className="detail-value">{detail.estado}</span></div>
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
