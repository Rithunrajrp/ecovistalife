'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import { createLead, updateLead, type FormState } from './actions'

interface TeamMember {
  id: string
  full_name: string
  role: string
}

interface Project {
  id: string
  title: string
  type: string
}

interface Lead {
  id: string
  first_name: string
  last_name: string | null
  email: string
  phone: string | null
  company: string | null
  source: string
  status: string
  priority: string | null
  interested_in_project: string | null
  budget_range: string | null
  initial_message: string | null
  assigned_to: string | null
}

interface LeadFormProps {
  lead?: Lead
  teamMembers: TeamMember[]
  projects: Project[]
}

const sources = [
  { value: 'website_form', label: 'Website Form' },
  { value: 'phone', label: 'Phone Call' },
  { value: 'email', label: 'Email' },
  { value: 'referral', label: 'Referral' },
  { value: 'social', label: 'Social Media' },
  { value: 'other', label: 'Other' },
]

const statuses = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
]

const priorities = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
]

export function LeadForm({ lead, teamMembers, projects }: LeadFormProps) {
  const isEditing = !!lead

  const action = isEditing
    ? updateLead.bind(null, lead.id)
    : createLead

  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    action,
    {}
  )

  return (
    <form action={formAction} className="space-y-6">
      {/* Error Message */}
      {state.message && !state.success && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
          <p className="text-sm text-red-400">{state.message}</p>
        </div>
      )}

      {/* Success Message */}
      {state.success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
          <p className="text-sm text-emerald-400">{state.message}</p>
        </div>
      )}

      <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 space-y-6">
        {/* Contact Information */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-gray-300 mb-2">
                First Name <span className="text-red-400">*</span>
              </label>
              <input
                id="first_name"
                name="first_name"
                type="text"
                defaultValue={lead?.first_name}
                required
                className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]/50"
                placeholder="John"
              />
              {state.errors?.first_name && (
                <p className="mt-1 text-sm text-red-400">{state.errors.first_name[0]}</p>
              )}
            </div>

            <div>
              <label htmlFor="last_name" className="block text-sm font-medium text-gray-300 mb-2">
                Last Name
              </label>
              <input
                id="last_name"
                name="last_name"
                type="text"
                defaultValue={lead?.last_name || ''}
                className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]/50"
                placeholder="Doe"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email <span className="text-red-400">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                defaultValue={lead?.email}
                required
                className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]/50"
                placeholder="john@example.com"
              />
              {state.errors?.email && (
                <p className="mt-1 text-sm text-red-400">{state.errors.email[0]}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                Phone
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={lead?.phone || ''}
                className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]/50"
                placeholder="+91 98765 43210"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="company" className="block text-sm font-medium text-gray-300 mb-2">
                Company
              </label>
              <input
                id="company"
                name="company"
                type="text"
                defaultValue={lead?.company || ''}
                className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]/50"
                placeholder="Acme Corp"
              />
            </div>
          </div>
        </div>

        {/* Lead Details */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Lead Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="source" className="block text-sm font-medium text-gray-300 mb-2">
                Source
              </label>
              <select
                id="source"
                name="source"
                defaultValue={lead?.source || 'website_form'}
                className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-[#D4AF37]/50"
              >
                {sources.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-2">
                Status
              </label>
              <select
                id="status"
                name="status"
                defaultValue={lead?.status || 'new'}
                className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-[#D4AF37]/50"
              >
                {statuses.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-300 mb-2">
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                defaultValue={lead?.priority || 'medium'}
                className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-[#D4AF37]/50"
              >
                <option value="">Select priority</option>
                {priorities.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="assigned_to" className="block text-sm font-medium text-gray-300 mb-2">
                Assigned To
              </label>
              <select
                id="assigned_to"
                name="assigned_to"
                defaultValue={lead?.assigned_to || ''}
                className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-[#D4AF37]/50"
              >
                <option value="">Unassigned</option>
                {teamMembers.map(m => (
                  <option key={m.id} value={m.id}>{m.full_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="interested_in_project" className="block text-sm font-medium text-gray-300 mb-2">
                Interested In Project
              </label>
              <select
                id="interested_in_project"
                name="interested_in_project"
                defaultValue={lead?.interested_in_project || ''}
                className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-[#D4AF37]/50"
              >
                <option value="">Select project</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.title} ({p.type})</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="budget_range" className="block text-sm font-medium text-gray-300 mb-2">
                Budget Range
              </label>
              <input
                id="budget_range"
                name="budget_range"
                type="text"
                defaultValue={lead?.budget_range || ''}
                className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]/50"
                placeholder="₹50L - ₹1Cr"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="initial_message" className="block text-sm font-medium text-gray-300 mb-2">
                Initial Message / Notes
              </label>
              <textarea
                id="initial_message"
                name="initial_message"
                rows={4}
                defaultValue={lead?.initial_message || ''}
                className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]/50 resize-none"
                placeholder="Any notes about this lead..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Link
          href="/leads"
          className="inline-flex items-center gap-2 px-4 py-2.5 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Leads
        </Link>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#D4AF37] hover:bg-[#C4A030] text-black font-semibold rounded-xl transition-colors disabled:opacity-50"
        >
          {isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {isEditing ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              {isEditing ? 'Update Lead' : 'Create Lead'}
            </>
          )}
        </button>
      </div>
    </form>
  )
}
