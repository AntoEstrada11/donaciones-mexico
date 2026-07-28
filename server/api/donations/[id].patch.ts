import { serverSupabaseUser } from '#supabase/server'
import type { Donation } from '~/types'

/** Demo: el donante confirma que ya transfirió (SPEI) → marca paid. */
export default defineEventHandler(async (event): Promise<Donation> => {
  const user = await serverSupabaseUser(event)
  if (!user?.id) {
    throw createError({ statusCode: 401, statusMessage: 'No autenticado' })
  }

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ID requerido' })
  }

  const body = await readBody(event).catch(() => ({}))
  const nextStatus = body?.status === 'paid' ? 'paid' : null
  if (!nextStatus) {
    throw createError({ statusCode: 400, statusMessage: 'Estado no permitido' })
  }

  const admin = getSupabaseAdmin()
  const { data: existing, error: findError } = await admin
    .from('donations')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (findError) {
    throw createError({ statusCode: 500, statusMessage: findError.message })
  }
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Donación no encontrada' })
  }
  if (existing.status !== 'pending') {
    throw createError({ statusCode: 409, statusMessage: 'La donación ya no está pendiente' })
  }

  const { data, error } = await admin
    .from('donations')
    .update({ status: nextStatus })
    .eq('id', id)
    .eq('user_id', user.id)
    .select('*')
    .single()

  if (error || !data) {
    throw createError({ statusCode: 500, statusMessage: error?.message || 'No se pudo actualizar' })
  }

  return mapDonationRow(data as DonationRow)
})
