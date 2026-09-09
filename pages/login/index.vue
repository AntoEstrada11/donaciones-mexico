<script setup lang="ts">
const { t } = useI18n()
const { login, isLoggedIn, isAdmin } = useAuth()
const route = useRoute()

function safeInternalPath(value: unknown) {
  if (typeof value !== 'string') return null
  if (!value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return null
  return value
}

function destination(role: 'admin' | 'donor') {
  const requested = safeInternalPath(route.query.redirect)
  if (role === 'admin') {
    if (requested && (requested === '/admin' || requested.startsWith('/admin/'))) return requested
    return '/admin'
  }
  if (requested && !requested.startsWith('/admin')) return requested
  return '/perfil'
}

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

onMounted(() => {
  if (isLoggedIn.value) {
    navigateTo(destination(isAdmin.value ? 'admin' : 'donor'))
  }
})

function onEmailInput(event: Event) {
  email.value = sanitizeEmailInput((event.target as HTMLInputElement).value)
}

function onPasswordInput(event: Event) {
  password.value = sanitizePasswordInput((event.target as HTMLInputElement).value)
}

async function onSubmit() {
  if (!email.value.trim() || !password.value.trim()) {
    error.value = t('login.required')
    return
  }

  if (!isValidEmail(email.value)) {
    error.value = t('validation.email')
    return
  }

  loading.value = true
  error.value = ''

  try {
    const session = await login(email.value.trim(), password.value)
    await navigateTo(destination(session.role === 'admin' ? 'admin' : 'donor'))
  }
  catch (e: unknown) {
    const msg = (e as { data?: { statusMessage?: string } })?.data?.statusMessage
    error.value = msg || t('login.error')
  }
  finally {
    loading.value = false
  }
}
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
      <p class="form-note mb-6">
        {{ t('login.subtitle') }}
      </p>

      <form class="space-y-4" @submit.prevent="onSubmit">
        <div>
          <label for="email" class="mb-1 block text-sm font-medium text-ink">
            {{ t('login.email') }}
          </label>
          <input
            id="email"
            :value="email"
            type="email"
            autocomplete="email"
            required
            :maxlength="FIELD_LIMITS.email.max"
            class="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            :placeholder="t('login.emailPlaceholder')"
            @input="onEmailInput"
          >
        </div>

        <div>
          <label for="password" class="mb-1 block text-sm font-medium text-ink">
            {{ t('login.password') }}
          </label>
          <input
            id="password"
            :value="password"
            type="password"
            autocomplete="current-password"
            required
            :maxlength="FIELD_LIMITS.password.max"
            class="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            :placeholder="t('login.passwordPlaceholder')"
            @input="onPasswordInput"
          >
        </div>

        <p v-if="error" class="text-sm text-red-600">
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
        <NuxtLink
          :to="typeof route.query.redirect === 'string'
            ? { path: '/registro', query: { redirect: route.query.redirect } }
            : '/registro'"
          class="font-medium text-brand hover:underline"
        >
          {{ t('nav.register') }}
        </NuxtLink>
      </p>
    </div>
  </div>
</template>
