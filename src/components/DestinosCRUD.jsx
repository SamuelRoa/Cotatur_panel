import { useState } from 'react'
import RegionOverviewCard from './RegionOverviewCard.jsx'

const initialDestinos = [
  { id: 1, name: 'Parque Nacional El Ávila', description: 'Imponente macizo montañoso con biodiversidad única y senderos ecológicos.', lat: 10.537, lng: -66.871, tourismType: 'Ecoturismo', roadStatus: 'Buena', municipality: 'Libertador', parish: 'Caracas', region: 'central' },
  { id: 2, name: 'Playa El Agua', description: 'Una de las playas más emblemáticas del oriente venezolano con aguas cristalinas.', lat: 10.997, lng: -63.845, tourismType: 'Sol y Playa', roadStatus: 'Buena', municipality: 'Maneiro', parish: 'Pampatar', region: 'insular' },
  { id: 3, name: 'Salto Ángel', description: 'La cascada más alta del mundo, patrimonio natural de la humanidad.', lat: 5.967, lng: -62.536, tourismType: 'Aventura', roadStatus: 'Regular', municipality: 'Gran Sabana', parish: 'Santa Elena de Uairén', region: 'amazonica' },
  { id: 4, name: 'Médanos de Coro', description: 'Formaciones arenosas únicas en el istmo de Paraguaná.', lat: 11.395, lng: -69.674, tourismType: 'Ecoturismo', roadStatus: 'Buena', municipality: 'Miranda', parish: 'Coro', region: 'eje' },
  { id: 5, name: 'Pico Bolívar', description: 'La montaña más alta de Venezuela, ideal para andinismo.', lat: 8.549, lng: -71.047, tourismType: 'Aventura', roadStatus: 'Regular', municipality: 'Mérida', parish: 'Mucuchíes', region: 'los_andes' },
  { id: 6, name: 'Playa Parguito', description: 'Playas de oleaje fuerte ideal para surfistas y deportes acuáticos.', lat: 10.996, lng: -63.823, tourismType: 'Sol y Playa', roadStatus: 'Buena', municipality: 'Mariño', parish: 'Parguito', region: 'insular' },
  { id: 7, name: 'Laguna de La Restinga', description: 'Laberinto de manglares con paseos en peñero y avistamiento de aves.', lat: 10.982, lng: -64.161, tourismType: 'Ecoturismo', roadStatus: 'Buena', municipality: 'Tubores', parish: 'La Restinga', region: 'insular' },
  { id: 8, name: 'Parque Nacional Morrocoy', description: 'Cayos de aguas cristalinas y arrecifes de coral en el Golfo Triste.', lat: 10.855, lng: -68.273, tourismType: 'Sol y Playa', roadStatus: 'Buena', municipality: 'Tucacas', parish: 'Tucacas', region: 'eje' },
  { id: 9, name: 'Coro', description: 'Ciudad colonial Patrimonio de la Humanidad con arquitectura de tierra.', lat: 11.405, lng: -69.667, tourismType: 'Cultural', roadStatus: 'Buena', municipality: 'Miranda', parish: 'Coro', region: 'eje' },
  { id: 10, name: 'Colonia Tovar', description: 'Pueblo alemán en la montaña venezolana con gastronomía típica.', lat: 10.406, lng: -67.281, tourismType: 'Cultural', roadStatus: 'Buena', municipality: 'Tovar', parish: 'Colonia Tovar', region: 'central' },
  { id: 11, name: 'Los Roques', description: 'Archipiélago de aguas turquesas, el mejor destino de buceo del Caribe.', lat: 11.851, lng: -66.76, tourismType: 'Sol y Playa', roadStatus: 'Buena', municipality: 'Dependencias Federales', parish: 'Los Roques', region: 'central' },
  { id: 12, name: 'Plaza Bolívar de San Cristóbal', description: 'Corazón de la ciudad andina, rodeada de arquitectura colonial.', lat: 7.773, lng: -72.226, tourismType: 'Cultural', roadStatus: 'Buena', municipality: 'San Cristóbal', parish: 'La Concordia', region: 'los_andes' },
  { id: 13, name: 'Parque La Laguna', description: 'Parque urbano con laguna artificial ideal para paseos familiares.', lat: 7.787, lng: -72.221, tourismType: 'Ecoturismo', roadStatus: 'Buena', municipality: 'San Cristóbal', parish: 'San Sebastián', region: 'los_andes' },
  { id: 14, name: 'Tovar', description: 'Pueblo colonial de los altos andinos con calles empedradas y clima fresco.', lat: 8.316, lng: -71.754, tourismType: 'Cultural', roadStatus: 'Buena', municipality: 'Tovar', parish: 'Tovar', region: 'los_andes' },
  { id: 15, name: 'La Grita', description: 'Centro religioso de peregrinación con el Santuario del Santo Cristo.', lat: 8.133, lng: -71.974, tourismType: 'Religioso', roadStatus: 'Regular', municipality: 'Jáuregui', parish: 'La Grita', region: 'los_andes' },
  { id: 16, name: 'Hato El Cedral', description: 'Reserva privada con safari de fauna llanera y turismo de hatos.', lat: 7.511, lng: -69.233, tourismType: 'Ecoturismo', roadStatus: 'Regular', municipality: 'San Fernando', parish: 'El Cedral', region: 'llanos' },
  { id: 17, name: 'San Fernando de Apure', description: 'Capital llanera, puerta de entrada a los hatos del sur.', lat: 7.878, lng: -67.472, tourismType: 'Cultural', roadStatus: 'Buena', municipality: 'San Fernando', parish: 'San Fernando', region: 'llanos' },
  { id: 18, name: 'Santa Elena de Uairén', description: 'Puerta de entrada a la Gran Sabana y el Monte Roraima.', lat: 4.601, lng: -61.119, tourismType: 'Aventura', roadStatus: 'Regular', municipality: 'Gran Sabana', parish: 'Santa Elena', region: 'amazonica' },
  { id: 19, name: 'Río Caribe', description: 'Pueblo pesquero de colores caribeños con playas vírgenes.', lat: 10.688, lng: -63.083, tourismType: 'Sol y Playa', roadStatus: 'Buena', municipality: 'Arismendi', parish: 'Río Caribe', region: 'oriental' },
  { id: 20, name: 'Cumaná', description: 'Ciudad más antigua de Venezuela continental, con fuerte histórico.', lat: 10.461, lng: -64.172, tourismType: 'Cultural', roadStatus: 'Buena', municipality: 'Sucre', parish: 'Cumaná', region: 'oriental' },
]

