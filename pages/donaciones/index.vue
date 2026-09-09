<script setup lang="ts">
import type { Campaign, DonationCreateResponse, DonationMethod, DonorProfile, PaymentMethodsPublic } from '~/types'
import { CFDI_USES, TAX_REGIMES, isValidCfdiUse, isValidTaxRegime } from '~/utils/cfdiCatalog'

definePageMeta({ middleware: 'auth' })

const { t } = useI18n()
const { selectedChurch, hydrated, clearChurch } = useDonation()
const { optionalAuthHeaders, fetchProfile } = useAuth()

const router = useRouter()

watch(hydrated, (ready) => {
  if (ready && !selectedChurch.value) {
    router.replace('/iglesias')
  }
}, { immediate: true })

onMounted(async () => {
  try {
    const me = await fetchProfile()
    profile.value = me
    wantsReceipt.value = me.wantsReceipt
    fiscalName.value = me.fiscalName || me.name || ''
    rfc.value = me.rfc || ''
    zip.value = me.zip || ''
    taxRegime.value = me.taxRegime || ''
    cfdiUse.value = me.cfdiUse || 'D04'
  }
  catch {
    /* sesión requerida por middleware */
  }
})

const { data: campaigns, pending: campaignsPending } = await useFetch<Campaign[]>('/api/campaigns')
const { data: methods } = await useFetch<PaymentMethodsPublic>('/api/payments/methods')

const selectedCampaignId = ref<string | null>(null)
const amount = ref<number | null>(null)
const customAmount = ref('')
const paymentMethod = ref<DonationMethod>('spei')
const consent = ref(false)
const wantsReceipt = ref(false)
const fiscalName = ref('')
const rfc = ref('')
const zip = ref('')
const taxRegime = ref('')
const cfdiUse = ref('D04')
const profile = ref<DonorProfile | null>(null)
const submitting = ref(false)
const success = ref(false)
const submitError = ref('')

const presetAmounts = [100, 200, 500, 1000]
const amountMin = FIELD_LIMITS.amount.min
const amountMax = FIELD_LIMITS.amount.max

const availableMethods = computed(() => {
  const m = methods.value
  if (!m) return [] as DonationMethod[]
  const list: DonationMethod[] = []
  if (m.spei) list.push('spei')
  if (m.card) list.push('card')
  if (m.paypal) list.push('paypal')
  return list
})

watch(availableMethods, (list) => {
  if (list.length && !list.includes(paymentMethod.value)) {
    paymentMethod.value = list[0]
  }
}, { immediate: true })

const selectedCampaign = computed(() =>
  campaigns.value?.find(c => c.id === selectedCampaignId.value) ?? null,
)

const finalAmount = computed(() => {
  if (customAmount.value.trim()) {
    const parsed = parseAmount(customAmount.value)
    return parsed !== null && isValidAmount(parsed) ? parsed : null
  }
  return amount.value !== null && isValidAmount(amount.value) ? amount.value : null
})

const selectedPreset = computed(() => {
  const value = finalAmount.value
  if (value === null) return null
  return presetAmounts.includes(value) ? value : null
})

const amountHint = computed(() =>
  t('donation.amountRange', {
    min: amountMin.toLocaleString('es-MX'),
    max: formatAmountMaxLabel(),
  }),
)

const invoiceComplete = computed(() => {
  if (!wantsReceipt.value) return true
  return isValidName(fiscalName.value)
    && isValidRfc(rfc.value)
    && isValidZip(zip.value)
    && isValidTaxRegime(taxRegime.value)
    && isValidCfdiUse(cfdiUse.value)
})

const canSubmit = computed(() =>
  selectedChurch.value
  && selectedCampaignId.value
  && finalAmount.value
  && consent.value
  && availableMethods.value.includes(paymentMethod.value)
  && invoiceComplete.value
  && !submitting.value,
)

const umaWarning = computed(() => {
  const status = profile.value?.complianceStatus
  if (status === 'sat_report') return t('uma.satDonor')
  if (status === 'pld_pending') return t('uma.pldDonor')
  return ''
})

function selectPreset(value: number) {
  amount.value = value
  customAmount.value = String(value)
  submitError.value = ''
}

function onCustomInput(event: Event) {
  const input = event.target as HTMLInputElement
  const cleaned = sanitizeAmountInput(input.value)
  customAmount.value = cleaned
  input.value = cleaned
  amount.value = null
  submitError.value = ''
}

