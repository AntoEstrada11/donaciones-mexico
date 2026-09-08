<script setup lang="ts">
import type { PaymentSettings } from '~/types'

definePageMeta({ middleware: 'admin' })

const { t } = useI18n()
const { adminHeaders } = useAuth()

const loading = ref(true)
const saving = ref(false)
const confirmOpen = ref(false)
const error = ref('')
const success = ref('')

const form = reactive({
  mode: 'test' as PaymentSettings['mode'],
  cardProvider: 'mercadopago' as PaymentSettings['cardProvider'],
  cardEnabled: false,
  paypalEnabled: false,
  speiManualEnabled: true,
})

const credentials = reactive({
  mercadopago: false,
  paypal: false,
})

async function load() {
  loading.value = true
  error.value = ''
  try {
    const data = await $fetch<PaymentSettings>('/api/admin/payment-settings', {
      headers: adminHeaders(),
    })
    form.mode = data.mode
    form.cardProvider = data.cardProvider
    form.cardEnabled = data.cardEnabled
    form.paypalEnabled = data.paypalEnabled
    form.speiManualEnabled = data.speiManualEnabled
    credentials.mercadopago = data.credentials.mercadopago
    credentials.paypal = data.credentials.paypal
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
    const updated = await $fetch<PaymentSettings>('/api/admin/payment-settings', {
      method: 'PATCH',
      headers: adminHeaders(),
      body: { ...form },
    })
    form.mode = updated.mode
    form.cardProvider = updated.cardProvider
    form.cardEnabled = updated.cardEnabled
    form.paypalEnabled = updated.paypalEnabled
    form.speiManualEnabled = updated.speiManualEnabled
    credentials.mercadopago = updated.credentials.mercadopago
    credentials.paypal = updated.credentials.paypal
    success.value = t('admin.payments.saved')
    confirmOpen.value = false
  }
  catch (e: unknown) {
    const msg = (e as { data?: { statusMessage?: string } })?.data?.statusMessage
    error.value = msg || t('admin.payments.saveError')
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
      {{ t('admin.payments.title') }}
    </h2>
    <p class="mb-6 text-sm text-gray-600">
      {{ t('admin.payments.subtitle') }}
    </p>

    <div v-if="loading" class="py-12 text-center text-gray-500">
      {{ t('common.loading') }}
    </div>

    <form
      v-else
      class="max-w-xl space-y-8 rounded-lg border border-gray-200 bg-white p-5"
      @submit.prevent="save"
    >
      <section class="space-y-3">
        <h3 class="font-semibold text-brand">
          {{ t('admin.payments.mode') }}
        </h3>
        <label class="flex items-center gap-2 text-sm">
          <input v-model="form.mode" type="radio" value="test" class="text-brand">
          {{ t('admin.payments.modeTest') }}
        </label>
        <label class="flex items-center gap-2 text-sm">
          <input v-model="form.mode" type="radio" value="live" class="text-brand">
          {{ t('admin.payments.modeLive') }}
        </label>
      </section>

      <section class="space-y-3">
        <h3 class="font-semibold text-brand">
          {{ t('admin.payments.cardProvider') }}
        </h3>
        <label class="flex items-center gap-2 text-sm">
          <input v-model="form.cardProvider" type="radio" value="mercadopago" class="text-brand">
          {{ t('admin.payments.cardProviderMp') }}
        </label>
      </section>

      <section class="space-y-3">
        <h3 class="font-semibold text-brand">
          {{ t('admin.payments.methods') }}
        </h3>
        <label class="flex items-center gap-2 text-sm">
          <input v-model="form.speiManualEnabled" type="checkbox" class="rounded text-brand">
          {{ t('admin.payments.enableSpei') }}
        </label>
        <label class="flex items-center gap-2 text-sm">
          <input
            v-model="form.cardEnabled"
            type="checkbox"
            class="rounded text-brand"
            :disabled="!credentials.mercadopago"
          >
          {{ t('admin.payments.enableCard') }}
        </label>
        <label class="flex items-center gap-2 text-sm">
          <input
            v-model="form.paypalEnabled"
            type="checkbox"
            class="rounded text-brand"
            :disabled="!credentials.paypal"
          >
          {{ t('admin.payments.enablePaypal') }}
        </label>
      </section>

      <section class="space-y-2 rounded-lg bg-gray-50 p-4 text-sm">
        <h3 class="font-semibold text-ink">
          {{ t('admin.payments.credentials') }}
        </h3>
        <p>
          {{ t('admin.payments.credMp') }}:
          <span :class="credentials.mercadopago ? 'text-green-700' : 'text-amber-700'">
            {{ credentials.mercadopago ? t('admin.payments.credOk') : t('admin.payments.credMissing') }}
          </span>
        </p>
        <p>
          {{ t('admin.payments.credPaypal') }}:
          <span :class="credentials.paypal ? 'text-green-700' : 'text-amber-700'">
            {{ credentials.paypal ? t('admin.payments.credOk') : t('admin.payments.credMissing') }}
          </span>
        </p>
        <p class="text-xs text-gray-500">
          {{ t('admin.payments.hintEnv') }}
        </p>
      </section>

      <p v-if="error" class="text-sm text-red-600">
        {{ error }}
      </p>
      <p v-if="success" class="text-sm text-green-700">
        {{ success }}
      </p>

      <button type="submit" class="btn-primary" :disabled="saving || confirmOpen">
        {{ saving ? t('admin.payments.saving') : t('admin.payments.save') }}
      </button>
    </form>

    <ConfirmDialog
      v-model:open="confirmOpen"
      :title="t('admin.payments.confirmTitle')"
      :description="t('admin.payments.confirmSave')"
      :confirm-label="t('admin.payments.save')"
      :cancel-label="t('admin.payments.confirmCancel')"
      :busy="saving"
      :busy-label="t('admin.payments.saving')"
      @confirm="persist"
    />
  </div>
</template>
