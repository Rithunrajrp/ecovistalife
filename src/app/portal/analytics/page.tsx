import { requireManagerOrAdmin } from '@/lib/dal'
import { createClient } from '@/lib/supabase/server'
import { BarChart3, TrendingUp, Users, DollarSign, Target, Calendar } from 'lucide-react'
import { StatCard } from '@/components/portal/ui/StatCard'
import { AreaChartCard } from '@/components/portal/charts/AreaChartCard'
import { BarChartCard } from '@/components/portal/charts/BarChartCard'

export const dynamic = 'force-dynamic'

async function getAnalyticsData() {
  const supabase = await createClient()

  // Get leads data
  const { data: leads } = await supabase
    .from('leads')
    .select('status, source, created_at, score')

  // Get invoices data
  const { data: invoices } = await supabase
    .from('invoices')
    .select('total_amount, amount_paid, status, created_at')

  // Get team performance
  const { data: teamStats } = await supabase
    .from('profiles')
    .select(`
      id,
      full_name,
      leads:leads!assigned_to (id, status)
    `)
    .eq('is_active', true)

  // Calculate metrics
  const totalLeads = leads?.length || 0
  const qualifiedLeads = leads?.filter(l => ['qualified', 'proposal', 'negotiation', 'won'].includes(l.status)).length || 0
  const conversionRate = totalLeads > 0 ? ((leads?.filter(l => l.status === 'won').length || 0) / totalLeads * 100).toFixed(1) : '0'

  const totalRevenue = invoices?.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0
  const collectedRevenue = invoices?.reduce((sum, inv) => sum + (inv.amount_paid || 0), 0) || 0
  const collectionRate = totalRevenue > 0 ? ((collectedRevenue / totalRevenue) * 100).toFixed(1) : '0'

  // Lead sources breakdown
  const sourceBreakdown = leads?.reduce((acc, lead) => {
    acc[lead.source] = (acc[lead.source] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  const sourceData = Object.entries(sourceBreakdown).map(([source, count]) => ({
    name: source.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value: count,
  }))

  // Lead status breakdown
  const statusBreakdown = leads?.reduce((acc, lead) => {
    acc[lead.status] = (acc[lead.status] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  const statusData = Object.entries(statusBreakdown).map(([status, count]) => ({
    name: status.replace(/\b\w/g, l => l.toUpperCase()),
    value: count,
  }))

  // Monthly trends (last 6 months)
  const monthlyData = []
  for (let i = 5; i >= 0; i--) {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)

    const monthLeads = leads?.filter(l => {
      const created = new Date(l.created_at)
      return created >= monthStart && created <= monthEnd
    }).length || 0

    const monthRevenue = invoices?.filter(inv => {
      const created = new Date(inv.created_at)
      return created >= monthStart && created <= monthEnd
    }).reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0

    monthlyData.push({
      name: date.toLocaleDateString('en-US', { month: 'short' }),
      leads: monthLeads,
      revenue: Math.round(monthRevenue / 100000), // In Lakhs
    })
  }

  // Team performance
  const teamPerformance = (teamStats || [])
    .map(member => ({
      name: member.full_name?.split(' ')[0] || 'Unknown',
      leads: (member.leads as { id: string; status: string }[])?.length || 0,
      won: (member.leads as { id: string; status: string }[])?.filter(l => l.status === 'won').length || 0,
    }))
    .filter(m => m.leads > 0)
    .sort((a, b) => b.won - a.won)
    .slice(0, 5)

  return {
    kpis: {
      totalLeads,
      qualifiedLeads,
      conversionRate,
      totalRevenue,
      collectedRevenue,
      collectionRate,
    },
    sourceData,
    statusData,
    monthlyData,
    teamPerformance,
  }
}

export default async function AnalyticsPage() {
  await requireManagerOrAdmin()
  const data = await getAnalyticsData()

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
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-gray-400 mt-1">Insights and performance metrics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Total Leads"
          value={data.kpis.totalLeads}
          icon={<Users className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Qualified Leads"
          value={data.kpis.qualifiedLeads}
          icon={<Target className="w-6 h-6" />}
          color="green"
        />
        <StatCard
          title="Conversion Rate"
          value={`${data.kpis.conversionRate}%`}
          icon={<TrendingUp className="w-6 h-6" />}
          color="gold"
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(data.kpis.totalRevenue)}
          icon={<DollarSign className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Collected"
          value={formatCurrency(data.kpis.collectedRevenue)}
          icon={<DollarSign className="w-6 h-6" />}
          color="green"
        />
        <StatCard
          title="Collection Rate"
          value={`${data.kpis.collectionRate}%`}
          icon={<BarChart3 className="w-6 h-6" />}
          color="purple"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AreaChartCard
          title="Monthly Trends"
          data={data.monthlyData}
          dataKey="leads"
          xAxisKey="name"
          color="#D4AF37"
        />
        <BarChartCard
          title="Lead Sources"
          data={data.sourceData}
          dataKey="value"
          xAxisKey="name"
          color="#3B82F6"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead Status Distribution */}
        <div className="bg-[#111827] border border-gray-800 rounded-2xl p-5">
          <h3 className="text-lg font-semibold text-white mb-4">Lead Status Distribution</h3>
          <div className="space-y-3">
            {data.statusData.map((status) => {
              const percentage = data.kpis.totalLeads > 0
                ? ((status.value / data.kpis.totalLeads) * 100).toFixed(0)
                : '0'
              return (
                <div key={status.name}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-400">{status.name}</span>
                    <span className="text-white">{status.value} ({percentage}%)</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#D4AF37] rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Team Leaderboard */}
        <div className="bg-[#111827] border border-gray-800 rounded-2xl p-5">
          <h3 className="text-lg font-semibold text-white mb-4">Team Leaderboard</h3>
          {data.teamPerformance.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">No data available</p>
          ) : (
            <div className="space-y-3">
              {data.teamPerformance.map((member, index) => (
                <div
                  key={member.name}
                  className="flex items-center gap-4 p-3 bg-gray-800/50 rounded-xl"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index === 0 ? 'bg-[#D4AF37] text-black' :
                    index === 1 ? 'bg-gray-400 text-black' :
                    index === 2 ? 'bg-amber-700 text-white' :
                    'bg-gray-700 text-white'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{member.name}</p>
                    <p className="text-xs text-gray-500">{member.leads} leads assigned</p>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-400 font-semibold">{member.won} won</p>
                    <p className="text-xs text-gray-500">
                      {member.leads > 0 ? ((member.won / member.leads) * 100).toFixed(0) : 0}% rate
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Revenue Trend */}
      <div className="bg-[#111827] border border-gray-800 rounded-2xl p-5">
        <h3 className="text-lg font-semibold text-white mb-4">Revenue Trend (in Lakhs)</h3>
        <div className="h-[300px]">
          <BarChartCard
            title=""
            data={data.monthlyData}
            dataKey="revenue"
            xAxisKey="name"
            color="#10B981"
          />
        </div>
      </div>
    </div>
  )
}
