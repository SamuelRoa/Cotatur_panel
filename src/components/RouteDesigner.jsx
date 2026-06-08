import { useState } from 'react'
import RegionOverviewCard from './RegionOverviewCard.jsx'

const availableDestinations = [
  { id: 1, name: 'Parque Nacional El Ávila', lat: 10.537, lng: -66.871, type: 'Ecoturismo', region: 'central' },
  { id: 2, name: 'Playa El Agua', lat: 10.997, lng: -63.845, type: 'Sol y Playa', region: 'insular' },
  { id: 3, name: 'Salto Ángel', lat: 5.967, lng: -62.536, type: 'Aventura', region: 'amazonica' },
  { id: 4, name: 'Médanos de Coro', lat: 11.395, lng: -69.674, type: 'Ecoturismo', region: 'eje' },
  { id: 5, name: 'Pico Bolívar', lat: 8.549, lng: -71.047, type: 'Aventura', region: 'los_andes' },
  { id: 6, name: 'Plaza Bolívar de San Cristóbal', lat: 7.773, lng: -72.226, type: 'Cultural', region: 'los_andes' },
  { id: 7, name: 'Parque La Laguna', lat: 7.787, lng: -72.221, type: 'Ecoturismo', region: 'los_andes' },
  { id: 8, name: 'Playa Parguito', lat: 10.996, lng: -63.823, type: 'Sol y Playa', region: 'insular' },
  { id: 9, name: 'Laguna de La Restinga', lat: 10.982, lng: -64.161, type: 'Ecoturismo', region: 'insular' },
  { id: 10, name: 'Parque Nacional Morrocoy', lat: 10.855, lng: -68.273, type: 'Sol y Playa', region: 'eje' },
  { id: 11, name: 'Coro', lat: 11.405, lng: -69.667, type: 'Cultural', region: 'eje' },
  { id: 12, name: 'Colonia Tovar', lat: 10.406, lng: -67.281, type: 'Cultural', region: 'central' },
  { id: 13, name: 'Hato El Cedral', lat: 7.511, lng: -69.233, type: 'Ecoturismo', region: 'llanos' },
  { id: 14, name: 'Río Caribe', lat: 10.688, lng: -63.083, type: 'Sol y Playa', region: 'oriental' },
  { id: 15, name: 'Cumaná', lat: 10.461, lng: -64.172, type: 'Cultural', region: 'oriental' },
  { id: 16, name: 'Los Roques', lat: 11.851, lng: -66.76, type: 'Sol y Playa', region: 'central' },
  { id: 17, name: 'Tovar', lat: 8.316, lng: -71.754, type: 'Cultural', region: 'los_andes' },
  { id: 18, name: 'La Grita', lat: 8.133, lng: -71.974, type: 'Religioso', region: 'los_andes' },
  { id: 19, name: 'Santa Elena de Uairén', lat: 4.601, lng: -61.119, type: 'Aventura', region: 'amazonica' },
  { id: 20, name: 'San Fernando de Apure', lat: 7.878, lng: -67.472, type: 'Cultural', region: 'llanos' },
]

const accommodations = [
  { id: 1, name: 'Posada La Montaña', category: 'Alojamiento Turístico', location: 'Mérida' },
  { id: 2, name: 'Hotel Venetur', category: 'Alojamiento Turístico', location: 'Caracas' },
  { id: 3, name: 'Posada Alemana', category: 'Alojamiento Turístico', location: 'Colonia Tovar' },
  { id: 4, name: 'Hesperia Margarita', category: 'Alojamiento Turístico', location: 'Isla de Margarita' },
  { id: 5, name: 'Hotel Tibisay', category: 'Alojamiento Turístico', location: 'San Cristóbal' },
  { id: 6, name: 'Posada Uairén', category: 'Alojamiento Turístico', location: 'Santa Elena de Uairén' },
  { id: 7, name: 'Campamento Canaima', category: 'Alojamiento Turístico', location: 'Canaima' },
  { id: 8, name: 'Hotel Venetur Maracaibo', category: 'Alojamiento Turístico', location: 'Maracaibo' },
  { id: 9, name: 'Hato El Cedral Lodge', category: 'Alojamiento Turístico', location: 'Apure' },
]

const eateries = [
  { id: 1, name: 'Sabores Tachirenses', category: 'Gastronomía Regional', location: 'San Cristóbal' },
  { id: 2, name: 'Restaurant El Criollo', category: 'Gastronomía Regional', location: 'Mérida' },
  { id: 3, name: 'La Casa del Arepa', category: 'Gastronomía Regional', location: 'Caracas' },
  { id: 4, name: 'El Pescador', category: 'Gastronomía Regional', location: 'Margarita' },
  { id: 5, name: 'Restaurant El Llanero', category: 'Gastronomía Regional', location: 'Apure' },
  { id: 6, name: 'Las Delicias del Lago', category: 'Gastronomía Regional', location: 'Maracaibo' },
  { id: 7, name: 'La Casa del Cacao', category: 'Gastronomía Regional', location: 'Cumaná' },
]

