import { notFound } from 'next/navigation'
import Link from 'next/link'
import { requireManagerOrAdmin } from '@/lib/dal'
import { createClient } from '@/lib/supabase/server'
import { getLeadsForInvoice } from '../../actions'
import { ArrowLeft, Edit, Send, Printer, Mail, CheckCircle, XCircle } from 'lucide-react'
import { format } from 'date-fns'
import { StatusBadge } from '@/components/portal/ui/StatusBadge'
import { InvoiceForm } from '../../InvoiceForm'
import { InvoiceActions } from './InvoiceActions'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ edit?: string }>
}

async function getInvoice(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      lead:lead_id (id, first_name, last_name, email),
      created_by_user:created_by (full_name)
    `)
    .eq('id', id)
    .single()

  if (error || !data) {
    return null
  }

  // Get invoice items
  const { data: items } = await supabase
    .from('invoice_items')
    .select('*')
    .eq('invoice_id', id)
    .order('created_at')

  // Get related payments
  const { data: payments } = await supabase
    .from('payments')
    .select(`
      *,
      received_by_user:received_by (full_name)
    `)
    .eq('invoice_id', id)
    .order('payment_date', { ascending: false })

  return {
    ...data,
    items: items || [],
    payments: payments || [],
  }
}

export default async function InvoiceDetailPage({ params, searchParams }: PageProps) {
  await requireManagerOrAdmin()
  const { id } = await params
  const { edit } = await searchParams

  const invoice = await getInvoice(id)
  if (!invoice) {
    notFound()
  }

  const isEditing = edit === 'true'

  if (isEditing) {
    const leads = await getLeadsForInvoice()
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Edit Invoice</h1>
          <p className="text-gray-400 mt-1">
            Update the invoice details below.
          </p>
        </div>
        <InvoiceForm invoice={invoice} leads={leads} />
      </div>
    )
  }

  const formatCurrency = (value: number) => {
    return `₹${value.toLocaleString()}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/finance/invoices"
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">
                {invoice.invoice_number}
              </h1>
              <StatusBadge status={invoice.status} />
            </div>
            <p className="text-gray-400 mt-1">{invoice.customer_name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {invoice.status === 'draft' && (
            <Link
              href={`/finance/invoices/${id}?edit=true`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit
            </Link>
          )}
          <InvoiceActions invoice={invoice} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Invoice Details */}
          <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6">
            {/* Customer & Invoice Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">Bill To</h3>
                <p className="text-white font-medium">{invoice.customer_name}</p>
                <p className="text-gray-400 text-sm">{invoice.customer_email}</p>
                {invoice.customer_phone && (
                  <p className="text-gray-400 text-sm">{invoice.customer_phone}</p>
                )}
                {invoice.customer_address && (
                  <p className="text-gray-400 text-sm mt-2">{invoice.customer_address}</p>
                )}
              </div>
              <div className="text-right">
                <div className="mb-3">
                  <p className="text-sm text-gray-400">Invoice Date</p>
                  <p className="text-white">{format(new Date(invoice.created_at), 'MMM d, yyyy')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Due Date</p>
                  <p className="text-white">{format(new Date(invoice.due_date), 'MMM d, yyyy')}</p>
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="border-t border-gray-800 pt-6">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left py-3 text-sm font-medium text-gray-400">Description</th>
                    <th className="text-right py-3 text-sm font-medium text-gray-400 w-20">Qty</th>
                    <th className="text-right py-3 text-sm font-medium text-gray-400 w-28">Unit Price</th>
                    <th className="text-right py-3 text-sm font-medium text-gray-400 w-28">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item: { id: string; description: string; quantity: number; unit_price: number; total: number }) => (
                    <tr key={item.id} className="border-b border-gray-800/50">
                      <td className="py-3 text-white">{item.description}</td>
                      <td className="py-3 text-gray-400 text-right">{item.quantity}</td>
                      <td className="py-3 text-gray-400 text-right">{formatCurrency(item.unit_price)}</td>
                      <td className="py-3 text-white text-right">{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="flex justify-end mt-6">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Subtotal</span>
                    <span className="text-white">{formatCurrency(invoice.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">GST ({invoice.tax_rate}%)</span>
                    <span className="text-white">{formatCurrency(invoice.tax_amount)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-700">
                    <span className="text-white">Total</span>
                    <span className="text-[#D4AF37]">{formatCurrency(invoice.total_amount)}</span>
                  </div>
                  <div className="flex justify-between text-sm pt-2">
                    <span className="text-gray-400">Amount Paid</span>
                    <span className="text-emerald-400">{formatCurrency(invoice.amount_paid)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Balance Due</span>
                    <span className="text-white font-medium">
                      {formatCurrency(invoice.total_amount - invoice.amount_paid)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
              <div className="mt-6 pt-6 border-t border-gray-800">
                <h3 className="text-sm font-medium text-gray-400 mb-2">Notes</h3>
                <p className="text-gray-300 text-sm">{invoice.notes}</p>
              </div>
            )}
          </div>

          {/* Payment History */}
          <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Payment History</h3>
              {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                <Link
                  href={`/finance/payments/new?invoice_id=${invoice.id}`}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-lg hover:bg-emerald-500/20 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Record Payment
                </Link>
              )}
            </div>

            {invoice.payments.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">No payments recorded yet</p>
            ) : (
              <div className="space-y-3">
                {invoice.payments.map((payment: { id: string; payment_number: string; amount: number; payment_method: string; payment_date: string; reference_number: string | null; received_by_user: { full_name: string } | null }) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">{payment.payment_number}</p>
                      <p className="text-xs text-gray-500">
                        {payment.payment_method.replace('_', ' ')} - {format(new Date(payment.payment_date), 'MMM d, yyyy')}
                      </p>
                      {payment.reference_number && (
                        <p className="text-xs text-gray-500">Ref: {payment.reference_number}</p>
                      )}
                    </div>
                    <p className="text-emerald-400 font-medium">+{formatCurrency(payment.amount)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-[#111827] border border-gray-800 rounded-2xl p-5">
            <h3 className="text-lg font-semibold text-white mb-4">Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Status</span>
                <StatusBadge status={invoice.status} />
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total</span>
                <span className="text-white font-medium">{formatCurrency(invoice.total_amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Paid</span>
                <span className="text-emerald-400">{formatCurrency(invoice.amount_paid)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-800">
                <span className="text-gray-400">Balance</span>
                <span className="text-white font-semibold">
                  {formatCurrency(invoice.total_amount - invoice.amount_paid)}
                </span>
              </div>
            </div>
          </div>

          {/* Related Lead */}
          {invoice.lead && (
            <div className="bg-[#111827] border border-gray-800 rounded-2xl p-5">
              <h3 className="text-lg font-semibold text-white mb-4">Related Lead</h3>
              <Link
                href={`/leads/${invoice.lead.id}`}
                className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl hover:bg-gray-800 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                  <span className="text-[#D4AF37] font-semibold">
                    {invoice.lead.first_name[0]}{invoice.lead.last_name?.[0] || ''}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    {invoice.lead.first_name} {invoice.lead.last_name}
                  </p>
                  <p className="text-xs text-gray-500">{invoice.lead.email}</p>
                </div>
              </Link>
            </div>
          )}

          {/* Metadata */}
          <div className="bg-[#111827] border border-gray-800 rounded-2xl p-5">
            <h3 className="text-lg font-semibold text-white mb-4">Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Created</span>
                <span className="text-white">{format(new Date(invoice.created_at), 'MMM d, yyyy')}</span>
              </div>
              {invoice.sent_at && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Sent</span>
                  <span className="text-white">{format(new Date(invoice.sent_at), 'MMM d, yyyy')}</span>
                </div>
              )}
              {invoice.created_by_user && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Created By</span>
                  <span className="text-white">{invoice.created_by_user.full_name}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
