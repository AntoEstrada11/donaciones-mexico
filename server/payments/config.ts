import type { PaymentMode } from '~/types'

export interface MercadoPagoCredentials {
  accessToken: string
  webhookSecret: string
}

export interface PayPalCredentials {
  clientId: string
  clientSecret: string
  webhookId: string
}

function cfg() {
  return useRuntimeConfig()
}

export function getSiteUrl(): string {
  const url = String(cfg().public.siteUrl || '').trim().replace(/\/$/, '')
  if (!url) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Falta NUXT_PUBLIC_SITE_URL para construir las URLs de retorno',
    })
  }
  return url
}

/**
 * Base pública HTTPS que los proveedores pueden llamar (webhooks).
 * En local suele ser ngrok; si no hay, se reutiliza NUXT_PUBLIC_SITE_URL.
 */
export function getWebhookBaseUrl(): string {
  const dedicated = String(cfg().paymentWebhookBaseUrl || '').trim().replace(/\/$/, '')
  if (dedicated) return dedicated
  return getSiteUrl()
}

export function getMercadoPagoCredentials(mode: PaymentMode): MercadoPagoCredentials | null {
  const c = cfg()
  const accessToken = mode === 'live'
    ? String(c.mpAccessTokenLive || '')
    : String(c.mpAccessTokenTest || '')
  const webhookSecret = mode === 'live'
    ? String(c.mpWebhookSecretLive || '')
    : String(c.mpWebhookSecretTest || '')
  if (!accessToken.trim() || !webhookSecret.trim()) return null
  return { accessToken: accessToken.trim(), webhookSecret: webhookSecret.trim() }
}

export function getPayPalCredentials(mode: PaymentMode): PayPalCredentials | null {
  const c = cfg()
  const clientId = mode === 'live'
    ? String(c.paypalClientIdLive || '')
    : String(c.paypalClientIdTest || '')
  const clientSecret = mode === 'live'
    ? String(c.paypalClientSecretLive || '')
    : String(c.paypalClientSecretTest || '')
  const webhookId = mode === 'live'
    ? String(c.paypalWebhookIdLive || '')
    : String(c.paypalWebhookIdTest || '')
  if (!clientId.trim() || !clientSecret.trim() || !webhookId.trim()) return null
  return {
    clientId: clientId.trim(),
    clientSecret: clientSecret.trim(),
    webhookId: webhookId.trim(),
  }
}

export function hasMercadoPagoCredentials(mode: PaymentMode): boolean {
  return Boolean(getMercadoPagoCredentials(mode))
}

export function hasPayPalCredentials(mode: PaymentMode): boolean {
  return Boolean(getPayPalCredentials(mode))
}

export function paypalApiBase(mode: PaymentMode): string {
  return mode === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com'
}
