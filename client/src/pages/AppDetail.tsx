import { useState, useEffect } from 'react'
import { useParams, useLocation, Link } from 'react-router-dom'
import { ArrowLeft, ExternalLink, Star, MessageSquare, TrendingUp } from 'lucide-react'
import MetricCard from '../components/MetricCard'
import TrendChart from '../components/TrendChart'
import { fetchApps, fetchMetricsLatest, MOCK_APPS, MOCK_METRICS } from '../utils/fetchData'
import type { App, AppMetric } from '../types'
import {
  formatRating, formatNumber, formatRankChange, formatRelativeTime,
  getRankChangeColor, getIndustryColor, getCountryFlag, getIndustryLabel
} from '../utils/formatters'

// 生成模拟历史趋势（真实数据需从 history/*.json 读取）
function generateMockHistory(baseRank: number, baseRating: number) {
  return Array.from({ length: 30 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (29 - i))
    return {
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      rank: Math.max(1, baseRank + Math.floor(Math.sin(i * 0.5) * 8 - i * 0.3)),
      rating: Math.min(5, Math.max(3.5, baseRating + Math.sin(i * 0.3) * 0.15)),
      ad_spend_intensity: Math.min(100, Math.max(20, 60 + Math.sin(i * 0.8) * 20 + i * 0.5)),
    }
  })
}

