import { useState, useEffect } from 'react'
import { geoService } from '../services/geo'

const CATEGORIES = [
  { value: 'Alojamiento Turístico', label: 'Alojamiento Turístico', icon: '🏨' },
  { value: 'Gastronomía Regional', label: 'Gastronomía Regional', icon: '🍽️' },
  { value: 'Agencia de Viajes', label: 'Agencia de Viajes', icon: '✈️' },
  { value: 'Transporte Turístico', label: 'Transporte Turístico', icon: '🚌' },
  { value: 'Guía de Turismo', label: 'Guía de Turismo', icon: '🧭' },
]

const SERVICES = [
  { value: 'wifi', label: 'Wi-Fi gratuito' },
  { value: 'parking', label: 'Estacionamiento' },
  { value: 'ac', label: 'Aire acondicionado' },
  { value: 'breakfast', label: 'Desayuno incluido' },
  { value: 'pets', label: 'Acepta mascotas' },
  { value: 'disabled', label: 'Acceso discapacitados' },
  { value: 'pool', label: 'Piscina' },
  { value: 'restaurant', label: 'Restaurante' },
]

const DAYS = [
  { value: 'lun', label: 'Lunes' },
  { value: 'mar', label: 'Martes' },
  { value: 'mie', label: 'Miércoles' },
  { value: 'jue', label: 'Jueves' },
  { value: 'vie', label: 'Viernes' },
  { value: 'sab', label: 'Sábado' },
  { value: 'dom', label: 'Domingo' },
]

const INITIAL_DATA = {
  name: '', category: '', rif: '', description: '', email: '', phone: '',
  openTime: '08:00', closeTime: '17:00', openDays: ['lun', 'mar', 'mie', 'jue', 'vie'],
  address: '', coordinates: '', branches: 1, capacity: 0, services: [],
  regionId: '', estadoId: '', municipioId: '',
  mainPhoto: null, gallery: [], logo: null, documents: [],
}

