import { serverSupabaseUser } from '#supabase/server'
import type { Donation } from '~/types'

export default defineEventHandler(async (event): Promise<Donation[]> => {
  const user = await serverSupabaseUser(event)
  if (!user?.id) {
    throw createError({ statusCode: 401, statusMessage: 'No autenticado' })
  }

  const admin = getSupabaseAdmin()
  const { data, error } = await admin
    .from('donations')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return (data || []).map(row => mapDonationRow(row as DonationRow))
})