function blockNonAmountKeys(event: KeyboardEvent) {
  if (event.ctrlKey || event.metaKey || event.altKey) return
  const allowed = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'Home', 'End']
  if (allowed.includes(event.key)) return
  if (/^\d$/.test(event.key)) return
  if (event.key === '.' && !customAmount.value.includes('.')) return
  event.preventDefault()
}

async function submitDonation() {
  if (!selectedChurch.value || !selectedCampaignId.value) return

  if (customAmount.value.trim()) {
    const parsed = parseAmount(customAmount.value)
    if (parsed === null || !isValidAmount(parsed)) {
      submitError.value = amountHint.value
      return
    }
  }
  else if (!finalAmount.value) {
    submitError.value = t('donation.amountRequired')
    return
  }

  if (!consent.value) {
    submitError.value = t('legal.consentRequired')
    return
  }

  if (wantsReceipt.value && !invoiceComplete.value) {
    submitError.value = t('donation.invoiceRequired')
    return
  }

  if (!canSubmit.value || !finalAmount.value) return

  submitting.value = true
  submitError.value = ''

  try {
    const created = await $fetch<DonationCreateResponse>('/api/donations', {
      method: 'POST',
      headers: optionalAuthHeaders(),
      body: {
        churchId: selectedChurch.value.id,
        campaignId: selectedCampaignId.value,
        amount: finalAmount.value,
        method: paymentMethod.value,
        consent: consent.value,
        wantsReceipt: wantsReceipt.value,
        fiscalName: fiscalName.value,
        rfc: rfc.value,
        zip: zip.value,
        taxRegime: taxRegime.value,
        cfdiUse: cfdiUse.value,
      },
    })

    if (created.uma) {
      profile.value = {
        ...(profile.value as DonorProfile),
        complianceStatus: created.uma.status,
      }
    }

    if (paymentMethod.value === 'spei') {
      success.value = true
      return
    }

    const checkout = await $fetch<{ redirectUrl: string }>('/api/payments/checkout', {
      method: 'POST',
      headers: optionalAuthHeaders(),
      body: { donationId: created.donation.id },
    })

    if (import.meta.client && checkout.redirectUrl) {
      window.location.href = checkout.redirectUrl
      return
    }

    submitError.value = t('donation.checkoutError')
  }
  catch (e: unknown) {
    const msg = (e as { data?: { statusMessage?: string } })?.data?.statusMessage
    submitError.value = msg || t('donation.submitError')
  }
  finally {
    submitting.value = false
  }
}

function startNewDonation() {
  success.value = false
  selectedCampaignId.value = null
  amount.value = null
  customAmount.value = ''
  paymentMethod.value = availableMethods.value[0] || 'spei'
  consent.value = false
}
</script>

