const REGIONS = [
  { REGI_COD: 1, REGI_NOM: 'Los Andes' },
  { REGI_COD: 2, REGI_NOM: 'Llanos' },
  { REGI_COD: 3, REGI_NOM: 'Zulia-Lara-Falcón' },
  { REGI_COD: 4, REGI_NOM: 'Central' },
  { REGI_COD: 5, REGI_NOM: 'Amazonía' },
  { REGI_COD: 6, REGI_NOM: 'Insular' },
  { REGI_COD: 7, REGI_NOM: 'Oriental' },
]

const regionNames = { 1: 'Los Andes', 2: 'Llanos', 3: 'Zulia-Lara-Falcón', 4: 'Central', 5: 'Amazonía', 6: 'Insular', 7: 'Oriental' }

const estadosByRegion = {
  1: ['Mérida', 'Táchira', 'Trujillo'],
  2: ['Apure', 'Barinas', 'Portuguesa', 'Guárico', 'Cojedes'],
  3: ['Zulia', 'Lara', 'Falcón'],
  4: ['Distrito Capital', 'Miranda', 'La Guaira', 'Aragua', 'Carabobo'],
  5: ['Amazonas', 'Bolívar'],
  6: ['Nueva Esparta', 'Dependencias Federales'],
  7: ['Anzoátegui', 'Monagas', 'Sucre', 'Delta Amacuro'],
}

const municipios = {
  'Mérida': ['Libertador', 'Campo Elías', 'Sucre', 'Rangel'],
  'Táchira': ['San Cristóbal', 'San José', 'Cárdenas', 'Junín'],
  'Trujillo': ['Trujillo', 'Valera', 'Escuque', 'Boconó'],
  'Apure': ['San Fernando', 'Achaguas', 'Biruaca', 'Muñoz'],
  'Barinas': ['Barinas', 'Bolívar', 'Cruz Paredes', 'Obispos'],
  'Portuguesa': ['Guanare', 'Acarigua', 'Araure', 'Ospino'],
  'Guárico': ['San Juan de los Morros', 'Calabozo', 'Valle de la Pascua', 'Zaraza'],
  'Cojedes': ['San Carlos', 'Tinaquillo', 'Anzoátegui', 'Ezequiel Zamora'],
  'Zulia': ['Maracaibo', 'San Francisco', 'Cabimas', 'Ciudad Ojeda'],
  'Lara': ['Barquisimeto', 'Cabudare', 'Carora', 'Quíbor'],
  'Falcón': ['Coro', 'Punto Fijo', 'Puerto Cumarebo', 'Dabajuro'],
  'Distrito Capital': ['Libertador'],
  'Miranda': ['Baruta', 'Chacao', 'Sucre', 'El Hatillo'],
  'La Guaira': ['La Guaira', 'Catia La Mar', 'Macuto', 'Carayaca'],
  'Aragua': ['Maracay', 'Turmero', 'Cagua', 'La Victoria'],
  'Carabobo': ['Valencia', 'Naguanagua', 'Puerto Cabello', 'San Diego'],
  'Amazonas': ['Puerto Ayacucho', 'Atures', 'Autana', 'Manapiare'],
  'Bolívar': ['Ciudad Bolívar', 'Ciudad Guayana', 'Upata', 'El Callao'],
  'Nueva Esparta': ['Porlamar', 'La Asunción', 'Juan Griego', 'Pampatar'],
  'Dependencias Federales': ['Los Roques', 'La Orchila', 'La Tortuga'],
  'Anzoátegui': ['Barcelona', 'Puerto La Cruz', 'Lechería', 'El Tigre'],
  'Monagas': ['Maturín', 'Caripe', 'José Tadeo Monagas', 'Aguasay'],
  'Sucre': ['Cumaná', 'Carúpano', 'Río Caribe', 'Güiria'],
  'Delta Amacuro': ['Tucupita', 'Pedernales', 'Antonio Díaz'],
}

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)]
const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const randomLat = (min, max) => +(min + Math.random() * (max - min)).toFixed(6)
const randomLng = (min, max) => +(min + Math.random() * (max - min)).toFixed(6)

function getRegionForEstado(estado) {
  for (const [rid, estados] of Object.entries(estadosByRegion)) {
    if (estados.includes(estado)) return parseInt(rid)
  }
  return 4
}

function getMunicipiosForEstado(estado) {
  return municipios[estado] || ['Municipio Principal']
}

