'use client'

import { useActionState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, LogIn, AlertCircle, CheckCircle } from 'lucide-react'
import { login, type FormState } from '../actions/auth'

export default function PortalLoginPage() {
  const searchParams = useSearchParams()
  const message = searchParams.get('message')
  const error = searchParams.get('error')

  const [showPassword, setShowPassword] = useState(false)
  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    login,
    {}
  )

  return (
    <div className="min-h-screen bg-[#0B0F14] flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-[url('/grid.svg')] opacity-5" />

      {/* Login Card */}
      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#D4AF37] rounded-2xl mb-4">
            <span className="text-black font-bold text-2xl">E</span>
          </div>
          <h1 className="text-2xl font-bold text-white">EcoVista CRM</h1>
          <p className="text-gray-500 mt-1">Sign in to your account</p>
        </div>

        {/* Success Message */}
        {message && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <p className="text-sm text-emerald-400">{message}</p>
          </div>
        )}

        {/* Error from URL */}
        {error === 'unauthorized' && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-400">Your account is not authorized for portal access.</p>
          </div>
        )}

        {/* Form Error */}
        {state.message && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-400">{state.message}</p>
          </div>
        )}

        {/* Login Form */}
        <form action={formAction} className="bg-[#111827] border border-gray-800 rounded-2xl p-6 space-y-5">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/50 transition-colors"
              placeholder="you@example.com"
            />
            {state.errors?.email && (
              <p className="mt-1 text-sm text-red-400">{state.errors.email[0]}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                className="w-full px-4 py-3 pr-12 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/50 transition-colors"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-300"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {state.errors?.password && (
              <p className="mt-1 text-sm text-red-400">{state.errors.password[0]}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#D4AF37] hover:bg-[#C4A030] text-black font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <>
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Sign In
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-gray-500">
          Don&apos;t have an account?{' '}
          <span className="text-gray-400">Contact your administrator for an invitation.</span>
        </p>

        {/* Back to Website */}
        <div className="mt-4 text-center">
          <Link
            href="/"
            className="text-sm text-[#D4AF37] hover:text-[#C4A030] transition-colors"
          >
            &larr; Back to website
          </Link>
        </div>
      </div>
    </div>
  )
}
