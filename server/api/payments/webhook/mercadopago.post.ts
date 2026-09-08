import { getAdapter } from '../../../payments'

export default defineEventHandler(async (event) => {
  const rawBody = await readRawBody(event, 'utf8')
  if (!rawBody) {
    throw createError({ statusCode: 400, statusMessage: 'Cuerpo vacío' })
  }

  const settings = await getPaymentSettings()
  const adapter = getAdapter('mercadopago')
  const headers = {
    get(name: string) {
      return getHeader(event, name)
    },
  }

  const hasSignature = Boolean(
    headers.get('x-signature') || headers.get('X-Signature'),
  )

  // El simulador del panel MP no firma; en test aceptamos el ping de conectividad.
  if (!hasSignature && settings.mode === 'test') {
    return { ok: true, skipped: 'unsigned-test-ping' }
  }

  const valid = await adapter.verifyWebhook(rawBody, headers, settings.mode)
  if (!valid) {
    throw createError({ statusCode: 401, statusMessage: 'Firma inválida' })
  }

  const parsed = adapter.parseWebhook(rawBody, headers)

  if (!parsed.resourceId) {
    return { ok: true, ignored: true }
  }

  const status = await adapter.fetchStatus(parsed.resourceId, settings.mode)
  const donationId = status.donationId || parsed.donationId
  if (!donationId) {
    return { ok: true, ignored: true }
  }

  const isNew = await recordPaymentEvent({
    provider: 'mercadopago',
    providerEventId: parsed.providerEventId,
    donationId,
    eventType: parsed.eventType,
    mappedStatus: status.status,
  })

  if (isNew) {
    await applyProviderStatus({
      donationId,
      status: status.status,
      provider: 'mercadopago',
      providerPaymentId: status.providerPaymentId,
      providerReference: status.providerReference,
      expectedAmount: status.amount,
    })
  }

  return { ok: true }
})
