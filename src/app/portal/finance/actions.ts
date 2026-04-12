'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { requireManagerOrAdmin } from '@/lib/dal'

export type FormState = {
  message?: string
  errors?: Record<string, string[]>
  success?: boolean
}

const invoiceItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
  unit_price: z.coerce.number().min(0, 'Unit price must be non-negative'),
})

const invoiceSchema = z.object({
  customer_name: z.string().min(1, 'Customer name is required'),
  customer_email: z.string().email('Invalid email address'),
  customer_phone: z.string().optional(),
  customer_address: z.string().optional(),
  lead_id: z.string().uuid().optional().or(z.literal('')),
  deal_id: z.string().uuid().optional().or(z.literal('')),
  due_date: z.string().min(1, 'Due date is required'),
  notes: z.string().optional(),
  items: z.string().transform((val) => {
    try {
      return JSON.parse(val)
    } catch {
      return []
    }
  }),
})

const paymentSchema = z.object({
  invoice_id: z.string().uuid('Invoice is required'),
  amount: z.coerce.number().min(0.01, 'Amount must be greater than 0'),
  payment_method: z.enum(['cash', 'bank_transfer', 'cheque', 'upi', 'card', 'other']),
  payment_date: z.string().min(1, 'Payment date is required'),
  reference_number: z.string().optional(),
  notes: z.string().optional(),
})

export async function createInvoice(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await requireManagerOrAdmin()
  const supabase = await createClient()

  const rawData = {
    customer_name: formData.get('customer_name'),
    customer_email: formData.get('customer_email'),
    customer_phone: formData.get('customer_phone'),
    customer_address: formData.get('customer_address'),
    lead_id: formData.get('lead_id'),
    deal_id: formData.get('deal_id'),
    due_date: formData.get('due_date'),
    notes: formData.get('notes'),
    items: formData.get('items'),
  }

  const validated = invoiceSchema.safeParse(rawData)

  if (!validated.success) {
    return {
      message: 'Please fix the errors below',
      errors: validated.error.flatten().fieldErrors,
    }
  }

  const { items, lead_id, deal_id, ...invoiceData } = validated.data

  // Calculate totals
  const subtotal = items.reduce(
    (sum: number, item: { quantity: number; unit_price: number }) =>
      sum + item.quantity * item.unit_price,
    0
  )
  const tax_amount = subtotal * 0.18 // 18% GST
  const total_amount = subtotal + tax_amount

  const { data: invoice, error } = await supabase
    .from('invoices')
    .insert({
      ...invoiceData,
      lead_id: lead_id || null,
      deal_id: deal_id || null,
      subtotal,
      tax_rate: 18,
      tax_amount,
      total_amount,
      amount_paid: 0,
      status: 'draft',
      created_by: session.userId,
    })
    .select('id')
    .single()

  if (error) {
    console.error('Error creating invoice:', error)
    return { message: 'Failed to create invoice. Please try again.' }
  }

  // Insert invoice items
  if (items.length > 0) {
    const itemsToInsert = items.map((item: { description: string; quantity: number; unit_price: number }) => ({
      invoice_id: invoice.id,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total: item.quantity * item.unit_price,
    }))

    const { error: itemsError } = await supabase
      .from('invoice_items')
      .insert(itemsToInsert)

    if (itemsError) {
      console.error('Error creating invoice items:', itemsError)
    }
  }

  revalidatePath('/finance/invoices')
  redirect(`/finance/invoices/${invoice.id}`)
}

