/**
 * Normaliza nombres geográficos para comparar duplicados sin importar
 * mayúsculas, minúsculas, acentos ni espacios repetidos.
 * Ej: "SAN  Cristóbal " y "san cristobal" se consideran el mismo nombre.
 */
export function normalizeGeoName(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}
