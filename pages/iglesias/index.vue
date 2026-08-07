<script setup lang="ts">
import type { Church } from '~/types'
import { mapChurch } from '~/utils/mapChurch'

const { t } = useI18n()
const config = useRuntimeConfig()

const search = ref('')
const coords = ref({
  latitude: config.public.defaultLatitude,
  longitude: config.public.defaultLongitude,
})

onMounted(() => {
  if (!navigator.geolocation) return

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      coords.value = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      }
    },
    () => {},
    { timeout: 5000, maximumAge: 300000 },
  )
})

const { data, pending, error } = useChurches(coords)

const churches = computed<Church[]>(() =>
  (data.value?.results ?? []).map(mapChurch),
)

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

    <div class="mb-8">
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

    <div v-if="pending" class="py-12 text-center text-gray-500">
      {{ t('common.loading') }}
    </div>

    <div v-else-if="error" class="py-12 text-center text-red-600">
      {{ t('common.error') }}
    </div>

    <template v-else>
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
