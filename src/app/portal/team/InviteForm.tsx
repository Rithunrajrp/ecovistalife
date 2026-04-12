'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Send, Loader2, CheckCircle } from 'lucide-react'
import { inviteTeamMember, type FormState } from './actions'

interface Department {
  id: string
  name: string
}

interface InviteFormProps {
  departments: Department[]
}

const roles = [
  { value: 'staff', label: 'Staff', description: 'Can view and manage assigned leads' },
  { value: 'manager', label: 'Manager', description: 'Can manage team, leads, and view reports' },
  { value: 'admin', label: 'Admin', description: 'Full access to all features and settings' },
]

export function InviteForm({ departments }: InviteFormProps) {
  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    inviteTeamMember,
    {}
  )

  if (state.success) {
    return (
      <div className="bg-[#111827] border border-gray-800 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-emerald-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Invitation Sent!</h3>
        <p className="text-gray-400 mb-6">{state.message}</p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/team"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-colors"
          >
            Back to Team
          </Link>
          <Link
            href="/team/invite"
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#D4AF37] hover:bg-[#C4A030] text-black font-semibold rounded-xl transition-colors"
          >
            Invite Another
          </Link>
        </div>
      </div>
    )
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
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
            Email Address <span className="text-red-400">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]/50"
            placeholder="colleague@company.com"
          />
          {state.errors?.email && (
            <p className="mt-1 text-sm text-red-400">{state.errors.email[0]}</p>
          )}
        </div>

        {/* Role Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Role <span className="text-red-400">*</span>
          </label>
          <div className="space-y-3">
            {roles.map((role) => (
              <label
                key={role.value}
                className="flex items-start gap-3 p-4 bg-gray-800/50 border border-gray-700 rounded-xl cursor-pointer hover:bg-gray-800 transition-colors has-[:checked]:border-[#D4AF37]/50 has-[:checked]:bg-[#D4AF37]/5"
              >
                <input
                  type="radio"
                  name="role"
                  value={role.value}
                  defaultChecked={role.value === 'staff'}
                  className="mt-0.5 w-4 h-4 text-[#D4AF37] border-gray-600 focus:ring-[#D4AF37]/50"
                />
                <div>
                  <p className="text-white font-medium">{role.label}</p>
                  <p className="text-sm text-gray-500">{role.description}</p>
                </div>
              </label>
            ))}
          </div>
          {state.errors?.role && (
            <p className="mt-1 text-sm text-red-400">{state.errors.role[0]}</p>
          )}
        </div>

        {/* Department */}
        {departments.length > 0 && (
          <div>
            <label htmlFor="department_id" className="block text-sm font-medium text-gray-300 mb-2">
              Department (Optional)
            </label>
            <select
              id="department_id"
              name="department_id"
              defaultValue=""
              className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-[#D4AF37]/50"
            >
              <option value="">No department</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Link
          href="/team"
          className="inline-flex items-center gap-2 px-4 py-2.5 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Team
        </Link>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#D4AF37] hover:bg-[#C4A030] text-black font-semibold rounded-xl transition-colors disabled:opacity-50"
        >
          {isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Send Invitation
            </>
          )}
        </button>
      </div>
    </form>
  )
}
