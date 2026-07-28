<script setup lang="ts">
const { t } = useI18n()
const { updatePassword } = useAuth()
const supabase = useSupabaseClient()
const route = useRoute()

const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref('')
const success = ref(false)
const ready = ref(false)
const checking = ref(true)

let unsubscribe: (() => void) | undefined

onMounted(async () => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'PASSWORD_RECOVERY' || (session && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION'))) {
      ready.value = Boolean(session)
      if (session) error.value = ''
    }
  })
  unsubscribe = () => subscription.unsubscribe()

  try {
    const code = typeof route.query.code === 'string' ? route.query.code : null
    if (code) {
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      if (exchangeError) throw exchangeError
    }

    const { data } = await supabase.auth.getSession()
    if (data.session) {
      ready.value = true
      return
    }

    await new Promise(resolve => setTimeout(resolve, 500))
    const again = await supabase.auth.getSession()
    ready.value = Boolean(again.data.session)
    if (!ready.value) {
      error.value = t('reset.invalidLink')
    }
  }
  catch (e: unknown) {
    error.value = (e as Error)?.message || t('reset.invalidLink')
  }
  finally {
    checking.value = false
  }
})

onUnmounted(() => {
  unsubscribe?.()
})

async function onSubmit() {
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

  try {
    await updatePassword(password.value)
    success.value = true
    setTimeout(() => navigateTo('/perfil'), 1500)
  }
  catch (e: unknown) {
    error.value = (e as Error)?.message || t('reset.updateError')
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-md px-4 py-10 md:px-6">
    <div class="card">
      <h1 class="section-title mb-2">
        {{ t('reset.updateTitle') }}
      </h1>
      <p class="mb-6 text-sm text-gray-600">
        {{ t('reset.updateSubtitle') }}
      </p>

      <div v-if="checking" class="text-sm text-gray-500">
        {{ t('common.loading') }}
      </div>

      <div v-else-if="success" class="rounded-md bg-green-50 px-4 py-3 text-sm text-green-800">
        {{ t('reset.updated') }}
      </div>

      <form v-else-if="ready" class="space-y-4" @submit.prevent="onSubmit">
        <div>
          <label for="password" class="mb-1 block text-sm font-medium text-ink">
            {{ t('reset.newPassword') }}
          </label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            minlength="8"
            autocomplete="new-password"
            class="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          >
        </div>
        <div>
          <label for="confirm" class="mb-1 block text-sm font-medium text-ink">
            {{ t('register.confirmPassword') }}
          </label>
          <input
            id="confirm"
            v-model="confirmPassword"
            type="password"
            required
            minlength="8"
            autocomplete="new-password"
            class="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          >
        </div>

        <p v-if="error" class="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {{ error }}
        </p>

        <button type="submit" class="btn-primary w-full" :disabled="loading">
          {{ loading ? t('reset.updating') : t('reset.updateSubmit') }}
        </button>
      </form>

      <p v-else class="text-sm text-red-700">
        {{ error || t('reset.invalidLink') }}
        <NuxtLink to="/recuperar" class="ml-1 font-medium text-brand hover:underline">
          {{ t('reset.tryAgain') }}
        </NuxtLink>
      </p>
    </div>
  </div>
</template>
