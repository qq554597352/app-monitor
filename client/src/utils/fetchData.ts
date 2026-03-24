import type { App, AppMetric, DashboardData } from '../types'

// ──────────────────────────────────────────────────────────
// 数据读取工具（从 GitHub Pages 静态 JSON 文件读取）
// ──────────────────────────────────────────────────────────

// Vite 会将 BASE_URL 替换为实际的 GitHub Pages 路径
const BASE_URL = import.meta.env.BASE_URL || '/'

async function fetchJSON<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${BASE_URL}${path}`.replace('//', '/'))
    if (!res.ok) return null
    return await res.json() as T
  } catch {
    return null
  }
}

export async function fetchApps(): Promise<App[]> {
  const data = await fetchJSON<App[]>('data/apps.json')
  return Array.isArray(data) ? data : []
}

export async function fetchMetricsLatest(): Promise<AppMetric[]> {
  const data = await fetchJSON<AppMetric[]>('data/metrics_latest.json')
  return Array.isArray(data) ? data : []
}

export async function fetchDashboard(): Promise<DashboardData | null> {
  return fetchJSON<DashboardData>('data/dashboard.json')
}

// ──────────────────────────────────────────────────────────
// MOCK 数据（开发/演示时使用真实APP信息）
// ──────────────────────────────────────────────────────────

export const MOCK_APPS: App[] = [
  // ── 菲律宾 PH ──────────────────────────────────────────
  {
    id: 'ph.gcash.android', name: 'GCash', developer: 'Mynt (Globe Fintech)',
    country_code: 'PH', country_name: '菲律宾', industry: 'finance', industry_name: '理财',
    store: 'google_play', store_name: 'Google Play',
    icon_url: 'https://play-lh.googleusercontent.com/biWGCFOqnfXVk4AWJYF2DEH0kV9_m7JjyuYN7FcSrBJ7VZzf0cO6k9xvOKpGiDOVJQ',
    description: 'GCash is the leading financial app in the Philippines.',
    chinese_parent: 'Ant Group（蚂蚁集团间接持股）', parent_relation: '股东',
  },
  {
    id: 'com.juanhand.loanapp', name: 'JuanHand', developer: 'Welab Digital Finance',
    country_code: 'PH', country_name: '菲律宾', industry: 'credit', industry_name: '信贷',
    store: 'google_play', store_name: 'Google Play',
    icon_url: 'https://play-lh.googleusercontent.com/6kbR5EHl2fZ0gL9v1Zrl6VcPYhFpR2k1kCp2V2N_J8S0Pn6IzLRk3JpXKBuZxOTzBw',
    description: 'JuanHand - Fast Personal Loans in Philippines.',
    chinese_parent: '信也科技（FINV）', parent_relation: '母公司',
  },
  {
    id: 'com.cashalo.app', name: 'Cashalo', developer: 'Oriente Express Techsystems',
    country_code: 'PH', country_name: '菲律宾', industry: 'credit', industry_name: '信贷',
    store: 'google_play', store_name: 'Google Play',
    icon_url: '',
    description: 'Cashalo provides quick personal loans for Filipinos.',
    chinese_parent: 'Oriente（腾讯/洪泰基金关联）', parent_relation: '投资方',
  },
  {
    id: 'com.akulaku.credit.philippines', name: 'Akulaku PayLater', developer: 'Akulaku',
    country_code: 'PH', country_name: '菲律宾', industry: 'credit', industry_name: '信贷',
    store: 'google_play', store_name: 'Google Play',
    icon_url: '',
    description: 'Buy now pay later & shopping loans.',
    chinese_parent: 'Akulaku（蚂蚁集团战略投资）', parent_relation: '战略投资',
  },
  {
    id: 'com.tala.android.scarecrow', name: 'Tala', developer: 'Tala Mobile Inc',
    country_code: 'PH', country_name: '菲律宾', industry: 'credit', industry_name: '信贷',
    store: 'google_play', store_name: 'Google Play',
    icon_url: '',
    description: 'Tala offers instant personal loans.',
    chinese_parent: '', parent_relation: '',
  },
  // ── 印尼 ID ────────────────────────────────────────────
  {
    id: 'com.adakami.app', name: 'AdaKami', developer: 'PT AdaKami Teknologi Indonesia',
    country_code: 'ID', country_name: '印尼', industry: 'credit', industry_name: '信贷',
    store: 'google_play', store_name: 'Google Play',
    icon_url: '',
    description: 'AdaKami - Pinjaman Online Cepat di Indonesia.',
    chinese_parent: '信也科技（FINV）', parent_relation: '全资子公司',
  },
  {
    id: 'com.dana.indonesia', name: 'DANA', developer: 'PT Espay Debit Indonesia Koe',
    country_code: 'ID', country_name: '印尼', industry: 'finance', industry_name: '理财',
    store: 'google_play', store_name: 'Google Play',
    icon_url: '',
    description: 'DANA - Digital Wallet Indonesia.',
    chinese_parent: 'Ant Group（蚂蚁集团）', parent_relation: '战略股东',
  },
  {
    id: 'com.goto.gopay.android', name: 'GoPay', developer: 'PT Dompet Anak Bangsa',
    country_code: 'ID', country_name: '印尼', industry: 'finance', industry_name: '理财',
    store: 'google_play', store_name: 'Google Play',
    icon_url: '',
    description: 'GoPay - Digital payments by Gojek.',
    chinese_parent: '阿里巴巴（持股GoTo集团）', parent_relation: '股东',
  },
  {
    id: 'id.co.kredivo.app', name: 'Kredivo', developer: 'PT FinAccel Digital Indonesia',
    country_code: 'ID', country_name: '印尼', industry: 'credit', industry_name: '信贷',
    store: 'google_play', store_name: 'Google Play',
    icon_url: '',
    description: 'Kredivo - Cicilan 0% & Pinjaman Tunai.',
    chinese_parent: 'FinAccel（腾讯战略投资）', parent_relation: '投资方',
  },
  {
    id: 'com.akulaku.credit', name: 'Akulaku', developer: 'Akulaku Indonesia',
    country_code: 'ID', country_name: '印尼', industry: 'credit', industry_name: '信贷',
    store: 'google_play', store_name: 'Google Play',
    icon_url: '',
    description: 'Akulaku - Belanja Cicilan & Pinjaman.',
    chinese_parent: 'Akulaku（蚂蚁集团战略投资）', parent_relation: '战略投资',
  },
  {
    id: 'id.ovo.app', name: 'OVO', developer: 'PT Visionet Internasional',
    country_code: 'ID', country_name: '印尼', industry: 'finance', industry_name: '理财',
    store: 'google_play', store_name: 'Google Play',
    icon_url: '',
    description: 'OVO - Smart Financial App.',
    chinese_parent: '阿里巴巴（间接持股）', parent_relation: '间接股东',
  },
  // ── 巴基斯坦 PK ────────────────────────────────────────
  {
    id: 'com.jazzcash.android', name: 'JazzCash', developer: 'Jazz',
    country_code: 'PK', country_name: '巴基斯坦', industry: 'finance', industry_name: '理财',
    store: 'google_play', store_name: 'Google Play',
    icon_url: '',
    description: 'JazzCash - Mobile Account & Payments.',
    chinese_parent: '阿里巴巴（间接持股Jazz/Veon）', parent_relation: '间接股东',
  },
  {
    id: 'pk.com.telenor.easypaisa', name: 'Easypaisa', developer: 'Telenor Microfinance Bank',
    country_code: 'PK', country_name: '巴基斯坦', industry: 'finance', industry_name: '理财',
    store: 'google_play', store_name: 'Google Play',
    icon_url: '',
    description: 'Easypaisa - Pakistan Mobile Wallet.',
    chinese_parent: '蚂蚁集团（持股Easypaisa）', parent_relation: '股东',
  },
  {
    id: 'pk.com.sadapay', name: 'SadaPay', developer: 'SadaPay Technologies',
    country_code: 'PK', country_name: '巴基斯坦', industry: 'finance', industry_name: '理财',
    store: 'google_play', store_name: 'Google Play',
    icon_url: '',
    description: 'SadaPay - Digital banking in Pakistan.',
    chinese_parent: '', parent_relation: '',
  },
  // ── 马来西亚 MY ────────────────────────────────────────
  {
    id: 'com.touch.n.go.ewallet', name: 'Touch \'n Go eWallet', developer: 'TNG Digital Sdn Bhd',
    country_code: 'MY', country_name: '马来西亚', industry: 'finance', industry_name: '理财',
    store: 'google_play', store_name: 'Google Play',
    icon_url: '',
    description: 'Touch n Go eWallet - Malaysia\'s no.1 e-wallet.',
    chinese_parent: 'Ant Group（持股TNG Digital 65%）', parent_relation: '控股股东',
  },
  {
    id: 'com.grab.personal', name: 'GrabPay', developer: 'Grab Holdings',
    country_code: 'MY', country_name: '马来西亚', industry: 'finance', industry_name: '理财',
    store: 'google_play', store_name: 'Google Play',
    icon_url: '',
    description: 'GrabPay - Payments, Loans & Insurance.',
    chinese_parent: '滴滴出行（持股Grab）', parent_relation: '股东',
  },
  {
    id: 'com.gxbank.app', name: 'GXBank', developer: 'GX Bank Berhad',
    country_code: 'MY', country_name: '马来西亚', industry: 'finance', industry_name: '理财',
    store: 'google_play', store_name: 'Google Play',
    icon_url: '',
    description: 'GXBank - Malaysia\'s first digital bank.',
    chinese_parent: '腾讯', parent_relation: '战略股东',
  },
  // ── 澳大利亚 AU ────────────────────────────────────────
  {
    id: 'com.beforepay.app', name: 'BeforePay', developer: 'BeforePay Group Limited',
    country_code: 'AU', country_name: '澳大利亚', industry: 'credit', industry_name: '信贷',
    store: 'google_play', store_name: 'Google Play',
    icon_url: '',
    description: 'BeforePay - Wage advance & budgeting.',
    chinese_parent: '', parent_relation: '',
  },
  {
    id: 'com.afterpay.android', name: 'Afterpay', developer: 'Block Inc',
    country_code: 'AU', country_name: '澳大利亚', industry: 'credit', industry_name: '信贷',
    store: 'google_play', store_name: 'Google Play',
    icon_url: '',
    description: 'Afterpay - Buy Now, Pay Later.',
    chinese_parent: 'Block Inc（原Square，美资）', parent_relation: '外资（美国）',
  },
  {
    id: 'com.zipmoney.android', name: 'Zip - Buy Now Pay Later', developer: 'Zip Co Limited',
    country_code: 'AU', country_name: '澳大利亚', industry: 'credit', industry_name: '信贷',
    store: 'google_play', store_name: 'Google Play',
    icon_url: '',
    description: 'Zip - BNPL & personal credit.',
    chinese_parent: 'ANT参股Zip Co', parent_relation: '少数股东',
  },
  // ── 英国 GB ────────────────────────────────────────────
  {
    id: 'com.revolut.revolut', name: 'Revolut', developer: 'Revolut Ltd',
    country_code: 'GB', country_name: '英国', industry: 'finance', industry_name: '理财',
    store: 'google_play', store_name: 'Google Play',
    icon_url: '',
    description: 'Revolut - One app for all things money.',
    chinese_parent: '腾讯/SoftBank参股', parent_relation: '投资方',
  },
  {
    id: 'com.monzo.android', name: 'Monzo', developer: 'Monzo Bank Limited',
    country_code: 'GB', country_name: '英国', industry: 'finance', industry_name: '理财',
    store: 'google_play', store_name: 'Google Play',
    icon_url: '',
    description: 'Monzo - Mobile Banking & Loans.',
    chinese_parent: '腾讯战略投资', parent_relation: '投资方',
  },
  {
    id: 'com.starlingbank', name: 'Starling Bank', developer: 'Starling Bank Limited',
    country_code: 'GB', country_name: '英国', industry: 'finance', industry_name: '理财',
    store: 'google_play', store_name: 'Google Play',
    icon_url: '',
    description: 'Starling Bank - Digital current account.',
    chinese_parent: '', parent_relation: '',
  },
  {
    id: 'com.creditspring.android', name: 'CreditSpring', developer: 'CreditSpring',
    country_code: 'GB', country_name: '英国', industry: 'credit', industry_name: '信贷',
    store: 'google_play', store_name: 'Google Play',
    icon_url: '',
    description: 'CreditSpring - Subscription loans for emergencies.',
    chinese_parent: '', parent_relation: '',
  },
]

// ── Mock 指标数据（含安装量、DAU、消耗推断）──────────────────
export const MOCK_METRICS: AppMetric[] = [
  // 菲律宾
  { app_id: 'ph.gcash.android', country_code: 'PH', store: 'google_play', timestamp: new Date().toISOString(), rank: 1, rank_change: 0, rating: 4.5, rating_change: 0.1, reviews: 2850000, reviews_change: 12000, min_installs: 50000000, installs_str: '50,000,000+', installs_change: 500000, installs_growth: 1.0, dau_estimate: 8500000, dau_change: 85000, ad_spend_intensity: 62, is_new: false },
  { app_id: 'com.juanhand.loanapp', country_code: 'PH', store: 'google_play', timestamp: new Date().toISOString(), rank: 5, rank_change: 3, rating: 4.2, rating_change: 0.0, reviews: 180000, reviews_change: 5200, min_installs: 5000000, installs_str: '5,000,000+', installs_change: 250000, installs_growth: 5.3, dau_estimate: 315000, dau_change: 18000, ad_spend_intensity: 78, is_new: false },
  { app_id: 'com.cashalo.app', country_code: 'PH', store: 'google_play', timestamp: new Date().toISOString(), rank: 8, rank_change: -2, rating: 3.9, rating_change: -0.1, reviews: 95000, reviews_change: 1800, min_installs: 2000000, installs_str: '2,000,000+', installs_change: 50000, installs_growth: 2.6, dau_estimate: 85000, dau_change: 2000, ad_spend_intensity: 52, is_new: false },
  { app_id: 'com.akulaku.credit.philippines', country_code: 'PH', store: 'google_play', timestamp: new Date().toISOString(), rank: 12, rank_change: 5, rating: 4.1, rating_change: 0.2, reviews: 42000, reviews_change: 3100, min_installs: 1000000, installs_str: '1,000,000+', installs_change: 120000, installs_growth: 13.6, dau_estimate: 52000, dau_change: 6500, ad_spend_intensity: 88, is_new: false },
  { app_id: 'com.tala.android.scarecrow', country_code: 'PH', store: 'google_play', timestamp: new Date().toISOString(), rank: 15, rank_change: 1, rating: 4.3, rating_change: 0.0, reviews: 68000, reviews_change: 1200, min_installs: 5000000, installs_str: '5,000,000+', installs_change: 80000, installs_growth: 1.6, dau_estimate: 192000, dau_change: 3000, ad_spend_intensity: 44, is_new: false },
  // 印尼
  { app_id: 'com.adakami.app', country_code: 'ID', store: 'google_play', timestamp: new Date().toISOString(), rank: 3, rank_change: 8, rating: 4.4, rating_change: 0.3, reviews: 310000, reviews_change: 28000, min_installs: 10000000, installs_str: '10,000,000+', installs_change: 1200000, installs_growth: 13.6, dau_estimate: 820000, dau_change: 95000, ad_spend_intensity: 92, is_new: false },
  { app_id: 'com.dana.indonesia', country_code: 'ID', store: 'google_play', timestamp: new Date().toISOString(), rank: 1, rank_change: 0, rating: 4.6, rating_change: 0.0, reviews: 6200000, reviews_change: 35000, min_installs: 100000000, installs_str: '100,000,000+', installs_change: 800000, installs_growth: 0.8, dau_estimate: 18000000, dau_change: 150000, ad_spend_intensity: 55, is_new: false },
  { app_id: 'com.goto.gopay.android', country_code: 'ID', store: 'google_play', timestamp: new Date().toISOString(), rank: 2, rank_change: 1, rating: 4.5, rating_change: 0.1, reviews: 5100000, reviews_change: 22000, min_installs: 100000000, installs_str: '100,000,000+', installs_change: 600000, installs_growth: 0.6, dau_estimate: 16000000, dau_change: 100000, ad_spend_intensity: 58, is_new: false },
  { app_id: 'id.co.kredivo.app', country_code: 'ID', store: 'google_play', timestamp: new Date().toISOString(), rank: 7, rank_change: 4, rating: 4.2, rating_change: 0.1, reviews: 320000, reviews_change: 18000, min_installs: 10000000, installs_str: '10,000,000+', installs_change: 800000, installs_growth: 8.7, dau_estimate: 620000, dau_change: 52000, ad_spend_intensity: 82, is_new: false },
  { app_id: 'com.akulaku.credit', country_code: 'ID', store: 'google_play', timestamp: new Date().toISOString(), rank: 10, rank_change: 2, rating: 4.0, rating_change: -0.1, reviews: 560000, reviews_change: 9500, min_installs: 50000000, installs_str: '50,000,000+', installs_change: 500000, installs_growth: 1.0, dau_estimate: 2800000, dau_change: 28000, ad_spend_intensity: 65, is_new: false },
  { app_id: 'id.ovo.app', country_code: 'ID', store: 'google_play', timestamp: new Date().toISOString(), rank: 4, rank_change: -1, rating: 4.4, rating_change: 0.0, reviews: 3800000, reviews_change: 15000, min_installs: 100000000, installs_str: '100,000,000+', installs_change: 400000, installs_growth: 0.4, dau_estimate: 14000000, dau_change: 60000, ad_spend_intensity: 60, is_new: false },
  // 巴基斯坦
  { app_id: 'com.jazzcash.android', country_code: 'PK', store: 'google_play', timestamp: new Date().toISOString(), rank: 1, rank_change: 0, rating: 4.3, rating_change: 0.0, reviews: 1850000, reviews_change: 25000, min_installs: 50000000, installs_str: '50,000,000+', installs_change: 600000, installs_growth: 1.2, dau_estimate: 7500000, dau_change: 90000, ad_spend_intensity: 58, is_new: false },
  { app_id: 'pk.com.telenor.easypaisa', country_code: 'PK', store: 'google_play', timestamp: new Date().toISOString(), rank: 2, rank_change: 0, rating: 4.1, rating_change: 0.1, reviews: 1200000, reviews_change: 18000, min_installs: 50000000, installs_str: '50,000,000+', installs_change: 500000, installs_growth: 1.0, dau_estimate: 5800000, dau_change: 60000, ad_spend_intensity: 54, is_new: false },
  { app_id: 'pk.com.sadapay', country_code: 'PK', store: 'google_play', timestamp: new Date().toISOString(), rank: 8, rank_change: 6, rating: 4.5, rating_change: 0.2, reviews: 88000, reviews_change: 12000, min_installs: 1000000, installs_str: '1,000,000+', installs_change: 250000, installs_growth: 33.3, dau_estimate: 65000, dau_change: 18000, ad_spend_intensity: 85, is_new: false },
  // 马来西亚
  { app_id: 'com.touch.n.go.ewallet', country_code: 'MY', store: 'google_play', timestamp: new Date().toISOString(), rank: 1, rank_change: 0, rating: 4.4, rating_change: 0.0, reviews: 1500000, reviews_change: 12000, min_installs: 10000000, installs_str: '10,000,000+', installs_change: 200000, installs_growth: 2.0, dau_estimate: 1800000, dau_change: 36000, ad_spend_intensity: 62, is_new: false },
  { app_id: 'com.grab.personal', country_code: 'MY', store: 'google_play', timestamp: new Date().toISOString(), rank: 2, rank_change: 1, rating: 4.2, rating_change: 0.1, reviews: 820000, reviews_change: 8500, min_installs: 10000000, installs_str: '10,000,000+', installs_change: 180000, installs_growth: 1.8, dau_estimate: 1500000, dau_change: 30000, ad_spend_intensity: 60, is_new: false },
  { app_id: 'com.gxbank.app', country_code: 'MY', store: 'google_play', timestamp: new Date().toISOString(), rank: 6, rank_change: 10, rating: 4.6, rating_change: 0.4, reviews: 42000, reviews_change: 15000, min_installs: 500000, installs_str: '500,000+', installs_change: 200000, installs_growth: 66.7, dau_estimate: 45000, dau_change: 20000, ad_spend_intensity: 96, is_new: true },
  // 澳大利亚
  { app_id: 'com.beforepay.app', country_code: 'AU', store: 'google_play', timestamp: new Date().toISOString(), rank: 12, rank_change: 4, rating: 4.1, rating_change: 0.2, reviews: 28000, reviews_change: 3500, min_installs: 500000, installs_str: '500,000+', installs_change: 80000, installs_growth: 19.0, dau_estimate: 25000, dau_change: 4000, ad_spend_intensity: 72, is_new: false },
  { app_id: 'com.afterpay.android', country_code: 'AU', store: 'google_play', timestamp: new Date().toISOString(), rank: 5, rank_change: -1, rating: 4.5, rating_change: 0.0, reviews: 320000, reviews_change: 4200, min_installs: 5000000, installs_str: '5,000,000+', installs_change: 120000, installs_growth: 2.5, dau_estimate: 800000, dau_change: 20000, ad_spend_intensity: 68, is_new: false },
  { app_id: 'com.zipmoney.android', country_code: 'AU', store: 'google_play', timestamp: new Date().toISOString(), rank: 8, rank_change: 2, rating: 4.0, rating_change: 0.1, reviews: 85000, reviews_change: 2800, min_installs: 1000000, installs_str: '1,000,000+', installs_change: 50000, installs_growth: 5.3, dau_estimate: 65000, dau_change: 3000, ad_spend_intensity: 55, is_new: false },
  // 英国
  { app_id: 'com.revolut.revolut', country_code: 'GB', store: 'google_play', timestamp: new Date().toISOString(), rank: 1, rank_change: 0, rating: 4.6, rating_change: 0.1, reviews: 620000, reviews_change: 8500, min_installs: 10000000, installs_str: '10,000,000+', installs_change: 250000, installs_growth: 2.6, dau_estimate: 2200000, dau_change: 55000, ad_spend_intensity: 70, is_new: false },
  { app_id: 'com.monzo.android', country_code: 'GB', store: 'google_play', timestamp: new Date().toISOString(), rank: 3, rank_change: 2, rating: 4.5, rating_change: 0.1, reviews: 280000, reviews_change: 6200, min_installs: 5000000, installs_str: '5,000,000+', installs_change: 200000, installs_growth: 4.2, dau_estimate: 950000, dau_change: 42000, ad_spend_intensity: 76, is_new: false },
  { app_id: 'com.starlingbank', country_code: 'GB', store: 'google_play', timestamp: new Date().toISOString(), rank: 5, rank_change: 1, rating: 4.7, rating_change: 0.0, reviews: 195000, reviews_change: 3800, min_installs: 5000000, installs_str: '5,000,000+', installs_change: 120000, installs_growth: 2.5, dau_estimate: 680000, dau_change: 24000, ad_spend_intensity: 58, is_new: false },
  { app_id: 'com.creditspring.android', country_code: 'GB', store: 'google_play', timestamp: new Date().toISOString(), rank: 18, rank_change: 7, rating: 4.2, rating_change: 0.3, reviews: 12000, reviews_change: 2800, min_installs: 100000, installs_str: '100,000+', installs_change: 35000, installs_growth: 53.8, dau_estimate: 5200, dau_change: 1800, ad_spend_intensity: 82, is_new: false },
]
