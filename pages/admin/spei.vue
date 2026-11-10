<script setup lang="ts">
import type { AdminDonationRow, Donation } from '~/types'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const { t } = useI18n()
const { adminHeaders } = useAuth()
const { openDonor } = useAdminDonorDrawer()

const donations = ref<AdminDonationRow[]>([])
const loading = ref(true)
const error = ref('')
const filterChurch = ref('all')
const minAmount = ref('')
const maxAmount = ref('')
const dateFrom = ref('')
const dateTo = ref('')

async function load() {
  loading.value = true
  error.value = ''
  try {
    const query: Record<string, string> = {
      method: 'spei',
      status: 'pending',
      limit: '500',
    }
    if (dateFrom.value) query.dateFrom = dateFrom.value
    if (dateTo.value) query.dateTo = dateTo.value
    if (minAmount.value) query.minAmount = minAmount.value
    if (maxAmount.value) query.maxAmount = maxAmount.value

    donations.value = await $fetch<AdminDonationRow[]>('/api/admin/donations', {
      headers: adminHeaders(),
      query,
    })
  }
  catch (e: unknown) {
    const msg = (e as { data?: { statusMessage?: string } })?.data?.statusMessage
    error.value = msg || t('common.error')
  }
  finally {
    loading.value = false
  }
}

onMounted(load)

const churchOptions = computed(() => {
  const map = new Map<string, string>()
  for (const row of donations.value) {
    map.set(row.churchId, row.churchName || row.churchId)
  }
  return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1], 'es'))
})

const filtered = computed(() => {
  return donations.value.filter((row) => {
    if (filterChurch.value !== 'all' && row.churchId !== filterChurch.value) return false
    return true
  })
})

const totalAmount = computed(() => filtered.value.reduce((sum, row) => sum + row.amount, 0))

async function markPaid(donation: AdminDonationRow) {
  error.value = ''
  try {
    await $fetch<AdminDonationRow>(`/api/admin/donations/${donation.id}`, {
      method: 'PATCH',
      headers: adminHeaders(),
      body: { status: 'paid' satisfies Donation['status'] },
    })
    donations.value = donations.value.filter(d => d.id !== donation.id)
  }
  catch (e: unknown) {
    const msg = (e as { data?: { statusMessage?: string } })?.data?.statusMessage
    error.value = msg || t('common.error')
  }
}

async function markFailed(donation: AdminDonationRow) {
  error.value = ''
  try {
    await $fetch<AdminDonationRow>(`/api/admin/donations/${donation.id}`, {
      method: 'PATCH',
      headers: adminHeaders(),
      body: { status: 'failed' satisfies Donation['status'] },
    })
    donations.value = donations.value.filter(d => d.id !== donation.id)
  }
  catch (e: unknown) {
    const msg = (e as { data?: { statusMessage?: string } })?.data?.statusMessage
    error.value = msg || t('common.error')
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatMoney(amount: number) {
  return `$${amount.toLocaleString('es-MX')} MXN`
}
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-10 md:px-6">
    <header class="mb-2">
      <h1 class="section-title">
        {{ t('admin.spei.title') }}
      </h1>
      <p class="mt-2 text-gray-600">
        {{ t('admin.spei.subtitle') }}
      </p>
    </header>
    <p v-if="error" class="mb-4 text-sm text-red-600">
      {{ error }}
    </p>

    <div class="mb-6 flex flex-wrap items-end gap-3">
      <label class="text-sm text-ink">
        {{ t('admin.donations.church') }}
        <select v-model="filterChurch" class="mt-1 block max-w-xs rounded border border-gray-300 px-2 py-1">
          <option value="all">{{ t('admin.donations.all') }}</option>
          <option v-for="[id, name] in churchOptions" :key="id" :value="id">
            {{ name }}
          </option>
        </select>
      </label>
      <label class="text-sm text-ink">
        {{ t('admin.donations.dateFrom') }}
        <input v-model="dateFrom" type="date" class="mt-1 block rounded border border-gray-300 px-2 py-1">
      </label>
      <label class="text-sm text-ink">
        {{ t('admin.donations.dateTo') }}
        <input v-model="dateTo" type="date" class="mt-1 block rounded border border-gray-300 px-2 py-1">
      </label>
      <label class="text-sm text-ink">
        {{ t('admin.donations.minAmount') }}
        <input v-model="minAmount" type="number" min="0" step="1" class="mt-1 block w-28 rounded border border-gray-300 px-2 py-1">
      </label>
      <label class="text-sm text-ink">
        {{ t('admin.donations.maxAmount') }}
        <input v-model="maxAmount" type="number" min="0" step="1" class="mt-1 block w-28 rounded border border-gray-300 px-2 py-1">
      </label>
      <button type="button" class="btn-secondary px-3 py-1.5 text-sm" @click="load">
        {{ t('admin.spei.applyFilters') }}
      </button>
    </div>

    <div v-if="loading" class="py-12 text-center text-gray-500">
      {{ t('common.loading') }}
    </div>
    <template v-else>
      <div class="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-ink">
        <span class="font-semibold">{{ filtered.length }}</span>
        {{ t('admin.spei.pendingCount') }}
        ·
        <span class="font-semibold text-brand">{{ formatMoney(totalAmount) }}</span>
      </div>

      <p v-if="filtered.length === 0" class="text-gray-500">
        {{ t('admin.spei.empty') }}
      </p>
      <div v-else class="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table class="min-w-full text-left text-sm">
          <thead class="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th class="px-4 py-3">{{ t('admin.donations.date') }}</th>
              <th class="px-4 py-3">{{ t('admin.donations.donor') }}</th>
              <th class="px-4 py-3">{{ t('admin.donations.church') }}</th>
              <th class="px-4 py-3">{{ t('admin.donations.campaign') }}</th>
              <th class="px-4 py-3">{{ t('admin.donations.amount') }}</th>
              <th class="px-4 py-3">{{ t('admin.spei.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="donation in filtered"
              :key="donation.id"
              class="border-b border-gray-100 last:border-0"
            >
              <td class="whitespace-nowrap px-4 py-3 text-gray-600">
                {{ formatDate(donation.createdAt) }}
              </td>
              <td class="px-4 py-3">
                <button
                  v-if="donation.userId"
                  type="button"
                  class="font-medium text-brand hover:underline"
                  @click="openDonor(donation.userId)"
                >
                  {{ donation.userName || t('admin.donations.anonymous') }}
                </button>
                <p v-else class="font-medium text-ink">
                  {{ t('admin.donations.anonymous') }}
                </p>
                <p class="text-xs text-gray-500">
                  {{ donation.userEmail || '—' }}
                </p>
              </td>
              <td class="px-4 py-3 text-ink">
                {{ donation.churchName || donation.churchId }}
              </td>
              <td class="px-4 py-3 text-ink">
                {{ donation.campaignName || donation.campaignId }}
              </td>
              <td class="whitespace-nowrap px-4 py-3 font-semibold text-brand">
                {{ formatMoney(donation.amount) }}
              </td>
              <td class="px-4 py-3">
                <div class="flex flex-col gap-1">
                  <button
                    type="button"
                    class="text-left text-sm font-medium text-green-700 hover:underline"
                    @click="markPaid(donation)"
                  >
                    {{ t('admin.spei.markPaid') }}
                  </button>
                  <button
                    type="button"
                    class="text-left text-sm font-medium text-red-700 hover:underline"
                    @click="markFailed(donation)"
                  >
                    {{ t('admin.spei.markFailed') }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>
