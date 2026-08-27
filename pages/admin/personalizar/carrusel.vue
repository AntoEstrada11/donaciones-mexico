<script setup lang="ts">
import type { HeroSlide } from '~/types'
import { FIELD_LIMITS } from '~/utils/fieldLimits'

definePageMeta({ middleware: 'admin' })

const { t } = useI18n()
const { adminHeaders } = useAuth()

const slides = ref<HeroSlide[]>([])
const loading = ref(true)
const saving = ref(false)
const deleting = ref(false)
const confirmOpen = ref(false)
const pendingDelete = ref<HeroSlide | null>(null)
const error = ref('')
const success = ref('')
const alt = ref('')
const fileInput = ref<HTMLInputElement | null>(null)

async function load() {
  loading.value = true
  error.value = ''
  try {
    slides.value = await $fetch<HeroSlide[]>('/api/admin/slides', {
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

async function upload() {
  const file = fileInput.value?.files?.[0]
  if (!file) {
    error.value = t('admin.slides.fileRequired')
    return
  }

  saving.value = true
  error.value = ''
  success.value = ''

  try {
    const body = new FormData()
    body.append('file', file)
    body.append('alt', alt.value)

    await $fetch('/api/admin/slides', {
      method: 'POST',
      headers: adminHeaders(),
      body,
    })

    alt.value = ''
    if (fileInput.value) fileInput.value.value = ''
    success.value = t('admin.slides.uploaded')
    await load()
  }
  catch (e: unknown) {
    const msg = (e as { data?: { statusMessage?: string } })?.data?.statusMessage
    error.value = msg || t('admin.slides.uploadError')
  }
  finally {
    saving.value = false
  }
}

async function toggleActive(slide: HeroSlide) {
  error.value = ''
  try {
    await $fetch(`/api/admin/slides/${slide.id}`, {
      method: 'PATCH',
      headers: adminHeaders(),
      body: { active: !slide.active },
    })
    await load()
  }
  catch (e: unknown) {
    const msg = (e as { data?: { statusMessage?: string } })?.data?.statusMessage
    error.value = msg || t('common.error')
  }
}

async function move(slide: HeroSlide, direction: -1 | 1) {
  const ordered = [...slides.value].sort((a, b) => a.sortOrder - b.sortOrder)
  const index = ordered.findIndex(s => s.id === slide.id)
  const swapWith = ordered[index + direction]
  if (!swapWith) return

  error.value = ''
  try {
    await Promise.all([
      $fetch(`/api/admin/slides/${slide.id}`, {
        method: 'PATCH',
        headers: adminHeaders(),
        body: { sortOrder: swapWith.sortOrder },
      }),
      $fetch(`/api/admin/slides/${swapWith.id}`, {
        method: 'PATCH',
        headers: adminHeaders(),
        body: { sortOrder: slide.sortOrder },
      }),
    ])
    await load()
  }
  catch (e: unknown) {
    const msg = (e as { data?: { statusMessage?: string } })?.data?.statusMessage
    error.value = msg || t('common.error')
  }
}

function askRemove(slide: HeroSlide) {
  error.value = ''
  success.value = ''
  pendingDelete.value = slide
  confirmOpen.value = true
}

function cancelRemove() {
  pendingDelete.value = null
}

async function confirmRemove() {
  const slide = pendingDelete.value
  if (!slide) return

  deleting.value = true
  error.value = ''
  try {
    await $fetch(`/api/admin/slides/${slide.id}`, {
      method: 'DELETE',
      headers: adminHeaders(),
    })
    success.value = t('admin.slides.deleted')
    confirmOpen.value = false
    pendingDelete.value = null
    await load()
  }
  catch (e: unknown) {
    const msg = (e as { data?: { statusMessage?: string } })?.data?.statusMessage
    error.value = msg || t('common.error')
    confirmOpen.value = false
    pendingDelete.value = null
  }
  finally {
    deleting.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-10 md:px-6">
    <header class="mb-2">
      <h1 class="section-title">
        {{ t('admin.personalize.title') }}
      </h1>
      <p class="mt-2 text-gray-600">
        {{ t('admin.personalize.subtitle') }}
      </p>
    </header>

    <AdminNav />
    <AdminPersonalizeNav />

    <h2 class="mb-4 font-semibold text-ink">
      {{ t('admin.slides.title') }}
    </h2>
    <p class="mb-6 text-sm text-gray-600">
      {{ t('admin.slides.subtitle') }}
    </p>

    <form class="mb-8 space-y-3 rounded-lg border border-gray-200 bg-white p-5" @submit.prevent="upload">
      <h3 class="font-semibold text-ink">
        {{ t('admin.slides.upload') }}
      </h3>
      <input
        ref="fileInput"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        class="block w-full text-sm text-gray-600"
      >
      <input
        v-model="alt"
        type="text"
        :maxlength="FIELD_LIMITS.heroImage.maxAlt"
        :placeholder="t('admin.slides.altPlaceholder')"
        class="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
      >
      <p class="text-xs text-gray-500">
        {{ t('admin.slides.limits') }}
      </p>
      <button type="submit" class="btn-primary" :disabled="saving">
        {{ saving ? t('admin.slides.uploading') : t('admin.slides.upload') }}
      </button>
    </form>

    <p v-if="error" class="mb-4 text-sm text-red-600">
      {{ error }}
    </p>
    <p v-if="success" class="mb-4 text-sm text-green-700">
      {{ success }}
    </p>

    <div v-if="loading" class="py-12 text-center text-gray-500">
      {{ t('common.loading') }}
    </div>
    <p v-else-if="slides.length === 0" class="text-gray-500">
      {{ t('admin.slides.empty') }}
    </p>
    <ul v-else class="space-y-4">
      <li
        v-for="slide in slides"
        :key="slide.id"
        class="flex flex-wrap items-center gap-4 rounded-lg border border-gray-200 bg-white p-4"
      >
        <img
          :src="slide.url"
          :alt="slide.alt || 'Hero'"
          class="h-20 w-32 rounded object-cover"
        >
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-medium text-ink">
            {{ slide.alt || t('admin.slides.noAlt') }}
          </p>
          <p class="text-xs text-gray-500">
            {{ slide.active ? t('admin.slides.active') : t('admin.slides.inactive') }}
            · #{{ slide.sortOrder }}
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <button type="button" class="btn-secondary px-3 py-2 text-xs" @click="move(slide, -1)">
            ↑
          </button>
          <button type="button" class="btn-secondary px-3 py-2 text-xs" @click="move(slide, 1)">
            ↓
          </button>
          <button type="button" class="btn-secondary px-3 py-2 text-xs" @click="toggleActive(slide)">
            {{ slide.active ? t('admin.slides.deactivate') : t('admin.slides.activate') }}
          </button>
          <button
            type="button"
            class="rounded-md border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50"
            :disabled="deleting || confirmOpen"
            @click="askRemove(slide)"
          >
            {{ t('admin.slides.delete') }}
          </button>
        </div>
      </li>
    </ul>

    <ConfirmDialog
      v-model:open="confirmOpen"
      :title="t('admin.slides.confirmDeleteTitle')"
      :description="t('admin.slides.confirmDelete')"
      :confirm-label="t('admin.slides.delete')"
      :cancel-label="t('admin.slides.confirmDeleteCancel')"
      :busy="deleting"
      :busy-label="t('admin.slides.deleting')"
      @confirm="confirmRemove"
      @cancel="cancelRemove"
    />
  </div>
</template>
