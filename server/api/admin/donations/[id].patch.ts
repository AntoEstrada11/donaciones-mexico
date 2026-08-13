import type { Donation } from '~/types'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Id requerido' })
  }

  const body = await readBody(event)
  const status = String(body?.status || '') as Donation['status']
  return await updateDonationStatus(id, status)
})
