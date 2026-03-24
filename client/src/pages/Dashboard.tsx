import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Smartphone, Globe, Star, TrendingUp, RefreshCw, ChevronRight, Download, Users, Zap } from 'lucide-react'
import MetricCard from '../components/MetricCard'
import { fetchDashboard, fetchApps, fetchMetricsLatest, MOCK_APPS, MOCK_METRICS } from '../utils/fetchData'
import type { App, AppMetric, DashboardData } from '../types'
import {
  formatRating, formatNumber, formatRankChange, formatRelativeTime,
  getRankChangeColor, getIndustryColor, getCountryFlag, getIndustryLabel,
  formatInstalls, getIntensityColor, getIntensityLabel,
} from '../utils/formatters'

const COUNTRY_LIST = [
  { code: 'PH', name: '菲律宾', flag: '🇵🇭' },
  { code: 'ID', name: '印尼', flag: '🇮🇩' },
  { code: 'PK', name: '巴基斯坦', flag: '🇵🇰' },
  { code: 'MY', name: '马来西亚', flag: '🇲🇾' },
  { code: 'AU', name: '澳大利亚', flag: '🇦🇺' },
  { code: 'GB', name: '英国', flag: '🇬🇧' },
  { code: 'MX', name: '墨西哥', flag: '🇲🇽' },
]

const INDUSTRY_TABS = [
  { code: 'all', label: '全部' },
  { code: 'credit', label: '信贷' },
  { code: 'finance', label: '理财' },
  { code: 'insurance', label: '保险' },
]

type AppRow = App & { metric?: AppMetric }

