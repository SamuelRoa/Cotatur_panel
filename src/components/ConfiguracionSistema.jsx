import { useState } from 'react'
import RegionOverviewCard from './RegionOverviewCard.jsx'

const initialRoles = [
  { id: 1, name: 'Administrador', description: 'Acceso total al sistema, gestión de usuarios y configuración' },
  { id: 2, name: 'Validador', description: 'Puede revisar y aprobar/rechazar prestadores turísticos' },
  { id: 3, name: 'Editor', description: 'Puede crear y editar contenido, destinos y eventos' },
  { id: 4, name: 'Soporte', description: 'Acceso al centro de soporte y bandeja de consultas' },
]

const initialSystemUsers = [
  { id: 1, username: 'admin', fullName: 'Ricardo Salas', email: 'admin@cotatur.gob.ve', role: 'Administrador', status: 'activo' },
  { id: 2, username: 'validador1', fullName: 'María Torres', email: 'validador1@cotatur.gob.ve', role: 'Validador', status: 'activo' },
  { id: 3, username: 'editor1', fullName: 'Carlos Moreno', email: 'editor1@cotatur.gob.ve', role: 'Editor', status: 'activo' },
  { id: 4, username: 'soporte1', fullName: 'Ana Rivas', email: 'soporte1@cotatur.gob.ve', role: 'Soporte', status: 'activo' },
]

const regionMunicipios = {
  los_andes: [
    { id: 1, name: 'Mérida', parroquias: ['El Llano','Sagrario','Millita'] },
    { id: 2, name: 'Tovar', parroquias: ['Tovar','El Amparo'] },
  ],
  central: [
    { id: 3, name: 'Libertador', parroquias: ['Catia','La Pastora'] },
    { id: 4, name: 'Caracas', parroquias: ['Libertador','Altagracia'] },
  ],
  insular: [
    { id: 5, name: 'Maneiro', parroquias: ['Pampatar'] }
  ],
  eje: [
    { id: 7, name: 'Barquisimeto', parroquias: ['Concepción','El Cují','Santa Rosa'] },
    { id: 8, name: 'Maracaibo', parroquias: ['Olegario Villalobos','Juana de Ávila','Coquivacoa'] },
    { id: 9, name: 'Coro', parroquias: ['San Antonio','Santa Ana'] },
  ],
  llanos: [
    { id: 10, name: 'San Fernando', parroquias: ['San Fernando','Apure'] },
    { id: 11, name: 'Calabozo', parroquias: ['Calabozo','El Calvario'] },
  ],
  amazonica: [
    { id: 12, name: 'Atures', parroquias: ['Puerto Ayacucho','Platanillal'] },
    { id: 13, name: 'Gran Sabana', parroquias: ['Santa Elena de Uairén','Kavanayén'] },
  ],
  oriental: [
    { id: 14, name: 'Sucre', parroquias: ['Cumaná','Altagracia'] },
    { id: 15, name: 'Arismendi', parroquias: ['Río Caribe','El Tirano'] },
  ],
  national: [
    { id: 1, name: 'San Cristóbal', parroquias: ['La Concordia','San Sebastián'] },
    { id: 2, name: 'Mérida', parroquias: ['El Llano','Sagrario'] },
  ]
}

