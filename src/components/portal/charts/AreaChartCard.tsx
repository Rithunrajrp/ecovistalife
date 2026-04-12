'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { cn } from '@/lib/utils'

interface DataPoint {
  name: string
  value?: number
  [key: string]: any
}

interface AreaChartCardProps {
  title: string
  subtitle?: string
  data: DataPoint[]
  dataKey?: string
  xAxisKey?: string
  color?: string
  gradientId?: string
  className?: string
  height?: number
  showGrid?: boolean
  /** Pass 'currency' to auto-format as ₹ values, or omit for default number formatting */
  formatAs?: 'currency' | 'number'
}

export function AreaChartCard({
  title,
  subtitle,
  data,
  dataKey = 'value',
  xAxisKey = 'name',
  color = '#D4AF37',
  gradientId = 'colorValue',
  className,
  height = 300,
  showGrid = true,
  formatAs = 'number',
}: AreaChartCardProps) {
  const formatValue = (value: number) => {
    if (formatAs === 'currency') {
      if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)} Cr`
      if (value >= 100000) return `₹${(value / 100000).toFixed(1)} L`
      return `₹${value.toLocaleString()}`
    }
    return value.toLocaleString()
  }
  return (
    <div
      className={cn(
        'bg-[#111827] border border-gray-800 rounded-2xl p-5',
        className
      )}
    >
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
          )}
          <XAxis
            dataKey={xAxisKey}
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
            tickFormatter={formatValue}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#F9FAFB',
            }}
            labelStyle={{ color: '#9CA3AF' }}
            formatter={(value: any) => [formatValue(Number(value) || 0), 'Value']}
          />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            fillOpacity={1}
            fill={`url(#${gradientId})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
