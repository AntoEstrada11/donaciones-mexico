<script setup lang="ts">
import type { AdminDonationRow, Donation } from '~/types'

definePageMeta({ middleware: 'admin' })

const { t } = useI18n()
const { adminHeaders } = useAuth()

const donations = ref<AdminDonationRow[]>([])
const loading = ref(true)
const error = ref('')

const filterStatus = ref<'all' | Donation['status']>('all')
const filterChurch = ref('all')
const filterType = ref('all')
const groupBy = ref<'church' | 'type' | 'status'>('church')

const statuses: Donation['status'][] = ['pending', 'paid', 'failed', 'cancelled', 'refunded']

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

const churchOptions = computed(() => {
  const map = new Map<string, string>()
  for (const row of donations.value) {
    map.set(row.churchId, row.churchName || row.churchId)
  }
  return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1], 'es'))
})

const typeOptions = computed(() => {
  const set = new Set<string>()
  for (const row of donations.value) {
    set.add(row.campaignType || row.campaignName || row.campaignId)
  }
  return [...set].sort((a, b) => a.localeCompare(b, 'es'))
})

const filtered = computed(() => {
  return donations.value.filter((row) => {
    if (filterStatus.value !== 'all' && row.status !== filterStatus.value) return false
    if (filterChurch.value !== 'all' && row.churchId !== filterChurch.value) return false
    const typeKey = row.campaignType || row.campaignName || row.campaignId
    if (filterType.value !== 'all' && typeKey !== filterType.value) return false
    return true
  })
})

const totals = computed(() => {
  const byStatus: Record<Donation['status'], { count: number, amount: number }> = {
    pending: { count: 0, amount: 0 },
    paid: { count: 0, amount: 0 },
    failed: { count: 0, amount: 0 },
    cancelled: { count: 0, amount: 0 },
    refunded: { count: 0, amount: 0 },
  }
  for (const row of filtered.value) {
    const bucket = byStatus[row.status]
    if (!bucket) continue
    bucket.count += 1
    bucket.amount += row.amount
  }
  return byStatus
})

interface DonationGroup {
  key: string
  label: string
  items: AdminDonationRow[]
  amount: number
}

const groups = computed<DonationGroup[]>(() => {
  const map = new Map<string, DonationGroup>()
  for (const row of filtered.value) {
    let key = row.status
    let label = t(`donation.status${row.status.charAt(0).toUpperCase()}${row.status.slice(1)}`)
    if (groupBy.value === 'church') {
      key = row.churchId
      label = row.churchName || row.churchId
    }
    else if (groupBy.value === 'type') {
      key = row.campaignType || row.campaignId
      label = row.campaignName || row.campaignType || row.campaignId
    }
    const current = map.get(key) || { key, label, items: [], amount: 0 }
    current.items.push(row)
    current.amount += row.amount
    map.set(key, current)
  }
  return [...map.values()].sort((a, b) => a.label.localeCompare(b.label, 'es'))
})

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

function formatMoney(amount: number) {
  return `$${amount.toLocaleString('es-MX')} MXN`
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
    <template v-else>
      <div class="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <article
          v-for="status in statuses"
          :key="status"
          class="rounded-lg border border-gray-200 bg-white p-4"
        >
          <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">
            {{ t(`donation.status${status.charAt(0).toUpperCase()}${status.slice(1)}`) }}
          </p>
          <p class="mt-1 text-2xl font-bold text-ink">
            {{ totals[status].count }}
          </p>
          <p class="text-sm text-brand">
            {{ formatMoney(totals[status].amount) }}
          </p>
        </article>
      </div>

      <div class="mb-6 flex flex-wrap gap-3">
        <label class="text-sm text-ink">
          {{ t('admin.donations.status') }}
          <select v-model="filterStatus" class="mt-1 block rounded border border-gray-300 px-2 py-1">
            <option value="all">{{ t('admin.donations.all') }}</option>
            <option v-for="status in statuses" :key="status" :value="status">
              {{ t(`donation.status${status.charAt(0).toUpperCase()}${status.slice(1)}`) }}
            </option>
          </select>
        </label>
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
          {{ t('admin.donations.type') }}
          <select v-model="filterType" class="mt-1 block rounded border border-gray-300 px-2 py-1">
            <option value="all">{{ t('admin.donations.all') }}</option>
            <option v-for="type in typeOptions" :key="type" :value="type">
              {{ type }}
            </option>
          </select>
        </label>
        <label class="text-sm text-ink">
          {{ t('admin.donations.groupBy') }}
          <select v-model="groupBy" class="mt-1 block rounded border border-gray-300 px-2 py-1">
            <option value="church">{{ t('admin.donations.church') }}</option>
            <option value="type">{{ t('admin.donations.type') }}</option>
            <option value="status">{{ t('admin.donations.status') }}</option>
          </select>
        </label>
      </div>

      <p v-if="filtered.length === 0" class="text-gray-500">
        {{ t('admin.donations.empty') }}
      </p>
      <section v-for="group in groups" :key="group.key" class="mb-8 rounded-xl border border-gray-200 bg-gray-50 p-4">
        <h2 class="mb-3 flex flex-wrap items-baseline justify-between gap-2 border-b border-gray-200 pb-2 text-lg font-semibold text-ink">
          <span>{{ group.label }}</span>
          <span class="text-sm font-normal text-gray-500">
            {{ group.items.length }} · {{ formatMoney(group.amount) }}
          </span>
        </h2>
        <div class="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table class="min-w-full text-left text-sm">
            <thead class="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th class="px-4 py-3">{{ t('admin.donations.date') }}</th>
                <th class="px-4 py-3">{{ t('admin.donations.donor') }}</th>
                <th class="px-4 py-3">{{ t('admin.donations.church') }}</th>
                <th class="px-4 py-3">{{ t('admin.donations.campaign') }}</th>
                <th class="px-4 py-3">{{ t('admin.donations.amount') }}</th>
                <th class="px-4 py-3">{{ t('admin.donations.status') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="donation in group.items"
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
                  {{ donation.churchName || donation.churchId }}
                </td>
                <td class="px-4 py-3 text-ink">
                  {{ donation.campaignName || donation.campaignId }}
                </td>
                <td class="whitespace-nowrap px-4 py-3 font-semibold text-brand">
                  {{ formatMoney(donation.amount) }}
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
      </section>
    </template>
  </div>
</template>
