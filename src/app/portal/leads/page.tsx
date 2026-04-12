import { Suspense } from 'react'
import Link from 'next/link'
import { verifySession } from '@/lib/dal'
import { createClient } from '@/lib/supabase/server'
import { Plus, Users } from 'lucide-react'
import { LeadsTable } from './LeadsTable'

export const dynamic = 'force-dynamic'

async function getLeads() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('leads')
    .select(`
      *,
      assigned_user:assigned_to (full_name),
      project:interested_in_project (title)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching leads:', error)
    return []
  }

  return data || []
}

async function getLeadStats() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('leads')
    .select('status')

  const stats = {
    total: data?.length || 0,
    new: data?.filter(l => l.status === 'new').length || 0,
    qualified: data?.filter(l => l.status === 'qualified').length || 0,
    won: data?.filter(l => l.status === 'won').length || 0,
  }

  return stats
}

export default async function LeadsPage() {
  await verifySession()
  const [leads, stats] = await Promise.all([getLeads(), getLeadStats()])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Leads</h1>
          <p className="text-gray-400 mt-1">Manage and track your sales leads</p>
        </div>
        <Link
          href="/leads/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#D4AF37] hover:bg-[#C4A030] text-black font-semibold rounded-xl transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Lead
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-4">
          <p className="text-sm text-gray-400">Total Leads</p>
          <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
        </div>
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-4">
          <p className="text-sm text-gray-400">New</p>
          <p className="text-2xl font-bold text-blue-400 mt-1">{stats.new}</p>
        </div>
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-4">
          <p className="text-sm text-gray-400">Qualified</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">{stats.qualified}</p>
        </div>
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-4">
          <p className="text-sm text-gray-400">Won</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{stats.won}</p>
        </div>
      </div>

      {/* Leads Table */}
      <Suspense fallback={<div className="h-96 bg-[#111827] rounded-2xl animate-pulse" />}>
        <LeadsTable leads={leads} />
      </Suspense>
    </div>
  )
}
