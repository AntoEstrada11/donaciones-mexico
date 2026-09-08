import type { PaymentMode, PaymentProvider } from '~/types'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const body = await readBody(event)

  const input: {
    cardProvider?: PaymentProvider
    mode?: PaymentMode
    cardEnabled?: boolean
    paypalEnabled?: boolean
    speiManualEnabled?: boolean
  } = {}

  if (body?.cardProvider !== undefined) input.cardProvider = body.cardProvider
  if (body?.mode !== undefined) input.mode = body.mode
  if (body?.cardEnabled !== undefined) input.cardEnabled = Boolean(body.cardEnabled)
  if (body?.paypalEnabled !== undefined) input.paypalEnabled = Boolean(body.paypalEnabled)
  if (body?.speiManualEnabled !== undefined) input.speiManualEnabled = Boolean(body.speiManualEnabled)

  return await updatePaymentSettings(input)
})
