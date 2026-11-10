import type { ProfileInput } from '../../utils/users'

export default defineEventHandler(async (event) => {
  const session = await requireActiveSession(event)
  const body = await readBody(event)

  const patch: ProfileInput = {}
  if (body?.name !== undefined) patch.name = String(body.name)
  if (body?.phone !== undefined) patch.phone = String(body.phone || '')
  if (body?.wantsReceipt !== undefined) patch.wantsReceipt = body.wantsReceipt === true
  if (body?.street !== undefined) patch.street = String(body.street || '')
  if (body?.city !== undefined) patch.city = String(body.city || '')
  if (body?.state !== undefined) patch.state = String(body.state || '')
  if (body?.zip !== undefined) patch.zip = String(body.zip || '')
  if (body?.colony !== undefined) patch.colony = String(body.colony || '')
  if (body?.rfc !== undefined) patch.rfc = String(body.rfc || '')
  if (body?.fiscalName !== undefined) patch.fiscalName = String(body.fiscalName || '')
  if (body?.taxRegime !== undefined) patch.taxRegime = String(body.taxRegime || '')
  if (body?.cfdiUse !== undefined) patch.cfdiUse = String(body.cfdiUse || '')
  if (body?.homeChurchId !== undefined) patch.homeChurchId = String(body.homeChurchId || '') || null
  if (body?.homeChurchName !== undefined) patch.homeChurchName = String(body.homeChurchName || '') || null

  const updated = await updateDonorProfile(session.sub, patch)

  if (
    updated.wantsReceipt
    && updated.rfc
    && updated.fiscalName
    && updated.zip
  ) {
    await resolveOpenDonorRequests(session.sub, 'fiscal')
  }

  return updated
})

