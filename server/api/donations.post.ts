import { serverSupabaseUser } from '#supabase/server'
import type { Campaign, Donation } from '~/types'
import campaigns from '../data/campaigns.json'

function buildPaymentReference(userId: string, method: string) {
  const short = userId.replace(/-/g, '').slice(0, 6).toUpperCase()
  const stamp = Date.now().toString(36).toUpperCase().slice(-6)
  const prefix = method === 'spei' ? 'SPEI' : 'CARD'
  return `${prefix}-${short}-${stamp}`
}

export default defineEventHandler(async (event): Promise<Donation> => {
  const user = await serverSupabaseUser(event)
  if (!user?.id) {
    throw createError({ statusCode: 401, statusMessage: 'Debe iniciar sesión para donar' })
  }

  const body = await readBody(event)

  if (!body?.churchId || !body?.campaignId || !body?.amount) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Iglesia, campaña y monto son requeridos',
    })
  }

  const amount = Number(body.amount)
  if (!Number.isFinite(amount) || amount <= 0 || amount > 500000) {
    throw createError({
      statusCode: 400,
      statusMessage: 'El monto debe ser mayor a cero y razonable',
    })
  }

  const campaignList = campaigns as Campaign[]
  const campaign = campaignList.find(c => c.id === String(body.campaignId))
  if (!campaign) {
    throw createError({ statusCode: 400, statusMessage: 'Campaña no válida' })
  }

  const method = body.method === 'card' ? 'card' : 'spei'
  const churchName = body.churchName ? String(body.churchName).trim().slice(0, 200) : null
  const paymentReference = buildPaymentReference(user.id, method)

  let profile = await getProfileByUserId(user.id)
  if (!profile) {
    const email = normalizeEmail(user.email || '')
    if (!email) {
      throw createError({ statusCode: 400, statusMessage: 'Complete su perfil antes de donar' })
    }
    const admin = getSupabaseAdmin()
    const name = (user.user_metadata?.name as string) || email.split('@')[0]
    const { data, error } = await admin.from('profiles').upsert({
      id: user.id,
      email,
      name,
    }, { onConflict: 'id' }).select('*').single()
    if (error || !data) {
      throw createError({ statusCode: 500, statusMessage: error?.message || 'No se pudo crear el perfil' })
    }
    profile = data
  }

  if (!profile.odoo_partner_id) {
    const email = normalizeEmail(user.email || profile.email)
    const odooPartnerId = await upsertOdooPartner({
      name: profile.name || email.split('@')[0],
      email,
      phone: profile.phone || undefined,
    })
    const admin = getSupabaseAdmin()
    await admin.from('profiles').update({ odoo_partner_id: odooPartnerId }).eq('id', user.id)
  }

  const admin = getSupabaseAdmin()
  const { data, error } = await admin
    .from('donations')
    .insert({
      user_id: user.id,
      church_id: String(body.churchId).slice(0, 64),
      church_name: churchName,
      campaign_id: campaign.id,
      campaign_name: campaign.name,
      amount,
      currency: 'MXN',
      status: 'pending',
      method,
      payment_reference: paymentReference,
    })
    .select('*')
    .single()

  if (error || !data) {
    throw createError({
      statusCode: 500,
      statusMessage: error?.message || 'No se pudo registrar la donación',
    })
  }

  return mapDonationRow(data as DonationRow)
})
