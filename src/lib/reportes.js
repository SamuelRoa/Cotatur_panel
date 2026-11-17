import { jsPDF } from 'jspdf'
import cotaturLogo from '../assets/cotatur_logo.png'
import minturLogo from '../assets/mintur_logo.png'

/**
 * Generador de reportes PDF con identidad institucional MINTUR / COTATUR.
 *
 * Características:
 *  - Cinta patchwork del logo "TUR" como banda superior de cada página.
 *  - Logo MINTUR principal + COTATUR como acompañante corporativo.
 *  - Paleta institucional (verde #4C8C24, acentos del patchwork).
 *  - KPIs, secciones con tablas (ajuste de texto y paginación) y notas.
 *  - Bloques de firma (Elaborado / Revisado / Aprobado) con fecha.
 *  - Pie de página con numeración "Página X de Y".
 *
 * API principal: generarReportePdf({ titulo, subtitulo, region, marca,
 *   resumen, secciones, notas, firmas, nombreArchivo, orientacion })
 */

// =============================================
// PALETA INSTITUCIONAL (index.css)
// =============================================
export const PALETA = {
  primario: '#4C8C24',
  primarioOscuro: '#2A4F12',
  acento: '#00A3A6',
  texto: '#1C1E1A',
  textoSuave: '#566150',
  zebra: '#F2F7EE',
  borde: '#D8E4D2',
  // Cinta patchwork del logo "TUR" (mismo orden que --gradient-mosaic)
  mosaico: ['#E52320', '#F37021', '#FDC810', '#79B443', '#00A3A6', '#0054A6', '#7E2E90'],
}

const hexARgb = (hex) => {
  const limpio = String(hex || '').replace('#', '')
  const num = parseInt(limpio.length === 3 ? limpio.replace(/./g, (c) => c + c) : limpio, 16)
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255]
}

// =============================================
// CARGA DE LOGOS (fetch → dataURL, con caché)
// =============================================
const cacheLogos = new Map()

async function logoDataUrl(url) {
  if (cacheLogos.has(url)) return cacheLogos.get(url)
  const blob = await fetch(url).then((r) => {
    if (!r.ok) throw new Error(`No se pudo cargar el logo: ${url}`)
    return r.blob()
  })
  const dataUrl = await new Promise((resolver, rechazar) => {
    const lector = new FileReader()
    lector.onload = () => resolver(lector.result)
    lector.onerror = rechazar
    lector.readAsDataURL(blob)
  })
  cacheLogos.set(url, dataUrl)
  return dataUrl
}

/** Dimensiones naturales de una imagen (para escalar sin deformar). */
function medirImagen(url) {
  return new Promise((resolver) => {
    const img = new Image()
    img.onload = () => resolver({ w: img.naturalWidth, h: img.naturalHeight })
    img.onerror = () => resolver({ w: 1, h: 1 })
    img.src = url
  })
}

// =============================================
// TRAER TODAS LAS PÁGINAS (listados paginados)
// =============================================
/** Recorre la paginación del backend y junta todos los registros. */
export async function traerTodo(fetchFn, clave, params = {}, maxPaginas = 30) {
  const todo = []
  for (let pagina = 1; pagina <= maxPaginas; pagina++) {
    const res = await fetchFn({ ...params, pagina: undefined, page: pagina, limit: 100 })
    const bloque = res?.[clave] ?? []
    todo.push(...bloque)
    if (!res?.meta?.hasNextPage || bloque.length === 0) break
  }
  return todo
}

/** Usuario en sesión (localStorage) para el campo "Emitido por". */
export function usuarioActual() {
  try {
    const u = JSON.parse(localStorage.getItem('auth_user') || 'null')
    return u?.USUAR_NM || u?.USUAR_EM || u?.email || ''
  } catch {
    return ''
  }
}

