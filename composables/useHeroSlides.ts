import type { HeroSlide } from '~/types'

export function useHeroSlides() {
  return useAsyncData(
    'hero-slides',
    () => $fetch<HeroSlide[]>('/api/hero-slides'),
    { getCachedData: key => useNuxtData<HeroSlide[]>(key).data.value },
  )
}
