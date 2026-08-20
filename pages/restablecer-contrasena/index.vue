<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()

const token = computed(() => String(route.query.token || ''))
const password = ref('')
const confirm = ref('')
const loading = ref(false)
const error = ref('')
const done = ref(false)

function onPasswordInput(event: Event) {
  password.value = sanitizePasswordInput((event.target as HTMLInputElement).value)
}

function onConfirmInput(event: Event) {
  confirm.value = sanitizePasswordInput((event.target as HTMLInputElement).value)
}

async function onSubmit() {
  if (!token.value) {
    error.value = t('passwordReset.missingToken')
    return
  }
  if (!password.value) {
    error.value = t('passwordReset.required')
    return
  }
  if (password.value !== confirm.value) {
    error.value = t('passwordReset.mismatch')
    return
  }

  loading.value = true
  error.value = ''

  try {
    await $fetch('/api/auth/password-reset', {
      method: 'POST',
      body: { token: token.value, password: password.value },
    })
    done.value = true
  }
  catch (e: unknown) {
    const msg = (e as { data?: { statusMessage?: string } })?.data?.statusMessage
    error.value = msg || t('passwordReset.error')
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
      <template v-if="done">
        <h1 class="section-title mb-2">
          {{ t('passwordReset.doneTitle') }}
        </h1>
        <p class="mb-6 text-sm text-gray-600">
          {{ t('passwordReset.doneBody') }}
        </p>
        <NuxtLink to="/login" class="btn-primary inline-flex">
          {{ t('nav.login') }}
        </NuxtLink>
      </template>

      <template v-else>
        <h1 class="section-title mb-2">
          {{ t('passwordReset.title') }}
        </h1>
        <p class="form-note mb-6">
          {{ t('passwordReset.subtitle') }}
        </p>

        <form class="space-y-4" @submit.prevent="onSubmit">
          <div>
            <label for="new-password" class="mb-1 block text-sm font-medium text-ink">
              {{ t('passwordReset.password') }}
            </label>
            <input
              id="new-password"
              :value="password"
              type="password"
              autocomplete="new-password"
              required
              :maxlength="FIELD_LIMITS.password.max"
              class="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              @input="onPasswordInput"
            >
          </div>

          <div>
            <label for="confirm-password" class="mb-1 block text-sm font-medium text-ink">
              {{ t('passwordReset.confirm') }}
            </label>
            <input
              id="confirm-password"
              :value="confirm"
              type="password"
              autocomplete="new-password"
              required
              :maxlength="FIELD_LIMITS.password.max"
              class="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              @input="onConfirmInput"
            >
          </div>

          <p v-if="error" class="text-sm text-red-600">
            {{ error }}
          </p>

          <button
            type="submit"
            class="btn-primary w-full"
            :class="{ 'cursor-not-allowed opacity-60': loading || !token }"
            :disabled="loading || !token"
          >
            {{ loading ? t('passwordReset.submitting') : t('passwordReset.submit') }}
          </button>
        </form>
      </template>
    </div>
  </div>
</template>
