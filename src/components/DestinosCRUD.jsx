import { useState, useEffect, useCallback, useRef } from 'react'
import { destinosService } from '../services/destinos'
import { geoService } from '../services/geo'
import mockData from '../services/mockData.js'
import { useFeedback } from './feedbackContext.js'
import { normalizeGeoName } from '../lib/geoNames.js'
import { IconCheck } from './Icons.jsx'

const tourismTypes = ['Ecoturismo', 'Sol y Playa', 'Aventura', 'Cultural', 'Gastronómico', 'Religioso']
const roadStatuses = ['Buena', 'Regular', 'Mala']

const emptyForm = () => ({
  name: '',
  description: '',
  lat: '',
  lng: '',
  tourismType: 'Ecoturismo',
  roadStatus: 'Buena',
  regionId: '',
  estadoId: '',
  municipioId: '',
  parish: '',
  imagenUrl: '',
  destacado: false,
  orden: '0',
})

export default function DestinosCRUD({ regionId = null, regionName = 'Visión Nacional' }) {
  const { toast, confirm } = useFeedback()
  const loadErrorRef = useRef(false)
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

  // Wizard state
  const [step, setStep] = useState(1)
  const [errors, setErrors] = useState({})

  const [regions, setRegions] = useState([])
  const [estados, setEstados] = useState([])
  const [municipios, setMunicipios] = useState([])
  const [showNewMun, setShowNewMun] = useState(false)
  const [newMunName, setNewMunName] = useState('')
  const [newMunError, setNewMunError] = useState('')

  useEffect(() => {
    Promise.all([
      geoService.getRegiones(),
      geoService.getEstados(),
      geoService.getMunicipios(),
    ]).then(([regRes, estRes, munRes]) => {
      setRegions(regRes.data || regRes || [])
      setEstados(estRes.data || estRes || [])
      setMunicipios(munRes.data || munRes || [])
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
        loadErrorRef.current = false
        setLoading(false)
      })
      .catch(() => {
        if (!loadErrorRef.current) {
          loadErrorRef.current = true
          toast.error('No se pudo cargar la información desde el servidor. Verifica tu conexión e intenta de nuevo.', { title: 'Error de conexión' })
        }
        const mock = mockData.buildDestinos()
        const filtered = rId ? mock.filter(d => d.regionId === parseInt(rId) || d.regionId === rId) : mock
        setDestinos(filtered)
        setTotalItems(filtered.length)
        setTotalPages(Math.max(1, Math.ceil(filtered.length / 10)))
        setLoading(false)
      })
  }, [regionId, filterRegion, page, search, toast])

  useEffect(() => { loadDestinos() }, [loadDestinos])

  const openForm = (destino = null) => {
    setStep(1)
    setErrors({})
    setShowNewMun(false)
    setNewMunName('')
    setNewMunError('')
    if (destino) {
      const mun = municipios.find(m => m.MUNI_COD === Number(destino.municipalityId))
      setEditing(destino.id)
      setForm({
        name: destino.name,
        description: destino.description || '',
        lat: String(destino.lat || ''),
        lng: String(destino.lng || ''),
        tourismType: destino.tourismType || 'Ecoturismo',
        roadStatus: destino.roadStatus || 'Buena',
        regionId: String(destino.regionId || ''),
        estadoId: mun ? String(mun.MUNI_EST) : '',
        municipioId: String(destino.municipalityId || ''),
        parish: destino.address || '',
        imagenUrl: destino.imagenUrl || destino.image || '',
        destacado: !!destino.destacado,
        orden: String(destino.orden ?? 0),
      })
    } else {
      setEditing(null)
      setForm(emptyForm())
    }
    setShowForm(true)
  }

  const validateStep = (s) => {
    const errs = {}
    if (s === 1) {
      if (!form.name.trim()) errs.name = 'El nombre del destino es obligatorio.'
    }
    if (s === 2) {
      if (!form.regionId) errs.regionId = 'Seleccione una región.'
      if (!form.estadoId) errs.estadoId = 'Seleccione el estado.'
      if (!form.municipioId) errs.municipioId = 'Seleccione el municipio.'
      if (!form.lat || isNaN(parseFloat(form.lat))) errs.lat = 'Ingrese una latitud válida (ej. 7.7669).'
      if (!form.lng || isNaN(parseFloat(form.lng))) errs.lng = 'Ingrese una longitud válida (ej. -72.2250).'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(s => Math.min(s + 1, 3))
    }
  }

  const handlePrev = () => {
    setErrors({})
    setStep(s => Math.max(s - 1, 1))
  }

  const handleSave = async (e) => {
    if (e) e.preventDefault()
    if (!validateStep(1)) {
      setStep(1)
      toast.warning('Por favor completa el nombre del destino.')
      return
    }
    if (!validateStep(2)) {
      setStep(2)
      toast.warning('Por favor completa los datos de ubicación y coordenadas.')
      return
    }

    const munId = parseInt(form.municipioId)
    try {
      const payload = {
        nombre: form.name.trim(),
        descripcion: form.description?.trim() || undefined,
        lat: parseFloat(form.lat),
        lon: parseFloat(form.lng),
        vialidad: form.roadStatus,
        tipoTurismoId: tourismTypes.indexOf(form.tourismType) + 1,
        municipioId: munId,
        direccion: form.parish?.trim() || undefined,
        imagenUrl: form.imagenUrl?.trim() || undefined,
        destacado: !!form.destacado,
        orden: form.orden !== '' ? parseInt(form.orden) : undefined,
      }
      if (editing) {
        await destinosService.update(editing, payload)
      } else {
        await destinosService.create(payload)
      }
      toast.success(
        editing
          ? `El destino «${form.name}» fue actualizado correctamente.`
          : `El destino «${form.name}» fue creado correctamente.`,
        { title: editing ? 'Destino actualizado' : 'Destino creado' },
      )
      loadDestinos()
      setShowForm(false)
      setEditing(null)
    } catch (err) {
      const message = err.message || 'No se pudo guardar el destino. Intenta de nuevo.'
      toast.error(message)
    }
  }

  const handleDelete = async (destino) => {
    const ok = await confirm({
      title: 'Eliminar destino turístico',
      message: `¿Seguro que deseas enviar a la papelera el destino «${destino.name}»? Un administrador podrá restaurarlo.`,
      confirmText: 'Sí, eliminar',
      cancelText: 'Cancelar',
      tone: 'danger',
    })
    if (!ok) return
    try {
      await destinosService.delete(destino.id)
      setDestinos(prev => prev.filter(d => d.id !== destino.id))
      toast.success(`El destino «${destino.name}» fue enviado a la papelera.`, { title: 'Destino eliminado' })
    } catch (err) {
      toast.error('No se pudo eliminar el destino: ' + (err.message || 'error desconocido'))
    }
  }

  const getRegionName = (rId) => regions.find(r => r.REGI_COD === rId)?.REGI_NOM || ''

  const filteredEstados = estados.filter(e => !form.regionId || e.ESTA_REGI === parseInt(form.regionId))
  const filteredMunicipios = municipios.filter(m => !form.estadoId || m.MUNI_EST === parseInt(form.estadoId))

  const handleCreateMunicipio = async () => {
    const name = newMunName.replace(/\s+/g, ' ').trim()
    if (!form.estadoId) {
      toast.warning('Seleccione primero el estado para agregar un municipio.')
      return
    }
    if (name.length < 2) {
      setNewMunError('Escribe un nombre válido (mínimo 2 letras).')
      return
    }
    const norm = normalizeGeoName(name)
    const dup = municipios.find(m => m.MUNI_EST === parseInt(form.estadoId) && normalizeGeoName(m.MUNI_NOM) === norm)
    if (dup) {
      setNewMunError(`Ya existe «${dup.MUNI_NOM}» en este estado (no se permite repetir aunque cambien mayúsculas o acentos).`)
      return
    }
    try {
      const res = await geoService.createMunicipio({ nombre: name, estadoId: parseInt(form.estadoId) })
      const mun = res?.data || res
      setMunicipios(prev => [...prev, mun].sort((a, b) => a.MUNI_NOM.localeCompare(b.MUNI_NOM)))
      setForm(p => ({ ...p, municipioId: String(mun.MUNI_COD) }))
      setShowNewMun(false)
      setNewMunName('')
      setNewMunError('')
      toast.success(`El municipio «${mun.MUNI_NOM}» fue creado y seleccionado.`, { title: 'Municipio agregado' })
    } catch (err) {
      setNewMunError(err.message || 'No se pudo crear el municipio.')
    }
  }

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
          <div className="module-subtitle" style={{ textAlign: 'center', padding: '40px 0' }}>No se encontraron destinos turísticos con los filtros actuales.</div>
        ) : (
          destinos.map(d => (
            <div key={d.id} className="card-modern" onClick={() => setDetail(d)}>
              <div className="card-header">
                <div className="card-tags">
                  {d.destacado && <span className="tag-destacado">DESTACADO</span>}
                  {d.tourismType && <span className="tag-type">{d.tourismType}</span>}
                </div>
                <span className="card-region-badge">{d.estado ? d.estado : getRegionName(d.regionId)}</span>
              </div>
              <h4 className="card-title">{d.name}</h4>
              <p className="card-desc">{d.description}</p>
              <div className="card-meta">
                <span className="card-meta-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" /><circle cx="12" cy="10" r="3" /></svg>
                  {d.lat && d.lng ? `${Number(d.lat).toFixed(4)}, ${Number(d.lng).toFixed(4)}` : 'Sin GPS'}
                </span>
                <span className="card-meta-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
                  {d.roadStatus || 'Vía regular'}
                </span>
              </div>
              <div className="card-actions">
                <button className="btn-icon-sm" onClick={(e) => { e.stopPropagation(); openForm(d) }} title="Editar">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                </button>
                <button className="btn-icon-sm btn-icon-danger" onClick={(e) => { e.stopPropagation(); handleDelete(d) }} title="Eliminar">
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
          <div className="modal-content wizard-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editing ? 'Editar Destino Turístico' : 'Nuevo Destino Turístico'}</h3>
              <button className="modal-close-btn" onClick={() => setShowForm(false)}>&times;</button>
            </div>

            {/* Stepper Header */}
            <div className="wizard-stepper">
              <div
                className={`wizard-step-indicator ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}
                onClick={() => step > 1 && setStep(1)}
              >
                <div className="wizard-step-circle">{step > 1 ? <IconCheck size={15} /> : '1'}</div>
                <div className="wizard-step-label">Datos Generales</div>
              </div>
              <div className={`wizard-connector ${step > 1 ? 'completed' : ''}`} />
              <div
                className={`wizard-step-indicator ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}
                onClick={() => (step > 2 || validateStep(1)) && setStep(2)}
              >
                <div className="wizard-step-circle">{step > 2 ? <IconCheck size={15} /> : '2'}</div>
                <div className="wizard-step-label">Ubicación y GPS</div>
              </div>
              <div className={`wizard-connector ${step > 2 ? 'completed' : ''}`} />
              <div
                className={`wizard-step-indicator ${step >= 3 ? 'active' : ''}`}
                onClick={() => validateStep(1) && validateStep(2) && setStep(3)}
              >
                <div className="wizard-step-circle">3</div>
                <div className="wizard-step-label">Web / Opcional</div>
              </div>
            </div>

            <form onSubmit={handleSave}>
              <div className="modal-body wizard-body">
                {step === 1 && (
                  <div className="wizard-step-content">
                    <h4 className="wizard-step-title">Información del Atractivo</h4>
                    <p className="wizard-step-desc">Identificación y clasificación turística del destino.</p>

                    <div className="form-modal-group">
                      <label>Nombre del Destino <span className="required-star">*</span></label>
                      <input
                        type="text"
                        className={`form-modal-input ${errors.name ? 'input-error' : ''}`}
                        placeholder="Ej. Cascada El Vino, Médanos de Coro…"
                        value={form.name}
                        onChange={e => {
                          setForm(p => ({ ...p, name: e.target.value }))
                          setErrors(p => ({ ...p, name: '' }))
                        }}
                        autoFocus
                      />
                      {errors.name && <span className="field-error">{errors.name}</span>}
                    </div>

                    <div className="wizard-form-grid two-col">
                      <div className="form-modal-group">
                        <label>Tipo de Turismo <span className="required-star">*</span></label>
                        <select
                          className="form-modal-select"
                          value={form.tourismType}
                          onChange={e => setForm(p => ({ ...p, tourismType: e.target.value }))}
                        >
                          {tourismTypes.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>

                      <div className="form-modal-group">
                        <label>Estado de la Vía</label>
                        <select
                          className="form-modal-select"
                          value={form.roadStatus}
                          onChange={e => setForm(p => ({ ...p, roadStatus: e.target.value }))}
                        >
                          {roadStatuses.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="form-modal-group">
                      <label>Descripción del Atractivo <span style={{ fontWeight: 400, color: 'var(--color-text-light)' }}>(opcional)</span></label>
                      <textarea
                        className="form-modal-textarea"
                        rows="3"
                        placeholder="Breve reseña turística, atractivos naturales, actividades recomendadas…"
                        value={form.description}
                        onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                      />
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="wizard-step-content">
                    <h4 className="wizard-step-title">Ubicación Geográfica y Coordenadas</h4>
                    <p className="wizard-step-desc">Indica la localización para posicionar el destino en el mapa.</p>

                    <div className="wizard-form-grid two-col">
                      <div className="form-modal-group">
                        <label>Región <span className="required-star">*</span></label>
                        <select
                          className={`form-modal-select ${errors.regionId ? 'input-error' : ''}`}
                          value={form.regionId}
                          onChange={e => {
                            setForm(p => ({ ...p, regionId: e.target.value, estadoId: '', municipioId: '' }))
                            setErrors(p => ({ ...p, regionId: '' }))
                          }}
                        >
                          <option value="">Seleccione región…</option>
                          {regions.map(r => <option key={r.REGI_COD} value={r.REGI_COD}>{r.REGI_NOM}</option>)}
                        </select>
                        {errors.regionId && <span className="field-error">{errors.regionId}</span>}
                      </div>

                      <div className="form-modal-group">
                        <label>Estado <span className="required-star">*</span></label>
                        <select
                          className={`form-modal-select ${errors.estadoId ? 'input-error' : ''}`}
                          value={form.estadoId}
                          onChange={e => {
                            setForm(p => ({ ...p, estadoId: e.target.value, municipioId: '' }))
                            setErrors(p => ({ ...p, estadoId: '' }))
                          }}
                          disabled={!form.regionId}
                        >
                          <option value="">{form.regionId ? 'Seleccione estado…' : 'Primero elija región'}</option>
                          {filteredEstados.map(e => <option key={e.ESTA_COD} value={e.ESTA_COD}>{e.ESTA_NOM}</option>)}
                        </select>
                        {errors.estadoId && <span className="field-error">{errors.estadoId}</span>}
                      </div>
                    </div>

                    <div className="form-modal-group">
                      <label>Municipio <span className="required-star">*</span></label>
                      <select
                        className={`form-modal-select ${errors.municipioId ? 'input-error' : ''}`}
                        value={form.municipioId}
                        onChange={e => {
                          setForm(p => ({ ...p, municipioId: e.target.value }))
                          setErrors(p => ({ ...p, municipioId: '' }))
                        }}
                        disabled={!form.estadoId}
                      >
                        <option value="">{form.estadoId ? 'Seleccione municipio…' : 'Primero elija estado'}</option>
                        {filteredMunicipios.map(m => <option key={m.MUNI_COD} value={m.MUNI_COD}>{m.MUNI_NOM}</option>)}
                      </select>
                      {errors.municipioId && <span className="field-error">{errors.municipioId}</span>}

                      <button
                        type="button"
                        disabled={!form.estadoId}
                        onClick={() => { setShowNewMun(v => !v); setNewMunError(''); setNewMunName('') }}
                        style={{
                          background: 'none', border: 'none', padding: '4px 0', cursor: form.estadoId ? 'pointer' : 'not-allowed',
                          color: form.estadoId ? 'var(--color-primary)' : 'var(--color-text-light)',
                          fontSize: 12, fontWeight: 600, textAlign: 'left', marginTop: 4,
                        }}
                      >
                        {showNewMun ? '✕ Cancelar agregado' : '＋ ¿No encuentras el municipio? Agrégalo aquí'}
                      </button>

                      {showNewMun && (
                        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                          <input
                            type="text"
                            className="form-modal-input"
                            style={{ flex: 1 }}
                            value={newMunName}
                            onChange={e => { setNewMunName(e.target.value); setNewMunError('') }}
                            placeholder="Nombre del nuevo municipio"
                            autoFocus
                          />
                          <button type="button" className="btn-modal-action approve" onClick={handleCreateMunicipio}>Agregar</button>
                        </div>
                      )}
                      {newMunError && (
                        <span className="field-error" style={{ display: 'block', marginTop: 4 }}>{newMunError}</span>
                      )}
                    </div>

                    <div className="form-modal-group">
                      <label>Dirección / Parroquia <span style={{ fontWeight: 400, color: 'var(--color-text-light)' }}>(opcional)</span></label>
                      <input
                        type="text"
                        className="form-modal-input"
                        value={form.parish}
                        onChange={e => setForm(p => ({ ...p, parish: e.target.value }))}
                        placeholder="Ej. Parroquia San Pedro, Troncal 5…"
                      />
                    </div>

                    <div className="wizard-form-grid two-col">
                      <div className="form-modal-group">
                        <label>Latitud GPS <span className="required-star">*</span></label>
                        <input
                          type="number"
                          step="any"
                          className={`form-modal-input ${errors.lat ? 'input-error' : ''}`}
                          value={form.lat}
                          onChange={e => {
                            setForm(p => ({ ...p, lat: e.target.value }))
                            setErrors(p => ({ ...p, lat: '' }))
                          }}
                          placeholder="Ej. 7.7669"
                        />
                        {errors.lat && <span className="field-error">{errors.lat}</span>}
                      </div>

                      <div className="form-modal-group">
                        <label>Longitud GPS <span className="required-star">*</span></label>
                        <input
                          type="number"
                          step="any"
                          className={`form-modal-input ${errors.lng ? 'input-error' : ''}`}
                          value={form.lng}
                          onChange={e => {
                            setForm(p => ({ ...p, lng: e.target.value }))
                            setErrors(p => ({ ...p, lng: '' }))
                          }}
                          placeholder="Ej. -72.2250"
                        />
                        {errors.lng && <span className="field-error">{errors.lng}</span>}
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="wizard-step-content">
                    <h4 className="wizard-step-title">Presentación en el Portal Web</h4>
                    <p className="wizard-step-desc">Elementos visuales y orden de visualización para los turistas (opcionales).</p>

                    <div className="form-modal-group">
                      <label>URL de Imagen Representativa</label>
                      <input
                        type="url"
                        className="form-modal-input"
                        value={form.imagenUrl}
                        onChange={e => setForm(p => ({ ...p, imagenUrl: e.target.value }))}
                        placeholder="https://images.unsplash.com/... o /media/..."
                      />
                    </div>

                    {form.imagenUrl && (
                      <div style={{ marginBottom: 16, borderRadius: 12, overflow: 'hidden', maxHeight: 160, border: '1px solid var(--color-border-soft)' }}>
                        <img
                          src={form.imagenUrl}
                          alt="Vista previa"
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                          onError={(e) => { e.currentTarget.style.display = 'none' }}
                        />
                      </div>
                    )}

                    <div className="wizard-form-grid two-col">
                      <div className="form-modal-group">
                        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginTop: 10 }}>
                          <input
                            type="checkbox"
                            checked={!!form.destacado}
                            onChange={e => setForm(p => ({ ...p, destacado: e.target.checked }))}
                            style={{ width: 18, height: 18 }}
                          />
                          <span style={{ fontSize: 13, fontWeight: 600 }}>Destacado en el Inicio</span>
                        </label>
                        <small style={{ color: 'var(--color-text-light)', fontSize: 11, display: 'block', marginTop: 4 }}>
                          Aparecerá en los carruseles destacados del portal.
                        </small>
                      </div>

                      <div className="form-modal-group">
                        <label>Prioridad / Orden en Listas</label>
                        <input
                          type="number"
                          min="0"
                          className="form-modal-input"
                          value={form.orden}
                          onChange={e => setForm(p => ({ ...p, orden: e.target.value }))}
                        />
                        <small style={{ color: 'var(--color-text-light)', fontSize: 11 }}>
                          0 = Orden estándar por nombre.
                        </small>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer wizard-footer">
                {step > 1 && (
                  <button type="button" className="btn-modal-action cancel" onClick={handlePrev}>
                    ← Anterior
                  </button>
                )}
                {step < 3 ? (
                  <button type="button" className="btn-modal-action approve" onClick={handleNext}>
                    Siguiente →
                  </button>
                ) : (
                  <button type="submit" className="btn-modal-action approve">
                    {editing ? 'Actualizar Destino' : 'Guardar y Publicar'}
                  </button>
                )}
                <button type="button" className="btn-modal-action cancel" onClick={() => setShowForm(false)}>
                  Cancelar
                </button>
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
              {detail.imagenUrl && (
                <div style={{ marginBottom: 14, borderRadius: 10, overflow: 'hidden', maxHeight: 180 }}>
                  <img src={detail.imagenUrl} alt={detail.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
              <div className="modal-details-card">
                <div className="detail-row"><span className="detail-label">Tipo:</span><span className="detail-value">{detail.tourismType || 'Ecoturismo'}</span></div>
                <div className="detail-row"><span className="detail-label">Estado de la vía:</span><span className="detail-value">{detail.roadStatus || 'Buena'}</span></div>
                <div className="detail-row"><span className="detail-label">Región:</span><span className="detail-value">{detail.estado || getRegionName(detail.regionId) || '—'}</span></div>
                <div className="detail-row"><span className="detail-label">Municipio:</span><span className="detail-value">{detail.municipio || '—'}</span></div>
                <div className="detail-row"><span className="detail-label">Coordenadas:</span><span className="detail-value">{detail.lat && detail.lng ? `${detail.lat}, ${detail.lng}` : '—'}</span></div>
                <div className="detail-row"><span className="detail-label">Descripción:</span><span className="detail-value">{detail.description || '—'}</span></div>
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
