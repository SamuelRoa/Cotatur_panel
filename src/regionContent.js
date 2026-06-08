export const regionsList = [
  { id: 'national', name: 'Visión Nacional' },
  { id: 'los_andes', name: 'Región Los Andes' },
  { id: 'llanos', name: 'Región Llanos' },
  { id: 'eje', name: 'Eje: Zulia-Lara-Falcón' },
  { id: 'central', name: 'Región Central' },
  { id: 'amazonica', name: 'Región Amazónica' },
  { id: 'insular', name: 'Región Insular' },
  { id: 'oriental', name: 'Región Oriental' },
]

export const corporationsByRegion = {
  los_andes: ['COTATUR', 'Corpotur Mérida', 'Turismo Mérida'],
  central: ['Corpotur Caracas', 'Corpotur Miranda'],
  insular: ['Corpotur Nueva Esparta'],
  llanos: ['Corpotur Llanos'],
  eje: ['Corpotur Zulia', 'Corpotur Lara', 'Corpotur Falcón'],
  amazonica: ['Corpotur Amazonas'],
  oriental: ['Corpotur Anzoátegui', 'Corpotur Sucre', 'Corpotur Monagas'],
  national: ['COTATUR', 'Corpotur Mérida', 'Corpotur Caracas', 'Corpotur Nueva Esparta', 'Corpotur Amazonas', 'Corpotur Zulia'],
}

const regionBaseInfo = {
  national: {
    description: 'Panorama nacional del turismo venezolano. Integración de todas las regiones turísticas del país.',
    color: '#4C8C24',
  },
  los_andes: {
    description: 'Montañas, páramos y valles andinos. Rica tradición cultural, gastronomía típica y paisajes de ensueño.',
    color: '#2E7D32',
  },
  llanos: {
    description: 'Llanos venezolanos, vastas llanuras, biodiversidad única, hatos y turismo de naturaleza.',
    color: '#F9A825',
  },
  eje: {
    description: 'Eje Zulia-Lara-Falcón. Diversidad que va desde el Lago de Maracaibo hasta las costas falconianas y la tierra musical de Lara.',
    color: '#E65100',
  },
  central: {
    description: 'Región Central: capital del país, centros históricos, playas cercanas y diversidad cultural.',
    color: '#1565C0',
  },
  amazonica: {
    description: 'Amazonía venezolana. Selva tropical, comunidades indígenas, ríos caudalosos y biodiversidad extrema.',
    color: '#00695C',
  },
  insular: {
    description: 'Islas del Caribe venezolano. Playas paradisíacas, sol y deportes acuáticos.',
    color: '#00838F',
  },
  oriental: {
    description: 'Región Oriental: costas atlánticas, peninsula de Paria, diversidad ecológica y cultural.',
    color: '#AD1457',
  },
}

