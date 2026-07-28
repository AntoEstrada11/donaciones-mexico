import { serverSupabaseUser } from '#supabase/server'
import type { DonorProfile } from '~/types'

export default defineEventHandler(async (event): Promise<DonorProfile> => {
  const user = await serverSupabaseUser(event)
  if (!user?.id) {
    throw createError({ statusCode: 401, statusMessage: 'No autenticado' })
  }

  const profile = await getProfileByUserId(user.id)
  if (!profile) {
    throw createError({ statusCode: 404, statusMessage: 'Perfil no encontrado' })
  }

  if (isOdooConfigured() && profile.odoo_partner_id) {
    const partner = await readOdooPartner(profile.odoo_partner_id)
    if (partner) {
      return {
        ...partner,
        id: profile.id,
        email: profile.email,
        profileComplete: partner.profileComplete || profile.profile_complete,
        source: 'odoo',
      }
    }
  }

  return mapProfileToDonor(profile)
})
