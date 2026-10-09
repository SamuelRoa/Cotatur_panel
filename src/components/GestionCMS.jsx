import { useState, useEffect } from 'react'
import { siteService } from '../services/site'

const SITE_FIELDS = [
  { key: 'hero_titulo', label: 'Título principal (hero)' },
  { key: 'hero_subtitulo', label: 'Subtítulo (hero)' },
  { key: 'hero_imagen', label: 'Imagen hero (URL)' },
  { key: 'footer_contacto', label: 'Contacto footer' },
  { key: 'footer_direccion', label: 'Dirección footer' },
  { key: 'seo_descripcion', label: 'SEO descripción' },
]

export default function GestionCMS() {
  const [tab, setTab] = useState('sitio')
  const [settings, setSettings] = useState({})
  const [regiones, setRegiones] = useState([])
  const [selectedRegion, setSelectedRegion] = useState('')
  const [regionForm, setRegionForm] = useState({ tagline: '', descripcion: '', historia: '', costumbres: '', clima: '', imagenUrl: '', color: '' })
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      siteService.getSite().catch(() => ({ settings: [] })),
      siteService.getRegionesCms().catch(() => ({ regiones: [] })),
    ]).then(([siteRes, regRes]) => {
      const map = {}
      ;(siteRes.settings || []).forEach((s) => { map[s.clave] = s.valor || '' })
      setSettings(map)
      setRegiones(regRes.regiones || [])
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    const reg = regiones.find((r) => String(r.id) === String(selectedRegion))
    if (reg?.cms) {
      setRegionForm({
        tagline: reg.cms.tagline || '',
        descripcion: reg.cms.descripcion || '',
        historia: reg.cms.historia || '',
        costumbres: reg.cms.costumbres || '',
        clima: reg.cms.clima || '',
        imagenUrl: reg.cms.imagenUrl || '',
        color: reg.cms.color || '',
      })
    } else {
      setRegionForm({ tagline: '', descripcion: '', historia: '', costumbres: '', clima: '', imagenUrl: '', color: '' })
    }
  }, [selectedRegion, regiones])

  const saveSiteField = async (clave) => {
    try {
      await siteService.upsert({ clave, valor: settings[clave] || '' })
      setMsg(`"${clave}" guardado.`)
    } catch (err) {
      setMsg('Error: ' + err.message)
    }
  }

  const saveRegion = async (e) => {
    e.preventDefault()
    if (!selectedRegion) { setMsg('Seleccione una región.'); return }
    try {
      await siteService.upsertRegion({ regionId: Number(selectedRegion), ...regionForm })
      setMsg('Contenido de región guardado.')
      const fresh = await siteService.getRegionesCms().catch(() => ({ regiones: [] }))
      setRegiones(fresh.regiones || [])
    } catch (err) {
      setMsg('Error: ' + err.message)
    }
  }

  if (loading) return <div className="module-container"><p className="module-subtitle">Cargando CMS...</p></div>

  return (
    <div className="module-container">
      <div className="module-header">
        <div>
          <h3 className="module-title">CMS del Website</h3>
          <p className="module-subtitle">Hero, footer, SEO y contenido editorial por región.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className={`btn-module-primary ${tab !== 'sitio' ? 'btn-module-secondary' : ''}`} onClick={() => setTab('sitio')}>Sitio</button>
          <button className={`btn-module-primary ${tab !== 'regiones' ? 'btn-module-secondary' : ''}`} onClick={() => setTab('regiones')}>Regiones</button>
        </div>
      </div>
      {msg && <p className="module-subtitle" style={{ marginBottom: 12 }}>{msg}</p>}

      {tab === 'sitio' && (
        <div style={{ display: 'grid', gap: 12, maxWidth: 720 }}>
          {SITE_FIELDS.map((f) => (
            <div key={f.key} className="form-modal-group">
              <label>{f.label} <small style={{ color: 'var(--color-text-light)' }}>({f.key})</small></label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  className="form-modal-input"
                  value={settings[f.key] || ''}
                  onChange={(e) => setSettings((p) => ({ ...p, [f.key]: e.target.value }))}
                  style={{ flex: 1 }}
                />
                <button className="btn-modal-action approve" onClick={() => saveSiteField(f.key)}>Guardar</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'regiones' && (
        <form onSubmit={saveRegion} style={{ display: 'grid', gap: 12, maxWidth: 720 }}>
          <div className="form-modal-group">
            <label>Región *</label>
            <select className="form-modal-select" value={selectedRegion} onChange={(e) => setSelectedRegion(e.target.value)}>
              <option value="">Seleccionar...</option>
              {regiones.map((r) => <option key={r.id} value={r.id}>{r.nombre}{r.cms ? ' — activo' : ''}</option>)}
            </select>
          </div>
          {['tagline', 'descripcion', 'historia', 'costumbres', 'clima', 'imagenUrl', 'color'].map((field) => (
            <div key={field} className="form-modal-group">
              <label style={{ textTransform: 'capitalize' }}>{field === 'imagenUrl' ? 'Imagen (URL)' : field}</label>
              {['descripcion', 'historia', 'costumbres'].includes(field) ? (
                <textarea className="form-modal-textarea" rows="3" value={regionForm[field]} onChange={(e) => setRegionForm((p) => ({ ...p, [field]: e.target.value }))} />
              ) : (
                <input type="text" className="form-modal-input" value={regionForm[field]} onChange={(e) => setRegionForm((p) => ({ ...p, [field]: e.target.value }))} />
              )}
            </div>
          ))}
          <div>
            <button type="submit" className="btn-modal-action approve">Guardar región</button>
          </div>
        </form>
      )}
    </div>
  )
}
