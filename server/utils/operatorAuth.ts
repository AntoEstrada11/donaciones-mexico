import type { AuthResponse } from '~/types'

function errorStatus(error: unknown): number | undefined {
  if (error && typeof error === 'object' && 'statusCode' in error) {
    const status = Number((error as { statusCode?: number }).statusCode)
    return Number.isFinite(status) ? status : undefined
  }
  return undefined
}

/** Login de operación vía Auth Hub. `null` si las credenciales no son de un operador. */
export async function tryOperatorAuth(email: string, password: string): Promise<AuthResponse | null> {
  if (!isAuthHubEnabled()) return null

  try {
    const hubTokens = await loginOnAuthHub(email, password)
    const me = await fetchAuthHubMe(hubTokens.access_token)
    if (!me.user.is_active) return null

    const role = mapHubRole({
      tokenRole: hubTokens.role,
      isSuperadmin: Boolean(me.user.is_superadmin),
      memberships: me.memberships || [],
      permissions: hubTokens.permissions,
    })
    if (role !== 'admin') return null

    const user = await upsertUserFromAuthHub({
      hubUserId: me.user.id,
      email: me.user.email,
      name: me.user.full_name,
      role: 'admin',
    })

    return {
      token: signToken({
        sub: user.id,
        email: user.email,
        name: user.name,
        role: 'admin',
      }),
      id: user.id,
      name: user.name,
      email: user.email,
      role: 'admin',
      profileComplete: user.profileComplete,
      emailVerified: true,
    }
  }
  catch (error) {
    const status = errorStatus(error)
    // Credenciales no de operador, o hub caído / red: seguir con login local.
    if (status === 401 || status === 403 || status === 502 || status === 503) {
      return null
    }
    if (status === undefined) {
      throwIfDatabaseError(error)
      return null
    }
    throw error
  }
}
