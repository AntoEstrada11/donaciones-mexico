<script setup lang="ts">
import type { Campaign, Donation } from '~/types'

const { t } = useI18n()
const { isLoggedIn, fetchDonations } = useAuth()

const donations = ref<Donation[]>([])
const authReady = ref(false)
const loadError = ref('')

onMounted(async () => {
  if (!isLoggedIn.value) {
    await navigateTo('/login?redirect=/historial')
    return
  }

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

const { data: campaigns } = await useFetch<Campaign[]>('/api/campaigns')

const campaignMap = computed(() => {
  const map = new Map<string, string>()
  for (const c of campaigns.value ?? []) {
    map.set(c.id, c.name)
  }
  return map
})

const statusLabels: Record<Donation['status'], string> = {
  paid: 'donation.statusPaid',
  pending: 'donation.statusPending',
  failed: 'donation.statusFailed',
  cancelled: 'donation.statusCancelled',
}

const statusColors: Record<Donation['status'], string> = {
  paid: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  failed: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-600',
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

    <div v-if="!authReady" class="py-12 text-center text-gray-500">
      {{ t('common.loading') }}
    </div>

    <template v-else>
      <p v-if="loadError" class="mb-4 text-center text-sm text-red-600">
        {{ loadError }}
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
              {{ campaignMap.get(donation.campaignId) ?? donation.campaignId }}
            </p>
            <p class="text-sm text-gray-500">
              {{ formatDate(donation.createdAt) }} · {{ donation.method.toUpperCase() }}
            </p>
          </div>
          <div class="flex items-center gap-4">
            <span class="font-bold text-brand">
              ${{ donation.amount.toLocaleString('es-MX') }} MXN
            </span>
            <span
              class="rounded-full px-3 py-1 text-xs font-medium"
              :class="statusColors[donation.status]"
            >
              {{ t(statusLabels[donation.status]) }}
            </span>
          </div>
        </article>
      </div>
    </template>
  </div>
</template>
