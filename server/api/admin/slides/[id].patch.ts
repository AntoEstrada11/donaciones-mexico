import { FIELD_LIMITS } from '../../../../utils/fieldLimits'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Id requerido' })
  }

  const body = await readBody(event)
  const patch: { alt?: string, active?: boolean, sortOrder?: number } = {}

  if (body?.alt !== undefined) {
    patch.alt = String(body.alt || '').trim().slice(0, FIELD_LIMITS.heroImage.maxAlt)
  }
  if (body?.active !== undefined) {
    patch.active = Boolean(body.active)
  }
  if (body?.sortOrder !== undefined) {
    const order = Number(body.sortOrder)
    if (!Number.isFinite(order) || order < 0) {
      throw createError({ statusCode: 400, statusMessage: 'sortOrder inválido' })
    }
    patch.sortOrder = Math.floor(order)
  }

  return await updateHeroSlide(id, patch)
})
