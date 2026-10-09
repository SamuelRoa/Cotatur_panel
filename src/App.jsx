import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { jsPDF } from 'jspdf'
import cotaturLogo from './assets/cotatur_logo.png'
import './App.css'
import DestinosCRUD from './components/DestinosCRUD.jsx'
import RouteDesigner from './components/RouteDesigner.jsx'
import DirectorioProveedores from './components/DirectorioProveedores.jsx'
import GestionEventos from './components/GestionEventos.jsx'
import CentroDifusion from './components/CentroDifusion.jsx'
import GestionCMS from './components/GestionCMS.jsx'
import CentroSoporte from './components/CentroSoporte.jsx'
import ConfiguracionSistema from './components/ConfiguracionSistema.jsx'
import ValidationWizard from './components/ValidationWizard.jsx'
import RegionOverviewCard from './components/RegionOverviewCard.jsx'
import { NotificationCenter } from './components/NotificationCenter.jsx'
import { useRegion } from './RegionContext.jsx'
import { useTheme } from './hooks/useTheme.js'
import {
  IconSun, IconMoon, IconMonitor, IconDot, IconTrend, IconPin,
  CategoryIcon, IconCheck,
} from './components/Icons.jsx'
import { destinosService } from './services/destinos'
import { prestadoresService } from './services/prestadores'
import { eventosService } from './services/eventos'
import { rutasService } from './services/rutas'
import { usuariosService } from './services/usuarios'
import { connectSocket, disconnectSocket } from './services/socket'

