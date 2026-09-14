import {
  FIELD_LIMITS,
  isValidEmail,
  isValidName,
  isValidPassword,
  sanitizeEmailInput,
  sanitizeNameInput,
} from '../../../utils/fieldLimits'

const MAX_CONTACTS = 80

interface BulkContact {
  email?: string
  name?: string
  phone?: string
  wantsReceipt?: boolean
  fiscalName?: string
  rfc?: string
  zip?: string
  taxRegime?: string
  cfdiUse?: string
  street?: string
  city?: string
  state?: string
  marketing?: boolean
}

function statusOf(error: unknown): number | undefined {
  if (error && typeof error === 'object' && 'statusCode' in error) {
    return Number((error as { statusCode: number }).statusCode)
  }
  return undefined
}

export default defineEventHandler(async (event) => {
  assertNuxtDevOnly()

  const body = await readBody(event)
  const password = String(body?.password || '')
  const rawList = body?.contacts

  if (!isValidPassword(password)) {
    throw createError({
      statusCode: 400,
      statusMessage: `password debe tener entre ${FIELD_LIMITS.password.min} y ${FIELD_LIMITS.password.max} caracteres`,
    })
  }

  if (!Array.isArray(rawList) || rawList.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'contacts debe ser un arreglo con al menos un elemento',
    })
  }

  if (rawList.length > MAX_CONTACTS) {
    throw createError({
      statusCode: 400,
      statusMessage: `Máximo ${MAX_CONTACTS} contactos por petición`,
    })
  }

  const passwordHash = hashPassword(password)
  const created: Array<{ id: string, email: string }> = []
  const skipped: Array<{ index: number, reason: string }> = []

  for (let index = 0; index < rawList.length; index++) {
    const item = rawList[index] as BulkContact
    const email = sanitizeEmailInput(String(item?.email || ''))
    const name = sanitizeNameInput(String(item?.name || '').trim() || email.split('@')[0] || '')

    if (!isValidEmail(email) || !isValidName(name)) {
      skipped.push({ index, reason: 'invalid' })
      continue
    }

    try {
      const user = await createUser({
        email,
        name: name.trim(),
        passwordHash,
      })

      await recordConsentBundle({
        event,
        userId: user.id,
        marketing: item.marketing === true,
      })

      await updateDonorProfile(user.id, {
        phone: item.phone !== undefined ? String(item.phone) : undefined,
        wantsReceipt: item.wantsReceipt === true,
        fiscalName: item.fiscalName !== undefined ? String(item.fiscalName) : undefined,
        rfc: item.rfc !== undefined ? String(item.rfc) : undefined,
        zip: item.zip !== undefined ? String(item.zip) : undefined,
        taxRegime: item.taxRegime !== undefined ? String(item.taxRegime) : undefined,
        cfdiUse: item.cfdiUse !== undefined ? String(item.cfdiUse) : undefined,
        street: item.street !== undefined ? String(item.street) : undefined,
        city: item.city !== undefined ? String(item.city) : undefined,
        state: item.state !== undefined ? String(item.state) : undefined,
      })

      created.push({ id: user.id, email: user.email })
    }
    catch (error) {
      if (statusOf(error) === 409) {
        skipped.push({ index, reason: 'duplicate' })
        continue
      }
      if (statusOf(error) === 400) {
        skipped.push({ index, reason: 'invalid' })
        continue
      }
      throw error
    }
  }

  return {
    created: created.length,
    skipped: skipped.length,
    contacts: created,
    errors: skipped,
  }
})
