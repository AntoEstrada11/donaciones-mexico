<script setup lang="ts">
import type { AdminDonationRow, AdminStats } from '~/types'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const { t } = useI18n()
const { adminHeaders } = useAuth()

const stats = ref<AdminStats | null>(null)
const recent = ref<AdminDonationRow[]>([])
const error = ref('')
const loading = ref(true)

onMounted(async () => {
  try {
    const [statsRes, donationsRes] = await Promise.all([
      $fetch<AdminStats>('/api/admin/stats', { headers: adminHeaders() }),
      $fetch<AdminDonationRow[]>('/api/admin/donations', {
        headers: adminHeaders(),
        query: { limit: 8 },
      }),
    ])
    stats.value = statsRes
    recent.value = donationsRes
  }
  catch (e: unknown) {
    const msg = (e as { data?: { statusMessage?: string } })?.data?.statusMessage
    error.value = msg || t('common.error')
  }
  finally {
    loading.value = false
  }
})

const statusBars = computed(() => {
  if (!stats.value) return []
  const entries = Object.entries(stats.value.donationsByStatus) as Array<[string, number]>
  const total = entries.reduce((sum, [, n]) => sum + n, 0) || 1
  const colors: Record<string, string> = {
    paid: 'bg-emerald-500',
    pending: 'bg-amber-400',
    failed: 'bg-red-400',
    cancelled: 'bg-gray-300',
    refunded: 'bg-sky-400',
  }
  return entries
    .filter(([, n]) => n > 0)
    .map(([status, count]) => ({
      status,
      count,
      pct: Math.round((count / total) * 100),
      color: colors[status] || 'bg-brand',
      label: t(`admin.dashboard.status.${status}`),
    }))
})

const metricCards = computed(() => {
  if (!stats.value) return []
  return [
    {
      key: 'users',
      label: t('admin.stats.users'),
      value: stats.value.users,
      hint: t('admin.stats.admins', { count: stats.value.admins }),
      to: '/admin/users',
      tone: 'brand',
    },
    {
      key: 'spei',
      label: t('admin.stats.speiPending'),
      value: stats.value.speiPending,
      hint: t('admin.openSpeiDesc'),
      to: '/admin/spei',
      tone: 'amber',
    },
    {
      key: 'pending',
      label: t('admin.stats.pending'),
      value: stats.value.donationsByStatus.pending,
      hint: t('admin.openDonationsDesc'),
      to: '/admin/donations',
      tone: 'slate',
    },
    {
      key: 'paid',
      label: t('admin.stats.paid'),
      value: stats.value.donationsByStatus.paid,
      hint: t('admin.dashboard.paidHint'),
      to: '/admin/donations',
      tone: 'emerald',
    },
    {
      key: 'pld',
      label: t('admin.stats.pld'),
      value: stats.value.pldPending,
      hint: t('admin.openAlertsDesc'),
      to: '/admin/alertas',
      tone: 'amber',
    },
    {
      key: 'sat',
      label: t('admin.stats.sat'),
      value: stats.value.satReport,
      hint: t('admin.openAlertsDesc'),
      to: '/admin/alertas',
      tone: 'rose',
    },
  ]
})

function toneClass(tone: string) {
  if (tone === 'amber') return 'from-amber-50 to-white ring-amber-100'
  if (tone === 'emerald') return 'from-emerald-50 to-white ring-emerald-100'
  if (tone === 'rose') return 'from-rose-50 to-white ring-rose-100'
  if (tone === 'slate') return 'from-slate-50 to-white ring-slate-100'
  return 'from-brand-light to-white ring-brand/10'
}

