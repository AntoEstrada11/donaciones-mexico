import type { DonorProfile } from '~/types'

export default defineEventHandler(async (event) => {
  const session = requireSession(event)
  const user = await findUserByEmail(session.email)

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Usuario no encontrado' })
  }

  const body = await readBody(event)
  const name = body?.name !== undefined ? String(body.name).trim() : user.name
  const phoneRaw = body?.phone !== undefined ? String(body.phone || '').trim() : (user.phone || '')
  const phone = phoneRaw || undefined
  const street = body?.street !== undefined ? String(body.street || '').trim() : undefined
  const city = body?.city !== undefined ? String(body.city || '').trim() : undefined
  const state = body?.state !== undefined ? String(body.state || '').trim() : undefined
  const zip = body?.zip !== undefined ? String(body.zip || '').trim() : undefined
  const rfc = body?.rfc !== undefined ? String(body.rfc || '').trim() : undefined

  if (!name) {
    throw createError({ statusCode: 400, statusMessage: 'El nombre es requerido' })
  }

  if (phone) {
    const taken = await findUserByPhone(phone, user.email)
    if (taken) {
      throw createError({ statusCode: 409, statusMessage: 'Este teléfono ya está registrado' })
    }
  }

  await updateOdooPartner(user.odooPartnerId, {
    name,
    phone,
    street,
    city,
    zip,
    rfc,
  })

  const profileComplete = Boolean(phone && name)
  await updateUser(user.email, { name, phone, profileComplete })

  if (isOdooConfigured()) {
    const partner = await readOdooPartner(user.odooPartnerId)
    if (partner) {
      return {
        ...partner,
        email: user.email,
        state: state || partner.state,
        profileComplete: partner.profileComplete || profileComplete,
      } satisfies DonorProfile
    }
  }

  const profile: DonorProfile = {
    odooPartnerId: user.odooPartnerId,
    name,
    email: user.email,
    phone: phone || null,
    street: street || null,
    city: city || null,
    state: state || null,
    zip: zip || null,
    rfc: rfc || null,
    profileComplete,
    source: 'mock',
  }

  return profile
})
