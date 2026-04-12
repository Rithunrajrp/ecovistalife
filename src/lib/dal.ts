import 'server-only'
import { cache } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// ============================================
// Types
// ============================================

export type UserRole = 'admin' | 'manager' | 'staff'

export interface PortalUser {
  id: string
  email: string
  full_name: string
  avatar_url: string | null
  phone: string | null
  role: UserRole
  department_id: string | null
  is_active: boolean
  last_login_at: string | null
  created_at: string
}

export interface SessionData {
  isAuth: true
  userId: string
  email: string
  role: UserRole
  portalUser: PortalUser
}

// ============================================
// Session Verification (cached per request)
// ============================================

export const verifySession = cache(async (): Promise<SessionData> => {
  const supabase = await createClient()

  // CRITICAL: Use getUser() not getSession() for security
  // getUser() validates the JWT with the auth server
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  // Get portal user profile with role
  const { data: portalUser, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError || !portalUser || !portalUser.is_active) {
    // Sign out and redirect if no valid profile
    await supabase.auth.signOut()
    redirect('/login?error=unauthorized')
  }

  return {
    isAuth: true,
    userId: user.id,
    email: user.email!,
    role: portalUser.role as UserRole,
    portalUser: portalUser as PortalUser,
  }
})

// ============================================
// Role-Based Access Control
// ============================================

export const requireRole = cache(async (allowedRoles: UserRole[]): Promise<SessionData> => {
  const session = await verifySession()

  if (!allowedRoles.includes(session.role)) {
    redirect('/dashboard?error=forbidden')
  }

  return session
})

// Admin only access
export const requireAdmin = () => requireRole(['admin'])

// Manager or Admin access
export const requireManagerOrAdmin = () => requireRole(['admin', 'manager'])

// ============================================
// Get Session (without redirect)
// ============================================

export const getSession = cache(async (): Promise<SessionData | null> => {
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  const { data: portalUser, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError || !portalUser || !portalUser.is_active) {
    return null
  }

  return {
    isAuth: true,
    userId: user.id,
    email: user.email!,
    role: portalUser.role as UserRole,
    portalUser: portalUser as PortalUser,
  }
})

// ============================================
// Permission Checks
// ============================================

export function canAccess(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  return requiredRoles.includes(userRole)
}

export function isAdmin(role: UserRole): boolean {
  return role === 'admin'
}

export function isManagerOrAbove(role: UserRole): boolean {
  return role === 'admin' || role === 'manager'
}
