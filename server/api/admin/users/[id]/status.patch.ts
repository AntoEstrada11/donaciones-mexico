import type { DonorStatus } from '~/types'

export default defineEventHandler(async (event) => {
  const session = requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Id requerido' })
  }

  const body = await readBody(event)
  const status = String(body?.status || '') as DonorStatus
  if (status !== 'active' && status !== 'deactivated') {
    throw createError({ statusCode: 400, statusMessage: 'Estado inválido' })
  }

  return await updateDonorStatusForAdmin(id, status, session.sub)
})
