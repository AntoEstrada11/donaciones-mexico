<script setup lang="ts">
import type { AdminUserRow, AdminUsersPage, DonorStatus } from '~/types'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const { t } = useI18n()
const { adminHeaders, user } = useAuth()
const route = useRoute()
const { openDonor } = useAdminDonorDrawer()

const users = ref<AdminUserRow[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(25)
const loading = ref(true)
const error = ref('')
const success = ref('')
const resetLink = ref('')
const resetLinkFor = ref('')

const filterQ = ref(typeof route.query.q === 'string' ? route.query.q : '')
const filterStatus = ref<'all' | DonorStatus>('all')
const filterChurch = ref('all')
const churchOptions = ref<Array<{ id: string, name: string }>>([])

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))

watch(() => route.query.q, (q) => {
  filterQ.value = typeof q === 'string' ? q : ''
  page.value = 1
  load()
})
async function loadChurches() {
  try {
    churchOptions.value = await $fetch('/api/admin/users/church-options', {
      headers: adminHeaders(),
    })
  }
  catch {
    churchOptions.value = []
  }
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const result = await $fetch<AdminUsersPage>('/api/admin/users', {
      headers: adminHeaders(),
      query: {
        scope: 'donors',
        q: filterQ.value || undefined,
        status: filterStatus.value,
        churchId: filterChurch.value,
        page: page.value,
        pageSize: pageSize.value,
      },
    })
    users.value = result.items
    total.value = result.total
    page.value = result.page
    pageSize.value = result.pageSize
  }
  catch (e: unknown) {
    const msg = (e as { data?: { statusMessage?: string } })?.data?.statusMessage
    error.value = msg || t('common.error')
  }
  finally {
    loading.value = false
  }
}

function applyFilters() {
  page.value = 1
  load()
}

onMounted(async () => {
  await loadChurches()
  await load()
})

async function setStatus(row: AdminUserRow, status: DonorStatus) {
  if (row.status === status) return
  error.value = ''
  success.value = ''
  resetLink.value = ''
  try {
    const updated = await $fetch<AdminUserRow>(`/api/admin/users/${row.id}/status`, {
      method: 'PATCH',
      headers: adminHeaders(),
      body: { status },
    })
    const index = users.value.findIndex(u => u.id === row.id)
    if (index >= 0) users.value[index] = updated
    success.value = status === 'active'
      ? t('admin.users.reactivated')
      : t('admin.users.deactivated')
  }
  catch (e: unknown) {
    const msg = (e as { data?: { statusMessage?: string } })?.data?.statusMessage
    error.value = msg || t('common.error')
  }
}

async function sendPasswordReset(row: AdminUserRow) {
  error.value = ''
  success.value = ''
  resetLink.value = ''
  try {
    const result = await $fetch<{ message: string, resetUrl?: string }>(
      `/api/admin/users/${row.id}/password-reset`,
      { method: 'POST', headers: adminHeaders() },
    )
    resetLinkFor.value = row.email
    resetLink.value = result.resetUrl || ''
    success.value = result.message
  }
  catch (e: unknown) {
    const msg = (e as { data?: { statusMessage?: string } })?.data?.statusMessage
    error.value = msg || t('common.error')
  }
}

async function copyResetLink() {
  if (!resetLink.value || !import.meta.client) return
  try {
    await navigator.clipboard.writeText(resetLink.value)
    success.value = t('admin.users.resetCopied')
  }
  catch {
    error.value = t('admin.users.resetCopyError')
  }
}

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function statusLabel(status: DonorStatus) {
  return status === 'active' ? t('admin.users.statusActive') : t('admin.users.statusDeactivated')
}

function prevPage() {
  if (page.value <= 1) return
  page.value -= 1
  load()
}

