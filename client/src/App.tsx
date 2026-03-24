import { useState, useCallback } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import AppList from './pages/AppList'
import AppDetail from './pages/AppDetail'
import { fetchDashboard } from './utils/fetchData'

export default function App() {
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    const dash = await fetchDashboard()
    if (dash?.summary?.last_updated) {
      setLastUpdated(dash.summary.last_updated)
    }
    // 触发页面重载数据
    window.dispatchEvent(new CustomEvent('app-refresh'))
    setTimeout(() => setRefreshing(false), 1000)
  }, [])

  return (
    <BrowserRouter basename={import.meta.env.VITE_BASE_URL || '/'}>
      <Navbar lastUpdated={lastUpdated} onRefresh={handleRefresh} refreshing={refreshing} />
      <main className="pt-14 min-h-screen">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/apps" element={<AppList />} />
            <Route path="/apps/:appId" element={<AppDetail />} />
          </Routes>
        </div>
      </main>
    </BrowserRouter>
  )
}
