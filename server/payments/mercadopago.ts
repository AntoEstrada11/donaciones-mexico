import { createHmac, timingSafeEqual } from 'node:crypto'
import type { Donation } from '~/types'
import { getMercadoPagoCredentials } from './config'
import type {
  CheckoutInput,
  CheckoutResult,
  ParsedWebhook,
  PaymentAdapter,
  ProviderStatus,
  WebhookHeaders,
} from './types'

function requireCreds(mode: CheckoutInput['mode']) {
  const creds = getMercadoPagoCredentials(mode)
  if (!creds) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Credenciales de MercadoPago no configuradas para el modo activo',
    })
  }
  return creds
}

function mapMpStatus(status: string | undefined): Donation['status'] {
  switch (status) {
    case 'approved':
      return 'paid'
    case 'rejected':
      return 'failed'
    case 'cancelled':
      return 'cancelled'
    case 'refunded':
    case 'charged_back':
      return 'refunded'
    default:
      return 'pending'
  }
}

export const mercadopagoAdapter: PaymentAdapter = {
  provider: 'mercadopago',

  async createCheckout(input: CheckoutInput): Promise<CheckoutResult> {
    const creds = requireCreds(input.mode)
    const { donation, siteUrl, webhookBaseUrl } = input
    const amount = Number(donation.amount)

    // MercadoPago exige HTTPS en back_urls para auto_return.
    // En local: el navegador vuelve por ngrok (HTTPS); el webhook también.
    const returnBase = siteUrl.startsWith('https://')
      ? siteUrl
      : (webhookBaseUrl.startsWith('https://') ? webhookBaseUrl : siteUrl)
    const canAutoReturn = returnBase.startsWith('https://')

    const body: Record<string, unknown> = {
      external_reference: donation.id,
      notification_url: `${webhookBaseUrl}/api/payments/webhook/mercadopago`,
      back_urls: {
        success: `${returnBase}/donaciones/gracias?donationId=${donation.id}&provider=mercadopago`,
        failure: `${returnBase}/donaciones/gracias?donationId=${donation.id}&provider=mercadopago&result=failure`,
        pending: `${returnBase}/donaciones/gracias?donationId=${donation.id}&provider=mercadopago&result=pending`,
      },
      items: [
        {
          id: donation.campaignId,
          title: 'Donación Iglesia Universal México',
          quantity: 1,
          currency_id: donation.currency || 'MXN',
          unit_price: amount,
        },
      ],
    }

    if (canAutoReturn) {
      body.auto_return = 'approved'
    }

    const res = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${creds.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      let detail = ''
      try {
        const errBody = await res.json() as { message?: string, error?: string, cause?: Array<{ description?: string }> }
        detail = errBody.message || errBody.error || errBody.cause?.[0]?.description || ''
      }
      catch {
        // ignore parse errors
      }
      throw createError({
        statusCode: 502,
        statusMessage: detail
          ? `No se pudo crear el cobro en MercadoPago: ${detail}`
          : 'No se pudo crear el cobro en MercadoPago',
      })
    }

    const data = await res.json() as {
      id?: string
      init_point?: string
      sandbox_init_point?: string
    }

    const redirectUrl = input.mode === 'live'
      ? data.init_point
      : (data.sandbox_init_point || data.init_point)

    if (!data.id || !redirectUrl) {
      throw createError({
        statusCode: 502,
        statusMessage: 'Respuesta incompleta de MercadoPago',
      })
    }

    return { redirectUrl, providerReference: String(data.id) }
  },

  async verifyWebhook(rawBody: string, headers: WebhookHeaders, mode): Promise<boolean> {
    const creds = getMercadoPagoCredentials(mode)
    if (!creds) return false

    const xSignature = headers.get('x-signature') || headers.get('X-Signature')
    const xRequestId = headers.get('x-request-id') || headers.get('X-Request-Id') || ''
    if (!xSignature) return false

    const parts = Object.fromEntries(
      xSignature.split(',').map((p) => {
        const [k, v] = p.split('=').map(s => s.trim())
        return [k, v]
      }),
    )
    const ts = parts.ts
    const hash = parts.v1
    if (!ts || !hash) return false

    let dataId = ''
    try {
      const parsed = JSON.parse(rawBody) as { data?: { id?: string | number }, id?: string | number }
      const id = parsed?.data?.id ?? parsed?.id
      dataId = id !== undefined && id !== null ? String(id) : ''
    }
    catch {
      return false
    }

    // Manifest oficial MP: id:[data.id];request-id:[x-request-id];ts:[ts];
    const manifest = `id:${dataId.toLowerCase()};request-id:${xRequestId};ts:${ts};`
    const expected = createHmac('sha256', creds.webhookSecret).update(manifest).digest('hex')

    try {
      const a = Buffer.from(expected, 'hex')
      const b = Buffer.from(hash, 'hex')
      if (a.length !== b.length) return false
      return timingSafeEqual(a, b)
    }
    catch {
      return false
    }
  },

  parseWebhook(rawBody: string, headers: WebhookHeaders): ParsedWebhook {
    const parsed = JSON.parse(rawBody) as {
      id?: string | number
      type?: string
      action?: string
      data?: { id?: string | number }
    }
    const resourceId = parsed?.data?.id != null ? String(parsed.data.id) : null
    const providerEventId = parsed?.id != null
      ? String(parsed.id)
      : `${resourceId || 'unknown'}:${headers.get('x-request-id') || Date.now()}`

    return {
      providerEventId,
      eventType: parsed.action || parsed.type || 'payment',
      resourceId,
      donationId: null,
    }
  },

  async fetchStatus(resourceId: string, mode): Promise<ProviderStatus> {
    const creds = requireCreds(mode)
    const res = await fetch(`https://api.mercadopago.com/v1/payments/${encodeURIComponent(resourceId)}`, {
      headers: { Authorization: `Bearer ${creds.accessToken}` },
    })

    if (!res.ok) {
      throw createError({
        statusCode: 502,
        statusMessage: 'No se pudo consultar el pago en MercadoPago',
      })
    }

    const data = await res.json() as {
      id?: string | number
      status?: string
      external_reference?: string
      transaction_amount?: number
      preference_id?: string
    }

    return {
      donationId: data.external_reference || null,
      providerPaymentId: data.id != null ? String(data.id) : resourceId,
      providerReference: data.preference_id || null,
      status: mapMpStatus(data.status),
      amount: typeof data.transaction_amount === 'number' ? data.transaction_amount : null,
    }
  },
}