function nextPage() {
  if (page.value >= totalPages.value) return
  page.value += 1
  load()
}
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-10 md:px-6">
    <header class="mb-2">
      <h1 class="section-title">
        {{ t('admin.users.title') }}
      </h1>
      <p class="mt-2 text-gray-600">
        {{ t('admin.users.subtitle') }}
      </p>
    </header>
    <p v-if="error" class="mb-4 text-sm text-red-600">
      {{ error }}
    </p>
    <p v-if="success" class="mb-4 text-sm text-green-700">
      {{ success }}
    </p>

    <div
      v-if="resetLink"
      class="mb-6 rounded-lg border border-brand/30 bg-brand-light/40 p-4 text-sm"
    >
      <p class="font-medium text-ink">
        {{ t('admin.users.resetLinkFor', { email: resetLinkFor }) }}
      </p>
      <p class="mt-1 text-xs text-gray-600">
        {{ t('admin.users.resetLinkHint') }}
      </p>
      <div class="mt-3 flex flex-wrap items-center gap-2">
        <code class="block max-w-full overflow-x-auto rounded bg-white px-2 py-1 text-xs text-ink">
          {{ resetLink }}
        </code>
        <button type="button" class="btn-secondary px-3 py-1.5 text-xs" @click="copyResetLink">
          {{ t('admin.users.resetCopy') }}
        </button>
      </div>
    </div>

    <div class="mb-4 flex flex-wrap items-end gap-3 rounded-lg border border-gray-200 bg-white p-4">
      <label class="text-sm text-ink">
        {{ t('admin.users.filterSearch') }}
        <input
          v-model="filterQ"
          type="search"
          class="mt-1 block w-56 rounded border border-gray-300 px-2 py-1"
          :placeholder="t('admin.users.filterSearchPh')"
          @keyup.enter="applyFilters"
        >
      </label>
      <label class="text-sm text-ink">
        {{ t('admin.users.accountStatus') }}
        <select v-model="filterStatus" class="mt-1 block rounded border border-gray-300 px-2 py-1">
          <option value="all">{{ t('admin.users.filterAll') }}</option>
          <option value="active">{{ t('admin.users.statusActive') }}</option>
          <option value="deactivated">{{ t('admin.users.statusDeactivated') }}</option>
        </select>
      </label>
      <label class="text-sm text-ink">
        {{ t('admin.users.church') }}
        <select v-model="filterChurch" class="mt-1 block max-w-xs rounded border border-gray-300 px-2 py-1">
          <option value="all">{{ t('admin.users.filterAll') }}</option>
          <option v-for="c in churchOptions" :key="c.id" :value="c.id">
            {{ c.name }}
          </option>
        </select>
      </label>
      <button type="button" class="btn-secondary px-3 py-1.5 text-sm" @click="applyFilters">
        {{ t('admin.users.applyFilters') }}
      </button>
    </div>

    <p class="mb-3 text-sm text-gray-500">
      {{ t('admin.users.resultCount', { total, page, pages: totalPages }) }}
    </p>

    <div v-if="loading" class="py-12 text-center text-gray-500">
      {{ t('common.loading') }}
    </div>
    <div v-else class="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table class="min-w-full text-left text-sm">
        <thead class="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
          <tr>
            <th class="px-4 py-3">{{ t('admin.users.name') }}</th>
            <th class="px-4 py-3">{{ t('admin.users.email') }}</th>
            <th class="px-4 py-3">{{ t('admin.users.church') }}</th>
            <th class="px-4 py-3">{{ t('admin.users.created') }}</th>
            <th class="px-4 py-3">{{ t('admin.users.accountStatus') }}</th>
            <th class="px-4 py-3">{{ t('admin.users.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in users"
            :key="row.id"
            class="border-b border-gray-100 last:border-0"
          >
            <td class="px-4 py-3 font-medium text-ink">
              <button
                type="button"
                class="text-left hover:text-brand hover:underline"
                @click="openDonor(row.id)"
              >
                {{ row.name }}
              </button>
              <span v-if="row.id === user?.id" class="text-xs text-gray-400">({{ t('admin.users.you') }})</span>
            </td>
            <td class="px-4 py-3 text-gray-600">
              {{ row.email }}
            </td>
            <td class="px-4 py-3 text-gray-600">
              {{ row.homeChurchName || row.homeChurchId || '—' }}
            </td>
            <td class="whitespace-nowrap px-4 py-3 text-gray-500">
              {{ formatDate(row.createdAt) }}
            </td>
            <td class="px-4 py-3">
              <span
                class="rounded-full px-2 py-0.5 text-xs font-medium"
                :class="row.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
              >
                {{ statusLabel(row.status) }}
              </span>
            </td>
            <td class="px-4 py-3">
              <div class="flex flex-col gap-1">
                <button
                  type="button"
                  class="text-left text-sm font-medium text-brand hover:underline"
                  @click="openDonor(row.id)"
                >
                  {{ t('admin.users.viewProfile') }}
                </button>
                <button
                  v-if="row.status === 'active'"
                  type="button"
                  class="text-left text-sm font-medium text-red-700 hover:underline"
                  @click="setStatus(row, 'deactivated')"
                >
                  {{ t('admin.users.deactivate') }}
                </button>
                <button
                  v-else
                  type="button"
                  class="text-left text-sm font-medium text-green-700 hover:underline"
                  @click="setStatus(row, 'active')"
                >
                  {{ t('admin.users.reactivate') }}
                </button>
                <button
                  type="button"
                  class="text-left text-sm font-medium text-brand hover:underline"
                  @click="sendPasswordReset(row)"
                >
                  {{ t('admin.users.sendReset') }}
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
      <button
        type="button"
        class="btn-secondary px-3 py-1.5 text-sm"
        :disabled="page <= 1 || loading"
        @click="prevPage"
      >
        {{ t('admin.users.prev') }}
      </button>
      <p class="text-sm text-gray-600">
        {{ page }} / {{ totalPages }}
      </p>
      <button
        type="button"
        class="btn-secondary px-3 py-1.5 text-sm"
        :disabled="page >= totalPages || loading"
        @click="nextPage"
      >
        {{ t('admin.users.next') }}
      </button>
    </div>
  </div>
</template>
