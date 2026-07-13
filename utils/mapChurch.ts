import type { Church, ChurchApiItem } from '~/types'

function parseCityState(address: string) {
  const parts = address.split(',').map(part => part.trim())
  const state = parts.at(-3) ?? ''
  const city = parts.at(-4) ?? parts.at(-3) ?? ''
  return { city, state }
}

export function mapChurch(raw: ChurchApiItem): Church {
  const { city, state } = parseCityState(raw.address)

  return {
    id: String(raw.id),
    name: raw.name,
    city,
    state,
    address: raw.address,
    slug: typeof raw.alias === 'string'
      ? raw.alias.toLowerCase().replace(/\s+/g, '-')
      : String(raw.id),
    distance: raw.distance,
    latitude: raw.latitude,
    longitude: raw.longitude,
    imageUrl: raw.image_url,
    googleUrl: raw.google_url,
    alias: typeof raw.alias === 'string' ? raw.alias : undefined,
  }
}
