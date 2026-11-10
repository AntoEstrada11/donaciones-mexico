/**
 * RFC SAT: persona física (13) o moral (12).
 * Valida formato y fecha de nacimiento/constitución. No consulta el SAT:
 * no hay API pública que reciba el RFC del donante sin encargada no declarada.
 */

const FISICA = /^[A-ZÑ&]{4}\d{6}[A-Z0-9]{3}$/
const MORAL = /^[A-ZÑ&]{3}\d{6}[A-Z0-9]{3}$/

function isCalendarDate(yy: string, mm: string, dd: string) {
  const month = Number(mm)
  const day = Number(dd)
  if (month < 1 || month > 12 || day < 1 || day > 31) return false
  const year = Number(yy) + (Number(yy) > 30 ? 1900 : 2000)
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
}

export function isWellFormedRfc(rfc: string) {
  const value = rfc.trim().toUpperCase()
  if (FISICA.test(value)) {
    return isCalendarDate(value.slice(4, 6), value.slice(6, 8), value.slice(8, 10))
  }
  if (MORAL.test(value)) {
    return isCalendarDate(value.slice(3, 5), value.slice(5, 7), value.slice(7, 9))
  }
  return false
}
