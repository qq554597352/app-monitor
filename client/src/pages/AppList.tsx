import { useState, useEffect, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, Download } from 'lucide-react'
import { fetchApps, fetchMetricsLatest, MOCK_APPS, MOCK_METRICS } from '../utils/fetchData'
import type { App, AppMetric } from '../types'
import {
  formatRating, formatNumber, formatRankChange,
  getRankChangeColor, getIndustryColor, getCountryFlag, getIndustryLabel,
  formatInstalls, getIntensityColor, getIntensityLabel,
} from '../utils/formatters'

type AppRow = App & { metric?: AppMetric }
type SortField = 'rank' | 'rating' | 'reviews' | 'min_installs' | 'dau_estimate' | 'ad_spend_intensity' | 'rank_change'
type CountryCode = 'PH' | 'ID' | 'PK' | 'MY' | 'AU' | 'GB' | 'all'
type IndustryType = 'credit' | 'finance' | 'insurance' | 'all'
type StoreType = 'google_play' | 'app_store' | 'all'

const COUNTRIES: { code: CountryCode; label: string }[] = [
  { code: 'all', label: '全部国家' },
  { code: 'PH', label: '🇵🇭 菲律宾' },
  { code: 'ID', label: '🇮🇩 印尼' },
  { code: 'PK', label: '🇵🇰 巴基斯坦' },
  { code: 'MY', label: '🇲🇾 马来西亚' },
  { code: 'AU', label: '🇦🇺 澳大利亚' },
  { code: 'GB', label: '🇬🇧 英国' },
]

const INDUSTRIES: { code: IndustryType; label: string }[] = [
  { code: 'all', label: '全部行业' },
  { code: 'credit', label: '信贷' },
  { code: 'finance', label: '理财' },
  { code: 'insurance', label: '保险' },
]

const STORES: { code: StoreType; label: string }[] = [
  { code: 'all', label: '全部商店' },
  { code: 'google_play', label: 'Google Play' },
  { code: 'app_store', label: 'App Store' },
]

const PAGE_SIZE = 20

function SortButton({
  field, current, asc, onClick,
}: {
  field: SortField; current: SortField; asc: boolean; onClick: (f: SortField) => void
}) {
  const active = field === current
  return (
    <button
      onClick={() => onClick(field)}
      className={`flex items-center gap-0.5 cursor-pointer transition-colors ${active ? 'text-[#6366F1]' : 'text-[#475569] hover:text-[#94A3B8]'}`}
    >
      <span className="text-xs">{active ? (asc ? '↑' : '↓') : '↕'}</span>
    </button>
  )
}

