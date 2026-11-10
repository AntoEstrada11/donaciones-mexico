<script setup lang="ts">
defineProps<{
  name: string
}>()
</script>

<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.75"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <template v-if="name === 'home'">
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V20h14V9.5" />
    </template>
    <template v-else-if="name === 'bank'">
      <path d="M3 10h18" />
      <path d="M5 10v8M9 10v8M15 10v8M19 10v8" />
      <path d="M2 18h20" />
      <path d="M12 3 2 9h20L12 3Z" />
    </template>
    <template v-else-if="name === 'alert'">
      <path d="M12 3 2 20h20L12 3Z" />
      <path d="M12 9v5" />
      <path d="M12 17h.01" />
    </template>
    <template v-else-if="name === 'heart'">
      <path d="M19.5 5.5a4.5 4.5 0 0 0-6.36 0L12 6.64 10.86 5.5A4.5 4.5 0 1 0 4.5 11.86L12 19.5l7.5-7.64a4.5 4.5 0 0 0 0-6.36Z" />
    </template>
    <template v-else-if="name === 'flag'">
      <path d="M5 3v18" />
      <path d="M5 5h11l-1.5 3.5L16 12H5" />
    </template>
    <template v-else-if="name === 'users'">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </template>
    <template v-else-if="name === 'shield'">
      <path d="M12 3 4 6v6c0 5 3.4 7.8 8 9 4.6-1.2 8-4 8-9V6l-8-3Z" />
    </template>
    <template v-else-if="name === 'palette'">
      <path d="M12 3a9 9 0 1 0 0 18h1.5a2.5 2.5 0 0 0 0-5H12" />
      <circle cx="7.5" cy="10.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="10" cy="7.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="14" cy="7.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="16.5" cy="10.5" r="1" fill="currentColor" stroke="none" />
    </template>
    <template v-else-if="name === 'search'">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </template>
    <template v-else-if="name === 'bell'">
      <path d="M6 9a6 6 0 1 1 12 0c0 7 3 7 3 7H3s3 0 3-7" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </template>
    <template v-else-if="name === 'menu'">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </template>
    <template v-else-if="name === 'chevron-left'">
      <path d="m15 6-6 6 6 6" />
    </template>
    <template v-else-if="name === 'chevron-right'">
      <path d="m9 6 6 6-6 6" />
    </template>
    <template v-else-if="name === 'external'">
      <path d="M14 4h6v6" />
      <path d="M10 14 20 4" />
      <path d="M20 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h5" />
    </template>
    <template v-else>
      <circle cx="12" cy="12" r="8" />
    </template>
  </svg>
</template>
