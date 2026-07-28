<script setup lang="ts">
import type { Donation } from '~/types'

definePageMeta({ middleware: 'auth' })

const { t } = useI18n()

const { data: history, pending, error, refresh } = await useFetch<Donation[]>('/api/donations', {
  key: 'user-donations',
})

const statusLabels: Record<Donation['status'], string> = {
  paid: 'donation.statusPaid',
  pending: 'donation.statusPendingTransfer',
  failed: 'donation.statusFailed',
  cancelled: 'donation.statusCancelled',
}

const statusColors: Record<Donation['status'], string> = {
  paid: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  failed: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-600',
}

const markingId = ref<string | null>(null)

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

async function markPaid(donation: Donation) {
  markingId.value = donation.id
  try {
    await $fetch(`/api/donations/${donation.id}`, {
      method: 'PATCH',
      body: { status: 'paid' },
    })
    await refresh()
  }
  finally {
    markingId.value = null
  }
}

onMounted(() => {
  refresh()
})
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 py-10 md:px-6">
    <header class="mb-8">
      <h1 class="section-title">
        {{ t('history.title') }}
      </h1>
      <p class="mt-2 text-gray-600">
        {{ t('history.subtitle') }}
      </p>
    </header>

    <div v-if="pending" class="py-12 text-center text-gray-500">
      {{ t('common.loading') }}
    </div>

    <div v-else-if="error" class="card py-8 text-center text-sm text-red-600">
      {{ t('common.error') }}
    </div>

    <div v-else-if="!history?.length" class="card py-12 text-center">
      <p class="text-gray-500">
        {{ t('history.empty') }}
      </p>
      <NuxtLink to="/iglesias" class="btn-primary mt-4 inline-flex">
        {{ t('history.cta') }}
      </NuxtLink>
    </div>

    <div v-else class="space-y-4">
      <article
        v-for="donation in history"
        :key="donation.id"
        class="card"
      >
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p class="font-semibold text-ink">
              {{ donation.campaignName || donation.campaignId }}
            </p>
            <p class="text-sm text-gray-500">
              {{ donation.churchName || donation.churchId }}
            </p>
            <p class="text-sm text-gray-500">
              {{ formatDate(donation.createdAt) }} · {{ donation.method.toUpperCase() }}
            </p>
            <p v-if="donation.paymentReference" class="mt-1 font-mono text-xs text-brand">
              {{ t('donation.reference') }}: {{ donation.paymentReference }}
            </p>
          </div>
          <div class="flex flex-col items-end gap-2">
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
              v-if="donation.status === 'pending' && donation.method === 'spei'"
              type="button"
              class="text-xs font-medium text-brand hover:underline"
              :disabled="markingId === donation.id"
              @click="markPaid(donation)"
            >
              {{ markingId === donation.id ? t('donation.confirmingPaid') : t('donation.confirmTransfer') }}
            </button>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>
