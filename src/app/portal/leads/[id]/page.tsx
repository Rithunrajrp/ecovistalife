import { notFound } from 'next/navigation'
import Link from 'next/link'
import { verifySession } from '@/lib/dal'
import { createClient } from '@/lib/supabase/server'
import { getTeamMembers, getProjects } from '../actions'
import { ArrowLeft, Edit, Phone, Mail, Building2, Calendar, Clock, User } from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { StatusBadge } from '@/components/portal/ui/StatusBadge'
import { ActivityFeed } from '@/components/portal/ui/ActivityFeed'
import { LeadForm } from '../LeadForm'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ edit?: string }>
}

async function getLead(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('leads')
    .select(`
      *,
      assigned_user:assigned_to (id, full_name, email),
      created_by_user:created_by (full_name),
      project:interested_in_project (id, title, type, location)
    `)
    .eq('id', id)
    .single()

  if (error || !data) {
    return null
  }

  return data
}

async function getLeadActivities(leadId: string) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('activities')
    .select(`
      id,
      type,
      subject,
      description,
      activity_date,
      is_completed,
      performed_by,
      profiles:performed_by (full_name)
    `)
    .eq('lead_id', leadId)
    .order('activity_date', { ascending: false })
    .limit(10)

  return (data || []).map(a => ({
    id: a.id,
    type: a.type as 'call' | 'email' | 'meeting' | 'note' | 'task_completed',
    title: a.subject,
    description: a.description,
    timestamp: a.activity_date,
    user: (Array.isArray(a.profiles) ? a.profiles[0]?.full_name : (a.profiles as any)?.full_name) || 'Unknown',
  }))
}

export default async function LeadDetailPage({ params, searchParams }: PageProps) {
  await verifySession()
  const { id } = await params
  const { edit } = await searchParams

  const lead = await getLead(id)
  if (!lead) {
    notFound()
  }

  const isEditing = edit === 'true'

  if (isEditing) {
    const [teamMembers, projects] = await Promise.all([
      getTeamMembers(),
      getProjects(),
    ])

    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Edit Lead</h1>
          <p className="text-gray-400 mt-1">
            Update the lead details below.
          </p>
        </div>
        <LeadForm lead={lead} teamMembers={teamMembers} projects={projects} />
      </div>
    )
  }

  const activities = await getLeadActivities(id)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/leads"
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {lead.first_name} {lead.last_name}
            </h1>
            {lead.company && (
              <p className="text-gray-400 flex items-center gap-1.5 mt-1">
                <Building2 className="w-4 h-4" />
                {lead.company}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={lead.status} />
          <Link
            href={`/leads/${id}?edit=true`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Card */}
          <div className="bg-[#111827] border border-gray-800 rounded-2xl p-5">
            <h3 className="text-lg font-semibold text-white mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <a href={`mailto:${lead.email}`} className="text-sm text-white hover:text-[#D4AF37]">
                    {lead.email}
                  </a>
                </div>
              </div>
              {lead.phone && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <a href={`tel:${lead.phone}`} className="text-sm text-white hover:text-[#D4AF37]">
                      {lead.phone}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Lead Details */}
          <div className="bg-[#111827] border border-gray-800 rounded-2xl p-5">
            <h3 className="text-lg font-semibold text-white mb-4">Lead Details</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-500">Source</p>
                <p className="text-sm text-white capitalize">{lead.source.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Priority</p>
                <p className="text-sm text-white capitalize">{lead.priority || 'Not set'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Score</p>
                <p className="text-sm text-white">{lead.score || 0}/100</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Budget Range</p>
                <p className="text-sm text-white">{lead.budget_range || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Interested In</p>
                <p className="text-sm text-white">
                  {(lead.project as { title: string } | null)?.title || 'Not specified'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Assigned To</p>
                <p className="text-sm text-white">
                  {(Array.isArray(lead.assigned_user) ? lead.assigned_user[0]?.full_name : (lead.assigned_user as any)?.full_name) || 'Unassigned'}
                </p>
              </div>
            </div>
            {lead.initial_message && (
              <div className="mt-4 pt-4 border-t border-gray-800">
                <p className="text-xs text-gray-500 mb-2">Initial Message</p>
                <p className="text-sm text-gray-300">{lead.initial_message}</p>
              </div>
            )}
          </div>

          {/* Activity Feed */}
          <ActivityFeed
            title="Activity History"
            activities={activities}
            maxItems={10}
            showViewAll={false}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Timeline */}
          <div className="bg-[#111827] border border-gray-800 rounded-2xl p-5">
            <h3 className="text-lg font-semibold text-white mb-4">Timeline</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-gray-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Created</p>
                  <p className="text-sm text-white">
                    {format(new Date(lead.created_at), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
              {lead.last_contacted_at && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Last Contacted</p>
                    <p className="text-sm text-white">
                      {formatDistanceToNow(new Date(lead.last_contacted_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              )}
              {lead.next_follow_up_at && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Next Follow-up</p>
                    <p className="text-sm text-amber-400">
                      {format(new Date(lead.next_follow_up_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Created By */}
          {lead.created_by_user && (
            <div className="bg-[#111827] border border-gray-800 rounded-2xl p-5">
              <h3 className="text-lg font-semibold text-white mb-4">Created By</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    {Array.isArray(lead.created_by_user) ? lead.created_by_user[0]?.full_name : (lead.created_by_user as any)?.full_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-[#111827] border border-gray-800 rounded-2xl p-5">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <a
                href={`mailto:${lead.email}`}
                className="flex items-center gap-3 w-full p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl hover:bg-blue-500/20 transition-colors"
              >
                <Mail className="w-5 h-5 text-blue-400" />
                <span className="text-sm font-medium text-white">Send Email</span>
              </a>
              {lead.phone && (
                <a
                  href={`tel:${lead.phone}`}
                  className="flex items-center gap-3 w-full p-3 bg-green-500/10 border border-green-500/20 rounded-xl hover:bg-green-500/20 transition-colors"
                >
                  <Phone className="w-5 h-5 text-green-400" />
                  <span className="text-sm font-medium text-white">Call</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
