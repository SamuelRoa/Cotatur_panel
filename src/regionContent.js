const regionBaseInfo = {
  national: {
    description: 'Panorama nacional del turismo venezolano. Integración de todas las regiones turísticas del país.',
    color: '#4C8C24',
  },
  'Los Andes': {
    description: 'Montañas, páramos y valles andinos. Rica tradición cultural, gastronomía típica y paisajes de ensueño.',
    color: '#2E7D32',
  },
  Llanos: {
    description: 'Llanos venezolanos, vastas llanuras, biodiversidad única, hatos y turismo de naturaleza.',
    color: '#F9A825',
  },
  'Zulia-Lara-Falcón': {
    description: 'Diversidad que va desde el Lago de Maracaibo hasta las costas falconianas y la tierra musical de Lara.',
    color: '#E65100',
  },
  'Central': {
    description: 'Región Central: capital del país, centros históricos, playas cercanas y diversidad cultural.',
    color: '#1565C0',
  },
  'Amazonía': {
    description: 'Amazonía venezolana. Selva tropical, comunidades indígenas, ríos caudalosos y biodiversidad extrema.',
    color: '#00695C',
  },
  'Insular': {
    description: 'Islas del Caribe venezolano. Playas paradisíacas, sol y deportes acuáticos.',
    color: '#00838F',
  },
  'Oriental': {
    description: 'Región Oriental: costas atlánticas, península de Paria, diversidad ecológica y cultural.',
    color: '#AD1457',
  },
}

const regionModules = {
  destinos: {
    items: [
      'Parque Nacional Canaima – Salto Ángel, la cascada más alta del mundo',
      'Archipiélago Los Roques – Parque nacional insular, arrecifes de coral',
      'Médanos de Coro – Formaciones de arena únicas en el istmo de Paraguaná',
      'Parque Nacional El Ávila – Pulmón vegetal de Caracas',
      'Pico Bolívar – La montaña más alta de Venezuela (4.978 msnm)',
      'Playa El Agua – La playa más emblemática de Margarita',
    ],
  },
  proveedores: {
    items: [
      'Hoteles y posadas certificados en todas las regiones',
      'Restaurantes de gastronomía típica venezolana',
      'Agencias de viaje operando a nivel nacional',
      'Transporte turístico terrestre, aéreo y marítimo',
      'Guías especializados en ecoturismo, aventura y cultura',
    ],
  },
  eventos: {
    items: [
      'Feria Internacional de San Sebastián (Enero) – San Cristóbal',
      'Carnavales de Venezuela (Febrero-Marzo) – Todo el país',
      'Feria de la Chinita (Noviembre) – Maracaibo',
      'Semana Santa (Marzo-Abril) – Tradiciones en todo el país',
      'Feria del Sol (Febrero) – Mérida',
    ],
  },
  rutas: {
    items: [
      'Ruta de los Andes – Mérida, Táchira, Trujillo',
      'Ruta del Caribe – Isla de Margarita, Los Roques, Morrocoy',
      'Ruta de los Llanos – Apure, Barinas, Portuguesa',
      'Ruta Amazónica – Canaima, Gran Sabana, Amazonas',
      'Ruta Central – Caracas, Colonia Tovar, La Guaira',
    ],
  },
  difusion: {
    items: [
      'Plan Nacional de Turismo Sostenible 2026',
      'Campaña "Venezuela es tu Destino" – Promoción internacional',
      'Fichas oficiales de todos los destinos del país',
      'Comunicados del Ministerio del Poder Popular para el Turismo',
      'Directorio nacional de prestadores certificados',
    ],
  },
  soporte: {
    items: [
      'Oficina Central MINTUR – Caracas',
      'Línea de atención al turista: 0800-TURISMO (0800-8874766)',
      'Correo: soporte@cotatur.gob.ve',
      'Horario de atención: Lun-Vie 8:00 AM – 4:00 PM',
    ],
  },
  configuracion: {
    items: [
      'Usuarios del sistema a nivel nacional',
      'Roles y permisos globales',
      'Catálogo geográfico completo de todas las regiones',
      'Corporaciones: COTATUR y todas las corpotures',
    ],
  },
}

export function getRegionContent(moduleKey, regionId, regionName) {
  const moduleData = regionModules[moduleKey]
  if (!moduleData) return null

  const lookupKey = (!regionId || regionId === 'national') ? 'national' : (regionName || '')
  const baseInfo = regionBaseInfo[lookupKey] || regionBaseInfo['national']

  return {
    title: `${moduleData.title || moduleKey} - ${regionName || 'Visión Nacional'}`,
    items: moduleData.items,
    description: baseInfo.description,
    color: baseInfo.color,
    corporations: [],
  }
}
