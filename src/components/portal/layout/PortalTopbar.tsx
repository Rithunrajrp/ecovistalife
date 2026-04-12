'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Bell, Search, ChevronDown, LogOut, Settings, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/lib/dal'

interface PortalTopbarProps {
  user: {
    full_name: string
    email: string
    role: UserRole
    avatar_url?: string | null
  }
  onLogout: () => void
}

export function PortalTopbar({ user, onLogout }: PortalTopbarProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#0B0F14]/95 backdrop-blur-sm border-b border-gray-800">
      <div className="h-full px-4 lg:px-6 flex items-center justify-between gap-4">
        {/* Search - Hidden on mobile, visible on larger screens */}
        <div className="hidden md:flex flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search leads, projects, documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/50"
            />
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3 ml-auto">
          {/* Mobile Search Button */}
          <button className="md:hidden p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg">
            <Search className="w-5 h-5" />
          </button>

          {/* Notifications */}
          <button className="relative p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#D4AF37] rounded-full" />
          </button>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-1.5 pr-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                <span className="text-[#D4AF37] font-semibold text-sm">
                  {user.full_name.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="hidden sm:block text-sm font-medium text-white">
                {user.full_name.split(' ')[0]}
              </span>
              <ChevronDown className={cn(
                'w-4 h-4 transition-transform',
                isProfileOpen && 'rotate-180'
              )} />
            </button>

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsProfileOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 py-2 bg-[#111827] border border-gray-800 rounded-xl shadow-xl z-50">
                  <div className="px-4 py-3 border-b border-gray-800">
                    <p className="text-sm font-medium text-white">{user.full_name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-[#D4AF37]/20 text-[#D4AF37] rounded capitalize">
                      {user.role}
                    </span>
                  </div>

                  <div className="py-1">
                    <Link
                      href="/settings/profile"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      Your Profile
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link>
                  </div>

                  <div className="border-t border-gray-800 py-1">
                    <button
                      onClick={() => {
                        setIsProfileOpen(false)
                        onLogout()
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
