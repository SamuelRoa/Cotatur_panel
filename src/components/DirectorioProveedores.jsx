import { useState, useEffect } from 'react'
import RegionOverviewCard from './RegionOverviewCard.jsx'
import { prestadoresService } from '../services/prestadores'

export default function DirectorioProveedores({ regionId = null, regionName = 'Visión Nacional' }) {
  const [providers, setProviders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('Todas')
  const [detail, setDetail] = useState(null)

  useEffect(() => {
    setLoading(true)
    const params = {}
    if (regionId) params.regionId = regionId
    prestadoresService.getAll(params)
      .then((res) => {
        setProviders(res.prestadores || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [regionId])

  const categories = [...new Set(providers.map(p => p.category).filter(Boolean))]
  if (filterCat !== 'Todas' && !categories.includes(filterCat)) {
    setFilterCat('Todas')
  }

  const filtered = providers.filter(p => {
    const matchSearch = !search ||
      (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.rif || '').includes(search)
    const matchCat = filterCat === 'Todas' || p.category === filterCat
    return matchSearch && matchCat
  })

  const grouped = categories.reduce((acc, cat) => {
    const items = filtered.filter(p => p.category === cat)
    if (items.length) acc[cat] = items
    return acc
  }, {})

  if (loading) {
    return <div className="module-container"><p className="module-subtitle">Cargando proveedores...</p></div>
  }

  return (
    <div className="module-container">
      <div className="module-header">
        <div>
          <h3 className="module-title">Directorio de Proveedores Aprobados</h3>
          <p className="module-subtitle">Comercios validados - Contexto: {regionName}.</p>
        </div>
        <div className="module-header-actions">
          <input type="text" className="module-search" placeholder="Buscar por nombre o RIF..." value={search} onChange={e => setSearch(e.target.value)} />
          <select className="module-filter-select" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
            <option value="Todas">Todas las categorías</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
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
                <div key={p.id} className="provider-card" onClick={() => setDetail(p)}>
                  <div className="provider-card-icon">
                    {category.includes('Alojamiento') ? '🏨' : category.includes('Gastronomía') ? '🍽️' : category.includes('Agencia') ? '✈️' : category.includes('Transporte') ? '🚌' : '🥾'}
                  </div>
                  <div className="provider-card-info">
                    <h5 className="provider-card-name">{p.name}</h5>
                    <span className="provider-card-rif">{p.rif}</span>
                    <span className="provider-card-phone">{p.phone}</span>
                  </div>
                  <span className={`badge-status ${p.status}`}>{p.status === 'validado' ? 'APROBADO' : p.status?.toUpperCase() || 'PENDIENTE'}</span>
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
                <div className="detail-row"><span className="detail-label">Estado:</span><span className="detail-value"><span className={`badge-status ${detail.status}`}>{detail.status === 'validado' ? 'APROBADO' : detail.status?.toUpperCase() || 'PENDIENTE'}</span></span></div>
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
