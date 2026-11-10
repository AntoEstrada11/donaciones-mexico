import type { AdminUserScope, DonorStatus, UserRole } from '~/types'

const SCOPES = new Set<AdminUserScope>(['donors', 'staff', 'staff_candidates'])

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const query = getQuery(event)

  const scopeRaw = String(query.scope || '')
  const scope = SCOPES.has(scopeRaw as AdminUserScope)
    ? (scopeRaw as AdminUserScope)
    : undefined

  const roleRaw = String(query.role || 'all')
  const statusRaw = String(query.status || 'all')
  const role = (['donor', 'admin', 'editor', 'all'].includes(roleRaw)
    ? roleRaw
    : 'all') as UserRole | 'all'
  const status = (['active', 'deactivated', 'all'].includes(statusRaw)
    ? statusRaw
    : 'all') as DonorStatus | 'all'

  return await listAdminUsers({
    q: typeof query.q === 'string' ? query.q : '',
    scope,
    role: scope ? 'all' : role,
    status,
    churchId: typeof query.churchId === 'string' && query.churchId ? query.churchId : 'all',
    page: query.page != null ? Number(query.page) : 1,
    pageSize: query.pageSize != null ? Number(query.pageSize) : 25,
  })
})
