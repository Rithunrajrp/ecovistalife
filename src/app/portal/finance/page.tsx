import { verifySession, requireManagerOrAdmin } from '@/lib/dal'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { DollarSign, FileText, CreditCard, TrendingUp, Plus } from 'lucide-react'
import { StatCard } from '@/components/portal/ui/StatCard'

export const dynamic = 'force-dynamic'

async function getFinanceStats() {
  const supabase = await createClient()

  // Get invoices
  const { data: invoices } = await supabase
    .from('invoices')
    .select('total_amount, amount_paid, status')

  const totalRevenue = invoices?.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0
  const totalPaid = invoices?.reduce((sum, inv) => sum + (inv.amount_paid || 0), 0) || 0
  const pendingAmount = totalRevenue - totalPaid

  const invoiceStats = {
    total: invoices?.length || 0,
    paid: invoices?.filter(i => i.status === 'paid').length || 0,
    pending: invoices?.filter(i => ['sent', 'partially_paid'].includes(i.status)).length || 0,
    overdue: invoices?.filter(i => i.status === 'overdue').length || 0,
  }

  // Get recent invoices
  const { data: recentInvoices } = await supabase
    .from('invoices')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  // Get recent payments
  const { data: recentPayments } = await supabase
    .from('payments')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  return {
    totalRevenue,
    totalPaid,
    pendingAmount,
    invoiceStats,
    recentInvoices: recentInvoices || [],
    recentPayments: recentPayments || [],
  }
}

export default async function FinancePage() {
  await requireManagerOrAdmin()
  const stats = await getFinanceStats()

  const formatCurrency = (value: number) => {
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(1)} Cr`
    } else if (value >= 100000) {
      return `₹${(value / 100000).toFixed(1)} L`
    }
    return `₹${value.toLocaleString()}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Finance</h1>
          <p className="text-gray-400 mt-1">Manage invoices, payments, and transactions</p>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          icon={<DollarSign className="w-6 h-6" />}
          color="gold"
        />
        <StatCard
          title="Amount Received"
          value={formatCurrency(stats.totalPaid)}
          icon={<TrendingUp className="w-6 h-6" />}
          color="green"
        />
        <StatCard
          title="Pending Amount"
          value={formatCurrency(stats.pendingAmount)}
          icon={<CreditCard className="w-6 h-6" />}
          color="orange"
        />
        <StatCard
          title="Total Invoices"
          value={stats.invoiceStats.total}
          subtitle={`${stats.invoiceStats.paid} paid, ${stats.invoiceStats.pending} pending`}
          icon={<FileText className="w-6 h-6" />}
          color="blue"
        />
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/finance/invoices"
          className="bg-[#111827] border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Invoices</h3>
              <p className="text-sm text-gray-400">{stats.invoiceStats.total} total invoices</p>
            </div>
          </div>
        </Link>

        <Link
          href="/finance/payments"
          className="bg-[#111827] border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Payments</h3>
              <p className="text-sm text-gray-400">{stats.recentPayments.length} recent payments</p>
            </div>
          </div>
        </Link>

        <Link
          href="/finance/transactions"
          className="bg-[#111827] border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Transactions</h3>
              <p className="text-sm text-gray-400">View transaction history</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Invoices */}
        <div className="bg-[#111827] border border-gray-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Recent Invoices</h3>
            <Link href="/finance/invoices" className="text-sm text-[#D4AF37] hover:text-[#C4A030]">
              View All
            </Link>
          </div>
          {stats.recentInvoices.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">No invoices yet</p>
          ) : (
            <div className="space-y-3">
              {stats.recentInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl"
                >
                  <div>
                    <p className="text-sm font-medium text-white">{invoice.invoice_number}</p>
                    <p className="text-xs text-gray-500">{invoice.customer_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">
                      {formatCurrency(invoice.total_amount)}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">{invoice.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Payments */}
        <div className="bg-[#111827] border border-gray-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Recent Payments</h3>
            <Link href="/finance/payments" className="text-sm text-[#D4AF37] hover:text-[#C4A030]">
              View All
            </Link>
          </div>
          {stats.recentPayments.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">No payments yet</p>
          ) : (
            <div className="space-y-3">
              {stats.recentPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl"
                >
                  <div>
                    <p className="text-sm font-medium text-white">{payment.payment_number}</p>
                    <p className="text-xs text-gray-500 capitalize">
                      {payment.payment_method.replace('_', ' ')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-emerald-400">
                      +{formatCurrency(payment.amount)}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">{payment.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
