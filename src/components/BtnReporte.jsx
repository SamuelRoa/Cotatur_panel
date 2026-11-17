/**
 * Botón estándar "Descargar Reporte" para los módulos del panel.
 * Genera un PDF con la identidad institucional COTATUR (lib/reportes.js).
 */
export default function BtnReporte({ onClick, cargando, etiqueta = 'Descargar Reporte' }) {
  return (
    <button
      type="button"
      className="btn-export"
      disabled={cargando}
      onClick={onClick}
      title="Genera un reporte PDF con la identidad institucional y espacios de firma"
    >
      {cargando ? 'Generando…' : etiqueta}
    </button>
  )
}
