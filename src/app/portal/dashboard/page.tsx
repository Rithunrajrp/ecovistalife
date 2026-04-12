import { Suspense } from 'react'
import { verifySession } from '@/lib/dal'
import { createClient } from '@/lib/supabase/server'
import { Users, FolderKanban, DollarSign, CheckSquare } from 'lucide-react'
import { StatCard } from '@/components/portal/ui/StatCard'
import { AreaChartCard } from '@/components/portal/charts/AreaChartCard'
import { BarChartCard } from '@/components/portal/charts/BarChartCard'
import { ActivityFeed } from '@/components/portal/ui/ActivityFeed'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

async function getDashboardStats() {
  const supabase = await createClient()

  // Get leads count
  const { count: leadsCount } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })

  // Get new leads this month
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { count: newLeadsCount } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startOfMonth.toISOString())

  // Get projects count
  const { count: projectsCount } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })

  // Get deals stats
  const { data: deals } = await supabase
    .from('deals')
    .select('deal_value, stage')

  const totalRevenue = deals?.reduce((sum, d) => sum + (d.deal_value || 0), 0) || 0
  const wonDeals = deals?.filter(d => d.stage === 'closed_won').length || 0

  // Get pending tasks
  const { count: pendingTasks } = await supabase
    .from('activities')
    .select('*', { count: 'exact', head: true })
    .eq('type', 'task')
    .eq('is_completed', false)

  // Get leads by status for pipeline chart
  const { data: leadsByStatus } = await supabase
    .from('leads')
    .select('status')

  const statusCounts = (leadsByStatus || []).reduce((acc, lead) => {
    acc[lead.status] = (acc[lead.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const pipelineData = [
    { name: 'New', value: statusCounts['new'] || 0, color: '#3B82F6' },
    { name: 'Contacted', value: statusCounts['contacted'] || 0, color: '#8B5CF6' },
    { name: 'Qualified', value: statusCounts['qualified'] || 0, color: '#F59E0B' },
    { name: 'Proposal', value: statusCounts['proposal'] || 0, color: '#10B981' },
    { name: 'Won', value: statusCounts['won'] || 0, color: '#D4AF37' },
  ]

  // Get recent activities
  const { data: recentActivities } = await supabase
    .from('activities')
    .select(`
      id,
      type,
      subject,
      description,
      activity_date,
      performed_by,
      profiles:performed_by (full_name)
    `)
    .order('activity_date', { ascending: false })
    .limit(5)

  return {
    stats: {
      leads: leadsCount || 0,
      newLeadsThisMonth: newLeadsCount || 0,
      projects: projectsCount || 0,
      revenue: totalRevenue,
      wonDeals,
      pendingTasks: pendingTasks || 0,
    },
    pipelineData,
    recentActivities: (recentActivities || []).map(a => ({
      id: a.id,
      type: a.type as 'call' | 'email' | 'meeting' | 'note' | 'task_completed',
      title: a.subject,
      description: a.description,
      timestamp: a.activity_date,
      user: (Array.isArray(a.profiles) ? a.profiles[0]?.full_name : (a.profiles as any)?.full_name) || 'Unknown',
    })),
  }
}

// Generate sample revenue data for the chart
function generateRevenueData() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
  return months.map((name, i) => ({
    name,
    value: Math.floor(Math.random() * 50 + 20) * 100000,
  }))
}

export default async function DashboardPage() {
  const session = await verifySession()
  const { stats, pipelineData, recentActivities } = await getDashboardStats()
  const revenueData = generateRevenueData()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Welcome back, {session.portalUser.full_name.split(' ')[0]}!
        </h1>
        <p className="text-gray-400 mt-1">
          Here&apos;s what&apos;s happening with your business today.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Leads"
          value={stats.leads}
          subtitle={`${stats.newLeadsThisMonth} new this month`}
          icon={<Users className="w-6 h-6" />}
          color="gold"
          trend={{
            value: 12,
            label: 'vs last month',
            isPositive: true,
          }}
        />
        <StatCard
          title="Active Projects"
          value={stats.projects}
          icon={<FolderKanban className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Revenue"
          value={stats.revenue >= 10000000
            ? `₹${(stats.revenue / 10000000).toFixed(1)} Cr`
            : stats.revenue >= 100000
            ? `₹${(stats.revenue / 100000).toFixed(1)} L`
            : `₹${stats.revenue.toLocaleString()}`}
          subtitle={`${stats.wonDeals} deals won`}
          icon={<DollarSign className="w-6 h-6" />}
          color="green"
          trend={{
            value: 8.4,
            label: 'vs last month',
            isPositive: true,
          }}
        />
        <StatCard
          title="Pending Tasks"
          value={stats.pendingTasks}
          icon={<CheckSquare className="w-6 h-6" />}
          color="purple"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<div className="h-[380px] bg-[#111827] rounded-2xl animate-pulse" />}>
          <AreaChartCard
            title="Revenue Overview"
            subtitle="Monthly revenue trend"
            data={revenueData}
            height={280}
            formatAs="currency"
          />
        </Suspense>

        <Suspense fallback={<div className="h-[380px] bg-[#111827] rounded-2xl animate-pulse" />}>
          <BarChartCard
            title="Lead Pipeline"
            subtitle="Leads by status"
            data={pipelineData}
            height={280}
          />
        </Suspense>
      </div>

      {/* Activity and Tasks Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityFeed
          title="Recent Activity"
          activities={recentActivities}
          maxItems={5}
        />

        {/* Quick Actions */}
        <div className="bg-[#111827] border border-gray-800 rounded-2xl p-5">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <a
              href="/leads/new"
              className="flex items-center gap-3 p-4 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-xl hover:bg-[#D4AF37]/20 transition-colors"
            >
              <Users className="w-5 h-5 text-[#D4AF37]" />
              <span className="text-sm font-medium text-white">Add Lead</span>
            </a>
            <a
              href="/finance/invoices/new"
              className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl hover:bg-green-500/20 transition-colors"
            >
              <DollarSign className="w-5 h-5 text-green-400" />
              <span className="text-sm font-medium text-white">Create Invoice</span>
            </a>
            <a
              href="/documents"
              className="flex items-center gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl hover:bg-blue-500/20 transition-colors"
            >
              <FolderKanban className="w-5 h-5 text-blue-400" />
              <span className="text-sm font-medium text-white">Upload Document</span>
            </a>
            <a
              href="/team"
              className="flex items-center gap-3 p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl hover:bg-purple-500/20 transition-colors"
            >
              <Users className="w-5 h-5 text-purple-400" />
              <span className="text-sm font-medium text-white">Invite Team</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
