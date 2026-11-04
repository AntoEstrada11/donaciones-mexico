export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Id requerido' })
  }

  const body = await readBody(event)
  if (body?.homeChurchId !== undefined || body?.homeChurchName !== undefined) {
    await updateDonorHomeChurch(
      id,
      body?.homeChurchId != null ? String(body.homeChurchId) : null,
      body?.homeChurchName != null ? String(body.homeChurchName) : null,
    )
  }

  return await getAdminDonorDetail(id)
})
