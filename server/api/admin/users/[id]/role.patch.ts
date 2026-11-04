import type { UserRole } from '~/types'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Id requerido' })
  }

  const body = await readBody(event)
  const role = String(body?.role || '') as UserRole
  if (role !== 'donor' && role !== 'editor' && role !== 'admin') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Rol inválido (donor, editor o admin)',
    })
  }

  return await setUserRoleForAdmin(id, role)
})
