<script setup lang="ts">
/**
 * Casilla de consentimiento expreso para datos sensibles.
 * Nunca debe venir premarcada: la ley exige manifestación de voluntad.
 */
const consent = defineModel<boolean>('consent', { required: true })
const marketing = defineModel<boolean>('marketing', { default: false })

withDefaults(defineProps<{ showMarketing?: boolean }>(), {
  showMarketing: false,
})

const { t } = useI18n()
</script>

<template>
  <div class="space-y-3">
    <label class="flex cursor-pointer items-start gap-3 text-sm text-gray-700">
      <input
        v-model="consent"
        type="checkbox"
        required
        class="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-brand focus:ring-2 focus:ring-brand/30"
      >
      <span>
        {{ t('legal.consentLabel') }}
        <NuxtLink
          to="/privacidad"
          target="_blank"
          class="font-medium text-brand hover:underline"
          @click.stop
        >
          {{ t('legal.consentLinkText') }}
        </NuxtLink>
      </span>
    </label>

    <label v-if="showMarketing" class="flex cursor-pointer items-start gap-3 text-sm text-gray-600">
      <input
        v-model="marketing"
        type="checkbox"
        class="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-brand focus:ring-2 focus:ring-brand/30"
      >
      <span>
        {{ t('legal.marketingLabel') }}
        <span class="block text-xs text-gray-400">{{ t('legal.marketingNote') }}</span>
      </span>
    </label>
  </div>
</template>