const destinosMock = [
  { name: 'Parque Nacional Canaima', description: 'Extenso parque nacional con tepuyes, selva y el Salto Ángel, la cascada más alta del mundo.', roadStatus: 'Regular', tourismType: 'Ecoturismo', lat: 5.9667, lng: -62.5333, estado: 'Bolívar', municipality: 'Ciudad Guayana', address: 'Av. Principal Canaima, Sector Gran Sabana' },
  { name: 'Archipiélago Los Roques', description: 'Parque nacional insular de aguas cristalinas, arrecifes de coral y playas de arena blanca.', roadStatus: 'Buena', tourismType: 'Sol y Playa', lat: 11.8667, lng: -66.7500, estado: 'Dependencias Federales', municipality: 'Los Roques', address: 'Isla Gran Roque' },
  { name: 'Médanos de Coro', description: 'Formaciones de arena únicas en el istmo de Paraguaná, ideal para senderismo y fotografía.', roadStatus: 'Buena', tourismType: 'Aventura', lat: 11.4000, lng: -69.6833, estado: 'Falcón', municipality: 'Coro', address: 'Vía Punto Fijo, Parque Nacional Médanos' },
  { name: 'Parque Nacional El Ávila', description: 'Pulmón vegetal de Caracas con senderos, teleférico y vista panorámica de la ciudad.', roadStatus: 'Buena', tourismType: 'Aventura', lat: 10.5333, lng: -66.8667, estado: 'Distrito Capital', municipality: 'Libertador', address: 'Estación Teleférico, Caracas' },
  { name: 'Pico Bolívar', description: 'La montaña más alta de Venezuela con 4.978 msnm, destino de alta montaña y andinismo.', roadStatus: 'Regular', tourismType: 'Aventura', lat: 8.5500, lng: -71.0333, estado: 'Mérida', municipality: 'Libertador', address: 'Sierra Nevada, Mérida' },
  { name: 'Playa El Agua', description: 'La playa más emblemática de la Isla de Margarita, con arena dorada y brisa caribeña.', roadStatus: 'Buena', tourismType: 'Sol y Playa', lat: 10.9833, lng: -63.8333, estado: 'Nueva Esparta', municipality: 'Porlamar', address: 'Vía El Agua, Margarita' },
  { name: 'Salto Ángel', description: 'La cascada ininterrumpida más alta del mundo, caída de 979 metros en el corazón de Canaima.', roadStatus: 'Mala', tourismType: 'Ecoturismo', lat: 5.9667, lng: -62.5333, estado: 'Bolívar', municipality: 'Ciudad Guayana', address: 'Parque Nacional Canaima, Sector Auyantepuy' },
  { name: 'Colonia Tovar', description: 'Pueblo de influencia alemana en las montañas aragüeñas, famoso por su gastronomía y arquitectura.', roadStatus: 'Buena', tourismType: 'Cultural', lat: 10.4000, lng: -67.2833, estado: 'Aragua', municipality: 'Maracay', address: 'Carretera Colonia Tovar, Aragua' },
  { name: 'Laguna de Mucubají', description: 'Laguna de origen glaciar en los Andes venezolanos, paisaje de páramo y frailejones.', roadStatus: 'Regular', tourismType: 'Ecoturismo', lat: 8.7833, lng: -70.8333, estado: 'Mérida', municipality: 'Campo Elías', address: 'Sierra Nevada, Vía Barinas' },
  { name: 'Cueva del Guácharo', description: 'Parque nacional con una de las cuevas más grandes de Sudamérica, hogar del guácharo.', roadStatus: 'Regular', tourismType: 'Ecoturismo', lat: 10.1667, lng: -63.5500, estado: 'Monagas', municipality: 'Caripe', address: 'Carretera Caripe, Monagas' },
  { name: 'Castillo de San Carlos de Borromeo', description: 'Fortaleza colonial del siglo XVII en Pampatar, con vista al mar Caribe.', roadStatus: 'Buena', tourismType: 'Cultural', lat: 10.9500, lng: -63.7833, estado: 'Nueva Esparta', municipality: 'Pampatar', address: 'Calle La Marina, Pampatar' },
  { name: 'Parque Nacional Morrocoy', description: 'Parque marino costero con cayos, manglares y playas de ensueño en el estado Falcón.', roadStatus: 'Buena', tourismType: 'Sol y Playa', lat: 10.8500, lng: -68.2667, estado: 'Falcón', municipality: 'Punto Fijo', address: 'Vía Tucacas, Falcón' },
  { name: 'Río Orinoco', description: 'El tercer río más caudaloso del mundo, navegable y rodeado de selva y biodiversidad.', roadStatus: 'Mala', tourismType: 'Aventura', lat: 8.3333, lng: -62.7167, estado: 'Delta Amacuro', municipality: 'Tucupita', address: 'Muelle Fluvial de Tucupita' },
  { name: 'Mercado de las Pulgas de Cumaná', description: 'Colorido mercado artesanal en la ciudad más antigua de Venezuela continental.', roadStatus: 'Buena', tourismType: 'Cultural', lat: 10.4500, lng: -64.1667, estado: 'Sucre', municipality: 'Cumaná', address: 'Calle Bolívar, Cumaná' },
  { name: 'Parque Nacional Archipiélago Los Roques', description: 'Extenso parque nacional marino con corales, tortugas y aves marinas.', roadStatus: 'Buena', tourismType: 'Sol y Playa', lat: 11.9000, lng: -66.8500, estado: 'Dependencias Federales', municipality: 'Los Roques', address: 'Gran Roque, Los Roques' },
  { name: 'Hato El Cedral', description: 'Hato llanero dedicado al turismo de naturaleza, con safaris y observación de fauna.', roadStatus: 'Regular', tourismType: 'Ecoturismo', lat: 7.5833, lng: -69.2833, estado: 'Apure', municipality: 'San Fernando', address: 'Vía El Cedral, Apure' },
  { name: 'Teleférico de Mérida', description: 'El teleférico más alto del mundo, conecta Mérida con el Pico Espejo a 4.765 msnm.', roadStatus: 'Buena', tourismType: 'Aventura', lat: 8.5833, lng: -71.1333, estado: 'Mérida', municipality: 'Libertador', address: 'Estación Barinitas, Mérida' },
  { name: 'Basílica de Nuestra Señora de Chiquinquirá', description: 'Iglesia que alberga a la Chinita, símbolo de la devoción maracaibera.', roadStatus: 'Buena', tourismType: 'Religioso', lat: 10.6500, lng: -71.6333, estado: 'Zulia', municipality: 'Maracaibo', address: 'Av. Bella Vista, Maracaibo' },
  { name: 'Playa Parguito', description: 'Playa de oleaje fuerte ideal para surfistas y deportes acuáticos en Margarita.', roadStatus: 'Buena', tourismType: 'Sol y Playa', lat: 10.9833, lng: -63.8167, estado: 'Nueva Esparta', municipality: 'Porlamar', address: 'Vía El Parguito, Margarita' },
  { name: 'Parque Nacional Sierra Nevada', description: 'Parque nacional que protege los picos más altos de Venezuela, con páramos y lagunas glaciares.', roadStatus: 'Regular', tourismType: 'Ecoturismo', lat: 8.5500, lng: -71.0500, estado: 'Mérida', municipality: 'Libertador', address: 'Sierra Nevada de Mérida' },
]

