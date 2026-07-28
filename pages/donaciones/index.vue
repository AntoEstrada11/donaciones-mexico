<script setup lang="ts">
import type { Campaign, Donation } from '~/types'

const { t } = useI18n()
const {
  selectedChurch,
  draft,
  hydrated,
  clearChurch,
  updateDraft,
  clearDraft,
} = useDonation()
const { isLoggedIn, authReady } = useAuth()
const route = useRoute()
const router = useRouter()

watch(hydrated, (ready) => {
  if (ready && !selectedChurch.value) {
    router.replace('/iglesias')
  }
}, { immediate: true })

const { data: campaigns, pending: campaignsPending } = await useFetch<Campaign[]>('/api/campaigns')

const selectedCampaignId = computed({
  get: () => draft.value.campaignId,
  set: (v: string | null) => updateDraft({ campaignId: v }),
})
const amount = computed({
  get: () => draft.value.amount,
  set: (v: number | null) => updateDraft({ amount: v }),
})
const customAmount = computed({
  get: () => draft.value.customAmount,
  set: (v: string) => updateDraft({ customAmount: v }),
})
const paymentMethod = computed({
  get: () => draft.value.paymentMethod,
  set: (v: 'spei' | 'card') => updateDraft({ paymentMethod: v }),
})

const submitting = ref(false)
const successDonation = ref<Donation | null>(null)
const submitError = ref('')
const confirmingPaid = ref(false)

const presetAmounts = [100, 200, 500, 1000]

const selectedCampaign = computed(() =>
  campaigns.value?.find(c => c.id === selectedCampaignId.value) ?? null,
)

const finalAmount = computed(() => {
  if (customAmount.value.trim()) {
    const parsed = Number(customAmount.value)
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null
  }
  return amount.value
})

const canSubmit = computed(() =>
  selectedChurch.value
  && selectedCampaignId.value
  && finalAmount.value
  && finalAmount.value > 0
  && !submitting.value,
)

function selectPreset(value: number) {
  updateDraft({ amount: value, customAmount: '' })
}

function onCustomInput() {
  updateDraft({ amount: null })
}

function loginRedirect() {
  const path = safeRedirectPath(route.fullPath, '/donaciones')
  rememberAuthRedirect(path)
  return `/login?redirect=${encodeURIComponent(path)}`
}

function registerRedirect() {
  const path = safeRedirectPath(route.fullPath, '/donaciones')
  rememberAuthRedirect(path)
  return `/registro?redirect=${encodeURIComponent(path)}`
}

async function submitDonation() {
  if (!canSubmit.value || !selectedChurch.value || !selectedCampaignId.value || !finalAmount.value) return

  if (authReady.value && !isLoggedIn.value) {
    await navigateTo(loginRedirect())
    return
  }

  submitting.value = true
  submitError.value = ''

  try {
    const donation = await $fetch<Donation>('/api/donations', {
      method: 'POST',
      body: {
        churchId: selectedChurch.value.id,
        churchName: selectedChurch.value.name,
        campaignId: selectedCampaignId.value,
        amount: finalAmount.value,
        method: paymentMethod.value,
      },
    })

    clearDraft()
    successDonation.value = donation
  }
  catch (e: unknown) {
    const status = (e as { statusCode?: number, status?: number })?.statusCode
      || (e as { status?: number })?.status
    if (status === 401) {
      await navigateTo(loginRedirect())
      return
    }
    const msg = (e as { data?: { statusMessage?: string } })?.data?.statusMessage
      || (e as Error)?.message
    submitError.value = msg || t('donation.submitError')
  }
  finally {
    submitting.value = false
  }
}

async function markAsPaid() {
  if (!successDonation.value) return
  confirmingPaid.value = true
  try {
    successDonation.value = await $fetch<Donation>(`/api/donations/${successDonation.value.id}`, {
      method: 'PATCH',
      body: { status: 'paid' },
    })
  }
  catch (e: unknown) {
    submitError.value = (e as { data?: { statusMessage?: string } })?.data?.statusMessage
      || t('donation.submitError')
  }
  finally {
    confirmingPaid.value = false
  }
}

