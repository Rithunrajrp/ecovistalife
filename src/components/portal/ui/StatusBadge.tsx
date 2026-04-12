'use client'

import { cn } from '@/lib/utils'

type Status = 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost' | 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'pending' | 'completed' | 'failed'

interface StatusBadgeProps {
  status: Status | string
  className?: string
}

const statusStyles: Record<string, string> = {
  // Lead statuses
  new: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  contacted: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  qualified: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  proposal: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  negotiation: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  won: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  lost: 'bg-red-500/10 text-red-400 border-red-500/20',

  // Deal stages
  qualification: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  closed_won: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  closed_lost: 'bg-red-500/10 text-red-400 border-red-500/20',

  // Invoice statuses
  draft: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  sent: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  paid: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  partially_paid: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  overdue: 'bg-red-500/10 text-red-400 border-red-500/20',
  cancelled: 'bg-gray-500/10 text-gray-400 border-gray-500/20',

  // Payment statuses
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  failed: 'bg-red-500/10 text-red-400 border-red-500/20',
  refunded: 'bg-purple-500/10 text-purple-400 border-purple-500/20',

  // Default
  default: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalizedStatus = status.toLowerCase().replace(/\s+/g, '_')
  const style = statusStyles[normalizedStatus] || statusStyles.default

  const displayText = status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        style,
        className
      )}
    >
      {displayText}
    </span>
  )
}
