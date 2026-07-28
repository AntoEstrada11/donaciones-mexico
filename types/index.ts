export interface Church {
  id: string
  name: string
  city: string
  state: string
  address: string
  slug: string
  distance?: number
  latitude?: number
  longitude?: number
  imageUrl?: string
  googleUrl?: string
  alias?: string
}

export interface Campaign {
  id: string
  name: string
  slug: string
  description: string
  type: string
}

export interface Donation {
  id: string
  userId: string
  churchId: string
  churchName: string | null
  campaignId: string
  campaignName: string | null
  amount: number
  currency: string
  status: 'paid' | 'pending' | 'failed' | 'cancelled'
  method: 'spei' | 'card'
  paymentReference: string | null
  createdAt: string
}

export interface AuthResponse {
  id: string
  email: string
  name: string
  odooPartnerId: number
  profileComplete: boolean
}

/** Perfil del donante (Supabase profiles + sync Odoo). */
export interface DonorProfile {
  id: string
  odooPartnerId: number
  name: string
  email: string
  phone: string | null
  street: string | null
  city: string | null
  state: string | null
  zip: string | null
  rfc: string | null
  profileComplete: boolean
  source: 'supabase' | 'odoo' | 'mock'
}

export interface ChurchApiItem {
  id: number
  distance: number
  latitude: number
  longitude: number
  name: string
  alias: string | null | false
  reference: string | null
  address: string
  image_url: string
  google_url: string
  click_2_call: string
  schedules: Record<string, string[]>
}

export interface ChurchesApiResponse {
  results: ChurchApiItem[]
  pagination: {
    current_page: number
    per_page: number
    total_records: number
    total_pages: number
    has_next: boolean
    has_prev: boolean
    next_page: number | null
    prev_page: number | null
  }
}
