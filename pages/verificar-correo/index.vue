<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()
const { markEmailVerified, resendVerification, isLoggedIn, requireToken, user } = useAuth()

const token = computed(() => String(route.query.token || ''))
const loading = ref(false)
const done = ref(false)
const error = ref('')
const hint = ref('')
const resending = ref(false)

onMounted(async () => {
  if (!token.value) return
  loading.value = true
  error.value = ''
  try {
    await $fetch('/api/auth/verify-email', {
      method: 'POST',
      body: { token: token.value },
    })
    done.value = true
    markEmailVerified()
  }
  catch (e: unknown) {
    const msg = (e as { data?: { statusMessage?: string } })?.data?.statusMessage
    error.value = msg || t('verifyEmail.error')
  }
  finally {
    loading.value = false
  }
})

async function resend() {
  if (!isLoggedIn.value) {
    await navigateTo('/login')
    return
  }
  resending.value = true
  hint.value = ''
  try {
    requireToken()
    const result = await resendVerification()
    hint.value = result.verifyUrl
      ? `${result.message} ${result.verifyUrl}`
      : result.message
    if (user.value) user.value.emailVerified = user.value.emailVerified
  }
  catch (e: unknown) {
    const msg = (e as { data?: { statusMessage?: string } })?.data?.statusMessage
    hint.value = msg || t('verifyEmail.resendError')
  }
  finally {
    resending.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-lg px-4 py-16">
    <div class="card space-y-4 text-center">
      <h1 class="text-xl font-bold text-ink">
        {{ t('verifyEmail.title') }}
      </h1>
      <p v-if="loading" class="text-sm text-gray-600">
        {{ t('verifyEmail.checking') }}
      </p>
      <template v-else-if="done">
        <p class="text-sm text-green-700">
          {{ t('verifyEmail.success') }}
        </p>
        <NuxtLink to="/donaciones" class="btn-primary inline-block">
          {{ t('nav.donate') }}
        </NuxtLink>
      </template>
      <template v-else>
        <p class="text-sm text-gray-600">
          {{ token ? error : t('verifyEmail.needLink') }}
        </p>
        <button type="button" class="btn-primary" :disabled="resending" @click="resend">
          {{ resending ? t('verifyEmail.resending') : t('verifyEmail.resend') }}
        </button>
        <p v-if="hint" class="break-all text-xs text-gray-500">
          {{ hint }}
        </p>
      </template>
    </div>
  </div>
</template>
