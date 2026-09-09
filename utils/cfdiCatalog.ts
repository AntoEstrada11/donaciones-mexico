/**
 * Catálogo mínimo CFDI 4.0 (texto). No se piden PDFs en este nivel.
 */

export const TAX_REGIMES = [
  { code: '605', label: 'Sueldos y salarios' },
  { code: '606', label: 'Arrendamiento' },
  { code: '607', label: 'Enajenación de bienes' },
  { code: '608', label: 'Demás ingresos' },
  { code: '610', label: 'Residentes en el extranjero' },
  { code: '612', label: 'Actividades empresariales y profesionales' },
  { code: '616', label: 'Sin obligaciones fiscales' },
  { code: '621', label: 'Incorporación fiscal' },
  { code: '625', label: 'Plataformas tecnológicas' },
  { code: '626', label: 'Régimen Simplificado de Confianza' },
  { code: '601', label: 'General de Ley (persona moral)' },
  { code: '603', label: 'Personas morales con fines no lucrativos' },
] as const

export const CFDI_USES = [
  { code: 'D04', label: 'Donativos' },
  { code: 'S01', label: 'Sin efectos fiscales' },
  { code: 'G03', label: 'Gastos en general' },
] as const

const REGIME_CODES = new Set<string>(TAX_REGIMES.map(item => item.code))
const USE_CODES = new Set<string>(CFDI_USES.map(item => item.code))

export function isValidTaxRegime(value: string) {
  return REGIME_CODES.has(value.trim())
}

export function isValidCfdiUse(value: string) {
  return USE_CODES.has(value.trim())
}
