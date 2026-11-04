export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Id requerido' })
  }
  const body = await readBody(event)
  return await updateAdminCampaign(id, {
    name: body?.name !== undefined ? String(body.name) : undefined,
    description: body?.description !== undefined ? String(body.description) : undefined,
    active: body?.active !== undefined ? Boolean(body.active) : undefined,
    startsAt: body?.startsAt !== undefined
      ? (body.startsAt == null || body.startsAt === '' ? null : String(body.startsAt))
      : undefined,
    endsAt: body?.endsAt !== undefined
      ? (body.endsAt == null || body.endsAt === '' ? null : String(body.endsAt))
      : undefined,
    sortOrder: body?.sortOrder !== undefined ? Number(body.sortOrder) : undefined,
  })
})
