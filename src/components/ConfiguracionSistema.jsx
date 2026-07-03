import { useState, useEffect } from 'react'
import { usuariosService } from '../services/usuarios'
import { geoService } from '../services/geo'
import mockData from '../services/mockData.js'

export default function ConfiguracionSistema({ regionId = null, regionName = 'Visión Nacional' }) {
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [municipios, setMunicipios] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeConfigTab, setActiveConfigTab] = useState('usuarios')
  const [showUserForm, setShowUserForm] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [userForm, setUserForm] = useState({ username: '', fullName: '', email: '', role: 'Editor', password: '', status: 'activo' })
  const [userPage, setUserPage] = useState(1)
  const [userTotalPages, setUserTotalPages] = useState(1)
  const [userTotalItems, setUserTotalItems] = useState(0)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      usuariosService.getAll({ page: userPage, limit: 10 }),
      usuariosService.getRoles().then(r => r.data || r),
      geoService.getMunicipios().then(r => r.data || r),
    ])
      .then(([usersRes, rolesRes, munRes]) => {
        const usersData = usersRes.usuarios || []
        setUsers(usersData)
        setUserTotalItems(usersRes.meta?.total ?? usersData.length)
        setUserTotalPages(Math.max(1, Math.ceil((usersRes.meta?.total ?? usersData.length) / 10)))
        const rolesData = Array.isArray(rolesRes) ? rolesRes : rolesRes.roles || []
        const munData = Array.isArray(munRes) ? munRes : munRes.municipios || []
        if (usersData.length === 0 && rolesData.length === 0 && munData.length === 0) {
          const mock = mockData.buildUsuarios()
          setUsers(mock)
          setUserTotalItems(mock.length)
          setUserTotalPages(Math.max(1, Math.ceil(mock.length / 10)))
          setRoles([
            { ROLE_COD: 1, ROLE_NOM: 'Administrador', ROLE_DES: 'Acceso total al sistema' },
            { ROLE_COD: 2, ROLE_NOM: 'Validador', ROLE_DES: 'Validación de prestadores turísticos' },
            { ROLE_COD: 3, ROLE_NOM: 'Editor', ROLE_DES: 'Edición de contenido y destinos' },
            { ROLE_COD: 4, ROLE_NOM: 'Soporte', ROLE_DES: 'Atención al usuario y consultas' },
          ])
          setMunicipios([])
        } else {
          setRoles(rolesData)
          setMunicipios(munData)
        }
        setLoading(false)
      })
      .catch(() => {
        const mock = mockData.buildUsuarios()
        setUsers(mock)
        setUserTotalItems(mock.length)
        setUserTotalPages(Math.max(1, Math.ceil(mock.length / 10)))
        setRoles([
          { ROLE_COD: 1, ROLE_NOM: 'Administrador', ROLE_DES: 'Acceso total al sistema' },
          { ROLE_COD: 2, ROLE_NOM: 'Validador', ROLE_DES: 'Validación de prestadores turísticos' },
          { ROLE_COD: 3, ROLE_NOM: 'Editor', ROLE_DES: 'Edición de contenido y destinos' },
          { ROLE_COD: 4, ROLE_NOM: 'Soporte', ROLE_DES: 'Atención al usuario y consultas' },
        ])
        setMunicipios([])
        setLoading(false)
      })
  }, [userPage])

  const openUserForm = (u = null) => {
    if (u) {
      setEditingUser(u.id)
      setUserForm({ username: u.name || '', fullName: u.name || '', email: u.email || '', role: u.roleName || 'Editor', password: '', status: u.active ? 'activo' : 'inactivo' })
    } else {
      setEditingUser(null)
      setUserForm({ username: '', fullName: '', email: '', role: 'Editor', password: '', status: 'activo' })
    }
    setShowUserForm(true)
  }

  const handleSaveUser = async (e) => {
    e.preventDefault()
    if (!userForm.fullName.trim()) return
    try {
      const payload = { name: userForm.fullName, email: userForm.email }
      if (editingUser) {
        await usuariosService.update(editingUser, payload)
      }
      const res = await usuariosService.getAll()
      setUsers(res.usuarios || [])
      setShowUserForm(false)
      setEditingUser(null)
    } catch (err) {
      alert('Error al guardar: ' + err.message)
    }
  }

  const toggleUserStatus = async (id) => {
    try {
      const u = users.find(x => x.id === id)
      if (!u) return
      await usuariosService.update(id, { active: !u.active })
      setUsers(prev => prev.map(u => u.id === id ? { ...u, active: !u.active } : u))
    } catch (err) {
      alert('Error al cambiar estado: ' + err.message)
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
                  <th className="table-th">Estado</th>
                  <th className="table-th">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td className="table-td" style={{ fontFamily: 'monospace', fontWeight: 600 }}>{u.name}</td>
                    <td className="table-td">{u.email}</td>
                    <td className="table-td"><span className="role-badge">{u.roleName || 'N/A'}</span></td>
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
                    {r.ROLE_NOM === 'Administrador' ? '🛡️' : r.ROLE_NOM === 'Validador' ? '✅' : r.ROLE_NOM === 'Editor' ? '✏️' : '💬'}
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
                <div className="form-row">
                  <div className="form-modal-group flex-1">
                    <label>Nombre Completo *</label>
                    <input type="text" className="form-modal-input" value={userForm.fullName} onChange={e => setUserForm(p => ({ ...p, fullName: e.target.value }))} required />
                  </div>
                  <div className="form-modal-group flex-1">
                    <label>Email</label>
                    <input type="email" className="form-modal-input" value={userForm.email} onChange={e => setUserForm(p => ({ ...p, email: e.target.value }))} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-modal-group flex-1">
                    <label>Rol</label>
                    <select className="form-modal-select" value={userForm.role} onChange={e => setUserForm(p => ({ ...p, role: e.target.value }))}>
                      <option value="Administrador">Administrador</option>
                      <option value="Validador">Validador</option>
                      <option value="Editor">Editor</option>
                      <option value="Soporte">Soporte</option>
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
              </div>
              <div className="modal-footer">
                <button type="submit" className="btn-modal-action approve">{editingUser ? 'Actualizar' : 'Guardar'}</button>
                <button type="button" className="btn-modal-action cancel" onClick={() => setShowUserForm(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
