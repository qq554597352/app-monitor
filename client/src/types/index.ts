// ─── APP 基础信息 ───────────────────────────────────────────────
export interface App {
  id: string
  name: string
  developer: string
  country_code: string
  country_name: string
  industry: 'credit' | 'finance' | 'insurance'
  industry_name: string
  store: 'google_play' | 'app_store'
  store_name: string
  icon_url: string
  description: string
  app_store_url?: string
  // 母公司信息
  chinese_parent: string
  parent_relation: string
}

// ─── 指标数据 ────────────────────────────────────────────────────
export interface AppMetric {
  app_id: string
  country_code: string
  store: string
  timestamp: string
  // 排名
  rank: number | null
  rank_change: number | null
  // 评分
  rating: number | null
  rating_change: number | null
  // 评论
  reviews: number | null
  reviews_change: number | null
  // 安装量（Google Play 真实值 / App Store 估算值）
  min_installs: number
  installs_str: string
  installs_change: number | null
  installs_growth: number | null  // 增长率 %
  // DAU 估算
  dau_estimate: number
  dau_change: number | null
  // 广告投放强度推断（0-100）
  ad_spend_intensity: number | null
  // 兼容字段（旧数据格式）
  downloads_range?: string   // Google Play 安装量区间字符串，如 "1,000,000+"
  hot_score?: number         // 热度综合得分（0-100）
  // 是否新发现
  is_new: boolean
}

// ─── 仪表盘汇总 ──────────────────────────────────────────────────
export interface DashboardSummary {
  total_apps: number
  total_countries: number
  total_industries: number
  avg_rating: number
  last_updated: string
  // 新增汇总
  total_installs?: number
  total_dau_estimate?: number
}

export interface TopMover {
  app_id: string
  app_name: string
  icon_url: string
  developer: string
  industry: string
  industry_name: string
  country_code: string
  country_name: string
  store: string
  rank: number | null
  rank_change: number | null
  min_installs: number
  installs_str: string
  dau_estimate: number
  ad_spend_intensity: number | null
  chinese_parent: string
  is_new: boolean
}

export interface DashboardData {
  summary: DashboardSummary
  top_movers: TopMover[]
  industry_distribution: {
    credit: number
    finance: number
    insurance: number
  }
  country_distribution: {
    PH: number
    ID: number
    PK: number
    MY: number
    AU: number
    GB: number
    MX: number
  }
}
