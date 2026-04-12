import { verifySession } from '@/lib/dal'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, FileText, Folder, Search, Filter, Download, Eye } from 'lucide-react'
import { format } from 'date-fns'

export const dynamic = 'force-dynamic'

async function getDocuments() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('documents')
    .select(`
      *,
      uploaded_by_user:uploaded_by (full_name),
      lead:lead_id (first_name, last_name),
      deal:deal_id (title)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching documents:', error)
    return []
  }

  return data || []
}

const documentCategories = [
  { value: 'contract', label: 'Contracts', color: 'blue' },
  { value: 'proposal', label: 'Proposals', color: 'purple' },
  { value: 'agreement', label: 'Agreements', color: 'green' },
  { value: 'invoice', label: 'Invoices', color: 'amber' },
  { value: 'legal', label: 'Legal', color: 'red' },
  { value: 'other', label: 'Other', color: 'gray' },
]

function getCategoryColor(category: string) {
  const cat = documentCategories.find(c => c.value === category)
  return cat?.color || 'gray'
}

function getFileIcon(mimeType: string) {
  if (mimeType?.includes('pdf')) return '📄'
  if (mimeType?.includes('image')) return '🖼️'
  if (mimeType?.includes('word') || mimeType?.includes('document')) return '📝'
  if (mimeType?.includes('excel') || mimeType?.includes('spreadsheet')) return '📊'
  return '📁'
}

function formatFileSize(bytes: number) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export default async function DocumentsPage() {
  await verifySession()
  const documents = await getDocuments()

  const stats = {
    total: documents.length,
    contracts: documents.filter(d => d.category === 'contract').length,
    proposals: documents.filter(d => d.category === 'proposal').length,
    other: documents.filter(d => !['contract', 'proposal'].includes(d.category)).length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Documents</h1>
          <p className="text-gray-400 mt-1">Manage all your files and documents</p>
        </div>
        <Link
          href="/documents/upload"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#D4AF37] hover:bg-[#C4A030] text-black font-semibold rounded-xl transition-colors"
        >
          <Plus className="w-5 h-5" />
          Upload Document
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-4">
          <p className="text-sm text-gray-400">Total Documents</p>
          <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
        </div>
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-4">
          <p className="text-sm text-gray-400">Contracts</p>
          <p className="text-2xl font-bold text-blue-400 mt-1">{stats.contracts}</p>
        </div>
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-4">
          <p className="text-sm text-gray-400">Proposals</p>
          <p className="text-2xl font-bold text-purple-400 mt-1">{stats.proposals}</p>
        </div>
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-4">
          <p className="text-sm text-gray-400">Other</p>
          <p className="text-2xl font-bold text-gray-400 mt-1">{stats.other}</p>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        <button className="px-4 py-2 bg-[#D4AF37]/20 border border-[#D4AF37]/30 text-[#D4AF37] rounded-lg text-sm font-medium">
          All
        </button>
        {documentCategories.map(cat => (
          <button
            key={cat.value}
            className="px-4 py-2 bg-gray-800 border border-gray-700 text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Documents Grid */}
      <div className="bg-[#111827] border border-gray-800 rounded-2xl overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 border-b border-gray-800 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search documents..."
              className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]/50"
            />
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>

        {documents.length === 0 ? (
          <div className="p-12 text-center">
            <Folder className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">No documents uploaded yet</p>
            <Link
              href="/documents/upload"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#D4AF37] hover:bg-[#C4A030] text-black font-semibold rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Upload First Document
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 hover:border-gray-600 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getFileIcon(doc.mime_type)}</span>
                    <div>
                      <h3 className="text-white font-medium line-clamp-1">{doc.name}</h3>
                      <p className="text-xs text-gray-500">{formatFileSize(doc.size)}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 text-xs rounded-full bg-${getCategoryColor(doc.category)}-500/10 text-${getCategoryColor(doc.category)}-400 border border-${getCategoryColor(doc.category)}-500/20`}>
                    {doc.category}
                  </span>
                </div>

                {doc.description && (
                  <p className="text-sm text-gray-400 mb-3 line-clamp-2">{doc.description}</p>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>
                    {doc.uploaded_by_user?.full_name} · {format(new Date(doc.created_at), 'MMM d, yyyy')}
                  </span>
                  <div className="flex items-center gap-2">
                    <button className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {(doc.lead || doc.deal) && (
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <p className="text-xs text-gray-500">
                      Linked to:{' '}
                      {doc.lead && (
                        <Link href={`/leads/${doc.lead_id}`} className="text-[#D4AF37] hover:underline">
                          {doc.lead.first_name} {doc.lead.last_name}
                        </Link>
                      )}
                      {doc.deal && (
                        <span className="text-[#D4AF37]">{doc.deal.title}</span>
                      )}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
