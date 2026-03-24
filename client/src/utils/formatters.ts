// 数据格式化工具

export function formatNumber(value: number | null | undefined, fallback = '—'): string {
  if (value === null || value === undefined) return fallback;
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toString();
}

/** 格式化安装量（含来源说明） */
export function formatInstalls(minInstalls: number, installsStr?: string): string {
  if (installsStr && installsStr.trim()) {
    // 如果是 App Store 估算值，直接返回估算字符串
    if (installsStr.includes('估算')) return installsStr;
    // Google Play 真实值
    return installsStr;
  }
  if (!minInstalls || minInstalls === 0) return '—';
  return formatNumber(minInstalls) + '+'
}

/** 格式化安装量增长率 */
export function formatGrowthRate(rate: number | null | undefined): string {
  if (rate === null || rate === undefined) return '—';
  const sign = rate >= 0 ? '+' : '';
  return `${sign}${rate.toFixed(1)}%`;
}

/** 获取增长率颜色 */
export function getGrowthColor(rate: number | null | undefined): string {
  if (rate === null || rate === undefined) return 'text-slate-400';
  if (rate > 5) return 'text-success';
  if (rate > 0) return 'text-emerald-400';
  if (rate < -5) return 'text-danger';
  if (rate < 0) return 'text-red-400';
  return 'text-slate-400';
}

/** 投放强度等级文字 */
export function getIntensityLabel(score: number | null | undefined): string {
  if (score === null || score === undefined) return '未知';
  if (score >= 80) return '极强';
  if (score >= 60) return '强';
  if (score >= 40) return '中';
  if (score >= 20) return '弱';
  return '极弱';
}

export function formatRating(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return value.toFixed(1);
}

export function formatRankChange(change: number | null | undefined): string {
  if (change === null || change === undefined) return '—';
  if (change > 0) return `↑${change}`;
  if (change < 0) return `↓${Math.abs(change)}`;
  return '—';
}

export function formatDate(isoString: string | null | undefined): string {
  if (!isoString) return '—';
  const d = new Date(isoString);
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Shanghai',
  });
}

export function formatRelativeTime(isoString: string | null | undefined): string {
  if (!isoString) return '未知';
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}小时前`;
  return `${Math.floor(hours / 24)}天前`;
}

export function getRankChangeColor(change: number | null | undefined): string {
  if (change === null || change === undefined) return 'text-slate-400';
  if (change > 0) return 'text-success';
  if (change < 0) return 'text-danger';
  return 'text-slate-400';
}

export function getIntensityColor(score: number | null | undefined): string {
  if (score === null || score === undefined) return '#64748B';
  if (score >= 80) return '#EF4444';
  if (score >= 60) return '#F59E0B';
  if (score >= 40) return '#6366F1';
  return '#334155';
}

export function getIndustryLabel(industry: string): string {
  const map: Record<string, string> = {
    credit: '信贷',
    finance: '理财',
    insurance: '保险',
  };
  return map[industry] || industry;
}

export function getIndustryColor(industry: string): string {
  const map: Record<string, string> = {
    credit: '#6366F1',
    finance: '#3B82F6',
    insurance: '#10B981',
  };
  return map[industry] || '#64748B';
}

export function getCountryFlag(code: string): string {
  const flags: Record<string, string> = {
    PH: '🇵🇭',
    ID: '🇮🇩',
    PK: '🇵🇰',
    MY: '🇲🇾',
    AU: '🇦🇺',
    GB: '🇬🇧',
    MX: '🇲🇽',
  };
  return flags[code] || '🌍';
}
