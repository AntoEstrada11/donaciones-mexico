import type { SiteSettings } from '~/types'
import { DEFAULT_SITE_SETTINGS } from '~/utils/siteSettingsDefaults'

export function useSiteSettings() {
  return useAsyncData(
    'site-settings',
    () => $fetch<SiteSettings>('/api/site-settings'),
    {
      getCachedData: key => useNuxtData<SiteSettings>(key).data.value,
      default: () => ({
        ...DEFAULT_SITE_SETTINGS,
        updatedAt: new Date(0).toISOString(),
      }),
    },
  )
}
