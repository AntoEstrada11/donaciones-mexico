<script setup lang="ts">
definePageMeta({
  middleware() {
    return navigateTo('/login?redirect=/admin')
  },
})
</script>

<template>
  <div />
</template>
