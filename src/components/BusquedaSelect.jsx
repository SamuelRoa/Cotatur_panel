import { useState, useRef, useEffect } from 'react'

/**
 * Combobox con búsqueda integrada y lista desplazable.
 * Pensado para catálogos largos (ej. los 29 municipios de Táchira): el usuario
 * escribe para filtrar y la lista se desplaza, sin desplegar todo de golpe.
 *
 * Props:
 *   - value: valor seleccionado (coincide con `options[].value`).
 *   - onChange: recibe el valor seleccionado.
 *   - options: [{ value, label }]
 *   - placeholder: texto cuando no hay selección.
 *   - disabled, className, ariaLabel.
 */
const normalize = (v) =>
  String(v ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()

export default function BusquedaSelect({
  value,
  onChange,
  options = [],
  placeholder = 'Buscar…',
  disabled = false,
  className = 'form-modal-select',
  ariaLabel,
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const boxRef = useRef(null)
  const listRef = useRef(null)

  const selected = options.find((o) => String(o.value) === String(value))
  const filtered = query
    ? options.filter((o) => normalize(o.label).includes(normalize(query)))
    : options

  // Cerrar al hacer clic fuera
  useEffect(() => {
    if (!open) return
    const onDoc = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  // Al abrir, desplazar hasta la opción seleccionada (sin saltar la página)
  useEffect(() => {
    if (!open || !listRef.current) return
    const el = listRef.current.querySelector('[data-selected="true"]')
    if (el) el.scrollIntoView({ block: 'nearest' })
  }, [open])

  const pick = (opt) => {
    onChange(opt.value)
    setQuery('')
    setOpen(false)
  }

  return (
    <div ref={boxRef} style={{ position: 'relative' }}>
      <input
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-label={ariaLabel}
        className={className}
        style={{ width: '100%', cursor: disabled ? 'not-allowed' : 'text' }}
        value={open ? query : (selected?.label ?? '')}
        placeholder={selected ? selected.label : placeholder}
        disabled={disabled}
        onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
        onFocus={() => { if (!disabled) { setOpen(true); setQuery('') } }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && filtered.length > 0) {
            e.preventDefault()
            pick(filtered[0])
          }
          if (e.key === 'Escape') { setOpen(false); setQuery('') }
        }}
      />
      {open && !disabled && (
        <div ref={listRef} className="bsel-list" role="listbox">
          {filtered.length === 0 ? (
            <div className="bsel-empty">Sin resultados para «{query}»</div>
          ) : (
            filtered.map((o) => (
              <button
                type="button"
                key={o.value}
                data-selected={String(o.value) === String(value)}
                className={'bsel-item' + (String(o.value) === String(value) ? ' bsel-item-active' : '')}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(o)}
              >
                {o.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
