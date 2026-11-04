<script setup lang="ts">
import type { AdminDonorDetail, Donation, DonorRequestType, DonorStatus } from '~/types'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const { t } = useI18n()
const { adminHeaders } = useAuth()
const route = useRoute()

const donorId = computed(() => String(route.params.id || ''))
const detail = ref<AdminDonorDetail | null>(null)
const loading = ref(true)
const error = ref('')
const success = ref('')
const requestBusy = ref<DonorRequestType | null>(null)
const lastActionUrl = ref('')
const churchIdDraft = ref('')
const churchNameDraft = ref('')
const churchSaving = ref(false)

function syncChurchDraft() {
  churchIdDraft.value = detail.value?.profile?.homeChurchId || ''
  churchNameDraft.value = detail.value?.profile?.homeChurchName || ''
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    detail.value = await $fetch<AdminDonorDetail>(`/api/admin/donors/${donorId.value}`, {
      headers: adminHeaders(),
    })
    syncChurchDraft()
  }
  catch (e: unknown) {
    const msg = (e as { data?: { statusMessage?: string } })?.data?.statusMessage
    error.value = msg || t('common.error')
    detail.value = null
  }
  finally {
    loading.value = false
  }
}

async function saveChurch() {
  if (!detail.value) return
  churchSaving.value = true
  error.value = ''
  success.value = ''
  try {
    detail.value = await $fetch<AdminDonorDetail>(`/api/admin/donors/${detail.value.id}`, {
      method: 'PATCH',
      headers: adminHeaders(),
      body: {
        homeChurchId: churchIdDraft.value || null,
        homeChurchName: churchNameDraft.value || null,
      },
    })
    syncChurchDraft()
    success.value = t('admin.donor.churchSaved')
  }
  catch (e: unknown) {
    const msg = (e as { data?: { statusMessage?: string } })?.data?.statusMessage
    error.value = msg || t('common.error')
  }
  finally {
    churchSaving.value = false
  }
}

onMounted(load)
watch(donorId, load)

async function setStatus(status: DonorStatus) {
  if (!detail.value || detail.value.status === status) return
  error.value = ''
  success.value = ''
  try {
    await $fetch(`/api/admin/users/${detail.value.id}/status`, {
      method: 'PATCH',
      headers: adminHeaders(),
      body: { status },
    })
    success.value = status === 'active'
      ? t('admin.users.reactivated')
      : t('admin.users.deactivated')
    await load()
  }
  catch (e: unknown) {
    const msg = (e as { data?: { statusMessage?: string } })?.data?.statusMessage
    error.value = msg || t('common.error')
  }
}

async function onDonationStatus(donationId: string, event: Event) {
  const status = (event.target as HTMLSelectElement).value as Donation['status']
  error.value = ''
  try {
    await $fetch(`/api/admin/donations/${donationId}`, {
      method: 'PATCH',
      headers: adminHeaders(),
      body: { status },
    })
    await load()
  }
  catch (e: unknown) {
    const msg = (e as { data?: { statusMessage?: string } })?.data?.statusMessage
    error.value = msg || t('common.error')
  }
}

const statuses: Donation['status'][] = ['pending', 'paid', 'failed', 'cancelled', 'refunded']

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatMoney(amount: number) {
  return `$${amount.toLocaleString('es-MX')} MXN`
}

function complianceLabel(status: string) {
  if (status === 'sat_report') return t('admin.alerts.sat')
  if (status === 'pld_pending') return t('admin.alerts.pld')
  if (status === 'cfdi') return t('admin.donor.cfdi')
  return t('admin.donor.rapid')
}

function methodLabel(method: string) {
  if (method === 'spei') return 'SPEI'
  if (method === 'card') return t('admin.donations.methodCard')
  if (method === 'paypal') return 'PayPal'
  return method
}

function requestTypeLabel(type: DonorRequestType) {
  if (type === 'identity') return t('admin.donor.requestIdentity')
  if (type === 'fiscal') return t('admin.donor.requestFiscal')
  return t('admin.donor.requestEmail')
}

async function sendRequest(type: DonorRequestType) {
  if (!detail.value) return
  error.value = ''
  success.value = ''
  lastActionUrl.value = ''
  requestBusy.value = type
  try {
    const result = await $fetch<{
      request: { id: string }
      sent: boolean
      actionUrl?: string
    }>(`/api/admin/donors/${detail.value.id}/requests`, {
      method: 'POST',
      headers: adminHeaders(),
      body: { type },
    })
    success.value = result.sent
      ? t('admin.donor.requestSent')
      : t('admin.donor.requestQueued')
    if (result.actionUrl) lastActionUrl.value = result.actionUrl
    await load()
  }
  catch (e: unknown) {
    const msg = (e as { data?: { statusMessage?: string } })?.data?.statusMessage
    error.value = msg || t('common.error')
  }
  finally {
    requestBusy.value = null
  }
}

