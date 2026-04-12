import { requireManagerOrAdmin } from '@/lib/dal'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, CreditCard, Search, Filter } from 'lucide-react'
import { StatusBadge } from '@/components/portal/ui/StatusBadge'
import { format } from 'date-fns'

export const dynamic = 'force-dynamic'

async function getPayments() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('payments')
    .select(`
      *,
      invoice:invoice_id (invoice_number, customer_name),
      processed_by_user:processed_by (full_name)
    `)
    .order('payment_date', { ascending: false })

  if (error) {
    console.error('Error fetching payments:', error.message, error.details, error.hint)
    return []
  }

  return data || []
}

export default async function PaymentsPage() {
  await requireManagerOrAdmin()
  const payments = await getPayments()

  const formatCurrency = (value: number) => {
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(2)} Cr`
    } else if (value >= 100000) {
      return `₹${(value / 100000).toFixed(2)} L`
    }
    return `₹${value.toLocaleString()}`
  }

  const totalReceived = payments.reduce((sum, p) => sum + p.amount, 0)
  const methodCounts = payments.reduce((acc, p) => {
    acc[p.payment_method] = (acc[p.payment_method] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Payments</h1>
          <p className="text-gray-400 mt-1">Track and record all payments</p>
        </div>
        <Link
          href="/finance/payments/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#D4AF37] hover:bg-[#C4A030] text-black font-semibold rounded-xl transition-colors"
        >
          <Plus className="w-5 h-5" />
          Record Payment
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-4">
          <p className="text-sm text-gray-400">Total Received</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{formatCurrency(totalReceived)}</p>
        </div>
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-4">
          <p className="text-sm text-gray-400">Total Payments</p>
          <p className="text-2xl font-bold text-white mt-1">{payments.length}</p>
        </div>
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-4">
          <p className="text-sm text-gray-400">Bank Transfers</p>
          <p className="text-2xl font-bold text-blue-400 mt-1">{methodCounts.bank_transfer || 0}</p>
        </div>
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-4">
          <p className="text-sm text-gray-400">UPI/Cash</p>
          <p className="text-2xl font-bold text-purple-400 mt-1">
            {(methodCounts.upi || 0) + (methodCounts.cash || 0)}
          </p>
        </div>
      </div>

      {/* Payments List */}
      <div className="bg-[#111827] border border-gray-800 rounded-2xl overflow-hidden">
        {/* Search/Filter Bar */}
        <div className="p-4 border-b border-gray-800 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search payments..."
              className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]/50"
            />
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>

        {/* Table */}
        {payments.length === 0 ? (
          <div className="p-12 text-center">
            <CreditCard className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">No payments recorded yet</p>
            <Link
              href="/finance/payments/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#D4AF37] hover:bg-[#C4A030] text-black font-semibold rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Record First Payment
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Payment #</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Invoice</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Method</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Received By</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <span className="text-white font-medium">{payment.payment_number}</span>
                    </td>
                    <td className="py-3 px-4">
                      {payment.invoice ? (
                        <Link
                          href={`/finance/invoices/${payment.invoice_id}`}
                          className="text-[#D4AF37] hover:text-[#C4A030]"
                        >
                          {payment.invoice.invoice_number}
                        </Link>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-emerald-400 font-medium">
                      +{formatCurrency(payment.amount)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-gray-300 capitalize">
                        {payment.payment_method.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={payment.status} />
                    </td>
                    <td className="py-3 px-4 text-gray-400 text-sm">
                      {format(new Date(payment.payment_date), 'MMM d, yyyy')}
                    </td>
                    <td className="py-3 px-4 text-gray-400 text-sm">
                      {payment.processed_by_user?.full_name || '-'}
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
