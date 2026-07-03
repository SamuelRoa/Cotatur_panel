import { useState, useEffect } from 'react'
import { prestadoresService } from '../services/prestadores'
import { geoService } from '../services/geo'
import mockData from '../services/mockData.js'

export default function DirectorioProveedores({ regionId = null, regionName = 'Visión Nacional' }) {
  const [providers, setProviders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('Todas')
  const [filterRegion, setFilterRegion] = useState(regionId || '')
  const [detail, setDetail] = useState(null)
  const [regions, setRegions] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  useEffect(() => {
    geoService.getRegiones().then((res) => {
      setRegions(res.data || res || [])
    }).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = { page, limit: 10 }
    const rId = filterRegion || regionId
    if (rId) params.regionId = rId
    if (search) params.search = search
    if (filterCat !== 'Todas') params.category = filterCat
    prestadoresService.getAll(params)
      .then((res) => {
        const data = res.prestadores || []
        setProviders(data)
        setTotalItems(res.meta?.total ?? data.length)
        setTotalPages(Math.max(1, Math.ceil((res.meta?.total ?? data.length) / 10)))
        if (data.length === 0) {
          const mock = mockData.buildPrestadores()
          const filtered = rId ? mock.filter(p => p.regionId === parseInt(rId) || p.regionId === rId) : mock
          setProviders(filtered)
          setTotalItems(filtered.length)
          setTotalPages(Math.max(1, Math.ceil(filtered.length / 10)))
        }
        setLoading(false)
      })
      .catch(() => {
        const mock = mockData.buildPrestadores()
        const filtered = rId ? mock.filter(p => p.regionId === parseInt(rId) || p.regionId === rId) : mock
        setProviders(filtered)
        setTotalItems(filtered.length)
        setTotalPages(Math.max(1, Math.ceil(filtered.length / 10)))
        setLoading(false)
      })
  }, [regionId, filterRegion, page, search, filterCat])

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
          <input type="text" className="module-search" placeholder="Buscar por nombre o RIF..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
          <select className="module-filter-select" value={filterCat} onChange={e => { setFilterCat(e.target.value); setPage(1) }}>
            <option value="Todas">Todas las categorías</option>
            <option value="Alojamiento Turístico">Alojamiento Turístico</option>
            <option value="Gastronomía Regional">Gastronomía Regional</option>
            <option value="Agencia de Viajes">Agencia de Viajes</option>
            <option value="Agencia de Turismo">Agencia de Turismo</option>
            <option value="Transporte Turístico">Transporte Turístico</option>
            <option value="Guía de Turismo">Guía de Turismo</option>
            <option value="Entretenimiento">Entretenimiento</option>
            <option value="Otros">Otros</option>
          </select>
          <select className="module-filter-select" value={filterRegion} onChange={e => { setFilterRegion(e.target.value); setPage(1) }}>
            <option value="">Todas las regiones</option>
            {regions.map(r => <option key={r.REGI_COD} value={r.REGI_COD}>{r.REGI_NOM}</option>)}
          </select>
        </div>
      </div>

      {providers.length === 0 ? (
        <div className="module-subtitle" style={{ textAlign: 'center', padding: '40px 0' }}>No se encontraron proveedores con los filtros actuales.</div>
      ) : (<>
        <div className="providers-grid">
          {providers.map(p => (
                <div key={p.id} className="card-modern" onClick={() => setDetail(p)}>
                  <div className="card-header">
                    <div className="card-tags">
                      <span className={`tag-status-${p.status}`}>{p.status === 'validado' ? 'APROBADO' : p.status?.toUpperCase() || 'PENDIENTE'}</span>
                    </div>
                    {p.regionId && <span className="card-region-badge">{getRegionName(p.regionId)}</span>}
                  </div>
                  <div className="card-provider-icon">
                    {p.category.includes('Alojamiento') ? '🏨' : p.category.includes('Gastronomía') ? '🍽️' : p.category.includes('Agencia') ? '✈️' : p.category.includes('Transporte') ? '🚌' : '🥾'}
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
        {totalPages > 1 && (
          <div className="table-pagination-footer">
            <span className="pagination-info">Página {page} de {totalPages} ({totalItems} proveedores)</span>
            <div className="pagination-controls">
              <button className="btn-page-arrow" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} title="Anterior"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg></button>
              {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map(p => (
                <button key={p} className={`btn-page-num ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
              ))}
              <button className="btn-page-arrow" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} title="Siguiente"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg></button>
            </div>
          </div>
        )}
      </>)}

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
