export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody(event)
  return await createAdminCampaign({
    name: String(body?.name || ''),
    description: body?.description != null ? String(body.description) : undefined,
    startsAt: body?.startsAt != null ? String(body.startsAt) : null,
    endsAt: body?.endsAt != null ? String(body.endsAt) : null,
    active: body?.active !== false,
  })
})
