'use client'

import { useActionState } from 'react'
import { UserPlus, Loader2, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { acceptInvite, type FormState } from './actions'

interface AcceptInviteFormProps {
  token: string
  email: string
}

export function AcceptInviteForm({ token, email }: AcceptInviteFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    acceptInvite,
    {}
  )

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="email" value={email} />

      {/* Error Message */}
      {state.message && !state.success && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
          <p className="text-sm text-red-400">{state.message}</p>
        </div>
      )}

      <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 space-y-4">
        {/* Email (readonly) */}
        <div>
          <label htmlFor="email_display" className="block text-sm font-medium text-gray-300 mb-2">
            Email
          </label>
          <input
            id="email_display"
            type="email"
            value={email}
            readOnly
            className="w-full px-4 py-2.5 bg-gray-800/30 border border-gray-700 rounded-xl text-gray-400 cursor-not-allowed"
          />
        </div>

        {/* Full Name */}
        <div>
          <label htmlFor="full_name" className="block text-sm font-medium text-gray-300 mb-2">
            Full Name <span className="text-red-400">*</span>
          </label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            required
            className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]/50"
            placeholder="John Doe"
          />
          {state.errors?.full_name && (
            <p className="mt-1 text-sm text-red-400">{state.errors.full_name[0]}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
            Password <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              minLength={8}
              className="w-full px-4 py-2.5 pr-12 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]/50"
              placeholder="Min. 8 characters"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {state.errors?.password && (
            <p className="mt-1 text-sm text-red-400">{state.errors.password[0]}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-300 mb-2">
            Confirm Password <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <input
              id="confirm_password"
              name="confirm_password"
              type={showConfirmPassword ? 'text' : 'password'}
              required
              className="w-full px-4 py-2.5 pr-12 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]/50"
              placeholder="Confirm your password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {state.errors?.confirm_password && (
            <p className="mt-1 text-sm text-red-400">{state.errors.confirm_password[0]}</p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#D4AF37] hover:bg-[#C4A030] text-black font-semibold rounded-xl transition-colors disabled:opacity-50"
      >
        {isPending ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Creating Account...
          </>
        ) : (
          <>
            <UserPlus className="w-5 h-5" />
            Create Account & Join
          </>
        )}
      </button>

      <p className="text-center text-sm text-gray-500">
        Already have an account?{' '}
        <a href="/login" className="text-[#D4AF37] hover:text-[#C4A030]">
          Login instead
        </a>
      </p>
    </form>
  )
}
