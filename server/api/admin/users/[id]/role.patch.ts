import type { UserRole } from '~/types'

export default defineEventHandler(async (event) => {
  const session = requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Id requerido' })
  }

  const body = await readBody(event)
  const role = String(body?.role || '') as UserRole
  if (role !== 'admin' && role !== 'donor') {
    throw createError({ statusCode: 400, statusMessage: 'Rol inválido' })
  }

  return await setUserRole(id, role, session.sub)
})
