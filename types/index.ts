/** `admin` = panel completo; `editor` = solo Personalizar (carrusel/pie). */
export type UserRole = 'donor' | 'admin' | 'editor'

/** Alcance del listado en `/api/admin/users`. */
export type AdminUserScope = 'donors' | 'staff' | 'staff_candidates'
export type DonorStatus = 'active' | 'deactivated'
export type DonorComplianceStatus = 'rapid' | 'cfdi' | 'pld_pending' | 'sat_report'

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

/** Campaña / tipo de donación en panel admin (incluye vigencia). */
export interface AdminCampaign extends Campaign {
  sortOrder: number
  active: boolean
  startsAt: string | null
  endsAt: string | null
}

export type DonorRequestType = 'identity' | 'fiscal' | 'email_verify'
export type DonorRequestStatus = 'open' | 'resolved' | 'cancelled'

export interface DonorRequest {
  id: string
  type: DonorRequestType
  status: DonorRequestStatus
  sentAt: string | null
  resolvedAt: string | null
  createdAt: string
}

export type DonationMethod = 'spei' | 'card' | 'paypal'

export interface Donation {
  id: string
  churchId: string
  churchName?: string | null
  campaignId: string
  campaignName?: string | null
  amount: number
  currency: string
  status: 'paid' | 'pending' | 'failed' | 'cancelled' | 'refunded'
  method: DonationMethod
  createdAt: string
  provider?: PaymentProvider | null
  providerReference?: string | null
  providerPaymentId?: string | null
  paidAt?: string | null
}

export type PaymentProvider = 'mercadopago' | 'paypal' | 'spei_manual'
export type PaymentMode = 'test' | 'live'

/** Preferencias de cobro editables en admin (sin secretos). */
export interface PaymentSettings {
  cardProvider: PaymentProvider
  mode: PaymentMode
  cardEnabled: boolean
  paypalEnabled: boolean
  speiManualEnabled: boolean
  updatedAt: string
  /** Indicadores de credenciales presentes en env (nunca los valores). */
  credentials: {
    mercadopago: boolean
    paypal: boolean
  }
}

/** Métodos disponibles para el formulario de donación. */
export interface PaymentMethodsPublic {
  spei: boolean
  card: boolean
  paypal: boolean
  mode: PaymentMode
}

export interface DonationCreateResponse {
  donation: Donation
  checkoutUrl: string | null
  uma?: UmaSnapshot
}

export interface UmaSnapshot {
  paidInWindow: number
  pldThreshold: number
  satThreshold: number
  status: DonorComplianceStatus
}

export interface AuthResponse {
  token: string
  id: string
  name: string
  email: string
  role: UserRole
  profileComplete: boolean
  emailVerified: boolean
  /** Solo en desarrollo / sin SMTP: enlace de verificación. */
  verifyUrl?: string
}

/** Cuenta de acceso del donante, tal como vive en la tabla `users`. */
export interface AppUser {
  id: string
  email: string
  name: string
  passwordHash: string
  role: UserRole
  status: DonorStatus
  profileComplete: boolean
  emailVerifiedAt: string | null
  createdAt: string
}

export type RecurringFrequency = 'weekly' | 'biweekly' | 'monthly'
export type RecurringStatus = 'active' | 'paused' | 'cancelled' | 'pending_setup'

export interface RecurringDonation {
  id: string
  churchId: string
  churchName: string | null
  campaignId: string
  amount: number
  currency: string
  frequency: RecurringFrequency
  method: DonationMethod
  status: RecurringStatus
  nextChargeAt: string | null
  createdAt: string
}

export type CfdiInvoiceStatus = 'pending_stamp' | 'stamped' | 'failed' | 'cancelled'

export interface CfdiInvoice {
  id: string
  donationId: string
  status: CfdiInvoiceStatus
  uuid: string | null
  errorCode: string | null
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
  colony: string | null
  rfc: string | null
  fiscalName: string | null
  taxRegime: string | null
  cfdiUse: string | null
  complianceStatus: DonorComplianceStatus
  identityVerifiedAt: string | null
  homeChurchId: string | null
  homeChurchName: string | null
  profileComplete: boolean
}

export type IdentitySide = 'front' | 'back'

export interface IdentityStatus {
  front: boolean
  back: boolean
  complete: boolean
}

export type ConsentType = 'privacy_notice' | 'sensitive_data' | 'marketing' | 'identity_document'

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
    colony: string | null
    rfc: string | null
    fiscalName: string | null
    taxRegime: string | null
    cfdiUse: string | null
    complianceStatus: DonorComplianceStatus
    identityVerifiedAt: string | null
    homeChurchId: string | null
    homeChurchName: string | null
  }
  identity: IdentityStatus
  /** Imágenes INE en base64 (derecho de acceso); no se listan en otras APIs. */
  identityFiles: Array<{ side: IdentitySide, mime: string, base64: string }>
  donations: Donation[]
  consents: ConsentRecord[]
  /** Solicitudes de cumplimiento enviadas por operadores (sin cuerpo de correo). */
  requests: DonorRequest[]
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
  pldPending: number
  satReport: number
  speiPending: number
}

export interface AdminUserRow {
  id: string
  email: string
  name: string
  role: UserRole
  status: DonorStatus
  profileComplete: boolean
  emailVerified: boolean
  createdAt: string
  statusChangedAt: string | null
  statusChangedByName: string | null
  homeChurchId: string | null
  homeChurchName: string | null
}

export interface AdminUsersPage {
  items: AdminUserRow[]
  total: number
  page: number
  pageSize: number
}

export interface AdminDonationRow extends Donation {
  userId: string | null
  userEmail: string | null
  userName: string | null
  campaignName: string | null
  campaignType: string | null
  churchName: string | null
}

/** Ficha operativa 360° del donante (solo panel admin). */
export interface AdminDonorDetail {
  id: string
  email: string
  name: string
  role: UserRole
  status: DonorStatus
  profileComplete: boolean
  emailVerified: boolean
  createdAt: string
  profile: {
    phone: string | null
    wantsReceipt: boolean
    street: string | null
    city: string | null
    state: string | null
    zip: string | null
    colony: string | null
    rfc: string | null
    fiscalName: string | null
    taxRegime: string | null
    cfdiUse: string | null
    complianceStatus: DonorComplianceStatus
    identityVerifiedAt: string | null
    homeChurchId: string | null
    homeChurchName: string | null
  } | null
  identity: IdentityStatus
  uma: UmaSnapshot
  donations: AdminDonationRow[]
  recurring: RecurringDonation[]
  requests: DonorRequest[]
  totals: {
    paidCount: number
    paidAmount: number
    pendingCount: number
    pendingAmount: number
  }
}

/** Alerta de umbral PLD / aviso SAT para seguimiento admin. */
export interface AdminComplianceAlert {
  userId: string
  name: string
  email: string
  status: DonorStatus
  complianceStatus: Extract<DonorComplianceStatus, 'pld_pending' | 'sat_report'>
  paidInWindow: number
  pldThreshold: number
  satThreshold: number
  identityComplete: boolean
  wantsReceipt: boolean
  rfc: string | null
  lastDonationAt: string | null
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

/** Contacto institucional y datos SPEI editables desde el admin. */
export interface SiteSettings {
  contactPhone: string
  contactEmail: string
  speiBank: string
  speiBeneficiary: string
  speiClabe: string
  speiConcept: string
  updatedAt: string
}
