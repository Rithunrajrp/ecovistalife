import { requireManagerOrAdmin } from '@/lib/dal'
import { getDepartments } from '../actions'
import { InviteForm } from '../InviteForm'

export default async function InviteTeamMemberPage() {
  await requireManagerOrAdmin()
  const departments = await getDepartments()

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Invite Team Member</h1>
        <p className="text-gray-400 mt-1">
          Send an invitation to add a new member to your team.
        </p>
      </div>

      {/* Form */}
      <InviteForm departments={departments} />
    </div>
  )
}