// =============================================
// GENERADOR
// =============================================
export async function generarReportePdf({
  titulo,
  subtitulo = '',
  marca = 'MINTUR',
  region = '',
  usuario = '',
  resumen = [],      // [{ etiqueta, valor }]
  secciones = [],    // [{ titulo, columnas: [string|{titulo,ancho,alinear}], filas: [[string]] }]
  notas = [],        // strings de párrafo
  firmas,            // ['Elaborado por', 'Revisado por', 'Aprobado por']
  nombreArchivo = 'reporte.pdf',
  orientacion = 'p',
}) {
  const pdf = new jsPDF(orientacion, 'mm', 'a4')
  const pageW = pdf.internal.pageSize.getWidth()
  const pageH = pdf.internal.pageSize.getHeight()
  const marg = 14
  const maxW = pageW - marg * 2
  const bloquesFirma = firmas ?? ['Elaborado por', 'Revisado por']
  const fechaStr = new Date().toLocaleDateString('es-VE', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  let y = 0

  // --- Cabecera de página (banda + logos + título) ---
  const pintarCabecera = async () => {
    // Banda patchwork
    const anchoSegmento = pageW / PALETA.mosaico.length
    PALETA.mosaico.forEach((color, i) => {
      const [r, g, b] = hexARgb(color)
      pdf.setFillColor(r, g, b)
      pdf.rect(i * anchoSegmento, 0, anchoSegmento + 0.3, 3, 'F')
    })

    // Logos (escala proporcional): MINTUR principal, COTATUR acompañante
    try {
      const [mintur, cotatur, medMintur, medCotatur] = await Promise.all([
        logoDataUrl(minturLogo),
        logoDataUrl(cotaturLogo),
        medirImagen(minturLogo),
        medirImagen(cotaturLogo),
      ])
      const altoMintur = 34 * (medMintur.h / medMintur.w)
      pdf.addImage(mintur, 'PNG', marg, 8, 34, altoMintur)
      const anchoCotatur = 24
      const altoCotatur = anchoCotatur * (medCotatur.h / medCotatur.w)
      pdf.addImage(cotatur, 'PNG', pageW - marg - anchoCotatur, 8, anchoCotatur, altoCotatur)
      y = Math.max(8 + altoMintur, 8 + altoCotatur) + 2
    } catch {
      y = 14 // sin logos, seguimos
    }

    // Título + subtítulo
    pdf.setFontSize(17)
    pdf.setFont(undefined, 'bold')
    pdf.setTextColor(...hexARgb(PALETA.primarioOscuro))
    pdf.text(titulo, marg, y)
    y += 5.5
    pdf.setFontSize(9.5)
    pdf.setFont(undefined, 'normal')
    pdf.setTextColor(...hexARgb(PALETA.textoSuave))
    if (subtitulo) {
      pdf.text(pdf.splitTextToSize(subtitulo, maxW), marg, y)
      y += 4.5 * pdf.splitTextToSize(subtitulo, maxW).length
    }
    pdf.text(`Fecha de emisión: ${fechaStr}${region ? `  ·  Contexto: ${region}` : ''}`, marg, y)
    y += 4.5
    if (usuario) {
      pdf.text(`Emitido por: ${usuario}`, marg, y)
      y += 4.5
    }
    // Línea divisoria en verde institucional
    pdf.setDrawColor(...hexARgb(PALETA.primario))
    pdf.setLineWidth(0.6)
    pdf.line(marg, y, pageW - marg, y)
    pdf.setLineWidth(0.2)
    y += 7
  }

  // --- Pie de página (todas las páginas) ---
  const pintarPies = () => {
    const total = pdf.getNumberOfPages()
    for (let p = 1; p <= total; p++) {
      pdf.setPage(p)
      pdf.setDrawColor(...hexARgb(PALETA.borde))
      pdf.line(marg, pageH - 12, pageW - marg, pageH - 12)
      pdf.setFontSize(7.5)
      pdf.setFont(undefined, 'normal')
      pdf.setTextColor(...hexARgb(PALETA.textoSuave))
      pdf.text(`Sistema de Gestión Turística — ${marca}`, marg, pageH - 8)
      pdf.text(`Página ${p} de ${total}`, pageW - marg, pageH - 8, { align: 'right' })
      pdf.text(`Generado: ${new Date().toISOString().slice(0, 10)}`, pageW / 2, pageH - 8, { align: 'center' })
    }
  }

  // --- Espacio disponible ---
  const asegurarEspacio = (necesario) => {
    if (y + necesario > pageH - 22) {
      pdf.addPage()
      // Banda mínima en páginas de continuación
      const anchoSegmento = pageW / PALETA.mosaico.length
      PALETA.mosaico.forEach((color, i) => {
        const [r, g, b] = hexARgb(color)
        pdf.setFillColor(r, g, b)
        pdf.rect(i * anchoSegmento, 0, anchoSegmento + 0.3, 3, 'F')
      })
      y = 14
    }
  }

  await pintarCabecera()

  // --- KPIs ---
  if (resumen.length > 0) {
    const porFila = Math.min(resumen.length, 4)
    const anchoCaja = (maxW - (porFila - 1) * 4) / porFila
    for (let i = 0; i < resumen.length; i += porFila) {
      const fila = resumen.slice(i, i + porFila)
      asegurarEspacio(20)
      fila.forEach((kpi, j) => {
        const x = marg + j * (anchoCaja + 4)
        pdf.setFillColor(...hexARgb(PALETA.zebra))
        pdf.setDrawColor(...hexARgb(PALETA.borde))
        pdf.roundedRect(x, y, anchoCaja, 15, 2, 2, 'FD')
        pdf.setFontSize(7.5)
        pdf.setFont(undefined, 'normal')
        pdf.setTextColor(...hexARgb(PALETA.textoSuave))
        pdf.text(String(kpi.etiqueta).toUpperCase(), x + 3, y + 5)
        pdf.setFontSize(13)
        pdf.setFont(undefined, 'bold')
        pdf.setTextColor(...hexARgb(PALETA.primario))
        pdf.text(String(kpi.valor), x + 3, y + 11.5)
      })
      y += 20
    }
    y += 2
  }

  // --- Secciones ---
  const anchoTextoCol = (col) =>
    (typeof col === 'object' ? col.titulo : col)

  for (const seccion of secciones) {
    asegurarEspacio(28)
    pdf.setFontSize(11.5)
    pdf.setFont(undefined, 'bold')
    pdf.setTextColor(...hexARgb(PALETA.primarioOscuro))
    pdf.text(seccion.titulo, marg, y)
    y += 4

    const cols = seccion.columnas
    const pesos = cols.map((c) => (typeof c === 'object' && c.ancho ? c.ancho : 1))
    const sumaPesos = pesos.reduce((s, p) => s + p, 0)
    const anchos = pesos.map((p) => (maxW * p) / sumaPesos)

    // Encabezado de tabla
    asegurarEspacio(14)
    pdf.setFillColor(...hexARgb(PALETA.primario))
    pdf.rect(marg, y, maxW, 7, 'F')
    pdf.setFontSize(8)
    pdf.setFont(undefined, 'bold')
    pdf.setTextColor(255, 255, 255)
    let x = marg
    cols.forEach((col, i) => {
      const titulo = anchoTextoCol(col)
      const alinear = typeof col === 'object' && col.alinear === 'derecha' ? 'right' : 'left'
      pdf.text(titulo, alinear === 'right' ? x + anchos[i] - 2.5 : x + 2.5, y + 4.7, {
        align: alinear,
      })
      x += anchos[i]
    })
    y += 7

    // Filas
    pdf.setFont(undefined, 'normal')
    pdf.setFontSize(7.8)
    const filas = seccion.filas || []
    if (filas.length === 0) {
      pdf.setTextColor(...hexARgb(PALETA.textoSuave))
      pdf.text('Sin registros para mostrar.', marg + 2.5, y + 4)
      y += 9
    } else {
      filas.forEach((fila, idx) => {
        const celdas = cols.map((col, i) => {
          const crudo = String(fila[i] ?? '')
          const lineas = pdf.splitTextToSize(crudo, anchos[i] - 5)
          return { lineas: lineas.slice(0, 3), truncada: lineas.length > 3 }
        })
        const altoFila = Math.max(6.5, ...celdas.map((c) => c.lineas.length * 3.6 + 2.6))
        if (y + altoFila > pageH - 22) {
          pdf.addPage()
          const anchoSegmento = pageW / PALETA.mosaico.length
          PALETA.mosaico.forEach((color, i) => {
            const [r, g, b] = hexARgb(color)
            pdf.setFillColor(r, g, b)
            pdf.rect(i * anchoSegmento, 0, anchoSegmento + 0.3, 3, 'F')
          })
          y = 14
          // Repetir encabezado de tabla
          pdf.setFillColor(...hexARgb(PALETA.primario))
          pdf.rect(marg, y, maxW, 7, 'F')
          pdf.setFontSize(8)
          pdf.setFont(undefined, 'bold')
          pdf.setTextColor(255, 255, 255)
          let xr = marg
          cols.forEach((col, i) => {
            pdf.text(anchoTextoCol(col), xr + 2.5, y + 4.7)
            xr += anchos[i]
          })
          y += 7
          pdf.setFont(undefined, 'normal')
          pdf.setFontSize(7.8)
        }
        if (idx % 2 === 1) {
          pdf.setFillColor(...hexARgb(PALETA.zebra))
          pdf.rect(marg, y, maxW, altoFila, 'F')
        }
        pdf.setDrawColor(...hexARgb(PALETA.borde))
        pdf.rect(marg, y, maxW, altoFila)
        let xc = marg
        celdas.forEach((celda, i) => {
          const alinear = typeof cols[i] === 'object' && cols[i].alinear === 'derecha' ? 'right' : 'left'
          const texto = celda.truncada ? [...celda.lineas.slice(0, 2), '…'] : celda.lineas
          pdf.setTextColor(...hexARgb(PALETA.texto))
          pdf.text(texto, alinear === 'right' ? xc + anchos[i] - 2.5 : xc + 2.5, y + 4.2, {
            align: alinear,
          })
          xc += anchos[i]
        })
        y += altoFila
      })
    }
    y += 8
  }

  // --- Notas ---
  if (notas.length > 0) {
    asegurarEspacio(12)
    pdf.setFontSize(9)
    pdf.setFont(undefined, 'bold')
    pdf.setTextColor(...hexARgb(PALETA.primarioOscuro))
    pdf.text('Observaciones', marg, y)
    y += 5
    pdf.setFont(undefined, 'normal')
    pdf.setFontSize(8.5)
    pdf.setTextColor(...hexARgb(PALETA.texto))
    for (const nota of notas) {
      const lineas = pdf.splitTextToSize(`• ${nota}`, maxW)
      asegurarEspacio(lineas.length * 4)
      pdf.text(lineas, marg, y)
      y += lineas.length * 4 + 1
    }
    y += 4
  }

  // --- Bloques de firma ---
  const altoFirma = 42
  asegurarEspacio(altoFirma + 4)
  const n = bloquesFirma.length
  const anchoFirma = Math.min(58, (maxW - (n - 1) * 8) / n)
  const espacio = n > 1 ? (maxW - anchoFirma * n) / (n - 1) : 0
  bloquesFirma.forEach((cargo, i) => {
    const x = marg + i * (anchoFirma + espacio)
    const yLinea = y + 10
    pdf.setDrawColor(...hexARgb(PALETA.texto))
    pdf.setLineWidth(0.3)
    pdf.line(x, yLinea, x + anchoFirma, yLinea)
    pdf.setFontSize(8.5)
    pdf.setFont(undefined, 'bold')
    pdf.setTextColor(...hexARgb(PALETA.texto))
    pdf.text(cargo, x + anchoFirma / 2, yLinea + 4.5, { align: 'center' })
    pdf.setFont(undefined, 'normal')
    pdf.setFontSize(7.5)
    pdf.setTextColor(...hexARgb(PALETA.textoSuave))
    pdf.text('Nombre:', x, yLinea + 9)
    pdf.text('C.I.:', x, yLinea + 13)
    pdf.text('Fecha:', x, yLinea + 17)
    // Líneas de llenado
    pdf.setDrawColor(...hexARgb(PALETA.borde))
    pdf.setLineWidth(0.2)
    pdf.line(x + 11, yLinea + 9, x + anchoFirma, yLinea + 9)
    pdf.line(x + 8, yLinea + 13, x + anchoFirma, yLinea + 13)
    pdf.line(x + 10, yLinea + 17, x + anchoFirma, yLinea + 17)
  })
  y += altoFirma

  pintarPies()
  pdf.save(nombreArchivo)
}
