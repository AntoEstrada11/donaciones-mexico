import { eq } from 'drizzle-orm'
import { siteSettings } from '../database/schema'
import type { SiteSettings } from '~/types'
import { DEFAULT_SITE_SETTINGS } from '../../utils/siteSettingsDefaults'
import {
  isValidClabe,
  isValidEmail,
  isValidSitePhone,
  sanitizeClabeInput,
  sanitizeEmailInput,
  sanitizeSitePhoneInput,
  sanitizeSpeiBankInput,
  sanitizeSpeiBeneficiaryInput,
  sanitizeSpeiConceptInput,
} from '../../utils/fieldLimits'

export { DEFAULT_SITE_SETTINGS } from '../../utils/siteSettingsDefaults'

function toSiteSettings(row: typeof siteSettings.$inferSelect): SiteSettings {
  return {
    contactPhone: row.contactPhone,
    contactEmail: row.contactEmail,
    speiBank: row.speiBank,
    speiBeneficiary: row.speiBeneficiary,
    speiClabe: row.speiClabe,
    speiConcept: row.speiConcept,
    updatedAt: row.updatedAt.toISOString(),
  }
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const db = useDatabase()
  const [row] = await db.select().from(siteSettings).where(eq(siteSettings.id, 1)).limit(1)

  if (row) return toSiteSettings(row)

  const [created] = await db
    .insert(siteSettings)
    .values({ id: 1, ...DEFAULT_SITE_SETTINGS })
    .onConflictDoNothing()
    .returning()

  if (created) return toSiteSettings(created)

  const [again] = await db.select().from(siteSettings).where(eq(siteSettings.id, 1)).limit(1)
  if (!again) {
    throw createError({ statusCode: 500, statusMessage: 'No se pudieron cargar los datos del sitio' })
  }
  return toSiteSettings(again)
}

export interface SiteSettingsInput {
  contactPhone?: string
  contactEmail?: string
  speiBank?: string
  speiBeneficiary?: string
  speiClabe?: string
  speiConcept?: string
}

export async function updateSiteSettings(input: SiteSettingsInput): Promise<SiteSettings> {
  const current = await getSiteSettings()

  const contactPhone = input.contactPhone !== undefined
    ? sanitizeSitePhoneInput(input.contactPhone).trim()
    : current.contactPhone
  const contactEmail = input.contactEmail !== undefined
    ? sanitizeEmailInput(input.contactEmail)
    : current.contactEmail
  const speiBank = input.speiBank !== undefined
    ? sanitizeSpeiBankInput(input.speiBank)
    : current.speiBank
  const speiBeneficiary = input.speiBeneficiary !== undefined
    ? sanitizeSpeiBeneficiaryInput(input.speiBeneficiary)
    : current.speiBeneficiary
  const speiClabe = input.speiClabe !== undefined
    ? sanitizeClabeInput(input.speiClabe)
    : current.speiClabe
  const speiConcept = input.speiConcept !== undefined
    ? sanitizeSpeiConceptInput(input.speiConcept)
    : current.speiConcept

  if (!isValidSitePhone(contactPhone)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'El teléfono de contacto debe tener entre 10 y 15 dígitos',
    })
  }
  if (!isValidEmail(contactEmail)) {
    throw createError({ statusCode: 400, statusMessage: 'Ingrese un correo de contacto válido' })
  }
  if (!speiBank) {
    throw createError({ statusCode: 400, statusMessage: 'El banco es requerido' })
  }
  if (!speiBeneficiary) {
    throw createError({ statusCode: 400, statusMessage: 'El beneficiario es requerido' })
  }
  if (!isValidClabe(speiClabe)) {
    throw createError({ statusCode: 400, statusMessage: 'La CLABE debe tener exactamente 18 dígitos' })
  }
  if (!speiConcept) {
    throw createError({ statusCode: 400, statusMessage: 'El concepto SPEI es requerido' })
  }

  const db = useDatabase()
  const [row] = await db
    .insert(siteSettings)
    .values({
      id: 1,
      contactPhone,
      contactEmail,
      speiBank,
      speiBeneficiary,
      speiClabe,
      speiConcept,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: siteSettings.id,
      set: {
        contactPhone,
        contactEmail,
        speiBank,
        speiBeneficiary,
        speiClabe,
        speiConcept,
        updatedAt: new Date(),
      },
    })
    .returning()

  return toSiteSettings(row)
}