export default function AppList() {
  const [searchParams] = useSearchParams()
  const [rows, setRows] = useState<AppRow[]>([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [country, setCountry] = useState<CountryCode>((searchParams.get('country') as CountryCode) || 'all')
  const [industry, setIndustry] = useState<IndustryType>('all')
  const [store, setStore] = useState<StoreType>('all')
  const [sortField, setSortField] = useState<SortField>('rank')
  const [sortAsc, setSortAsc] = useState(true)
  const [page, setPage] = useState(1)

  const loadData = useCallback(async () => {
    setLoading(true)
    const [appsData, metricsData] = await Promise.all([fetchApps(), fetchMetricsLatest()])

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
    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const filtered = rows.filter(row => {
    if (country !== 'all' && row.country_code !== country) return false
    if (industry !== 'all' && row.industry !== industry) return false
    if (store !== 'all' && row.store !== store) return false
    if (search && !row.name.toLowerCase().includes(search.toLowerCase()) &&
      !row.developer.toLowerCase().includes(search.toLowerCase()) &&
      !(row.chinese_parent || '').toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const sorted = [...filtered].sort((a, b) => {
    const getVal = (r: AppRow): number => {
      switch (sortField) {
        case 'rank':              return r.metric?.rank ?? 9999
        case 'rating':           return r.metric?.rating ?? 0
        case 'reviews':          return r.metric?.reviews ?? 0
        case 'min_installs':     return r.metric?.min_installs ?? 0
        case 'dau_estimate':     return r.metric?.dau_estimate ?? 0
        case 'ad_spend_intensity': return r.metric?.ad_spend_intensity ?? 0
        case 'rank_change':      return r.metric?.rank_change ?? -9999
        default: return 0
      }
    }
    const va = getVal(a), vb = getVal(b)
    return sortAsc ? va - vb : vb - va
  })

  const total = sorted.length
  const paged = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const totalPages = Math.ceil(total / PAGE_SIZE)

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortAsc(!sortAsc)
    } else {
      setSortField(field)
      setSortAsc(field === 'rank' ? true : false)
    }
    setPage(1)
  }

  // 导出 CSV
  const exportCSV = () => {
    const headers = ['APP名称', '国家', '行业', '平台', '中国母公司', '母公司关系', '排名', '排名变化', '评分', '评论数', '安装量', 'DAU估算', '投放强度']
    const csvRows = sorted.map(r => [
      r.name,
      r.country_name,
      r.industry_name,
      r.store_name,
      r.chinese_parent || '',
      r.parent_relation || '',
      r.metric?.rank ?? '',
      r.metric?.rank_change ?? '',
      r.metric?.rating ?? '',
      r.metric?.reviews ?? '',
      r.metric?.min_installs ?? '',
      r.metric?.dau_estimate ?? '',
      r.metric?.ad_spend_intensity ?? '',
    ])
    const content = [headers, ...csvRows]
      .map(row => row.map(v => `"${v}"`).join(','))
      .join('\n')
    const blob = new Blob(['\ufeff' + content], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `金融APP监控_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#F8FAFC] mb-1">APP 列表</h1>
          <p className="text-sm text-[#64748B]">
            共 {total} 个金融APP · 支持按安装量、DAU、投放强度排序
          </p>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-3 py-2 bg-[#6366F1] text-white rounded-xl text-sm hover:bg-[#4F46E5] transition-colors cursor-pointer"
        >
          <Download size={14} />
          导出 CSV
        </button>
      </div>

      {/* 筛选栏 */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#475569]" />
          <input
            type="text"
            placeholder="搜索 APP / 开发商 / 母公司..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-9 pr-3 py-2 bg-[#1E293B] border border-white/5 rounded-xl text-sm text-[#E2E8F0] placeholder-[#475569] outline-none focus:border-[#6366F1]/50"
          />
        </div>
        {[
          { value: country, onChange: (v: string) => { setCountry(v as CountryCode); setPage(1) }, options: COUNTRIES },
          { value: industry, onChange: (v: string) => { setIndustry(v as IndustryType); setPage(1) }, options: INDUSTRIES },
          { value: store, onChange: (v: string) => { setStore(v as StoreType); setPage(1) }, options: STORES },
        ].map((sel, i) => (
          <select
            key={i}
            value={sel.value}
            onChange={e => sel.onChange(e.target.value)}
            className="px-3 py-2 bg-[#1E293B] border border-white/5 rounded-xl text-sm text-[#E2E8F0] outline-none focus:border-[#6366F1]/50 cursor-pointer"
          >
            {sel.options.map(o => (
              <option key={o.code} value={o.code}>{o.label}</option>
            ))}
          </select>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-2 border-[#6366F1] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* 表格 */}
          <div className="bg-[#1E293B] rounded-2xl border border-white/5 overflow-hidden">
            {/* 表头 */}
            <div className="grid grid-cols-[32px_32px_1fr_90px_90px_80px_70px_70px_60px] gap-x-2 px-4 py-2.5 border-b border-white/5 bg-[#0F172A]/40">
              <span className="text-[11px] text-[#475569]">#</span>
              <span />
              <span className="text-[11px] text-[#475569]">APP名称 / 母公司</span>
              <div className="flex items-center justify-end gap-1">
                <span className="text-[11px] text-[#475569]">安装量</span>
                <SortButton field="min_installs" current={sortField} asc={sortAsc} onClick={handleSort} />
              </div>
              <div className="flex items-center justify-end gap-1">
                <span className="text-[11px] text-[#475569]">DAU估算</span>
                <SortButton field="dau_estimate" current={sortField} asc={sortAsc} onClick={handleSort} />
              </div>
              <div className="flex items-center justify-end gap-1">
                <span className="text-[11px] text-[#475569]">评分</span>
                <SortButton field="rating" current={sortField} asc={sortAsc} onClick={handleSort} />
              </div>
              <div className="flex items-center justify-end gap-1">
                <span className="text-[11px] text-[#475569]">排名</span>
                <SortButton field="rank" current={sortField} asc={sortAsc} onClick={handleSort} />
              </div>
              <div className="flex items-center justify-end gap-1">
                <span className="text-[11px] text-[#475569]">排名变化</span>
                <SortButton field="rank_change" current={sortField} asc={sortAsc} onClick={handleSort} />
              </div>
              <div className="flex items-center justify-end gap-1">
                <span className="text-[11px] text-[#475569]">投放</span>
                <SortButton field="ad_spend_intensity" current={sortField} asc={sortAsc} onClick={handleSort} />
              </div>
            </div>

            {paged.length === 0 ? (
              <div className="py-12 text-center text-[#64748B]">暂无符合条件的APP</div>
            ) : (
              <div className="divide-y divide-white/[0.04]">
                {paged.map((row, idx) => {
                  const intensity = row.metric?.ad_spend_intensity ?? null
                  const intensityColor = getIntensityColor(intensity)
                  return (
                    <Link
                      key={`${row.id}_${row.country_code}_${row.store}`}
                      to={`/apps/${row.id}`}
                      state={{ countryCode: row.country_code, store: row.store }}
                      className="grid grid-cols-[32px_32px_1fr_90px_90px_80px_70px_70px_60px] gap-x-2 items-center px-4 py-2.5 hover:bg-[#334155]/30 transition-all group"
                    >
                      {/* 序号 */}
                      <span className="text-xs text-[#475569]">{(page - 1) * PAGE_SIZE + idx + 1}</span>

                      {/* 图标 */}
                      <img
                        src={row.icon_url || `https://placehold.co/32x32/1E293B/6366F1?text=${encodeURIComponent(row.name[0])}`}
                        alt={row.name}
                        className="w-8 h-8 rounded-lg object-cover"
                        onError={e => {
                          ;(e.target as HTMLImageElement).src = `https://placehold.co/32x32/1E293B/6366F1?text=${encodeURIComponent(row.name[0])}`
                        }}
                      />

                      {/* 名称 + 母公司 */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-[#E2E8F0] truncate group-hover:text-[#818CF8] transition-colors">
                            {row.name}
                          </span>
                          <span className={`text-[9px] px-1 py-0.5 rounded flex-shrink-0`}
                            style={{ background: `${getIndustryColor(row.industry)}20`, color: getIndustryColor(row.industry) }}>
                            {getIndustryLabel(row.industry)}
                          </span>
                          <span className="text-[9px] text-[#475569] flex-shrink-0">
                            {getCountryFlag(row.country_code)}
                          </span>
                          {row.metric?.is_new && (
                            <span className="text-[9px] px-1 py-0.5 rounded bg-amber-500/20 text-amber-400 flex-shrink-0">新</span>
                          )}
                        </div>
                        {row.chinese_parent ? (
                          <p className="text-[10px] text-[#6366F1] truncate mt-0.5" title={`${row.chinese_parent}（${row.parent_relation}）`}>
                            {row.chinese_parent}
                          </p>
                        ) : (
                          <p className="text-[10px] text-[#475569] truncate mt-0.5">{row.developer}</p>
                        )}
                      </div>

                      {/* 安装量 */}
                      <div className="text-right">
                        <p className="text-xs text-[#94A3B8]">
                          {row.metric ? formatInstalls(row.metric.min_installs, row.metric.installs_str) : '—'}
                        </p>
                        {row.metric?.installs_growth != null && (
                          <p className={`text-[10px] ${row.metric.installs_growth >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {row.metric.installs_growth >= 0 ? '+' : ''}{row.metric.installs_growth.toFixed(1)}%
                          </p>
                        )}
                      </div>

                      {/* DAU */}
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

                      {/* 评分 */}
                      <p className="text-xs text-[#94A3B8] text-right">
                        {row.metric?.rating ? `⭐ ${formatRating(row.metric.rating)}` : '—'}
                      </p>

                      {/* 排名 */}
                      <p className="text-xs text-[#94A3B8] text-right">
                        {row.metric?.rank ? `#${row.metric.rank}` : '—'}
                      </p>

                      {/* 排名变化 */}
                      <p className={`text-xs font-semibold text-right ${getRankChangeColor(row.metric?.rank_change)}`}>
                        {formatRankChange(row.metric?.rank_change)}
                      </p>

                      {/* 投放强度 */}
                      <div className="text-right">
                        {intensity !== null ? (
                          <span className="text-xs font-semibold" style={{ color: intensityColor }}>
                            {intensity}
                          </span>
                        ) : (
                          <span className="text-xs text-[#475569]">—</span>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 bg-[#1E293B] border border-white/5 rounded-lg text-sm text-[#64748B] disabled:opacity-40 hover:text-[#94A3B8] cursor-pointer"
              >
                上一页
              </button>
              <span className="text-sm text-[#64748B]">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 bg-[#1E293B] border border-white/5 rounded-lg text-sm text-[#64748B] disabled:opacity-40 hover:text-[#94A3B8] cursor-pointer"
              >
                下一页
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
