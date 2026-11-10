<script setup lang="ts">
import type { DonationMethod, RecurringDonation, RecurringFrequency } from '~/types'

definePageMeta({ middleware: 'donor' })

const { t } = useI18n()
const { selectedChurch, hydrated } = useDonation()
const { requireToken, user } = useAuth()
const router = useRouter()

const { data: campaigns } = await useCampaigns()
const items = ref<RecurringDonation[]>([])
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const success = ref('')

const campaignId = ref('')
const amount = ref(500)
const frequency = ref<RecurringFrequency>('monthly')
const method = ref<DonationMethod>('spei')

watch(hydrated, (ready) => {
  if (ready && !selectedChurch.value) {
    router.replace('/iglesias')
  }
}, { immediate: true })

async function load() {
  loading.value = true
  error.value = ''
  try {
    const data = await $fetch<{ items: RecurringDonation[] }>('/api/recurring', {
      headers: { Authorization: `Bearer ${requireToken()}` },
    })
    items.value = data.items
  }
  catch (e: unknown) {
    const msg = (e as { data?: { statusMessage?: string } })?.data?.statusMessage
    error.value = msg || t('recurring.loadError')
  }
  finally {
    loading.value = false
  }
}

onMounted(load)

async function create() {
  if (!selectedChurch.value || !campaignId.value) {
    error.value = t('recurring.needChurchCampaign')
    return
  }
  if (!user.value?.emailVerified) {
    error.value = t('verifyEmail.needBeforeDonate')
    return
  }
  saving.value = true
  error.value = ''
  success.value = ''
  try {
    const data = await $fetch<{ item: RecurringDonation }>('/api/recurring', {
      method: 'POST',
      headers: { Authorization: `Bearer ${requireToken()}` },
      body: {
        churchId: selectedChurch.value.id,
        campaignId: campaignId.value,
        amount: amount.value,
        frequency: frequency.value,
        method: method.value,
      },
    })
    items.value = [data.item, ...items.value]
    success.value = method.value === 'spei'
      ? t('recurring.createdSpei')
      : t('recurring.createdPendingGateway')
  }
  catch (e: unknown) {
    const msg = (e as { data?: { statusMessage?: string } })?.data?.statusMessage
    error.value = msg || t('recurring.saveError')
  }
  finally {
    saving.value = false
  }
}

async function setStatus(id: string, status: 'active' | 'paused' | 'cancelled') {
  error.value = ''
  try {
    const data = await $fetch<{ item: RecurringDonation }>(`/api/recurring/${id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${requireToken()}` },
      body: { status },
    })
    items.value = items.value.map(row => (row.id === id ? data.item : row))
  }
  catch (e: unknown) {
    const msg = (e as { data?: { statusMessage?: string } })?.data?.statusMessage
    error.value = msg || t('recurring.saveError')
  }
}
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 py-10 md:px-6">
    <h1 class="mb-2 text-2xl font-bold text-ink">
      {{ t('recurring.title') }}
    </h1>
    <p class="mb-6 text-sm text-gray-600">
      {{ t('recurring.subtitle') }}
    </p>

    <p v-if="selectedChurch" class="mb-4 text-sm text-ink">
      {{ t('donation.summaryChurch') }}:
      <strong>{{ selectedChurch.name }}</strong>
      <NuxtLink to="/iglesias" class="ml-2 text-brand hover:underline">
        {{ t('recurring.changeChurch') }}
      </NuxtLink>
    </p>

    <form class="card mb-8 space-y-4" @submit.prevent="create">
      <label class="block text-sm">
        <span class="mb-1 block font-medium">{{ t('donation.campaignLabel') }}</span>
        <select v-model="campaignId" required class="w-full rounded-lg border border-gray-300 px-3 py-2">
          <option value="">
            {{ t('profile.select') }}
          </option>
          <option v-for="c in campaigns || []" :key="c.id" :value="c.id">
            {{ c.name }}
          </option>
        </select>
      </label>
      <label class="block text-sm">
        <span class="mb-1 block font-medium">{{ t('donation.amountLabel') }}</span>
        <input v-model.number="amount" type="number" min="1" required class="w-full rounded-lg border border-gray-300 px-3 py-2">
      </label>
      <label class="block text-sm">
        <span class="mb-1 block font-medium">{{ t('recurring.frequency') }}</span>
        <select v-model="frequency" class="w-full rounded-lg border border-gray-300 px-3 py-2">
          <option value="weekly">
            {{ t('recurring.weekly') }}
          </option>
          <option value="biweekly">
            {{ t('recurring.biweekly') }}
          </option>
          <option value="monthly">
            {{ t('recurring.monthly') }}
          </option>
        </select>
      </label>
      <label class="block text-sm">
        <span class="mb-1 block font-medium">{{ t('donation.methodLabel') }}</span>
        <select v-model="method" class="w-full rounded-lg border border-gray-300 px-3 py-2">
          <option value="spei">
            {{ t('donation.methodSpei') }}
          </option>
          <option value="card">
            {{ t('donation.methodCard') }}
          </option>
          <option value="paypal">
            {{ t('donation.methodPaypal') }}
          </option>
        </select>
      </label>
      <p class="text-xs text-gray-500">
        {{ t('recurring.methodHint') }}
      </p>
      <p v-if="error" class="text-sm text-red-600">
        {{ error }}
      </p>
      <p v-if="success" class="text-sm text-green-700">
        {{ success }}
      </p>
      <button type="submit" class="btn-primary" :disabled="saving">
        {{ saving ? t('recurring.saving') : t('recurring.create') }}
      </button>
    </form>

    <section>
      <h2 class="mb-3 text-lg font-semibold text-ink">
        {{ t('recurring.listTitle') }}
      </h2>
      <p v-if="loading" class="text-sm text-gray-500">
        {{ t('recurring.loading') }}
      </p>
      <ul v-else class="space-y-3">
        <li v-for="row in items" :key="row.id" class="card text-sm">
          <p class="font-medium text-ink">
            ${{ row.amount.toLocaleString('es-MX') }} · {{ t(`recurring.${row.frequency}`) }} · {{ row.status }}
          </p>
          <p class="text-gray-600">
            {{ row.churchName || row.churchId }}
          </p>
          <div class="mt-2 flex flex-wrap gap-2">
            <button
              v-if="row.status !== 'active'"
              type="button"
              class="rounded border px-2 py-1 text-xs"
              @click="setStatus(row.id, 'active')"
            >
              {{ t('recurring.activate') }}
            </button>
            <button
              v-if="row.status === 'active'"
              type="button"
              class="rounded border px-2 py-1 text-xs"
              @click="setStatus(row.id, 'paused')"
            >
              {{ t('recurring.pause') }}
            </button>
            <button
              v-if="row.status !== 'cancelled'"
              type="button"
              class="rounded border px-2 py-1 text-xs text-red-700"
              @click="setStatus(row.id, 'cancelled')"
            >
              {{ t('recurring.cancel') }}
            </button>
          </div>
        </li>
        <li v-if="!items.length" class="text-sm text-gray-500">
          {{ t('recurring.empty') }}
        </li>
      </ul>
    </section>
  </div>
</template>
