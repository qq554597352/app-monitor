import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  change?: number | null
  changeLabel?: string
  icon?: React.ReactNode
  gradient?: string
  suffix?: string
}

export default function MetricCard({
  title,
  value,
  subtitle,
  change,
  changeLabel,
  icon,
  gradient = 'from-[#6366F1] to-[#8B5CF6]',
  suffix,
}: MetricCardProps) {
  const renderChange = () => {
    if (change === null || change === undefined) return null
    const positive = change > 0
    const zero = change === 0

    return (
      <div className={`flex items-center gap-1 text-xs font-medium ${
        positive ? 'text-[#10B981]' : zero ? 'text-slate-400' : 'text-[#EF4444]'
      }`}>
        {positive ? <TrendingUp size={12} /> : zero ? <Minus size={12} /> : <TrendingDown size={12} />}
        <span>{positive ? '+' : ''}{change}{changeLabel || ''}</span>
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden rounded-2xl p-5 bg-[#1E293B] border border-white/5 hover:border-white/10 transition-all duration-300 group hover:-translate-y-0.5">
      {/* 渐变装饰 */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-10 rounded-full -translate-x-8 -translate-y-8 group-hover:opacity-15 transition-opacity`} />

      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-[#94A3B8] font-medium mb-1">{title}</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-[#F8FAFC]">{value}</span>
            {suffix && <span className="text-sm text-[#94A3B8]">{suffix}</span>}
          </div>
          {subtitle && (
            <p className="text-xs text-[#64748B] mt-1">{subtitle}</p>
          )}
          <div className="mt-2">
            {renderChange()}
          </div>
        </div>

        {icon && (
          <div className={`p-2.5 rounded-xl bg-gradient-to-br ${gradient} bg-opacity-20`}>
            <div className="text-white">{icon}</div>
          </div>
        )}
      </div>
    </div>
  )
}
