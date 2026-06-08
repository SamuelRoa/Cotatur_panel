import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import cotaturLogo from './assets/cotatur_logo.png'
import './App.css'
import DestinosCRUD from './components/DestinosCRUD.jsx'
import RouteDesigner from './components/RouteDesigner.jsx'
import DirectorioProveedores from './components/DirectorioProveedores.jsx'
import GestionEventos from './components/GestionEventos.jsx'
import CentroDifusion from './components/CentroDifusion.jsx'
import CentroSoporte from './components/CentroSoporte.jsx'
import ConfiguracionSistema from './components/ConfiguracionSistema.jsx'
import ValidationWizard from './components/ValidationWizard.jsx'
import RegionOverviewCard from './components/RegionOverviewCard.jsx'
import { regionsList, corporationsByRegion } from './regionContent'

function App() {
  // Registered Users list state (default pre-filled with admin credentials)
  const [users, setUsers] = useState([
    { username: 'admin', password: 'cotatur2026', email: 'admin@cotatur.gob.ve', fullName: 'Ricardo Salas' }
  ])

  // Form states (Login)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  
  // Form states (Register)
  const [regFullName, setRegFullName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regUsername, setRegUsername] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirmPassword, setRegConfirmPassword] = useState('')
  const [regErrorMsg, setRegErrorMsg] = useState('')

  // View State
  const [currentView, setCurrentView] = useState('login') // 'login' | 'register' | 'dashboard'
  
  // Dashboard Navigation State
  const [activeNav, setActiveNav] = useState('dashboard')
  
  // Dashboard Merchants State
  const [merchants, setMerchants] = useState([
    { id: 1, name: 'Posada La Montaña', category: 'Alojamiento Turístico', rif: 'J-29384756-0', date: '24 Oct, 2023', status: 'pendiente', region: 'los_andes' },
    { id: 2, name: 'Sabores Tachirenses', category: 'Gastronomía Regional', rif: 'J-30112233-1', date: '23 Oct, 2023', status: 'validado', region: 'los_andes' },
    { id: 3, name: 'Rutas del Páramo', category: 'Agencia de Viajes', rif: 'J-45566778-9', date: '22 Oct, 2023', status: 'rechazado', region: 'central' },
    { id: 4, name: 'Hotel Venetur Mérida', category: 'Alojamiento Turístico', rif: 'J-40011223-3', date: '10 Nov, 2025', status: 'validado', region: 'los_andes' },
    { id: 5, name: 'Restaurant El Criollo', category: 'Gastronomía Regional', rif: 'J-31223344-5', date: '05 Sep, 2025', status: 'pendiente', region: 'central' },
    { id: 6, name: 'Posada Caribe', category: 'Alojamiento Turístico', rif: 'J-50011223-6', date: '01 Feb, 2026', status: 'validado', region: 'insular' },
  ])
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('')

  // Timeframe filter state
  const [timeframe, setTimeframe] = useState('30d')
  const [showTimeframeMenu, setShowTimeframeMenu] = useState(false)
  const timeframeOptions = [
    { value: '24h', label: 'Últimas 24 horas' },
    { value: 'week', label: 'Última semana' },
    { value: '30d', label: 'Últimos 30 días' },
    { value: '90d', label: 'Últimos 90 días' },
  ]
  const currentTimeframeLabel = timeframeOptions.find(t => t.value === timeframe)?.label || 'Últimos 30 días'

  // Simulated auth & region state (for UI behavior)
  const [authUser, setAuthUser] = useState({ role: 'superadmin', assignedRegion: 'los_andes', fullName: 'Lic. Ricardo Salas' })
  const [regionId, setRegionId] = useState(authUser.role === 'superadmin' ? 'national' : authUser.assignedRegion)
  const regions = regionsList
  const regionObj = regions.find(r => r.id === regionId) || regions[0]
  const regionName = regionObj.name
  const corporationsList = corporationsByRegion[regionId] || []
  
  // Modal states
  const [reviewMerchant, setReviewMerchant] = useState(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newMerchant, setNewMerchant] = useState({ name: '', category: 'Alojamiento Turístico', rif: '' })
  
  // Interactive Modal Notification State
  const [modalInfo, setModalInfo] = useState({ isOpen: false, title: '', message: '' })
  
  // Export modal state
  const [showExportModal, setShowExportModal] = useState(false)

  // Validation wizard state
  const [wizardOpen, setWizardOpen] = useState(false)

  const handleLoginSubmit = (e) => {
    e.preventDefault()
    setErrorMsg('')
    
    if (!username.trim() || !password.trim()) {
      setErrorMsg('Por favor, complete todos los campos.')
      return
    }

    const normalizedUser = username.trim().toLowerCase()
    
    // Look up the user in the dynamic list
    const foundUser = users.find(u => 
      (u.username.toLowerCase() === normalizedUser || u.email.toLowerCase() === normalizedUser) && 
      u.password === password
    )

    if (foundUser) {
      setCurrentView('dashboard')
      // Reset form
      setUsername('')
      setPassword('')
    } else {
      setErrorMsg('Credenciales incorrectas. Intente con admin / cotatur2026 o regístrese.')
    }
  }

  const handleRegisterSubmit = (e) => {
    e.preventDefault()
    setRegErrorMsg('')

    if (!regFullName.trim() || !regEmail.trim() || !regUsername.trim() || !regPassword.trim() || !regConfirmPassword.trim()) {
      setRegErrorMsg('Por favor, complete todos los campos.')
      return
    }

    if (regPassword !== regConfirmPassword) {
      setRegErrorMsg('Las claves ingresadas no coinciden.')
      return
    }

    if (regPassword.length < 6) {
      setRegErrorMsg('La clave debe tener al menos 6 caracteres.')
      return
    }

    const normalizedUser = regUsername.trim().toLowerCase()
    const normalizedEmail = regEmail.trim().toLowerCase()
    
    // Check if user or email exists
    const userExists = users.some(u => 
      u.username.toLowerCase() === normalizedUser || 
      u.email.toLowerCase() === normalizedEmail
    )

    if (userExists) {
      setRegErrorMsg('El usuario o correo electrónico ya está registrado.')
      return
    }

    // Add new user
    const newUser = {
      username: regUsername.trim(),
      password: regPassword,
      email: regEmail.trim(),
      fullName: regFullName.trim()
    }

    setUsers(prev => [...prev, newUser])

    // Clear form inputs
    setRegFullName('')
    setRegEmail('')
    setRegUsername('')
    setRegPassword('')
    setRegConfirmPassword('')

    // Auto-fill login form
    setUsername(newUser.username)

    // Go back to login screen
    setCurrentView('login')
    
    triggerModal(
      'Registro Exitoso',
      `¡Su cuenta "${newUser.username}" ha sido creada! Ya puede iniciar sesión con la clave ingresada.`
    )
  }

  const triggerModal = (title, message) => {
    setModalInfo({ isOpen: true, title, message })
  }

  const closeModal = () => {
    setModalInfo({ isOpen: false, title: '', message: '' })
  }

  const handleReviewAction = (id, newStatus) => {
    setMerchants(prev => prev.map(m => m.id === id ? { ...m, status: newStatus } : m))
    setReviewMerchant(null)
    triggerModal(
      newStatus === 'validado' ? 'Solicitud Aprobada' : 'Solicitud Rechazada',
      `El prestador turístico ha sido marcado como ${newStatus.toUpperCase()} exitosamente.`
    )
  }

  const handleWizardSubmit = (merchantData) => {
    setMerchants(prev => [merchantData, ...prev])
    triggerModal('Registro Exitoso', `El prestador "${merchantData.name}" ha sido registrado y enviado para validación.`)
  }

  const handleAddMerchantSubmit = (e) => {
    e.preventDefault()
    if (!newMerchant.name.trim() || !newMerchant.rif.trim()) {
      alert('Por favor complete los campos obligatorios.')
      return
    }
    const today = new Date()
    const options = { day: '2-digit', month: 'short', year: 'numeric' }
    const formattedDate = today.toLocaleDateString('es-ES', options).replace('.', '')
    
    const created = {
      id: Date.now(),
      name: newMerchant.name,
      category: newMerchant.category,
      rif: newMerchant.rif,
      date: formattedDate,
      status: 'pendiente'
    }
    
    setMerchants(prev => [created, ...prev])
    setIsAddModalOpen(false)
    setNewMerchant({ name: '', category: 'Alojamiento Turístico', rif: '' })
    
    triggerModal(
      'Punto Registrado',
      `El prestador "${created.name}" ha sido ingresado como PENDIENTE de validación.`
    )
  }

  function isWithinTimeframe(dateStr, timeframe) {
    const months = { 'ene':0,'feb':1,'mar':2,'abr':3,'may':4,'jun':5,'jul':6,'ago':7,'sep':8,'oct':9,'nov':10,'dic':11 }
    const parts = dateStr.split(' ')
    if (parts.length !== 3) return true
    const day = parseInt(parts[0])
    const month = months[parts[1].toLowerCase().slice(0,3)]
    const year = parseInt(parts[2])
    if (isNaN(day) || month === undefined || isNaN(year)) return true
    const date = new Date(year, month, day)
    const now = new Date()
    const diffMs = now - date
    const diffHours = diffMs / (1000 * 60 * 60)
    const diffDays = diffHours / 24
    switch (timeframe) {
      case '24h': return diffHours <= 24
      case 'week': return diffDays <= 7
      case '30d': return diffDays <= 30
      case '90d': return diffDays <= 90
      default: return true
    }
  }

  const filteredMerchants = merchants.filter(m => 
    (m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.rif.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.category.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (regionId === 'national' ? true : m.region === regionId) &&
    isWithinTimeframe(m.date, timeframe)
  )

  const regionBaseTotals = {
    national: { registered: 1284, georeferenced: 452, alerts: 18 },
    los_andes: { registered: 312, georeferenced: 142, alerts: 4 },
    central: { registered: 218, georeferenced: 90, alerts: 3 },
    insular: { registered: 140, georeferenced: 60, alerts: 2 },
    llanos: { registered: 102, georeferenced: 40, alerts: 1 },
    eje: { registered: 230, georeferenced: 110, alerts: 3 },
    amazonica: { registered: 58, georeferenced: 10, alerts: 1 },
    oriental: { registered: 192, georeferenced: 120, alerts: 4 },
  }
  const base = regionBaseTotals[regionId] || regionBaseTotals.national
  const totalRegisteredCount = base.registered + (filteredMerchants.length)
  const totalGeoreferencedCount = base.georeferenced + (filteredMerchants.filter(m => m.status === 'validado').length)
  const totalAlertsCount = base.alerts

  return (
    <div style={{ width: '100%' }}>
      <AnimatePresence mode="wait">
      {currentView === 'login' ? (
        <motion.div
          key="login"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="login-screen">
          {/* Main Login Card */}
          <div className="login-card">
            {/* Multicolored strip matching logo */}
            <div className="mosaic-strip"></div>
            
            {/* Header and Form Area */}
            <div className="login-card-main">
              {/* Brand Logo Image */}
              <div className="brand-logo-container">
                <div style={{fontSize:42,fontWeight:800,color:'var(--color-primary)'}}>MINTUR</div>
              </div>
              <h2 className="brand-subtitle">Plataforma Georreferenciada Nacional</h2>

              {/* Collapsible demo credentials box */}
              <div className="demo-credentials-box">
                <div className="demo-credentials-header">Acceso de Demostración</div>
                <div className="demo-credentials-text">
                  Usuario: <code>admin</code> o <code>admin@cotatur.gob.ve</code><br />
                  Clave: <code>cotatur2026</code>
                </div>
              </div>

              {/* Form */}
              <form className="login-form" onSubmit={handleLoginSubmit}>
                
                {/* Username Input */}
                <div className="form-group">
                  <label className="form-label" htmlFor="username">Usuario</label>
                  <div className="input-wrapper">
                    <span className="input-icon-left">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </span>
                    <input
                      id="username"
                      type="text"
                      className="form-input"
                      placeholder="Nombre de usuario o correo"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      autoComplete="username"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="form-group">
                  <label className="form-label" htmlFor="password">Clave</label>
                  <div className="input-wrapper">
                    <span className="input-icon-left">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </span>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      className="form-input form-input-password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {showPassword ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Error Message */}
                {errorMsg && (
                  <div style={{ color: 'var(--color-error)', fontSize: '13px', textAlign: 'left', fontWeight: '500' }}>
                    {errorMsg}
                  </div>
                )}

                {/* Options Row: Remember & Forgot password */}
                <div className="form-options-row">
                  <label className="remember-me-label">
                    <input
                      type="checkbox"
                      className="remember-checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    Recordarme
                  </label>
                  <a
                    href="#forgot-password"
                    className="forgot-password-link"
                    onClick={(e) => {
                      e.preventDefault()
                      triggerModal(
                        'Recuperación de Clave',
                        'Se ha enviado una solicitud para restablecer su clave. Por favor, póngase en contacto con el administrador o verifique su correo institucional.'
                      )
                    }}
                  >
                    ¿Olvidó su clave?
                  </a>
                </div>

                {/* Submit button */}
                <button type="submit" className="btn-submit">
                  Iniciar Sesión
                  <span className="btn-icon-right">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                      <polyline points="10 17 15 12 10 7" />
                      <line x1="15" y1="12" x2="3" y2="12" />
                    </svg>
                  </span>
                </button>

                {/* Invitation to register */}
                <div className="register-invite-row" style={{ marginTop: '16px', fontSize: '13.5px', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                  ¿No tiene una cuenta?{' '}
                  <a
                    href="#register"
                    onClick={(e) => {
                      e.preventDefault()
                      setCurrentView('register')
                    }}
                    style={{ color: 'var(--color-primary)', fontWeight: '600', textDecoration: 'none' }}
                  >
                    Regístrese aquí
                  </a>
                </div>
              </form>

              {/* Secondary Portal Access Links */}
              <div className="secondary-links-container">
                <a
                  href="#tecnico"
                  className="secondary-access-link"
                  onClick={(e) => {
                    e.preventDefault()
                    triggerModal(
                      'Acceso Técnico COTATUR',
                      'Esta área está restringida para el personal técnico encargado de la validación georreferenciada y mantenimiento del sistema.'
                    )
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                  </svg>
                  Acceso Técnico COTATUR
                </a>
                <a
                  href="#proveedores"
                  className="secondary-access-link"
                  onClick={(e) => {
                    e.preventDefault()
                    triggerModal(
                      'Ingreso de Proveedores Locales',
                      'Área dedicada para que las posadas, hoteles, restaurantes y prestadores de servicios turísticos del Táchira gestionen su oferta.'
                    )
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                  Ingreso de Proveedores Locales
                </a>
              </div>
            </div>

            {/* Dark Green Banner at Card Footer */}
            <div className="login-card-footer">
              <p className="footer-quote">
                &ldquo;Explora la belleza natural del Táchira con nuestra guía inteligente&rdquo;
              </p>
              <div className="visitor-info">
                <span className="visitor-label">¿Eres visitante?</span>
                <a
                  href="#registro-visitante"
                  className="visitor-register-link"
                  onClick={(e) => {
                    e.preventDefault()
                    setCurrentView('register')
                  }}
                >
                  Regístrate aquí para explorar Táchira
                </a>
              </div>
            </div>
          </div>

          {/* External Footer */}
          <footer className="copyright-footer">
            <div className="copyright-emblem">
              <svg viewBox="0 0 24 24">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <p className="copyright-text">
              &copy; 2026 MINTUR - Ministerio del Poder Popular para el Turismo. Todos los derechos reservados.
            </p>
          </footer>

          {/* Floating Geographic Map Widget (Bottom Right) */}
          <div
            className="floating-map-widget"
            title="Ver Mapa Geoturismo"
            onClick={() => triggerModal(
              'Geolocalización Turística',
              'La plataforma georreferenciada de COTATUR permite mapear en tiempo real la oferta turística y el patrimonio cultural del Táchira.'
            )}
          >
            <div className="map-widget-content">
              <div className="map-widget-overlay">
                <span className="map-widget-label">Georreferencia</span>
              </div>
            </div>
          </div>
        </motion.div>
      ) : currentView === 'register' ? (
        <motion.div
          key="register"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="login-screen">
          {/* Main Registration Card */}
          <div className="login-card">
            {/* Multicolored strip matching logo */}
            <div className="mosaic-strip"></div>
            
            {/* Header and Form Area */}
            <div className="login-card-main">
              {/* Brand Logo Image */}
              <div className="brand-logo-container">
                <div style={{fontSize:42,fontWeight:800,color:'var(--color-primary)'}}>MINTUR</div>
              </div>
              <h2 className="brand-subtitle">Registro de Nuevo Usuario</h2>

              {/* Form */}
              <form className="login-form" onSubmit={handleRegisterSubmit}>
                
                {/* Full Name Input */}
                <div className="form-group">
                  <label className="form-label" htmlFor="regFullName">Nombre Completo</label>
                  <div className="input-wrapper">
                    <span className="input-icon-left">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </span>
                    <input
                      id="regFullName"
                      type="text"
                      className="form-input"
                      placeholder="Ej. Juan Pérez"
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                    />
                  </div>
                </div>

                {/* Email Input */}
                <div className="form-group">
                  <label className="form-label" htmlFor="regEmail">Correo Electrónico</label>
                  <div className="input-wrapper">
                    <span className="input-icon-left">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                    </span>
                    <input
                      id="regEmail"
                      type="email"
                      className="form-input"
                      placeholder="ejemplo@correo.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                    />
                  </div>
                </div>

                {/* Username Input */}
                <div className="form-group">
                  <label className="form-label" htmlFor="regUsername">Nombre de Usuario</label>
                  <div className="input-wrapper">
                    <span className="input-icon-left">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </span>
                    <input
                      id="regUsername"
                      type="text"
                      className="form-input"
                      placeholder="Nombre de usuario único"
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="form-group">
                  <label className="form-label" htmlFor="regPassword">Clave de Acceso</label>
                  <div className="input-wrapper">
                    <span className="input-icon-left">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </span>
                    <input
                      id="regPassword"
                      type="password"
                      className="form-input"
                      placeholder="Mínimo 6 caracteres"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                    />
                  </div>
                </div>

                {/* Confirm Password Input */}
                <div className="form-group">
                  <label className="form-label" htmlFor="regConfirmPassword">Confirmar Clave</label>
                  <div className="input-wrapper">
                    <span className="input-icon-left">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </span>
                    <input
                      id="regConfirmPassword"
                      type="password"
                      className="form-input"
                      placeholder="Repita la contraseña"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>

                {/* Registration Error Message */}
                {regErrorMsg && (
                  <div style={{ color: 'var(--color-error)', fontSize: '13px', textAlign: 'left', fontWeight: '500' }}>
                    {regErrorMsg}
                  </div>
                )}

                {/* Submit Register button */}
                <button type="submit" className="btn-submit" style={{ marginTop: '8px' }}>
                  Registrar Cuenta
                  <span className="btn-icon-right">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="8.5" cy="7" r="4" />
                      <line x1="20" y1="8" x2="20" y2="14" />
                      <line x1="23" y1="11" x2="17" y2="11" />
                    </svg>
                  </span>
                </button>

                {/* Back to Login invitation */}
                <div className="register-invite-row" style={{ marginTop: '16px', fontSize: '13.5px', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                  ¿Ya tiene una cuenta?{' '}
                  <a
                    href="#login"
                    onClick={(e) => {
                      e.preventDefault()
                      setCurrentView('login')
                    }}
                    style={{ color: 'var(--color-primary)', fontWeight: '600', textDecoration: 'none' }}
                  >
                    Inicie Sesión
                  </a>
                </div>
              </form>
            </div>

            {/* Dark Green Banner at Card Footer */}
            <div className="login-card-footer">
              <p className="footer-quote">
                &ldquo;Explora la belleza natural del Táchira con nuestra guía inteligente&rdquo;
              </p>
            </div>
          </div>

          {/* External Footer */}
          <footer className="copyright-footer">
            <div className="copyright-emblem">
              <svg viewBox="0 0 24 24">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <p className="copyright-text">
              &copy; 2026 MINTUR - Ministerio del Poder Popular para el Turismo. Todos los derechos reservados.
            </p>
          </footer>
        </motion.div>
      ) : (
        <motion.div
          key="dashboard"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="dashboard-layout">
          {/* Sidebar */}
          <aside className="dashboard-sidebar">
            <div className="sidebar-brand-container">
              <div className="sidebar-logo-text">MINTUR</div>
              <h1 className="sidebar-brand-name">MINTUR</h1>
              <p className="sidebar-brand-sub">{regionId === 'national' ? 'Turismo Nacional VZLA' : regionName}</p>
            </div>
            
            <nav className="sidebar-nav">
              <button 
                className={`sidebar-nav-item ${activeNav === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveNav('dashboard')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="9" />
                  <rect x="14" y="3" width="7" height="5" />
                  <rect x="14" y="12" width="7" height="9" />
                  <rect x="3" y="16" width="7" height="5" />
                </svg>
                <span>Panel</span>
              </button>
              <button 
                className={`sidebar-nav-item ${activeNav === 'regiones' ? 'active' : ''}`}
                onClick={() => setActiveNav('regiones')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span>Regiones</span>
              </button>
              <button 
                className={`sidebar-nav-item ${activeNav === 'destinos' ? 'active' : ''}`}
                onClick={() => setActiveNav('destinos')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
                  <line x1="9" y1="3" x2="9" y2="18" />
                  <line x1="15" y1="6" x2="15" y2="21" />
                </svg>
                <span>Destinos</span>
              </button>
              <button 
                className={`sidebar-nav-item ${activeNav === 'proveedores' ? 'active' : ''}`}
                onClick={() => setActiveNav('proveedores')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                <span>Proveedores</span>
              </button>
              <button 
                className={`sidebar-nav-item ${activeNav === 'eventos' ? 'active' : ''}`}
                onClick={() => setActiveNav('eventos')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span>Eventos</span>
              </button>
              <button 
                className={`sidebar-nav-item ${activeNav === 'difusion' ? 'active' : ''}`}
                onClick={() => setActiveNav('difusion')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <span>Difusión</span>
              </button>
              <button 
                className={`sidebar-nav-item ${activeNav === 'validation' ? 'active' : ''}`}
                onClick={() => setActiveNav('validation')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <span>Validación</span>
              </button>
              <button 
                className={`sidebar-nav-item ${activeNav === 'route' ? 'active' : ''}`}
                onClick={() => setActiveNav('route')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6" />
                  <circle cx="12" cy="12" r="10" />
                </svg>
                <span>Rutas</span>
              </button>

            </nav>
            
            <div className="sidebar-footer-actions">
              <button className="btn-sidebar-add" onClick={() => setIsAddModalOpen(true)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>+ Nuevo Punto</span>
              </button>
              <button 
                className={`sidebar-nav-item ${activeNav === 'soporte' ? 'active' : ''}`} 
                onClick={() => setActiveNav('soporte')}
                style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left' }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <span>Soporte</span>
              </button>
              <button 
                className={`sidebar-nav-item ${activeNav === 'configuracion' ? 'active' : ''}`} 
                onClick={() => setActiveNav('configuracion')}
                style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left' }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
                <span>Configuración</span>
              </button>
            </div>
          </aside>

          {/* Main Canvas */}
          <main className="dashboard-main">
            {/* Header */}
            <header className="dashboard-header">
              <h2 className="header-portal-title">MINTUR Portal</h2>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <select className="region-selector" value={regionId} onChange={(e) => setRegionId(e.target.value)} title="Selector Global de Región" disabled={authUser.role !== 'superadmin'}>
                  {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>

                <div className="header-search-bar">
                  <span className="header-search-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  </span>
                  <input 
                    type="text" 
                    className="header-search-input" 
                    placeholder="Buscar datos..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="header-actions-right">
                <button 
                  className="btn-notification" 
                  onClick={() => triggerModal('Notificaciones', 'Tiene 5 solicitudes de validación de prestadores turísticos pendientes en el municipio San Cristóbal y Jáuregui.')}
                  title="Notificaciones"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                  <span className="notification-badge"></span>
                </button>

                {/* Profile widget shows user info */}
                <button 
                  className="header-profile-widget" 
                  onClick={() => triggerModal(
                    'Información del Usuario',
                    'Usuario: admin\nNombre: Lic. Ricardo Salas\nCargo: Director Regional\nCorreo: admin@cotatur.gob.ve\nRol: Administrador del Sistema'
                  )}
                  title="Información del usuario"
                >
                  <div className="profile-avatar-circle">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <div className="profile-info-text">
                    <span className="profile-name">Lic. Ricardo Salas</span>
                    <span className="profile-role">Director Regional</span>
                  </div>
                </button>

                {/* Logout button */}
                <button 
                  className="btn-logout-header" 
                  onClick={() => {
                    const conf = window.confirm('¿Desea cerrar la sesión y volver al inicio?')
                    if (conf) {
                      setCurrentView('login')
                    }
                  }}
                  title="Cerrar Sesión"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                </button>
              </div>
            </header>

            {/* Content Body */}
            <div className="dashboard-content">
              {(function() {
                switch(activeNav) {
                  case 'dashboard':
                    return <div className="dashboard-view">
                      <section className="dashboard-intro">
                        <div className="intro-text-block">
                          <h3>Panel de Gestión Georreferenciada</h3>
                          <p>Supervisión integral de la infraestructura turística - Mostrando: {regionName}.</p>
                        </div>
                        <div className="intro-controls-row">
                          <div className="timeframe-dropdown">
                            <button className="select-timeframe" onClick={() => setShowTimeframeMenu(p => !p)} onBlur={() => setTimeout(() => setShowTimeframeMenu(false), 200)}>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                              {currentTimeframeLabel}
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" style={{ marginLeft: '4px' }}><polyline points="6 9 12 15 18 9" /></svg>
                            </button>
                            {showTimeframeMenu && (
                              <div className="timeframe-menu">
                                {timeframeOptions.map(t => (
                                  <button key={t.value} className={`timeframe-menu-item ${timeframe === t.value ? 'active' : ''}`} onClick={() => { setTimeframe(t.value); setShowTimeframeMenu(false) }}>
                                    {t.value === '24h' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>}
                                    {t.value === 'week' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>}
                                    {t.value === '30d' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>}
                                    {t.value === '90d' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>}
                                    {t.label}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          <button className="btn-export" onClick={() => setShowExportModal(true)}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                            Exportar Reporte
                          </button>
                        </div>
                      </section>
                      <section className="metrics-grid">
                        <div className="corporations-row" style={{ marginBottom: '12px' }}>
                          <div className="corp-card">
                            <h4 className="corp-card-title">Corporaciones vinculadas</h4>
                            <p className="corp-card-sub">{regionId === 'national' ? 'Listado nacional de corporaciones regionales' : `Corporaciones en ${regionName}`}</p>
                            <div className="corp-chips">
                              {corporationsList.map((c, i) => <span key={i} className="corp-chip">{c}</span>)}
                              {corporationsList.length === 0 && <span className="corp-chip">Sin corporaciones registradas</span>}
                            </div>
                          </div>
                        </div>
                        <div className="metric-card"><div className="metric-data"><span className="metric-title">Prestadores Registrados</span><span className="metric-value">{totalRegisteredCount.toLocaleString()}</span><span className="metric-trend green">▲ +12% este mes</span></div><div className="metric-icon-box green"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg></div></div>
                        <div className="metric-card"><div className="metric-data"><span className="metric-title">Destinos Georreferenciados</span><span className="metric-value">{totalGeoreferencedCount}</span><span className="metric-trend blue">☉ 98% precisión GPS</span></div><div className="metric-icon-box blue"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" /><line x1="9" y1="3" x2="9" y2="18" /><line x1="15" y1="6" x2="15" y2="21" /></svg></div></div>
                        <div className="metric-card"><div className="metric-data"><span className="metric-title">Alertas Viales</span><span className="metric-value">{totalAlertsCount}</span><span className="metric-trend red">⚠ 5 críticas activas</span></div><div className="metric-icon-box red"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg></div></div>
                      </section>
                      <section className="charts-section">
                        <div className="chart-card"><h4 className="chart-title">Proveedores por Categoría</h4><div className="chart-bars">
                          <div className="chart-bar-item"><span className="chart-bar-label">Alojamiento</span><div className="chart-bar-track"><div className="chart-bar-fill green" style={{width:'75%'}}><span>75%</span></div></div></div>
                          <div className="chart-bar-item"><span className="chart-bar-label">Gastronomía</span><div className="chart-bar-track"><div className="chart-bar-fill blue" style={{width:'60%'}}><span>60%</span></div></div></div>
                          <div className="chart-bar-item"><span className="chart-bar-label">Agencias</span><div className="chart-bar-track"><div className="chart-bar-fill orange" style={{width:'40%'}}><span>40%</span></div></div></div>
                          <div className="chart-bar-item"><span className="chart-bar-label">Transporte</span><div className="chart-bar-track"><div className="chart-bar-fill teal" style={{width:'25%'}}><span>25%</span></div></div></div>
                          <div className="chart-bar-item"><span className="chart-bar-label">Guías</span><div className="chart-bar-track"><div className="chart-bar-fill purple" style={{width:'15%'}}><span>15%</span></div></div></div>
                        </div></div>
                        <div className="chart-card"><h4 className="chart-title">Estado de Validaciones</h4><div className="chart-donut">
                          <div className="donut-ring"><svg viewBox="0 0 36 36" className="donut-svg"><path className="donut-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" /><path className="donut-segment green" strokeDasharray="60,40" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" /><path className="donut-segment red" strokeDasharray="20,80" strokeDashoffset="-60" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" /><path className="donut-segment yellow" strokeDasharray="20,80" strokeDashoffset="-80" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" /></svg><div className="donut-center">{merchants.length}</div></div>
                          <div className="donut-legend"><div className="legend-item"><span className="legend-dot green"></span>Validados: {merchants.filter(m => m.status === 'validado').length}</div><div className="legend-item"><span className="legend-dot red"></span>Rechazados: {merchants.filter(m => m.status === 'rechazado').length}</div><div className="legend-item"><span className="legend-dot yellow"></span>Pendientes: {merchants.filter(m => m.status === 'pendiente').length}</div></div>
                        </div></div>
                        <div className="chart-card chart-card-full"><h4 className="chart-title">Actividad Reciente</h4><div className="timeline-chart">
                          <div className="timeline-item"><div className="timeline-dot green"></div><div className="timeline-content"><strong>Posada La Montaña</strong> fue validada <span className="timeline-date">hace 2 días</span></div></div>
                          <div className="timeline-item"><div className="timeline-dot red"></div><div className="timeline-content"><strong>Rutas del Páramo</strong> fue rechazada <span className="timeline-date">hace 3 días</span></div></div>
                          <div className="timeline-item"><div className="timeline-dot yellow"></div><div className="timeline-content"><strong>Sabores Tachirenses</strong> está pendiente <span className="timeline-date">hace 5 días</span></div></div>
                          <div className="timeline-item"><div className="timeline-dot green"></div><div className="timeline-content"><strong>Hotel Venetur Mérida</strong> fue validado <span className="timeline-date">hace 1 semana</span></div></div>
                          <div className="timeline-item"><div className="timeline-dot yellow"></div><div className="timeline-content"><strong>Restaurant El Criollo</strong> está pendiente <span className="timeline-date">hace 1 semana</span></div></div>
                        </div></div>
                      </section>
                      <section className="table-section">
                        <div className="table-section-header"><div className="table-header-title"><h4>Solicitudes de Proveedores</h4><p>Registros más recientes de prestadores turísticos.</p></div><div className="table-header-controls">
                          <button className="btn-table-control" onClick={() => triggerModal('Filtrar', 'Configuración de filtros avanzados para la tabla.')} title="Filtrar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" /><line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" /><line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" /><line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" /></svg></button>
                          <button className="btn-table-control" onClick={() => triggerModal('Acciones Adicionales', 'Opciones de edición en lote, eliminación o copiado.')} title="Más Opciones"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" /></svg></button>
                        </div></div>
                        <div className="table-responsive"><table className="dashboard-table"><thead><tr><th className="table-th">Nombre del Comercio</th><th className="table-th">RIF</th><th className="table-th">Fecha</th><th className="table-th">Estado</th><th className="table-th">Acciones</th></tr></thead><tbody>
                          {filteredMerchants.length === 0 ? (<tr><td colSpan="5" className="table-td" style={{textAlign:'center',color:'var(--color-text-light)'}}>No se encontraron registros.</td></tr>) : (
                            [...filteredMerchants].reverse().map((merchant) => (
                              <tr key={merchant.id}>
                                <td className="table-td"><div className="merchant-info-block"><div className="merchant-avatar-thumb" style={{display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px',fontWeight:'bold'}}>{merchant.category.includes('Alojamiento') ? '🏨' : merchant.category.includes('Gastronomía') ? '🍽️' : '✈️'}</div><div className="merchant-text-block"><h5 className="merchant-title-name">{merchant.name}</h5><span className="merchant-subtitle-category">{merchant.category}</span></div></div></td>
                                <td className="table-td" style={{fontFamily:'monospace',fontWeight:'500'}}>{merchant.rif}</td>
                                <td className="table-td">{merchant.date}</td>
                                <td className="table-td"><span className={'badge-status ' + merchant.status.toLowerCase()}>{merchant.status.toUpperCase()}</span></td>
                                <td className="table-td"><button className="btn-action-review" onClick={() => setReviewMerchant(merchant)}>Revisar</button></td>
                              </tr>
                            ))
                          )}
                        </tbody></table></div>
                        <div className="table-pagination-footer"><span className="pagination-info">Mostrando {filteredMerchants.length} de {merchants.length} solicitudes</span><div className="pagination-controls">
                          <button className="btn-page-arrow" disabled title="Anterior"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg></button>
                          <button className="btn-page-arrow" disabled title="Siguiente"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg></button>
                        </div></div>
                      </section>
                      <footer style={{marginTop:'24px',textAlign:'center',fontSize:'12px',color:'var(--color-text-light)'}}>© 2026 MINTUR - Ministerio del Poder Popular para el Turismo.</footer>
                    </div>
                  case 'destinos':
                    return <DestinosCRUD regionId={regionId} regionName={regionName} />
                  case 'route':
                    return <RouteDesigner regionId={regionId} regionName={regionName} />
                  case 'proveedores':
                    return <DirectorioProveedores regionId={regionId} regionName={regionName} />
                  case 'eventos':
                    return <GestionEventos regionId={regionId} regionName={regionName} />
                  case 'difusion':
                    return <CentroDifusion regionId={regionId} regionName={regionName} />
                  case 'soporte':
                    return <CentroSoporte regionId={regionId} regionName={regionName} />
                  case 'configuracion':
                    return <ConfiguracionSistema regionId={regionId} regionName={regionName} />
                   case 'validation':
                    return <div className="module-container">
                      <div className="module-header">
                        <div><h3 className="module-title">Validación de Prestadores</h3><p className="module-subtitle">Verificación de datos fiscales y físicos de prestadores registrados - Contexto: {regionName}.</p></div>
                        <div className="module-header-actions">
                          <button className="btn-export" style={{marginRight:'12px'}} onClick={() => setWizardOpen(true)}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                            Nuevo Prestador
                          </button>
                          <input type="text" className="module-search" placeholder="Buscar comercio o RIF..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                        </div>
                      </div>
                      {filteredMerchants.length === 0 ? (
                        <RegionOverviewCard moduleKey="proveedores" regionId={regionId} regionName={regionName} />
                      ) : (
                        <section className="table-section">
                          <div className="table-responsive"><table className="dashboard-table"><thead><tr><th className="table-th">Nombre del Comercio</th><th className="table-th">RIF</th><th className="table-th">Fecha</th><th className="table-th">Estado</th><th className="table-th">Acciones</th></tr></thead><tbody>
                            {[...filteredMerchants].reverse().map((merchant) => (
                              <tr key={merchant.id}>
                                <td className="table-td"><div className="merchant-info-block"><div className="merchant-avatar-thumb" style={{display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px',fontWeight:'bold'}}>{merchant.category.includes('Alojamiento') ? '🏨' : merchant.category.includes('Gastronomía') ? '🍽️' : '✈️'}</div><div className="merchant-text-block"><h5 className="merchant-title-name">{merchant.name}</h5><span className="merchant-subtitle-category">{merchant.category}</span></div></div></td>
                                <td className="table-td" style={{fontFamily:'monospace',fontWeight:'500'}}>{merchant.rif}</td>
                                <td className="table-td">{merchant.date}</td>
                                <td className="table-td"><span className={'badge-status ' + merchant.status.toLowerCase()}>{merchant.status.toUpperCase()}</span></td>
                                <td className="table-td"><button className="btn-action-review" onClick={() => setReviewMerchant(merchant)}>Revisar</button></td>
                              </tr>
                            ))}
                          </tbody></table></div>
                        </section>
                      )}
                    </div>
                  case 'regiones':
                    return <div className="module-container">
                      <RegionOverviewCard moduleKey="destinos" regionId={regionId} regionName={regionName} />
                    </div>
                  default:
                    return <div className="module-container">
                      <RegionOverviewCard moduleKey="destinos" regionId={regionId} regionName={regionName} />
                    </div>
                }
              })()}
            </div>
          </main>
        </motion.div>
      )}
      </AnimatePresence>

      {/* Review Modal */}
      <AnimatePresence>
      {reviewMerchant && (
        <motion.div
          key="review-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="modal-overlay"
          onClick={() => setReviewMerchant(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Validar Proveedor Turístico</h3>
              <button className="modal-close-btn" onClick={() => setReviewMerchant(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: '14px', fontWeight: '500' }}>Revise los datos del prestador para aprobar o rechazar su solicitud en el sistema georreferenciado:</p>
              
              <div className="modal-details-card">
                <div className="detail-row">
                  <span className="detail-label">Comercio:</span>
                  <span className="detail-value" style={{ fontWeight: '600' }}>{reviewMerchant.name}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Categoría:</span>
                  <span className="detail-value">{reviewMerchant.category}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">RIF:</span>
                  <span className="detail-value" style={{ fontFamily: 'monospace' }}>{reviewMerchant.rif}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Fecha Reg:</span>
                  <span className="detail-value">{reviewMerchant.date}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Estado Actual:</span>
                  <span className="detail-value" style={{ textTransform: 'uppercase', fontWeight: 'bold', color: reviewMerchant.status === 'pendiente' ? '#ba1a1a' : reviewMerchant.status === 'validado' ? 'var(--color-primary)' : '#E52320' }}>{reviewMerchant.status}</span>
                </div>
              </div>
            </div>
            <div className="modal-footer" style={{ gap: '12px' }}>
              <div className="modal-review-actions">
                <button className="btn-modal-action approve" onClick={() => handleReviewAction(reviewMerchant.id, 'validado')}>Aprobar Registro</button>
                <button className="btn-modal-action reject" onClick={() => handleReviewAction(reviewMerchant.id, 'rechazado')}>Rechazar</button>
                <button className="btn-modal-action cancel" onClick={() => setReviewMerchant(null)}>Cerrar</button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* Add Merchant Modal */}
      <AnimatePresence>
      {isAddModalOpen && (
        <motion.div
          key="add-merchant-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="modal-overlay"
          onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Agregar Punto Turístico</h3>
              <button className="modal-close-btn" onClick={() => setIsAddModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleAddMerchantSubmit}>
              <div className="modal-body">
                <div className="form-modal-group">
                  <label htmlFor="modal-name">Nombre del Establecimiento *</label>
                  <input 
                    id="modal-name" 
                    type="text" 
                    className="form-modal-input" 
                    placeholder="Ej. Posada El Encanto"
                    required
                    value={newMerchant.name}
                    onChange={(e) => setNewMerchant(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                
                <div className="form-modal-group">
                  <label htmlFor="modal-category">Categoría</label>
                  <select 
                    id="modal-category" 
                    className="form-modal-select"
                    value={newMerchant.category}
                    onChange={(e) => setNewMerchant(prev => ({ ...prev, category: e.target.value }))}
                  >
                    <option value="Alojamiento Turístico">🏨 Alojamiento Turístico</option>
                    <option value="Gastronomía Regional">🍽️ Gastronomía Regional</option>
                    <option value="Agencia de Viajes">✈️ Agencia de Viajes</option>
                  </select>
                </div>

                <div className="form-modal-group">
                  <label htmlFor="modal-rif">RIF (Registro Fiscal) *</label>
                  <input 
                    id="modal-rif" 
                    type="text" 
                    className="form-modal-input" 
                    placeholder="Ej. J-12345678-9"
                    required
                    value={newMerchant.rif}
                    onChange={(e) => setNewMerchant(prev => ({ ...prev, rif: e.target.value }))}
                  />
                </div>
              </div>
              <div className="modal-footer" style={{ gap: '12px' }}>
                <button type="submit" className="btn-modal-action approve">Guardar y Crear</button>
                <button type="button" className="btn-modal-action cancel" onClick={() => setIsAddModalOpen(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* Export Modal */}
      <AnimatePresence>
      {showExportModal && (
        <motion.div
          key="export-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="modal-overlay"
          onClick={() => setShowExportModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Exportar Reporte</h3>
              <button className="modal-close-btn" onClick={() => setShowExportModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: '16px' }}>Seleccione el formato para exportar los datos actuales:</p>
              <div className="export-options">
                <button className="export-option-btn" onClick={() => { setShowExportModal(false); triggerModal('Reporte Exportado', 'El archivo PDF ha sido generado exitosamente con los datos de prestadores, destinos y estadísticas.') }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="28" height="28"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
                  <span className="export-option-label">PDF</span>
                  <span className="export-option-desc">Documento portátil con gráficos y tablas</span>
                </button>
                <button className="export-option-btn" onClick={() => { setShowExportModal(false); triggerModal('Reporte Exportado', 'El archivo Excel (.xlsx) ha sido generado con los datos tabulados de prestadores turísticos.') }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="28" height="28"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="8" y1="16" x2="16" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>
                  <span className="export-option-label">Excel</span>
                  <span className="export-option-desc">Hoja de cálculo con datos exportables</span>
                </button>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-modal-action cancel" onClick={() => setShowExportModal(false)}>Cancelar</button>
            </div>
          </div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* Premium Notification Modal Overlay */}
      <AnimatePresence>
      {modalInfo.isOpen && (
        <motion.div
          key="notification-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="modal-overlay"
          onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{modalInfo.title}</h3>
              <button className="modal-close-btn" onClick={closeModal} aria-label="Cerrar">
                &times;
              </button>
            </div>
            <div className="modal-body">
              <p>{modalInfo.message}</p>
            </div>
            <div className="modal-footer">
              <button className="modal-action-btn" onClick={closeModal}>
                Entendido
              </button>
            </div>
          </div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* Validation Wizard */}
      <ValidationWizard isOpen={wizardOpen} onClose={() => setWizardOpen(false)} onSubmit={handleWizardSubmit} regionId={regionId} regionName={regionName} />

      {/* Inline styles for the modal structure */}
      <style>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(76, 140, 36, 0.35);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.2s ease-out;
        }

        .modal-content {
          background: var(--color-white);
          border-radius: 20px;
          width: 90%;
          max-width: 460px;
          box-shadow: var(--shadow-premium-lg);
          border: 1px solid rgba(76, 140, 36, 0.12);
          overflow: hidden;
          animation: scaleIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.15);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid rgba(76, 140, 36, 0.08);
        }

        .modal-title {
          font-size: 17px;
          font-weight: 700;
          color: var(--color-primary);
          margin: 0;
          letter-spacing: -0.3px;
        }

        .modal-close-btn {
          background: none;
          border: none;
          font-size: 24px;
          color: var(--color-text-muted);
          cursor: pointer;
          line-height: 1;
          padding: 0;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--transition-fast);
        }

        .modal-close-btn:hover {
          color: var(--color-primary);
          background-color: rgba(76, 140, 36, 0.06);
        }

        .modal-body {
          padding: 24px;
          font-size: 14.5px;
          color: var(--color-text-muted);
          line-height: 1.7;
          text-align: left;
        }

        .modal-footer {
          padding: 16px 24px;
          border-top: 1px solid rgba(76, 140, 36, 0.08);
          display: flex;
          justify-content: flex-end;
        }

        .modal-action-btn {
          background: var(--gradient-primary);
          color: var(--color-white);
          border: none;
          border-radius: 10px;
          padding: 10px 24px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: var(--shadow-button);
          transition: box-shadow var(--transition-fast), transform var(--transition-fast);
        }

        .modal-action-btn:hover {
          box-shadow: var(--shadow-button-hover);
          transform: translateY(-1px);
        }

        .modal-action-btn:active {
          transform: scale(0.97);
        }
      `}</style>
    </div>
  )
}

export default App
