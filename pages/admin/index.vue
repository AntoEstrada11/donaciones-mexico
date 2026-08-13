<script setup lang="ts">
import type { AdminStats } from '~/types'

definePageMeta({ middleware: 'admin' })

const { t } = useI18n()
const { adminHeaders } = useAuth()

const stats = ref<AdminStats | null>(null)
const error = ref('')
const loading = ref(true)

onMounted(async () => {
  try {
    stats.value = await $fetch<AdminStats>('/api/admin/stats', {
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
})
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-10 md:px-6">
    <header class="mb-2">
      <h1 class="section-title">
        {{ t('admin.title') }}
      </h1>
      <p class="mt-2 text-gray-600">
        {{ t('admin.subtitle') }}
      </p>
    </header>

    <AdminNav />

    <div v-if="loading" class="py-12 text-center text-gray-500">
      {{ t('common.loading') }}
    </div>
    <p v-else-if="error" class="text-sm text-red-600">
      {{ error }}
    </p>
    <div v-else-if="stats" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <article class="rounded-lg border border-gray-200 bg-white p-5">
        <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">
          {{ t('admin.stats.users') }}
        </p>
        <p class="mt-2 text-3xl font-bold text-ink">
          {{ stats.users }}
        </p>
        <p class="mt-1 text-sm text-gray-500">
          {{ t('admin.stats.admins', { count: stats.admins }) }}
        </p>
      </article>
      <article class="rounded-lg border border-gray-200 bg-white p-5">
        <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">
          {{ t('admin.stats.pending') }}
        </p>
        <p class="mt-2 text-3xl font-bold text-ink">
          {{ stats.donationsByStatus.pending }}
        </p>
      </article>
      <article class="rounded-lg border border-gray-200 bg-white p-5">
        <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">
          {{ t('admin.stats.paid') }}
        </p>
        <p class="mt-2 text-3xl font-bold text-ink">
          {{ stats.donationsByStatus.paid }}
        </p>
      </article>
      <article class="rounded-lg border border-gray-200 bg-white p-5">
        <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">
          {{ t('admin.stats.slides') }}
        </p>
        <p class="mt-2 text-3xl font-bold text-ink">
          {{ stats.activeSlides }}
        </p>
      </article>
    </div>
  </div>
</template>
