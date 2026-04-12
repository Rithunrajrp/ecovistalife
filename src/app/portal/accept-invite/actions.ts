'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

export type FormState = {
  message?: string
  errors?: Record<string, string[]>
  success?: boolean
}

const acceptInviteSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm_password: z.string(),
  full_name: z.string().min(1, 'Full name is required'),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ['confirm_password'],
})

export async function acceptInvite(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const supabase = await createClient()

  const rawData = {
    token: formData.get('token'),
    email: formData.get('email'),
    password: formData.get('password'),
    confirm_password: formData.get('confirm_password'),
    full_name: formData.get('full_name'),
  }

  const validated = acceptInviteSchema.safeParse(rawData)

  if (!validated.success) {
    return {
      message: 'Please fix the errors below',
      errors: validated.error.flatten().fieldErrors,
    }
  }

  // Get and verify invitation
  const { data: invitation, error: inviteError } = await supabase
    .from('portal_invitations')
    .select('*')
    .eq('token', validated.data.token)
    .eq('email', validated.data.email)
    .eq('status', 'pending')
    .single()

  if (inviteError || !invitation) {
    return { message: 'Invalid or expired invitation.' }
  }

  if (new Date(invitation.expires_at) < new Date()) {
    return { message: 'This invitation has expired.' }
  }

  // Create the user account
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: validated.data.email,
    password: validated.data.password,
    options: {
      data: {
        full_name: validated.data.full_name,
      },
    },
  })

  if (signUpError) {
    console.error('Error creating account:', signUpError)
    if (signUpError.message.includes('already registered')) {
      return { message: 'An account with this email already exists. Please login instead.' }
    }
    return { message: 'Failed to create account. Please try again.' }
  }

  if (!signUpData.user) {
    return { message: 'Failed to create account. Please try again.' }
  }

  // Create the profile
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: signUpData.user.id,
      email: validated.data.email,
      full_name: validated.data.full_name,
      role: invitation.role,
      department_id: invitation.department_id,
      is_active: true,
    })

  if (profileError) {
    console.error('Error creating profile:', profileError)
    // Don't fail completely - profile might be created by trigger
  }

  // Mark invitation as accepted
  await supabase
    .from('portal_invitations')
    .update({
      status: 'accepted',
      accepted_at: new Date().toISOString(),
    })
    .eq('id', invitation.id)

  // Sign in the user
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: validated.data.email,
    password: validated.data.password,
  })

  if (signInError) {
    // Account created but couldn't sign in automatically
    redirect('/login?message=Account created successfully. Please login.')
  }

  redirect('/dashboard')
}
