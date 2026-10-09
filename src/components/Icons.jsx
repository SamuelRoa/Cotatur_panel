const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: false,
}

const Svg = ({ size = 20, children, ...rest }) => (
  <svg {...base} width={size} height={size} {...rest}>{children}</svg>
)

/* --- Categorías de prestadores ------------------------------------------ */
export const IconHotel = (p) => (
  <Svg {...p}><path d="M3 20V8.5" /><path d="M3 12.5h18V20" /><path d="M21 20v-4.2a3 3 0 0 0-2.1-2.85L13 11" /><path d="M3 8.5 13 5l2 1.6" /><path d="M6.5 16.5h2M11 16.5h2M15.5 16.5h2" /></Svg>
)
export const IconFood = (p) => (
  <Svg {...p}><path d="M6 3v8a3 3 0 0 0 6 0V3" /><path d="M9 11v10" /><path d="M17 3c-1.7 0-2.5 1.6-2.5 3.5S15 10 17 10s2.5-1.6 2.5-3.5S18.7 3 17 3z" /><path d="M17 10v11" /></Svg>
)
export const IconAgency = (p) => (
  <Svg {...p}><path d="M3 20h18" /><path d="M5 20V9l7-4 7 4v11" /><path d="M10 20v-5h4v5" /><path d="M3.5 9h17" /></Svg>
)
export const IconTransport = (p) => (
  <Svg {...p}><rect x="3" y="5" width="18" height="11" rx="2" /><path d="M3 11h18" /><circle cx="7.5" cy="14" r="1" /><circle cx="16.5" cy="14" r="1" /><path d="M6 16v2.5M18 16v2.5" /><path d="M5 8.5h3.5M9 5v3" /></Svg>
)
export const IconGuide = (p) => (
  <Svg {...p}><circle cx="12" cy="8" r="3.2" /><path d="M5 20a7 7 0 0 1 14 0" /><path d="M12 11.2V20" /></Svg>
)
export const IconEntertainment = (p) => (
  <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M10 9.2 15 12l-5 2.8z" /></Svg>
)
export const IconOther = (p) => (
  <Svg {...p}><rect x="3" y="4" width="18" height="16" rx="2.5" /><path d="M3 9h18" /><path d="M8 14h8" /></Svg>
)

/* --- Roles --------------------------------------------------------------- */
export const IconShield = (p) => (
  <Svg {...p}><path d="M12 3 20 6v5.5c0 4.6-3.2 8.3-8 9.5-4.8-1.2-8-4.9-8-9.5V6z" /><path d="m9 12 2 2 4-4" /></Svg>
)
export const IconCheckSeal = (p) => (
  <Svg {...p}><path d="M12 3 20 6v5.5c0 4.6-3.2 8.3-8 9.5-4.8-1.2-8-4.9-8-9.5V6z" /><path d="m9 12 2 2 4-4" /><path d="M15.5 3.5 17 5l3-2" /></Svg>
)
export const IconEditor = (p) => (
  <Svg {...p}><path d="M4 20h4l10-10-4-4L4 16z" /><path d="m14 6 4 4" /><path d="M20 20h-6" /></Svg>
)
export const IconSupport = (p) => (
  <Svg {...p}><path d="M4 13a8 8 0 0 1 16 0" /><rect x="2.5" y="13" width="4.5" height="6" rx="2" /><rect x="17" y="13" width="4.5" height="6" rx="2" /><path d="M20 19a3 3 0 0 1-3 3h-3" /></Svg>
)

/* --- Interfaz ------------------------------------------------------------ */
export const IconSun = (p) => (
  <Svg {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.2 5.2l1.6 1.6M17.2 17.2l1.6 1.6M18.8 5.2l-1.6 1.6M6.8 17.2l-1.6 1.6" /></Svg>
)
export const IconMoon = (p) => (
  <Svg {...p}><path d="M20 14.5A8.2 8.2 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5z" /></Svg>
)
export const IconMonitor = (p) => (
  <Svg {...p}><rect x="2.5" y="4" width="19" height="12.5" rx="2" /><path d="M9 20h6M12 16.5V20" /></Svg>
)
export const IconPin = (p) => (
  <Svg {...p}><path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z" /><circle cx="12" cy="10" r="2.6" /></Svg>
)
export const IconUsers = (p) => (
  <Svg {...p}><circle cx="9" cy="8" r="3.2" /><path d="M3 19a6 6 0 0 1 12 0" /><path d="M16 5.5a3.2 3.2 0 0 1 0 6" /><path d="M17.5 14.2A5.6 5.6 0 0 1 21 19" /></Svg>
)
export const IconStar = (p) => (
  <Svg {...p}><path d="m12 3.6 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.8l5.9-.9z" /></Svg>
)
export const IconDot = (p) => (
  <Svg {...p}><circle cx="12" cy="12" r="7" /><circle cx="12" cy="12" r="2.4" fill="currentColor" stroke="none" /></Svg>
)
export const IconTrend = (p) => (
  <Svg {...p}><path d="M3 17.5 9.5 11l4 4L21 7.5" /><path d="M16 7.5h5v5" /></Svg>
)
export const IconArrowLeft = (p) => (
  <Svg {...p}><path d="M19 12H5" /><path d="m11 6-6 6 6 6" /></Svg>
)
export const IconArrowRight = (p) => (
  <Svg {...p}><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></Svg>
)
export const IconCheck = (p) => (
  <Svg {...p} strokeWidth={2.4}><path d="m5 12.5 4.5 4.5L19 7" /></Svg>
)

/* --- Selector de categoría ---------------------------------------------- */
export const CATEGORY_ICONS = {
  'Alojamiento Turístico': IconHotel,
  'Gastronomía Regional': IconFood,
  'Agencia de Viajes': IconAgency,
  'Agencia de Turismo': IconAgency,
  'Transporte Turístico': IconTransport,
  'Guía de Turismo': IconGuide,
  'Entretenimiento': IconEntertainment,
}

const GENERIC_BY_KEYWORD = [
  ['alojamiento', IconHotel],
  ['hotel', IconHotel],
  ['gastronom', IconFood],
  ['restaurante', IconFood],
  ['agencia', IconAgency],
  ['transporte', IconTransport],
  ['guia', IconGuide],
  ['entretenimiento', IconEntertainment],
]

export function CategoryIcon({ category, size = 20, ...rest }) {
  const key = String(category || '').trim()
  let Comp = CATEGORY_ICONS[key]
  if (!Comp) {
    const lower = key.toLowerCase()
    const hit = GENERIC_BY_KEYWORD.find(([kw]) => lower.includes(kw))
    Comp = hit ? hit[1] : IconOther
  }
  return <Comp size={size} {...rest} />
}

export function RoleIcon({ role, size = 32, ...rest }) {
  const name = String(role || '').toLowerCase()
  let Comp = IconSupport
  if (name.includes('admin')) Comp = IconShield
  else if (name.includes('validad')) Comp = IconCheckSeal
  else if (name.includes('editor')) Comp = IconEditor
  return <Comp size={size} {...rest} />
}