function buildDestinos() {
  return destinosMock.map((d, i) => {
    const rid = getRegionForEstado(d.estado)
    const munList = getMunicipiosForEstado(d.estado)
    const mun = getRandom(munList)
    return {
      id: i + 1,
      name: d.name,
      description: d.description,
      roadStatus: d.roadStatus,
      tourismTypeId: 1,
      tourismType: d.tourismType,
      municipalityId: i + 1,
      municipality: mun,
      estado: d.estado,
      regionId: rid,
      lat: d.lat,
      lng: d.lng,
      address: d.address,
    }
  })
}

const eventosMock = [
  { title: 'Feria Internacional de San Sebastián', description: 'Feria internacional con exposiciones, conciertos y eventos culturales en San Cristóbal.', eventType: 'Feria', daysFromNow: 15, destinoName: 'Parque Nacional Canaima', estado: 'Táchira' },
  { title: 'Carnavales Turísticos de Venezuela', description: 'Celebración nacional con desfiles, comparsas y música en todo el país.', eventType: 'Cultural', daysFromNow: 45, destinoName: 'Colonia Tovar', estado: 'Aragua' },
  { title: 'Feria de la Chinita', description: 'Festividad en honor a la Virgen de Chiquinquirá en Maracaibo con ferias y conciertos.', eventType: 'Religioso', daysFromNow: 90, destinoName: 'Basílica de Nuestra Señora de Chiquinquirá', estado: 'Zulia' },
  { title: 'Feria del Sol', description: 'Feria taurina y cultural en la ciudad de Mérida, con exposiciones y eventos deportivos.', eventType: 'Cultural', daysFromNow: -60, destinoName: 'Teleférico de Mérida', estado: 'Mérida' },
  { title: 'Festival de la Sardina', description: 'Festival gastronómico en las costas de Sucre, con platos típicos y música popular.', eventType: 'Gastronómico', daysFromNow: 120, destinoName: 'Mercado de las Pulgas de Cumaná', estado: 'Sucre' },
  { title: 'Exposición Agropecuaria de Barinas', description: 'Feria agropecuaria con muestras de ganado, artesanía y eventos ecuestres.', eventType: 'Feria', daysFromNow: -20, destinoName: 'Hato El Cedral', estado: 'Barinas' },
  { title: 'Semana Santa en los Andes', description: 'Procesiones y representaciones religiosas en los pueblos andinos durante Semana Santa.', eventType: 'Religioso', daysFromNow: 30, destinoName: 'Laguna de Mucubají', estado: 'Mérida' },
  { title: 'Festival de la Arepa', description: 'Festival gastronómico dedicado a la arepa venezolana con variedades regionales.', eventType: 'Gastronómico', daysFromNow: 75, destinoName: 'Colonia Tovar', estado: 'Miranda' },
  { title: 'Feria Internacional del Libro de Venezuela', description: 'Evento literario con editoriales, autores y actividades culturales en Caracas.', eventType: 'Cultural', daysFromNow: 200, destinoName: 'Parque Nacional El Ávila', estado: 'Distrito Capital' },
  { title: 'Regata del Caribe', description: 'Competencia de navegación a vela en las costas de Margarita y Los Roques.', eventType: 'Deportivo', daysFromNow: 60, destinoName: 'Archipiélago Los Roques', estado: 'Dependencias Federales' },
  { title: 'Festival de la Candelaria', description: 'Tradicional festival de la Virgen de la Candelaria en el oriente del país.', eventType: 'Religioso', daysFromNow: -45, destinoName: 'Cueva del Guácharo', estado: 'Monagas' },
  { title: 'Concierto Sinfónico en el Ávila', description: 'Concierto al aire libre organizado por la Orquesta Sinfónica de Venezuela en el Parque Nacional.', eventType: 'Musical', daysFromNow: 25, destinoName: 'Parque Nacional El Ávila', estado: 'Distrito Capital' },
]

