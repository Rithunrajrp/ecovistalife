'use client'

import { useRouter } from 'next/navigation'
import { PortalSidebar } from '@/components/portal/layout/PortalSidebar'
import { PortalTopbar } from '@/components/portal/layout/PortalTopbar'
import { AIAssistantPanel } from '@/components/portal/ai/AIAssistantPanel'
import { createClient } from '@/lib/supabase/client'
import type { PortalUser } from '@/lib/dal'

interface PortalLayoutClientProps {
  user: PortalUser
  children: React.ReactNode
}

export function PortalLayoutClient({ user, children }: PortalLayoutClientProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-[#0B0F14] text-white">
      <PortalSidebar
        user={{
          full_name: user.full_name,
          email: user.email,
          role: user.role,
          avatar_url: user.avatar_url,
        }}
        onLogout={handleLogout}
      />

      <div className="lg:pl-64">
        <PortalTopbar
          user={{
            full_name: user.full_name,
            email: user.email,
            role: user.role,
            avatar_url: user.avatar_url,
          }}
          onLogout={handleLogout}
        />

        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>

      {/* AI Assistant */}
      <AIAssistantPanel />
    </div>
  )
}