export async function updateInvoice(
  invoiceId: string,
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireManagerOrAdmin()
  const supabase = await createClient()

  const rawData = {
    customer_name: formData.get('customer_name'),
    customer_email: formData.get('customer_email'),
    customer_phone: formData.get('customer_phone'),
    customer_address: formData.get('customer_address'),
    lead_id: formData.get('lead_id'),
    deal_id: formData.get('deal_id'),
    due_date: formData.get('due_date'),
    notes: formData.get('notes'),
    items: formData.get('items'),
  }

  const validated = invoiceSchema.safeParse(rawData)

  if (!validated.success) {
    return {
      message: 'Please fix the errors below',
      errors: validated.error.flatten().fieldErrors,
    }
  }

  const { items, lead_id, deal_id, ...invoiceData } = validated.data

  // Calculate totals
  const subtotal = items.reduce(
    (sum: number, item: { quantity: number; unit_price: number }) =>
      sum + item.quantity * item.unit_price,
    0
  )
  const tax_amount = subtotal * 0.18
  const total_amount = subtotal + tax_amount

  const { error } = await supabase
    .from('invoices')
    .update({
      ...invoiceData,
      lead_id: lead_id || null,
      deal_id: deal_id || null,
      subtotal,
      tax_amount,
      total_amount,
      updated_at: new Date().toISOString(),
    })
    .eq('id', invoiceId)

  if (error) {
    console.error('Error updating invoice:', error)
    return { message: 'Failed to update invoice. Please try again.' }
  }

  // Delete existing items and re-insert
  await supabase.from('invoice_items').delete().eq('invoice_id', invoiceId)

  if (items.length > 0) {
    const itemsToInsert = items.map((item: { description: string; quantity: number; unit_price: number }) => ({
      invoice_id: invoiceId,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total: item.quantity * item.unit_price,
    }))

    await supabase.from('invoice_items').insert(itemsToInsert)
  }

  revalidatePath('/finance/invoices')
  redirect(`/finance/invoices/${invoiceId}`)
}

export async function updateInvoiceStatus(
  invoiceId: string,
  status: 'draft' | 'sent' | 'paid' | 'partially_paid' | 'overdue' | 'cancelled'
): Promise<FormState> {
  await requireManagerOrAdmin()
  const supabase = await createClient()

  const updateData: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  }

  if (status === 'sent') {
    updateData.sent_at = new Date().toISOString()
  }

  const { error } = await supabase
    .from('invoices')
    .update(updateData)
    .eq('id', invoiceId)

  if (error) {
    console.error('Error updating invoice status:', error)
    return { message: 'Failed to update status. Please try again.' }
  }

  revalidatePath('/finance/invoices')
  revalidatePath(`/finance/invoices/${invoiceId}`)
  return { success: true, message: 'Status updated successfully' }
}

export async function recordPayment(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await requireManagerOrAdmin()
  const supabase = await createClient()

  const rawData = {
    invoice_id: formData.get('invoice_id'),
    amount: formData.get('amount'),
    payment_method: formData.get('payment_method'),
    payment_date: formData.get('payment_date'),
    reference_number: formData.get('reference_number'),
    notes: formData.get('notes'),
  }

  const validated = paymentSchema.safeParse(rawData)

  if (!validated.success) {
    return {
      message: 'Please fix the errors below',
      errors: validated.error.flatten().fieldErrors,
    }
  }

  // Get invoice to check amount
  const { data: invoice } = await supabase
    .from('invoices')
    .select('total_amount, amount_paid')
    .eq('id', validated.data.invoice_id)
    .single()

  if (!invoice) {
    return { message: 'Invoice not found' }
  }

  const remainingAmount = invoice.total_amount - invoice.amount_paid
  if (validated.data.amount > remainingAmount) {
    return {
      message: `Payment amount cannot exceed remaining balance of ₹${remainingAmount.toLocaleString()}`,
    }
  }

  const { data: payment, error } = await supabase
    .from('payments')
    .insert({
      ...validated.data,
      status: 'completed',
      received_by: session.userId,
    })
    .select('id')
    .single()

  if (error) {
    console.error('Error recording payment:', error)
    return { message: 'Failed to record payment. Please try again.' }
  }

  // Update invoice amount_paid and status
  const newAmountPaid = invoice.amount_paid + validated.data.amount
  const newStatus =
    newAmountPaid >= invoice.total_amount ? 'paid' : 'partially_paid'

  await supabase
    .from('invoices')
    .update({
      amount_paid: newAmountPaid,
      status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('id', validated.data.invoice_id)

  revalidatePath('/finance/invoices')
  revalidatePath('/finance/payments')
  revalidatePath(`/finance/invoices/${validated.data.invoice_id}`)
  redirect('/finance/payments')
}

export async function getLeadsForInvoice() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('leads')
    .select('id, first_name, last_name, email, phone, company')
    .in('status', ['qualified', 'proposal', 'negotiation', 'won'])
    .order('first_name')

  return data || []
}

export async function getInvoicesForPayment() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('invoices')
    .select('id, invoice_number, customer_name, total_amount, amount_paid, status')
    .in('status', ['sent', 'partially_paid', 'overdue'])
    .order('created_at', { ascending: false })

  return data || []
}