function buildEventos() {
  const today = new Date()
  return eventosMock.map((e, i) => {
    const date = new Date(today)
    date.setDate(date.getDate() + e.daysFromNow)
    const endDate = new Date(date)
    endDate.setDate(endDate.getDate() + randomBetween(1, 5))
    const rid = getRegionForEstado(e.estado)
    return {
      id: i + 1,
      title: e.title,
      description: e.description,
      date: date.toISOString().slice(0, 10),
      endDate: endDate.toISOString().slice(0, 10),
      eventTypeId: 1,
      eventType: e.eventType,
      destinoId: i + 1,
      destinoName: e.destinoName,
      municipality: getRandom(getMunicipiosForEstado(e.estado)),
      estado: e.estado,
      regionId: rid,
    }
  })
}

const rutasMock = [
  { name: 'Ruta de los Andes', description: 'Recorrido por los paisajes más emblemáticos de la cordillera andina venezolana.', durationHours: 48, distanceKm: 450, roadStatus: 'Regular', tourismType: 'Aventura', destinos: [1, 5, 9, 17] },
  { name: 'Ruta del Caribe Insular', description: 'Tour por las islas del Caribe venezolano, playas, sol y deportes acuáticos.', durationHours: 72, distanceKm: 300, roadStatus: 'Buena', tourismType: 'Sol y Playa', destinos: [2, 6, 11, 15, 19] },
  { name: 'Ruta de los Llanos', description: 'Exploración de los llanos venezolanos, hatos, fauna silvestre y paisajes infinitos.', durationHours: 36, distanceKm: 380, roadStatus: 'Regular', tourismType: 'Ecoturismo', destinos: [16] },
  { name: 'Ruta Amazónica', description: 'Aventura por la selva amazónica, tepuyes, ríos y comunidades indígenas.', durationHours: 96, distanceKm: 600, roadStatus: 'Mala', tourismType: 'Ecoturismo', destinos: [1, 7, 13] },
  { name: 'Ruta Central', description: 'Recorrido por la región central: Caracas, Colonia Tovar y la costa de La Guaira.', durationHours: 24, distanceKm: 180, roadStatus: 'Buena', tourismType: 'Cultural', destinos: [4, 8] },
  { name: 'Ruta de la Costa Falcón', description: 'Tour costero por las playas y parques nacionales de Falcón.', durationHours: 30, distanceKm: 250, roadStatus: 'Buena', tourismType: 'Sol y Playa', destinos: [3, 12] },
  { name: 'Ruta del Oriente Mágico', description: 'Recorrido por las costas orientales, cuevas y pueblos coloniales.', durationHours: 40, distanceKm: 350, roadStatus: 'Regular', tourismType: 'Cultural', destinos: [10, 14] },
  { name: 'Ruta del Zulia Cultural', description: 'Tour por Maracaibo y sus alrededores, el lago y la cultura zuliana.', durationHours: 20, distanceKm: 150, roadStatus: 'Buena', tourismType: 'Cultural', destinos: [18] },
]

