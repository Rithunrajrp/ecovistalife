import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AcceptInviteForm } from './AcceptInviteForm'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ token?: string }>
}

async function getInvitation(token: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('portal_invitations')
    .select(`
      *,
      invited_by_user:invited_by (full_name),
      department:department_id (name)
    `)
    .eq('token', token)
    .eq('status', 'pending')
    .single()

  if (error || !data) {
    return null
  }

  // Check if expired
  if (new Date(data.expires_at) < new Date()) {
    return { ...data, expired: true }
  }

  return data
}

export default async function AcceptInvitePage({ searchParams }: PageProps) {
  const { token } = await searchParams

  if (!token) {
    redirect('/login?error=invalid_token')
  }

  const invitation = await getInvitation(token)

  if (!invitation) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#111827] border border-gray-800 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-white mb-2">Invalid Invitation</h1>
          <p className="text-gray-400 mb-6">
            This invitation link is invalid or has already been used.
          </p>
          <a
            href="/login"
            className="inline-flex items-center justify-center px-6 py-2.5 bg-[#D4AF37] hover:bg-[#C4A030] text-black font-semibold rounded-xl transition-colors"
          >
            Go to Login
          </a>
        </div>
      </div>
    )
  }

  if (invitation.expired) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#111827] border border-gray-800 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-white mb-2">Invitation Expired</h1>
          <p className="text-gray-400 mb-6">
            This invitation has expired. Please contact your administrator for a new invitation.
          </p>
          <a
            href="/login"
            className="inline-flex items-center justify-center px-6 py-2.5 bg-[#D4AF37] hover:bg-[#C4A030] text-black font-semibold rounded-xl transition-colors"
          >
            Go to Login
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Join the Team</h1>
          <p className="text-gray-400">
            You&apos;ve been invited by {invitation.invited_by_user?.full_name} to join as a{' '}
            <span className="text-[#D4AF37] font-medium">{invitation.role}</span>
            {invitation.department && (
              <> in the <span className="text-white">{invitation.department.name}</span> department</>
            )}
            .
          </p>
        </div>

        <AcceptInviteForm token={token} email={invitation.email} />
      </div>
    </div>
  )
}
