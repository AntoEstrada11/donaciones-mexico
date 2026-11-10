/** Dominio institucional para personal del panel (admin / editor). */
export const STAFF_EMAIL_DOMAIN = 'mx.universal.org'

export function isInstitutionalStaffEmail(email: string): boolean {
  const normalized = String(email || '').trim().toLowerCase()
  return normalized.endsWith(`@${STAFF_EMAIL_DOMAIN}`)
}
