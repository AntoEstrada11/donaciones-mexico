<script setup lang="ts">
const { t } = useI18n()
const { register, isLoggedIn, authReady } = useAuth()
const route = useRoute()

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref('')
const info = ref('')
const showPassword = ref(false)

const storedFallback = ref('/perfil')

const redirectTarget = computed(() =>
  safeRedirectPath(route.query.redirect, storedFallback.value),
)

watch([isLoggedIn, authReady], ([logged, ready]) => {
  if (ready && logged) {
    navigateTo(redirectTarget.value)
  }
}, { immediate: true })

onMounted(() => {
  if (typeof route.query.redirect === 'string') {
    const safe = safeRedirectPath(route.query.redirect, '/perfil')
    rememberAuthRedirect(safe)
    storedFallback.value = safe
  }
  else {
    storedFallback.value = consumeAuthRedirect('/perfil')
  }
})

async function onSubmit() {
  if (!email.value.trim() || !password.value.trim()) {
    error.value = t('register.required')
    return
  }
  if (password.value.length < 8) {
    error.value = t('register.passwordWeak')
    return
  }
  if (password.value !== confirmPassword.value) {
    error.value = t('register.passwordMismatch')
    return
  }

  loading.value = true
  error.value = ''
  info.value = ''

  try {
    rememberAuthRedirect(redirectTarget.value)
    const result = await register({
      email: email.value.trim(),
      password: password.value,
      emailRedirectPath: redirectTarget.value,
    })

    if (result.needsEmailConfirmation) {
      info.value = t('register.checkEmail')
      return
    }

    await navigateTo(redirectTarget.value)
  }
  catch (e: unknown) {
    const msg = (e as { data?: { statusMessage?: string }, statusMessage?: string })?.data?.statusMessage
      || (e as { statusMessage?: string })?.statusMessage
      || (e as Error)?.message
    error.value = msg || t('register.error')
  }
  finally {
    loading.value = false
  }
}

const loginLink = computed(() => {
  const r = safeRedirectPath(route.query.redirect, '')
  return r ? `/login?redirect=${encodeURIComponent(r)}` : '/login'
})
</script>

<template>
  <div class="mx-auto max-w-md px-4 py-10 md:px-6">
    <NuxtLink to="/" class="mb-6 inline-flex items-center gap-1 text-sm text-brand hover:underline">
      ← {{ t('common.back') }}
    </NuxtLink>

    <div class="card">
      <h1 class="section-title mb-2">
        {{ t('register.title') }}
      </h1>
      <p class="mb-6 text-sm text-gray-600">
        {{ t('register.subtitle') }}
      </p>

      <form class="space-y-4" @submit.prevent="onSubmit">
        <div>
          <label for="email" class="mb-1 block text-sm font-medium text-ink">
            {{ t('register.email') }}
          </label>
          <input
            id="email"
            v-model="email"
            type="email"
            autocomplete="email"
            required
            class="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            :placeholder="t('login.emailPlaceholder')"
          >
        </div>

        <div>
          <label for="password" class="mb-1 block text-sm font-medium text-ink">
            {{ t('register.password') }}
          </label>
          <div class="relative">
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="new-password"
              required
              minlength="8"
              class="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              :placeholder="t('register.passwordHint')"
            >
            <button
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500"
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? t('common.hide') : t('common.show') }}
            </button>
          </div>
        </div>

        <div>
          <label for="confirm" class="mb-1 block text-sm font-medium text-ink">
            {{ t('register.confirmPassword') }}
          </label>
          <input
            id="confirm"
            v-model="confirmPassword"
            type="password"
            autocomplete="new-password"
            required
            minlength="8"
            class="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          >
        </div>

        <p v-if="error" class="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {{ error }}
        </p>
        <p v-if="info" class="rounded-md bg-green-50 px-3 py-2 text-sm text-green-800" role="status">
          {{ info }}
        </p>

        <button
          type="submit"
          class="btn-primary w-full"
          :class="{ 'cursor-not-allowed opacity-60': loading }"
          :disabled="loading"
        >
          {{ loading ? t('register.submitting') : t('register.submit') }}
        </button>
      </form>

      <p class="mt-4 text-center text-sm text-gray-600">
        {{ t('register.hasAccount') }}
        <NuxtLink :to="loginLink" class="font-medium text-brand hover:underline">
          {{ t('nav.login') }}
        </NuxtLink>
      </p>

      <ul class="mt-5 space-y-1 text-xs text-gray-500">
        <li>• {{ t('security.emailUnique') }}</li>
        <li>• {{ t('security.phoneLater') }}</li>
        <li>• {{ t('security.odooNote') }}</li>
      </ul>
    </div>
  </div>
</template>
