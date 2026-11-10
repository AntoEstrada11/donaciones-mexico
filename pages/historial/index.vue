<script setup lang="ts">
import type { Donation } from '~/types'

definePageMeta({ middleware: 'donor' })

const { t } = useI18n()
const { fetchDonations, optionalAuthHeaders } = useAuth()

const donations = ref<Donation[]>([])
const authReady = ref(false)
const loadError = ref('')
const receiptBusy = ref<string | null>(null)
const receiptHint = ref('')
const invoiceBusy = ref<string | null>(null)
const invoiceHint = ref('')

onMounted(async () => {
  try {
    donations.value = await fetchDonations()
  }
  catch {
    loadError.value = t('common.error')
  }
  finally {
    authReady.value = true
  }
})

const statusLabels: Record<Donation['status'], string> = {
  paid: 'donation.statusPaid',
  pending: 'donation.statusPending',
  failed: 'donation.statusFailed',
  cancelled: 'donation.statusCancelled',
  refunded: 'donation.statusRefunded',
}

const statusColors: Record<Donation['status'], string> = {
  paid: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  failed: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-600',
  refunded: 'bg-purple-100 text-purple-700',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function churchLabel(donation: Donation) {
  return donation.churchName || donation.churchId
}

function campaignLabel(donation: Donation) {
  return donation.campaignName || donation.campaignId
}

async function downloadReceipt(id: string) {
  receiptBusy.value = id
  receiptHint.value = ''
  try {
    const html = await $fetch<string>(`/api/donations/${id}/receipt`, {
      headers: optionalAuthHeaders(),
      responseType: 'text',
    })
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `constancia-${id.slice(0, 8)}.html`
    link.click()
    URL.revokeObjectURL(url)
  }
  catch (e: unknown) {
    const msg = (e as { data?: { statusMessage?: string } })?.data?.statusMessage
    receiptHint.value = msg || t('history.receiptError')
  }
  finally {
    receiptBusy.value = null
  }
}

async function requestInvoice(id: string) {
  invoiceBusy.value = id
  invoiceHint.value = ''
  try {
    await $fetch(`/api/donations/${id}/invoice`, {
      method: 'POST',
      headers: optionalAuthHeaders(),
    })
    invoiceHint.value = t('history.invoiceOk')
  }
  catch (e: unknown) {
    const msg = (e as { data?: { statusMessage?: string } })?.data?.statusMessage
    invoiceHint.value = msg || t('history.invoiceError')
  }
  finally {
    invoiceBusy.value = null
  }
}
</script>

<template>
  <div class="page-shell">
    <header class="mb-8">
      <h1 class="section-title">
        {{ t('history.title') }}
      </h1>
      <p class="mt-2 text-gray-600">
        {{ t('history.subtitle') }}
      </p>
    </header>

    <div v-if="!authReady" class="py-12 text-center text-gray-500">
      {{ t('common.loading') }}
    </div>

    <template v-else>
      <p v-if="loadError" class="mb-4 text-center text-sm text-red-600">
        {{ loadError }}
      </p>
      <p v-if="receiptHint" class="mb-4 text-sm text-amber-800">
        {{ receiptHint }}
      </p>
      <p v-if="invoiceHint" class="mb-4 text-sm text-amber-800">
        {{ invoiceHint }}
      </p>

      <div v-if="donations.length === 0" class="card py-12 text-center">
        <p class="text-gray-500">
          {{ t('history.empty') }}
        </p>
        <NuxtLink to="/iglesias" class="btn-primary mt-4 inline-flex">
          {{ t('history.cta') }}
        </NuxtLink>
      </div>

      <div v-else class="space-y-4">
        <article
          v-for="donation in donations"
          :key="donation.id"
          class="card flex flex-wrap items-center justify-between gap-4"
        >
          <div>
            <p class="font-semibold text-ink">
              {{ campaignLabel(donation) }}
            </p>
            <p class="text-sm text-gray-600">
              {{ churchLabel(donation) }}
            </p>
            <p class="text-sm text-gray-500">
              {{ formatDate(donation.createdAt) }} · {{ donation.method.toUpperCase() }}
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-3">
            <span class="font-bold text-brand">
              ${{ donation.amount.toLocaleString('es-MX') }} MXN
            </span>
            <span
              class="rounded-full px-3 py-1 text-xs font-medium"
              :class="statusColors[donation.status]"
            >
              {{ t(statusLabels[donation.status]) }}
            </span>
            <button
              v-if="donation.status === 'paid'"
              type="button"
              class="btn-secondary text-sm"
              :disabled="receiptBusy === donation.id"
              @click="downloadReceipt(donation.id)"
            >
              {{ receiptBusy === donation.id ? t('history.receiptBusy') : t('history.receipt') }}
            </button>
            <button
              v-if="donation.status === 'paid'"
              type="button"
              class="btn-secondary text-sm"
              :disabled="invoiceBusy === donation.id"
              @click="requestInvoice(donation.id)"
            >
              {{ invoiceBusy === donation.id ? t('history.invoiceBusy') : t('history.invoice') }}
            </button>
          </div>
        </article>
      </div>
    </template>
  </div>
</template>
