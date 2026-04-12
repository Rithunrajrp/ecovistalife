import { requireManagerOrAdmin } from '@/lib/dal'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Users, Mail, Shield, MoreHorizontal, Search } from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { StatusBadge } from '@/components/portal/ui/StatusBadge'

export const dynamic = 'force-dynamic'

async function getTeamMembers() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      department:department_id (name)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching team members:', error)
    return []
  }

  return data || []
}

async function getPendingInvitations() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('portal_invitations')
    .select(`
      *,
      invited_by_user:invited_by (full_name)
    `)
    .is('accepted_at', null)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching invitations:', error.message, error.details, error.hint)
    return []
  }

  return data || []
}

const roleColors: Record<string, string> = {
  admin: 'text-red-400 bg-red-500/10 border-red-500/20',
  manager: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  staff: 'text-gray-400 bg-gray-500/10 border-gray-500/20',
}

export default async function TeamPage() {
  await requireManagerOrAdmin()
  const [teamMembers, invitations] = await Promise.all([
    getTeamMembers(),
    getPendingInvitations(),
  ])

  const stats = {
    total: teamMembers.length,
    active: teamMembers.filter(m => m.is_active).length,
    admins: teamMembers.filter(m => m.role === 'admin').length,
    managers: teamMembers.filter(m => m.role === 'manager').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Team</h1>
          <p className="text-gray-400 mt-1">Manage team members and invitations</p>
        </div>
        <Link
          href="/team/invite"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#D4AF37] hover:bg-[#C4A030] text-black font-semibold rounded-xl transition-colors"
        >
          <Plus className="w-5 h-5" />
          Invite Member
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-4">
          <p className="text-sm text-gray-400">Total Members</p>
          <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
        </div>
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-4">
          <p className="text-sm text-gray-400">Active</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{stats.active}</p>
        </div>
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-4">
          <p className="text-sm text-gray-400">Admins</p>
          <p className="text-2xl font-bold text-red-400 mt-1">{stats.admins}</p>
        </div>
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-4">
          <p className="text-sm text-gray-400">Managers</p>
          <p className="text-2xl font-bold text-blue-400 mt-1">{stats.managers}</p>
        </div>
      </div>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <div className="bg-[#111827] border border-gray-800 rounded-2xl p-5">
          <h3 className="text-lg font-semibold text-white mb-4">Pending Invitations</h3>
          <div className="space-y-3">
            {invitations.map((invite) => (
              <div
                key={invite.id}
                className="flex items-center justify-between p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{invite.email}</p>
                    <p className="text-xs text-gray-500">
                      Invited by {invite.invited_by_user?.full_name} · Expires{' '}
                      {formatDistanceToNow(new Date(invite.expires_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${roleColors[invite.role]}`}>
                  {invite.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Team Members */}
      <div className="bg-[#111827] border border-gray-800 rounded-2xl overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 border-b border-gray-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search team members..."
              className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]/50"
            />
          </div>
        </div>

        {teamMembers.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">No team members yet</p>
            <Link
              href="/team/invite"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#D4AF37] hover:bg-[#C4A030] text-black font-semibold rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Invite First Member
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Member</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Role</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Department</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Joined</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400"></th>
                </tr>
              </thead>
              <tbody>
                {teamMembers.map((member) => (
                  <tr
                    key={member.id}
                    className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                          <span className="text-[#D4AF37] font-semibold text-sm">
                            {member.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || '?'}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-medium">{member.full_name}</p>
                          <p className="text-xs text-gray-500">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${roleColors[member.role]}`}>
                        {member.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-400 text-sm">
                      {member.department?.name || '-'}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={member.is_active ? 'active' : 'inactive'} />
                    </td>
                    <td className="py-3 px-4 text-gray-400 text-sm">
                      {format(new Date(member.created_at), 'MMM d, yyyy')}
                    </td>
                    <td className="py-3 px-4">
                      <Link
                        href={`/team/${member.id}`}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors inline-flex"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Link>
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
