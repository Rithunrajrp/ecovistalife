'use client'

import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  trend?: {
    value: number
    label: string
    isPositive?: boolean
  }
  color?: 'gold' | 'blue' | 'green' | 'purple' | 'red' | 'orange'
  className?: string
}

const colorClasses = {
  gold: {
    iconBg: 'bg-[#D4AF37]/10 border-[#D4AF37]/20',
    iconText: 'text-[#D4AF37]',
    trendPositive: 'text-[#D4AF37]',
  },
  blue: {
    iconBg: 'bg-blue-500/10 border-blue-500/20',
    iconText: 'text-blue-400',
    trendPositive: 'text-blue-400',
  },
  green: {
    iconBg: 'bg-emerald-500/10 border-emerald-500/20',
    iconText: 'text-emerald-400',
    trendPositive: 'text-emerald-400',
  },
  purple: {
    iconBg: 'bg-purple-500/10 border-purple-500/20',
    iconText: 'text-purple-400',
    trendPositive: 'text-purple-400',
  },
  red: {
    iconBg: 'bg-red-500/10 border-red-500/20',
    iconText: 'text-red-400',
    trendPositive: 'text-red-400',
  },
  orange: {
    iconBg: 'bg-orange-500/10 border-orange-500/20',
    iconText: 'text-orange-400',
    trendPositive: 'text-orange-400',
  },
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'gold',
  className,
}: StatCardProps) {
  const colors = colorClasses[color]

  return (
    <div
      className={cn(
        'bg-[#111827] border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-colors',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-400">{title}</p>
          <p className="mt-2 text-3xl font-bold text-white">{value}</p>
          {subtitle && (
            <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
          )}
          {trend && (
            <div className="mt-2 flex items-center gap-1.5">
              {trend.isPositive !== false ? (
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-400" />
              )}
              <span
                className={cn(
                  'text-sm font-medium',
                  trend.isPositive !== false ? 'text-emerald-400' : 'text-red-400'
                )}
              >
                {trend.value > 0 ? '+' : ''}{trend.value}%
              </span>
              <span className="text-sm text-gray-500">{trend.label}</span>
            </div>
          )}
        </div>
        <div
          className={cn(
            'flex items-center justify-center w-12 h-12 rounded-xl border',
            colors.iconBg
          )}
        >
          <span className={cn('w-6 h-6 flex items-center justify-center', colors.iconText)}>{icon}</span>
        </div>
      </div>
    </div>
  )
}
