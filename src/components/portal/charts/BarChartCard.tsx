'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { cn } from '@/lib/utils'

interface DataPoint {
  name: string
  value?: number
  color?: string
  [key: string]: any
}

interface BarChartCardProps {
  title: string
  subtitle?: string
  data: DataPoint[]
  dataKey?: string
  xAxisKey?: string
  color?: string
  className?: string
  height?: number
  horizontal?: boolean
}

const defaultColors = [
  '#D4AF37', // gold
  '#3B82F6', // blue
  '#10B981', // green
  '#8B5CF6', // purple
  '#F59E0B', // amber
  '#EF4444', // red
]

export function BarChartCard({
  title,
  subtitle,
  data,
  dataKey = "value",
  xAxisKey = "name",
  color,
  className,
  height = 300,
  horizontal = false,
}: BarChartCardProps) {
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
        <BarChart
          data={data}
          layout={horizontal ? 'vertical' : 'horizontal'}
          margin={{ top: 10, right: 10, left: horizontal ? 80 : 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={!horizontal} vertical={horizontal} />
          {horizontal ? (
            <>
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
              <YAxis type="category" dataKey={xAxisKey} axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} width={70} />
            </>
          ) : (
            <>
              <XAxis dataKey={xAxisKey} axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
            </>
          )}
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#F9FAFB',
            }}
            labelStyle={{ color: '#9CA3AF' }}
            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
          />
          <Bar dataKey={dataKey} radius={[4, 4, 4, 4]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color || color || defaultColors[index % defaultColors.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
