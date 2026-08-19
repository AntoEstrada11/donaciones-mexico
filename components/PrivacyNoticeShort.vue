<script setup lang="ts">
/**
 * Aviso de privacidad simplificado. La ley exige mostrarlo en el momento
 * en que se recaban los datos, no solo enlazarlo desde el pie de página.
 */
const { t } = useI18n()
</script>

<template>
  <aside class="rounded-lg border border-gray-200 bg-gray-50 p-4">
    <h2 class="mb-1 text-xs font-bold uppercase tracking-wider text-brand">
      {{ t('legal.shortTitle') }}
    </h2>
    <p class="text-xs leading-relaxed text-gray-600">
      {{ t('legal.shortBody', { responsable: LEGAL.razonSocial }) }}
    </p>
    <NuxtLink to="/privacidad" class="mt-2 inline-block text-xs font-medium text-brand hover:underline">
      {{ t('legal.shortLink') }} →
    </NuxtLink>
  </aside>
</template>
