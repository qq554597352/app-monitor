import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, List, RefreshCw } from 'lucide-react'
import { formatRelativeTime } from '../utils/formatters'

interface NavbarProps {
  lastUpdated?: string | null
  onRefresh?: () => void
  refreshing?: boolean
}

export default function Navbar({ lastUpdated, onRefresh, refreshing }: NavbarProps) {
  const location = useLocation()

  const navLinks = [
    { to: '/', label: '仪表盘', icon: <LayoutDashboard size={16} /> },
    { to: '/apps', label: 'APP列表', icon: <List size={16} /> },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0F172A]/90 backdrop-blur-md border-b border-white/5">
      <div className="max-w-[1400px] mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center text-xs font-bold">
            M
          </div>
          <span className="font-semibold text-[#F8FAFC] text-sm hidden sm:block">
            海外金融APP监控
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${
                location.pathname === link.to
                  ? 'bg-[#6366F1]/20 text-[#818CF8]'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-white/5'
              }`}
            >
              {link.icon}
              <span className="hidden sm:block">{link.label}</span>
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-[#64748B] hidden md:block">
              更新于 {formatRelativeTime(lastUpdated)}
            </span>
          )}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={refreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-[#1E293B] text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#334155] transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              <span className="hidden sm:block">刷新</span>
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
