<script setup lang="ts">
const { t } = useI18n()
const { register, isLoggedIn } = useAuth()
const route = useRoute()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

onMounted(() => {
  if (isLoggedIn.value) {
    navigateTo('/perfil')
  }
})

async function onSubmit() {
  if (!email.value.trim() || !password.value.trim()) {
    error.value = t('register.required')
    return
  }

  loading.value = true
  error.value = ''

  try {
    await register({
      email: email.value.trim(),
      password: password.value,
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
          <input
            id="password"
            v-model="password"
            type="password"
            autocomplete="new-password"
            required
            minlength="6"
            class="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            :placeholder="t('register.passwordHint')"
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
          {{ loading ? t('register.submitting') : t('register.submit') }}
        </button>
      </form>

      <p class="mt-4 text-center text-sm text-gray-600">
        {{ t('register.hasAccount') }}
        <NuxtLink to="/login" class="font-medium text-brand hover:underline">
          {{ t('nav.login') }}
        </NuxtLink>
      </p>

      <p class="mt-3 text-center text-xs text-gray-400">
        {{ t('register.note') }}
      </p>
    </div>
  </div>
</template>
