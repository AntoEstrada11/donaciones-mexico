import type { DonationMethod, PaymentProvider } from '~/types'
import { mercadopagoAdapter } from './mercadopago'
import { paypalAdapter } from './paypal'
import type { PaymentAdapter } from './types'

export type { CheckoutInput, CheckoutResult, PaymentAdapter } from './types'
export { getSiteUrl, getWebhookBaseUrl, hasMercadoPagoCredentials, hasPayPalCredentials } from './config'
export { capturePayPalOrder } from './paypal'

export function getAdapter(provider: PaymentProvider): PaymentAdapter {
  switch (provider) {
    case 'mercadopago':
      return mercadopagoAdapter
    case 'paypal':
      return paypalAdapter
    default:
      throw createError({
        statusCode: 400,
        statusMessage: 'Proveedor de cobro no soportado para checkout alojado',
      })
  }
}

/** Resuelve el proveedor de cobro a partir del método de la donación y settings. */
export function resolveCheckoutProvider(
  method: DonationMethod | string,
  cardProvider: PaymentProvider,
): PaymentProvider {
  if (method === 'paypal') return 'paypal'
  if (method === 'card') {
    if (cardProvider === 'mercadopago') return 'mercadopago'
    throw createError({
      statusCode: 503,
      statusMessage: 'Proveedor de tarjeta no disponible en v1',
    })
  }
  throw createError({
    statusCode: 400,
    statusMessage: 'El método SPEI no usa checkout de pasarela',
  })
}
