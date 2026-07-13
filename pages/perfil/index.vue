<script setup lang="ts">
import type { DonorProfile } from '~/types'

const { t } = useI18n()
const { isLoggedIn, fetchProfile, updateProfile, user } = useAuth()

const profile = ref<DonorProfile | null>(null)
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const success = ref(false)

const form = reactive({
  name: '',
  phone: '',
  street: '',
  city: '',
  state: '',
  zip: '',
  rfc: '',
})

onMounted(async () => {
  if (!isLoggedIn.value) {
    await navigateTo('/login?redirect=/perfil')
    return
  }

  try {
    profile.value = await fetchProfile()
    form.name = profile.value.name
    form.phone = profile.value.phone || ''
    form.street = profile.value.street || ''
    form.city = profile.value.city || ''
    form.state = profile.value.state || ''
    form.zip = profile.value.zip || ''
    form.rfc = profile.value.rfc || ''
  }
  catch {
    error.value = t('common.error')
  }
  finally {
    loading.value = false
  }
})

async function onSubmit() {
  saving.value = true
  error.value = ''
  success.value = false

  try {
    profile.value = await updateProfile({ ...form })
    success.value = true
  }
  catch (e: unknown) {
    const msg = (e as { data?: { statusMessage?: string } })?.data?.statusMessage
    error.value = msg || t('profile.saveError')
  }
  finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-2xl px-4 py-10 md:px-6">
    <header class="mb-8">
      <h1 class="section-title">
        {{ t('profile.title') }}
      </h1>
      <p class="mt-2 text-gray-600">
        {{ t('profile.subtitle') }}
      </p>
    </header>

    <div v-if="loading" class="py-12 text-center text-gray-500">
      {{ t('common.loading') }}
    </div>

    <form v-else class="card space-y-4" @submit.prevent="onSubmit">
      <div v-if="profile" class="rounded-md bg-brand-light/60 px-4 py-3 text-sm text-gray-700">
        <p>
          <span class="font-medium text-ink">{{ t('profile.email') }}:</span>
          {{ profile.email }}
        </p>
        <p class="mt-1">
          <span class="font-medium text-ink">Odoo partner:</span>
          #{{ profile.odooPartnerId }}
          <span class="text-gray-500">({{ profile.source }})</span>
        </p>
        <p v-if="user" class="mt-1 text-xs text-gray-500">
          {{ t('profile.noOdooLogin') }}
        </p>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <div class="sm:col-span-2">
          <label class="mb-1 block text-sm font-medium text-ink">
            {{ t('profile.email') }}
          </label>
          <input
            :value="profile?.email"
            type="email"
            disabled
            class="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500"
          >
        </div>

        <div class="sm:col-span-2">
          <label for="name" class="mb-1 block text-sm font-medium text-ink">
            {{ t('profile.name') }}
          </label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            class="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            required
          >
        </div>

        <div>
          <label for="phone" class="mb-1 block text-sm font-medium text-ink">
            {{ t('profile.phone') }}
          </label>
          <input
            id="phone"
            v-model="form.phone"
            type="tel"
            class="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          >
        </div>

        <div>
          <label for="rfc" class="mb-1 block text-sm font-medium text-ink">
            {{ t('profile.rfc') }}
          </label>
          <input
            id="rfc"
            v-model="form.rfc"
            type="text"
            class="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          >
        </div>

        <div class="sm:col-span-2">
          <label for="street" class="mb-1 block text-sm font-medium text-ink">
            {{ t('profile.street') }}
          </label>
          <input
            id="street"
            v-model="form.street"
            type="text"
            class="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          >
        </div>

        <div>
          <label for="city" class="mb-1 block text-sm font-medium text-ink">
            {{ t('profile.city') }}
          </label>
          <input
            id="city"
            v-model="form.city"
            type="text"
            class="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          >
        </div>

        <div>
          <label for="state" class="mb-1 block text-sm font-medium text-ink">
            {{ t('profile.state') }}
          </label>
          <input
            id="state"
            v-model="form.state"
            type="text"
            class="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          >
        </div>

        <div>
          <label for="zip" class="mb-1 block text-sm font-medium text-ink">
            {{ t('profile.zip') }}
          </label>
          <input
            id="zip"
            v-model="form.zip"
            type="text"
            class="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          >
        </div>
      </div>

      <p v-if="error" class="text-sm text-red-600">
        {{ error }}
      </p>
      <p v-if="success" class="text-sm text-green-700">
        {{ t('profile.saved') }}
      </p>

      <button
        type="submit"
        class="btn-primary"
        :class="{ 'cursor-not-allowed opacity-60': saving }"
        :disabled="saving"
      >
        {{ saving ? t('profile.saving') : t('profile.save') }}
      </button>
    </form>
  </div>
</template>
