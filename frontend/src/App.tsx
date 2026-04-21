import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { fetchSites, type Site } from './api'
import Dashboard from './components/Dashboard'
import SitePage from './pages/SitePage'

function DashboardLoader() {
  const [sites, setSites] = useState<Site[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSites()
      .then(setSites)
      .finally(() => setLoading(false))
  }, [])

  return <Dashboard sites={sites} loading={loading} />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardLoader />} />
        <Route path="/sites/:siteId" element={<SitePage />} />
      </Routes>
    </BrowserRouter>
  )
}