function formatMoney(amount: number | string) {
  const n = typeof amount === 'string' ? Number(amount) : amount
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n || 0)
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('es-MX', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function statusLabel(status: string) {
  return t(`admin.dashboard.status.${status}`)
}
</script>

<template>
  <div class="mx-auto max-w-7xl">
    <header class="mb-8 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-brand/70">
          {{ t('admin.dashboard.eyebrow') }}
        </p>
        <h1 class="mt-1 text-3xl font-bold tracking-tight text-ink md:text-4xl">
          {{ t('admin.title') }}
        </h1>
        <p class="mt-2 max-w-2xl text-sm text-gray-500 md:text-base">
          {{ t('admin.subtitle') }}
        </p>
      </div>
    </header>

    <div v-if="loading" class="rounded-3xl border border-white/60 bg-white/70 px-6 py-16 text-center text-gray-500 shadow-xl shadow-brand/5 backdrop-blur-md">
      {{ t('common.loading') }}
    </div>
    <p v-else-if="error" class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {{ error }}
    </p>

    <template v-else-if="stats">
      <section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <NuxtLink
          v-for="(card, index) in metricCards"
          :key="card.key"
          :to="card.to"
          class="group relative overflow-hidden rounded-3xl bg-gradient-to-br p-5 shadow-lg shadow-brand/5 ring-1 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-brand/10"
          :class="toneClass(card.tone)"
          :style="{ transitionDelay: `${index * 40}ms` }"
        >
          <div class="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-brand/[0.04] transition group-hover:scale-110" />
          <p class="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
            {{ card.label }}
          </p>
          <p class="mt-3 text-4xl font-bold tracking-tight text-ink">
            {{ card.value }}
          </p>
          <p class="mt-2 line-clamp-2 text-xs text-gray-500">
            {{ card.hint }}
          </p>
        </NuxtLink>
      </section>

      <section class="mt-6 grid gap-6 lg:grid-cols-5">
        <article class="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-xl shadow-brand/5 backdrop-blur-md lg:col-span-2">
          <h2 class="text-sm font-semibold text-ink">
            {{ t('admin.dashboard.distribution') }}
          </h2>
          <p class="mt-1 text-xs text-gray-500">
            {{ t('admin.dashboard.distributionHint') }}
          </p>
          <div class="mt-5 space-y-4">
            <div
              v-for="bar in statusBars"
              :key="bar.status"
            >
              <div class="mb-1.5 flex items-center justify-between text-xs">
                <span class="font-medium text-ink">{{ bar.label }}</span>
                <span class="text-gray-500">{{ bar.count }} · {{ bar.pct }}%</span>
              </div>
              <div class="h-2 overflow-hidden rounded-full bg-gray-100">
                <div
                  class="h-full rounded-full transition-all duration-700"
                  :class="bar.color"
                  :style="{ width: `${bar.pct}%` }"
                />
              </div>
            </div>
            <p v-if="!statusBars.length" class="text-sm text-gray-500">
              {{ t('admin.dashboard.noDonations') }}
            </p>
          </div>
        </article>

        <article class="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-xl shadow-brand/5 backdrop-blur-md lg:col-span-3">
          <div class="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 class="text-sm font-semibold text-ink">
                {{ t('admin.dashboard.recent') }}
              </h2>
              <p class="mt-1 text-xs text-gray-500">
                {{ t('admin.dashboard.recentHint') }}
              </p>
            </div>
            <NuxtLink to="/admin/donations" class="text-xs font-semibold text-brand hover:underline">
              {{ t('admin.dashboard.viewAll') }}
            </NuxtLink>
          </div>

          <ul v-if="recent.length" class="divide-y divide-gray-100">
            <li
              v-for="row in recent"
              :key="row.id"
              class="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
            >
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-light text-xs font-bold text-brand">
                {{ (row.userName || row.churchName || '?').slice(0, 1).toUpperCase() }}
              </div>
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-medium text-ink">
                  {{ row.userName || t('admin.donations.anonymous') }}
                </p>
                <p class="truncate text-xs text-gray-500">
                  {{ row.campaignName || '—' }} · {{ row.churchName || row.churchExternalId }}
                </p>
              </div>
              <div class="text-right">
                <p class="text-sm font-semibold text-ink">
                  {{ formatMoney(row.amount) }}
                </p>
                <p class="text-[11px] text-gray-500">
                  {{ statusLabel(row.status) }} · {{ formatDate(row.createdAt) }}
                </p>
              </div>
            </li>
          </ul>
          <p v-else class="py-8 text-center text-sm text-gray-500">
            {{ t('admin.dashboard.noRecent') }}
          </p>
        </article>
      </section>
    </template>
  </div>
</template>
