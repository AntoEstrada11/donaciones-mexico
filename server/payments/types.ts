import type { Donation, PaymentMode, PaymentProvider } from '~/types'

export interface CheckoutInput {
  donation: Donation
  /** Base URL for browser return (gracias). Local: http://localhost:3000 */
  siteUrl: string
  /** Base URL for provider webhooks. Local: ngrok HTTPS. Defaults to siteUrl. */
  webhookBaseUrl: string
  mode: PaymentMode
}

export interface CheckoutResult {
  redirectUrl: string
  providerReference: string
}

export interface WebhookHeaders {
  get(name: string): string | undefined
}

export interface ParsedWebhook {
  providerEventId: string
  eventType: string
  /** Id de recurso a confirmar con la API del proveedor. */
  resourceId: string | null
  donationId: string | null
}

export interface ProviderStatus {
  donationId: string | null
  providerPaymentId: string | null
  providerReference: string | null
  status: Donation['status']
  amount: number | null
}

export interface PaymentAdapter {
  provider: PaymentProvider
  createCheckout(input: CheckoutInput): Promise<CheckoutResult>
  verifyWebhook(rawBody: string, headers: WebhookHeaders, mode: PaymentMode): Promise<boolean>
  parseWebhook(rawBody: string, headers: WebhookHeaders): ParsedWebhook
  fetchStatus(resourceId: string, mode: PaymentMode): Promise<ProviderStatus>
}
