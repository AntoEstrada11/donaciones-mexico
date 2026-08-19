<script setup lang="ts">
import type { Church } from '~/types'

const { t } = useI18n()
const config = useRuntimeConfig()

const search = ref('')
const coords = ref({
  latitude: config.public.defaultLatitude,
  longitude: config.public.defaultLongitude,
})

/**
 * La ubicación se pide solo si la persona lo solicita: las coordenadas salen
 * hacia el directorio externo, así que no las tomamos de forma silenciosa.
 */
const geoState = ref<'idle' | 'locating' | 'granted' | 'denied'>('idle')

function requestLocation() {
  if (!navigator.geolocation) {
    geoState.value = 'denied'
    return
  }

  geoState.value = 'locating'

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      coords.value = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      }
      geoState.value = 'granted'
    },
    () => {
      geoState.value = 'denied'
    },
    { timeout: 5000, maximumAge: 300000 },
  )
}

const { data, pending, error, refresh } = useChurches(coords)

const churches = computed<Church[]>(() => data.value?.churches ?? [])
const usingSample = computed(() => data.value?.source === 'sample')

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return churches.value
  return churches.value.filter(c =>
    c.name.toLowerCase().includes(q)
    || c.city.toLowerCase().includes(q)
    || c.state.toLowerCase().includes(q)
    || c.address.toLowerCase().includes(q),
  )
})
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-10 md:px-6">
    <header class="mb-8">
      <h1 class="section-title">
        {{ t('churches.title') }}
      </h1>
      <p class="mt-2 text-gray-600">
        {{ t('churches.subtitle') }}
      </p>
    </header>

    <div class="mb-6">
      <label for="church-search" class="sr-only">{{ t('churches.searchPlaceholder') }}</label>
      <input
        id="church-search"
        :value="search"
        type="search"
        :maxlength="FIELD_LIMITS.search.max"
        :placeholder="t('churches.searchPlaceholder')"
        class="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 md:max-w-md"
        @input="search = sanitizeSearchInput(($event.target as HTMLInputElement).value)"
      >
    </div>

    <div class="mb-8 rounded-lg border border-gray-200 bg-gray-50 p-4 md:max-w-2xl">
      <h2 class="text-sm font-semibold text-ink">
        {{ t('legal.geoTitle') }}
      </h2>
      <p class="mt-1 text-xs leading-relaxed text-gray-600">
        {{ t('legal.geoBody') }}
      </p>

      <button
        v-if="geoState === 'idle' || geoState === 'denied'"
        type="button"
        class="btn-secondary mt-3 px-4 py-2 text-xs"
        @click="requestLocation"
      >
        {{ t('legal.geoUse') }}
      </button>
      <p v-else-if="geoState === 'locating'" class="mt-3 text-xs text-gray-500">
        {{ t('legal.geoLocating') }}
      </p>
      <p v-else class="mt-3 text-xs font-medium text-green-700">
        {{ t('legal.geoActive') }}
      </p>

      <p v-if="geoState === 'denied'" class="mt-2 text-xs text-amber-700">
        {{ t('legal.geoDenied') }}
      </p>
    </div>

    <div v-if="pending" class="py-12 text-center text-gray-500">
      {{ t('common.loading') }}
    </div>

    <div v-else-if="error" class="py-12 text-center">
      <p class="text-red-600">
        {{ t('churches.loadError') }}
      </p>
      <button type="button" class="btn-secondary mt-4" @click="refresh()">
        {{ t('churches.retry') }}
      </button>
    </div>

    <template v-else>
      <p
        v-if="usingSample"
        class="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
      >
        {{ t('churches.sourceSample') }}
      </p>
      <p class="mb-6 text-sm text-gray-500">
        {{ t('churches.count', { count: filtered.length }) }}
      </p>

      <div
        v-if="filtered.length === 0"
        class="py-12 text-center text-gray-500"
      >
        {{ t('churches.noResults') }}
      </div>

      <div
        v-else
        class="grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        <ChurchCard
          v-for="church in filtered"
          :key="church.id"
          :church="church"
        />
      </div>
    </template>
  </div>
</template>
