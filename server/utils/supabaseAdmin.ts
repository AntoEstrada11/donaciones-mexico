import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Donation, DonorProfile } from '~/types'

export interface ProfileRow {
  id: string
  email: string
  name: string | null
  phone: string | null
  odoo_partner_id: number | null
  profile_complete: boolean
  street: string | null
  city: string | null
  state: string | null
  zip: string | null
  rfc: string | null
}

export interface DonationRow {
  id: string
  user_id: string
  church_id: string
  church_name: string | null
  campaign_id: string
  campaign_name: string | null
  amount: number | string
  currency: string
  status: Donation['status']
  method: Donation['method']
  payment_reference: string | null
  created_at: string
}

export function mapDonationRow(row: DonationRow): Donation {
  return {
    id: row.id,
    userId: row.user_id,
    churchId: row.church_id,
    churchName: row.church_name,
    campaignId: row.campaign_id,
    campaignName: row.campaign_name,
    amount: Number(row.amount),
    currency: row.currency || 'MXN',
    status: row.status,
    method: row.method,
    paymentReference: row.payment_reference,
    createdAt: row.created_at,
  }
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export function normalizePhone(phone: string) {
  return phone.replace(/\D/g, '')
}

export function getSupabaseAdmin(): SupabaseClient {
  const config = useRuntimeConfig()
  const url = process.env.SUPABASE_URL || process.env.NUXT_PUBLIC_SUPABASE_URL || ''
  const key = String(config.supabaseServiceKey || process.env.SUPABASE_SERVICE_KEY || '')

  if (!url || !key) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Supabase no configurado (SUPABASE_URL / SUPABASE_SERVICE_KEY)',
    })
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

export function mapProfileToDonor(row: ProfileRow, source: DonorProfile['source'] = 'supabase'): DonorProfile {
  return {
    id: row.id,
    odooPartnerId: row.odoo_partner_id ?? 0,
    name: row.name || row.email.split('@')[0] || 'Donante',
    email: row.email,
    phone: row.phone,
    street: row.street,
    city: row.city,
    state: row.state,
    zip: row.zip,
    rfc: row.rfc,
    profileComplete: row.profile_complete,
    source,
  }
}

export async function getProfileByUserId(userId: string): Promise<ProfileRow | null> {
  const admin = getSupabaseAdmin()
  const { data, error } = await admin
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return data as ProfileRow | null
}

export async function assertPhoneAvailable(phone: string, excludeUserId?: string) {
  const digits = normalizePhone(phone)
  if (!digits) return

  const admin = getSupabaseAdmin()
  let query = admin.from('profiles').select('id, phone').not('phone', 'is', null)

  const { data, error } = await query
  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  const taken = (data || []).some((row) => {
    if (excludeUserId && row.id === excludeUserId) return false
    return row.phone && normalizePhone(row.phone) === digits
  })

  if (taken) {
    throw createError({ statusCode: 409, statusMessage: 'Este teléfono ya está registrado' })
  }
}
