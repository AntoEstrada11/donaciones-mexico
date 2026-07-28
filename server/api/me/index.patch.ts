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

  const body = await readBody(event)
  const name = body?.name !== undefined ? String(body.name).trim() : (profile.name || '')
  const phoneRaw = body?.phone !== undefined ? String(body.phone || '').trim() : (profile.phone || '')
  const phoneDigits = phoneRaw ? normalizePhone(phoneRaw) : ''
  const phone = phoneDigits || null
  const street = body?.street !== undefined ? String(body.street || '').trim() || null : profile.street
  const city = body?.city !== undefined ? String(body.city || '').trim() || null : profile.city
  const state = body?.state !== undefined ? String(body.state || '').trim() || null : profile.state
  const zip = body?.zip !== undefined ? String(body.zip || '').trim() || null : profile.zip
  const rfc = body?.rfc !== undefined ? String(body.rfc || '').trim() || null : profile.rfc

  if (!name) {
    throw createError({ statusCode: 400, statusMessage: 'El nombre es requerido' })
  }

  if (phone) {
    await assertPhoneAvailable(phone, user.id)
  }

  if (profile.odoo_partner_id) {
    await updateOdooPartner(profile.odoo_partner_id, {
      name,
      phone: phone || undefined,
      street: street || undefined,
      city: city || undefined,
      zip: zip || undefined,
      rfc: rfc || undefined,
    })
  }

  const profileComplete = Boolean(phone && name)
  const admin = getSupabaseAdmin()

  const { data: updated, error } = await admin
    .from('profiles')
    .update({
      name,
      phone,
      street,
      city,
      state,
      zip,
      rfc,
      profile_complete: profileComplete,
    })
    .eq('id', user.id)
    .select('*')
    .single()

  if (error) {
    if (error.code === '23505') {
      throw createError({ statusCode: 409, statusMessage: 'Este teléfono ya está registrado' })
    }
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  if (isOdooConfigured() && updated.odoo_partner_id) {
    const partner = await readOdooPartner(updated.odoo_partner_id)
    if (partner) {
      return {
        ...partner,
        id: updated.id,
        email: updated.email,
        state: state || partner.state,
        profileComplete: partner.profileComplete || profileComplete,
        source: 'odoo',
      }
    }
  }

  return mapProfileToDonor(updated)
})