function App() {
  // Form states (Login)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showRegPassword, setShowRegPassword] = useState(false)
  const [showRegConfirm, setShowRegConfirm] = useState(false)
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

  // Auth & Region state from context
  const { regions, regionId, regionName, setRegionId, role, loading: regionsLoading } = useRegion()
  const { mode: themeMode, cycle: cycleTheme } = useTheme()
  const themeLabel = themeMode === 'claro' ? 'Modo claro' : themeMode === 'oscuro' ? 'Modo oscuro' : 'Según sistema'
  const ThemeIcon = themeMode === 'claro' ? IconSun : themeMode === 'oscuro' ? IconMoon : IconMonitor

  // Auto-login si hay token guardado y sigue siendo válido
  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    if (!token) return
    import('./services/auth').then(({ authService }) =>
      authService.getMe().then(() => {
        setCurrentView('dashboard')
        connectSocket(token)
      }).catch(() => {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
      })
    )
  }, [])
  // Dashboard data from API
  const [dashboardStats, setDashboardStats] = useState({ destinos: 0, prestadores: 0, eventos: 0, usuarios: 0, rutas: 0 })
  const [merchants, setMerchants] = useState([])
  const [destinosList, setDestinosList] = useState([])
  const [eventosList, setEventosList] = useState([])
  const [rutasList, setRutasList] = useState([])
  const [user, setUser] = useState(null)
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, content: '' })
  const [tablePage, setTablePage] = useState(1)
  const [tableSearch, setTableSearch] = useState('')
  const [tableMerchants, setTableMerchants] = useState([])
  const [tableTotalItems, setTableTotalItems] = useState(0)
  const [tableTotalPages, setTableTotalPages] = useState(1)
  const [tableLoading, setTableLoading] = useState(false)
  const [pendingPage, setPendingPage] = useState(1)
  const [pendingTotalPages, setPendingTotalPages] = useState(1)
  const [pendingTotalItems, setPendingTotalItems] = useState(0)
  const [pendingMerchantsList, setPendingMerchantsList] = useState([])

  useEffect(() => {
    const stored = localStorage.getItem('auth_user')
    if (stored) {
      try { setUser(JSON.parse(stored)) } catch { /* ignore */ }
    }
  }, [])
  const [loadingData, setLoadingData] = useState(true)
  const [pendingCount, setPendingCount] = useState(0)
  const [notificationMsg, setNotificationMsg] = useState('')
  
  useEffect(() => {
    if (regionsLoading) return
    const params = regionId ? { regionId } : {}
    setLoadingData(true)
    Promise.all([
      destinosService.getAll(params).catch(() => ({ destinos: [], meta: { total: 0 } })),
      prestadoresService.getAll(params).catch(() => ({ prestadores: [], meta: { total: 0 } })),
      eventosService.getAll(params).catch(() => ({ eventos: [], meta: { total: 0 } })),
      rutasService.getAll(params).catch(() => ({ rutas: [], meta: { total: 0 } })),
      usuariosService.getAll().catch(() => ({ usuarios: [], meta: { total: 0 } })),
      prestadoresService.getAll({ limit: 1, estado: 'pend' }).catch(() => ({ prestadores: [], meta: { total: 0 } })),
    ]).then(([destinosRes, prestadoresRes, eventosRes, rutasRes, usuariosRes, pendientesRes]) => {
      const destinos = destinosRes.destinos || destinosRes.data?.destinos || []
      const prestadores = prestadoresRes.prestadores || prestadoresRes.data?.prestadores || []
      const eventos = eventosRes.eventos || eventosRes.data?.eventos || []
      const rutas = rutasRes.rutas || rutasRes.data?.rutas || []
      const usuarios = usuariosRes.usuarios || usuariosRes.data?.usuarios || []
      setDashboardStats({
        destinos: destinos.length,
        prestadores: prestadores.length,
        eventos: eventos.length,
        rutas: rutas.length,
        usuarios: usuarios.length,
      })
      setMerchants(prestadores)
      setDestinosList(destinos)
      setEventosList(eventos)
      setRutasList(rutas)
      const pendientesMeta = pendientesRes.meta?.total ?? 0
      setPendingCount(pendientesMeta)
      setLoadingData(false)
    }).catch(() => setLoadingData(false))
  }, [regionId, regionsLoading])

  const fetchTableData = async (page, search) => {
    setTableLoading(true)
    try {
      const params = { page, limit: 10 }
      if (regionId) params.regionId = regionId
      if (search) params.search = search
      const res = await prestadoresService.getAll(params)
      const items = res.prestadores || []
      const total = res.meta?.total ?? items.length
      setTableMerchants(items)
      setTableTotalItems(total)
      setTableTotalPages(Math.max(1, Math.ceil(total / 10)))
    } catch {
      setTableMerchants([])
      setTableTotalItems(0)
      setTableTotalPages(1)
    }
    setTableLoading(false)
  }

  const fetchPending = async (page, search) => {
    try {
      const params = { page, limit: 10, estado: 'pend' }
      if (regionId) params.regionId = regionId
      if (search) params.search = search
      const res = await prestadoresService.getAll(params)
      const items = res.prestadores || []
      const total = res.meta?.total ?? items.length
      setPendingMerchantsList(items)
      setPendingTotalItems(total)
      setPendingTotalPages(Math.max(1, Math.ceil(total / 10)))
    } catch {
      setPendingMerchantsList([])
      setPendingTotalItems(0)
      setPendingTotalPages(1)
    }
  }

  useEffect(() => {
    if (activeNav === 'dashboard') {
      fetchTableData(tablePage, tableSearch)
    }
  }, [tablePage, tableSearch, regionId, activeNav])

  useEffect(() => {
    if (activeNav === 'validation') {
      fetchPending(pendingPage, searchQuery)
    }
  }, [pendingPage, searchQuery, regionId, activeNav])

  // Socket.io: escuchar nuevos prestadores en tiempo real
  useEffect(() => {
    const socket = connectSocket(localStorage.getItem('auth_token'))
    if (!socket) return

    const handleNewPrestador = (data) => {
      setPendingCount((prev) => prev + 1)
      setNotificationMsg(`Nuevo prestador registrado: ${data.nombre}`)
      setPendingMerchantsList((prev) => [data, ...prev])
      setPendingTotalItems((prev) => prev + 1)
    }

    socket.on('new-prestador', handleNewPrestador)
    return () => {
      socket.off('new-prestador', handleNewPrestador)
    }
  }, [])

  // Polling de respaldo cada 30s (por si Socket.io se desconecta)
  useEffect(() => {
    const interval = setInterval(async () => {
      const token = localStorage.getItem('auth_token')
      if (!token || currentView !== 'dashboard') return
      try {
        const params = { limit: 1, estado: 'pend' }
        if (regionId) params.regionId = regionId
        const res = await prestadoresService.getAll(params)
        const total = res.meta?.total ?? 0
        setPendingCount(total)
      } catch {
        // ignorar errores de polling
      }
    }, 30000)
    return () => clearInterval(interval)
  }, [regionId, currentView])

  // Modal states
  const [reviewMerchant, setReviewMerchant] = useState(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newMerchant, setNewMerchant] = useState({ name: '', category: 'Alojamiento Turístico', rif: '' })
  
  // Interactive Modal Notification State
  const [modalInfo, setModalInfo] = useState({ isOpen: false, title: '', message: '' })
  
  // PDF export state
  const [exportingPdf, setExportingPdf] = useState(false)

  // Validation wizard state
  const [wizardOpen, setWizardOpen] = useState(false)

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')

    const { loginSchema, zodErrors } = await import('./schemas/entidades')
    const errs = zodErrors(loginSchema.safeParse({ email: username.trim(), password }))
    if (Object.keys(errs).length > 0) {
      setErrorMsg(Object.values(errs)[0])
      return
    }

    try {
      const { authService } = await import('./services/auth')
      const res = await authService.login({ email: username.trim().toLowerCase(), password })
      localStorage.setItem('auth_token', res.data.accessToken)
      if (res.data.refreshToken) localStorage.setItem('auth_refresh', res.data.refreshToken)
      localStorage.setItem('auth_user', JSON.stringify(res.data.usuario))
      setUser(res.data.usuario)
      setCurrentView('dashboard')
      setUsername('')
      setPassword('')
      connectSocket(res.data.accessToken)
    } catch (err) {
      setErrorMsg(err.message || 'Credenciales incorrectas')
    }
  }

  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    setRegErrorMsg('')

    const { registerSchema, zodErrors } = await import('./schemas/entidades')
    const errs = zodErrors(registerSchema.safeParse({
      nombre: regFullName.trim(), email: regEmail.trim(), password: regPassword,
    }))
    if (Object.keys(errs).length > 0) {
      setRegErrorMsg(Object.values(errs)[0])
      return
    }

    if (!regUsername.trim() || !regConfirmPassword.trim()) {
      setRegErrorMsg('Por favor, complete todos los campos.')
      return
    }

    if (regPassword !== regConfirmPassword) {
      setRegErrorMsg('Las claves ingresadas no coinciden.')
      return
    }

    try {
      const { authService } = await import('./services/auth')
      const res = await authService.register({
        nombre: regFullName.trim(),
        email: regEmail.trim().toLowerCase(),
        password: regPassword,
      })
      if (res.data?.accessToken) localStorage.setItem('auth_token', res.data.accessToken)
      if (res.data?.refreshToken) localStorage.setItem('auth_refresh', res.data.refreshToken)
      if (res.data?.usuario) {
        localStorage.setItem('auth_user', JSON.stringify(res.data.usuario))
        connectSocket(res.data.accessToken)
      }

      setRegFullName('')
      setRegEmail('')
      setRegUsername('')
      setRegPassword('')
      setRegConfirmPassword('')

      setCurrentView('login')
      setUsername(res.data?.usuario?.email || res.data?.USUAR_EM || regEmail.trim())

      triggerModal(
        'Registro Exitoso',
        `¡Su cuenta ha sido creada! Ya puede iniciar sesión.`
      )
    } catch (err) {
      setRegErrorMsg(err.message || 'Error al registrar')
    }
  }

  const triggerModal = (title, message) => {
    setModalInfo({ isOpen: true, title, message })
  }

  const closeModal = () => {
    setModalInfo({ isOpen: false, title: '', message: '' })
  }

  const handleReviewAction = async (id, newStatus) => {
    try {
      await prestadoresService.updateEstado(id, newStatus)
      setMerchants(prev => prev.map(m => m.id === id ? { ...m, status: newStatus } : m))
      setReviewMerchant(null)
      fetchTableData(tablePage, tableSearch)
      fetchPending(pendingPage, searchQuery)
      triggerModal(
        newStatus === 'validado' ? 'Solicitud Aprobada' : 'Solicitud Rechazada',
        `El prestador turístico ha sido marcado como ${newStatus.toUpperCase()} exitosamente.`
      )
    } catch (err) {
      triggerModal('Error', err.message || 'Error al actualizar estado')
    }
  }

  const handleWizardSubmit = async (merchantData) => {
    const tipoMap = {
      'Alojamiento Turístico': 'hosped',
      'Gastronomía Regional': 'rest',
      'Agencia de Viajes': 'agencia',
      'Transporte Turístico': 'transp',
      'Guía de Turismo': 'guia',
    }
    let payload = {
      nombre: merchantData.name,
      tipo: tipoMap[merchantData.category] || merchantData.category,
      rif: merchantData.rif,
    }
    if (merchantData.email) payload.email = merchantData.email
    if (merchantData.phone) payload.telefono = merchantData.phone
    if (merchantData.address) payload.direccion = merchantData.address
    if (merchantData.municipioId) payload.municipioId = parseInt(merchantData.municipioId)
    if (merchantData.coordinates) {
      const coords = merchantData.coordinates.match(/(-?\d+\.?\d*)/g)
      if (coords && coords.length >= 2) {
        payload.lat = parseFloat(coords[0])
        payload.lon = parseFloat(coords[1])
      }
    }
    try {
      await prestadoresService.create(payload)
      triggerModal('Registro Exitoso', `El prestador "${merchantData.name}" ha sido registrado y enviado para validación.`)
    } catch (err) {
      triggerModal('Error', err.message || 'Error al registrar prestador')
      return
    }
    try {
      const params = regionId ? { regionId } : {}
      const res = await prestadoresService.getAll(params)
      setMerchants(res.prestadores || [])
      fetchTableData(tablePage, tableSearch)
    } catch {}
  }

  const handleExportPdf = () => {
    setExportingPdf(true)
    try {
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageW = pdf.internal.pageSize.getWidth()
      const marg = 14
      const maxW = pageW - marg * 2
      let y = 20

      const title = (t, s = 16) => { pdf.setFontSize(s); pdf.setFont(undefined, 'bold'); pdf.text(t, marg, y); y += 6 }
      const subtitle = (t) => { pdf.setFontSize(11); pdf.setFont(undefined, 'bold'); pdf.setTextColor(80, 80, 80); pdf.text(t, marg, y); y += 5; pdf.setTextColor(0, 0, 0) }
      const line = (t) => { pdf.setFontSize(10); pdf.setFont(undefined, 'normal'); const lines = pdf.splitTextToSize(t, maxW); pdf.text(lines, marg, y); y += lines.length * 4.5 + 1 }
      const blank = (h = 4) => { y += h }
      const hr = () => { y += 2; pdf.setDrawColor(200, 200, 200); pdf.line(marg, y, pageW - marg, y); y += 4 }

      const dateStr = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

      title('Reporte del Dashboard', 18)
      line(`Sistema de Gesti\u00f3n Tur\u00edstica COTATUR`)
      line(`Generado: ${dateStr}${regionId ? ` — Regi\u00f3n: ${regionName}` : ' — Visi\u00f3n Nacional'}`)
      blank()
      hr()

      subtitle('1. Resumen General')
      line(`Destinos Georreferenciados: ${totalGeoreferencedCount}`)
      line(`Prestadores Registrados: ${totalRegisteredCount}`)
      line(`Eventos Programados: ${dashboardStats.eventos}`)
      line(`Rutas Tur\u00edsticas: ${totalRutasCount}`)
      blank()
      hr()

      subtitle('2. Proveedores por Categor\u00eda')
      const catEntries = Object.entries(categoryCounts)
      if (catEntries.length === 0) {
        line('No hay proveedores registrados.')
      } else {
        for (const [cat, count] of catEntries) {
          line(`${catLabels[cat] || cat}: ${count}`)
        }
      }
      blank()
      hr()

      subtitle('3. Estado de Validaciones')
      line(`Validados: ${validados}`)
      line(`Rechazados: ${rechazados}`)
      line(`Pendientes: ${pendientes}`)
      blank()
      hr()

      subtitle('4. Destinos por Regi\u00f3n')
      const destRegionEntries = Object.entries(destinosByRegion)
      if (destRegionEntries.length === 0) {
        line('No hay destinos registrados.')
      } else {
        for (const [reg, count] of destRegionEntries) {
          line(`${reg}: ${count} destino${count !== 1 ? 's' : ''}`)
        }
      }
      blank()
      hr()

      subtitle('5. Rutas por Regi\u00f3n')
      const rutaRegionEntries = Object.entries(rutasByRegion)
      if (rutaRegionEntries.length === 0) {
        line('No hay rutas registradas.')
      } else {
        for (const [reg, count] of rutaRegionEntries) {
          line(`${reg}: ${count} ruta${count !== 1 ? 's' : ''}`)
        }
      }
      blank()
      hr()

      subtitle('6. Eventos')
      line(`Este mes: ${eventosEsteMes}`)
      line(`Pr\u00f3ximos: ${eventosProximos}`)
      line(`Pasados: ${eventosPasados}`)
      blank()
      hr()

      y += 4
      pdf.setFontSize(8)
      pdf.setTextColor(150, 150, 150)
      pdf.text(`Reporte generado autom\u00e1ticamente por COTATUR — ${new Date().toISOString().slice(0, 10)}`, marg, y)

      pdf.save(`Reporte-COTATUR-${new Date().toISOString().slice(0, 10)}.pdf`)
    } catch (err) {
      triggerModal('Error', 'Error al generar PDF: ' + err.message)
    }
    setExportingPdf(false)
  }

  const handleAddMerchantSubmit = async (e) => {
    e.preventDefault()
    if (!newMerchant.name.trim() || !newMerchant.rif.trim()) {
      alert('Por favor complete los campos obligatorios.')
      return
    }
    try {
      const tipoMap = {
        'Alojamiento Turístico': 'hosped',
        'Gastronomía Regional': 'rest',
        'Agencia de Viajes': 'agencia',
        'Transporte Turístico': 'transp',
        'Guía de Turismo': 'guia',
      }
      await prestadoresService.create({
        nombre: newMerchant.name,
        tipo: tipoMap[newMerchant.category] || newMerchant.category,
        rif: newMerchant.rif,
      })
      const params = regionId ? { regionId } : {}
      const res = await prestadoresService.getAll(params)
      setMerchants(res.prestadores || [])
      fetchTableData(tablePage, tableSearch)
      setIsAddModalOpen(false)
      setNewMerchant({ name: '', category: 'Alojamiento Turístico', rif: '' })
      triggerModal(
        'Punto Registrado',
        `El prestador "${newMerchant.name}" ha sido ingresado como PENDIENTE de validación.`
      )
    } catch (err) {
      triggerModal('Error', err.message || 'Error al registrar prestador')
    }
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

  const filteredMerchants = merchants.filter(m => {
    const name = (m.PROV_NOM || m.name || '').toLowerCase()
    const rif = (m.PROV_RIF || m.rif || '').toLowerCase()
    const category = (m.PROV_TSE || m.category || '').toLowerCase()
    const q = searchQuery.toLowerCase()
    return (!q || name.includes(q) || rif.includes(q) || category.includes(q))
  })

  const pendingMerchants = merchants.filter(m => {
    const status = (m.status || '').toLowerCase()
    if (status !== 'pendiente') return false
    const name = (m.PROV_NOM || m.name || '').toLowerCase()
    const rif = (m.PROV_RIF || m.rif || '').toLowerCase()
    const category = (m.PROV_TSE || m.category || '').toLowerCase()
    const q = searchQuery.toLowerCase()
    return (!q || name.includes(q) || rif.includes(q) || category.includes(q))
  })

  const totalRegisteredCount = dashboardStats.prestadores
  const totalGeoreferencedCount = dashboardStats.destinos
  const totalAlertsCount = 0

  const categoryCounts = {}
  for (const m of merchants) {
    const cat = m.category || 'Otros'
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1
  }
  const maxCatCount = Math.max(...Object.values(categoryCounts), 1)
  const catColors = {
    'Alojamiento Turístico': 'green',
    'Gastronomía Regional': 'blue',
    'Agencia de Viajes': 'orange',
    'Transporte Turístico': 'teal',
    'Guía de Turismo': 'purple',
    'Otros': 'gray',
  }
  const catLabels = {
    'Alojamiento Turístico': 'Alojamiento',
    'Gastronomía Regional': 'Gastronomía',
    'Agencia de Viajes': 'Agencias',
    'Transporte Turístico': 'Transporte',
    'Guía de Turismo': 'Guías',
    'Otros': 'Otros',
  }

  const validados = merchants.filter(m => m.status === 'validado').length
  const rechazados = merchants.filter(m => m.status === 'rechazado').length
  const pendientes = merchants.filter(m => m.status === 'pendiente').length
  const totalStatus = validados + rechazados + pendientes || 1
  const validadosPct = Math.round(validados / totalStatus * 100)
  const rechazadosPct = Math.round(rechazados / totalStatus * 100)
  const pendientesPct = Math.round(pendientes / totalStatus * 100)

  const totalRutasCount = dashboardStats.rutas

  const destinosByRegion = {}
  for (const d of destinosList) {
    const rId = d.regionId
    if (rId) {
      const reg = regions.find(r => r.id === rId)
      const name = reg ? reg.name : `Región ${rId}`
      destinosByRegion[name] = (destinosByRegion[name] || 0) + 1
    }
  }
  const maxDestinosRegion = Math.max(...Object.values(destinosByRegion), 1)

  const rutasByRegion = {}
  for (const r of rutasList) {
    const firstDest = (r.destinos || [])[0]
    const rId = firstDest?.regionId
    if (rId) {
      const reg = regions.find(reg => reg.id === rId)
      const name = reg ? reg.name : `Región ${rId}`
      rutasByRegion[name] = (rutasByRegion[name] || 0) + 1
    }
  }
  const maxRutasRegion = Math.max(...Object.values(rutasByRegion), 1)

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const eventosEsteMes = eventosList.filter(e => {
    const d = new Date(e.date)
    return d >= startOfMonth && d < startOfNextMonth
  }).length
  const eventosProximos = eventosList.filter(e => new Date(e.date) >= startOfNextMonth).length
  const eventosPasados = eventosList.filter(e => new Date(e.date) < startOfMonth).length
  const totalEventos = eventosEsteMes + eventosProximos + eventosPasados || 1
  const eventosEsteMesPct = Math.round(eventosEsteMes / totalEventos * 100)
  const eventosProximosPct = Math.round(eventosProximos / totalEventos * 100)
  const eventosPasadosPct = Math.round(eventosPasados / totalEventos * 100)

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
          <button className="theme-fab" onClick={cycleTheme} title={`Tema: ${themeLabel}. Clic para cambiar.`} aria-label={`Cambiar tema. Actual: ${themeLabel}`}>
            <ThemeIcon size={20} />
          </button>
          <div className="aurora" aria-hidden="true">
            <span className="aurora-blob a1" />
            <span className="aurora-blob a2" />
            <span className="aurora-blob a3" />
          </div>
          {/* Main Login Card */}
          <div className="login-card">
            {/* Multicolored strip matching logo */}
            <div className="mosaic-strip"></div>
            
            {/* Header and Form Area */}
            <div className="login-card-main">
              {/* Brand Logo Image */}
              <div className="brand-logo-container">
                <div style={{fontSize:42,fontWeight:700,color:'var(--color-primary)'}} className="font-display">MINTUR</div>
              </div>
              <h2 className="brand-subtitle">Plataforma Georreferenciada Nacional</h2>

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

        </motion.div>
      ) : currentView === 'register' ? (
        <motion.div
          key="register"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="login-screen">
          <button className="theme-fab" onClick={cycleTheme} title={`Tema: ${themeLabel}. Clic para cambiar.`} aria-label={`Cambiar tema. Actual: ${themeLabel}`}>
            <ThemeIcon size={20} />
          </button>
          {/* Main Registration Card */}
          <div className="login-card">
            {/* Multicolored strip matching logo */}
            <div className="mosaic-strip"></div>
            
            {/* Header and Form Area */}
            <div className="login-card-main">
              {/* Brand Logo Image */}
              <div className="brand-logo-container">
                <div style={{fontSize:42,fontWeight:700,color:'var(--color-primary)'}} className="font-display">MINTUR</div>
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
                      type={showRegPassword ? 'text' : 'password'}
                      className="form-input form-input-password"
                      placeholder="Mínimo 6 caracteres"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      aria-label={showRegPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {showRegPassword ? (
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
                      type={showRegConfirm ? 'text' : 'password'}
                      className="form-input form-input-password"
                      placeholder="Repita la contraseña"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowRegConfirm(!showRegConfirm)}
                      aria-label={showRegConfirm ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {showRegConfirm ? (
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
              <span className="sidebar-logo-text font-display">MINTUR</span>
              <p className="sidebar-brand-sub">{!regionId ? 'Turismo Nacional VZLA' : regionName}</p>
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
                className={`sidebar-nav-item ${activeNav === 'cms' ? 'active' : ''}`}
                onClick={() => setActiveNav('cms')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
                </svg>
                <span>CMS Web</span>
              </button>
              <button 
                className={`sidebar-nav-item ${activeNav === 'validation' ? 'active' : ''}`}
                onClick={() => { setActiveNav('validation'); setPendingCount(0) }}
                style={{ position: 'relative' }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <span>Validación</span>
                {pendingCount > 0 && (
                  <span className="sidebar-badge">{pendingCount}</span>
                )}
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
              <button 
                className={`sidebar-nav-item ${activeNav === 'soporte' ? 'active' : ''}`} 
                onClick={() => setActiveNav('soporte')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <span>Soporte</span>
              </button>
              {(user?.rol === 'Administrador' || (user?.rolId ?? 55) === 55) && (
                <button 
                  className={`sidebar-nav-item ${activeNav === 'configuracion' ? 'active' : ''}`} 
                  onClick={() => setActiveNav('configuracion')}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                  <span>Configuración</span>
                </button>
              )}
            </div>
          </aside>

          {/* Main Canvas */}
          <main className="dashboard-main">
            {/* Header */}
            <header className="dashboard-header">
              <h2 className="header-portal-title">MINTUR Portal</h2>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <select className="region-selector" value={regionId ?? ''} onChange={(e) => setRegionId(e.target.value ? parseInt(e.target.value) : null)} title="Selector Global de Región" disabled={!(user?.rol === 'Administrador' || (user?.rolId ?? 55) === 55)}>
                  {regions.map(r => <option key={r.id ?? 'national'} value={r.id ?? ''}>{r.name}</option>)}
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
                  className="btn-notification btn-theme-toggle"
                  onClick={cycleTheme}
                  title={`Tema: ${themeLabel}. Clic para cambiar.`}
                  aria-label={`Cambiar tema. Actual: ${themeLabel}`}
                >
                  <ThemeIcon size={18} />
                </button>
                <NotificationCenter pendingCount={pendingCount} />

                {/* Profile widget shows user info */}
                <button 
                  className="header-profile-widget" 
                  onClick={() => triggerModal(
                    'Información del Usuario',
                    user ? `Usuario: ${user.email || user.username || '—'}\nNombre: ${user.nombre || user.fullName || '—'}\nCargo: ${user.cargo || '—'}\nCorreo: ${user.email || '—'}\nRol: ${user.rol || role || '—'}`
                          : 'Usuario no identificado'
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
                    <span className="profile-name">{user?.nombre || user?.fullName || user?.email || 'Usuario'}</span>
                    <span className="profile-role">{user?.cargo || user?.rol || role || '—'}</span>
                  </div>
                </button>

                {/* Logout button */}
                <button 
                  className="btn-logout-header" 
                  onClick={() => {
                    disconnectSocket()
                    localStorage.removeItem('auth_token')
                    localStorage.removeItem('auth_user')
                    setUser(null)
                    setCurrentView('login')
                    setPendingCount(0)
                    setNotificationMsg('')
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
                          <button className="btn-export" onClick={handleExportPdf} disabled={exportingPdf}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                            {exportingPdf ? 'Generando...' : 'Descargar Reporte'}
                          </button>
                        </div>
                      </section>
                      <section className="metrics-grid">
                        <div className="corporations-row" style={{ marginBottom: '12px' }}>
                          <div className="corp-card">
                            <h4 className="corp-card-title">Resumen Regional</h4>
                            <p className="corp-card-sub">{!regionId ? 'Datos nacionales' : `Mostrando datos de ${regionName}`}</p>
                            <div className="corp-chips">
                              <span className="corp-chip">{dashboardStats.destinos} destinos</span>
                              <span className="corp-chip">{dashboardStats.prestadores} prestadores</span>
                            </div>
                          </div>
                        </div>
                        <div className="metric-card"><div className="metric-data"><span className="metric-title">Destinos Georreferenciados</span><span className="metric-value">{totalGeoreferencedCount}</span><span className="metric-trend blue">◉ coordenadas GPS</span></div><div className="metric-icon-box blue"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" /><line x1="9" y1="3" x2="9" y2="18" /><line x1="15" y1="6" x2="15" y2="21" /></svg></div></div>
                        <div className="metric-card"><div className="metric-data"><span className="metric-title">Prestadores Registrados</span><span className="metric-value">{totalRegisteredCount.toLocaleString()}</span><span className="metric-trend green">▲ registrados</span></div><div className="metric-icon-box green"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg></div></div>
                        <div className="metric-card"><div className="metric-data"><span className="metric-title">Eventos Programados</span><span className="metric-value">{dashboardStats.eventos}</span><span className="metric-trend purple"><IconDot size={13} /> {eventosEsteMes} este mes</span></div><div className="metric-icon-box purple"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg></div></div>
                        <div className="metric-card"><div className="metric-data"><span className="metric-title">Rutas Turísticas</span><span className="metric-value">{totalRutasCount}</span><span className="metric-trend orange">⟐ {Object.keys(rutasByRegion).length} regiones</span></div><div className="metric-icon-box orange"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg></div></div>
                      </section>
                      <section className="charts-section">
                        <div className="chart-card" style={{cursor:'pointer'}} onClick={() => setActiveNav('proveedores')} onMouseMove={(e) => { setTooltip({ visible: true, x: e.clientX, y: e.clientY, content: `Ver proveedores por categoría` }) }} onMouseLeave={() => setTooltip(t => ({ ...t, visible: false }))}>
                          <h4 className="chart-title">Proveedores por Categoría</h4>
                          <div className="chart-bars">
                            {Object.entries(categoryCounts).length === 0 ? (
                              <div className="chart-bar-item"><span className="chart-bar-label">Sin datos</span></div>
                            ) : (
                              Object.entries(categoryCounts).map(([cat, count]) => (
                                <div key={cat} className="chart-bar-item"
                                  onMouseMove={(e) => { setTooltip({ visible: true, x: e.clientX, y: e.clientY, content: `${catLabels[cat] || cat}: ${count} proveedores` }) }}
                                  onMouseLeave={() => setTooltip(t => ({ ...t, visible: false }))}>
                                  <span className="chart-bar-label">{catLabels[cat] || cat}</span>
                                  <div className="chart-bar-track">
                                    <div className={`chart-bar-fill ${catColors[cat] || 'gray'}`} style={{width: `${Math.round(count / maxCatCount * 100)}%`}}>
                                      <span>{count}</span>
                                    </div>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                        <div className="chart-card chart-card-vertical" style={{cursor:'pointer'}} onClick={() => setActiveNav('destinos')} onMouseMove={(e) => { setTooltip({ visible: true, x: e.clientX, y: e.clientY, content: `Ver destinos por región` }) }} onMouseLeave={() => setTooltip(t => ({ ...t, visible: false }))}>
                          <h4 className="chart-title">Destinos por Región</h4>
                          <div className="chart-bars-vertical">
                            {Object.entries(destinosByRegion).length === 0 ? (
                              <div className="chart-bar-item-vertical"><span>Sin datos</span></div>
                            ) : (
                              Object.entries(destinosByRegion).map(([reg, count]) => (
                                <div key={reg} className="chart-bar-item-vertical"
                                  onMouseMove={(e) => { setTooltip({ visible: true, x: e.clientX, y: e.clientY, content: `${reg}: ${count} destinos` }) }}
                                  onMouseLeave={() => setTooltip(t => ({ ...t, visible: false }))}>
                                  <div className="chart-bar-vertical-fill blue" style={{height: `${Math.round(count / maxDestinosRegion * 100)}%`}}>
                                    <span className="chart-bar-vertical-count">{count}</span>
                                  </div>
                                  <span className="chart-bar-vertical-label">{reg}</span>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                        <div className="chart-card" style={{cursor:'pointer'}} onClick={() => setActiveNav('route')} onMouseMove={(e) => { setTooltip({ visible: true, x: e.clientX, y: e.clientY, content: `Ver rutas por región` }) }} onMouseLeave={() => setTooltip(t => ({ ...t, visible: false }))}>
                          <h4 className="chart-title">Rutas por Región</h4>
                          <div className="chart-bars">
                            {Object.entries(rutasByRegion).length === 0 ? (
                              <div className="chart-bar-item"><span className="chart-bar-label">Sin datos</span></div>
                            ) : (
                              Object.entries(rutasByRegion).map(([reg, count]) => (
                                <div key={reg} className="chart-bar-item"
                                  onMouseMove={(e) => { setTooltip({ visible: true, x: e.clientX, y: e.clientY, content: `${reg}: ${count} rutas` }) }}
                                  onMouseLeave={() => setTooltip(t => ({ ...t, visible: false }))}>
                                  <span className="chart-bar-label">{reg}</span>
                                  <div className="chart-bar-track">
                                    <div className="chart-bar-fill orange" style={{width: `${Math.round(count / maxRutasRegion * 100)}%`}}>
                                      <span>{count}</span>
                                    </div>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                        <div className="chart-card" style={{cursor:'pointer'}} onClick={() => setActiveNav('eventos')} onMouseMove={(e) => { setTooltip({ visible: true, x: e.clientX, y: e.clientY, content: `Ver eventos programados` }) }} onMouseLeave={() => setTooltip(t => ({ ...t, visible: false }))}>
                          <h4 className="chart-title">Eventos</h4>
                          <div className="chart-donut">
                            <div className="donut-ring"><svg viewBox="0 0 36 36" className="donut-svg"><path className="donut-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" /><path className="donut-segment blue" strokeDasharray={`${eventosEsteMesPct},${100 - eventosEsteMesPct}`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" /><path className="donut-segment orange" strokeDasharray={`${eventosProximosPct},${100 - eventosProximosPct}`} strokeDashoffset={`${-eventosEsteMesPct}`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" /><path className="donut-segment gray" strokeDasharray={`${eventosPasadosPct},${100 - eventosPasadosPct}`} strokeDashoffset={`${-(eventosEsteMesPct + eventosProximosPct)}`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" /></svg><div className="donut-center">{eventosList.length}</div></div>
                            <div className="donut-legend"><div className="legend-item"><span className="legend-dot blue"></span>Este mes: {eventosEsteMes}</div><div className="legend-item"><span className="legend-dot orange"></span>Próximos: {eventosProximos}</div><div className="legend-item"><span className="legend-dot gray"></span>Pasados: {eventosPasados}</div></div>
                          </div>
                        </div>
                        <div className="chart-card chart-card-full" style={{cursor:'pointer'}} onClick={() => setActiveNav('validation')} onMouseMove={(e) => { setTooltip({ visible: true, x: e.clientX, y: e.clientY, content: `Ver actividad de validación` }) }} onMouseLeave={() => setTooltip(t => ({ ...t, visible: false }))}>
                          <h4 className="chart-title">Actividad Reciente</h4>
                          <div className="timeline-chart">
                            {merchants.length === 0 ? (
                              <div className="timeline-item"><div className="timeline-dot"></div><div className="timeline-content">Sin actividad reciente</div></div>
                            ) : (
                              [...merchants].reverse().slice(0, 5).map(m => (
                                <div key={m.id} className="timeline-item"
                                  onMouseMove={(e) => { setTooltip({ visible: true, x: e.clientX, y: e.clientY, content: `${m.name} - ${m.status === 'validado' ? 'Validado' : m.status === 'rechazado' ? 'Rechazado' : 'Pendiente'}` }) }}
                                  onMouseLeave={() => setTooltip(t => ({ ...t, visible: false }))}>
                                  <div className={`timeline-dot ${m.status === 'validado' ? 'green' : m.status === 'rechazado' ? 'red' : 'yellow'}`}></div>
                                  <div className="timeline-content">
                                    <strong>{m.name}</strong>
                                    {m.status === 'validado' ? ' fue validado' : m.status === 'rechazado' ? ' fue rechazado' : ' está pendiente'}
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </section>
                      <section className="table-section">
                        <div className="table-section-header"><div className="table-header-title"><h4>Solicitudes de Proveedores</h4><p>Registros más recientes de prestadores turísticos.</p></div><div className="table-header-controls">
                          <div className="table-search-wrapper">
                            <svg className="table-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                            <input type="text" className="table-search-input" placeholder="Buscar por nombre, RIF o categoría..." value={tableSearch} onChange={e => { setTableSearch(e.target.value); setTablePage(1) }} />
                          </div>
                        </div></div>
                        <div className="table-responsive"><table className="dashboard-table"><thead><tr><th className="table-th">Nombre del Comercio</th><th className="table-th">RIF</th><th className="table-th">Fecha</th><th className="table-th">Estado</th><th className="table-th">Acciones</th></tr></thead><tbody>
                          {tableLoading ? (<tr><td colSpan="5" className="table-td" style={{textAlign:'center',color:'var(--color-text-light)'}}>Cargando...</td></tr>) : tableMerchants.length === 0 ? (<tr><td colSpan="5" className="table-td" style={{textAlign:'center',color:'var(--color-text-light)'}}>No se encontraron registros.</td></tr>) : (
                            tableMerchants.map((merchant) => (
                              <tr key={merchant.id}>
                                <td className="table-td"><div className="merchant-info-block"><div className="merchant-avatar-thumb"><CategoryIcon category={merchant.category} size={19} /></div><div className="merchant-text-block"><h5 className="merchant-title-name">{merchant.name}</h5><span className="merchant-subtitle-category">{merchant.category}</span></div></div></td>
                                <td className="table-td" style={{fontFamily:'monospace',fontWeight:'500'}}>{merchant.rif || '—'}</td>
                                <td className="table-td">{merchant.date || '—'}</td>
                                <td className="table-td"><span className={'badge-status ' + (merchant.status || 'pendiente').toLowerCase()}>{(merchant.status || 'pendiente').toUpperCase()}</span></td>
                                <td className="table-td"><button className="btn-action-review" onClick={() => setReviewMerchant(merchant)}>Revisar</button></td>
                              </tr>
                            ))
                          )}
                        </tbody></table></div>
                        <div className="table-pagination-footer"><span className="pagination-info">Mostrando página {tablePage} de {tableTotalPages} ({tableTotalItems} solicitudes)</span><div className="pagination-controls">
                          <button className="btn-page-arrow" disabled={tablePage <= 1} onClick={() => setTablePage(p => Math.max(1, p - 1))} title="Anterior"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg></button>
                          {Array.from({ length: tableTotalPages }, (_, i) => i + 1).map(p => (
                            <button key={p} className={`btn-page-num ${p === tablePage ? 'active' : ''}`} onClick={() => setTablePage(p)}>{p}</button>
                          ))}
                          <button className="btn-page-arrow" disabled={tablePage >= tableTotalPages} onClick={() => setTablePage(p => Math.min(tableTotalPages, p + 1))} title="Siguiente"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg></button>
                        </div></div>
                      </section>
                      <footer style={{marginTop:'24px',textAlign:'center',fontSize:'12px',color:'var(--color-text-light)'}}>© 2026 MINTUR - Ministerio del Poder Popular para el Turismo.</footer>
                      {tooltip.visible && <div className="chart-tooltip" style={{left: tooltip.x + 10, top: tooltip.y - 10}}>{tooltip.content}</div>}
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
                  case 'cms':
                    return <GestionCMS />
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
                          <input type="text" className="module-search" placeholder="Buscar comercio o RIF..." value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setPendingPage(1) }} />
                        </div>
                      </div>
                      {pendingMerchantsList.length === 0 ? (
                        <div className="module-container">
                          <div className="empty-state">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48" style={{ opacity: 0.3, marginBottom: 12 }}>
                              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                              <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                            <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 600, color: 'var(--color-text-muted)' }}>Sin solicitudes pendientes</h3>
                            <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-light)' }}>No hay prestadores esperando validación. Use "Nuevo Prestador" para registrar uno manualmente.</p>
                          </div>
                        </div>
                      ) : (
                        <section className="table-section">
                          <div className="table-responsive"><table className="dashboard-table"><thead><tr><th className="table-th">Nombre del Comercio</th><th className="table-th">RIF</th><th className="table-th">Fecha</th><th className="table-th">Estado</th><th className="table-th">Acciones</th></tr></thead><tbody>
                            {pendingMerchantsList.map((merchant) => (
                              <tr key={merchant.id}>
                                <td className="table-td"><div className="merchant-info-block"><div className="merchant-avatar-thumb"><CategoryIcon category={merchant.category} size={19} /></div><div className="merchant-text-block"><h5 className="merchant-title-name">{merchant.name}</h5><span className="merchant-subtitle-category">{merchant.category}</span></div></div></td>
                                <td className="table-td" style={{fontFamily:'monospace',fontWeight:'500'}}>{merchant.rif || '—'}</td>
                                <td className="table-td">{merchant.date || '—'}</td>
                                <td className="table-td"><span className={'badge-status ' + (merchant.status || 'pendiente').toLowerCase()}>{(merchant.status || 'pendiente').toUpperCase()}</span></td>
                                <td className="table-td"><button className="btn-action-review" onClick={() => setReviewMerchant(merchant)}>Revisar</button></td>
                              </tr>
                            ))}
                          </tbody></table></div>
                          {pendingTotalPages > 1 && (
                            <div className="table-pagination-footer">
                              <span className="pagination-info">Página {pendingPage} de {pendingTotalPages} ({pendingTotalItems} solicitudes)</span>
                              <div className="pagination-controls">
                                <button className="btn-page-arrow" disabled={pendingPage <= 1} onClick={() => setPendingPage(p => Math.max(1, p - 1))} title="Anterior"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg></button>
                                {Array.from({ length: Math.min(pendingTotalPages, 10) }, (_, i) => i + 1).map(p => (
                                  <button key={p} className={`btn-page-num ${p === pendingPage ? 'active' : ''}`} onClick={() => setPendingPage(p)}>{p}</button>
                                ))}
                                <button className="btn-page-arrow" disabled={pendingPage >= pendingTotalPages} onClick={() => setPendingPage(p => Math.min(pendingTotalPages, p + 1))} title="Siguiente"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg></button>
                              </div>
                            </div>
                          )}
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
                  <span className="detail-value" style={{ fontFamily: 'monospace' }}>{reviewMerchant.rif || '—'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Fecha Reg:</span>
                  <span className="detail-value">{reviewMerchant.date || '—'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Estado Actual:</span>
                  <span className="detail-value" style={{ textTransform: 'uppercase', fontWeight: 'bold', color: (reviewMerchant.status || 'pendiente') === 'pendiente' ? 'var(--tone-gold)' : (reviewMerchant.status || '') === 'validado' ? 'var(--tone-green)' : 'var(--tone-red)' }}>{reviewMerchant.status || 'pendiente'}</span>
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
                    <option value="Alojamiento Turístico">Alojamiento Turístico</option>
                    <option value="Gastronomía Regional">Gastronomía Regional</option>
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
          background: var(--gradient-primary-solid);
          color: var(--color-on-solid);
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
