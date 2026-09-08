<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()

const donationId = computed(() => String(route.query.donationId || route.query.external_reference || ''))
const provider = computed(() => String(route.query.provider || ''))
const result = computed(() => String(route.query.result || ''))
const token = computed(() => String(route.query.token || route.query.Token || ''))
/** MercadoPago añade estos al volver de Checkout Pro. */
const mpPaymentId = computed(() =>
  String(route.query.payment_id || route.query.collection_id || '').trim(),
)

const loading = ref(true)
const status = ref<string>('pending')
const error = ref('')

onMounted(async () => {
  try {
    if (provider.value === 'paypal' && (token.value || donationId.value) && result.value !== 'cancel') {
      await $fetch('/api/payments/paypal/capture', {
        method: 'POST',
        body: {
          orderId: token.value || undefined,
          donationId: donationId.value || undefined,
        },
      })
    }

    if (
      (provider.value === 'mercadopago' || mpPaymentId.value)
      && result.value !== 'failure'
      && (mpPaymentId.value || donationId.value)
    ) {
      try {
        await $fetch('/api/payments/mercadopago/sync', {
          method: 'POST',
          body: {
            paymentId: mpPaymentId.value || undefined,
            donationId: donationId.value || undefined,
          },
        })
      }
      catch {
        // Si el sync falla, igual leemos el estado actual de la donación.
      }
    }

    if (donationId.value) {
      const data = await $fetch<{ status: string }>(`/api/donations/${donationId.value}`)
      status.value = data.status
    }
    else if (result.value === 'failure' || result.value === 'cancel') {
      status.value = result.value === 'cancel' ? 'cancelled' : 'failed'
    }
    else if (String(route.query.status || '') === 'approved') {
      status.value = 'paid'
    }
  }
  catch (e: unknown) {
    const msg = (e as { data?: { statusMessage?: string } })?.data?.statusMessage
    error.value = msg || t('common.error')
    if (result.value === 'failure') status.value = 'failed'
    if (result.value === 'cancel') status.value = 'cancelled'
  }
  finally {
    loading.value = false
  }
})

const title = computed(() => {
  if (status.value === 'paid') return t('donation.thanksPaid')
  if (status.value === 'failed') return t('donation.thanksFailed')
  if (status.value === 'cancelled') return t('donation.thanksCancelled')
  return t('donation.thanksPending')
})
</script>

<template>
  <div class="mx-auto max-w-xl px-4 py-16 md:px-6">
    <div class="card text-center">
      <div v-if="loading" class="py-8 text-gray-500">
        {{ t('donation.thanksLoading') }}
      </div>
      <template v-else>
        <div
          class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full text-3xl"
          :class="status === 'paid'
            ? 'bg-green-100 text-green-600'
            : status === 'failed' || status === 'cancelled'
              ? 'bg-red-100 text-red-600'
              : 'bg-amber-100 text-amber-700'"
        >
          {{ status === 'paid' ? '✓' : status === 'pending' ? '…' : '!' }}
        </div>
        <h1 class="section-title mb-2">
          {{ t('donation.thanksTitle') }}
        </h1>
        <p class="mb-6 text-gray-600">
          {{ title }}
        </p>
        <p v-if="error" class="mb-4 text-sm text-red-600">
          {{ error }}
        </p>
        <div class="flex flex-wrap justify-center gap-3">
          <NuxtLink to="/historial" class="btn-primary">
            {{ t('donation.viewHistory') }}
          </NuxtLink>
          <NuxtLink to="/donaciones" class="btn-secondary">
            {{ t('donation.newDonation') }}
          </NuxtLink>
        </div>
      </template>
    </div>
  </div>
</template>