async function closeRequest(requestId: string, status: 'resolved' | 'cancelled') {
  if (!detail.value) return
  error.value = ''
  try {
    await $fetch(`/api/admin/donors/${detail.value.id}/requests/${requestId}`, {
      method: 'PATCH',
      headers: adminHeaders(),
      body: { status },
    })
    await load()
  }
  catch (e: unknown) {
    const msg = (e as { data?: { statusMessage?: string } })?.data?.statusMessage
    error.value = msg || t('common.error')
  }
}

const canRequestIdentity = computed(() => detail.value && !detail.value.identity.complete)
const canRequestEmail = computed(() => detail.value && !detail.value.emailVerified)
const openRequests = computed(() => detail.value?.requests.filter(r => r.status === 'open') || [])
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-10 md:px-6">
    <header class="mb-2">
      <p class="text-sm text-gray-500">
        <NuxtLink to="/admin/users" class="text-brand hover:underline">
          {{ t('admin.nav.users') }}
        </NuxtLink>
        /
        {{ t('admin.donor.title') }}
      </p>
      <h1 class="section-title mt-1">
        {{ detail?.name || t('admin.donor.title') }}
      </h1>
      <p class="mt-2 text-gray-600">
        {{ t('admin.donor.subtitle') }}
      </p>
    </header>

    <p v-if="error" class="mb-4 text-sm text-red-600">
      {{ error }}
    </p>
    <p v-if="success" class="mb-4 text-sm text-green-700">
      {{ success }}
    </p>

    <div v-if="loading" class="py-12 text-center text-gray-500">
      {{ t('common.loading') }}
    </div>
    <template v-else-if="detail">
      <div class="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article class="rounded-lg border border-gray-200 bg-white p-4">
          <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">
            {{ t('admin.donor.paidTotal') }}
          </p>
          <p class="mt-1 text-2xl font-bold text-ink">
            {{ formatMoney(detail.totals.paidAmount) }}
          </p>
          <p class="text-sm text-gray-500">
            {{ detail.totals.paidCount }} {{ t('admin.donor.donations') }}
          </p>
        </article>
        <article class="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">
            {{ t('admin.donor.pendingTotal') }}
          </p>
          <p class="mt-1 text-2xl font-bold text-ink">
            {{ formatMoney(detail.totals.pendingAmount) }}
          </p>
          <p class="text-sm text-gray-500">
            {{ detail.totals.pendingCount }} {{ t('admin.donor.donations') }}
          </p>
        </article>
        <article class="rounded-lg border border-gray-200 bg-white p-4">
          <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">
            {{ t('admin.donor.windowPaid') }}
          </p>
          <p class="mt-1 text-2xl font-bold text-ink">
            {{ formatMoney(detail.uma.paidInWindow) }}
          </p>
          <p class="text-sm text-gray-500">
            {{ complianceLabel(detail.uma.status) }}
          </p>
        </article>
        <article class="rounded-lg border border-gray-200 bg-white p-4">
          <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">
            {{ t('admin.donor.account') }}
          </p>
          <p class="mt-2 text-sm text-ink">
            {{ detail.status === 'active' ? t('admin.users.statusActive') : t('admin.users.statusDeactivated') }}
          </p>
          <p class="text-sm text-gray-500">
            {{ detail.emailVerified ? t('admin.donor.emailOk') : t('admin.donor.emailPending') }}
          </p>
        </article>
      </div>

      <div class="mb-8 grid gap-6 lg:grid-cols-2">
        <section class="rounded-xl border border-gray-200 bg-white p-5">
          <h2 class="mb-3 text-lg font-semibold text-ink">
            {{ t('admin.donor.contact') }}
          </h2>
          <dl class="space-y-2 text-sm">
            <div class="flex justify-between gap-4">
              <dt class="text-gray-500">{{ t('admin.users.email') }}</dt>
              <dd class="text-ink">{{ detail.email }}</dd>
            </div>
            <div class="flex justify-between gap-4">
              <dt class="text-gray-500">{{ t('admin.donor.phone') }}</dt>
              <dd class="text-ink">{{ detail.profile?.phone || '—' }}</dd>
            </div>
            <div class="flex justify-between gap-4">
              <dt class="text-gray-500">{{ t('admin.donor.created') }}</dt>
              <dd class="text-ink">{{ formatDate(detail.createdAt) }}</dd>
            </div>
            <div class="flex justify-between gap-4">
              <dt class="text-gray-500">{{ t('admin.donor.identity') }}</dt>
              <dd class="text-ink">
                {{ detail.identity.complete
                  ? t('admin.alerts.idOk')
                  : t('admin.alerts.idMissing') }}
                <span class="text-xs text-gray-500">
                  ({{ detail.identity.front ? 'A' : '—' }}/{{ detail.identity.back ? 'R' : '—' }})
                </span>
              </dd>
            </div>
          </dl>
          <div v-if="detail.role === 'donor'" class="mt-4 space-y-2 border-t border-gray-100 pt-4">
            <p class="text-sm font-medium text-ink">
              {{ t('admin.donor.church') }}
            </p>
            <input
              v-model="churchNameDraft"
              type="text"
              maxlength="200"
              class="w-full rounded border border-gray-300 px-2 py-1 text-sm"
              :placeholder="t('admin.donor.churchNamePh')"
            >
            <input
              v-model="churchIdDraft"
              type="text"
              maxlength="64"
              class="w-full rounded border border-gray-300 px-2 py-1 text-sm"
              :placeholder="t('admin.donor.churchIdPh')"
            >
            <button
              type="button"
              class="btn-secondary px-3 py-1.5 text-sm"
              :disabled="churchSaving"
              @click="saveChurch"
            >
              {{ churchSaving ? t('admin.donor.churchSaving') : t('admin.donor.churchSave') }}
            </button>
          </div>
          <div v-if="detail.role === 'donor'" class="mt-4 flex flex-wrap gap-2">
            <button
              v-if="detail.status === 'active'"
              type="button"
              class="btn-secondary px-3 py-1.5 text-sm text-red-700"
              @click="setStatus('deactivated')"
            >
              {{ t('admin.users.deactivate') }}
            </button>
            <button
              v-else
              type="button"
              class="btn-secondary px-3 py-1.5 text-sm text-green-700"
              @click="setStatus('active')"
            >
              {{ t('admin.users.reactivate') }}
            </button>
          </div>
        </section>

        <section class="rounded-xl border border-gray-200 bg-white p-5">
          <h2 class="mb-3 text-lg font-semibold text-ink">
            {{ t('admin.donor.fiscal') }}
          </h2>
          <dl class="space-y-2 text-sm">
            <div class="flex justify-between gap-4">
              <dt class="text-gray-500">{{ t('admin.donor.wantsReceipt') }}</dt>
              <dd class="text-ink">
                {{ detail.profile?.wantsReceipt ? t('common.yes') : t('common.no') }}
              </dd>
            </div>
            <div class="flex justify-between gap-4">
              <dt class="text-gray-500">{{ t('admin.alerts.rfc') }}</dt>
              <dd class="font-mono text-ink">{{ detail.profile?.rfc || '—' }}</dd>
            </div>
            <div class="flex justify-between gap-4">
              <dt class="text-gray-500">{{ t('admin.donor.fiscalName') }}</dt>
              <dd class="text-right text-ink">{{ detail.profile?.fiscalName || '—' }}</dd>
            </div>
            <div class="flex justify-between gap-4">
              <dt class="text-gray-500">{{ t('admin.donor.address') }}</dt>
              <dd class="text-right text-ink">
                <template v-if="detail.profile?.street || detail.profile?.city">
                  {{ [detail.profile?.street, detail.profile?.colony, detail.profile?.city, detail.profile?.state, detail.profile?.zip].filter(Boolean).join(', ') }}
                </template>
                <template v-else>—</template>
              </dd>
            </div>
            <div class="flex justify-between gap-4">
              <dt class="text-gray-500">{{ t('admin.donor.compliance') }}</dt>
              <dd class="text-ink">
                {{ complianceLabel(detail.profile?.complianceStatus || detail.uma.status) }}
              </dd>
            </div>
          </dl>
        </section>
      </div>

      <section v-if="detail.role === 'donor'" class="mb-8 rounded-xl border border-brand/20 bg-brand-light/30 p-5">
        <h2 class="mb-1 text-lg font-semibold text-ink">
          {{ t('admin.donor.requestTitle') }}
        </h2>
        <p class="mb-4 text-sm text-gray-600">
          {{ t('admin.donor.requestSubtitle') }}
        </p>
        <div class="flex flex-wrap gap-2">
          <button
            type="button"
            class="btn-primary px-3 py-1.5 text-sm"
            :disabled="!canRequestIdentity || requestBusy === 'identity'"
            @click="sendRequest('identity')"
          >
            {{ requestBusy === 'identity' ? t('admin.donor.requestSending') : t('admin.donor.requestIdentity') }}
          </button>
          <button
            type="button"
            class="btn-primary px-3 py-1.5 text-sm"
            :disabled="requestBusy === 'fiscal'"
            @click="sendRequest('fiscal')"
          >
            {{ requestBusy === 'fiscal' ? t('admin.donor.requestSending') : t('admin.donor.requestFiscal') }}
          </button>
          <button
            type="button"
            class="btn-primary px-3 py-1.5 text-sm"
            :disabled="!canRequestEmail || requestBusy === 'email_verify'"
            @click="sendRequest('email_verify')"
          >
            {{ requestBusy === 'email_verify' ? t('admin.donor.requestSending') : t('admin.donor.requestEmail') }}
          </button>
        </div>
        <p v-if="lastActionUrl" class="mt-3 break-all text-xs text-gray-600">
          {{ t('admin.donor.requestDevLink') }}
          <code class="rounded bg-white px-1">{{ lastActionUrl }}</code>
        </p>
        <div v-if="openRequests.length" class="mt-5 overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table class="min-w-full text-left text-sm">
            <thead class="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th class="px-4 py-2">{{ t('admin.donor.requestType') }}</th>
                <th class="px-4 py-2">{{ t('admin.donor.requestSentAt') }}</th>
                <th class="px-4 py-2">{{ t('admin.users.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="req in openRequests" :key="req.id" class="border-b border-gray-100 last:border-0">
                <td class="px-4 py-2">{{ requestTypeLabel(req.type) }}</td>
                <td class="px-4 py-2 text-gray-600">{{ formatDate(req.sentAt) }}</td>
                <td class="px-4 py-2">
                  <button
                    type="button"
                    class="mr-3 text-sm font-medium text-green-700 hover:underline"
                    @click="closeRequest(req.id, 'resolved')"
                  >
                    {{ t('admin.donor.requestResolve') }}
                  </button>
                  <button
                    type="button"
                    class="text-sm font-medium text-red-700 hover:underline"
                    @click="closeRequest(req.id, 'cancelled')"
                  >
                    {{ t('admin.donor.requestCancel') }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="mb-8">
        <h2 class="mb-3 text-lg font-semibold text-ink">
          {{ t('admin.donor.recurring') }}
        </h2>
        <p v-if="detail.recurring.length === 0" class="text-sm text-gray-500">
          {{ t('admin.donor.recurringEmpty') }}
        </p>
        <div v-else class="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table class="min-w-full text-left text-sm">
            <thead class="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th class="px-4 py-3">{{ t('admin.donations.amount') }}</th>
                <th class="px-4 py-3">{{ t('admin.donations.method') }}</th>
                <th class="px-4 py-3">{{ t('admin.donor.frequency') }}</th>
                <th class="px-4 py-3">{{ t('admin.donations.status') }}</th>
                <th class="px-4 py-3">{{ t('admin.donor.nextCharge') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="plan in detail.recurring"
                :key="plan.id"
                class="border-b border-gray-100 last:border-0"
              >
                <td class="px-4 py-3 font-semibold text-brand">
                  {{ formatMoney(plan.amount) }}
                </td>
                <td class="px-4 py-3">{{ methodLabel(plan.method) }}</td>
                <td class="px-4 py-3">{{ plan.frequency }}</td>
                <td class="px-4 py-3">{{ plan.status }}</td>
                <td class="px-4 py-3 text-gray-600">{{ formatDate(plan.nextChargeAt) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 class="mb-3 text-lg font-semibold text-ink">
          {{ t('admin.donor.history') }}
        </h2>
        <p v-if="detail.donations.length === 0" class="text-sm text-gray-500">
          {{ t('admin.donor.historyEmpty') }}
        </p>
        <div v-else class="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table class="min-w-full text-left text-sm">
            <thead class="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th class="px-4 py-3">{{ t('admin.donations.date') }}</th>
                <th class="px-4 py-3">{{ t('admin.donations.church') }}</th>
                <th class="px-4 py-3">{{ t('admin.donations.campaign') }}</th>
                <th class="px-4 py-3">{{ t('admin.donations.method') }}</th>
                <th class="px-4 py-3">{{ t('admin.donations.amount') }}</th>
                <th class="px-4 py-3">{{ t('admin.donations.status') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="donation in detail.donations"
                :key="donation.id"
                class="border-b border-gray-100 last:border-0"
              >
                <td class="whitespace-nowrap px-4 py-3 text-gray-600">
                  {{ formatDate(donation.createdAt) }}
                </td>
                <td class="px-4 py-3">{{ donation.churchName || donation.churchId }}</td>
                <td class="px-4 py-3">{{ donation.campaignName || donation.campaignId }}</td>
                <td class="px-4 py-3">{{ methodLabel(donation.method) }}</td>
                <td class="whitespace-nowrap px-4 py-3 font-semibold text-brand">
                  {{ formatMoney(donation.amount) }}
                </td>
                <td class="px-4 py-3">
                  <select
                    :value="donation.status"
                    class="rounded border border-gray-300 px-2 py-1 text-sm"
                    @change="onDonationStatus(donation.id, $event)"
                  >
                    <option v-for="status in statuses" :key="status" :value="status">
                      {{ t(`donation.status${status.charAt(0).toUpperCase()}${status.slice(1)}`) }}
                    </option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </template>
  </div>
</template>