function startNewDonation() {
  successDonation.value = null
  clearDraft()
  submitError.value = ''
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

    <template v-else-if="successDonation">
      <div class="card text-center">
        <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-600">
          ✓
        </div>
        <h1 class="section-title mb-2">
          {{ t('donation.successTitle') }}
        </h1>
        <p class="mb-6 text-gray-600">
          {{ successDonation.status === 'paid' ? t('donation.successPaid') : t('donation.successDesc') }}
        </p>

        <div
          v-if="successDonation.method === 'spei' && successDonation.status === 'pending'"
          class="mb-6 rounded-lg border border-brand/20 bg-brand-light/50 p-4 text-left text-sm"
        >
          <h2 class="mb-3 font-semibold text-brand">
            {{ t('donation.speiInstructionsTitle') }}
          </h2>
          <dl class="space-y-2">
            <div class="flex justify-between gap-4">
              <dt class="text-gray-600">{{ t('donation.speiBank') }}</dt>
              <dd class="text-right font-medium text-ink">{{ t('footer.bank') }}</dd>
            </div>
            <div class="flex justify-between gap-4">
              <dt class="text-gray-600">CLABE</dt>
              <dd class="font-mono font-medium text-ink">127180001112050753</dd>
            </div>
            <div class="flex justify-between gap-4">
              <dt class="text-gray-600">{{ t('donation.speiConcept') }}</dt>
              <dd class="font-mono font-bold text-brand">{{ successDonation.paymentReference }}</dd>
            </div>
            <div class="flex justify-between gap-4">
              <dt class="text-gray-600">{{ t('donation.summaryAmount') }}</dt>
              <dd class="font-bold text-ink">
                ${{ successDonation.amount.toLocaleString('es-MX') }} MXN
              </dd>
            </div>
          </dl>
          <p class="mt-3 text-xs text-gray-500">
            {{ t('donation.speiHint') }}
          </p>
          <button
            type="button"
            class="btn-secondary mt-4 w-full"
            :disabled="confirmingPaid"
            @click="markAsPaid"
          >
            {{ confirmingPaid ? t('donation.confirmingPaid') : t('donation.confirmTransfer') }}
          </button>
        </div>

        <div
          v-else-if="successDonation.method === 'card' && successDonation.status === 'pending'"
          class="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-left text-sm text-amber-900"
        >
          <p>{{ t('donation.cardPendingNote') }}</p>
          <p class="mt-2 font-mono text-xs">
            {{ t('donation.reference') }}: {{ successDonation.paymentReference }}
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

      <div
        v-if="authReady && !isLoggedIn"
        class="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
      >
        <p>{{ t('donation.loginRequired') }}</p>
        <div class="mt-2 flex flex-wrap gap-3">
          <NuxtLink :to="loginRedirect()" class="font-medium text-brand hover:underline">
            {{ t('nav.login') }}
          </NuxtLink>
          <NuxtLink :to="registerRedirect()" class="font-medium text-brand hover:underline">
            {{ t('nav.register') }}
          </NuxtLink>
        </div>
      </div>

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
        </h2>
        <div class="mb-4 flex flex-wrap gap-2">
          <button
            v-for="preset in presetAmounts"
            :key="preset"
            type="button"
            class="rounded-md border px-4 py-2 text-sm font-medium transition"
            :class="amount === preset && !customAmount
              ? 'border-brand bg-brand text-white'
              : 'border-gray-300 text-ink hover:border-brand'"
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
            v-model="customAmount"
            type="number"
            min="1"
            step="1"
            placeholder="0.00"
            class="w-full rounded-lg border border-gray-300 py-3 pl-7 pr-4 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            @input="onCustomInput"
          >
        </div>
      </section>

      <section class="mb-8">
        <h2 class="mb-3 font-semibold text-ink">
          {{ t('donation.methodLabel') }}
        </h2>
        <div class="grid gap-3 sm:grid-cols-2">
          <button
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
          </button>
          <button
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
        {{ submitting ? t('donation.submitting') : (isLoggedIn ? t('donation.submit') : t('donation.submitLogin')) }}
      </button>

      <p class="mt-4 text-center text-xs text-gray-400">
        {{ t('donation.mockNote') }}
      </p>
    </template>
  </div>
</template>
