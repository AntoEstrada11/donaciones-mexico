/**
 * Límites y sanitización de campos de formulario.
 * Alineados al esquema PostgreSQL y a formatos habituales en México.
 */

export const FIELD_LIMITS = {
  email: { max: 255 },
  password: { min: 6, max: 128 },
  name: { min: 1, max: 160 },
  phone: { maxDisplay: 20, minDigits: 10, maxDigits: 15 },
  street: { max: 200 },
  city: { max: 120 },
  state: { max: 120 },
  zip: { length: 5 },
  rfc: { min: 12, max: 13 },
  fiscalName: { min: 1, max: 160 },
  taxRegime: { max: 8 },
  cfdiUse: { max: 8 },
  amount: { min: 1, max: 999_999.99, maxDecimals: 2, maxWholeDigits: 6 },
  search: { max: 100 },
  heroImage: {
    maxBytes: 3 * 1024 * 1024,
    maxAlt: 160,
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp'] as const,
  },
  site: {
    contactPhone: { max: 40 },
    contactEmail: { max: 255 },
    speiBank: { max: 120 },
    speiBeneficiary: { max: 200 },
    speiClabe: { length: 18 },
    speiConcept: { max: 80 },
  },
} as const

/** RFC persona moral (12) o física (13). */
const RFC_PATTERN = /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/

export function onlyDigits(value: string) {
  return value.replace(/\D/g, '')
}

export function sanitizeEmailInput(value: string) {
  return value.trim().slice(0, FIELD_LIMITS.email.max).toLowerCase()
}

export function isValidEmail(value: string) {
  const email = sanitizeEmailInput(value)
  if (!email || email.length > FIELD_LIMITS.email.max) return false
  // Básico: local@dominio.tld — evita aceptar solo "@" o texto sin dominio.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function sanitizeNameInput(value: string) {
  return value.replace(/\s+/g, ' ').slice(0, FIELD_LIMITS.name.max)
}

export function isValidName(value: string) {
  const name = value.trim()
  return name.length >= FIELD_LIMITS.name.min && name.length <= FIELD_LIMITS.name.max
}

export function sanitizePasswordInput(value: string) {
  return value.slice(0, FIELD_LIMITS.password.max)
}

export function isValidPassword(value: string) {
  return value.length >= FIELD_LIMITS.password.min && value.length <= FIELD_LIMITS.password.max
}

/** Teléfono: dígitos y separadores habituales (+, espacios, guiones, paréntesis). */
export function sanitizePhoneInput(value: string) {
  return value.replace(/[^\d+\-\s()]/g, '').slice(0, FIELD_LIMITS.phone.maxDisplay)
}

export function isValidPhone(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return true
  const digits = onlyDigits(trimmed)
  return digits.length >= FIELD_LIMITS.phone.minDigits && digits.length <= FIELD_LIMITS.phone.maxDigits
}

export function sanitizeStreetInput(value: string) {
  return value.slice(0, FIELD_LIMITS.street.max)
}

export function sanitizeCityInput(value: string) {
  return value.slice(0, FIELD_LIMITS.city.max)
}

export function sanitizeStateInput(value: string) {
  return value.slice(0, FIELD_LIMITS.state.max)
}

export function sanitizeZipInput(value: string) {
  return onlyDigits(value).slice(0, FIELD_LIMITS.zip.length)
}

export function isValidZip(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return true
  return /^\d{5}$/.test(trimmed)
}

export function sanitizeRfcInput(value: string) {
  return value
    .toUpperCase()
    .replace(/[^A-ZÑ&0-9]/g, '')
    .slice(0, FIELD_LIMITS.rfc.max)
}

export function isValidRfc(value: string) {
  const rfc = value.trim().toUpperCase()
  if (!rfc) return true
  if (rfc.length < FIELD_LIMITS.rfc.min || rfc.length > FIELD_LIMITS.rfc.max) return false
  return RFC_PATTERN.test(rfc)
}

export function sanitizeSearchInput(value: string) {
  return value.slice(0, FIELD_LIMITS.search.max)
}

/**
 * Monto: solo dígitos y un punto, máx. 2 decimales y tope de enteros
 * para no superar FIELD_LIMITS.amount.max al escribir.
 */
export function sanitizeAmountInput(value: string) {
  const { maxDecimals, maxWholeDigits } = FIELD_LIMITS.amount
  let cleaned = value.replace(/[^\d.]/g, '')
  const [rawWhole = '', ...rest] = cleaned.split('.')
  const whole = rawWhole.slice(0, maxWholeDigits)
  if (rest.length > 0) {
    return `${whole}.${rest.join('').slice(0, maxDecimals)}`
  }
  return whole
}

export function parseAmount(value: string): number | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  const parsed = Number(trimmed)
  if (!Number.isFinite(parsed)) return null
  return parsed
}

export function isValidAmount(value: number) {
  const { min, max } = FIELD_LIMITS.amount
  if (!Number.isFinite(value)) return false
  // Evitar basura de punto flotante: comparar a 2 decimales.
  const cents = Math.round(value * 100)
  return cents >= Math.round(min * 100) && cents <= Math.round(max * 100)
}

export function formatAmountMaxLabel() {
  return FIELD_LIMITS.amount.max.toLocaleString('es-MX', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
}

export function sanitizeSitePhoneInput(value: string) {
  return value.replace(/[^\d+\-\s()]/g, '').slice(0, FIELD_LIMITS.site.contactPhone.max)
}

export function isValidSitePhone(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return false
  const digits = onlyDigits(trimmed)
  return digits.length >= FIELD_LIMITS.phone.minDigits && digits.length <= FIELD_LIMITS.phone.maxDigits
}

export function sanitizeClabeInput(value: string) {
  return onlyDigits(value).slice(0, FIELD_LIMITS.site.speiClabe.length)
}

export function isValidClabe(value: string) {
  return /^\d{18}$/.test(value.trim())
}

export function sanitizeSpeiBankInput(value: string) {
  return value.replace(/\s+/g, ' ').trim().slice(0, FIELD_LIMITS.site.speiBank.max)
}

export function sanitizeSpeiBeneficiaryInput(value: string) {
  return value.replace(/\s+/g, ' ').trim().slice(0, FIELD_LIMITS.site.speiBeneficiary.max)
}

export function sanitizeSpeiConceptInput(value: string) {
  return value.replace(/\s+/g, ' ').trim().slice(0, FIELD_LIMITS.site.speiConcept.max)
}
