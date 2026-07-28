<script setup lang="ts">
const { t } = useI18n()
const { requestPasswordReset, isLoggedIn, authReady } = useAuth()

const email = ref('')
const loading = ref(false)
const error = ref('')
const sent = ref(false)

watch([isLoggedIn, authReady], ([logged, ready]) => {
  if (ready && logged) navigateTo('/perfil')
}, { immediate: true })

async function onSubmit() {
  if (!email.value.trim()) {
    error.value = t('reset.emailRequired')
    return
  }

  loading.value = true
  error.value = ''

  try {
    await requestPasswordReset(email.value.trim())
    sent.value = true
  }
  catch (e: unknown) {
    const msg = (e as { data?: { statusMessage?: string }, statusMessage?: string })?.statusMessage
      || (e as { data?: { statusMessage?: string } })?.data?.statusMessage
      || (e as Error)?.message
    error.value = msg || t('reset.error')
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-md px-4 py-10 md:px-6">
    <NuxtLink to="/login" class="mb-6 inline-flex items-center gap-1 text-sm text-brand hover:underline">
      ← {{ t('common.back') }}
    </NuxtLink>

    <div class="card">
      <h1 class="section-title mb-2">
        {{ t('reset.title') }}
      </h1>
      <p class="mb-6 text-sm text-gray-600">
        {{ t('reset.subtitle') }}
      </p>

      <div v-if="sent" class="rounded-md bg-green-50 px-4 py-3 text-sm text-green-800">
        {{ t('reset.sent') }}
      </div>

      <form v-else class="space-y-4" @submit.prevent="onSubmit">
        <div>
          <label for="email" class="mb-1 block text-sm font-medium text-ink">
            {{ t('login.email') }}
          </label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            autocomplete="email"
            class="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            :placeholder="t('login.emailPlaceholder')"
          >
        </div>

        <p v-if="error" class="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {{ error }}
        </p>

        <button
          type="submit"
          class="btn-primary w-full"
          :disabled="loading"
          :class="{ 'opacity-60': loading }"
        >
          {{ loading ? t('reset.sending') : t('reset.submit') }}
        </button>
      </form>
    </div>
  </div>
</template>
