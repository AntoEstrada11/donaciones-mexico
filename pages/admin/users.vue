<script setup lang="ts">
import type { AdminUserRow, UserRole } from '~/types'

definePageMeta({ middleware: 'admin' })

const { t } = useI18n()
const { adminHeaders, user } = useAuth()

const users = ref<AdminUserRow[]>([])
const loading = ref(true)
const error = ref('')

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

async function setRole(row: AdminUserRow, role: UserRole) {
  if (row.role === role) return
  error.value = ''
  try {
    const updated = await $fetch<AdminUserRow>(`/api/admin/users/${row.id}/role`, {
      method: 'PATCH',
      headers: adminHeaders(),
      body: { role },
    })
    const index = users.value.findIndex(u => u.id === row.id)
    if (index >= 0) users.value[index] = updated
  }
  catch (e: unknown) {
    const msg = (e as { data?: { statusMessage?: string } })?.data?.statusMessage
    error.value = msg || t('common.error')
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
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
              <button
                v-if="row.role !== 'admin'"
                type="button"
                class="text-sm font-medium text-brand hover:underline"
                @click="setRole(row, 'admin')"
              >
                {{ t('admin.users.promote') }}
              </button>
              <button
                v-else
                type="button"
                class="text-sm font-medium text-gray-600 hover:underline"
                @click="setRole(row, 'donor')"
              >
                {{ t('admin.users.demote') }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
