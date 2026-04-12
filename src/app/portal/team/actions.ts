'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin, requireManagerOrAdmin } from '@/lib/dal'
import { randomBytes } from 'crypto'

export type FormState = {
  message?: string
  errors?: Record<string, string[]>
  success?: boolean
}

const inviteSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'manager', 'staff']),
  department_id: z.string().uuid().optional().or(z.literal('')),
})

const updateMemberSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  role: z.enum(['admin', 'manager', 'staff']),
  department_id: z.string().uuid().optional().or(z.literal('')),
  is_active: z.coerce.boolean(),
})

export async function inviteTeamMember(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await requireManagerOrAdmin()
  const supabase = await createClient()

  const rawData = {
    email: formData.get('email'),
    role: formData.get('role'),
    department_id: formData.get('department_id'),
  }

  const validated = inviteSchema.safeParse(rawData)

  if (!validated.success) {
    return {
      message: 'Please fix the errors below',
      errors: validated.error.flatten().fieldErrors,
    }
  }

  // Check if user already exists
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', validated.data.email)
    .single()

  if (existingProfile) {
    return { message: 'A user with this email already exists.' }
  }

  // Check if invitation already pending
  const { data: existingInvite } = await supabase
    .from('portal_invitations')
    .select('id')
    .eq('email', validated.data.email)
    .eq('status', 'pending')
    .single()

  if (existingInvite) {
    return { message: 'An invitation for this email is already pending.' }
  }

  // Only admins can create admin invites
  if (validated.data.role === 'admin' && session.role !== 'admin') {
    return { message: 'Only admins can invite other admins.' }
  }

  // Generate invitation token
  const token = randomBytes(32).toString('hex')
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7) // 7 days expiration

  const { department_id, ...inviteData } = validated.data

  const { error } = await supabase
    .from('portal_invitations')
    .insert({
      ...inviteData,
      department_id: department_id || null,
      token,
      expires_at: expiresAt.toISOString(),
      invited_by: session.userId,
    })

  if (error) {
    console.error('Error creating invitation:', error)
    return { message: 'Failed to create invitation. Please try again.' }
  }

  // TODO: Send invitation email with token
  // For now, just log the invite link
  console.log(`Invitation link: /accept-invite?token=${token}`)

  revalidatePath('/team')
  return {
    success: true,
    message: `Invitation sent to ${validated.data.email}. The invite link is: /accept-invite?token=${token}`
  }
}

export async function updateTeamMember(
  memberId: string,
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdmin()
  const supabase = await createClient()

  const rawData = {
    full_name: formData.get('full_name'),
    role: formData.get('role'),
    department_id: formData.get('department_id'),
    is_active: formData.get('is_active'),
  }

  const validated = updateMemberSchema.safeParse(rawData)

  if (!validated.success) {
    return {
      message: 'Please fix the errors below',
      errors: validated.error.flatten().fieldErrors,
    }
  }

  const { department_id, ...updateData } = validated.data

  const { error } = await supabase
    .from('profiles')
    .update({
      ...updateData,
      department_id: department_id || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', memberId)

  if (error) {
    console.error('Error updating team member:', error)
    return { message: 'Failed to update team member. Please try again.' }
  }

  revalidatePath('/team')
  revalidatePath(`/team/${memberId}`)
  redirect('/team')
}

export async function revokeInvitation(invitationId: string): Promise<FormState> {
  await requireManagerOrAdmin()
  const supabase = await createClient()

  const { error } = await supabase
    .from('portal_invitations')
    .update({ status: 'revoked' })
    .eq('id', invitationId)

  if (error) {
    console.error('Error revoking invitation:', error)
    return { message: 'Failed to revoke invitation. Please try again.' }
  }

  revalidatePath('/team')
  return { success: true, message: 'Invitation revoked successfully' }
}

export async function getDepartments() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('departments')
    .select('id, name')
    .order('name')

  return data || []
}
