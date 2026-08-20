<script setup lang="ts">
const { t } = useI18n()
const { register, isLoggedIn } = useAuth()
const route = useRoute()

const email = ref('')
const password = ref('')
const consent = ref(false)
const marketing = ref(false)
const loading = ref(false)
const error = ref('')

onMounted(() => {
  if (isLoggedIn.value) {
    navigateTo('/perfil')
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
    error.value = t('register.required')
    return
  }

  if (!isValidEmail(email.value)) {
    error.value = t('validation.email')
    return
  }

  if (!isValidPassword(password.value)) {
    error.value = t('validation.password', {
      min: FIELD_LIMITS.password.min,
      max: FIELD_LIMITS.password.max,
    })
    return
  }

  if (!consent.value) {
    error.value = t('legal.consentRequired')
    return
  }

  loading.value = true
  error.value = ''

  try {
    await register({
      email: email.value.trim(),
      password: password.value,
      consent: consent.value,
      marketing: marketing.value,
    })
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/perfil'
    await navigateTo(redirect)
  }
  catch (e: unknown) {
    const msg = (e as { data?: { statusMessage?: string } })?.data?.statusMessage
    error.value = msg || t('register.error')
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
        {{ t('register.title') }}
      </h1>
      <p class="form-note mb-6">
        {{ t('register.subtitle') }}
      </p>

      <form class="space-y-4" @submit.prevent="onSubmit">
        <div>
          <label for="email" class="mb-1 block text-sm font-medium text-ink">
            {{ t('register.email') }}
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
            {{ t('register.password') }}
          </label>
          <input
            id="password"
            :value="password"
            type="password"
            autocomplete="new-password"
            required
            :minlength="FIELD_LIMITS.password.min"
            :maxlength="FIELD_LIMITS.password.max"
            class="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            :placeholder="t('register.passwordHint')"
            @input="onPasswordInput"
          >
          <p class="mt-1 text-xs text-gray-500">
            {{ t('validation.password', { min: FIELD_LIMITS.password.min, max: FIELD_LIMITS.password.max }) }}
          </p>
        </div>

        <PrivacyNoticeShort />

        <LegalConsent
          v-model:consent="consent"
          v-model:marketing="marketing"
          show-marketing
        />

        <p v-if="error" class="text-sm text-red-600">
          {{ error }}
        </p>

        <button
          type="submit"
          class="btn-primary w-full"
          :class="{ 'cursor-not-allowed opacity-60': loading || !consent }"
          :disabled="loading || !consent"
        >
          {{ loading ? t('register.submitting') : t('register.submit') }}
        </button>
      </form>

      <p class="mt-4 text-center text-sm text-gray-600">
        {{ t('register.hasAccount') }}
        <NuxtLink
          :to="typeof route.query.redirect === 'string'
            ? { path: '/login', query: { redirect: route.query.redirect } }
            : '/login'"
          class="font-medium text-brand hover:underline"
        >
          {{ t('nav.login') }}
        </NuxtLink>
      </p>

      <p class="mt-3 text-center text-xs text-gray-400">
        {{ t('register.note') }}
      </p>
    </div>
  </div>
</template>
