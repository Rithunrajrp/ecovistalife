import { verifySession } from '@/lib/dal'
import { getTeamMembers, getProjects } from '../actions'
import { LeadForm } from '../LeadForm'

export default async function NewLeadPage() {
  await verifySession()
  const [teamMembers, projects] = await Promise.all([
    getTeamMembers(),
    getProjects(),
  ])

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Add New Lead</h1>
        <p className="text-gray-400 mt-1">
          Enter the lead details below to add them to your pipeline.
        </p>
      </div>

      {/* Form */}
      <LeadForm teamMembers={teamMembers} projects={projects} />
    </div>
  )
}