export default function ValidationWizard({ isOpen, onClose, onSubmit, regionId: ctxRegionId, regionName = 'Visión Nacional' }) {
  const [step, setStep] = useState(1)
  const [data, setData] = useState({ ...INITIAL_DATA })
  const [errors, setErrors] = useState({})
  const [regions, setRegions] = useState([])
  const [estados, setEstados] = useState([])
  const [municipios, setMunicipios] = useState([])

  useEffect(() => {
    if (!isOpen) return
    const regionParam = ctxRegionId ? { regionId: ctxRegionId } : {}
    Promise.all([
      geoService.getRegiones(),
      geoService.getEstados(regionParam),
      geoService.getMunicipios(),
    ]).then(([regRes, estRes, munRes]) => {
      setRegions(regRes.data || regRes || [])
      setEstados(estRes.data || estRes || [])
      setMunicipios(munRes.data || munRes || [])
    }).catch(() => {})
  }, [isOpen, ctxRegionId])

  if (!isOpen) return null

  const set = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setData(prev => ({ ...prev, [field]: val }))
    setErrors(prev => ({ ...prev, [field]: '' }))
  }

  const handleCheckGroup = (field, value) => (e) => {
    const checked = e.target.checked
    setData(prev => ({
      ...prev,
      [field]: checked ? [...prev[field], value] : prev[field].filter(v => v !== value)
    }))
  }

  const handleFile = (field, multiple = false) => (e) => {
    const files = Array.from(e.target.files)
    const readers = files.map(file => new Promise(resolve => {
      const reader = new FileReader()
      reader.onload = () => resolve({ name: file.name, url: reader.result, size: file.size })
      reader.readAsDataURL(file)
    }))
    Promise.all(readers).then(results => {
      setData(prev => ({
        ...prev,
        [field]: multiple ? [...prev[field], ...results] : results[0]
      }))
    })
  }

  const removeFile = (field, index) => {
    setData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }))
  }

  const validateStep = () => {
    const errs = {}
    if (step === 1) {
      if (!data.name.trim()) errs.name = 'El nombre es obligatorio'
      if (!data.category) errs.category = 'Seleccione una categoría'
      if (!data.rif.trim()) errs.rif = 'El RIF es obligatorio'
      else if (!/^[JjVvEe]-?\d{6,9}-?\d$/.test(data.rif.trim()))
        errs.rif = 'Formato inválido (ej: J-12345678-9)'
    }
    if (step === 2) {
      if (!data.regionId) errs.regionId = 'Seleccione una región'
      if (!data.estadoId) errs.estadoId = 'Seleccione un estado'
      if (!data.municipioId) errs.municipioId = 'Seleccione un municipio'
      if (!data.address.trim()) errs.address = 'La dirección es obligatoria'
      if (data.branches < 1) errs.branches = 'Debe tener al menos 1 sede'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleNext = () => {
    if (validateStep()) setStep(s => Math.min(s + 1, 3))
  }

  const handlePrev = () => setStep(s => Math.max(s - 1, 1))

  const handleSubmit = () => {
    if (validateStep()) {
      onSubmit({
        ...data,
        id: Date.now(),
        date: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }),
        status: 'pendiente',
      })
      setData({ ...INITIAL_DATA })
      setStep(1)
      onClose()
    }
  }

  const handleClose = () => {
    setData({ ...INITIAL_DATA })
    setStep(1)
    setErrors({})
    onClose()
  }

  const filteredEstados = estados.filter(e => !data.regionId || e.ESTA_REGI === parseInt(data.regionId))
  const filteredMunicipios = municipios.filter(m => !data.estadoId || m.MUNI_EST === parseInt(data.estadoId))

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content wizard-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Registro de Prestador Turístico - {regionName}</h3>
          <button className="modal-close-btn" onClick={handleClose}>&times;</button>
        </div>

        <div className="wizard-stepper">
          <div className={`wizard-step-indicator ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`} onClick={() => step > 1 && setStep(1)}>
            <div className="wizard-step-circle">{step > 1 ? '✓' : '1'}</div>
            <div className="wizard-step-label">Información General</div>
          </div>
          <div className="wizard-connector" />
          <div className={`wizard-step-indicator ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`} onClick={() => step > 2 && setStep(2)}>
            <div className="wizard-step-circle">{step > 2 ? '✓' : '2'}</div>
            <div className="wizard-step-label">Ubicación y Detalle</div>
          </div>
          <div className="wizard-connector" />
          <div className={`wizard-step-indicator ${step >= 3 ? 'active' : ''}`}>
            <div className="wizard-step-circle">3</div>
            <div className="wizard-step-label">Multimedia</div>
          </div>
        </div>

        <div className="modal-body wizard-body">
          {step === 1 && (
            <div className="wizard-step-content">
              <h4 className="wizard-step-title">Información General</h4>
              <p className="wizard-step-desc">Datos básicos del prestador turístico.</p>

              <div className="wizard-form-grid two-col">
                <div className="form-modal-group">
                  <label>Nombre del Comercio *</label>
                  <input type="text" className={`form-modal-input ${errors.name ? 'input-error' : ''}`} placeholder="Ej. Posada La Montaña" value={data.name} onChange={set('name')} />
                  {errors.name && <span className="field-error">{errors.name}</span>}
                </div>
                <div className="form-modal-group">
                  <label>Categoría *</label>
                  <select className={`form-modal-select ${errors.category ? 'input-error' : ''}`} value={data.category} onChange={set('category')}>
                    <option value="">Seleccione...</option>
                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
                  </select>
                  {errors.category && <span className="field-error">{errors.category}</span>}
                </div>
              </div>

              <div className="wizard-form-grid two-col">
                <div className="form-modal-group">
                  <label>RIF *</label>
                  <input type="text" className={`form-modal-input ${errors.rif ? 'input-error' : ''}`} placeholder="J-12345678-9" value={data.rif} onChange={set('rif')} />
                  {errors.rif && <span className="field-error">{errors.rif}</span>}
                </div>
                <div className="form-modal-group">
                  <label>Teléfono de Contacto</label>
                  <input type="tel" className="form-modal-input" placeholder="+58 412-1234567" value={data.phone} onChange={set('phone')} />
                </div>
              </div>

              <div className="form-modal-group">
                <label>Correo Electrónico</label>
                <input type="email" className="form-modal-input" placeholder="contacto@establecimiento.com" value={data.email} onChange={set('email')} />
              </div>

              <div className="form-modal-group">
                <label>Descripción del Establecimiento</label>
                <textarea className="form-modal-textarea" rows={3} placeholder="Breve descripción de los servicios..." value={data.description} onChange={set('description')} />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="wizard-step-content">
              <h4 className="wizard-step-title">Ubicación y Detalle</h4>
              <p className="wizard-step-desc">Información geográfica y operativa.</p>

              <div className="form-section-title">Ubicación Geográfica</div>
              <div className="wizard-form-grid two-col">
                <div className="form-modal-group">
                  <label>Región *</label>
                  <select className={`form-modal-select ${errors.regionId ? 'input-error' : ''}`} value={data.regionId} onChange={e => setData(p => ({ ...p, regionId: e.target.value, estadoId: '', municipioId: '' }))}>
                    <option value="">Seleccione...</option>
                    {regions.map(r => <option key={r.REGI_COD} value={r.REGI_COD}>{r.REGI_NOM}</option>)}
                  </select>
                  {errors.regionId && <span className="field-error">{errors.regionId}</span>}
                </div>
                <div className="form-modal-group">
                  <label>Estado *</label>
                  <select className={`form-modal-select ${errors.estadoId ? 'input-error' : ''}`} value={data.estadoId} onChange={e => setData(p => ({ ...p, estadoId: e.target.value, municipioId: '' }))}>
                    <option value="">Seleccione...</option>
                    {filteredEstados.map(e => <option key={e.ESTA_COD} value={e.ESTA_COD}>{e.ESTA_NOM}</option>)}
                  </select>
                  {errors.estadoId && <span className="field-error">{errors.estadoId}</span>}
                </div>
              </div>
              <div className="wizard-form-grid two-col">
                <div className="form-modal-group">
                  <label>Municipio *</label>
                  <select className={`form-modal-select ${errors.municipioId ? 'input-error' : ''}`} value={data.municipioId} onChange={set('municipioId')}>
                    <option value="">Seleccione...</option>
                    {filteredMunicipios.map(m => <option key={m.MUNI_COD} value={m.MUNI_COD}>{m.MUNI_NOM}</option>)}
                  </select>
                  {errors.municipioId && <span className="field-error">{errors.municipioId}</span>}
                </div>
                <div className="form-modal-group">
                  <label>Dirección *</label>
                  <input type="text" className={`form-modal-input ${errors.address ? 'input-error' : ''}`} placeholder="Calle, Nro, Sector" value={data.address} onChange={set('address')} />
                  {errors.address && <span className="field-error">{errors.address}</span>}
                </div>
              </div>

              <div className="form-modal-group">
                <label>Coordenadas (Google Maps)</label>
                <input type="text" className="form-modal-input" placeholder="7.7713° N, 72.2212° O" value={data.coordinates} onChange={set('coordinates')} />
              </div>

              <div className="form-section-title">Horarios</div>
              <div className="wizard-form-grid two-col">
                <div className="form-modal-group">
                  <label>Hora de Apertura</label>
                  <input type="time" className="form-modal-input" value={data.openTime} onChange={set('openTime')} />
                </div>
                <div className="form-modal-group">
                  <label>Hora de Cierre</label>
                  <input type="time" className="form-modal-input" value={data.closeTime} onChange={set('closeTime')} />
                </div>
              </div>

              <div className="form-modal-group">
                <label>Días de Atención</label>
                <div className="checkbox-grid">
                  {DAYS.map(d => (
                    <label key={d.value} className="checkbox-item">
                      <input type="checkbox" checked={data.openDays.includes(d.value)} onChange={handleCheckGroup('openDays', d.value)} />
                      <span>{d.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="wizard-form-grid two-col">
                <div className="form-modal-group">
                  <label>Número de Sedes *</label>
                  <input type="number" className={`form-modal-input ${errors.branches ? 'input-error' : ''}`} min={1} value={data.branches} onChange={set('branches')} />
                  {errors.branches && <span className="field-error">{errors.branches}</span>}
                </div>
                <div className="form-modal-group">
                  <label>Capacidad Máxima (personas)</label>
                  <input type="number" className="form-modal-input" min={0} placeholder="0 = No aplica" value={data.capacity} onChange={set('capacity')} />
                </div>
              </div>

              <div className="form-modal-group">
                <label>Servicios Ofrecidos</label>
                <div className="checkbox-grid">
                  {SERVICES.map(s => (
                    <label key={s.value} className="checkbox-item">
                      <input type="checkbox" checked={data.services.includes(s.value)} onChange={handleCheckGroup('services', s.value)} />
                      <span>{s.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="wizard-step-content">
              <h4 className="wizard-step-title">Multimedia <span style={{ fontWeight: 400, fontSize: 13, color: 'var(--color-text-light)' }}>(opcional)</span></h4>
              <p className="wizard-step-desc">Fotografías, logo y documentos del establecimiento. Puede omitir este paso y guardar el registro.</p>

              <div className="upload-section">
                <label className="upload-label">Foto Principal</label>
                <div className="upload-dropzone" onClick={() => document.getElementById('mainPhotoInput').click()}>
                  {data.mainPhoto ? (
                    <div className="upload-preview">
                      <img src={data.mainPhoto.url} alt="Principal" />
                      <button type="button" className="upload-remove" onClick={(e) => { e.stopPropagation(); setData(prev => ({ ...prev, mainPhoto: null })) }}>&times;</button>
                    </div>
                  ) : (
                    <div className="upload-placeholder">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                      <span>Haga clic para subir la foto principal</span>
                    </div>
                  )}
                  <input id="mainPhotoInput" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile('mainPhoto')} />
                </div>
              </div>

              <div className="upload-section">
                <label className="upload-label">Logo del Comercio</label>
                <div className="upload-dropzone small" onClick={() => document.getElementById('logoInput').click()}>
                  {data.logo ? (
                    <div className="upload-preview">
                      <img src={data.logo.url} alt="Logo" />
                      <button type="button" className="upload-remove" onClick={(e) => { e.stopPropagation(); setData(prev => ({ ...prev, logo: null })) }}>&times;</button>
                    </div>
                  ) : (
                    <div className="upload-placeholder">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                      <span>Logo</span>
                    </div>
                  )}
                  <input id="logoInput" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile('logo')} />
                </div>
              </div>

              <div className="upload-section">
                <label className="upload-label">Galería de Fotos (máx 5)</label>
                <div className="upload-gallery">
                  {data.gallery.map((file, i) => (
                    <div key={i} className="upload-preview">
                      <img src={file.url} alt={`Galería ${i + 1}`} />
                      <button type="button" className="upload-remove" onClick={() => removeFile('gallery', i)}>&times;</button>
                    </div>
                  ))}
                  {data.gallery.length < 5 && (
                    <div className="upload-dropzone gallery-item" onClick={() => document.getElementById('galleryInput').click()}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    </div>
                  )}
                  <input id="galleryInput" type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleFile('gallery', true)} />
                </div>
              </div>

              <div className="upload-section">
                <label className="upload-label">Documentos Legales</label>
                <div className="document-list">
                  {data.documents.map((doc, i) => (
                    <div key={i} className="document-item">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                      <span className="document-name">{doc.name}</span>
                      <button type="button" className="upload-remove" onClick={() => removeFile('documents', i)}>&times;</button>
                    </div>
                  ))}
                  <button type="button" className="btn-upload-doc" onClick={() => document.getElementById('docInput').click()}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    Agregar Documento
                  </button>
                  <input id="docInput" type="file" accept=".pdf,.doc,.docx,.jpg,.png" multiple style={{ display: 'none' }} onChange={handleFile('documents', true)} />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer wizard-footer">
          {step > 1 && (
            <button className="btn-modal-action cancel" onClick={handlePrev}>← Anterior</button>
          )}
          <div style={{ flex: 1 }} />
          {step < 3 ? (
            <button className="btn-modal-action approve" onClick={handleNext}>Siguiente →</button>
          ) : (
            <button className="btn-modal-action approve" onClick={handleSubmit}>Guardar y Enviar</button>
          )}
        </div>
      </div>
    </div>
  )
}
