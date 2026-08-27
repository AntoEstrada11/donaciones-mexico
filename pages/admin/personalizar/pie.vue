<script setup lang="ts">
import type { SiteSettings } from '~/types'
import { FIELD_LIMITS } from '~/utils/fieldLimits'

definePageMeta({ middleware: 'admin' })

const { t } = useI18n()
const { adminHeaders } = useAuth()

const loading = ref(true)
const saving = ref(false)
const confirmOpen = ref(false)
const error = ref('')
const success = ref('')

const form = reactive({
  contactPhone: '',
  contactEmail: '',
  speiBank: '',
  speiBeneficiary: '',
  speiClabe: '',
  speiConcept: '',
})

async function load() {
  loading.value = true
  error.value = ''
  try {
    const data = await $fetch<SiteSettings>('/api/admin/site-settings', {
      headers: adminHeaders(),
    })
    form.contactPhone = data.contactPhone
    form.contactEmail = data.contactEmail
    form.speiBank = data.speiBank
    form.speiBeneficiary = data.speiBeneficiary
    form.speiClabe = data.speiClabe
    form.speiConcept = data.speiConcept
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

function save() {
  success.value = ''
  error.value = ''
  confirmOpen.value = true
}

async function persist() {
  saving.value = true
  error.value = ''
  success.value = ''
  try {
    const updated = await $fetch<SiteSettings>('/api/admin/site-settings', {
      method: 'PATCH',
      headers: adminHeaders(),
      body: { ...form },
    })
    form.contactPhone = updated.contactPhone
    form.contactEmail = updated.contactEmail
    form.speiBank = updated.speiBank
    form.speiBeneficiary = updated.speiBeneficiary
    form.speiClabe = updated.speiClabe
    form.speiConcept = updated.speiConcept
    success.value = t('admin.footer.saved')
    await refreshNuxtData('site-settings')
    confirmOpen.value = false
  }
  catch (e: unknown) {
    const msg = (e as { data?: { statusMessage?: string } })?.data?.statusMessage
    error.value = msg || t('admin.footer.saveError')
    confirmOpen.value = false
  }
  finally {
    saving.value = false
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
      {{ t('admin.footer.title') }}
    </h2>
    <p class="mb-6 text-sm text-gray-600">
      {{ t('admin.footer.subtitle') }}
    </p>

    <div v-if="loading" class="py-12 text-center text-gray-500">
      {{ t('common.loading') }}
    </div>

    <form
      v-else
      class="max-w-xl space-y-8 rounded-lg border border-gray-200 bg-white p-5"
      @submit.prevent="save"
    >
      <section class="space-y-4">
        <h3 class="font-semibold text-brand">
          {{ t('admin.footer.contactSection') }}
        </h3>
        <div>
          <label for="contact-phone" class="mb-1 block text-sm font-medium text-ink">
            {{ t('admin.footer.phone') }}
          </label>
          <input
            id="contact-phone"
            v-model="form.contactPhone"
            type="text"
            :maxlength="FIELD_LIMITS.site.contactPhone.max"
            class="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            @input="form.contactPhone = sanitizeSitePhoneInput(($event.target as HTMLInputElement).value)"
          >
        </div>
        <div>
          <label for="contact-email" class="mb-1 block text-sm font-medium text-ink">
            {{ t('admin.footer.email') }}
          </label>
          <input
            id="contact-email"
            v-model="form.contactEmail"
            type="email"
            :maxlength="FIELD_LIMITS.site.contactEmail.max"
            class="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            @input="form.contactEmail = sanitizeEmailInput(($event.target as HTMLInputElement).value)"
          >
        </div>
      </section>

      <section class="space-y-4">
        <h3 class="font-semibold text-brand">
          {{ t('admin.footer.speiSection') }}
        </h3>
        <div>
          <label for="spei-bank" class="mb-1 block text-sm font-medium text-ink">
            {{ t('admin.footer.bank') }}
          </label>
          <input
            id="spei-bank"
            v-model="form.speiBank"
            type="text"
            :maxlength="FIELD_LIMITS.site.speiBank.max"
            class="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            @input="form.speiBank = sanitizeSpeiBankInput(($event.target as HTMLInputElement).value)"
          >
        </div>
        <div>
          <label for="spei-beneficiary" class="mb-1 block text-sm font-medium text-ink">
            {{ t('admin.footer.beneficiary') }}
          </label>
          <input
            id="spei-beneficiary"
            v-model="form.speiBeneficiary"
            type="text"
            :maxlength="FIELD_LIMITS.site.speiBeneficiary.max"
            class="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            @input="form.speiBeneficiary = sanitizeSpeiBeneficiaryInput(($event.target as HTMLInputElement).value)"
          >
        </div>
        <div>
          <label for="spei-clabe" class="mb-1 block text-sm font-medium text-ink">
            {{ t('admin.footer.clabe') }}
          </label>
          <input
            id="spei-clabe"
            v-model="form.speiClabe"
            type="text"
            inputmode="numeric"
            :maxlength="FIELD_LIMITS.site.speiClabe.length"
            class="w-full rounded-lg border border-gray-300 px-4 py-2 font-mono text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            @input="form.speiClabe = sanitizeClabeInput(($event.target as HTMLInputElement).value)"
          >
          <p class="mt-1 text-xs text-gray-500">
            {{ t('admin.footer.clabeHint') }}
          </p>
        </div>
        <div>
          <label for="spei-concept" class="mb-1 block text-sm font-medium text-ink">
            {{ t('admin.footer.concept') }}
          </label>
          <input
            id="spei-concept"
            v-model="form.speiConcept"
            type="text"
            :maxlength="FIELD_LIMITS.site.speiConcept.max"
            class="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            @input="form.speiConcept = sanitizeSpeiConceptInput(($event.target as HTMLInputElement).value)"
          >
        </div>
      </section>

      <p v-if="error" class="text-sm text-red-600">
        {{ error }}
      </p>
      <p v-if="success" class="text-sm text-green-700">
        {{ success }}
      </p>

      <button type="submit" class="btn-primary" :disabled="saving || confirmOpen">
        {{ saving ? t('admin.footer.saving') : t('admin.footer.save') }}
      </button>
    </form>

    <ConfirmDialog
      v-model:open="confirmOpen"
      :title="t('admin.footer.confirmTitle')"
      :description="t('admin.footer.confirmSave')"
      :confirm-label="t('admin.footer.save')"
      :cancel-label="t('admin.footer.confirmCancel')"
      :busy="saving"
      :busy-label="t('admin.footer.saving')"
      @confirm="persist"
    />
  </div>
</template>