/** 某国榜单卡片 */
function CountryRankingCard({
  country,
  rows,
  industryFilter,
}: {
  country: typeof COUNTRY_LIST[number]
  rows: AppRow[]
  industryFilter: string
}) {
  const filtered = rows.filter(r =>
    r.country_code === country.code &&
    (industryFilter === 'all' || r.industry === industryFilter)
  )
  const sorted = [...filtered].sort((a, b) => {
    const ar = a.metric?.rank ?? 9999
    const br = b.metric?.rank ?? 9999
    return ar - br
  })

  return (
    <div className="bg-[#1E293B] rounded-2xl border border-white/5 overflow-hidden flex flex-col">
      {/* 卡片头部 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-xl">{country.flag}</span>
          <span className="font-semibold text-[#E2E8F0] text-sm">{country.name}</span>
          <span className="text-xs text-[#64748B] bg-[#0F172A] px-2 py-0.5 rounded-full">
            {sorted.length} 个APP
          </span>
        </div>
        <Link
          to={`/apps?country=${country.code}`}
          className="flex items-center gap-1 text-xs text-[#6366F1] hover:text-[#818CF8] transition-colors"
        >
          查看全部 <ChevronRight size={12} />
        </Link>
      </div>

      {/* 列表表头 */}
      <div className="grid grid-cols-[28px_32px_1fr_80px_60px_52px] gap-x-2 px-4 py-1.5 border-b border-white/[0.03]">
        <span className="text-[10px] text-[#475569] text-center">#</span>
        <span className="text-[10px] text-[#475569]"></span>
        <span className="text-[10px] text-[#475569]">APP / 母公司</span>
        <span className="text-[10px] text-[#475569] text-right">安装量</span>
        <span className="text-[10px] text-[#475569] text-right">DAU估算</span>
        <span className="text-[10px] text-[#475569] text-right">投放</span>
      </div>

      {/* APP 列表 */}
      <div className="flex-1 divide-y divide-white/[0.03]">
        {sorted.length === 0 ? (
          <div className="py-8 text-center text-[#64748B] text-sm">暂无数据</div>
        ) : (
          sorted.slice(0, 10).map((row, i) => {
            const change = row.metric?.rank_change ?? null
            const intensity = row.metric?.ad_spend_intensity ?? null
            const intensityColor = getIntensityColor(intensity)
            return (
              <Link
                key={`${row.id}_${row.country_code}_${row.store}_${i}`}
                to={`/apps/${row.id}`}
                state={{ countryCode: row.country_code, store: row.store }}
                className="grid grid-cols-[28px_32px_1fr_80px_60px_52px] gap-x-2 items-center px-4 py-2 hover:bg-[#334155]/40 transition-all group"
              >
                {/* 序号 + 排名变化 */}
                <div className="flex flex-col items-center">
                  <span className="text-xs font-bold text-[#475569]">
                    {row.metric?.rank ?? i + 1}
                  </span>
                  {change !== null && change !== 0 && (
                    <span className={`text-[10px] font-semibold leading-none ${getRankChangeColor(change)}`}>
                      {change > 0 ? `↑${change}` : `↓${Math.abs(change)}`}
                    </span>
                  )}
                </div>

                {/* 图标 */}
                <img
                  src={row.icon_url || `https://placehold.co/32x32/1E293B/6366F1?text=${encodeURIComponent(row.name[0])}`}
                  alt={row.name}
                  className="w-8 h-8 rounded-xl object-cover flex-shrink-0"
                  onError={e => {
                    ;(e.target as HTMLImageElement).src = `https://placehold.co/32x32/1E293B/6366F1?text=${encodeURIComponent(row.name[0])}`
                  }}
                />

                {/* 名称 + 行业标签 + 母公司 */}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <p className="text-xs font-medium text-[#E2E8F0] truncate group-hover:text-[#818CF8] transition-colors max-w-[120px]">
                      {row.name}
                    </p>
                    <span
                      className="text-[9px] px-1 py-0.5 rounded flex-shrink-0 font-medium"
                      style={{
                        background: `${getIndustryColor(row.industry)}20`,
                        color: getIndustryColor(row.industry),
                      }}
                    >
                      {getIndustryLabel(row.industry)}
                    </span>
                    {row.metric?.is_new && (
                      <span className="text-[9px] px-1 py-0.5 rounded bg-amber-500/20 text-amber-400 flex-shrink-0">新</span>
                    )}
                  </div>
                  {row.chinese_parent ? (
                    <p className="text-[10px] text-[#6366F1] truncate mt-0.5" title={row.chinese_parent}>
                      {row.chinese_parent}
                    </p>
                  ) : (
                    <p className="text-[10px] text-[#475569] truncate mt-0.5">{row.developer}</p>
                  )}
                </div>

                {/* 安装量 */}
                <div className="text-right">
                  <p className="text-xs text-[#94A3B8] truncate">
                    {row.metric ? formatInstalls(row.metric.min_installs, row.metric.installs_str) : '—'}
                  </p>
                  {row.metric?.installs_growth != null && (
                    <p className={`text-[10px] ${row.metric.installs_growth >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {row.metric.installs_growth >= 0 ? '+' : ''}{row.metric.installs_growth.toFixed(1)}%
                    </p>
                  )}
                </div>

                {/* DAU 估算 */}
                <div className="text-right">
                  <p className="text-xs text-[#94A3B8]">
                    {row.metric?.dau_estimate ? formatNumber(row.metric.dau_estimate) : '—'}
                  </p>
                  {row.metric?.dau_change != null && row.metric.dau_change !== 0 && (
                    <p className={`text-[10px] ${row.metric.dau_change > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {row.metric.dau_change > 0 ? '+' : ''}{formatNumber(row.metric.dau_change)}
                    </p>
                  )}
                </div>

                {/* 投放强度 */}
                <div className="text-right">
                  {intensity !== null ? (
                    <div className="flex flex-col items-end gap-0.5">
                      <span className="text-xs font-semibold" style={{ color: intensityColor }}>
                        {intensity}
                      </span>
                      <span className="text-[10px]" style={{ color: intensityColor }}>
                        {getIntensityLabel(intensity)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-[#475569]">—</span>
                  )}
                </div>
              </Link>
            )
          })
        )}
        {sorted.length > 10 && (
          <Link
            to={`/apps?country=${country.code}`}
            className="flex items-center justify-center py-2.5 text-xs text-[#6366F1] hover:bg-[#6366F1]/5 transition-colors"
          >
            查看更多 {sorted.length - 10} 个 APP →
          </Link>
        )}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [rows, setRows] = useState<AppRow[]>([])
  const [loading, setLoading] = useState(true)
  const [activeIndustry, setActiveIndustry] = useState('all')
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    const [dash, appsData, metricsData] = await Promise.all([
      fetchDashboard(),
      fetchApps(),
      fetchMetricsLatest(),
    ])

    const useApps = appsData.length > 0 ? appsData : MOCK_APPS
    const useMetrics = metricsData.length > 0 ? metricsData : MOCK_METRICS

    const metricMap = new Map<string, AppMetric>()
    useMetrics.forEach(m => {
      metricMap.set(`${m.app_id}_${m.country_code}_${m.store}`, m)
    })
    const combined: AppRow[] = useApps.map(app => ({
      ...app,
      metric: metricMap.get(`${app.id}_${app.country_code}_${app.store}`),
    }))
    setRows(combined)

    if (dash && dash.summary?.total_apps > 0) {
      setDashboard(dash)
      setLastUpdated(dash.summary.last_updated)
    } else {
      const totalInstalls = MOCK_METRICS.reduce((s, m) => s + (m.min_installs || 0), 0)
      const totalDau = MOCK_METRICS.reduce((s, m) => s + (m.dau_estimate || 0), 0)
      setDashboard({
        summary: {
          total_apps: useApps.length,
          total_countries: 6,
          total_industries: 3,
          avg_rating: 4.3,
          last_updated: new Date().toISOString(),
          total_installs: totalInstalls,
          total_dau_estimate: totalDau,
        },
        top_movers: [],
        industry_distribution: { credit: 0, finance: 0, insurance: 0 },
        country_distribution: { PH: 0, ID: 0, PK: 0, MY: 0, AU: 0, GB: 0, MX: 0 },
      })
      setLastUpdated(new Date().toISOString())
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const totalApps = rows.length
  const avgRating = rows.reduce((s, r) => s + (r.metric?.rating ?? 0), 0) / (rows.filter(r => r.metric?.rating).length || 1)
  const totalInstalls = rows.reduce((s, r) => s + (r.metric?.min_installs ?? 0), 0)
  const totalDau = rows.reduce((s, r) => s + (r.metric?.dau_estimate ?? 0), 0)

  const countByIndustry = (ind: string) =>
    rows.filter(r => ind === 'all' || r.industry === ind).length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[#6366F1] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-[#64748B] text-sm">加载数据中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      {/* 页面标题 */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#F8FAFC] mb-1">监控仪表盘</h1>
          <p className="text-sm text-[#64748B]">
            实时追踪 6 国金融类APP市场动态（信贷、理财、保险）
            {lastUpdated && ` · 更新于 ${formatRelativeTime(lastUpdated)}`}
          </p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-2 px-3 py-2 bg-[#1E293B] text-[#64748B] hover:text-[#94A3B8] rounded-xl border border-white/5 text-sm transition-all cursor-pointer"
        >
          <RefreshCw size={14} />
          刷新
        </button>
      </div>

      {/* 核心指标卡片 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="监控APP总数"
          value={totalApps}
          subtitle="7 个国家 · 3 行业"
          icon={<Smartphone size={18} />}
          gradient="from-[#6366F1] to-[#8B5CF6]"
        />
        <MetricCard
          title="总安装量估算"
          value={formatNumber(totalInstalls)}
          subtitle="Google Play + App Store"
          icon={<Download size={18} />}
          gradient="from-[#3B82F6] to-[#06B6D4]"
        />
        <MetricCard
          title="总DAU估算"
          value={formatNumber(totalDau)}
          subtitle="日活跃用户数"
          icon={<Users size={18} />}
          gradient="from-[#10B981] to-[#059669]"
        />
        <MetricCard
          title="平均评分"
          value={formatRating(avgRating)}
          subtitle="所有APP综合"
          icon={<Star size={18} />}
          gradient="from-[#F59E0B] to-[#EF4444]"
        />
      </div>

      {/* 行业 Tab 筛选 */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        {INDUSTRY_TABS.map(tab => (
          <button
            key={tab.code}
            onClick={() => setActiveIndustry(tab.code)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all cursor-pointer ${
              activeIndustry === tab.code
                ? 'bg-[#6366F1] text-white shadow-lg shadow-[#6366F1]/30'
                : 'bg-[#1E293B] text-[#64748B] border border-white/5 hover:text-[#94A3B8]'
            }`}
          >
            {tab.label}
            <span className="ml-1.5 text-xs opacity-70">
              {countByIndustry(tab.code)}
            </span>
          </button>
        ))}
        <span className="ml-auto text-xs text-[#475569]">
          每 30 分钟自动更新
        </span>
      </div>

      {/* 投放强度图例 */}
      <div className="flex items-center gap-3 mb-4 px-1">
        <span className="text-xs text-[#475569]">投放强度：</span>
        {[
          { label: '极弱(<20)', color: '#334155' },
          { label: '弱(20-40)', color: '#64748B' },
          { label: '中(40-60)', color: '#6366F1' },
          { label: '强(60-80)', color: '#F59E0B' },
          { label: '极强(>80)', color: '#EF4444' },
        ].map(item => (
          <span key={item.label} className="flex items-center gap-1 text-xs" style={{ color: item.color }}>
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: item.color }} />
            {item.label}
          </span>
        ))}
      </div>

      {/* 各国榜单网格 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {COUNTRY_LIST.map(country => (
          <CountryRankingCard
            key={country.code}
            country={country}
            rows={rows}
            industryFilter={activeIndustry}
          />
        ))}
      </div>
    </div>
  )
}
