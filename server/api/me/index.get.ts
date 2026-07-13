import type { DonorProfile } from '~/types'

export default defineEventHandler(async (event) => {
  const session = requireSession(event)
  const user = await findUserByEmail(session.email)

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Usuario no encontrado' })
  }

  if (isOdooConfigured()) {
    const partner = await readOdooPartner(user.odooPartnerId)
    if (partner) {
      return {
        ...partner,
        email: user.email,
        profileComplete: partner.profileComplete || user.profileComplete,
      } satisfies DonorProfile
    }
  }

  const profile: DonorProfile = {
    odooPartnerId: user.odooPartnerId,
    name: user.name,
    email: user.email,
    phone: user.phone ?? null,
    street: null,
    city: null,
    state: null,
    zip: null,
    rfc: null,
    profileComplete: user.profileComplete,
    source: 'mock',
  }

  return profile
})
