import { getAdapter } from '../../../payments'

export default defineEventHandler(async (event) => {
  const rawBody = await readRawBody(event, 'utf8')
  if (!rawBody) {
    throw createError({ statusCode: 400, statusMessage: 'Cuerpo vacío' })
  }

  const settings = await getPaymentSettings()
  const adapter = getAdapter('paypal')
  const headers = {
    get(name: string) {
      return getHeader(event, name)
    },
  }

  const valid = await adapter.verifyWebhook(rawBody, headers, settings.mode)
  if (!valid) {
    throw createError({ statusCode: 401, statusMessage: 'Firma inválida' })
  }

  const parsed = adapter.parseWebhook(rawBody, headers)
  if (!parsed.resourceId && !parsed.donationId) {
    return { ok: true, ignored: true }
  }

  let status = parsed.resourceId
    ? await adapter.fetchStatus(parsed.resourceId, settings.mode)
    : null

  // Si el evento trae custom_id pero el fetch no, usar el del parse.
  const donationId = status?.donationId || parsed.donationId
  if (!donationId) {
    return { ok: true, ignored: true }
  }

  // Para eventos de captura, preferir el mapeo del event_type si fetch quedó pending.
  if (status && status.status === 'pending') {
    const mapped = parsed.eventType === 'PAYMENT.CAPTURE.COMPLETED'
      ? 'paid' as const
      : parsed.eventType === 'PAYMENT.CAPTURE.DENIED' || parsed.eventType === 'PAYMENT.CAPTURE.DECLINED'
        ? 'failed' as const
        : parsed.eventType === 'PAYMENT.CAPTURE.REFUNDED'
          ? 'refunded' as const
          : status.status
    status = { ...status, status: mapped }
  }

  if (!status) {
    return { ok: true, ignored: true }
  }

  const isNew = await recordPaymentEvent({
    provider: 'paypal',
    providerEventId: parsed.providerEventId,
    donationId,
    eventType: parsed.eventType,
    mappedStatus: status.status,
  })

  if (isNew) {
    await applyProviderStatus({
      donationId,
      status: status.status,
      provider: 'paypal',
      providerPaymentId: status.providerPaymentId,
      providerReference: status.providerReference,
      expectedAmount: status.amount,
    })
  }

  return { ok: true }
})
