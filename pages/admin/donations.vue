<script setup lang="ts">
import type { AdminDonationRow, Donation } from '~/types'

definePageMeta({ middleware: 'admin' })

const { t } = useI18n()
const { adminHeaders } = useAuth()

const donations = ref<AdminDonationRow[]>([])
const loading = ref(true)
const error = ref('')

const statuses: Donation['status'][] = ['pending', 'paid', 'failed', 'cancelled']

async function load() {
  loading.value = true
  error.value = ''
  try {
    donations.value = await $fetch<AdminDonationRow[]>('/api/admin/donations', {
      headers: adminHeaders(),
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

async function onStatusChange(donation: AdminDonationRow, event: Event) {
  const status = (event.target as HTMLSelectElement).value as Donation['status']
  if (status === donation.status) return

  error.value = ''
  try {
    const updated = await $fetch<AdminDonationRow>(`/api/admin/donations/${donation.id}`, {
      method: 'PATCH',
      headers: adminHeaders(),
      body: { status },
    })
    const index = donations.value.findIndex(d => d.id === donation.id)
    if (index >= 0) donations.value[index] = updated
  }
  catch (e: unknown) {
    const msg = (e as { data?: { statusMessage?: string } })?.data?.statusMessage
    error.value = msg || t('common.error')
    await load()
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
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-10 md:px-6">
    <header class="mb-2">
      <h1 class="section-title">
        {{ t('admin.donations.title') }}
      </h1>
      <p class="mt-2 text-gray-600">
        {{ t('admin.donations.subtitle') }}
      </p>
    </header>

    <AdminNav />

    <p v-if="error" class="mb-4 text-sm text-red-600">
      {{ error }}
    </p>

    <div v-if="loading" class="py-12 text-center text-gray-500">
      {{ t('common.loading') }}
    </div>
    <p v-else-if="donations.length === 0" class="text-gray-500">
      {{ t('admin.donations.empty') }}
    </p>
    <div v-else class="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table class="min-w-full text-left text-sm">
        <thead class="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
          <tr>
            <th class="px-4 py-3">{{ t('admin.donations.date') }}</th>
            <th class="px-4 py-3">{{ t('admin.donations.donor') }}</th>
            <th class="px-4 py-3">{{ t('admin.donations.campaign') }}</th>
            <th class="px-4 py-3">{{ t('admin.donations.amount') }}</th>
            <th class="px-4 py-3">{{ t('admin.donations.status') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="donation in donations"
            :key="donation.id"
            class="border-b border-gray-100 last:border-0"
          >
            <td class="whitespace-nowrap px-4 py-3 text-gray-600">
              {{ formatDate(donation.createdAt) }}
            </td>
            <td class="px-4 py-3">
              <p class="font-medium text-ink">
                {{ donation.userName || t('admin.donations.anonymous') }}
              </p>
              <p class="text-xs text-gray-500">
                {{ donation.userEmail || '—' }}
              </p>
            </td>
            <td class="px-4 py-3 text-ink">
              {{ donation.campaignName || donation.campaignId }}
            </td>
            <td class="whitespace-nowrap px-4 py-3 font-semibold text-brand">
              ${{ donation.amount.toLocaleString('es-MX') }} {{ donation.currency }}
            </td>
            <td class="px-4 py-3">
              <select
                :value="donation.status"
                class="rounded border border-gray-300 px-2 py-1 text-sm"
                @change="onStatusChange(donation, $event)"
              >
                <option v-for="status in statuses" :key="status" :value="status">
                  {{ t(`donation.status${status.charAt(0).toUpperCase()}${status.slice(1)}`) }}
                </option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
