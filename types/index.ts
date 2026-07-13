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
  churchId: string
  campaignId: string
  amount: number
  currency: string
  status: 'paid' | 'pending' | 'failed' | 'cancelled'
  method: string
  createdAt: string
}

export interface AuthResponse {
  token: string
  name: string
  email: string
  odooPartnerId: number
  profileComplete: boolean
}

/** Usuario de la app (no es usuario de Odoo). El id es el correo. */
export interface AppUser {
  id: string
  email: string
  name: string
  phone?: string
  passwordHash: string
  odooPartnerId: number
  profileComplete: boolean
  createdAt: string
}

/** Perfil público que ve el donante (datos de res.partner). */
export interface DonorProfile {
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
  source: 'odoo' | 'mock'
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