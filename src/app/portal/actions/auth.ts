'use server'

import { z } from 'zod'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

// ============================================
// Schemas
// ============================================

const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const InviteSchema = z.object({
  email: z.string().email('Invalid email address'),
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['admin', 'manager', 'staff']),
  departmentId: z.string().uuid().optional().nullable(),
})

const AcceptInviteSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[0-9]/, 'Password must contain a number'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

// ============================================
// Types
// ============================================

export type FormState = {
  errors?: Record<string, string[]>
  message?: string
  success?: boolean
}

// ============================================
// Login Action
// ============================================

export async function login(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validated = LoginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  const supabase = await createClient()
  const { email, password } = validated.data

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { message: 'Invalid email or password' }
  }

  // Verify user has a portal profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, is_active')
    .eq('id', data.user.id)
    .single()

  if (!profile || !profile.is_active) {
    await supabase.auth.signOut()
    return { message: 'Account not authorized for portal access' }
  }

  // Update last login timestamp
  await supabase
    .from('profiles')
    .update({ last_login_at: new Date().toISOString() })
    .eq('id', data.user.id)

  redirect('/dashboard')
}

// ============================================
// Logout Action
// ============================================

export async function logout(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

// ============================================
// Invite User Action (Admin only)
// ============================================

export async function inviteUser(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const supabase = await createClient()

  // Verify current user is admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { message: 'Unauthorized' }
  }

  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!currentProfile || currentProfile.role !== 'admin') {
    return { message: 'Only admins can invite users' }
  }

  const validated = InviteSchema.safeParse({
    email: formData.get('email'),
    fullName: formData.get('fullName'),
    role: formData.get('role'),
    departmentId: formData.get('departmentId') || null,
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  const { email, fullName, role, departmentId } = validated.data

  // Check if user already exists
  const { data: existingUser } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single()

  if (existingUser) {
    return { message: 'A user with this email already exists' }
  }

  // Check for pending invitation
  const { data: existingInvite } = await supabase
    .from('portal_invitations')
    .select('id')
    .eq('email', email)
    .is('accepted_at', null)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (existingInvite) {
    return { message: 'An invitation is already pending for this email' }
  }

  // Generate invitation token
  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

  // Create invitation
  const { error: inviteError } = await supabase
    .from('portal_invitations')
    .insert({
      email,
      full_name: fullName,
      role,
      department_id: departmentId,
      invited_by: user.id,
      token,
      expires_at: expiresAt.toISOString(),
    })

  if (inviteError) {
    return { message: 'Failed to create invitation' }
  }

  // In production, you would send an email here
  // For now, we return success with the token (for testing)
  revalidatePath('/team')

  return {
    success: true,
    message: `Invitation sent to ${email}. Token: ${token.slice(0, 8)}...`,
  }
}

// ============================================
// Accept Invite Action
// ============================================

export async function acceptInvite(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validated = AcceptInviteSchema.safeParse({
    token: formData.get('token'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  const supabase = await createClient()
  const { token, password } = validated.data

  // Find and validate invitation
  const { data: invitation, error: inviteError } = await supabase
    .from('portal_invitations')
    .select('*')
    .eq('token', token)
    .is('accepted_at', null)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (inviteError || !invitation) {
    return { message: 'Invalid or expired invitation' }
  }

  // Create the user account
  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email: invitation.email,
    password,
    options: {
      data: {
        full_name: invitation.full_name,
        role: invitation.role,
      },
    },
  })

  if (signUpError || !authData.user) {
    return { message: signUpError?.message || 'Failed to create account' }
  }

  // Update profile with invitation data
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      full_name: invitation.full_name,
      role: invitation.role,
      department_id: invitation.department_id,
    })
    .eq('id', authData.user.id)

  if (profileError) {
    // Profile should have been auto-created by trigger
    // If it doesn't exist, create it manually
    await supabase.from('profiles').insert({
      id: authData.user.id,
      email: invitation.email,
      full_name: invitation.full_name,
      role: invitation.role,
      department_id: invitation.department_id,
    })
  }

  // Mark invitation as accepted
  await supabase
    .from('portal_invitations')
    .update({ accepted_at: new Date().toISOString() })
    .eq('id', invitation.id)

  redirect('/login?message=Account created successfully. Please log in.')
}

// ============================================
// Get Pending Invitations (Admin only)
// ============================================

export async function getPendingInvitations() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('portal_invitations')
    .select(`
      *,
      inviter:invited_by (full_name)
    `)
    .is('accepted_at', null)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })

  if (error) {
    return []
  }

  return data
}

// ============================================
// Revoke Invitation (Admin only)
// ============================================

export async function revokeInvitation(invitationId: string): Promise<FormState> {
  const supabase = await createClient()

  // Verify current user is admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { message: 'Unauthorized' }
  }

  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!currentProfile || currentProfile.role !== 'admin') {
    return { message: 'Only admins can revoke invitations' }
  }

  const { error } = await supabase
    .from('portal_invitations')
    .delete()
    .eq('id', invitationId)

  if (error) {
    return { message: 'Failed to revoke invitation' }
  }

  revalidatePath('/team')
  return { success: true, message: 'Invitation revoked' }
}
