<script setup lang="ts">
import type { AdminCampaign } from '~/types'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const { t } = useI18n()
const { adminHeaders } = useAuth()

const campaigns = ref<AdminCampaign[]>([])
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const success = ref('')

const form = reactive({
  name: '',
  description: '',
  startsAt: '',
  endsAt: '',
  active: true,
})

async function load() {
  loading.value = true
  error.value = ''
  try {
    campaigns.value = await $fetch<AdminCampaign[]>('/api/admin/campaigns', {
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

async function createCampaign() {
  error.value = ''
  success.value = ''
  saving.value = true
  try {
    await $fetch('/api/admin/campaigns', {
      method: 'POST',
      headers: adminHeaders(),
      body: {
        name: form.name,
        description: form.description || form.name,
        startsAt: form.startsAt || null,
        endsAt: form.endsAt || null,
        active: form.active,
      },
    })
    form.name = ''
    form.description = ''
    form.startsAt = ''
    form.endsAt = ''
    form.active = true
    success.value = t('admin.campaigns.created')
    await load()
  }
  catch (e: unknown) {
    const msg = (e as { data?: { statusMessage?: string } })?.data?.statusMessage
    error.value = msg || t('common.error')
  }
  finally {
    saving.value = false
  }
}

async function patchCampaign(id: string, body: Record<string, unknown>) {
  error.value = ''
  success.value = ''
  try {
    await $fetch(`/api/admin/campaigns/${id}`, {
      method: 'PATCH',
      headers: adminHeaders(),
      body,
    })
    success.value = t('admin.campaigns.updated')
    await load()
  }
  catch (e: unknown) {
    const msg = (e as { data?: { statusMessage?: string } })?.data?.statusMessage
    error.value = msg || t('common.error')
  }
}

function toLocalInput(iso: string | null) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function formatWindow(row: AdminCampaign) {
  if (!row.startsAt && !row.endsAt) return t('admin.campaigns.always')
  const from = row.startsAt
    ? new Date(row.startsAt).toLocaleString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—'
  const to = row.endsAt
    ? new Date(row.endsAt).toLocaleString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—'
  return `${from} → ${to}`
}

function isLive(row: AdminCampaign) {
  if (!row.active) return false
  const now = Date.now()
  if (row.startsAt && new Date(row.startsAt).getTime() > now) return false
  if (row.endsAt && new Date(row.endsAt).getTime() < now) return false
  return true
}
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-10 md:px-6">
    <header class="mb-2">
      <h1 class="section-title">
        {{ t('admin.campaigns.title') }}
      </h1>
      <p class="mt-2 text-gray-600">
        {{ t('admin.campaigns.subtitle') }}
      </p>
    </header>
    <p v-if="error" class="mb-4 text-sm text-red-600">
      {{ error }}
    </p>
    <p v-if="success" class="mb-4 text-sm text-green-700">
      {{ success }}
    </p>

    <section class="mb-8 rounded-xl border border-gray-200 bg-white p-5">
      <h2 class="mb-3 text-lg font-semibold text-ink">
        {{ t('admin.campaigns.createTitle') }}
      </h2>
      <form class="grid gap-3 sm:grid-cols-2" @submit.prevent="createCampaign">
        <label class="text-sm text-ink sm:col-span-2">
          {{ t('admin.campaigns.name') }}
          <input
            v-model="form.name"
            type="text"
            required
            maxlength="120"
            class="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
          >
        </label>
        <label class="text-sm text-ink sm:col-span-2">
          {{ t('admin.campaigns.description') }}
          <textarea
            v-model="form.description"
            rows="2"
            maxlength="500"
            class="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
          />
        </label>
        <label class="text-sm text-ink">
          {{ t('admin.campaigns.startsAt') }}
          <input
            v-model="form.startsAt"
            type="datetime-local"
            class="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
          >
        </label>
        <label class="text-sm text-ink">
          {{ t('admin.campaigns.endsAt') }}
          <input
            v-model="form.endsAt"
            type="datetime-local"
            class="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
          >
        </label>
        <label class="flex items-center gap-2 text-sm text-ink sm:col-span-2">
          <input v-model="form.active" type="checkbox" class="rounded border-gray-300">
          {{ t('admin.campaigns.active') }}
        </label>
        <div class="sm:col-span-2">
          <button type="submit" class="btn-primary px-4 py-2 text-sm" :disabled="saving">
            {{ saving ? t('admin.campaigns.saving') : t('admin.campaigns.create') }}
          </button>
        </div>
      </form>
      <p class="mt-3 text-xs text-gray-500">
        {{ t('admin.campaigns.windowHint') }}
      </p>
    </section>

    <div v-if="loading" class="py-12 text-center text-gray-500">
      {{ t('common.loading') }}
    </div>
    <div v-else class="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table class="min-w-full text-left text-sm">
        <thead class="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
          <tr>
            <th class="px-4 py-3">{{ t('admin.campaigns.name') }}</th>
            <th class="px-4 py-3">{{ t('admin.campaigns.window') }}</th>
            <th class="px-4 py-3">{{ t('admin.campaigns.status') }}</th>
            <th class="px-4 py-3">{{ t('admin.users.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in campaigns"
            :key="row.id"
            class="border-b border-gray-100 last:border-0"
          >
            <td class="px-4 py-3">
              <p class="font-medium text-ink">
                {{ row.name }}
              </p>
              <p class="text-xs text-gray-500">
                {{ row.description }}
              </p>
            </td>
            <td class="px-4 py-3 text-gray-600">
              {{ formatWindow(row) }}
              <div class="mt-2 grid gap-1">
                <input
                  type="datetime-local"
                  class="rounded border border-gray-300 px-2 py-1 text-xs"
                  :value="toLocalInput(row.startsAt)"
                  @change="patchCampaign(row.id, { startsAt: ($event.target as HTMLInputElement).value || null })"
                >
                <input
                  type="datetime-local"
                  class="rounded border border-gray-300 px-2 py-1 text-xs"
                  :value="toLocalInput(row.endsAt)"
                  @change="patchCampaign(row.id, { endsAt: ($event.target as HTMLInputElement).value || null })"
                >
              </div>
            </td>
            <td class="px-4 py-3">
              <span
                class="rounded-full px-2 py-0.5 text-xs font-medium"
                :class="isLive(row) ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'"
              >
                {{ isLive(row) ? t('admin.campaigns.live') : t('admin.campaigns.offline') }}
              </span>
            </td>
            <td class="px-4 py-3">
              <button
                type="button"
                class="text-sm font-medium text-brand hover:underline"
                @click="patchCampaign(row.id, { active: !row.active })"
              >
                {{ row.active ? t('admin.campaigns.deactivate') : t('admin.campaigns.activate') }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
