import type { PaymentMethodsPublic } from '~/types'

export function usePaymentMethods() {
  return useAsyncData(
    'payment-methods',
    () => $fetch<PaymentMethodsPublic>('/api/payments/methods'),
    { getCachedData: key => useNuxtData<PaymentMethodsPublic>(key).data.value },
  )
}
