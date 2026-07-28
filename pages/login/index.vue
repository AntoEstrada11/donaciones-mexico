<script setup lang="ts">
const { t } = useI18n()
const { login, isLoggedIn, authReady } = useAuth()
const route = useRoute()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
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
  if (route.query.error === 'callback') {
    error.value = t('login.callbackError')
  }
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
    error.value = t('login.required')
    return
  }

  loading.value = true
  error.value = ''

  try {
    await login(email.value.trim(), password.value)
    await navigateTo(redirectTarget.value)
  }
  catch (e: unknown) {
    const msg = (e as { statusMessage?: string, data?: { statusMessage?: string } })?.data?.statusMessage
      || (e as { statusMessage?: string })?.statusMessage
      || (e as Error)?.message
    error.value = msg || t('login.error')
  }
  finally {
    loading.value = false
  }
}

const registerLink = computed(() => {
  const r = safeRedirectPath(route.query.redirect, '')
  return r ? `/registro?redirect=${encodeURIComponent(r)}` : '/registro'
})
</script>

<template>
  <div class="mx-auto max-w-md px-4 py-10 md:px-6">
    <NuxtLink to="/" class="mb-6 inline-flex items-center gap-1 text-sm text-brand hover:underline">
      ← {{ t('common.back') }}
    </NuxtLink>

    <div class="card">
      <h1 class="section-title mb-2">
        {{ t('login.title') }}
      </h1>
      <p class="mb-6 text-sm text-gray-600">
        {{ t('login.subtitle') }}
      </p>

      <form class="space-y-4" @submit.prevent="onSubmit">
        <div>
          <label for="email" class="mb-1 block text-sm font-medium text-ink">
            {{ t('login.email') }}
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
          <div class="mb-1 flex items-center justify-between">
            <label for="password" class="block text-sm font-medium text-ink">
              {{ t('login.password') }}
            </label>
            <NuxtLink to="/recuperar" class="text-xs font-medium text-brand hover:underline">
              {{ t('login.forgot') }}
            </NuxtLink>
          </div>
          <div class="relative">
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              required
              minlength="8"
              class="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              :placeholder="t('login.passwordPlaceholder')"
            >
            <button
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-ink"
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? t('common.hide') : t('common.show') }}
            </button>
          </div>
        </div>

        <p v-if="error" class="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {{ error }}
        </p>

        <button
          type="submit"
          class="btn-primary w-full"
          :class="{ 'cursor-not-allowed opacity-60': loading }"
          :disabled="loading"
        >
          {{ loading ? t('login.submitting') : t('login.submit') }}
        </button>
      </form>

      <p class="mt-4 text-center text-sm text-gray-600">
        {{ t('login.noAccount') }}
        <NuxtLink :to="registerLink" class="font-medium text-brand hover:underline">
          {{ t('nav.register') }}
        </NuxtLink>
      </p>

      <p class="mt-4 text-center text-xs text-gray-400">
        {{ t('security.connectionNote') }}
      </p>
    </div>
  </div>
</template>