function buildRutas() {
  const destinos = buildDestinos()
  return rutasMock.map((r, i) => ({
    id: i + 1,
    name: r.name,
    description: r.description,
    durationHours: r.durationHours,
    distanceKm: r.distanceKm,
    roadStatus: r.roadStatus,
    tourismTypeId: 1,
    tourismType: r.tourismType,
    destinos: r.destinos.map((didx, order) => {
      const d = destinos.find(x => x.id === didx) || destinos[0]
      return {
        id: order + 1,
        destinoId: d.id,
        order: order + 1,
        name: d.name,
        lat: d.lat,
        lng: d.lng,
        municipio: d.municipality,
        estado: d.estado,
        regionId: d.regionId,
      }
    }),
  }))
}

const providersMock = [
  { name: 'Hotel Bella Vista Mérida', category: 'Alojamiento Turístico', tipo: 'hosped', rif: 'J-12345678-9', phone: '+58 414-1234567', email: 'reservas@bellavista.com', web: 'www.bellavistamerida.com', status: 'validado', address: 'Av. Las Américas, Mérida', estado: 'Mérida', hospe: { categoria: '4 estrellas', numHabitaciones: 45, horario: '24 horas' } },
  { name: 'Posada La Montaña', category: 'Alojamiento Turístico', tipo: 'hosped', rif: 'J-23456789-0', phone: '+58 416-2345678', email: 'info@posadamontana.com', web: '', status: 'pendiente', address: 'Calle 3, Mucuchíes', estado: 'Mérida', hospe: { categoria: 'Posada', numHabitaciones: 12, horario: '24 horas' } },
  { name: 'Restaurante El Criollito', category: 'Gastronomía Típica', tipo: 'gastr', rif: 'J-34567890-1', phone: '+58 424-3456789', email: 'criollito@correo.com', web: '', status: 'validado', address: 'Av. Bolívar, San Cristóbal', estado: 'Táchira', gastr: { tipoGastronomia: 'Comida Típica Andina', horario: '12:00-22:00' } },
  { name: 'Agencia Viajes Venezuela Tours', category: 'Agencia de Viajes', tipo: 'turis', rif: 'J-45678901-2', phone: '+58 412-4567890', email: 'ventas@venezuelatours.com', web: 'www.venezuelatours.com', status: 'validado', address: 'Centro Comercial Sambil, Caracas', estado: 'Distrito Capital' },
  { name: 'Transporte Turístico Rápido Express', category: 'Transporte Turístico', tipo: 'trans', rif: 'J-56789012-3', phone: '+58 414-5678901', email: 'rapidoexpress@correo.com', web: '', status: 'rechazado', address: 'Av. Principal, Maracaibo', estado: 'Zulia', trans: { tipoVehiculo: 'Minibús', capacidad: 15, ruc: 'RUC-12345' } },
  { name: 'Hotel Margarita Paradise', category: 'Alojamiento Turístico', tipo: 'hosped', rif: 'J-67890123-4', phone: '+58 414-6789012', email: 'reservas@margaritaparadise.com', web: 'www.margaritaparadise.com', status: 'validado', address: 'Av. Raúl Leoni, Porlamar', estado: 'Nueva Esparta', hospe: { categoria: '5 estrellas', numHabitaciones: 120, horario: '24 horas' } },
  { name: 'Comida Típica Llanera Doña Bárbara', category: 'Gastronomía Típica', tipo: 'gastr', rif: 'J-78901234-5', phone: '+58 416-7890123', email: 'donabarbara@correo.com', web: '', status: 'pendiente', address: 'Calle Principal, San Fernando', estado: 'Apure', gastr: { tipoGastronomia: 'Comida Llanera', horario: '08:00-22:00' } },
  { name: 'Ecoturismo Canaima Aventura', category: 'Guías y Operadores', tipo: 'guia', rif: 'J-89012345-6', phone: '+58 424-8901234', email: 'info@canaimaaventura.com', web: 'www.canaimaaventura.com', status: 'validado', address: 'Av. Principal, Santa Elena de Uairén', estado: 'Bolívar' },
  { name: 'Hotel Los Andes Spa', category: 'Alojamiento Turístico', tipo: 'hosped', rif: 'J-90123456-7', phone: '+58 412-9012345', email: 'spa@hotellosandes.com', web: 'www.hotellosandes.com', status: 'validado', address: 'Av. Urdaneta, Valera', estado: 'Trujillo', hospe: { categoria: '4 estrellas', numHabitaciones: 60, horario: '24 horas' } },
  { name: 'Restaurante Mariscos del Caribe', category: 'Gastronomía Típica', tipo: 'gastr', rif: 'J-01234567-8', phone: '+58 414-0123456', email: 'mariscosdelcaribe@correo.com', web: '', status: 'validado', address: 'Malecón, Puerto La Cruz', estado: 'Anzoátegui', gastr: { tipoGastronomia: 'Mariscos y Pescados', horario: '11:00-23:00' } },
  { name: 'Transporte Aéreo Sky Venezuela', category: 'Transporte Turístico', tipo: 'trans', rif: 'J-11223344-5', phone: '+58 416-1122334', email: 'ventas@skyvenezuela.com', web: 'www.skyvenezuela.com', status: 'pendiente', address: 'Aeropuerto Internacional Simón Bolívar, La Guaira', estado: 'La Guaira', trans: { tipoVehiculo: 'Avioneta', capacidad: 8, ruc: 'RUC-67890' } },
  { name: 'Guía de Montaña Los Andes', category: 'Guías y Operadores', tipo: 'guia', rif: 'J-22334455-6', phone: '+58 424-2233445', email: 'guias@andesvenezuela.com', web: '', status: 'validado', address: 'Av. 4, Mérida', estado: 'Mérida' },
  { name: 'Agencia EcoAventura Amazonía', category: 'Agencia de Viajes', tipo: 'turis', rif: 'J-33445566-7', phone: '+58 414-3344556', email: 'eco@amazoniaviajes.com', web: 'www.amazoniaviajes.com', status: 'validado', address: 'Av. Amazonas, Puerto Ayacucho', estado: 'Amazonas' },
  { name: 'Posada El Llano', category: 'Alojamiento Turístico', tipo: 'hosped', rif: 'J-44556677-8', phone: '+58 416-4455667', email: 'posadaelllano@correo.com', web: '', status: 'pendiente', address: 'Calle Principal, Calabozo', estado: 'Guárico', hospe: { categoria: 'Posada', numHabitaciones: 10, horario: '24 horas' } },
  { name: 'Restaurante La Pizarra', category: 'Gastronomía Típica', tipo: 'gastr', rif: 'J-55667788-9', phone: '+58 412-5566778', email: 'lapizarra@correo.com', web: 'www.lapizarrarestaurante.com', status: 'validado', address: 'Calle Real, Colonia Tovar', estado: 'Aragua', gastr: { tipoGastronomia: 'Comida Alemana y Venezolana', horario: '09:00-22:00' } },
]

