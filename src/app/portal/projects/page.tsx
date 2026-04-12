import { verifySession } from '@/lib/dal'
import { createClient } from '@/lib/supabase/server'
import { FolderKanban, MapPin, IndianRupee } from 'lucide-react'
import { StatusBadge } from '@/components/portal/ui/StatusBadge'

export const dynamic = 'force-dynamic'

async function getProjects() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching projects:', error)
    return []
  }

  return data || []
}

export default async function ProjectsPage() {
  await verifySession()
  const projects = await getProjects()

  const stats = {
    total: projects.length,
    ongoing: projects.filter(p => p.type === 'ongoing').length,
    upcoming: projects.filter(p => p.type === 'upcoming').length,
    completed: projects.filter(p => p.type === 'completed').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Projects</h1>
        <p className="text-gray-400 mt-1">View and manage real estate projects</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-4">
          <p className="text-sm text-gray-400">Total Projects</p>
          <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
        </div>
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-4">
          <p className="text-sm text-gray-400">Ongoing</p>
          <p className="text-2xl font-bold text-blue-400 mt-1">{stats.ongoing}</p>
        </div>
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-4">
          <p className="text-sm text-gray-400">Upcoming</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">{stats.upcoming}</p>
        </div>
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-4">
          <p className="text-sm text-gray-400">Completed</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{stats.completed}</p>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.length === 0 ? (
          <div className="col-span-full bg-[#111827] border border-gray-800 rounded-2xl p-8 text-center">
            <FolderKanban className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No projects found</p>
          </div>
        ) : (
          projects.map((project) => (
            <div
              key={project.id}
              className="bg-[#111827] border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-700 transition-colors"
            >
              {project.image && (
                <div className="aspect-video relative">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <StatusBadge status={project.type} />
                  </div>
                </div>
              )}
              <div className="p-5">
                <h3 className="text-lg font-semibold text-white">{project.title}</h3>
                {project.location && (
                  <div className="flex items-center gap-1.5 mt-2 text-gray-400">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{project.location}</span>
                  </div>
                )}
                {project.price && (
                  <div className="flex items-center gap-1.5 mt-2 text-[#D4AF37]">
                    <IndianRupee className="w-4 h-4" />
                    <span className="text-sm font-medium">{project.price}</span>
                  </div>
                )}
                {project.description && (
                  <p className="mt-3 text-sm text-gray-500 line-clamp-2">
                    {project.description}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