export default function RouteDesigner({ regionId = 'national', regionName = 'Visión Nacional' }) {
  const [routes, setRoutes] = useState([
    { id: 1, name: 'Ruta de los Andes', description: 'Recorrido por los paisajes andinos del Táchira y Mérida', destinations: [5, 6, 7, 17], accommodations: [1, 5], restaurants: [1, 2], duration: '4 días', distance: '180 km' },
    { id: 2, name: 'Ruta del Caribe Insular', description: 'Playas y sol en Margarita y Los Roques', destinations: [2, 8, 9], accommodations: [4], restaurants: [4], duration: '5 días', distance: '50 km' },
    { id: 3, name: 'Ruta de la Costa Occidental', description: 'Médanos, playas y lagunas en Falcón', destinations: [4, 10, 11], accommodations: [8], restaurants: [6], duration: '3 días', distance: '200 km' },
    { id: 4, name: 'Ruta Capitalina', description: 'Caracas, El Ávila, Colonia Tovar y Los Roques', destinations: [1, 12, 16], accommodations: [2, 3], restaurants: [3], duration: '4 días', distance: '150 km' },
    { id: 5, name: 'Ruta Amazónica', description: 'Canaima, Salto Ángel y la Gran Sabana', destinations: [3, 19], accommodations: [6, 7], restaurants: [], duration: '6 días', distance: '400 km' },
    { id: 6, name: 'Ruta de los Llanos', description: 'Hatoss y biodiversidad en los llanos apureños', destinations: [13, 20], accommodations: [9], restaurants: [5], duration: '3 días', distance: '250 km' },
    { id: 7, name: 'Ruta Oriental', description: 'Cumaná, Río Caribe y la Península de Paria', destinations: [14, 15], accommodations: [], restaurants: [7], duration: '3 días', distance: '180 km' },
    { id: 8, name: 'Ruta de la Fe', description: 'Peregrinación por los pueblos religiosos del Táchira', destinations: [6, 18], accommodations: [5], restaurants: [1], duration: '2 días', distance: '80 km' },
  ])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [detail, setDetail] = useState(null)
  const [form, setForm] = useState({ name: '', description: '', destinations: [], accommodations: [], restaurants: [], duration: '', distance: '' })

  const openForm = (route = null) => {
    if (route) {
      setEditing(route.id)
      setForm({ name: route.name, description: route.description, destinations: route.destinations, accommodations: route.accommodations, restaurants: route.restaurants, duration: route.duration, distance: route.distance })
    } else {
      setEditing(null)
      setForm({ name: '', description: '', destinations: [], accommodations: [], restaurants: [], duration: '', distance: '' })
    }
    setShowForm(true)
  }

  const handleSave = (e) => {
    e.preventDefault()
    if (!form.name.trim() || form.destinations.length === 0) return
    if (editing) {
      setRoutes(prev => prev.map(r => r.id === editing ? { ...r, ...form } : r))
    } else {
      setRoutes(prev => [{ id: Date.now(), ...form }, ...prev])
    }
    setShowForm(false)
    setEditing(null)
  }

  const handleDelete = (id) => {
    if (window.confirm('¿Eliminar esta ruta?'))
      setRoutes(prev => prev.filter(r => r.id !== id))
  }

  const toggleArrayItem = (arr, item) =>
    arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item]

  const getDestName = (id) => availableDestinations.find(d => d.id === id)?.name || 'Desconocido'
  const getAccName = (id) => accommodations.find(a => a.id === id)?.name || 'Desconocido'
  const getEatName = (id) => eateries.find(e => e.id === id)?.name || 'Desconocido'

  return (
    <div className="module-container">
      <div className="module-header">
        <div>
          <h3 className="module-title">Diseñador de Rutas</h3>
          <p className="module-subtitle">Construya rutas turísticas - Contexto: {regionName}.</p>
        </div>
        <div className="module-header-actions">
          <button className="btn-module-primary" onClick={() => openForm()}>+ Nueva Ruta</button>
        </div>
      </div>

      <div className="routes-list">
        {routes.length === 0 ? (
          <RegionOverviewCard moduleKey="rutas" regionId={regionId} regionName={regionName} />
        ) : (
          routes.filter(r => regionId === 'national' ? true : r.destinations.some(did => availableDestinations.find(d => d.id === did)?.region === regionId)).map(r => (
            <div key={r.id} className="route-card" onClick={() => setDetail(r)}>
              <div className="route-card-main">
                <h4 className="route-card-name">{r.name}</h4>
                <p className="route-card-desc">{r.description}</p>
                <div className="route-card-meta">
                  <span className="route-meta-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" /><circle cx="12" cy="10" r="3" /></svg>
                    {r.distance}
                  </span>
                  <span className="route-meta-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                    {r.duration}
                  </span>
                  <span className="route-meta-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M9 18l6-6-6-6" /></svg>
                    {r.destinations.length} destinos
                  </span>
                </div>
                <div className="route-destinations-preview">
                  {r.destinations.map(did => (
                    <span key={did} className="route-dest-tag">{getDestName(did)}</span>
                  ))}
                </div>
              </div>
              <div className="route-card-actions">
                <button className="btn-icon-sm" onClick={(e) => { e.stopPropagation(); openForm(r) }} title="Editar">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                </button>
                <button className="btn-icon-sm btn-icon-danger" onClick={(e) => { e.stopPropagation(); handleDelete(r.id) }} title="Eliminar">
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
              <h3 className="modal-title">{editing ? 'Editar Ruta' : 'Nueva Ruta Turística'}</h3>
              <button className="modal-close-btn" onClick={() => setShowForm(false)}>&times;</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-modal-group flex-1">
                    <label>Nombre de la Ruta *</label>
                    <input type="text" className="form-modal-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
                  </div>
                </div>
                <div className="form-modal-group">
                  <label>Descripción</label>
                  <textarea className="form-modal-textarea" rows="2" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
                </div>
                <div className="form-row">
                  <div className="form-modal-group flex-1">
                    <label>Duración</label>
                    <input type="text" className="form-modal-input" placeholder="Ej. 3 días" value={form.duration} onChange={e => setForm(p => ({ ...p, duration: e.target.value }))} />
                  </div>
                  <div className="form-modal-group flex-1">
                    <label>Distancia</label>
                    <input type="text" className="form-modal-input" placeholder="Ej. 120 km" value={form.distance} onChange={e => setForm(p => ({ ...p, distance: e.target.value }))} />
                  </div>
                </div>
                <div className="form-modal-group">
                  <label>Destinos incluidos</label>
                  <div className="checkbox-grid">
                    {(availableDestinations.filter(d => regionId === 'national' ? true : d.region === regionId)).map(d => (
                      <label key={d.id} className={`checkbox-chip ${form.destinations.includes(d.id) ? 'checked' : ''}`}>
                        <input type="checkbox" checked={form.destinations.includes(d.id)} onChange={() => setForm(p => ({ ...p, destinations: toggleArrayItem(p.destinations, d.id) }))} />
                        {d.name}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-modal-group flex-1">
                    <label>Hospedajes disponibles</label>
                    <div className="checkbox-grid">
                      {accommodations.map(a => (
                        <label key={a.id} className={`checkbox-chip ${form.accommodations.includes(a.id) ? 'checked' : ''}`}>
                          <input type="checkbox" checked={form.accommodations.includes(a.id)} onChange={() => setForm(p => ({ ...p, accommodations: toggleArrayItem(p.accommodations, a.id) }))} />
                          {a.name}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="form-modal-group flex-1">
                    <label>Restaurantes disponibles</label>
                    <div className="checkbox-grid">
                      {eateries.map(e => (
                        <label key={e.id} className={`checkbox-chip ${form.restaurants.includes(e.id) ? 'checked' : ''}`}>
                          <input type="checkbox" checked={form.restaurants.includes(e.id)} onChange={() => setForm(p => ({ ...p, restaurants: toggleArrayItem(p.restaurants, e.id) }))} />
                          {e.name}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="submit" className="btn-modal-action approve">{editing ? 'Actualizar' : 'Guardar Ruta'}</button>
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
                <div className="detail-row"><span className="detail-label">Duración:</span><span className="detail-value">{detail.duration}</span></div>
                <div className="detail-row"><span className="detail-label">Distancia:</span><span className="detail-value">{detail.distance}</span></div>
                <div className="detail-row"><span className="detail-label">Destinos:</span><span className="detail-value">{detail.destinations.map(id => getDestName(id)).join(', ')}</span></div>
                {detail.accommodations.length > 0 && <div className="detail-row"><span className="detail-label">Hospedajes:</span><span className="detail-value">{detail.accommodations.map(id => getAccName(id)).join(', ')}</span></div>}
                {detail.restaurants.length > 0 && <div className="detail-row"><span className="detail-label">Restaurantes:</span><span className="detail-value">{detail.restaurants.map(id => getEatName(id)).join(', ')}</span></div>}
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
