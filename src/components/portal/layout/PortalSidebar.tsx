'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  DollarSign,
  FileText,
  UsersRound,
  BarChart3,
  Settings,
  ChevronDown,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/lib/dal'

interface NavItem {
  name: string
  href: string
  icon: React.ElementType
  roles?: UserRole[]
  children?: { name: string; href: string }[]
}

const navigation: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Leads',
    href: '/leads',
    icon: Users,
  },
  {
    name: 'Projects',
    href: '/projects',
    icon: FolderKanban,
  },
  {
    name: 'Finance',
    href: '/finance',
    icon: DollarSign,
    roles: ['admin', 'manager'],
    children: [
      { name: 'Overview', href: '/finance' },
      { name: 'Invoices', href: '/finance/invoices' },
      { name: 'Payments', href: '/finance/payments' },
    ],
  },
  {
    name: 'Documents',
    href: '/documents',
    icon: FileText,
  },
  {
    name: 'Team',
    href: '/team',
    icon: UsersRound,
    roles: ['admin', 'manager'],
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    roles: ['admin', 'manager'],
  },
]

interface PortalSidebarProps {
  user: {
    full_name: string
    email: string
    role: UserRole
    avatar_url?: string | null
  }
  onLogout: () => void
}

export function PortalSidebar({ user, onLogout }: PortalSidebarProps) {
  const pathname = usePathname()
  const [openMenus, setOpenMenus] = useState<string[]>([])
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const toggleMenu = (name: string) => {
    setOpenMenus(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    )
  }

  const filteredNav = navigation.filter(item =>
    !item.roles || item.roles.includes(user.role)
  )

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/portal' || pathname === '/portal/dashboard'
    }
    return pathname.startsWith(href) || pathname.startsWith(`/portal${href}`)
  }

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center h-16 px-6 border-b border-gray-800">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#D4AF37] rounded-lg flex items-center justify-center">
            <span className="text-black font-bold text-lg">E</span>
          </div>
          <span className="text-lg font-semibold text-white">EcoVista CRM</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {filteredNav.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          const hasChildren = item.children && item.children.length > 0
          const isOpen = openMenus.includes(item.name)

          return (
            <div key={item.name}>
              {hasChildren ? (
                <button
                  onClick={() => toggleMenu(item.name)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                    active
                      ? 'bg-[#D4AF37]/10 text-[#D4AF37]'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  )}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </span>
                  <ChevronDown
                    className={cn(
                      'w-4 h-4 transition-transform',
                      isOpen && 'rotate-180'
                    )}
                  />
                </button>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                    active
                      ? 'bg-[#D4AF37]/10 text-[#D4AF37]'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  )}
                  onClick={() => setIsMobileOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              )}

              {/* Submenu */}
              {hasChildren && isOpen && (
                <div className="mt-1 ml-8 space-y-1">
                  {item.children!.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={cn(
                        'block px-3 py-2 rounded-lg text-sm transition-colors',
                        pathname.endsWith(child.href)
                          ? 'text-[#D4AF37]'
                          : 'text-gray-500 hover:text-gray-300'
                      )}
                      onClick={() => setIsMobileOpen(false)}
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-3 border-t border-gray-800">
        <Link
          href="/settings"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
            pathname.includes('/settings')
              ? 'bg-[#D4AF37]/10 text-[#D4AF37]'
              : 'text-gray-400 hover:bg-gray-800 hover:text-white'
          )}
          onClick={() => setIsMobileOpen(false)}
        >
          <Settings className="w-5 h-5" />
          Settings
        </Link>

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>

      {/* User Info */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
            <span className="text-[#D4AF37] font-semibold">
              {user.full_name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user.full_name}
            </p>
            <p className="text-xs text-gray-500 capitalize">{user.role}</p>
          </div>
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-gray-800 text-white lg:hidden"
      >
        {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:left-0 bg-[#111827] border-r border-gray-800">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 w-64 bg-[#111827] border-r border-gray-800 z-50 flex flex-col transition-transform lg:hidden',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <SidebarContent />
      </aside>
    </>
  )
}