function buildPrestadores() {
  return providersMock.map((p, i) => {
    const rid = getRegionForEstado(p.estado)
    return {
      id: i + 1,
      name: p.name,
      category: p.category,
      tipo: p.tipo,
      rif: p.rif,
      phone: p.phone,
      email: p.email,
      web: p.web,
      status: p.status,
      municipalityId: i + 1,
      municipality: getRandom(getMunicipiosForEstado(p.estado)),
      estado: p.estado,
      regionId: rid,
      lat: randomLat(8, 11),
      lng: randomLng(-72, -62),
      address: p.address,
      subtipo: null,
      hospe: p.hospe || null,
      gastr: p.gastr || null,
      trans: p.trans || null,
    }
  })
}

const usersMock = [
  { name: 'admin.cotatur', email: 'admin@cotatur.gob.ve', active: true, roleName: 'Administrador', paisName: 'Venezuela' },
  { name: 'validador.andres', email: 'validador.andres@cotatur.gob.ve', active: true, roleName: 'Validador', paisName: 'Venezuela' },
  { name: 'editor.maria', email: 'editor.maria@cotatur.gob.ve', active: true, roleName: 'Editor', paisName: 'Venezuela' },
  { name: 'soporte.carlos', email: 'soporte.carlos@cotatur.gob.ve', active: true, roleName: 'Soporte', paisName: 'Venezuela' },
  { name: 'validador.lucia', email: 'validador.lucia@cotatur.gob.ve', active: false, roleName: 'Validador', paisName: 'Venezuela' },
  { name: 'editor.pedro', email: 'editor.pedro@cotatur.gob.ve', active: true, roleName: 'Editor', paisName: 'Venezuela' },
  { name: 'admin.regional.merida', email: 'admin.merida@cotatur.gob.ve', active: true, roleName: 'Administrador', paisName: 'Venezuela' },
  { name: 'soporte.ana', email: 'soporte.ana@cotatur.gob.ve', active: true, roleName: 'Soporte', paisName: 'Venezuela' },
]

function buildUsuarios() {
  return usersMock.map((u, i) => ({
    id: i + 1,
    name: u.name,
    email: u.email,
    active: u.active,
    roleId: i + 1,
    roleName: u.roleName,
    paisName: u.paisName,
    createdAt: new Date(Date.now() - randomBetween(30, 365) * 86400000).toISOString(),
    regiones: [{ id: 1, name: 'Los Andes' }],
  }))
}

