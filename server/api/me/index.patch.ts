import type { ProfileInput } from '../../utils/users'

export default defineEventHandler(async (event) => {
  const session = requireSession(event)
  const body = await readBody(event)

  const patch: ProfileInput = {}
  if (body?.name !== undefined) patch.name = String(body.name)
  if (body?.phone !== undefined) patch.phone = String(body.phone || '')
  if (body?.wantsReceipt !== undefined) patch.wantsReceipt = body.wantsReceipt === true
  if (body?.street !== undefined) patch.street = String(body.street || '')
  if (body?.city !== undefined) patch.city = String(body.city || '')
  if (body?.state !== undefined) patch.state = String(body.state || '')
  if (body?.zip !== undefined) patch.zip = String(body.zip || '')
  if (body?.rfc !== undefined) patch.rfc = String(body.rfc || '')

  return await updateDonorProfile(session.sub, patch)
})
