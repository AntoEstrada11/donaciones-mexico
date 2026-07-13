<script setup lang="ts">
import type { Church } from '~/types'

const props = defineProps<{
  church: Church
}>()

const { t } = useI18n()
const { selectChurch } = useDonation()

function onSelect() {
  selectChurch(props.church)
  navigateTo('/donaciones')
}
</script>

<template>
  <article class="card flex h-full flex-col overflow-hidden p-0">
    <div class="relative h-44 w-full shrink-0 overflow-hidden bg-brand-light">
      <img
        v-if="church.imageUrl"
        :src="church.imageUrl"
        :alt="church.name"
        class="absolute inset-0 h-full w-full object-cover object-center"
        loading="lazy"
      >
      <div
        v-else
        class="flex h-full w-full items-center justify-center text-brand/40"
        aria-hidden="true"
      >
        <svg class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      </div>
      <span
        v-if="church.distance != null"
        class="absolute right-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-medium text-ink shadow-sm"
      >
        {{ church.distance.toFixed(1) }} km
      </span>
    </div>

    <div class="flex flex-1 flex-col p-5">
      <div class="mb-3">
        <h3 class="line-clamp-2 min-h-[3.25rem] text-lg font-semibold leading-snug text-ink">
          {{ church.name }}
        </h3>
        <p class="mt-1 truncate text-sm text-gray-500">
          {{ church.city }}, {{ church.state }}
        </p>
      </div>

      <p class="mb-4 line-clamp-3 flex-1 text-sm leading-relaxed text-gray-600">
        {{ church.address }}
      </p>

      <button
        type="button"
        class="btn-primary mt-auto w-full"
        @click="onSelect"
      >
        {{ t('churches.select') }}
      </button>
    </div>
  </article>
</template>
