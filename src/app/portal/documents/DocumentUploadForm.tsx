'use client'

import { useState, useActionState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Upload, Loader2, X, FileText } from 'lucide-react'
import { uploadDocument, type FormState } from './actions'

interface Lead {
  id: string
  first_name: string
  last_name: string | null
}

interface DocumentUploadFormProps {
  leads: Lead[]
}

const documentCategories = [
  { value: 'contract', label: 'Contract' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'agreement', label: 'Agreement' },
  { value: 'invoice', label: 'Invoice' },
  { value: 'legal', label: 'Legal' },
  { value: 'other', label: 'Other' },
]

export function DocumentUploadForm({ leads }: DocumentUploadFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    uploadDocument,
    {}
  )

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <form action={formAction} className="space-y-6">
      {/* Error Message */}
      {state.message && !state.success && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
          <p className="text-sm text-red-400">{state.message}</p>
        </div>
      )}

      <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 space-y-6">
        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            File <span className="text-red-400">*</span>
          </label>

          {!selectedFile ? (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                dragActive
                  ? 'border-[#D4AF37] bg-[#D4AF37]/5'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              <input
                type="file"
                name="file"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className="w-10 h-10 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-300 mb-1">
                Drag and drop your file here, or click to browse
              </p>
              <p className="text-sm text-gray-500">
                Supports PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (max 10MB)
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-[#D4AF37]" />
                <div>
                  <p className="text-white font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <input type="file" name="file" className="hidden" />
            </div>
          )}

          {/* Hidden file input for form submission when file is already selected */}
          {selectedFile && (
            <input
              type="file"
              name="file"
              className="hidden"
              ref={(input) => {
                if (input && selectedFile) {
                  const dataTransfer = new DataTransfer()
                  dataTransfer.items.add(selectedFile)
                  input.files = dataTransfer.files
                }
              }}
            />
          )}
        </div>

        {/* Document Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
              Document Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              defaultValue={selectedFile?.name.replace(/\.[^/.]+$/, '') || ''}
              placeholder={selectedFile?.name || 'Enter document name'}
              className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]/50"
            />
            {state.errors?.name && (
              <p className="mt-1 text-sm text-red-400">{state.errors.name[0]}</p>
            )}
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">
              Category <span className="text-red-400">*</span>
            </label>
            <select
              id="category"
              name="category"
              defaultValue="other"
              required
              className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-[#D4AF37]/50"
            >
              {documentCategories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
            {state.errors?.category && (
              <p className="mt-1 text-sm text-red-400">{state.errors.category[0]}</p>
            )}
          </div>

          <div>
            <label htmlFor="lead_id" className="block text-sm font-medium text-gray-300 mb-2">
              Link to Lead (Optional)
            </label>
            <select
              id="lead_id"
              name="lead_id"
              defaultValue=""
              className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-[#D4AF37]/50"
            >
              <option value="">No linked lead</option>
              {leads.map(lead => (
                <option key={lead.id} value={lead.id}>
                  {lead.first_name} {lead.last_name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]/50 resize-none"
              placeholder="Brief description of the document..."
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Link
          href="/documents"
          className="inline-flex items-center gap-2 px-4 py-2.5 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Documents
        </Link>

        <button
          type="submit"
          disabled={isPending || !selectedFile}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#D4AF37] hover:bg-[#C4A030] text-black font-semibold rounded-xl transition-colors disabled:opacity-50"
        >
          {isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              Upload Document
            </>
          )}
        </button>
      </div>
    </form>
  )
}
