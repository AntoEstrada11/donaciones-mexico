<script setup lang="ts">
import type { Campaign, Donation } from '~/types'

const { t } = useI18n()
const { selectedChurch, hydrated, clearChurch } = useDonation()
const { addDonationToHistory } = useAuth()

const router = useRouter()

watch(hydrated, (ready) => {
  if (ready && !selectedChurch.value) {
    router.replace('/iglesias')
  }
}, { immediate: true })

const { data: campaigns, pending: campaignsPending } = await useFetch<Campaign[]>('/api/campaigns')

const selectedCampaignId = ref<string | null>(null)
const amount = ref<number | null>(null)
const customAmount = ref('')
const paymentMethod = ref<'spei' | 'card'>('spei')
const submitting = ref(false)
const success = ref(false)
const submitError = ref('')

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
  amount.value = value
  customAmount.value = ''
}

function onCustomInput() {
  amount.value = null
}

async function submitDonation() {
  if (!canSubmit.value || !selectedChurch.value || !selectedCampaignId.value || !finalAmount.value) return

  submitting.value = true
  submitError.value = ''

  try {
    const donation = await $fetch<Donation>('/api/donations', {
      method: 'POST',
      body: {
        churchId: selectedChurch.value.id,
        campaignId: selectedCampaignId.value,
        amount: finalAmount.value,
        method: paymentMethod.value,
      },
    })

    addDonationToHistory(donation)
    success.value = true
  }
  catch {
    submitError.value = t('donation.submitError')
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
  paymentMethod.value = 'spei'
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

      <!-- Iglesia seleccionada -->
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

      <!-- Tipo de donación -->
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

      <!-- Monto -->
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

      <!-- Método de pago -->
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

      <!-- Resumen -->
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
        {{ submitting ? t('donation.submitting') : t('donation.submit') }}
      </button>

      <p class="mt-4 text-center text-xs text-gray-400">
        {{ t('donation.mockNote') }}
      </p>
    </template>
  </div>
</template>
