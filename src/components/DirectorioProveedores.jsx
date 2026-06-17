import { useState, useEffect } from 'react'
import RegionOverviewCard from './RegionOverviewCard.jsx'
import { prestadoresService } from '../services/prestadores'
import { geoService } from '../services/geo'

export default function DirectorioProveedores({ regionId = null, regionName = 'Visión Nacional' }) {
  const [providers, setProviders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('Todas')
  const [filterRegion, setFilterRegion] = useState(regionId || '')
  const [detail, setDetail] = useState(null)
  const [regions, setRegions] = useState([])

  useEffect(() => {
    geoService.getRegiones().then((res) => {
      setRegions(res.data || res || [])
    }).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = {}
    const rId = filterRegion || regionId
    if (rId) params.regionId = rId
    prestadoresService.getAll(params)
      .then((res) => {
        setProviders(res.prestadores || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [regionId, filterRegion])

  const categories = [...new Set(providers.map(p => p.category).filter(Boolean))]
  const safeFilterCat = filterCat !== 'Todas' && !categories.includes(filterCat) ? 'Todas' : filterCat

  const filtered = providers.filter(p => {
    const matchSearch = !search ||
      (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.rif || '').includes(search)
    const matchCat = safeFilterCat === 'Todas' || p.category === safeFilterCat
    return matchSearch && matchCat
  })

  const grouped = categories.reduce((acc, cat) => {
    const items = filtered.filter(p => p.category === cat)
    if (items.length) acc[cat] = items
    return acc
  }, {})

  const getRegionName = (rId) => regions.find(r => r.REGI_COD === rId)?.REGI_NOM || ''

  if (loading) {
    return <div className="module-container"><p className="module-subtitle">Cargando proveedores...</p></div>
  }

  return (
    <div className="module-container">
      <div className="module-header">
        <div>
          <h3 className="module-title">Directorio de Proveedores</h3>
          <p className="module-subtitle">Comercios registrados - Contexto: {regionName}.</p>
        </div>
        <div className="module-header-actions">
          <input type="text" className="module-search" placeholder="Buscar por nombre o RIF..." value={search} onChange={e => setSearch(e.target.value)} />
          <select className="module-filter-select" value={safeFilterCat} onChange={e => setFilterCat(e.target.value)}>
            <option value="Todas">Todas las categorías</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="module-filter-select" value={filterRegion} onChange={e => setFilterRegion(e.target.value)}>
            <option value="">Todas las regiones</option>
            {regions.map(r => <option key={r.REGI_COD} value={r.REGI_COD}>{r.REGI_NOM}</option>)}
          </select>
        </div>
      </div>

      <div className="module-stats-row">
        <div className="stat-chip">Total: <strong>{filtered.length}</strong> proveedores</div>
        {categories.map(c => (
          <div key={c} className="stat-chip">{c}: <strong>{providers.filter(p => p.category === c).length}</strong></div>
        ))}
      </div>

      {Object.keys(grouped).length === 0 ? (
        <RegionOverviewCard moduleKey="proveedores" regionId={regionId} regionName={regionName} />
      ) : (
        Object.entries(grouped).map(([category, items]) => (
          <div key={category} className="providers-category-section">
            <h4 className="providers-category-title">{category}</h4>
            <div className="providers-grid">
              {items.map(p => (
                <div key={p.id} className="card-modern" onClick={() => setDetail(p)}>
                  <div className="card-header">
                    <div className="card-tags">
                      <span className={`tag-status-${p.status}`}>{p.status === 'validado' ? 'APROBADO' : p.status?.toUpperCase() || 'PENDIENTE'}</span>
                    </div>
                    {p.regionId && <span className="card-region-badge">{getRegionName(p.regionId)}</span>}
                  </div>
                  <div className="card-provider-icon">
                    {category.includes('Alojamiento') ? '🏨' : category.includes('Gastronomía') ? '🍽️' : category.includes('Agencia') ? '✈️' : category.includes('Transporte') ? '🚌' : '🥾'}
                  </div>
                  <h4 className="card-title">{p.name}</h4>
                  <div className="card-meta">
                    <span className="card-meta-item">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M1 4h22M1 10h22M1 16h22" /></svg>
                      {p.rif || '—'}
                    </span>
                    <span className="card-meta-item">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                      {p.phone || '—'}
                    </span>
                    <span className="card-meta-item">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                      {p.estado || '—'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
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
                <div className="detail-row"><span className="detail-label">Categoría:</span><span className="detail-value">{detail.category}</span></div>
                <div className="detail-row"><span className="detail-label">RIF:</span><span className="detail-value" style={{ fontFamily: 'monospace' }}>{detail.rif}</span></div>
                <div className="detail-row"><span className="detail-label">Teléfono:</span><span className="detail-value">{detail.phone}</span></div>
                <div className="detail-row"><span className="detail-label">Email:</span><span className="detail-value">{detail.email}</span></div>
                <div className="detail-row"><span className="detail-label">Dirección:</span><span className="detail-value">{detail.address}</span></div>
                <div className="detail-row"><span className="detail-label">Estado:</span><span className="detail-value">{detail.estado || '—'}</span></div>
                <div className="detail-row"><span className="detail-label">Región:</span><span className="detail-value">{getRegionName(detail.regionId)}</span></div>
                <div className="detail-row"><span className="detail-label">Status:</span><span className="detail-value"><span className={`badge-status ${detail.status}`}>{detail.status === 'validado' ? 'APROBADO' : detail.status?.toUpperCase() || 'PENDIENTE'}</span></span></div>
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
