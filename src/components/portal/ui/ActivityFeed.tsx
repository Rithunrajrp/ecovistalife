'use client'

import { cn } from '@/lib/utils'
import {
  Phone,
  Mail,
  Calendar,
  FileText,
  UserPlus,
  CheckCircle,
  DollarSign,
  ArrowRight,
  LucideIcon,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

type ActivityType = 'call' | 'email' | 'meeting' | 'note' | 'lead_created' | 'deal_won' | 'invoice_paid' | 'task_completed'

interface Activity {
  id: string
  type: ActivityType
  title: string
  description?: string
  timestamp: string | Date
  user?: string
}

interface ActivityFeedProps {
  activities: Activity[]
  title?: string
  className?: string
  maxItems?: number
  showViewAll?: boolean
  onViewAll?: () => void
}

const activityIcons: Record<ActivityType, LucideIcon> = {
  call: Phone,
  email: Mail,
  meeting: Calendar,
  note: FileText,
  lead_created: UserPlus,
  deal_won: DollarSign,
  invoice_paid: CheckCircle,
  task_completed: CheckCircle,
}

const activityColors: Record<ActivityType, string> = {
  call: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  email: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  meeting: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  note: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  lead_created: 'bg-green-500/10 text-green-400 border-green-500/20',
  deal_won: 'bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/20',
  invoice_paid: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  task_completed: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
}

export function ActivityFeed({
  activities,
  title = 'Recent Activity',
  className,
  maxItems = 5,
  showViewAll = true,
  onViewAll,
}: ActivityFeedProps) {
  const displayActivities = activities.slice(0, maxItems)

  return (
    <div
      className={cn(
        'bg-[#111827] border border-gray-800 rounded-2xl p-5',
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {showViewAll && onViewAll && (
          <button
            onClick={onViewAll}
            className="text-sm text-[#D4AF37] hover:text-[#C4A030] flex items-center gap-1"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="space-y-4">
        {displayActivities.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            No recent activity
          </p>
        ) : (
          displayActivities.map((activity, index) => {
            const Icon = activityIcons[activity.type]
            const colorClass = activityColors[activity.type]

            return (
              <div
                key={activity.id}
                className={cn(
                  'flex items-start gap-3',
                  index !== displayActivities.length - 1 && 'pb-4 border-b border-gray-800'
                )}
              >
                <div
                  className={cn(
                    'flex items-center justify-center w-9 h-9 rounded-lg border',
                    colorClass
                  )}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {activity.title}
                  </p>
                  {activity.description && (
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {activity.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    {activity.user && (
                      <>
                        <span className="text-xs text-gray-400">{activity.user}</span>
                        <span className="text-gray-600">•</span>
                      </>
                    )}
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
