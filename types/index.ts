export type UserRole = 'donor' | 'admin'

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
  id: string
  name: string
  email: string
  role: UserRole
  profileComplete: boolean
}

/** Cuenta de acceso del donante, tal como vive en la tabla `users`. */
export interface AppUser {
  id: string
  email: string
  name: string
  passwordHash: string
  role: UserRole
  profileComplete: boolean
  createdAt: string
}

/** Perfil que ve y edita el donante (tablas `users` + `donor_profiles`). */
export interface DonorProfile {
  id: string
  name: string
  email: string
  phone: string | null
  wantsReceipt: boolean
  street: string | null
  city: string | null
  state: string | null
  zip: string | null
  rfc: string | null
  profileComplete: boolean
}

export type ConsentType = 'privacy_notice' | 'sensitive_data' | 'marketing'

/** Evidencia de consentimiento tal como se expone al titular. */
export interface ConsentRecord {
  id: string
  type: ConsentType
  granted: boolean
  noticeVersion: string
  createdAt: string
}

/** Copia completa de los datos del titular (derecho de acceso). */
export interface DataExport {
  exportedAt: string
  noticeVersion: string
  account: {
    id: string
    email: string
    name: string
    role: UserRole
    createdAt: string
  }
  profile: {
    phone: string | null
    wantsReceipt: boolean
    street: string | null
    city: string | null
    state: string | null
    zip: string | null
    rfc: string | null
  }
  donations: Donation[]
  consents: ConsentRecord[]
}

export interface HeroSlide {
  id: string
  url: string
  alt: string
  sortOrder: number
  active: boolean
  createdAt: string
}

export interface AdminStats {
  users: number
  admins: number
  donationsByStatus: Record<Donation['status'], number>
  activeSlides: number
}

export interface AdminUserRow {
  id: string
  email: string
  name: string
  role: UserRole
  profileComplete: boolean
  createdAt: string
}

export interface AdminDonationRow extends Donation {
  userEmail: string | null
  userName: string | null
  campaignName: string | null
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
  pagination?: {
    current_page: number
    per_page: number
    total_records: number
    total_pages: number
    has_next: boolean
    has_prev: boolean
    next_page: number | null
    prev_page: number | null
  } | null
}

export type ChurchesSource = 'odoo' | 'sample'

export interface ChurchesListResponse {
  churches: Church[]
  source: ChurchesSource
}
