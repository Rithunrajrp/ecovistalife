import { verifySession } from '@/lib/dal'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { ProfileForm } from './ProfileForm'

export const dynamic = 'force-dynamic'

export default async function ProfileSettingsPage() {
  const session = await verifySession()
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, email, phone, role, avatar_url')
    .eq('id', session.userId)
    .single()

  if (!profile) {
    return (
      <div className="text-center py-16 text-gray-500">
        Could not load profile. Please refresh.
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back */}
      <Link
        href="/settings"
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Settings
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
        <p className="text-gray-400 mt-1">Manage your personal information</p>
      </div>

      <ProfileForm profile={profile} />
    </div>
  )
}