export const regionModules = {
  destinos: {
    national: {
      title: 'Destinos Turísticos Nacionales',
      items: [
        'Parque Nacional Canaima – Salto Ángel, la cascada más alta del mundo',
        'Archipiélago Los Roques – Parque nacional insular, arrecifes de coral',
        'Médanos de Coro – Formaciones de arena únicas en el istmo de Paraguaná',
        'Parque Nacional El Ávila – Pulmón vegetal de Caracas',
        'Pico Bolívar – La montaña más alta de Venezuela (4.978 msnm)',
        'Playa El Agua – La playa más emblemática de Margarita',
      ],
    },
    los_andes: {
      title: 'Destinos de la Región Los Andes',
      items: [
        'Pico Bolívar – El techo de Venezuela, ideal para andinismo',
        'Parque Nacional Sierra Nevada – Páramos, lagunas glaciares y frailejones',
        'Mérida – Ciudad de los techos rojos y el teleférico más alto del mundo',
        'San Cristóbal – Capital del Táchira, ciudad de colinas y atardeceres',
        'Tovar – Pueblo colonial con arquitectura andina tradicional',
        'La Grita – Centro religioso y de peregrinación del Táchira',
      ],
    },
    llanos: {
      title: 'Destinos de la Región Llanos',
      items: [
        'Hato El Cedral – Reserva de fauna silvestre y turismo de hatos',
        'Parque Nacional Santos Luzardo – Llanos inundables y biodiversidad',
        'Calabozo – Portal de los llanos centrales',
        'San Fernando de Apure – Capital llanera, cultura y folklore',
      ],
    },
    eje: {
      title: 'Destinos del Eje Zulia-Lara-Falcón',
      items: [
        'Médanos de Coro – Paisaje desértico único en Venezuela',
        'Coro – Ciudad colonial, Patrimonio de la Humanidad',
        'Maracaibo – El lago más grande de Sudamérica y el Puente Rafael Urdaneta',
        'Parque Nacional Morrocoy – Cayos y playas del Golfo Triste',
        'Barquisimeto – Capital musical de Venezuela, Catedral de luz',
      ],
    },
    central: {
      title: 'Destinos de la Región Central',
      items: [
        'Parque Nacional El Ávila – Símbolo natural de Caracas',
        'Colonia Tovar – Pueblo alemán en la montaña venezolana',
        'Los Roques – Archipiélago de aguas cristalinas',
        'Caracas – Capital cultural y económica del país',
        'La Guaira – Costa caribeña y puerto histórico',
      ],
    },
    amazonica: {
      title: 'Destinos de la Región Amazónica',
      items: [
        'Salto Ángel (Kerepakupai Vená) – La cascada más alta del mundo (979 m)',
        'Parque Nacional Canaima – Patrimonio de la Humanidad, tepuyes',
        'Río Orinoco – El tercer río más caudaloso del mundo',
        'Santa Elena de Uairén – Puerta de entrada a la Gran Sabana',
        'Monte Roraima – El tepuy más famoso, frontera con Brasil y Guyana',
      ],
    },
    insular: {
      title: 'Destinos de la Región Insular',
      items: [
        'Playa El Agua – La más popular de Margarita',
        'Playa Parguito – Ideal para surf y deportes acuáticos',
        'Juan Griego – Bahía con el atardecer más hermoso de la isla',
        'Parque Nacional Laguna de La Restinga – Manglares y paseos en peñero',
        'Isla de Coche – Tranquilidad y playas vírgenes',
      ],
    },
    oriental: {
      title: 'Destinos de la Región Oriental',
      items: [
        'Península de Paria – Selva tropical y playas vírgenes',
        'Río Caribe – Pueblo pesquero de colores caribeños',
        'Mochima – Parque nacional con playas e islas',
        'Barcelona – Capital del estado Anzoátegui',
        'Cumaná – Ciudad más antigua de Venezuela continental',
      ],
    },
  },
  proveedores: {
    national: {
      title: 'Proveedores Turísticos Nacionales',
      items: [
        'Hoteles y posadas certificados en todas las regiones',
        'Restaurantes de gastronomía típica venezolana',
        'Agencias de viaje operando a nivel nacional',
        'Transporte turístico terrestre, aéreo y marítimo',
        'Guías especializados en ecoturismo, aventura y cultura',
      ],
    },
    los_andes: {
      title: 'Proveedores de la Región Los Andes',
      items: [
        'Posada La Montaña (Mérida) – Alojamiento Turístico',
        'Sabores Tachirenses (San Cristóbal) – Gastronomía Regional',
        'Rutas del Páramo (Mérida) – Agencia de Viajes',
        'Hotel Venetur Mérida – Alojamiento Turístico',
        'Guías de Montaña de los Andes – Excursiones y trekking',
      ],
    },
    llanos: {
      title: 'Proveedores de la Región Llanos',
      items: [
        'Hato Turístico El Cedral – Alojamiento y safari',
        'Llanos Travel – Agencia de viajes especializada',
        'Restaurante El Llanero – Gastronomía típica llanera',
      ],
    },
    eje: {
      title: 'Proveedores del Eje Zulia-Lara-Falcón',
      items: [
        'Hotel Venetur Maracaibo – Alojamiento Turístico',
        'Restaurante Las Delicias del Lago – Gastronomía zuliana',
        'Coro Travel – Agencia de viajes en Falcón',
        'Posada Boutique Barquisimeto – Alojamiento',
      ],
    },
    central: {
      title: 'Proveedores de la Región Central',
      items: [
        'Hotel Venetur Caracas – Alojamiento Turístico',
        'Restaurant El Criollo – Gastronomía Regional',
        'Avila Tour – Agencia de viajes en Caracas',
        'Posada Alemana (Colonia Tovar) – Alojamiento',
      ],
    },
    amazonica: {
      title: 'Proveedores de la Región Amazónica',
      items: [
        'Campamento Canaima – Alojamiento ecoturístico',
        'Amazonas Adventures – Agencia de viajes de aventura',
        'Posada Uairén – Alojamiento en Santa Elena',
      ],
    },
    insular: {
      title: 'Proveedores de la Región Insular',
      items: [
        'Hesperia Isla Margarita – Alojamiento Turístico',
        'Restaurant El Pescador – Gastronomía marina',
        'Margarita Tours – Agencia de viajes insular',
      ],
    },
    oriental: {
      title: 'Proveedores de la Región Oriental',
      items: [
        'Hotel Venetur Cumaná – Alojamiento Turístico',
        'Restaurant El Criollo Oriental – Gastronomía regional',
        'Paria Tour – Agencia de viajes especializada',
      ],
    },
  },
  eventos: {
    national: {
      title: 'Calendario Nacional de Eventos',
      items: [
        'Feria Internacional de San Sebastián (Enero) – San Cristóbal',
        'Carnavales de Venezuela (Febrero-Marzo) – Todo el país',
        'Feria de la Chinita (Noviembre) – Maracaibo',
        'Semana Santa (Marzo-Abril) – Tradiciones en todo el país',
        'Feria del Sol (Febrero) – Mérida',
      ],
    },
    los_andes: {
      title: 'Eventos de la Región Los Andes',
      items: [
        'Feria Internacional de San Sebastián (Enero) – San Cristóbal',
        'Festival Gastronómico de Capacho (Agosto)',
        'Expo Turismo Táchira (Noviembre)',
        'Ferias de la Virgen de la Candelaria (Febrero) – Tovar',
        'Peregrinación a La Grita (Agosto)',
      ],
    },
    llanos: {
      title: 'Eventos de la Región Llanos',
      items: [
        'Festival del Joropo (Marzo) – San Fernando de Apure',
        'Torneos de Coleo en diferentes municípios',
        'Feria de la Candelaria (Febrero) – Calabozo',
      ],
    },
    eje: {
      title: 'Eventos del Eje Zulia-Lara-Falcón',
      items: [
        'Feria de La Chinita (Noviembre) – Maracaibo',
        'Feria Internacional de Barquisimeto (Septiembre)',
        'Carnaval Internacional de Coro (Febrero)',
        'Semana de la Venezuelidad (Julio) – Barquisimeto',
      ],
    },
    central: {
      title: 'Eventos de la Región Central',
      items: [
        'Feria del Libro de Caracas (Noviembre)',
        'Carnaval de Caracas (Febrero-Marzo)',
        'Festival de Teatro de Caracas (Abril)',
        'Feria de la Candelaria (Febrero) – Colonia Tovar',
      ],
    },
    amazonica: {
      title: 'Eventos de la Región Amazónica',
      items: [
        'Fiesta de la Virgen del Carmen (Julio) – Puerto Ayacucho',
        'Exposición Indígena y Artesanal (Octubre)',
        'Festival Autóctono de la Etnia Pemón (Abril) – Gran Sabana',
      ],
    },
    insular: {
      title: 'Eventos de la Región Insular',
      items: [
        'Feria Internacional de la Isla de Margarita (Marzo)',
        'Regata de la Bahía de Juan Griego (Abril)',
        'Festival de la Cultura Margariteña (Julio)',
        'Temporada de Playas (Todo el año)',
      ],
    },
    oriental: {
      title: 'Eventos de la Región Oriental',
      items: [
        'Carnaval de Cumaná (Febrero-Marzo)',
        'Feria de la Virgen del Valle (Septiembre)',
        'Festival de la Cultura Oriental (Noviembre)',
        'Fiesta del Pescao (Enero) – Río Caribe',
      ],
    },
  },
  rutas: {
    national: {
      title: 'Rutas Turísticas Nacionales',
      items: [
        'Ruta de los Andes – Mérida, Táchira, Trujillo',
        'Ruta del Caribe – Isla de Margarita, Los Roques, Morrocoy',
        'Ruta de los Llanos – Apure, Barinas, Portuguesa',
        'Ruta Amazónica – Canaima, Gran Sabana, Amazonas',
        'Ruta Central – Caracas, Colonia Tovar, La Guaira',
      ],
    },
    los_andes: {
      title: 'Rutas de la Región Los Andes',
      items: [
        'Ruta del Páramo – Mérida, Pico Bolívar, Laguna Mucubají',
        'Ruta del Táchira – San Cristóbal, La Grita, Capacho, Tovar',
        'Ruta de las Ferias – San Cristóbal, Tovar, La Grita',
        'Ruta Gastronómica – Sabores tachirenses, arepas andinas, vino de mora',
      ],
    },
    llanos: {
      title: 'Rutas de la Región Llanos',
      items: [
        'Ruta de los Hatos – Hato El Cedral, Hato Piñero',
        'Ruta del Joropo – San Fernando, Calabozo',
        'Ruta de la Biodiversidad – Santos Luzardo, río Apure',
      ],
    },
    eje: {
      title: 'Rutas del Eje Zulia-Lara-Falcón',
      items: [
        'Ruta del Lago – Maracaibo, Santa Rosa de Agua, Puente Urdaneta',
        'Ruta Colonial – Coro, La Vela de Coro, Médanos',
        'Ruta Musical – Barquisimeto, El Tocuyo, Quíbor',
        'Ruta de las Playas – Morrocoy, Tucacas, Chichiriviche',
      ],
    },
    central: {
      title: 'Rutas de la Región Central',
      items: [
        'Ruta Capitalina – Caracas, El Ávila, Casco Histórico',
        'Ruta de la Colonia Tovar – Caracas, Colonia Tovar, La Victoria',
        'Ruta del Mar – La Guaira, Macuto, Naiguatá',
      ],
    },
    amazonica: {
      title: 'Rutas de la Región Amazónica',
      items: [
        'Ruta del Salto Ángel – Canaima, río Carrao, Salto Ángel',
        'Ruta de los Tepuyes – Gran Sabana, Roraima, Kukenán',
        'Ruta Indígena – Comunidades pemones, artesanía y cultura',
      ],
    },
    insular: {
      title: 'Rutas de la Región Insular',
      items: [
        'Ruta Este de Margarita – Playa El Agua, Parguito, Juan Griego',
        'Ruta Oeste de Margarita – La Restinga, Macanao, Punta Arenas',
        'Ruta de las Islas – Margarita, Coche, Cubagua',
      ],
    },
    oriental: {
      title: 'Rutas de la Región Oriental',
      items: [
        'Ruta de Paria – Cumaná, Río Caribe, Península de Paria',
        'Ruta de Mochima – Barcelona, Mochima, Islas',
        'Ruta Colonial Oriental – Cumaná, Barcelona, Puerto La Cruz',
      ],
    },
  },
  difusion: {
    national: {
      title: 'Centro de Difusión Nacional',
      items: [
        'Plan Nacional de Turismo Sostenible 2026',
        'Campaña "Venezuela es tu Destino" – Promoción internacional',
        'Fichas oficiales de todos los destinos del país',
        'Comunicados del Ministerio del Poder Popular para el Turismo',
        'Directorio nacional de prestadores certificados',
      ],
    },
    los_andes: {
      title: 'Difusión Región Los Andes',
      items: [
        'Plan de Desarrollo Turístico de los Andes',
        'Fichas de destinos: Pico Bolívar, Parque Sierra Nevada, San Cristóbal',
        'Campaña "Vive los Andes" – Promoción regional',
        'Comunicados oficiales de COTATUR y Corpotur Mérida',
      ],
    },
    llanos: {
      title: 'Difusión Región Llanos',
      items: [
        'Fichas de destinos llaneros: Hato El Cedral, Santos Luzardo',
        'Campaña "Llanos de Venezuela" – Turismo de hatos',
        'Calendario de eventos llaneros y ferias',
      ],
    },
    eje: {
      title: 'Difusión Eje Zulia-Lara-Falcón',
      items: [
        'Fichas de destinos: Médanos de Coro, Morrocoy, Maracaibo',
        'Campaña "Eje Turístico Occidental"',
        'Comunicados de Corpotur Zulia, Lara y Falcón',
        'Promoción del Circuito Playas de Falcón',
      ],
    },
    central: {
      title: 'Difusión Región Central',
      items: [
        'Fichas de destinos: El Ávila, Colonia Tovar, Los Roques',
        'Campaña "Caracas Cultural"',
        'Comunicados de Corpotur Caracas y Miranda',
        'Guía de turismo capitalino',
      ],
    },
    amazonica: {
      title: 'Difusión Región Amazónica',
      items: [
        'Fichas de destinos: Salto Ángel, Canaima, Roraima',
        'Campaña "Amazonía Venezolana" – Ecoturismo y aventura',
        'Comunicados de Corpotur Amazonas',
        'Guía de comunidades indígenas y turismo cultural',
      ],
    },
    insular: {
      title: 'Difusión Región Insular',
      items: [
        'Fichas de destinos: Playa El Agua, La Restinga, Coche',
        'Campaña "Margarita te Espera"',
        'Comunicados de Corpotur Nueva Esparta',
        'Directorio de prestadores insulares',
      ],
    },
    oriental: {
      title: 'Difusión Región Oriental',
      items: [
        'Fichas de destinos: Península de Paria, Mochima, Cumaná',
        'Campaña "Oriente Venezolano" – Sol, playa y cultura',
        'Comunicados de Corpotur Anzoátegui, Sucre y Monagas',
      ],
    },
  },
  soporte: {
    national: {
      title: 'Soporte Nacional',
      items: [
        'Oficina Central MINTUR – Caracas',
        'Línea de atención al turista: 0800-TURISMO (0800-8874766)',
        'Correo: soporte@cotatur.gob.ve',
        'Horario de atención: Lun-Vie 8:00 AM – 4:00 PM',
      ],
    },
    los_andes: {
      title: 'Soporte Región Los Andes',
      items: [
        'Oficina COTATUR – San Cristóbal, Estado Táchira',
        'Oficina Corpotur Mérida – Mérida, Estado Mérida',
        'Teléfono: 0276-3456789',
        'Correo: soporte.andes@cotatur.gob.ve',
        'Horario de atención: Lun-Vie 8:00 AM – 4:00 PM',
      ],
    },
    llanos: {
      title: 'Soporte Región Llanos',
      items: [
        'Oficina Corpotur Llanos – San Fernando de Apure',
        'Teléfono: 0247-3415678',
        'Correo: soporte.llanos@cotatur.gob.ve',
      ],
    },
    eje: {
      title: 'Soporte Eje Zulia-Lara-Falcón',
      items: [
        'Oficina Corpotur Zulia – Maracaibo, Estado Zulia',
        'Oficina Corpotur Lara – Barquisimeto, Estado Lara',
        'Oficina Corpotur Falcón – Coro, Estado Falcón',
        'Correo: soporte.eje@cotatur.gob.ve',
      ],
    },
    central: {
      title: 'Soporte Región Central',
      items: [
        'Oficina Corpotur Caracas – Caracas, Distrito Capital',
        'Oficina Corpotur Miranda – Los Teques, Estado Miranda',
        'Teléfono: 0212-5091234',
        'Correo: soporte.central@cotatur.gob.ve',
      ],
    },
    amazonica: {
      title: 'Soporte Región Amazónica',
      items: [
        'Oficina Corpotur Amazonas – Puerto Ayacucho',
        'Teléfono: 0248-5214567',
        'Correo: soporte.amazonica@cotatur.gob.ve',
      ],
    },
    insular: {
      title: 'Soporte Región Insular',
      items: [
        'Oficina Corpotur Nueva Esparta – La Asunción, Isla de Margarita',
        'Teléfono: 0295-2617890',
        'Correo: soporte.insular@cotatur.gob.ve',
      ],
    },
    oriental: {
      title: 'Soporte Región Oriental',
      items: [
        'Oficina Corpotur Anzoátegui – Barcelona, Estado Anzoátegui',
        'Oficina Corpotur Sucre – Cumaná, Estado Sucre',
        'Correo: soporte.oriental@cotatur.gob.ve',
      ],
    },
  },
  configuracion: {
    national: {
      title: 'Configuración Nacional',
      items: [
        'Usuarios del sistema a nivel nacional',
        'Roles y permisos globales',
        'Catálogo geográfico completo de todas las regiones',
        'Corporaciones: COTATUR y todas las corpotures',
      ],
    },
    los_andes: {
      title: 'Configuración Región Los Andes',
      items: [
        'Usuarios asignados a la región Los Andes',
        'Corporaciones vinculadas: COTATUR, Corpotur Mérida, Turismo Mérida',
        'Municipios: Mérida, Tovar, San Cristóbal, Jáuregui, Ayacucho',
      ],
    },
    llanos: {
      title: 'Configuración Región Llanos',
      items: [
        'Usuarios asignados a la región Llanos',
        'Corporaciones vinculadas: Corpotur Llanos',
        'Municipios: San Fernando, Calabozo, Achaguas',
      ],
    },
    eje: {
      title: 'Configuración Eje Zulia-Lara-Falcón',
      items: [
        'Usuarios asignados al Eje Zulia-Lara-Falcón',
        'Corporaciones: Corpotur Zulia, Corpotur Lara, Corpotur Falcón',
        'Municipios: Maracaibo, Barquisimeto, Coro, Miranda',
      ],
    },
    central: {
      title: 'Configuración Región Central',
      items: [
        'Usuarios asignados a la Región Central',
        'Corporaciones: Corpotur Caracas, Corpotur Miranda',
        'Municipios: Libertador, Caracas, Los Salias',
      ],
    },
    amazonica: {
      title: 'Configuración Región Amazónica',
      items: [
        'Usuarios asignados a la Región Amazónica',
        'Corporaciones: Corpotur Amazonas',
        'Municipios: Gran Sabana, Atabapo, Alto Orinoco',
      ],
    },
    insular: {
      title: 'Configuración Región Insular',
      items: [
        'Usuarios asignados a la Región Insular',
        'Corporaciones: Corpotur Nueva Esparta',
        'Municipios: Maneiro, Mariño, Arismendi',
      ],
    },
    oriental: {
      title: 'Configuración Región Oriental',
      items: [
        'Usuarios asignados a la Región Oriental',
        'Corporaciones: Corpotur Anzoátegui, Corpotur Sucre, Corpotur Monagas',
        'Municipios: Barcelona, Cumaná, Maturín',
      ],
    },
  },
}

export function getRegionContent(moduleKey, regionId) {
  const moduleData = regionModules[moduleKey]
  if (!moduleData) return null
  const regionData = moduleData[regionId] || moduleData['national'] || null
  const baseInfo = regionBaseInfo[regionId] || regionBaseInfo['national']
  const corps = corporationsByRegion[regionId] || corporationsByRegion['national']
  return {
    ...regionData,
    description: baseInfo.description,
    color: baseInfo.color,
    corporations: corps,
  }
}
