import { verifySession } from '@/lib/dal'
import { getLeadsForDocument } from '../actions'
import { DocumentUploadForm } from '../DocumentUploadForm'

export default async function UploadDocumentPage() {
  await verifySession()
  const leads = await getLeadsForDocument()

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Upload Document</h1>
        <p className="text-gray-400 mt-1">
          Upload a new document to the system.
        </p>
      </div>

      {/* Form */}
      <DocumentUploadForm leads={leads} />
    </div>
  )
}
