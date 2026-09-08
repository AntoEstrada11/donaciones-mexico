import { createHash, createVerify } from 'node:crypto'
import type { Donation, PaymentMode } from '~/types'
import { getPayPalCredentials, paypalApiBase } from './config'
import type {
  CheckoutInput,
  CheckoutResult,
  ParsedWebhook,
  PaymentAdapter,
  ProviderStatus,
  WebhookHeaders,
} from './types'

function requireCreds(mode: PaymentMode) {
  const creds = getPayPalCredentials(mode)
  if (!creds) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Credenciales de PayPal no configuradas para el modo activo',
    })
  }
  return creds
}

async function getAccessToken(mode: PaymentMode): Promise<string> {
  const creds = requireCreds(mode)
  const basic = Buffer.from(`${creds.clientId}:${creds.clientSecret}`).toString('base64')
  const res = await fetch(`${paypalApiBase(mode)}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })
  if (!res.ok) {
    throw createError({ statusCode: 502, statusMessage: 'No se pudo autenticar con PayPal' })
  }
  const data = await res.json() as { access_token?: string }
  if (!data.access_token) {
    throw createError({ statusCode: 502, statusMessage: 'Token PayPal inválido' })
  }
  return data.access_token
}

function mapPayPalEvent(eventType: string): Donation['status'] {
  switch (eventType) {
    case 'PAYMENT.CAPTURE.COMPLETED':
      return 'paid'
    case 'PAYMENT.CAPTURE.DENIED':
    case 'PAYMENT.CAPTURE.DECLINED':
      return 'failed'
    case 'PAYMENT.CAPTURE.REFUNDED':
      return 'refunded'
    default:
      return 'pending'
  }
}

function mapOrderStatus(status: string | undefined): Donation['status'] {
  switch (status) {
    case 'COMPLETED':
      return 'paid'
    case 'VOIDED':
      return 'cancelled'
    case 'APPROVED':
    case 'CREATED':
    case 'SAVED':
    case 'PAYER_ACTION_REQUIRED':
      return 'pending'
    default:
      return 'pending'
  }
}

function crc32(buf: Buffer): number {
  let crc = 0xFFFFFFFF
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i]
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0)
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0
}

function isAllowedPaypalCertHost(hostname: string): boolean {
  return hostname === 'paypal.com'
    || hostname.endsWith('.paypal.com')
}

export const paypalAdapter: PaymentAdapter = {
  provider: 'paypal',

  async createCheckout(input: CheckoutInput): Promise<CheckoutResult> {
    const token = await getAccessToken(input.mode)
    const { donation, siteUrl } = input
    const amount = Number(donation.amount).toFixed(2)

    const body = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          custom_id: donation.id,
          amount: {
            currency_code: donation.currency || 'MXN',
            value: amount,
          },
          description: 'Donación Iglesia Universal México',
        },
      ],
      application_context: {
        brand_name: 'Iglesia Universal México',
        landing_page: 'NO_PREFERENCE',
        user_action: 'PAY_NOW',
        return_url: `${siteUrl}/donaciones/gracias?donationId=${donation.id}&provider=paypal`,
        cancel_url: `${siteUrl}/donaciones/gracias?donationId=${donation.id}&provider=paypal&result=cancel`,
      },
    }

    const res = await fetch(`${paypalApiBase(input.mode)}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      throw createError({
        statusCode: 502,
        statusMessage: 'No se pudo crear el cobro en PayPal',
      })
    }

    const data = await res.json() as {
      id?: string
      links?: Array<{ rel?: string, href?: string }>
    }
    const approve = data.links?.find(l => l.rel === 'approve')?.href
    if (!data.id || !approve) {
      throw createError({
        statusCode: 502,
        statusMessage: 'Respuesta incompleta de PayPal',
      })
    }

    return { redirectUrl: approve, providerReference: data.id }
  },

  async verifyWebhook(rawBody: string, headers: WebhookHeaders, mode): Promise<boolean> {
    const creds = getPayPalCredentials(mode)
    if (!creds) return false

    const transmissionId = headers.get('paypal-transmission-id') || headers.get('Paypal-Transmission-Id')
    const transmissionTime = headers.get('paypal-transmission-time') || headers.get('Paypal-Transmission-Time')
    const certUrl = headers.get('paypal-cert-url') || headers.get('Paypal-Cert-Url')
    const authAlgo = headers.get('paypal-auth-algo') || headers.get('Paypal-Auth-Algo')
    const transmissionSig = headers.get('paypal-transmission-sig') || headers.get('Paypal-Transmission-Sig')

    if (!transmissionId || !transmissionTime || !certUrl || !authAlgo || !transmissionSig) {
      return false
    }

    // Ventana de replay ~5 min
    const ts = Date.parse(transmissionTime)
    if (!Number.isFinite(ts) || Math.abs(Date.now() - ts) > 5 * 60_000) {
      return false
    }

    let certHost: string
    try {
      const u = new URL(certUrl)
      if (u.protocol !== 'https:') return false
      certHost = u.hostname.toLowerCase()
    }
    catch {
      return false
    }
    if (!isAllowedPaypalCertHost(certHost)) return false

    const certRes = await fetch(certUrl)
    if (!certRes.ok) return false
    const certPem = await certRes.text()

    const crc = crc32(Buffer.from(rawBody, 'utf8'))
    const message = `${transmissionId}|${transmissionTime}|${creds.webhookId}|${crc}`

    try {
      const verifier = createVerify(authAlgo.includes('SHA256') ? 'RSA-SHA256' : authAlgo)
      verifier.update(message)
      verifier.end()
      return verifier.verify(certPem, transmissionSig, 'base64')
    }
    catch {
      return false
    }
  },

  parseWebhook(rawBody: string, _headers: WebhookHeaders): ParsedWebhook {
    const parsed = JSON.parse(rawBody) as {
      id?: string
      event_type?: string
      resource?: {
        id?: string
        custom_id?: string
        supplementary_data?: { related_ids?: { order_id?: string } }
      }
    }

    const resourceId = parsed.resource?.id
      || parsed.resource?.supplementary_data?.related_ids?.order_id
      || null

    return {
      providerEventId: parsed.id || createHash('sha256').update(rawBody).digest('hex').slice(0, 64),
      eventType: parsed.event_type || 'unknown',
      resourceId,
      donationId: parsed.resource?.custom_id || null,
    }
  },

  async fetchStatus(resourceId: string, mode): Promise<ProviderStatus> {
    const token = await getAccessToken(mode)

    // Intentar como order primero; si falla, como capture.
    let res = await fetch(`${paypalApiBase(mode)}/v2/checkout/orders/${encodeURIComponent(resourceId)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (res.ok) {
      const data = await res.json() as {
        id?: string
        status?: string
        purchase_units?: Array<{
          custom_id?: string
          payments?: { captures?: Array<{ id?: string, status?: string, amount?: { value?: string } }> }
        }>
      }
      const unit = data.purchase_units?.[0]
      const capture = unit?.payments?.captures?.[0]
      const captureStatus = capture?.status
      let status = mapOrderStatus(data.status)
      if (captureStatus === 'COMPLETED') status = 'paid'
      if (captureStatus === 'DECLINED' || captureStatus === 'DENIED') status = 'failed'
      if (captureStatus === 'REFUNDED') status = 'refunded'

      return {
        donationId: unit?.custom_id || null,
        providerPaymentId: capture?.id || null,
        providerReference: data.id || resourceId,
        status,
        amount: capture?.amount?.value ? Number(capture.amount.value) : null,
      }
    }

    res = await fetch(`${paypalApiBase(mode)}/v2/payments/captures/${encodeURIComponent(resourceId)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) {
      throw createError({
        statusCode: 502,
        statusMessage: 'No se pudo consultar el pago en PayPal',
      })
    }

    const capture = await res.json() as {
      id?: string
      status?: string
      custom_id?: string
      amount?: { value?: string }
      supplementary_data?: { related_ids?: { order_id?: string } }
    }

    const eventStatus = capture.status === 'COMPLETED'
      ? 'paid'
      : capture.status === 'REFUNDED'
        ? 'refunded'
        : capture.status === 'DECLINED' || capture.status === 'DENIED'
          ? 'failed'
          : 'pending'

    return {
      donationId: capture.custom_id || null,
      providerPaymentId: capture.id || resourceId,
      providerReference: capture.supplementary_data?.related_ids?.order_id || null,
      status: eventStatus,
      amount: capture.amount?.value ? Number(capture.amount.value) : null,
    }
  },
}

export async function capturePayPalOrder(orderId: string, mode: PaymentMode): Promise<ProviderStatus> {
  const token = await getAccessToken(mode)
  const res = await fetch(
    `${paypalApiBase(mode)}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    },
  )

  // 422 ORDER_ALREADY_CAPTURED → consultar estado
  if (!res.ok && res.status !== 422) {
    throw createError({
      statusCode: 502,
      statusMessage: 'No se pudo capturar el pago de PayPal',
    })
  }

  return paypalAdapter.fetchStatus(orderId, mode)
}
