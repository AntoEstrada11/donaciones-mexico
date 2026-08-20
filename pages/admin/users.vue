<script setup lang="ts">
import type { AdminUserRow, DonorStatus } from '~/types'

definePageMeta({ middleware: 'admin' })

const { t } = useI18n()
const { adminHeaders, user } = useAuth()

const users = ref<AdminUserRow[]>([])
const loading = ref(true)
const error = ref('')
const success = ref('')
const resetLink = ref('')
const resetLinkFor = ref('')

async function load() {
  loading.value = true
  error.value = ''
  try {
    users.value = await $fetch<AdminUserRow[]>('/api/admin/users', {
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
    const result = await $fetch<{ message: string, resetUrl: string }>(
      `/api/admin/users/${row.id}/password-reset`,
      { method: 'POST', headers: adminHeaders() },
    )
    resetLinkFor.value = row.email
    resetLink.value = result.resetUrl
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

    <AdminNav />

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

    <div v-if="loading" class="py-12 text-center text-gray-500">
      {{ t('common.loading') }}
    </div>
    <div v-else class="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table class="min-w-full text-left text-sm">
        <thead class="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
          <tr>
            <th class="px-4 py-3">{{ t('admin.users.name') }}</th>
            <th class="px-4 py-3">{{ t('admin.users.email') }}</th>
            <th class="px-4 py-3">{{ t('admin.users.created') }}</th>
            <th class="px-4 py-3">{{ t('admin.users.role') }}</th>
            <th class="px-4 py-3">{{ t('admin.users.accountStatus') }}</th>
            <th class="px-4 py-3">{{ t('admin.users.statusChangedAt') }}</th>
            <th class="px-4 py-3">{{ t('admin.users.statusChangedBy') }}</th>
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
              {{ row.name }}
              <span v-if="row.id === user?.id" class="text-xs text-gray-400">({{ t('admin.users.you') }})</span>
            </td>
            <td class="px-4 py-3 text-gray-600">
              {{ row.email }}
            </td>
            <td class="whitespace-nowrap px-4 py-3 text-gray-500">
              {{ formatDate(row.createdAt) }}
            </td>
            <td class="px-4 py-3">
              <span
                class="rounded-full px-2 py-0.5 text-xs font-medium"
                :class="row.role === 'admin' ? 'bg-brand/10 text-brand' : 'bg-gray-100 text-gray-600'"
              >
                {{ row.role === 'admin' ? t('admin.users.roleAdmin') : t('admin.users.roleDonor') }}
              </span>
            </td>
            <td class="px-4 py-3">
              <span
                v-if="row.role === 'donor'"
                class="rounded-full px-2 py-0.5 text-xs font-medium"
                :class="row.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
              >
                {{ statusLabel(row.status) }}
              </span>
              <span v-else class="text-xs text-gray-400">—</span>
            </td>
            <td class="whitespace-nowrap px-4 py-3 text-gray-500">
              {{ row.role === 'donor' ? formatDate(row.statusChangedAt) : '—' }}
            </td>
            <td class="px-4 py-3 text-gray-600">
              {{
                row.role === 'donor'
                  ? (row.statusChangedByName || t('admin.users.statusSystem'))
                  : '—'
              }}
            </td>
            <td class="px-4 py-3">
              <div v-if="row.role === 'donor'" class="flex flex-col gap-1">
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
              <span v-else class="text-xs text-gray-400">{{ t('admin.users.adminNoActions') }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
