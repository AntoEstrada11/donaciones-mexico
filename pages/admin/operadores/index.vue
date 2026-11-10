<script setup lang="ts">
import type { AdminUserRow, AdminUsersPage, UserRole } from '~/types'
import { STAFF_EMAIL_DOMAIN } from '~/utils/staffEmail'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const { t } = useI18n()
const { adminHeaders, user } = useAuth()

const staff = ref<AdminUserRow[]>([])
const candidates = ref<AdminUserRow[]>([])
const loading = ref(true)
const error = ref('')
const success = ref('')
const resetLink = ref('')
const resetLinkFor = ref('')
const busyId = ref('')

async function loadList(scope: 'staff' | 'staff_candidates') {
  const result = await $fetch<AdminUsersPage>('/api/admin/users', {
    headers: adminHeaders(),
    query: { scope, page: 1, pageSize: 100 },
  })
  return result.items
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const [staffRows, candidateRows] = await Promise.all([
      loadList('staff'),
      loadList('staff_candidates'),
    ])
    staff.value = staffRows
    candidates.value = candidateRows
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

async function setRole(row: AdminUserRow, role: UserRole) {
  if (row.role === role) return
  error.value = ''
  success.value = ''
  busyId.value = row.id
  try {
    await $fetch<AdminUserRow>(`/api/admin/users/${row.id}/role`, {
      method: 'PATCH',
      headers: adminHeaders(),
      body: { role },
    })
    success.value = t('admin.users.roleUpdated')
    await load()
  }
  catch (e: unknown) {
    const msg = (e as { data?: { statusMessage?: string } })?.data?.statusMessage
    error.value = msg || t('common.error')
  }
  finally {
    busyId.value = ''
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
  })
}

function roleLabel(role: UserRole) {
  if (role === 'admin') return t('admin.users.roleAdmin')
  if (role === 'editor') return t('admin.users.roleEditor')
  return t('admin.users.roleDonor')
}
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-10 md:px-6">
    <header class="mb-2">
      <h1 class="section-title">
        {{ t('admin.operators.title') }}
      </h1>
      <p class="mt-2 text-gray-600">
        {{ t('admin.operators.subtitle', { domain: STAFF_EMAIL_DOMAIN }) }}
      </p>
    </header>

    <AdminOperatorsNav />

    <p class="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
      {{ t('admin.operators.hubNote') }}
    </p>

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

    <template v-else>
      <section class="mb-10">
        <h2 class="mb-3 text-lg font-semibold text-ink">
          {{ t('admin.operators.staffTitle') }}
        </h2>
        <p v-if="!staff.length" class="text-sm text-gray-500">
          {{ t('admin.operators.staffEmpty') }}
        </p>
        <div v-else class="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table class="min-w-full text-left text-sm">
            <thead class="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th class="px-4 py-3">{{ t('admin.users.name') }}</th>
                <th class="px-4 py-3">{{ t('admin.users.email') }}</th>
                <th class="px-4 py-3">{{ t('admin.users.role') }}</th>
                <th class="px-4 py-3">{{ t('admin.users.created') }}</th>
                <th class="px-4 py-3">{{ t('admin.users.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in staff"
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
                <td class="px-4 py-3">
                  <span
                    class="rounded-full px-2 py-0.5 text-xs font-medium"
                    :class="row.role === 'admin' ? 'bg-brand/10 text-brand' : 'bg-amber-100 text-amber-900'"
                  >
                    {{ roleLabel(row.role) }}
                  </span>
                </td>
                <td class="whitespace-nowrap px-4 py-3 text-gray-500">
                  {{ formatDate(row.createdAt) }}
                </td>
                <td class="px-4 py-3">
                  <div class="flex flex-col gap-1">
                    <button
                      v-if="row.role === 'editor'"
                      type="button"
                      class="text-left text-sm font-medium text-brand hover:underline disabled:opacity-50"
                      :disabled="busyId === row.id"
                      @click="setRole(row, 'admin')"
                    >
                      {{ t('admin.users.makeAdmin') }}
                    </button>
                    <button
                      v-if="row.role === 'admin'"
                      type="button"
                      class="text-left text-sm font-medium text-amber-800 hover:underline disabled:opacity-50"
                      :disabled="busyId === row.id"
                      @click="setRole(row, 'editor')"
                    >
                      {{ t('admin.users.makeEditor') }}
                    </button>
                    <button
                      type="button"
                      class="text-left text-sm font-medium text-gray-700 hover:underline disabled:opacity-50"
                      :disabled="busyId === row.id"
                      @click="setRole(row, 'donor')"
                    >
                      {{ t('admin.users.makeDonor') }}
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
      </section>

      <section>
        <h2 class="mb-1 text-lg font-semibold text-ink">
          {{ t('admin.operators.candidatesTitle', { domain: STAFF_EMAIL_DOMAIN }) }}
        </h2>
        <p class="mb-3 text-sm text-gray-600">
          {{ t('admin.operators.candidatesHint') }}
        </p>
        <p v-if="!candidates.length" class="text-sm text-gray-500">
          {{ t('admin.operators.candidatesEmpty', { domain: STAFF_EMAIL_DOMAIN }) }}
        </p>
        <div v-else class="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table class="min-w-full text-left text-sm">
            <thead class="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th class="px-4 py-3">{{ t('admin.users.name') }}</th>
                <th class="px-4 py-3">{{ t('admin.users.email') }}</th>
                <th class="px-4 py-3">{{ t('admin.users.created') }}</th>
                <th class="px-4 py-3">{{ t('admin.users.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in candidates"
                :key="row.id"
                class="border-b border-gray-100 last:border-0"
              >
                <td class="px-4 py-3 font-medium text-ink">
                  {{ row.name }}
                </td>
                <td class="px-4 py-3 text-gray-600">
                  {{ row.email }}
                </td>
                <td class="whitespace-nowrap px-4 py-3 text-gray-500">
                  {{ formatDate(row.createdAt) }}
                </td>
                <td class="px-4 py-3">
                  <div class="flex flex-col gap-1">
                    <button
                      type="button"
                      class="text-left text-sm font-medium text-brand hover:underline disabled:opacity-50"
                      :disabled="busyId === row.id"
                      @click="setRole(row, 'admin')"
                    >
                      {{ t('admin.users.makeAdmin') }}
                    </button>
                    <button
                      type="button"
                      class="text-left text-sm font-medium text-amber-800 hover:underline disabled:opacity-50"
                      :disabled="busyId === row.id"
                      @click="setRole(row, 'editor')"
                    >
                      {{ t('admin.users.makeEditor') }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </template>
  </div>
</template>