const opinionesMock = [
  { calificacion: 5, comentario: 'Increíble experiencia, el Salto Ángel es imponente. Los guías fueron muy profesionales y conocedores de la zona.', usuarioName: 'María González', destinoName: 'Parque Nacional Canaima' },
  { calificacion: 4, comentario: 'Hermosas playas de arena blanca, el agua cristalina es perfecta para snorkel. Volvería sin dudas.', usuarioName: 'José Martínez', destinoName: 'Archipiélago Los Roques' },
  { calificacion: 3, comentario: 'Interesante formación natural, pero necesitan mejorar el acceso y la señalización turística.', usuarioName: 'Ana Rodríguez', destinoName: 'Médanos de Coro' },
  { calificacion: 5, comentario: 'El teleférico más alto del mundo, vistas espectaculares. Imperdible si visitas Mérida.', usuarioName: 'Carlos Mendoza', destinoName: 'Teleférico de Mérida' },
  { calificacion: 4, comentario: 'Excelente hotel con vista al mar, el servicio es de primera calidad. Recomiendo la piscina.', usuarioName: 'Laura Castillo', destinoName: 'Hotel Margarita Paradise' },
  { calificacion: 5, comentario: 'La gastronomía llanera es única, el restaurante Doña Bárbara ofrece los mejores pisillos.', usuarioName: 'Pedro Rojas', destinoName: 'Hato El Cedral' },
  { calificacion: 2, comentario: 'Llegar es complicado por el estado de la carretera. El destino es bonito pero necesitan mejorar vías.', usuarioName: 'Luisa Fernández', destinoName: 'Salto Ángel' },
  { calificacion: 4, comentario: 'El pueblo alemán más hermoso de Venezuela, la comida y el clima son perfectos.', usuarioName: 'Andrés López', destinoName: 'Colonia Tovar' },
]

function buildOpiniones() {
  return opinionesMock.map((o, i) => ({
    id: i + 1,
    calificacion: o.calificacion,
    comentario: o.comentario,
    fecha: new Date(Date.now() - randomBetween(1, 180) * 86400000).toISOString(),
    usuarioId: i + 1,
    usuarioName: o.usuarioName,
    destinoId: i + 1,
    destinoName: o.destinoName,
  }))
}

const consultasMock = [
  { contenido: 'Buenos días, quisiera saber los requisitos para registrar un hotel en la plataforma COTATUR. ¿Qué documentos necesito presentar?', canal: 'web', estado: 'pendiente', usuarioName: 'Carlos Méndez', usuarioEmail: 'carlos.mendez@correo.com' },
  { contenido: 'Hola, soy guía turístico certificado y quiero actualizar mi información de contacto en el directorio. ¿Puedo hacerlo en línea?', canal: 'web', estado: 'respondida', respuesta: 'Estimado Carlos, puede actualizar sus datos ingresando a su perfil en la plataforma. Si tiene inconvenientes, escríbanos nuevamente. Saludos cordiales.', usuarioName: 'María Peña', usuarioEmail: 'maria.pena@correo.com' },
  { contenido: 'Saludos, necesito reportar que la información del destino "Parque Nacional Morrocoy" tiene errores en los horarios de visita.', canal: 'email', estado: 'pendiente', usuarioName: 'Ana Torres', usuarioEmail: 'ana.torres@correo.com' },
  { contenido: 'Estoy interesado en promocionar mi restaurante en la plataforma. ¿Hay algún costo asociado al registro de proveedores?', canal: 'web', estado: 'respondida', respuesta: 'Hola, el registro de proveedores en COTATUR es completamente gratuito. Solo debe completar el formulario de registro con sus datos y esperar la validación. Saludos.', usuarioName: 'José Silva', usuarioEmail: 'jose.silva@correo.com' },
  { contenido: 'Buenas tardes, no puedo acceder a mi cuenta de usuario. He intentado recuperar mi contraseña pero no recibo el correo.', canal: 'email', estado: 'pendiente', usuarioName: 'Luisa Rivas', usuarioEmail: 'luisa.rivas@correo.com' },
  { contenido: 'Quisiera saber si tienen información sobre las rutas turísticas disponibles en el estado Bolívar y cómo contratar un guía local.', canal: 'web', estado: 'pendiente', usuarioName: 'Pedro Contreras', usuarioEmail: 'pedro.contreras@correo.com' },
  { contenido: 'Excelente plataforma. Sugiero agregar un mapa interactivo con todos los destinos registrados para facilitar la planificación de viajes.', canal: 'web', estado: 'respondida', respuesta: 'Gracias por su sugerencia, la tomaremos en cuenta para futuras actualizaciones del sistema. Agradecemos su aporte.', usuarioName: 'Ricardo Gómez', usuarioEmail: 'ricardo.gomez@correo.com' },
]

function buildConsultas() {
  return consultasMock.map((c, i) => ({
    id: i + 1,
    contenido: c.contenido,
    respuesta: c.respuesta || '',
    canal: c.canal,
    estado: c.estado,
    fecha: new Date(Date.now() - randomBetween(1, 60) * 86400000).toISOString(),
    usuarioId: i + 1,
    usuarioName: c.usuarioName,
    usuarioEmail: c.usuarioEmail,
    atendedorName: c.estado === 'respondida' ? 'Soporte COTATUR' : '',
  }))
}

