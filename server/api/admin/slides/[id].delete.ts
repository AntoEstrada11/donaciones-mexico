export default defineEventHandler(async (event) => {
  await requireContentEditor(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Id requerido' })
  }

  await deleteHeroSlide(id)
  return { ok: true }
})
