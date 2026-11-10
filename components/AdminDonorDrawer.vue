<script setup lang="ts">
import type { AdminDonorDetail, DonorRequestType } from '~/types'

const { t } = useI18n()
const { adminHeaders } = useAuth()
const { donorId, isOpen, closeDonor } = useAdminDonorDrawer()

const dialogEl = ref<HTMLDialogElement | null>(null)
const detail = ref<AdminDonorDetail | null>(null)
const loading = ref(false)
const error = ref('')
const success = ref('')
const requestBusy = ref<DonorRequestType | null>(null)
const lastActionUrl = ref('')

watch(isOpen, async (open) => {
  await nextTick()
  const el = dialogEl.value
  if (!el) return
  if (open) {
    if (!el.open) el.showModal()
    await load()
  }
  else if (el.open) {
    el.close()
  }
})

watch(donorId, (id) => {
  if (id && isOpen.value) load()
})

async function load() {
  if (!donorId.value) return
  loading.value = true
  error.value = ''
  try {
    detail.value = await $fetch<AdminDonorDetail>(`/api/admin/donors/${donorId.value}`, {
      headers: adminHeaders(),
    })
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

function onNativeClose() {
  if (!isOpen.value) return
  closeDonor()
  detail.value = null
  error.value = ''
  success.value = ''
  lastActionUrl.value = ''
}

function onBackdropClick(event: MouseEvent) {
  if (event.target !== dialogEl.value) return
  dialogEl.value?.close()
}

function formatMoney(amount: number) {
  return `$${amount.toLocaleString('es-MX')} MXN`
}

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function complianceLabel(status: string) {
  if (status === 'sat_report') return t('admin.alerts.sat')
  if (status === 'pld_pending') return t('admin.alerts.pld')
  if (status === 'cfdi') return t('admin.donor.cfdi')
  return t('admin.donor.rapid')
}

function requestTypeLabel(type: DonorRequestType) {
  if (type === 'identity') return t('admin.donor.requestIdentity')
  if (type === 'fiscal') return t('admin.donor.requestFiscal')
  return t('admin.donor.requestEmail')
}

const canRequestIdentity = computed(() => detail.value && !detail.value.identity.complete)
const canRequestEmail = computed(() => detail.value && !detail.value.emailVerified)
const openRequests = computed(() => detail.value?.requests.filter(r => r.status === 'open') || [])

async function sendRequest(type: DonorRequestType) {
  if (!detail.value) return
  error.value = ''
  success.value = ''
  lastActionUrl.value = ''
  requestBusy.value = type
  try {
    const result = await $fetch<{
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
</script>

<template>
  <dialog
    ref="dialogEl"
    class="donor-drawer fixed inset-y-0 right-0 m-0 ml-auto h-full max-h-none w-full max-w-lg border-0 bg-transparent p-0 text-ink open:flex"
    aria-labelledby="donor-drawer-title"
    @close="onNativeClose"
    @click="onBackdropClick"
  >
    <div
      class="flex h-full w-full flex-col border-l border-gray-200 bg-white shadow-2xl shadow-brand/20"
      @click.stop
    >
      <header class="flex items-start justify-between gap-3 border-b border-gray-100 px-5 py-4">
        <div class="min-w-0">
          <p class="text-[11px] font-semibold uppercase tracking-wider text-brand/70">
            {{ t('admin.donor.drawerEyebrow') }}
          </p>
          <h2 id="donor-drawer-title" class="mt-1 truncate text-xl font-bold text-ink">
            {{ detail?.name || t('admin.donor.title') }}
          </h2>
          <p v-if="detail" class="truncate text-sm text-gray-500">
            {{ detail.email }}
          </p>
        </div>
        <button
          type="button"
          class="rounded-xl border border-gray-200 px-3 py-1.5 text-sm text-gray-600 transition hover:bg-gray-50"
          @click="dialogEl?.close()"
        >
          {{ t('admin.donor.drawerClose') }}
        </button>
      </header>

      <div class="flex-1 overflow-y-auto px-5 py-4">
        <p v-if="error" class="mb-3 text-sm text-red-600">
          {{ error }}
        </p>
        <p v-if="success" class="mb-3 text-sm text-green-700">
          {{ success }}
        </p>

        <div v-if="loading" class="py-16 text-center text-gray-500">
          {{ t('common.loading') }}
        </div>

        <template v-else-if="detail">
          <div class="mb-5 grid grid-cols-2 gap-3">
            <article class="rounded-2xl border border-gray-100 bg-gray-50 p-3">
              <p class="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                {{ t('admin.donor.windowPaid') }}
              </p>
              <p class="mt-1 text-lg font-bold text-ink">
                {{ formatMoney(detail.uma.paidInWindow) }}
              </p>
              <p class="text-xs text-gray-500">
                {{ complianceLabel(detail.uma.status) }}
              </p>
            </article>
            <article class="rounded-2xl border border-gray-100 bg-gray-50 p-3">
              <p class="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                {{ t('admin.donor.identity') }}
              </p>
              <p class="mt-1 text-sm font-semibold text-ink">
                {{ detail.identity.complete ? t('admin.alerts.idOk') : t('admin.alerts.idMissing') }}
              </p>
              <p class="text-xs text-gray-500">
                {{ detail.emailVerified ? t('admin.donor.emailOk') : t('admin.donor.emailPending') }}
              </p>
            </article>
          </div>

          <section class="mb-5 rounded-2xl border border-brand/20 bg-brand-light/40 p-4">
            <h3 class="text-sm font-semibold text-ink">
              {{ t('admin.donor.requestTitle') }}
            </h3>
            <p class="mt-1 text-xs text-gray-600">
              {{ t('admin.donor.requestSubtitle') }}
            </p>
            <div class="mt-3 flex flex-col gap-2">
              <button
                type="button"
                class="btn-primary w-full justify-center px-3 py-2 text-sm"
                :disabled="!canRequestIdentity || requestBusy === 'identity'"
                @click="sendRequest('identity')"
              >
                {{ requestBusy === 'identity' ? t('admin.donor.requestSending') : t('admin.donor.requestIdentity') }}
              </button>
              <button
                type="button"
                class="btn-primary w-full justify-center px-3 py-2 text-sm"
                :disabled="requestBusy === 'fiscal'"
                @click="sendRequest('fiscal')"
              >
                {{ requestBusy === 'fiscal' ? t('admin.donor.requestSending') : t('admin.donor.requestFiscal') }}
              </button>
              <button
                type="button"
                class="btn-primary w-full justify-center px-3 py-2 text-sm"
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

            <div v-if="openRequests.length" class="mt-4 space-y-2 border-t border-brand/10 pt-3">
              <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">
                {{ t('admin.donor.drawerOpenRequests') }}
              </p>
              <div
                v-for="req in openRequests"
                :key="req.id"
                class="flex items-center justify-between gap-2 rounded-xl bg-white px-3 py-2 text-sm"
              >
                <div>
                  <p class="font-medium text-ink">
                    {{ requestTypeLabel(req.type) }}
                  </p>
                  <p class="text-xs text-gray-500">
                    {{ formatDate(req.sentAt) }}
                  </p>
                </div>
                <div class="flex flex-col gap-1">
                  <button
                    type="button"
                    class="text-left text-xs font-medium text-green-700 hover:underline"
                    @click="closeRequest(req.id, 'resolved')"
                  >
                    {{ t('admin.donor.requestResolve') }}
                  </button>
                  <button
                    type="button"
                    class="text-left text-xs font-medium text-red-700 hover:underline"
                    @click="closeRequest(req.id, 'cancelled')"
                  >
                    {{ t('admin.donor.requestCancel') }}
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section class="mb-5 text-sm">
            <h3 class="mb-2 text-sm font-semibold text-ink">
              {{ t('admin.donor.contact') }}
            </h3>
            <dl class="space-y-2 rounded-2xl border border-gray-100 p-3">
              <div class="flex justify-between gap-3">
                <dt class="text-gray-500">{{ t('admin.donor.phone') }}</dt>
                <dd>{{ detail.profile?.phone || '—' }}</dd>
              </div>
              <div class="flex justify-between gap-3">
                <dt class="text-gray-500">{{ t('admin.alerts.rfc') }}</dt>
                <dd class="font-mono text-xs">{{ detail.profile?.rfc || '—' }}</dd>
              </div>
              <div class="flex justify-between gap-3">
                <dt class="text-gray-500">{{ t('admin.donor.church') }}</dt>
                <dd class="text-right">{{ detail.profile?.homeChurchName || detail.profile?.homeChurchId || '—' }}</dd>
              </div>
            </dl>
          </section>
        </template>
      </div>

      <footer v-if="detail" class="border-t border-gray-100 px-5 py-3">
        <NuxtLink
          :to="`/admin/donantes/${detail.id}`"
          class="text-sm font-medium text-brand hover:underline"
          @click="closeDonor"
        >
          {{ t('admin.donor.drawerFullPage') }}
        </NuxtLink>
        <p class="mt-1 text-xs text-gray-500">
          {{ t('admin.donor.drawerFullPageHint') }}
        </p>
      </footer>
    </div>
  </dialog>
</template>

<style scoped>
.donor-drawer::backdrop {
  background: rgb(0 34 68 / 0.35);
  backdrop-filter: blur(2px);
}

.donor-drawer[open] {
  animation: donor-drawer-in 0.22s ease-out;
}

@keyframes donor-drawer-in {
  from {
    transform: translateX(1.25rem);
    opacity: 0.4;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .donor-drawer[open] {
    animation: none;
  }
}
</style>
