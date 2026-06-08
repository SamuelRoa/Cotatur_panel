import { useState } from 'react'
import RegionOverviewCard from './RegionOverviewCard.jsx'

const initialProviders = [
  { id: 1, name: 'Posada La Montaña', category: 'Alojamiento Turístico', rif: 'J-29384756-0', phone: '0276-3456789', email: 'contacto@posadamontana.com', address: 'Av. Principal, Mérida', status: 'validado', region: 'los_andes' },
  { id: 2, name: 'Sabores Tachirenses', category: 'Gastronomía Regional', rif: 'J-30112233-1', phone: '0276-5123456', email: 'info@saborestachira.com', address: 'Calle 5, San Cristóbal', status: 'validado', region: 'los_andes' },
  { id: 3, name: 'Rutas del Páramo', category: 'Agencia de Viajes', rif: 'J-45566778-9', phone: '0276-3987654', email: 'reservas@rutasdelparamo.com', address: 'Av. España, Mérida', status: 'validado', region: 'los_andes' },
  { id: 4, name: 'Hotel Venetur Mérida', category: 'Alojamiento Turístico', rif: 'J-40011223-3', phone: '0274-2523456', email: 'merida@venetur.com', address: 'Av. Los Próceres, Mérida', status: 'validado', region: 'los_andes' },
  { id: 5, name: 'Restaurant El Criollo', category: 'Gastronomía Regional', rif: 'J-31223344-5', phone: '0276-5678901', email: 'elcriollo@correo.com', address: 'Calle 10, San Cristóbal', status: 'validado', region: 'central' },
  { id: 6, name: 'Hotel Tibisay', category: 'Alojamiento Turístico', rif: 'J-40223344-6', phone: '0276-4567890', email: 'reservas@hoteltibisay.com', address: 'Av. Venezuela, San Cristóbal', status: 'validado', region: 'los_andes' },
  { id: 7, name: 'Hesperia Isla Margarita', category: 'Alojamiento Turístico', rif: 'J-40334455-7', phone: '0295-2611234', email: 'info@hesperiamargarita.com', address: 'Av. Bolívar, Porlamar', status: 'validado', region: 'insular' },
  { id: 8, name: 'Restaurant El Pescador', category: 'Gastronomía Regional', rif: 'J-40445566-8', phone: '0295-2625678', email: 'elpescador@correo.com', address: 'Calle Marina, Juan Griego', status: 'validado', region: 'insular' },
  { id: 9, name: 'Margarita Tours', category: 'Agencia de Viajes', rif: 'J-40556677-9', phone: '0295-2639012', email: 'info@margaritaturismo.com', address: 'Av. 4 de Mayo, Porlamar', status: 'validado', region: 'insular' },
  { id: 10, name: 'Hotel Venetur Maracaibo', category: 'Alojamiento Turístico', rif: 'J-40667788-0', phone: '0261-7890123', email: 'maracaibo@venetur.com', address: 'Av. El Milagro, Maracaibo', status: 'validado', region: 'eje' },
  { id: 11, name: 'Posada Alemana', category: 'Alojamiento Turístico', rif: 'J-40778899-1', phone: '0244-3456789', email: 'info@posadaalemana.com', address: 'Calle Principal, Colonia Tovar', status: 'validado', region: 'central' },
  { id: 12, name: 'Amazonas Adventures', category: 'Agencia de Viajes', rif: 'J-40889900-2', phone: '0248-5217890', email: 'info@amazonasadventures.com', address: 'Av. Orinoco, Puerto Ayacucho', status: 'validado', region: 'amazonica' },
  { id: 13, name: 'Hato El Cedral Lodge', category: 'Alojamiento Turístico', rif: 'J-40990011-3', phone: '0247-3419012', email: 'reservas@hatoelcedral.com', address: 'Vía El Cedral, Apure', status: 'validado', region: 'llanos' },
  { id: 14, name: 'Restaurant El Llanero', category: 'Gastronomía Regional', rif: 'J-41001122-4', phone: '0247-3423456', email: 'elllanero@correo.com', address: 'Calle Bolívar, San Fernando', status: 'validado', region: 'llanos' },
  { id: 15, name: 'Hotel Venetur Cumaná', category: 'Alojamiento Turístico', rif: 'J-41112233-5', phone: '0293-4315678', email: 'cumana@venetur.com', address: 'Av. Universidad, Cumaná', status: 'validado', region: 'oriental' },
]

const categories = ['Alojamiento Turístico', 'Gastronomía Regional', 'Agencia de Viajes', 'Transporte Turístico', 'Guías de Montaña']

export default function DirectorioProveedores({ regionId = 'national', regionName = 'Visión Nacional' }) {
  const [providers] = useState(initialProviders)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('Todas')
  const [detail, setDetail] = useState(null)

  const filtered = providers.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.rif.includes(search)
    const matchCat = filterCat === 'Todas' || p.category === filterCat
    const matchRegion = regionId === 'national' ? true : p.region === regionId
    return matchSearch && matchCat && matchRegion
  })

  const grouped = categories.reduce((acc, cat) => {
    const items = filtered.filter(p => p.category === cat)
    if (items.length) acc[cat] = items
    return acc
  }, {})

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
        <div className="stat-chip">Total: <strong>{providers.length}</strong> proveedores</div>
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
                  <span className="badge-status validado">APROBADO</span>
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
                <div className="detail-row"><span className="detail-label">Estado:</span><span className="detail-value"><span className="badge-status validado">APROBADO</span></span></div>
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
