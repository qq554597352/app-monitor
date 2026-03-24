import { useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'

interface TrendDataPoint {
  date: string
  rank?: number
  rating?: number
  ad_spend_intensity?: number
  reviews?: number
}

interface TrendChartProps {
  data: TrendDataPoint[]
  title?: string
  height?: number
}

type MetricKey = 'rank' | 'rating' | 'ad_spend_intensity'

const METRIC_CONFIG: Record<MetricKey, { label: string; color: string; domain?: [number, number] }> = {
  rank: { label: '排名', color: '#6366F1', domain: [1, 50] },
  rating: { label: '评分', color: '#10B981', domain: [1, 5] },
  ad_spend_intensity: { label: '投放强度', color: '#F59E0B', domain: [0, 100] },
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#1E293B] border border-white/10 rounded-xl p-3 shadow-xl">
      <p className="text-xs text-[#94A3B8] mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 text-sm">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-[#94A3B8]">{METRIC_CONFIG[p.dataKey as MetricKey]?.label || p.dataKey}:</span>
          <span className="text-white font-medium">{p.value?.toFixed(1)}</span>
        </div>
      ))}
    </div>
  )
}

export default function TrendChart({ data, title, height = 220 }: TrendChartProps) {
  const [activeMetrics, setActiveMetrics] = useState<MetricKey[]>(['rank', 'ad_spend_intensity'])

  const toggleMetric = (key: MetricKey) => {
    setActiveMetrics(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-[#64748B] text-sm">
        暂无趋势数据
      </div>
    )
  }

  return (
    <div>
      {title && <h3 className="text-sm font-semibold text-[#E2E8F0] mb-3">{title}</h3>}

      {/* 指标切换 */}
      <div className="flex gap-2 mb-4">
        {(Object.keys(METRIC_CONFIG) as MetricKey[]).map(key => (
          <button
            key={key}
            onClick={() => toggleMetric(key)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
              activeMetrics.includes(key)
                ? 'border-transparent text-white'
                : 'bg-transparent border-white/10 text-[#64748B] hover:text-[#94A3B8]'
            }`}
            style={activeMetrics.includes(key) ? { background: METRIC_CONFIG[key].color } : {}}
          >
            {METRIC_CONFIG[key].label}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: '#64748B', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#64748B', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          {(Object.keys(METRIC_CONFIG) as MetricKey[]).map(key =>
            activeMetrics.includes(key) ? (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={METRIC_CONFIG[key].color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            ) : null
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
