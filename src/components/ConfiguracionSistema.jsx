import { useState, useEffect, useRef } from 'react'
import { usuariosService } from '../services/usuarios'
import { geoService } from '../services/geo'
import { RoleIcon } from './Icons.jsx'
import { useFeedback } from './feedbackContext.js'

export default function ConfiguracionSistema({ regionId = null, regionName = 'Visión Nacional', currentUser = null }) {
  const { toast } = useFeedback()
  const loadErrorRef = useRef(false)
  // Roles que solo el administrador nacional puede otorgar.
  const esSuperadmin = currentUser?.rol === 'Administrador' || currentUser?.rolId === 55
  const esAdminEstadal = currentUser?.rol === 'Admin Estadal' || currentUser?.rolId === 61
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [municipios, setMunicipios] = useState([])
  const [estados, setEstados] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeConfigTab, setActiveConfigTab] = useState('usuarios')
  const [showUserForm, setShowUserForm] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [userForm, setUserForm] = useState({ fullName: '', email: '', roleId: '', password: '', status: 'activo', estadoId: '' })
  const [userFormError, setUserFormError] = useState('')
  const [userPage, setUserPage] = useState(1)
  const [userTotalPages, setUserTotalPages] = useState(1)
  const [userTotalItems, setUserTotalItems] = useState(0)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      usuariosService.getAll({ page: userPage, limit: 10 }),
      usuariosService.getRoles().then(r => r.data || r),
      geoService.getMunicipios().then(r => r.data || r),
      geoService.getEstados().then(r => r.data || r).catch(() => []),
    ])
      .then(([usersRes, rolesRes, munRes, estRes]) => {
        // Listas vacías = sin resultados reales. Nunca se pintan datos ficticios.
        const usersData = usersRes.usuarios || []
        setUsers(usersData)
        setUserTotalItems(usersRes.meta?.total ?? usersData.length)
        setUserTotalPages(Math.max(1, Math.ceil((usersRes.meta?.total ?? usersData.length) / 10)))
        const rolesData = Array.isArray(rolesRes) ? rolesRes : rolesRes.roles || []
        const munData = Array.isArray(munRes) ? munRes : munRes.municipios || []
        setRoles(rolesData)
        setMunicipios(munData)
        setEstados(Array.isArray(estRes) ? estRes : estRes?.estados || [])
        loadErrorRef.current = false
        setLoading(false)
      })
      .catch(() => {
        if (!loadErrorRef.current) {
          loadErrorRef.current = true
          toast.error('No se pudo cargar la información desde el servidor. Verifica tu conexión e intenta de nuevo.', { title: 'Error de conexión' })
        }
        setUsers([])
        setUserTotalItems(0)
        setUserTotalPages(1)
        setRoles([])
        setMunicipios([])
        setEstados([])
        setLoading(false)
      })
  }, [userPage])

  const openUserForm = (u = null) => {
    setUserFormError('')
    if (u) {
      setEditingUser(u.id)
      setUserForm({ fullName: u.name || '', email: u.email || '', roleId: u.roleId ?? '', password: '', status: u.active ? 'activo' : 'inactivo', estadoId: u.estadoId != null ? String(u.estadoId) : '' })
    } else {
      setEditingUser(null)
      setUserForm({ fullName: '', email: '', roleId: '', password: '', status: 'activo', estadoId: esAdminEstadal && currentUser?.estadoId ? String(currentUser.estadoId) : '' })
    }
    setShowUserForm(true)
  }

  // Roles disponibles para elegir: solo el administrador nacional puede
  // otorgar "Administrador" y "Admin Estadal".
  const rolesVisibles = esSuperadmin
    ? roles
    : roles.filter(r => !['Administrador', 'Admin Estadal'].includes(r.ROLE_NOM || r.name))

  const handleSaveUser = async (e) => {
    e.preventDefault()
    setUserFormError('')
    const warn = (message) => { setUserFormError(message); toast.warning(message) }
    if (!userForm.fullName.trim()) { warn('El nombre completo es obligatorio.'); return }
    if (!userForm.email.trim()) { warn('El correo electrónico es obligatorio.'); return }
    if (!userForm.roleId) { warn('Seleccione un rol para el usuario.'); return }
    if (!userForm.password && !editingUser) { warn('La contraseña es obligatoria.'); return }
    if (userForm.password && userForm.password.length < 8) { warn('La contraseña debe tener al menos 8 caracteres.'); return }
    const nombreRolSeleccionado = (roles.find(r => String(r.ROLE_COD ?? r.id) === String(userForm.roleId))?.ROLE_NOM) || ''
    if (nombreRolSeleccionado === 'Admin Estadal' && !userForm.estadoId) {
      warn('Un «Admin Estadal» debe tener un estado asignado.')
      return
    }
    try {
      const payload = {
        nombre: userForm.fullName.trim(),
        email: userForm.email.trim().toLowerCase(),
        rolId: Number(userForm.roleId),
        activo: userForm.status === 'activo',
        // Estado al que pertenece el usuario (vacío = nacional).
        estadoId: userForm.estadoId ? Number(userForm.estadoId) : null,
      }
      if (userForm.password) payload.password = userForm.password
      if (editingUser) {
        await usuariosService.update(editingUser, payload)
      } else {
        await usuariosService.create(payload)
      }
      toast.success(
        editingUser
          ? `El usuario «${userForm.fullName}» fue actualizado correctamente.`
          : `El usuario «${userForm.fullName}» fue creado correctamente.`,
        { title: editingUser ? 'Usuario actualizado' : 'Usuario creado' },
      )
      const res = await usuariosService.getAll({ page: userPage, limit: 10 })
      setUsers(res.usuarios || [])
      setShowUserForm(false)
      setEditingUser(null)
    } catch (err) {
      const message = err.message || 'No se pudo guardar el usuario. Intente de nuevo.'
      setUserFormError(message)
      toast.error(message)
    }
  }

  const toggleUserStatus = async (id) => {
    try {
      const u = users.find(x => x.id === id)
      if (!u) return
      await usuariosService.update(id, { activo: !u.active })
      setUsers(prev => prev.map(u => u.id === id ? { ...u, active: !u.active } : u))
      toast.success(
        u.active
          ? `El usuario «${u.name}» fue desactivado correctamente.`
          : `El usuario «${u.name}» fue activado correctamente.`,
        { title: u.active ? 'Usuario desactivado' : 'Usuario activado' },
      )
    } catch (err) {
      toast.error('No se pudo cambiar el estado del usuario: ' + (err.message || 'error desconocido'))
    }
  }

  const groupedMunicipios = {}
  for (const m of municipios) {
    const estado = m.ESTA_NOM || m.estado || 'General'
    if (!groupedMunicipios[estado]) groupedMunicipios[estado] = []
    groupedMunicipios[estado].push(m)
  }

  if (loading) {
    return <div className="module-container"><p className="module-subtitle">Cargando configuración...</p></div>
  }

  return (
    <div className="module-container">
      <div className="module-header">
        <div>
          <h3 className="module-title">Configuración del Sistema</h3>
          <p className="module-subtitle">Administración de usuarios y catálogos - Contexto: {regionName}.</p>
        </div>
      </div>

      <div className="config-tabs">
        <button className={`config-tab ${activeConfigTab === 'usuarios' ? 'active' : ''}`} onClick={() => setActiveConfigTab('usuarios')}>Usuarios</button>
        <button className={`config-tab ${activeConfigTab === 'roles' ? 'active' : ''}`} onClick={() => setActiveConfigTab('roles')}>Roles</button>
        <button className={`config-tab ${activeConfigTab === 'catalogos' ? 'active' : ''}`} onClick={() => setActiveConfigTab('catalogos')}>Catálogos Geográficos</button>
      </div>

      {activeConfigTab === 'usuarios' && (
        <div className="config-section">
          <div className="config-section-header">
            <p>Gestión de usuarios internos del sistema ({users.length} registrados)</p>
            <button className="btn-module-primary" onClick={() => openUserForm()}>+ Nuevo Usuario</button>
          </div>
          <div className="table-responsive">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th className="table-th">Nombre / Usuario</th>
                  <th className="table-th">Email</th>
                  <th className="table-th">Rol</th>
                  <th className="table-th">Alcance</th>
                  <th className="table-th">Estado</th>
                  <th className="table-th">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 && (
                  <tr>
                    <td className="table-td" colSpan={6} style={{ textAlign: 'center', padding: '30px 0', color: 'var(--color-text-light)' }}>
                      Sin resultados: no hay usuarios que coincidan con los filtros actuales.
                    </td>
                  </tr>
                )}
                {users.map(u => (
                  <tr key={u.id}>
                    <td className="table-td" style={{ fontFamily: 'monospace', fontWeight: 600 }}>{u.name}</td>
                    <td className="table-td">{u.email}</td>
                    <td className="table-td"><span className="role-badge">{u.roleName || 'N/A'}</span></td>
                    <td className="table-td">{u.estadoName || 'Nacional'}</td>
                    <td className="table-td">
                      <span className={`user-status ${u.active ? 'activo' : 'inactivo'}`}>{u.active ? 'Activo' : 'Inactivo'}</span>
                    </td>
                    <td className="table-td">
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn-icon-sm" onClick={() => openUserForm(u)} title="Editar">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                        </button>
                        <button className="btn-icon-sm" onClick={() => toggleUserStatus(u.id)} title={u.active ? 'Desactivar' : 'Activar'}>
                          {u.active ? (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                          ) : (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {userTotalPages > 1 && (
          <div className="table-pagination-footer">
            <span className="pagination-info">Página {userPage} de {userTotalPages} ({userTotalItems} usuarios)</span>
            <div className="pagination-controls">
              <button className="btn-page-arrow" disabled={userPage <= 1} onClick={() => setUserPage(p => Math.max(1, p - 1))} title="Anterior"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg></button>
              {Array.from({ length: Math.min(userTotalPages, 10) }, (_, i) => i + 1).map(p => (
                <button key={p} className={`btn-page-num ${p === userPage ? 'active' : ''}`} onClick={() => setUserPage(p)}>{p}</button>
              ))}
              <button className="btn-page-arrow" disabled={userPage >= userTotalPages} onClick={() => setUserPage(p => Math.min(userTotalPages, p + 1))} title="Siguiente"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg></button>
            </div>
          </div>
        )}
      </div>
      )}

      {activeConfigTab === 'roles' && (
        <div className="config-section">
          <p>Roles y permisos del sistema</p>
          <div className="roles-grid">
            {roles.length === 0 ? (
              <p className="module-subtitle">No hay roles configurados.</p>
            ) : (
              roles.map(r => (
                <div key={r.ROLE_COD || r.id} className="role-card">
                  <div className="role-card-icon">
                    <RoleIcon role={r.ROLE_NOM || r.name} size={30} />
                  </div>
                  <h4 className="role-card-name">{r.ROLE_NOM || r.name}</h4>
                  <p className="role-card-desc">{r.ROLE_DES || r.description}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeConfigTab === 'catalogos' && (
        <div className="config-section">
          <p>Catálogo de municipios - Contexto: {regionName}</p>
          {Object.keys(groupedMunicipios).length === 0 ? (
            <div className="module-subtitle" style={{ textAlign: 'center', padding: '40px 0' }}>No hay catálogos geográficos disponibles.</div>
          ) : (
            <div className="municipios-list">
              {Object.entries(groupedMunicipios).map(([estado, muns]) => (
                <div key={estado} className="municipio-card">
                  <h4 className="municipio-name">{estado}</h4>
                  <div className="parroquias-list">
                    {muns.map(m => (
                      <span key={m.MUNI_COD || m.id} className="parroquia-tag">{m.MUNI_NOM || m.name}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showUserForm && (
        <div className="modal-overlay" onClick={() => setShowUserForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
              <button className="modal-close-btn" onClick={() => setShowUserForm(false)}>&times;</button>
            </div>
            <form onSubmit={handleSaveUser}>
              <div className="modal-body">
                {userFormError && (
                  <div style={{ marginBottom: '12px', padding: '10px 12px', borderRadius: '8px', background: 'rgba(190, 40, 40, 0.1)', border: '1px solid rgba(190, 40, 40, 0.35)', color: '#b02828', fontSize: '13.5px', fontWeight: 600 }}>
                    {userFormError}
                  </div>
                )}
                <div className="form-row">
                  <div className="form-modal-group flex-1">
                    <label>Nombre Completo *</label>
                    <input type="text" className="form-modal-input" value={userForm.fullName} onChange={e => setUserForm(p => ({ ...p, fullName: e.target.value }))} required />
                  </div>
                  <div className="form-modal-group flex-1">
                    <label>Correo Electrónico *</label>
                    <input type="email" className="form-modal-input" value={userForm.email} onChange={e => setUserForm(p => ({ ...p, email: e.target.value }))} required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-modal-group flex-1">
                    <label>Rol *</label>
                    <select className="form-modal-select" value={userForm.roleId} onChange={e => setUserForm(p => ({ ...p, roleId: e.target.value }))} required>
                      <option value="">Seleccione un rol...</option>
                      {rolesVisibles.map(r => (
                        <option key={r.ROLE_COD ?? r.id} value={r.ROLE_COD ?? r.id ?? ''}>{r.ROLE_NOM || r.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-modal-group flex-1">
                    <label>Estado (alcance)</label>
                    <select
                      className="form-modal-select"
                      value={esAdminEstadal && currentUser?.estadoId ? String(currentUser.estadoId) : userForm.estadoId}
                      disabled={esAdminEstadal}
                      onChange={e => setUserForm(p => ({ ...p, estadoId: e.target.value }))}
                      title={esAdminEstadal ? 'Los usuarios que crees quedan en tu estado' : 'Vacío = ámbito nacional'}
                    >
                      <option value="">Nacional (todos los estados)</option>
                      {estados.map(e => (
                        <option key={e.ESTA_COD ?? e.id} value={String(e.ESTA_COD ?? e.id ?? '')}>{e.ESTA_NOM || e.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-modal-group flex-1">
                    <label>Estado</label>
                    <select className="form-modal-select" value={userForm.status} onChange={e => setUserForm(p => ({ ...p, status: e.target.value }))}>
                      <option value="activo">Activo</option>
                      <option value="inactivo">Inactivo</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-modal-group flex-1">
                    <label>{editingUser ? 'Nueva Clave (opcional)' : 'Clave *'}</label>
                    <input type="password" className="form-modal-input" value={userForm.password} onChange={e => setUserForm(p => ({ ...p, password: e.target.value }))} placeholder={editingUser ? 'Dejar en blanco para no cambiar' : 'Mínimo 8 caracteres'} autoComplete="new-password" />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="submit" className="btn-modal-action approve">{editingUser ? 'Actualizar' : 'Crear Usuario'}</button>
                <button type="button" className="btn-modal-action cancel" onClick={() => setShowUserForm(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