<template>
  <div class="mx-auto max-w-2xl px-4 py-10 md:px-6">
    <NuxtLink to="/iglesias" class="mb-6 inline-flex items-center gap-1 text-sm text-brand hover:underline">
      ← {{ t('common.back') }}
    </NuxtLink>

    <div v-if="!hydrated || !selectedChurch" class="py-12 text-center text-gray-500">
      {{ t('common.loading') }}
    </div>

    <template v-else-if="success">
      <div class="card text-center">
        <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-600">
          ✓
        </div>
        <h1 class="section-title mb-2">
          {{ t('donation.successTitle') }}
        </h1>
        <p class="mb-6 text-gray-600">
          {{ t('donation.successDesc') }}
        </p>
        <div class="mb-6 text-left">
          <p class="mb-3 text-center text-sm text-ink">
            {{ t('spei.afterDonate') }}
          </p>
          <SpeiBankDetails />
          <p class="mt-3 text-center">
            <NuxtLink to="/spei" class="text-sm font-medium text-brand hover:underline">
              {{ t('home.speiCta') }}
            </NuxtLink>
          </p>
        </div>
        <div class="flex flex-wrap justify-center gap-3">
          <NuxtLink to="/historial" class="btn-primary">
            {{ t('donation.viewHistory') }}
          </NuxtLink>
          <button type="button" class="btn-secondary" @click="startNewDonation">
            {{ t('donation.newDonation') }}
          </button>
        </div>
      </div>
    </template>

    <template v-else>
      <header class="mb-8">
        <h1 class="section-title">
          {{ t('donation.title') }}
        </h1>
        <p class="mt-2 text-gray-600">
          {{ t('donation.subtitle') }}
        </p>
      </header>

      <section class="card mb-6">
        <p class="mb-1 text-xs font-semibold uppercase tracking-wider text-brand">
          {{ t('donation.selectedChurch') }}
        </p>
        <h2 class="font-semibold text-ink">
          {{ selectedChurch.name }}
        </h2>
        <p class="text-sm text-gray-500">
          {{ selectedChurch.address }}
        </p>
        <button
          type="button"
          class="mt-3 text-sm text-brand hover:underline"
          @click="clearChurch(); navigateTo('/iglesias')"
        >
          {{ t('donation.changeChurch') }}
        </button>
      </section>

      <section class="mb-6">
        <h2 class="mb-3 font-semibold text-ink">
          {{ t('donation.campaignLabel') }}
        </h2>

        <div v-if="campaignsPending" class="text-sm text-gray-500">
          {{ t('common.loading') }}
        </div>

        <div v-else class="grid gap-3 sm:grid-cols-2">
          <button
            v-for="campaign in campaigns"
            :key="campaign.id"
            type="button"
            class="card text-left transition"
            :class="selectedCampaignId === campaign.id
              ? 'border-brand ring-2 ring-brand/20'
              : 'hover:border-brand/40'"
            @click="selectedCampaignId = campaign.id"
          >
            <h3 class="font-semibold text-brand">
              {{ campaign.name }}
            </h3>
            <p class="mt-1 text-sm text-gray-600">
              {{ campaign.description }}
            </p>
          </button>
        </div>
      </section>

      <section class="mb-6">
        <h2 class="mb-3 font-semibold text-ink">
          {{ t('donation.amountLabel') }}
          <span v-if="finalAmount" class="ml-2 font-bold text-brand">
            ${{ finalAmount.toLocaleString('es-MX') }} MXN
          </span>
        </h2>
        <div class="mb-4 flex flex-wrap gap-2">
          <button
            v-for="preset in presetAmounts"
            :key="preset"
            type="button"
            class="rounded-md border px-4 py-2 text-sm font-medium transition"
            :class="selectedPreset === preset
              ? 'border-brand bg-brand text-white ring-2 ring-brand/20'
              : 'border-gray-300 text-ink hover:border-brand'"
            :aria-pressed="selectedPreset === preset"
            @click="selectPreset(preset)"
          >
            ${{ preset.toLocaleString('es-MX') }}
          </button>
        </div>
        <label for="custom-amount" class="mb-1 block text-sm text-gray-600">
          {{ t('donation.customAmount') }}
        </label>
        <div class="relative">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
          <input
            id="custom-amount"
            :value="customAmount"
            type="text"
            inputmode="decimal"
            autocomplete="off"
            :placeholder="t('donation.amountPlaceholder')"
            :aria-describedby="'amount-hint'"
            class="w-full rounded-lg border border-gray-300 py-3 pl-7 pr-4 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            @keydown="blockNonAmountKeys"
            @input="onCustomInput"
          >
        </div>
        <p id="amount-hint" class="mt-1 text-xs text-gray-500">
          {{ amountHint }}
        </p>
      </section>

      <p
        v-if="umaWarning"
        class="mb-6 rounded-md border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-ink"
      >
        {{ umaWarning }}
      </p>

      <section class="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
        <label class="flex cursor-pointer items-start gap-3 text-sm font-medium text-ink">
          <input
            v-model="wantsReceipt"
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
        <div v-if="wantsReceipt" class="mt-4 grid gap-4 sm:grid-cols-2">
          <div class="sm:col-span-2">
            <label class="mb-1 block text-sm font-medium text-ink" for="donate-fiscal-name">{{ t('profile.fiscalName') }}</label>
            <input
              id="donate-fiscal-name"
              :value="fiscalName"
              type="text"
              :maxlength="FIELD_LIMITS.fiscalName.max"
              class="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              @input="fiscalName = sanitizeNameInput(($event.target as HTMLInputElement).value)"
            >
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-ink" for="donate-rfc">{{ t('profile.rfc') }}</label>
            <input
              id="donate-rfc"
              :value="rfc"
              type="text"
              :maxlength="FIELD_LIMITS.rfc.max"
              class="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm uppercase focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              @input="rfc = sanitizeRfcInput(($event.target as HTMLInputElement).value)"
            >
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-ink" for="donate-zip">{{ t('profile.zip') }}</label>
            <input
              id="donate-zip"
              :value="zip"
              type="text"
              inputmode="numeric"
              :maxlength="FIELD_LIMITS.zip.length"
              class="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              @input="zip = sanitizeZipInput(($event.target as HTMLInputElement).value)"
            >
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-ink" for="donate-regime">{{ t('profile.taxRegime') }}</label>
            <select
              id="donate-regime"
              v-model="taxRegime"
              class="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            >
              <option value="">{{ t('profile.select') }}</option>
              <option v-for="item in TAX_REGIMES" :key="item.code" :value="item.code">
                {{ item.code }} — {{ item.label }}
              </option>
            </select>
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-ink" for="donate-cfdi">{{ t('profile.cfdiUse') }}</label>
            <select
              id="donate-cfdi"
              v-model="cfdiUse"
              class="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            >
              <option v-for="item in CFDI_USES" :key="item.code" :value="item.code">
                {{ item.code }} — {{ item.label }}
              </option>
            </select>
          </div>
        </div>
      </section>

      <section class="mb-8">
        <h2 class="mb-3 font-semibold text-ink">
          {{ t('donation.methodLabel') }}
        </h2>
        <p v-if="!availableMethods.length" class="text-sm text-amber-700">
          {{ t('donation.methodUnavailable') }}
        </p>
        <div v-else class="grid gap-3 sm:grid-cols-2">
          <button
            v-if="availableMethods.includes('spei')"
            type="button"
            class="card text-left transition"
            :class="paymentMethod === 'spei'
              ? 'border-brand ring-2 ring-brand/20'
              : 'hover:border-brand/40'"
            @click="paymentMethod = 'spei'"
          >
            <h3 class="font-semibold text-ink">
              SPEI
            </h3>
            <p class="mt-1 text-sm text-gray-600">
              {{ t('donation.methodSpei') }}
            </p>
            <NuxtLink
              to="/spei"
              class="mt-2 inline-block text-xs font-medium text-brand hover:underline"
              @click.stop
            >
              {{ t('home.speiCta') }}
            </NuxtLink>
          </button>
          <button
            v-if="availableMethods.includes('card')"
            type="button"
            class="card text-left transition"
            :class="paymentMethod === 'card'
              ? 'border-brand ring-2 ring-brand/20'
              : 'hover:border-brand/40'"
            @click="paymentMethod = 'card'"
          >
            <h3 class="font-semibold text-ink">
              {{ t('donation.methodCard') }}
            </h3>
            <p class="mt-1 text-sm text-gray-600">
              {{ t('donation.methodCardDesc') }}
            </p>
          </button>
          <button
            v-if="availableMethods.includes('paypal')"
            type="button"
            class="card text-left transition"
            :class="paymentMethod === 'paypal'
              ? 'border-brand ring-2 ring-brand/20'
              : 'hover:border-brand/40'"
            @click="paymentMethod = 'paypal'"
          >
            <h3 class="font-semibold text-ink">
              {{ t('donation.methodPaypal') }}
            </h3>
            <p class="mt-1 text-sm text-gray-600">
              {{ t('donation.methodPaypalDesc') }}
            </p>
          </button>
        </div>
      </section>

      <section v-if="selectedCampaign && finalAmount" class="card mb-6 bg-brand-light/50">
        <h2 class="mb-2 font-semibold text-ink">
          {{ t('donation.summary') }}
        </h2>
        <dl class="space-y-1 text-sm">
          <div class="flex justify-between">
            <dt class="text-gray-600">{{ t('donation.summaryChurch') }}</dt>
            <dd class="font-medium text-ink">{{ selectedChurch.name }}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-gray-600">{{ t('donation.summaryCampaign') }}</dt>
            <dd class="font-medium text-ink">{{ selectedCampaign.name }}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-gray-600">{{ t('donation.summaryAmount') }}</dt>
            <dd class="font-bold text-brand">
              ${{ finalAmount.toLocaleString('es-MX') }} MXN
            </dd>
          </div>
        </dl>
      </section>

      <section class="mb-6 space-y-4">
        <PrivacyNoticeShort />
        <LegalConsent v-model:consent="consent" />
      </section>

      <p v-if="submitError" class="mb-4 text-center text-sm text-red-600">
        {{ submitError }}
      </p>

      <button
        type="button"
        class="btn-primary w-full"
        :class="{ 'cursor-not-allowed opacity-60': !canSubmit }"
        :disabled="!canSubmit"
        @click="submitDonation"
      >
        {{
          submitting
            ? (paymentMethod === 'spei' ? t('donation.submitting') : t('donation.redirecting'))
            : t('donation.submit')
        }}
      </button>

      <p class="mt-4 text-center text-xs text-gray-500">
        {{ t('donation.secureRedirectNote') }}
      </p>
    </template>
  </div>
</template>
