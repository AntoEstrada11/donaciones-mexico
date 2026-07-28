<script setup lang="ts">
import { ApiReference } from '@scalar/api-reference'
import '@scalar/api-reference/style.css'

definePageMeta({
  layout: false,
})

const config = useRuntimeConfig()
const enabled = computed(() => config.public.apiDocsEnabled !== false)

useSeoMeta({
  title: 'API Docs — Donaciones México',
  robots: 'noindex, nofollow',
})

const configuration = {
  url: '/openapi.yaml',
}
</script>

<template>
  <div v-if="!enabled" class="flex min-h-screen items-center justify-center bg-surface px-4">
    <div class="max-w-md text-center">
      <h1 class="text-xl font-bold text-ink">
        Documentación de API desactivada
      </h1>
      <p class="mt-2 text-sm text-gray-600">
        Active <code class="rounded bg-gray-100 px-1">NUXT_PUBLIC_API_DOCS=true</code> para habilitarla.
      </p>
      <NuxtLink to="/" class="btn-primary mt-6 inline-flex">
        Ir al inicio
      </NuxtLink>
    </div>
  </div>

  <div v-else class="relative min-h-screen bg-white">
    <a
      href="/"
      class="fixed bottom-4 left-4 z-[100] rounded-md bg-brand px-3 py-2 text-xs font-semibold text-white hover:bg-brand-dark"
    >
      ← Sitio
    </a>
    <ClientOnly>
      <ApiReference :configuration="configuration" />
      <template #fallback>
        <p class="p-8 text-sm text-gray-500">
          Cargando documentación…
        </p>
      </template>
    </ClientOnly>
  </div>
</template>
