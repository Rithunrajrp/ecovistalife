'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// ============================================
// Schemas
// ============================================

const LeadSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().optional().nullable(),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  source: z.enum(['website_form', 'phone', 'email', 'referral', 'social', 'other']),
  status: z.enum(['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost']).default('new'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional().nullable(),
  interested_in_project: z.string().uuid().optional().nullable(),
  budget_range: z.string().optional().nullable(),
  initial_message: z.string().optional().nullable(),
  assigned_to: z.string().uuid().optional().nullable(),
})

const ActivitySchema = z.object({
  lead_id: z.string().uuid(),
  type: z.enum(['call', 'email', 'meeting', 'note', 'task', 'site_visit', 'follow_up']),
  subject: z.string().min(1, 'Subject is required'),
  description: z.string().optional().nullable(),
  activity_date: z.string().optional(),
  due_date: z.string().optional().nullable(),
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
// Create Lead
// ============================================

export async function createLead(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { message: 'Unauthorized' }
  }

  const validated = LeadSchema.safeParse({
    first_name: formData.get('first_name'),
    last_name: formData.get('last_name') || null,
    email: formData.get('email'),
    phone: formData.get('phone') || null,
    company: formData.get('company') || null,
    source: formData.get('source') || 'other',
    status: formData.get('status') || 'new',
    priority: formData.get('priority') || null,
    interested_in_project: formData.get('interested_in_project') || null,
    budget_range: formData.get('budget_range') || null,
    initial_message: formData.get('initial_message') || null,
    assigned_to: formData.get('assigned_to') || null,
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  const { error } = await supabase.from('leads').insert({
    ...validated.data,
    created_by: user.id,
  })

  if (error) {
    console.error('Error creating lead:', error)
    return { message: 'Failed to create lead' }
  }

  revalidatePath('/leads')
  redirect('/leads')
}

// ============================================
// Update Lead
// ============================================

export async function updateLead(
  leadId: string,
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const supabase = await createClient()

  const validated = LeadSchema.safeParse({
    first_name: formData.get('first_name'),
    last_name: formData.get('last_name') || null,
    email: formData.get('email'),
    phone: formData.get('phone') || null,
    company: formData.get('company') || null,
    source: formData.get('source') || 'other',
    status: formData.get('status') || 'new',
    priority: formData.get('priority') || null,
    interested_in_project: formData.get('interested_in_project') || null,
    budget_range: formData.get('budget_range') || null,
    initial_message: formData.get('initial_message') || null,
    assigned_to: formData.get('assigned_to') || null,
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  // Update last_contacted_at if status changed to contacted or beyond
  const updates: Record<string, unknown> = { ...validated.data }
  if (['contacted', 'qualified', 'proposal', 'negotiation'].includes(validated.data.status)) {
    updates.last_contacted_at = new Date().toISOString()
  }

  const { error } = await supabase
    .from('leads')
    .update(updates)
    .eq('id', leadId)

  if (error) {
    console.error('Error updating lead:', error)
    return { message: 'Failed to update lead' }
  }

  revalidatePath('/leads')
  revalidatePath(`/leads/${leadId}`)
  return { success: true, message: 'Lead updated successfully' }
}

// ============================================
// Delete Lead
// ============================================

export async function deleteLead(leadId: string): Promise<FormState> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('leads')
    .delete()
    .eq('id', leadId)

  if (error) {
    console.error('Error deleting lead:', error)
    return { message: 'Failed to delete lead' }
  }

  revalidatePath('/leads')
  redirect('/leads')
}

// ============================================
// Add Activity
// ============================================

export async function addActivity(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { message: 'Unauthorized' }
  }

  const validated = ActivitySchema.safeParse({
    lead_id: formData.get('lead_id'),
    type: formData.get('type'),
    subject: formData.get('subject'),
    description: formData.get('description') || null,
    activity_date: formData.get('activity_date') || new Date().toISOString(),
    due_date: formData.get('due_date') || null,
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  const { error } = await supabase.from('activities').insert({
    ...validated.data,
    performed_by: user.id,
  })

  if (error) {
    console.error('Error adding activity:', error)
    return { message: 'Failed to add activity' }
  }

  // Update lead's last_contacted_at
  if (['call', 'email', 'meeting'].includes(validated.data.type)) {
    await supabase
      .from('leads')
      .update({ last_contacted_at: new Date().toISOString() })
      .eq('id', validated.data.lead_id)
  }

  revalidatePath(`/leads/${validated.data.lead_id}`)
  return { success: true, message: 'Activity added successfully' }
}

// ============================================
// Get Team Members (for assignment dropdown)
// ============================================

export async function getTeamMembers() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('is_active', true)
    .order('full_name')

  if (error) {
    console.error('Error fetching team members:', error)
    return []
  }

  return data || []
}

// ============================================
// Get Projects (for interest dropdown)
// ============================================

export async function getProjects() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('projects')
    .select('id, title, type')
    .order('title')

  if (error) {
    console.error('Error fetching projects:', error)
    return []
  }

  return data || []
}
