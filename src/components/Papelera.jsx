import { useCallback, useEffect, useState } from 'react'
import { useFeedback } from './feedbackContext.js'
import { destinosService } from '../services/destinos'
import { prestadoresService } from '../services/prestadores'
import { rutasService } from '../services/rutas'
import { eventosService } from '../services/eventos'
import { opinionesService } from '../services/opiniones'
import { contenidoService } from '../services/contenido'
import { usuariosService } from '../services/usuarios'

const formatFecha = (valor) => {
  if (!valor) return '—'
  const fecha = new Date(valor)
  if (Number.isNaN(fecha.getTime())) return '—'
  return new Intl.DateTimeFormat('es-VE', { dateStyle: 'medium', timeStyle: 'short' }).format(fecha)
}

const TABS = [
  {
    id: 'destinos',
    label: 'Destinos',
    load: async ({ page, limit }) => {
      const res = await destinosService.getPapelera({ page, limit })
      return { items: res.destinos || [], meta: res.meta }
    },
    restaurar: (id) => destinosService.restaurar(id),
    eliminar: (id) => destinosService.deletePermanente(id),
    titulo: (d) => d.name,
    detalle: (d) => [d.municipality, d.estado].filter(Boolean).join(', ') || 'Destino turístico',
  },
  {
    id: 'prestadores',
    label: 'Prestadores',
    load: async ({ page, limit }) => {
      const res = await prestadoresService.getPapelera({ page, limit })
      return { items: res.prestadores || [], meta: res.meta }
    },
    restaurar: (id) => prestadoresService.restaurar(id),
    eliminar: (id) => prestadoresService.deletePermanente(id),
    titulo: (p) => p.name,
    detalle: (p) => [p.category, p.rif].filter(Boolean).join(' · ') || 'Prestador turístico',
  },
  {
    id: 'rutas',
    label: 'Rutas',
    load: async ({ page, limit }) => {
      const res = await rutasService.getPapelera({ page, limit })
      return { items: res.rutas || [], meta: res.meta }
    },
    restaurar: (id) => rutasService.restaurar(id),
    eliminar: (id) => rutasService.deletePermanente(id),
    titulo: (r) => r.name,
    detalle: (r) => [r.distanceKm ? `${r.distanceKm} km` : null, r.durationHours ? `${r.durationHours} h` : null].filter(Boolean).join(' · ') || 'Ruta turística',
  },
  {
    id: 'eventos',
    label: 'Eventos',
    load: async ({ page, limit }) => {
      const res = await eventosService.getPapelera({ page, limit })
      return { items: res.eventos || [], meta: res.meta }
    },
    restaurar: (id) => eventosService.restaurar(id),
    eliminar: (id) => eventosService.deletePermanente(id),
    titulo: (e) => e.title,
    detalle: (e) => [e.destinoName, formatFecha(e.date)].filter(Boolean).join(' · ') || 'Evento',
  },
  {
    id: 'opiniones',
    label: 'Opiniones',
    load: async ({ page, limit }) => {
      const res = await opinionesService.getPapelera({ page, limit })
      return { items: res.opiniones || [], meta: res.meta }
    },
    restaurar: (id) => opinionesService.restaurar(id),
    eliminar: (id) => opinionesService.deletePermanente(id),
    titulo: (o) => `Opinión de ${o.usuarioName || 'usuario'}`,
    detalle: (o) => [o.destinoName, `${o.calificacion} estrellas`].filter(Boolean).join(' · '),
  },
  {
    id: 'contenido-institucional',
    label: 'Contenido institucional',
    load: async ({ page, limit }) => {
      const res = await contenidoService.getPapeleraInstitucional({ page, limit })
      return { items: res.contenidos || [], meta: res.meta }
    },
    restaurar: (id) => contenidoService.restaurarInstitucional(id),
    eliminar: (id) => contenidoService.deleteInstitucionalPermanente(id),
    titulo: (c) => c.titulo,
    detalle: (c) => [c.tipo, c.autorName].filter(Boolean).join(' · ') || 'Contenido institucional',
  },
  {
    id: 'contenido-turistico',
    label: 'Contenido turístico',
    load: async ({ page, limit }) => {
      const res = await contenidoService.getPapeleraTuristico({ page, limit })
      return { items: res.contenidos || [], meta: res.meta }
    },
    restaurar: (id) => contenidoService.restaurarTuristico(id),
    eliminar: (id) => contenidoService.deleteTuristicoPermanente(id),
    titulo: (c) => c.titulo,
    detalle: (c) => [c.tipo, c.destinoName].filter(Boolean).join(' · ') || 'Contenido turístico',
  },
  {
    id: 'usuarios',
    label: 'Usuarios',
    load: async ({ page, limit }) => {
      const res = await usuariosService.getPapelera({ page, limit })
      return { items: res.usuarios || [], meta: res.meta }
    },
    restaurar: (id) => usuariosService.restaurar(id),
    eliminar: (id) => usuariosService.deletePermanente(id),
    titulo: (u) => u.name,
    detalle: (u) => [u.email, u.roleName || 'Sin rol'].filter(Boolean).join(' · '),
  },
]

