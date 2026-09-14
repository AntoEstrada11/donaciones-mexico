import type { Campaign } from '~/types'

export function useCampaigns() {
  return useAsyncData(
    'campaigns',
    () => $fetch<Campaign[]>('/api/campaigns'),
    { getCachedData: key => useNuxtData<Campaign[]>(key).data.value },
  )
}
