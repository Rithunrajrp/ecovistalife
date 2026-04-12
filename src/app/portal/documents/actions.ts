'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { verifySession } from '@/lib/dal'

export type FormState = {
  message?: string
  errors?: Record<string, string[]>
  success?: boolean
}

const documentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  category: z.enum(['contract', 'proposal', 'agreement', 'invoice', 'legal', 'other']),
  lead_id: z.string().uuid().optional().or(z.literal('')),
  deal_id: z.string().uuid().optional().or(z.literal('')),
})

export async function uploadDocument(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await verifySession()
  const supabase = await createClient()

  const file = formData.get('file') as File | null

  if (!file || file.size === 0) {
    return { message: 'Please select a file to upload' }
  }

  const rawData = {
    name: formData.get('name') || file.name,
    description: formData.get('description'),
    category: formData.get('category'),
    lead_id: formData.get('lead_id'),
    deal_id: formData.get('deal_id'),
  }

  const validated = documentSchema.safeParse(rawData)

  if (!validated.success) {
    return {
      message: 'Please fix the errors below',
      errors: validated.error.flatten().fieldErrors,
    }
  }

  // Upload file to Supabase Storage
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
  const filePath = `documents/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('portal-files')
    .upload(filePath, file)

  if (uploadError) {
    console.error('Error uploading file:', uploadError)
    return { message: 'Failed to upload file. Please try again.' }
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('portal-files')
    .getPublicUrl(filePath)

  // Create document record
  const { lead_id, deal_id, ...docData } = validated.data

  const { error } = await supabase
    .from('documents')
    .insert({
      ...docData,
      lead_id: lead_id || null,
      deal_id: deal_id || null,
      file_path: filePath,
      file_url: urlData.publicUrl,
      mime_type: file.type,
      size: file.size,
      uploaded_by: session.userId,
    })

  if (error) {
    console.error('Error creating document:', error)
    // Clean up uploaded file
    await supabase.storage.from('portal-files').remove([filePath])
    return { message: 'Failed to save document. Please try again.' }
  }

  revalidatePath('/documents')
  redirect('/documents')
}

export async function deleteDocument(documentId: string): Promise<FormState> {
  await verifySession()
  const supabase = await createClient()

  // Get document to find file path
  const { data: doc } = await supabase
    .from('documents')
    .select('file_path')
    .eq('id', documentId)
    .single()

  if (doc?.file_path) {
    // Delete from storage
    await supabase.storage.from('portal-files').remove([doc.file_path])
  }

  // Delete record
  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', documentId)

  if (error) {
    console.error('Error deleting document:', error)
    return { message: 'Failed to delete document. Please try again.' }
  }

  revalidatePath('/documents')
  return { success: true, message: 'Document deleted successfully' }
}

export async function getLeadsForDocument() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('leads')
    .select('id, first_name, last_name')
    .order('first_name')

  return data || []
}
