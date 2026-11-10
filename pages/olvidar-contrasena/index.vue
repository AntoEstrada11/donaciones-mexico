<script setup lang="ts">
import { isValidEmail, sanitizeEmailInput } from '~/utils/fieldLimits'

const { t } = useI18n()
const email = ref('')
const loading = ref(false)
const done = ref(false)
const error = ref('')

async function onSubmit() {
  error.value = ''
  const value = sanitizeEmailInput(email.value)
  if (!isValidEmail(value)) {
    error.value = t('forgotPassword.invalidEmail')
    return
  }
  loading.value = true
  try {
    await $fetch('/api/auth/forgot-password', {
      method: 'POST',
      body: { email: value },
    })
    done.value = true
  }
  catch (e: unknown) {
    const msg = (e as { data?: { statusMessage?: string } })?.data?.statusMessage
    error.value = msg || t('forgotPassword.error')
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-lg px-4 py-16">
    <form class="card space-y-4" @submit.prevent="onSubmit">
      <h1 class="text-xl font-bold text-ink">
        {{ t('forgotPassword.title') }}
      </h1>
      <p class="text-sm text-gray-600">
        {{ t('forgotPassword.subtitle') }}
      </p>
      <template v-if="done">
        <p class="text-sm text-green-700">
          {{ t('forgotPassword.done') }}
        </p>
        <NuxtLink to="/login" class="text-sm font-medium text-brand hover:underline">
          {{ t('nav.login') }}
        </NuxtLink>
      </template>
      <template v-else>
        <label class="block text-sm">
          <span class="mb-1 block font-medium text-ink">{{ t('login.email') }}</span>
          <input
            v-model="email"
            type="email"
            required
            class="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm"
            :placeholder="t('login.emailPlaceholder')"
          >
        </label>
        <p v-if="error" class="text-sm text-red-600">
          {{ error }}
        </p>
        <button type="submit" class="btn-primary w-full" :disabled="loading">
          {{ loading ? t('forgotPassword.submitting') : t('forgotPassword.submit') }}
        </button>
      </template>
    </form>
  </div>
</template>