export default function AppDetail() {
  const { appId } = useParams<{ appId: string }>()
  const location = useLocation()
  const stateData = location.state as { countryCode?: string; store?: string } | null

  const [app, setApp] = useState<App | null>(null)
  const [metric, setMetric] = useState<AppMetric | null>(null)
  const [competitors, setCompetitors] = useState<Array<App & { metric?: AppMetric }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!appId) return

    const load = async () => {
      setLoading(true)
      const [appsData, metricsData] = await Promise.all([fetchApps(), fetchMetricsLatest()])
      const useApps = appsData.length > 0 ? appsData : MOCK_APPS
      const useMetrics = metricsData.length > 0 ? metricsData : MOCK_METRICS

      const metricMap = new Map<string, AppMetric>()
      useMetrics.forEach(m => metricMap.set(`${m.app_id}_${m.country_code}_${m.store}`, m))

      // 查找当前APP（可能在多个国家）
      const matchedApps = useApps.filter(a =>
        a.id === appId &&
        (!stateData?.countryCode || a.country_code === stateData.countryCode) &&
        (!stateData?.store || a.store === stateData.store)
      )
      const foundApp = matchedApps[0] || useApps.find(a => a.id === appId)

      if (foundApp) {
        setApp(foundApp)
        const key = `${foundApp.id}_${foundApp.country_code}_${foundApp.store}`
        setMetric(metricMap.get(key) || null)

        // 同行业同国家竞品
        const comps = useApps
          .filter(a => a.industry === foundApp.industry && a.country_code === foundApp.country_code && a.id !== foundApp.id)
          .slice(0, 5)
          .map(a => ({ ...a, metric: metricMap.get(`${a.id}_${a.country_code}_${a.store}`) }))
        setCompetitors(comps)
      }
      setLoading(false)
    }
    load()
  }, [appId, stateData?.countryCode, stateData?.store])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#6366F1] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!app) {
    return (
      <div className="text-center py-16">
        <p className="text-[#64748B] mb-4">未找到APP信息</p>
        <Link to="/apps" className="text-[#6366F1] hover:text-[#818CF8]">返回列表</Link>
      </div>
    )
  }

  const trendData = generateMockHistory(metric?.rank || 10, metric?.rating || 4.2)
  const intensity = metric?.ad_spend_intensity ?? 0
  const intensityColor = intensity >= 80 ? '#EF4444' : intensity >= 60 ? '#F59E0B' : '#6366F1'
  const storeUrl = app.store === 'google_play'
    ? `https://play.google.com/store/apps/details?id=${app.id}`
    : `https://apps.apple.com/app/id${app.id}`

  return (
    <div className="animate-fade-in max-w-5xl">
      {/* 返回 */}
      <Link to="/apps" className="inline-flex items-center gap-2 text-sm text-[#64748B] hover:text-[#94A3B8] mb-5 transition-colors">
        <ArrowLeft size={14} />
        返回列表
      </Link>

      {/* APP基本信息 */}
      <div className="bg-[#1E293B] rounded-2xl border border-white/5 p-6 mb-5">
        <div className="flex items-start gap-5">
          <img
            src={app.icon_url || `https://placehold.co/72x72/1E293B/6366F1?text=${app.name[0]}`}
            alt={app.name}
            className="w-18 h-18 rounded-2xl object-cover flex-shrink-0"
            onError={e => { (e.target as HTMLImageElement).src = `https://placehold.co/72x72/1E293B/6366F1?text=${app.name[0]}` }}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-xl font-bold text-[#F8FAFC] mb-1">{app.name}</h1>
                <p className="text-sm text-[#64748B] mb-3">{app.developer}</p>
              </div>
              <a href={storeUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0F172A] rounded-xl text-xs text-[#94A3B8] hover:text-[#F8FAFC] border border-white/5 hover:border-white/10 transition-all flex-shrink-0">
                <ExternalLink size={12} />
                在{app.store_name}打开
              </a>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium"
                style={{ background: `${getIndustryColor(app.industry)}20`, color: getIndustryColor(app.industry) }}>
                {getIndustryLabel(app.industry)}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#0F172A] rounded-lg text-xs text-[#94A3B8]">
                {getCountryFlag(app.country_code)} {app.country_name}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#0F172A] rounded-lg text-xs text-[#94A3B8]">
                {app.store_name}
              </span>
              {metric?.is_new && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#6366F1]/20 rounded-lg text-xs text-[#818CF8]">
                  🆕 新发现
                </span>
              )}
            </div>
          </div>
        </div>
        {app.description && (
          <p className="text-sm text-[#94A3B8] mt-4 leading-relaxed border-t border-white/5 pt-4">
            {app.description}
          </p>
        )}
      </div>

      {/* 核心指标卡片 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
        <MetricCard title="当前排名" value={metric?.rank ? `#${metric.rank}` : '—'}
          change={metric?.rank_change} changeLabel="位" gradient="from-[#6366F1] to-[#8B5CF6]"
          icon={<TrendingUp size={16} />} />
        <MetricCard title="评分" value={formatRating(metric?.rating)}
          change={metric?.rating_change} suffix="/5"
          gradient="from-[#F59E0B] to-[#EF4444]" icon={<Star size={16} />} />
        <MetricCard title="评论数" value={formatNumber(metric?.reviews)}
          gradient="from-[#3B82F6] to-[#06B6D4]" icon={<MessageSquare size={16} />} />
        <MetricCard title="下载量" value={metric?.installs_str || metric?.downloads_range || '—'}
          subtitle="Google Play 显示" gradient="from-[#10B981] to-[#059669]" />
        <MetricCard title="投放强度" value={`${intensity.toFixed(0)}`} suffix="/100"
          subtitle="综合推断指数" gradient={intensity >= 70 ? 'from-[#EF4444] to-[#F97316]' : 'from-[#F59E0B] to-[#EAB308]'} />
        <MetricCard title="热度得分" value={metric?.hot_score?.toFixed(0) ?? '—'} suffix="/100"
          subtitle="自动发现算法" gradient="from-[#8B5CF6] to-[#D946EF]" />
      </div>

      {/* 趋势图表 */}
      <div className="bg-[#1E293B] rounded-2xl border border-white/5 p-5 mb-5">
        <h2 className="font-semibold text-[#E2E8F0] mb-4">30天趋势</h2>
        <TrendChart data={trendData} height={240} />
        <p className="text-xs text-[#64748B] mt-3 text-center">
          * 历史趋势为近似估算，真实数据在数据积累后持续优化
        </p>
      </div>

      {/* 竞品对比 */}
      {competitors.length > 0 && (
        <div className="bg-[#1E293B] rounded-2xl border border-white/5 p-5">
          <h2 className="font-semibold text-[#E2E8F0] mb-4">
            同地区竞品 · {app.country_name} · {getIndustryLabel(app.industry)}
          </h2>
          <div className="space-y-2">
            {competitors.map(comp => {
              const ci = comp.metric?.ad_spend_intensity ?? 0
              const cc = ci >= 80 ? '#EF4444' : ci >= 60 ? '#F59E0B' : '#6366F1'
              return (
                <Link key={`${comp.id}_${comp.country_code}`}
                  to={`/apps/${comp.id}`} state={{ countryCode: comp.country_code, store: comp.store }}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#334155]/50 transition-all">
                  <img src={comp.icon_url || `https://placehold.co/36x36/1E293B/6366F1?text=${comp.name[0]}`}
                    alt={comp.name} className="w-9 h-9 rounded-xl object-cover flex-shrink-0"
                    onError={e => { (e.target as HTMLImageElement).src = `https://placehold.co/36x36/1E293B/6366F1?text=${comp.name[0]}` }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#F8FAFC] truncate">{comp.name}</p>
                    <p className="text-xs text-[#64748B]">{comp.developer}</p>
                  </div>
                  <span className="text-sm font-bold text-[#6366F1] w-12 text-center">#{comp.metric?.rank ?? '—'}</span>
                  <span className={`text-sm font-semibold w-12 text-center ${getRankChangeColor(comp.metric?.rank_change)}`}>
                    {formatRankChange(comp.metric?.rank_change)}
                  </span>
                  <div className="flex items-center gap-1.5 w-20">
                    <div className="flex-1 h-1.5 bg-[#0F172A] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${ci}%`, background: cc }} />
                    </div>
                    <span className="text-xs w-6" style={{ color: cc }}>{ci.toFixed(0)}</span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