const contenidosMock = [
  { titulo: 'Plan Nacional de Turismo Sostenible 2026', tipo: 'noticia', descripcion: 'El Ministerio del Poder Popular para el Turismo presenta el Plan Nacional de Turismo Sostenible 2026, una hoja de ruta para el desarrollo turístico del país con énfasis en la sustentabilidad ambiental, la inclusión social y la competitividad económica. Este plan contempla la inversión en infraestructura turística, la capacitación de prestadores de servicios y la promoción internacional de los destinos venezolanos. Se espera que para el cierre de 2026 se haya incrementado en un 30% la llegada de turistas internacionales.' },
  { titulo: 'Campaña "Venezuela es tu Destino" supera expectativas', tipo: 'noticia', descripcion: 'La campaña internacional de promoción turística "Venezuela es tu Destino" ha alcanzado más de 10 millones de impresiones en redes sociales y ha generado un incremento del 25% en las consultas sobre destinos venezolanos desde el extranjero. La campaña ha sido presentada en ferias internacionales de turismo en España, Alemania y Brasil.' },
  { titulo: 'Comunicado: Actualización de requisitos para prestadores turísticos', tipo: 'comunicado', descripcion: 'Se informa a todos los prestadores de servicios turísticos registrados en COTATUR que a partir del 1 de julio de 2026 entrarán en vigencia los nuevos requisitos para la actualización del Registro Turístico Nacional. Los prestadores deberán presentar la documentación actualizada antes del 30 de junio. Para más información, consulte el portal web oficial.' },
  { titulo: 'Ficha Destino: Parque Nacional Canaima', tipo: 'ficha', descripcion: 'El Parque Nacional Canaima es uno de los parques más grandes de Venezuela, con una extensión de 30.000 km². Fue declarado Patrimonio de la Humanidad por la UNESCO en 1994. Alberga el Salto Ángel, la cascada ininterrumpida más alta del mundo con 979 metros de caída. Su ecosistema incluye bosques húmedos tropicales, sabanas y formaciones geológicas únicas conocidas como tepuyes.' },
  { titulo: 'Reapertura del Teleférico de Mérida', tipo: 'noticia', descripcion: 'El Teleférico de Mérida, el más alto del mundo, reabre sus puertas tras un proceso de modernización integral. El sistema cuenta con nuevas cabinas con capacidad para 60 pasajeros, estaciones renovadas y un centro de visitantes en la cima del Pico Espejo. Las tarifas promocionales estarán vigentes durante el primer mes de operación.' },
  { titulo: 'Comunicado: Nuevos horarios de atención al público', tipo: 'comunicado', descripcion: 'Se informa que los horarios de atención al público en las oficinas de COTATUR a nivel nacional serán modificados a partir del próximo mes. El nuevo horario será de lunes a viernes de 8:00 AM a 4:00 PM, y los sábados de 9:00 AM a 12:00 PM. Las consultas en línea pueden realizarse las 24 horas a través de nuestro portal web.' },
  { titulo: 'Ficha Destino: Archipiélago Los Roques', tipo: 'ficha', descripcion: 'El Archipiélago Los Roques es un parque nacional marino ubicado en el Mar Caribe. Está compuesto por aproximadamente 350 islas, cayos e islotes de origen coralino. Es conocido por sus playas de arena blanca, aguas cristalinas y su increíble biodiversidad marina. Es un destino ideal para la práctica de snorkel, buceo y deportes acuáticos.' },
  { titulo: 'Venezuela se prepara para la temporada alta 2026', tipo: 'noticia', descripcion: 'Los principales destinos turísticos del país se preparan para recibir a miles de visitantes durante la temporada alta de 2026. Las autoridades han coordinado operativos de seguridad, limpieza y mejoras en los servicios públicos. Se espera una ocupación hotelera superior al 85% en destinos como Margarita, Los Roques, Mérida y Canaima.' },
]

function buildContenidos() {
  return contenidosMock.map((c, i) => ({
    id: i + 1,
    titulo: c.titulo,
    tipo: c.tipo,
    descripcion: c.descripcion,
    url: '',
    fecha: new Date(Date.now() - randomBetween(1, 120) * 86400000).toISOString(),
    autorName: 'Dirección de Comunicaciones COTATUR',
  }))
}

const mockData = {
  getRegiones: () => REGIONS,
  buildDestinos,
  buildEventos,
  buildRutas,
  buildPrestadores,
  buildUsuarios,
  buildOpiniones,
  buildConsultas,
  buildContenidos,
}

export default mockData
