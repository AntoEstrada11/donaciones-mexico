import type { AuthResponse, DonorProfile } from '~/types'

export interface AuthUser {
  id: string
  email: string
  name: string
  odooPartnerId: number
  profileComplete: boolean
}

function siteUrl() {
  const config = useRuntimeConfig()
  if (import.meta.client) {
    return window.location.origin
  }
  return String(config.public.siteUrl || 'http://localhost:3000')
}

export function useAuth() {
  const supabase = useSupabaseClient()
  const supabaseUser = useSupabaseUser()
  const user = useState<AuthUser | null>('auth-user', () => null)
  const authReady = useState('auth-ready', () => false)

  const isLoggedIn = computed(() => !!supabaseUser.value?.id && !!user.value)

  async function refreshProfile() {
    if (!supabaseUser.value?.id) {
      user.value = null
      return null
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', supabaseUser.value.id)
      .maybeSingle()

    if (error || !data) {
      user.value = {
        id: supabaseUser.value.id,
        email: supabaseUser.value.email || '',
        name: supabaseUser.value.email?.split('@')[0] || 'Donante',
        odooPartnerId: 0,
        profileComplete: false,
      }
      return null
    }

    user.value = {
      id: data.id,
      email: data.email,
      name: data.name || data.email.split('@')[0],
      odooPartnerId: data.odoo_partner_id || 0,
      profileComplete: Boolean(data.profile_complete),
    }

    return data
  }

  async function ensureBootstrap() {
    if (!supabaseUser.value) return
    try {
      await $fetch('/api/auth/bootstrap', { method: 'POST' })
      await refreshProfile()
    }
    catch {
      await refreshProfile()
    }
  }

  watch(supabaseUser, async (u) => {
    if (u) {
      await refreshProfile()
      if (user.value && !user.value.odooPartnerId) {
        await ensureBootstrap()
      }
    }
    else {
      user.value = null
    }
    authReady.value = true
  }, { immediate: true })

  async function register(payload: {
    email: string
    password: string
    name?: string
    emailRedirectPath?: string
  }) {
    const email = payload.email.trim().toLowerCase()
    const name = payload.name?.trim() || email.split('@')[0]
    const afterConfirm = safeRedirectPath(payload.emailRedirectPath, '/perfil')
    const callbackUrl = `${siteUrl()}/auth/callback?redirect=${encodeURIComponent(afterConfirm)}`

    const { data, error } = await supabase.auth.signUp({
      email,
      password: payload.password,
      options: {
        data: { name },
        emailRedirectTo: callbackUrl,
      },
    })

    if (error) {
      throw new Error(error.message)
    }

    if (data.session) {
      await ensureBootstrap()
    }

    return {
      needsEmailConfirmation: !data.session,
      email,
    }
  }

  async function login(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })

    if (error) {
      throw new Error(error.message)
    }

    await refreshProfile()
    if (user.value && !user.value.odooPartnerId) {
      await ensureBootstrap()
    }
  }

  async function logout() {
    await supabase.auth.signOut()
    user.value = null
  }

  async function requestPasswordReset(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${siteUrl()}/auth/actualizar-password`,
    })
    if (error) {
      throw new Error(error.message)
    }
  }

  async function updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      throw new Error(error.message)
    }
  }

  async function fetchProfile(): Promise<DonorProfile> {
    return await $fetch<DonorProfile>('/api/me')
  }

  async function updateProfile(payload: Partial<DonorProfile>) {
    const profile = await $fetch<DonorProfile>('/api/me', {
      method: 'PATCH',
      body: payload,
    })
    await refreshProfile()
    return profile
  }

  return {
    user,
    authReady,
    isLoggedIn,
    register,
    login,
    logout,
    requestPasswordReset,
    updatePassword,
    fetchProfile,
    updateProfile,
    refreshProfile,
  }
}

export type { AuthResponse }
