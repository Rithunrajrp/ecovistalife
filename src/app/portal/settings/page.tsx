import { verifySession, requireAdmin } from '@/lib/dal'
import { createClient } from '@/lib/supabase/server'
import { Settings, User, Bell, Shield, Palette, Database, Bot } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

async function getUserProfile(userId: string) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  return data
}

export default async function SettingsPage() {
  const session = await verifySession()
  const profile = await getUserProfile(session.userId)

  const settingsSections = [
    {
      title: 'Profile Settings',
      description: 'Manage your personal information and preferences',
      icon: User,
      href: '/settings/profile',
      color: 'blue',
    },
    {
      title: 'Notifications',
      description: 'Configure email and push notification preferences',
      icon: Bell,
      href: '/settings/notifications',
      color: 'amber',
    },
    {
      title: 'Security',
      description: 'Password, two-factor authentication, and sessions',
      icon: Shield,
      href: '/settings/security',
      color: 'red',
    },
    {
      title: 'Appearance',
      description: 'Customize the look and feel of the portal',
      icon: Palette,
      href: '/settings/appearance',
      color: 'purple',
    },
  ]

  const adminSections = [
    {
      title: 'AI Configuration',
      description: 'Configure AI providers and features',
      icon: Bot,
      href: '/settings/ai',
      color: 'emerald',
    },
    {
      title: 'System Settings',
      description: 'Database, integrations, and advanced settings',
      icon: Database,
      href: '/settings/system',
      color: 'gray',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 mt-1">Manage your account and portal preferences</p>
      </div>

      {/* User Card */}
      <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
            <span className="text-2xl font-bold text-[#D4AF37]">
              {profile?.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || '?'}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">{profile?.full_name}</h2>
            <p className="text-gray-400">{profile?.email}</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 text-xs font-medium rounded-full bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 capitalize">
              {profile?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {settingsSections.map((section) => {
          const Icon = section.icon
          return (
            <Link
              key={section.title}
              href={section.href}
              className="bg-[#111827] border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-colors group"
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl bg-${section.color}-500/10 border border-${section.color}-500/20 flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 text-${section.color}-400`} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white group-hover:text-[#D4AF37] transition-colors">
                    {section.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">{section.description}</p>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Admin Sections */}
      {session.role === 'admin' && (
        <>
          <div className="border-t border-gray-800 pt-6">
            <h2 className="text-lg font-semibold text-white mb-4">Administration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {adminSections.map((section) => {
                const Icon = section.icon
                return (
                  <Link
                    key={section.title}
                    href={section.href}
                    className="bg-[#111827] border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-colors group"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl bg-${section.color}-500/10 border border-${section.color}-500/20 flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 text-${section.color}-400`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white group-hover:text-[#D4AF37] transition-colors">
                          {section.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">{section.description}</p>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </>
      )}

      {/* Danger Zone */}
      <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-red-400 mb-2">Danger Zone</h3>
        <p className="text-sm text-gray-400 mb-4">
          Irreversible actions that affect your account
        </p>
        <div className="flex flex-wrap gap-3">
          <button className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors text-sm font-medium">
            Deactivate Account
          </button>
          <button className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors text-sm font-medium">
            Export All Data
          </button>
        </div>
      </div>
    </div>
  )
}
