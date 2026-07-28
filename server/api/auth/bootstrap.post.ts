import { serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user?.id || !user.email) {
    throw createError({ statusCode: 401, statusMessage: 'No autenticado' })
  }

  const email = normalizeEmail(user.email)
  let profile = await getProfileByUserId(user.id)

  const admin = getSupabaseAdmin()

  if (!profile) {
    const name = (user.user_metadata?.name as string) || email.split('@')[0]
    const { data, error } = await admin.from('profiles').upsert({
      id: user.id,
      email,
      name,
    }, { onConflict: 'id' }).select('*').single()

    if (error) {
      throw createError({ statusCode: 500, statusMessage: error.message })
    }
    profile = data
  }

  if (profile.odoo_partner_id) {
    return mapProfileToDonor(profile)
  }

  const odooPartnerId = await upsertOdooPartner({
    name: profile.name || email.split('@')[0],
    email,
    phone: profile.phone || undefined,
  })

  const { data: updated, error: updateError } = await admin
    .from('profiles')
    .update({ odoo_partner_id: odooPartnerId })
    .eq('id', user.id)
    .select('*')
    .single()

  if (updateError) {
    throw createError({ statusCode: 500, statusMessage: updateError.message })
  }

  return mapProfileToDonor(updated)
})