const LIMIT = 20

export default function Papelera({ regionName }) {
  const { toast, confirm } = useFeedback()
  const [activeTab, setActiveTab] = useState(TABS[0].id)
  const [items, setItems] = useState([])
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [busyId, setBusyId] = useState(null)

  const tab = TABS.find((t) => t.id === activeTab) || TABS[0]

  const cargar = useCallback(async () => {
    setLoading(true)
    try {
      const res = await tab.load({ page, limit: LIMIT })
      setItems(res.items)
      setMeta(res.meta || { total: res.items.length, page, totalPages: 1 })
    } catch (err) {
      setItems([])
      setMeta({ total: 0, page: 1, totalPages: 1 })
      toast.error('No se pudo cargar la papelera: ' + (err.message || 'error desconocido'))
    } finally {
      setLoading(false)
    }
  }, [tab, page, toast])

  useEffect(() => {
    Promise.resolve().then(cargar)
  }, [cargar])

  const cambiarTab = (id) => {
    setActiveTab(id)
    setPage(1)
  }

  const handleRestaurar = async (item) => {
    setBusyId(item.id)
    try {
      await tab.restaurar(item.id)
      toast.success(`«${tab.titulo(item)}» fue restaurado correctamente.`, { title: 'Registro restaurado' })
      await cargar()
    } catch (err) {
      toast.error('No se pudo restaurar el registro: ' + (err.message || 'error desconocido'))
    } finally {
      setBusyId(null)
    }
  }

  const handleEliminarPermanente = async (item) => {
    const ok = await confirm({
      title: 'Eliminar definitivamente',
      message: `«${tab.titulo(item)}» se eliminará de forma permanente de la base de datos. Esta acción no se puede deshacer.`,
      confirmText: 'Sí, eliminar',
      cancelText: 'Cancelar',
      tone: 'danger',
    })
    if (!ok) return

    setBusyId(item.id)
    try {
      await tab.eliminar(item.id)
      toast.success(`«${tab.titulo(item)}» fue eliminado definitivamente.`, { title: 'Registro eliminado' })
      if (items.length === 1 && page > 1) {
        setPage(page - 1)
      } else {
        await cargar()
      }
    } catch (err) {
      toast.error('No se pudo eliminar el registro: ' + (err.message || 'error desconocido'))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="module-container">
      <div className="module-header">
        <div>
          <h3 className="module-title">Papelera de registros</h3>
          <p className="module-subtitle">Restaura o elimina definitivamente los registros dados de baja - Contexto: {regionName}.</p>
        </div>
      </div>

      <div className="config-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`config-tab ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => cambiarTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="config-section">
        <div className="config-section-header">
          <p>{meta.total} registro{meta.total === 1 ? '' : 's'} en la papelera de {tab.label.toLowerCase()}</p>
        </div>

        {loading ? (
          <p className="module-subtitle">Cargando registros eliminados...</p>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48" style={{ opacity: 0.3, marginBottom: 12 }}>
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 600, color: 'var(--color-text-muted)' }}>Papelera vacía</h3>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-light)' }}>No hay registros eliminados en esta categoría.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th className="table-th">Registro</th>
                  <th className="table-th">Eliminado el</th>
                  <th className="table-th">Eliminado por</th>
                  <th className="table-th">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="table-td">
                      <div style={{ fontWeight: 600 }}>{tab.titulo(item)}</div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-light)' }}>{tab.detalle(item)}</div>
                    </td>
                    <td className="table-td">{formatFecha(item.deletedAt)}</td>
                    <td className="table-td">{item.deletedBy ? `Usuario #${item.deletedBy}` : '—'}</td>
                    <td className="table-td">
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button
                          className="btn-action-review"
                          onClick={() => handleRestaurar(item)}
                          disabled={busyId === item.id}
                        >
                          Restaurar
                        </button>
                        <button
                          className="btn-action-review"
                          style={{ borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}
                          onClick={() => handleEliminarPermanente(item)}
                          disabled={busyId === item.id}
                        >
                          Eliminar definitivamente
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {meta.totalPages > 1 && (
          <div className="table-pagination-footer">
            <span className="pagination-info">Página {meta.page} de {meta.totalPages} ({meta.total} registros)</span>
            <div className="pagination-controls">
              <button className="btn-page-arrow" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} title="Anterior">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
              </button>
              {Array.from({ length: Math.min(meta.totalPages, 10) }, (_, i) => i + 1).map((p) => (
                <button key={p} className={`btn-page-num ${p === meta.page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
              ))}
              <button className="btn-page-arrow" disabled={page >= meta.totalPages} onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))} title="Siguiente">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
