<script setup lang="ts">
import type { DonorProfile } from '~/types'

const { t } = useI18n()
const { isLoggedIn, fetchProfile, updateProfile } = useAuth()

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

function onNameInput(event: Event) {
  form.name = sanitizeNameInput((event.target as HTMLInputElement).value)
}

function onPhoneInput(event: Event) {
  form.phone = sanitizePhoneInput((event.target as HTMLInputElement).value)
}

function onStreetInput(event: Event) {
  form.street = sanitizeStreetInput((event.target as HTMLInputElement).value)
}

function onCityInput(event: Event) {
  form.city = sanitizeCityInput((event.target as HTMLInputElement).value)
}

function onStateInput(event: Event) {
  form.state = sanitizeStateInput((event.target as HTMLInputElement).value)
}

function onZipInput(event: Event) {
  form.zip = sanitizeZipInput((event.target as HTMLInputElement).value)
}

function onRfcInput(event: Event) {
  form.rfc = sanitizeRfcInput((event.target as HTMLInputElement).value)
}

function validateForm(): string | null {
  if (!isValidName(form.name)) {
    return t('validation.name', { max: FIELD_LIMITS.name.max })
  }
  if (!isValidPhone(form.phone)) {
    return t('validation.phone', {
      min: FIELD_LIMITS.phone.minDigits,
      max: FIELD_LIMITS.phone.maxDigits,
    })
  }
  if (!isValidZip(form.zip)) {
    return t('validation.zip')
  }
  if (!isValidRfc(form.rfc)) {
    return t('validation.rfc')
  }
  return null
}

async function onSubmit() {
  const validationError = validateForm()
  if (validationError) {
    error.value = validationError
    success.value = false
    return
  }

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
            :value="form.name"
            type="text"
            autocomplete="name"
            required
            :maxlength="FIELD_LIMITS.name.max"
            class="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            @input="onNameInput"
          >
        </div>

        <div>
          <label for="phone" class="mb-1 block text-sm font-medium text-ink">
            {{ t('profile.phone') }}
          </label>
          <input
            id="phone"
            :value="form.phone"
            type="tel"
            inputmode="tel"
            autocomplete="tel"
            :maxlength="FIELD_LIMITS.phone.maxDisplay"
            :placeholder="t('register.phonePlaceholder')"
            class="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            @input="onPhoneInput"
          >
          <p class="mt-1 text-xs text-gray-500">
            {{ t('validation.phoneHint', { min: FIELD_LIMITS.phone.minDigits }) }}
          </p>
        </div>

        <div>
          <label for="rfc" class="mb-1 block text-sm font-medium text-ink">
            {{ t('profile.rfc') }}
          </label>
          <input
            id="rfc"
            :value="form.rfc"
            type="text"
            autocomplete="off"
            spellcheck="false"
            :maxlength="FIELD_LIMITS.rfc.max"
            :placeholder="t('profile.rfcPlaceholder')"
            class="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm uppercase focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            @input="onRfcInput"
          >
        </div>

        <div class="sm:col-span-2">
          <label for="street" class="mb-1 block text-sm font-medium text-ink">
            {{ t('profile.street') }}
          </label>
          <input
            id="street"
            :value="form.street"
            type="text"
            autocomplete="street-address"
            :maxlength="FIELD_LIMITS.street.max"
            class="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            @input="onStreetInput"
          >
        </div>

        <div>
          <label for="city" class="mb-1 block text-sm font-medium text-ink">
            {{ t('profile.city') }}
          </label>
          <input
            id="city"
            :value="form.city"
            type="text"
            autocomplete="address-level2"
            :maxlength="FIELD_LIMITS.city.max"
            class="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            @input="onCityInput"
          >
        </div>

        <div>
          <label for="state" class="mb-1 block text-sm font-medium text-ink">
            {{ t('profile.state') }}
          </label>
          <input
            id="state"
            :value="form.state"
            type="text"
            autocomplete="address-level1"
            :maxlength="FIELD_LIMITS.state.max"
            class="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            @input="onStateInput"
          >
        </div>

        <div>
          <label for="zip" class="mb-1 block text-sm font-medium text-ink">
            {{ t('profile.zip') }}
          </label>
          <input
            id="zip"
            :value="form.zip"
            type="text"
            inputmode="numeric"
            autocomplete="postal-code"
            :maxlength="FIELD_LIMITS.zip.length"
            :placeholder="t('profile.zipPlaceholder')"
            class="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            @input="onZipInput"
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