const tourismTypes = ['Ecoturismo', 'Sol y Playa', 'Aventura', 'Cultural', 'Gastronómico', 'Religioso']
const roadStatuses = ['Buena', 'Regular', 'Mala', 'En construcción']
const municipalities = ['Libertador', 'Maneiro', 'Gran Sabana', 'Miranda', 'Mérida', 'San Cristóbal', 'Jáuregui', 'Tovar', 'Colón', 'Ayacucho']

export default function DestinosCRUD({ regionId = 'national', regionName = 'Visión Nacional' }) {
  const [destinos, setDestinos] = useState(initialDestinos)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ name: '', description: '', lat: '', lng: '', tourismType: 'Ecoturismo', roadStatus: 'Buena', municipality: 'San Cristóbal', parish: '' })
  const [detail, setDetail] = useState(null)

  const openForm = (destino = null) => {
    if (destino) {
      setEditing(destino.id)
      setForm({ name: destino.name, description: destino.description, lat: String(destino.lat), lng: String(destino.lng), tourismType: destino.tourismType, roadStatus: destino.roadStatus, municipality: destino.municipality, parish: destino.parish })
    } else {
      setEditing(null)
      setForm({ name: '', description: '', lat: '', lng: '', tourismType: 'Ecoturismo', roadStatus: 'Buena', municipality: 'San Cristóbal', parish: '' })
    }
    setShowForm(true)
  }

  const handleSave = (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.lat || !form.lng) return
    const parsed = { ...form, lat: parseFloat(form.lat), lng: parseFloat(form.lng) }
    if (editing) {
      setDestinos(prev => prev.map(d => d.id === editing ? { ...d, ...parsed } : d))
    } else {
      setDestinos(prev => [{ id: Date.now(), ...parsed }, ...prev])
    }
    setShowForm(false)
    setEditing(null)
  }

  const handleDelete = (id) => {
    if (window.confirm('¿Eliminar este destino turístico?'))
      setDestinos(prev => prev.filter(d => d.id !== id))
  }

  const filtered = destinos.filter(d =>
    (d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.municipality.toLowerCase().includes(search.toLowerCase()) ||
    d.tourismType.toLowerCase().includes(search.toLowerCase())) &&
    (regionId === 'national' ? true : d.region === regionId)
  )

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
                <span className={`road-badge ${d.roadStatus.toLowerCase().replace(/\s+/g, '-')}`}>{d.roadStatus}</span>
                <span className="tourism-tag">{d.tourismType}</span>
              </div>
              <h4 className="destino-card-title">{d.name}</h4>
              <p className="destino-card-desc">{d.description}</p>
              <div className="destino-card-coords">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                {d.lat.toFixed(4)}, {d.lng.toFixed(4)}
              </div>
              <div className="destino-card-footer">
                <span className="destino-municipio">{d.municipality}</span>
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
                    <select className="form-modal-select" value={form.municipality} onChange={e => setForm(p => ({ ...p, municipality: e.target.value }))}>
                      {municipalities.map(m => <option key={m} value={m}>{m}</option>)}
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
                <div className="detail-row"><span className="detail-label">Coordenadas:</span><span className="detail-value">{detail.lat}, {detail.lng}</span></div>
                <div className="detail-row"><span className="detail-label">Tipo Turismo:</span><span className="detail-value">{detail.tourismType}</span></div>
                <div className="detail-row"><span className="detail-label">Vía:</span><span className="detail-value"><span className={`road-badge ${detail.roadStatus.toLowerCase().replace(/\s+/g, '-')}`}>{detail.roadStatus}</span></span></div>
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
