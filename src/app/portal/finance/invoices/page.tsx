import { requireManagerOrAdmin } from '@/lib/dal'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, FileText, Search, Filter } from 'lucide-react'
import { StatusBadge } from '@/components/portal/ui/StatusBadge'
import { format } from 'date-fns'

export const dynamic = 'force-dynamic'

async function getInvoices() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      lead:lead_id (first_name, last_name),
      created_by_user:created_by (full_name)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching invoices:', error)
    return []
  }

  return data || []
}

export default async function InvoicesPage() {
  await requireManagerOrAdmin()
  const invoices = await getInvoices()

  const formatCurrency = (value: number) => {
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(2)} Cr`
    } else if (value >= 100000) {
      return `₹${(value / 100000).toFixed(2)} L`
    }
    return `₹${value.toLocaleString()}`
  }

  const stats = {
    total: invoices.length,
    draft: invoices.filter(i => i.status === 'draft').length,
    sent: invoices.filter(i => i.status === 'sent').length,
    paid: invoices.filter(i => i.status === 'paid').length,
    overdue: invoices.filter(i => i.status === 'overdue').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Invoices</h1>
          <p className="text-gray-400 mt-1">Manage and track all invoices</p>
        </div>
        <Link
          href="/finance/invoices/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#D4AF37] hover:bg-[#C4A030] text-black font-semibold rounded-xl transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Invoice
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-4">
          <p className="text-sm text-gray-400">Total</p>
          <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
        </div>
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-4">
          <p className="text-sm text-gray-400">Draft</p>
          <p className="text-2xl font-bold text-gray-400 mt-1">{stats.draft}</p>
        </div>
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-4">
          <p className="text-sm text-gray-400">Sent</p>
          <p className="text-2xl font-bold text-blue-400 mt-1">{stats.sent}</p>
        </div>
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-4">
          <p className="text-sm text-gray-400">Paid</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{stats.paid}</p>
        </div>
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-4">
          <p className="text-sm text-gray-400">Overdue</p>
          <p className="text-2xl font-bold text-red-400 mt-1">{stats.overdue}</p>
        </div>
      </div>

      {/* Invoices List */}
      <div className="bg-[#111827] border border-gray-800 rounded-2xl overflow-hidden">
        {/* Search/Filter Bar */}
        <div className="p-4 border-b border-gray-800 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search invoices..."
              className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]/50"
            />
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>

        {/* Table */}
        {invoices.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">No invoices yet</p>
            <Link
              href="/finance/invoices/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#D4AF37] hover:bg-[#C4A030] text-black font-semibold rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create First Invoice
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Invoice #</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Customer</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Paid</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Due Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Created</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <Link
                        href={`/finance/invoices/${invoice.id}`}
                        className="text-[#D4AF37] hover:text-[#C4A030] font-medium"
                      >
                        {invoice.invoice_number}
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-white font-medium">{invoice.customer_name}</p>
                        <p className="text-xs text-gray-500">{invoice.customer_email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-white font-medium">
                      {formatCurrency(invoice.total_amount)}
                    </td>
                    <td className="py-3 px-4 text-emerald-400">
                      {formatCurrency(invoice.amount_paid)}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={invoice.status} />
                    </td>
                    <td className="py-3 px-4 text-gray-400 text-sm">
                      {format(new Date(invoice.due_date), 'MMM d, yyyy')}
                    </td>
                    <td className="py-3 px-4 text-gray-500 text-sm">
                      {format(new Date(invoice.created_at), 'MMM d, yyyy')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
