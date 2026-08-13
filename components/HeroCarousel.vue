<script setup lang="ts">
import type { HeroSlide } from '~/types'

const props = defineProps<{
  slides: HeroSlide[]
}>()

const activeIndex = ref(0)
let timer: ReturnType<typeof setInterval> | undefined

const hasSlides = computed(() => props.slides.length > 0)

function clearTimer() {
  if (timer) {
    clearInterval(timer)
    timer = undefined
  }
}

function next() {
  if (props.slides.length < 2) return
  activeIndex.value = (activeIndex.value + 1) % props.slides.length
}

function startTimer() {
  clearTimer()
  const reduceMotion = import.meta.client
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!reduceMotion && props.slides.length > 1) {
    timer = setInterval(next, 7000)
  }
}

onMounted(startTimer)

onBeforeUnmount(clearTimer)

watch(
  () => props.slides.length,
  (length) => {
    if (activeIndex.value >= length) activeIndex.value = 0
    startTimer()
  },
)
</script>

<template>
  <div class="absolute inset-0 overflow-hidden bg-brand" aria-hidden="true">
    <template v-if="hasSlides">
      <div
        v-for="(slide, index) in slides"
        :key="slide.id"
        class="hero-slide absolute inset-0"
        :class="{ 'hero-slide--active': index === activeIndex }"
      >
        <img
          :src="slide.url"
          :alt="slide.alt || ''"
          class="hero-slide__img h-full w-full object-cover"
          :class="{ 'hero-slide__img--active': index === activeIndex }"
        >
      </div>
    </template>

    <!-- Sin fotos: bloque de marca. Con fotos: velo suave para leer el texto sin tapar la imagen. -->
    <template v-if="hasSlides">
      <div class="absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-transparent" />
      <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/15" />
      <div class="absolute inset-0 bg-brand/20" />
    </template>
    <div
      v-else
      class="absolute inset-0 bg-brand"
    />
  </div>
</template>

<style scoped>
.hero-slide {
  opacity: 0;
  transition: opacity 1.2s ease-in-out;
}

.hero-slide--active {
  opacity: 1;
}

.hero-slide__img {
  transform: scale(1);
}

.hero-slide__img--active {
  animation: hero-kenburns 7s ease-out forwards;
}

@keyframes hero-kenburns {
  from {
    transform: scale(1);
  }
  to {
    transform: scale(1.06);
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-slide {
    transition: none;
  }

  .hero-slide__img--active {
    animation: none;
  }
}
</style>
