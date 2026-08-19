<script setup lang="ts">
import type { ConsentType, DonorProfile } from '~/types'

const { t } = useI18n()
const {
  isLoggedIn,
  fetchProfile,
  updateProfile,
  downloadMyData,
  fetchConsents,
  setConsent,
  deleteAccount,
} = useAuth()

const profile = ref<DonorProfile | null>(null)
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const success = ref(false)

const form = reactive({
  name: '',
  phone: '',
  wantsReceipt: false,
  street: '',
  city: '',
  state: '',
  zip: '',
  rfc: '',
})

const marketing = ref(false)
const marketingSaving = ref(false)
const marketingMessage = ref('')
const marketingError = ref('')

const exportError = ref('')
const showDeleteConfirm = ref(false)
const deletePassword = ref('')
const deleting = ref(false)
const deleteError = ref('')

onMounted(async () => {
  if (!isLoggedIn.value) {
    await navigateTo('/login?redirect=/perfil')
    return
  }

  try {
    profile.value = await fetchProfile()
    form.name = profile.value.name
    form.phone = profile.value.phone || ''
    form.wantsReceipt = profile.value.wantsReceipt
    form.street = profile.value.street || ''
    form.city = profile.value.city || ''
    form.state = profile.value.state || ''
    form.zip = profile.value.zip || ''
    form.rfc = profile.value.rfc || ''

    const consents = await fetchConsents()
    marketing.value = consents.marketing === true
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
  // Los datos fiscales solo se validan si el donante pidió recibo deducible.
  if (form.wantsReceipt) {
    if (!isValidZip(form.zip)) {
      return t('validation.zip')
    }
    if (!isValidRfc(form.rfc)) {
      return t('validation.rfc')
    }
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
    form.wantsReceipt = profile.value.wantsReceipt
    form.street = profile.value.street || ''
    form.city = profile.value.city || ''
    form.state = profile.value.state || ''
    form.zip = profile.value.zip || ''
    form.rfc = profile.value.rfc || ''
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

async function onToggleMarketing() {
  marketingSaving.value = true
  marketingMessage.value = ''
  marketingError.value = ''

  const next = !marketing.value

  try {
    const consents = await setConsent('marketing' as ConsentType, next)
    marketing.value = consents.marketing === true
    marketingMessage.value = t('legal.marketingSaved')
  }
  catch {
    marketingError.value = t('legal.marketingError')
  }
  finally {
    marketingSaving.value = false
  }
}

async function onExport() {
  exportError.value = ''
  try {
    await downloadMyData()
  }
  catch {
    exportError.value = t('legal.exportError')
  }
}

async function onDelete() {
  if (!deletePassword.value) {
    deleteError.value = t('legal.deleteError')
    return
  }

  deleting.value = true
  deleteError.value = ''

  try {
    await deleteAccount(deletePassword.value)
    await navigateTo('/')
  }
  catch (e: unknown) {
    const msg = (e as { data?: { statusMessage?: string } })?.data?.statusMessage
    deleteError.value = msg || t('legal.deleteError')
  }
  finally {
    deleting.value = false
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

    <template v-else>
      <form class="card space-y-4" @submit.prevent="onSubmit">
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

          <div class="sm:col-span-2">
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
        </div>

        <!-- Minimización: los datos fiscales solo se piden si hacen falta. -->
        <div class="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <label class="flex cursor-pointer items-start gap-3 text-sm font-medium text-ink">
            <input
              v-model="form.wantsReceipt"
              type="checkbox"
              class="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-brand focus:ring-2 focus:ring-brand/30"
            >
            <span>
              {{ t('legal.fiscalToggle') }}
              <span class="mt-1 block text-xs font-normal text-gray-500">
                {{ t('legal.fiscalNote') }}
              </span>
            </span>
          </label>

          <div v-if="form.wantsReceipt" class="mt-4 grid gap-4 sm:grid-cols-2">
            <div class="sm:col-span-2">
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

      <section class="card mt-8 space-y-6">
        <header>
          <h2 class="text-lg font-bold text-ink">
            {{ t('legal.privacySection') }}
          </h2>
          <p class="mt-1 text-sm text-gray-600">
            {{ t('legal.privacySectionDesc') }}
          </p>
        </header>

        <div class="border-t border-gray-100 pt-4">
          <h3 class="font-semibold text-ink">
            {{ t('legal.marketingTitle') }}
          </h3>
          <p class="mt-1 text-sm text-gray-600">
            {{ t('legal.marketingLabel') }}
          </p>
          <div class="mt-3 flex flex-wrap items-center gap-3">
            <span
              class="rounded-full px-3 py-1 text-xs font-medium"
              :class="marketing ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'"
            >
              {{ marketing ? t('legal.marketingOn') : t('legal.marketingOff') }}
            </span>
            <button
              type="button"
              class="btn-secondary px-4 py-2 text-xs"
              :class="{ 'cursor-not-allowed opacity-60': marketingSaving }"
              :disabled="marketingSaving"
              @click="onToggleMarketing"
            >
              {{ marketing ? t('admin.slides.deactivate') : t('admin.slides.activate') }}
            </button>
          </div>
          <p v-if="marketingMessage" class="mt-2 text-sm text-green-700">
            {{ marketingMessage }}
          </p>
          <p v-if="marketingError" class="mt-2 text-sm text-red-600">
            {{ marketingError }}
          </p>
        </div>

        <div class="border-t border-gray-100 pt-4">
          <h3 class="font-semibold text-ink">
            {{ t('legal.exportTitle') }}
          </h3>
          <p class="mt-1 text-sm text-gray-600">
            {{ t('legal.exportDesc') }}
          </p>
          <button type="button" class="btn-secondary mt-3 px-4 py-2 text-xs" @click="onExport">
            {{ t('legal.exportCta') }}
          </button>
          <p v-if="exportError" class="mt-2 text-sm text-red-600">
            {{ exportError }}
          </p>
        </div>

        <div class="border-t border-gray-100 pt-4">
          <h3 class="font-semibold text-red-700">
            {{ t('legal.deleteTitle') }}
          </h3>
          <p class="mt-1 text-sm text-gray-600">
            {{ t('legal.deleteDesc') }}
          </p>

          <button
            v-if="!showDeleteConfirm"
            type="button"
            class="mt-3 rounded-md border border-red-300 px-4 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50"
            @click="showDeleteConfirm = true"
          >
            {{ t('legal.deleteCta') }}
          </button>

          <div v-else class="mt-3 rounded-lg border border-red-200 bg-red-50 p-4">
            <h4 class="font-semibold text-red-800">
              {{ t('legal.deleteConfirmTitle') }}
            </h4>
            <p class="mt-1 text-sm text-red-700">
              {{ t('legal.deleteConfirmBody') }}
            </p>
            <label for="delete-password" class="mb-1 mt-3 block text-sm font-medium text-ink">
              {{ t('legal.deletePassword') }}
            </label>
            <input
              id="delete-password"
              v-model="deletePassword"
              type="password"
              autocomplete="current-password"
              :maxlength="FIELD_LIMITS.password.max"
              class="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
            >
            <p v-if="deleteError" class="mt-2 text-sm text-red-700">
              {{ deleteError }}
            </p>
            <div class="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                class="rounded-md bg-red-700 px-4 py-2 text-xs font-semibold text-white transition hover:bg-red-800"
                :class="{ 'cursor-not-allowed opacity-60': deleting }"
                :disabled="deleting"
                @click="onDelete"
              >
                {{ deleting ? t('legal.deleting') : t('legal.deleteConfirmCta') }}
              </button>
              <button
                type="button"
                class="rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
                @click="showDeleteConfirm = false; deletePassword = ''; deleteError = ''"
              >
                {{ t('legal.deleteCancel') }}
              </button>
            </div>
          </div>
        </div>

        <p class="border-t border-gray-100 pt-4 text-xs text-gray-500">
          {{ t('legal.arcoContact', { email: LEGAL.correoArco }) }}
          <NuxtLink to="/privacidad" class="font-medium text-brand hover:underline">
            {{ t('legal.privacyLink') }}
          </NuxtLink>
        </p>
      </section>
    </template>
  </div>
</template>