export default function ConfiguracionSistema({ regionId = 'national', regionName = 'Visión Nacional' }) {
  const [users, setUsers] = useState(initialSystemUsers)
  const [activeConfigTab, setActiveConfigTab] = useState('usuarios')
  const [showUserForm, setShowUserForm] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [userForm, setUserForm] = useState({ username: '', fullName: '', email: '', role: 'Editor', password: '', status: 'activo' })

  const openUserForm = (u = null) => {
    if (u) {
      setEditingUser(u.id)
      setUserForm({ username: u.username, fullName: u.fullName, email: u.email, role: u.role, password: '', status: u.status })
    } else {
      setEditingUser(null)
      setUserForm({ username: '', fullName: '', email: '', role: 'Editor', password: '', status: 'activo' })
    }
    setShowUserForm(true)
  }

  const handleSaveUser = (e) => {
    e.preventDefault()
    if (!userForm.username.trim() || !userForm.fullName.trim()) return
    if (editingUser) {
      setUsers(prev => prev.map(u => u.id === editingUser ? { ...u, ...userForm, password: userForm.password || u.password } : u))
    } else {
      setUsers(prev => [...prev, { id: Date.now(), ...userForm, password: userForm.password || 'default123' }])
    }
    setShowUserForm(false)
    setEditingUser(null)
  }

  const toggleUserStatus = (id) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'activo' ? 'inactivo' : 'activo' } : u))
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
                  <th className="table-th">Usuario</th>
                  <th className="table-th">Nombre Completo</th>
                  <th className="table-th">Email</th>
                  <th className="table-th">Rol</th>
                  <th className="table-th">Estado</th>
                  <th className="table-th">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td className="table-td" style={{ fontFamily: 'monospace', fontWeight: 600 }}>{u.username}</td>
                    <td className="table-td">{u.fullName}</td>
                    <td className="table-td">{u.email}</td>
                    <td className="table-td"><span className="role-badge">{u.role}</span></td>
                    <td className="table-td">
                      <span className={`user-status ${u.status}`}>{u.status === 'activo' ? 'Activo' : 'Inactivo'}</span>
                    </td>
                    <td className="table-td">
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn-icon-sm" onClick={() => openUserForm(u)} title="Editar">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                        </button>
                        <button className="btn-icon-sm" onClick={() => toggleUserStatus(u.id)} title={u.status === 'activo' ? 'Desactivar' : 'Activar'}>
                          {u.status === 'activo' ? (
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
        </div>
      )}

      {activeConfigTab === 'roles' && (
        <div className="config-section">
          <p>Roles y permisos del sistema</p>
          <div className="roles-grid">
            {initialRoles.map(r => (
              <div key={r.id} className="role-card">
                <div className="role-card-icon">
                  {r.name === 'Administrador' ? '🛡️' : r.name === 'Validador' ? '✅' : r.name === 'Editor' ? '✏️' : '💬'}
                </div>
                <h4 className="role-card-name">{r.name}</h4>
                <p className="role-card-desc">{r.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeConfigTab === 'catalogos' && (
        <div className="config-section">
          <p>Catálogo de municipios y parroquias - Contexto: {regionName}</p>
          {(regionMunicipios[regionId] || regionMunicipios['national']).length === 0 ? (
            <RegionOverviewCard moduleKey="configuracion" regionId={regionId} regionName={regionName} />
          ) : (
            <div className="municipios-list">
              {(regionMunicipios[regionId] || regionMunicipios['national']).map(m => (
                <div key={m.id} className="municipio-card">
                  <h4 className="municipio-name">{m.name}</h4>
                  <div className="parroquias-list">
                    {m.parroquias.map(p => (
                      <span key={p} className="parroquia-tag">{p}</span>
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
                    <label>Nombre de Usuario *</label>
                    <input type="text" className="form-modal-input" value={userForm.username} onChange={e => setUserForm(p => ({ ...p, username: e.target.value }))} required />
                  </div>
                  <div className="form-modal-group flex-1">
                    <label>Nombre Completo *</label>
                    <input type="text" className="form-modal-input" value={userForm.fullName} onChange={e => setUserForm(p => ({ ...p, fullName: e.target.value }))} required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-modal-group flex-1">
                    <label>Email</label>
                    <input type="email" className="form-modal-input" value={userForm.email} onChange={e => setUserForm(p => ({ ...p, email: e.target.value }))} />
                  </div>
                  <div className="form-modal-group flex-1">
                    <label>Rol</label>
                    <select className="form-modal-select" value={userForm.role} onChange={e => setUserForm(p => ({ ...p, role: e.target.value }))}>
                      <option value="Administrador">Administrador</option>
                      <option value="Validador">Validador</option>
                      <option value="Editor">Editor</option>
                      <option value="Soporte">Soporte</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-modal-group flex-1">
                    <label>Clave {editingUser && '(dejar vacío para mantener)'}</label>
                    <input type="password" className="form-modal-input" value={userForm.password} onChange={e => setUserForm(p => ({ ...p, password: e.target.value }))} />
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
