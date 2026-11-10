<script setup lang="ts">
import type { AdminComplianceAlert } from '~/types'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const { t } = useI18n()
const { adminHeaders } = useAuth()
const { openDonor } = useAdminDonorDrawer()

const alerts = ref<AdminComplianceAlert[]>([])
const loading = ref(true)
const error = ref('')
const filterLevel = ref<'all' | 'pld_pending' | 'sat_report'>('all')
const onlyMissingId = ref(false)

async function load() {
  loading.value = true
  error.value = ''
  try {
    alerts.value = await $fetch<AdminComplianceAlert[]>('/api/admin/compliance-alerts', {
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

const filtered = computed(() => {
  return alerts.value.filter((row) => {
    if (filterLevel.value !== 'all' && row.complianceStatus !== filterLevel.value) return false
    if (onlyMissingId.value && row.identityComplete) return false
    return true
  })
})

const satCount = computed(() => alerts.value.filter(a => a.complianceStatus === 'sat_report').length)
const pldCount = computed(() => alerts.value.filter(a => a.complianceStatus === 'pld_pending').length)

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatMoney(amount: number) {
  return `$${amount.toLocaleString('es-MX')} MXN`
}

function levelLabel(status: AdminComplianceAlert['complianceStatus']) {
  return status === 'sat_report'
    ? t('admin.alerts.sat')
    : t('admin.alerts.pld')
}
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-10 md:px-6">
    <header class="mb-2">
      <h1 class="section-title">
        {{ t('admin.alerts.title') }}
      </h1>
      <p class="mt-2 text-gray-600">
        {{ t('admin.alerts.subtitle') }}
      </p>
    </header>
    <p v-if="error" class="mb-4 text-sm text-red-600">
      {{ error }}
    </p>

    <div v-if="loading" class="py-12 text-center text-gray-500">
      {{ t('common.loading') }}
    </div>
    <template v-else>
      <div class="mb-6 grid gap-3 sm:grid-cols-2">
        <article class="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">
            {{ t('admin.alerts.pld') }}
          </p>
          <p class="mt-1 text-2xl font-bold text-ink">
            {{ pldCount }}
          </p>
        </article>
        <article class="rounded-lg border border-red-200 bg-red-50 p-4">
          <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">
            {{ t('admin.alerts.sat') }}
          </p>
          <p class="mt-1 text-2xl font-bold text-ink">
            {{ satCount }}
          </p>
        </article>
      </div>

      <div class="mb-6 flex flex-wrap items-end gap-3">
        <label class="text-sm text-ink">
          {{ t('admin.alerts.level') }}
          <select v-model="filterLevel" class="mt-1 block rounded border border-gray-300 px-2 py-1">
            <option value="all">{{ t('admin.donations.all') }}</option>
            <option value="pld_pending">{{ t('admin.alerts.pld') }}</option>
            <option value="sat_report">{{ t('admin.alerts.sat') }}</option>
          </select>
        </label>
        <label class="flex items-center gap-2 text-sm text-ink">
          <input v-model="onlyMissingId" type="checkbox" class="rounded border-gray-300">
          {{ t('admin.alerts.onlyMissingId') }}
        </label>
        <button type="button" class="btn-secondary px-3 py-1.5 text-sm" @click="load">
          {{ t('admin.alerts.refresh') }}
        </button>
      </div>

      <p v-if="filtered.length === 0" class="text-gray-500">
        {{ t('admin.alerts.empty') }}
      </p>
      <div v-else class="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table class="min-w-full text-left text-sm">
          <thead class="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th class="px-4 py-3">{{ t('admin.users.name') }}</th>
              <th class="px-4 py-3">{{ t('admin.alerts.level') }}</th>
              <th class="px-4 py-3">{{ t('admin.alerts.windowPaid') }}</th>
              <th class="px-4 py-3">{{ t('admin.alerts.identity') }}</th>
              <th class="px-4 py-3">{{ t('admin.alerts.rfc') }}</th>
              <th class="px-4 py-3">{{ t('admin.alerts.lastDonation') }}</th>
              <th class="px-4 py-3">{{ t('admin.users.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in filtered"
              :key="row.userId"
              class="border-b border-gray-100 last:border-0"
            >
              <td class="px-4 py-3">
                <p class="font-medium text-ink">
                  {{ row.name }}
                </p>
                <p class="text-xs text-gray-500">
                  {{ row.email }}
                </p>
              </td>
              <td class="px-4 py-3">
                <span
                  class="rounded-full px-2 py-0.5 text-xs font-medium"
                  :class="row.complianceStatus === 'sat_report'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-amber-100 text-amber-900'"
                >
                  {{ levelLabel(row.complianceStatus) }}
                </span>
              </td>
              <td class="whitespace-nowrap px-4 py-3 font-semibold text-brand">
                {{ formatMoney(row.paidInWindow) }}
                <p class="text-xs font-normal text-gray-500">
                  {{ t('admin.alerts.thresholds', {
                    pld: formatMoney(row.pldThreshold),
                    sat: formatMoney(row.satThreshold),
                  }) }}
                </p>
              </td>
              <td class="px-4 py-3">
                <span
                  class="rounded-full px-2 py-0.5 text-xs font-medium"
                  :class="row.identityComplete ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                >
                  {{ row.identityComplete ? t('admin.alerts.idOk') : t('admin.alerts.idMissing') }}
                </span>
              </td>
              <td class="px-4 py-3 font-mono text-xs text-gray-700">
                {{ row.rfc || '—' }}
              </td>
              <td class="whitespace-nowrap px-4 py-3 text-gray-600">
                {{ formatDate(row.lastDonationAt) }}
              </td>
              <td class="px-4 py-3">
                <button
                  type="button"
                  class="text-sm font-medium text-brand hover:underline"
                  @click="openDonor(row.userId)"
                >
                  {{ t('admin.alerts.openProfile') }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>
