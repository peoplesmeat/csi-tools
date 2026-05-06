import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Site } from '../api'
import SiteCard from './SiteCard'

function SkeletonCard() {
  return (
    <div
      className="animate-pulse overflow-hidden"
      style={{
        background: '#0e1117',
        border: '1px solid #1c2028',
        borderRadius: '2px',
        height: '92px',
      }}
    >
      <div className="pl-4 pr-3 pt-3.5 pb-3.5">
        <div style={{ background: '#1c2028', height: '13px', width: '60%', borderRadius: '2px', marginBottom: '10px' }} />
        <div style={{ background: '#1c2028', height: '10px', width: '40%', borderRadius: '2px', marginBottom: '14px' }} />
        <div className="flex gap-1.5">
          <div style={{ background: '#1c2028', height: '16px', width: '36px', borderRadius: '2px' }} />
          <div style={{ background: '#1c2028', height: '16px', width: '48px', borderRadius: '2px' }} />
        </div>
      </div>
    </div>
  )
}

interface Props {
  sites: Site[]
  loading: boolean
}

export default function Dashboard({ sites, loading }: Props) {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string | null>('PLANT')

  const siteTypes = useMemo(
    () => Array.from(new Set(sites.map((s) => s.siteType).filter(Boolean))).sort(),
    [sites],
  )

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return sites.filter((s) => {
      const matchesSearch =
        !q ||
        s.site?.toLowerCase().includes(q) ||
        s.snowSiteName?.toLowerCase().includes(q) ||
        s.region?.toLowerCase().includes(q)
      const matchesType = !typeFilter || s.siteType === typeFilter
      return matchesSearch && matchesType
    })
  }, [sites, search, typeFilter])

  return (
    <div className="min-h-screen" style={{ background: '#080a0d', fontFamily: "'Barlow', sans-serif" }}>
      {/* sticky header */}
      <div
        className="sticky top-0 z-10 px-6 py-4"
        style={{ background: '#080a0dcc', borderBottom: '1px solid #1c2028', backdropFilter: 'blur(10px)' }}
      >
        <div className="max-w-[1600px] mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-baseline gap-3 mr-auto">
              <span
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 900,
                  fontSize: '20px',
                  letterSpacing: '0.15em',
                  color: '#e2e8f0',
                  textTransform: 'uppercase',
                }}
              >
                Sites
              </span>
              {!loading && (
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: '#334155' }}>
                  {filtered.length}/{sites.length}
                </span>
              )}
            </div>

            {/* search */}
            <div className="relative">
              <span
                className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none select-none"
                style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: '#22c55e' }}
              >
                /
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="filter sites, regions…"
                style={{
                  paddingLeft: '24px',
                  paddingRight: '12px',
                  paddingTop: '6px',
                  paddingBottom: '6px',
                  background: '#0e1117',
                  border: '1px solid #1c2028',
                  borderRadius: '2px',
                  color: '#e2e8f0',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '11px',
                  width: '280px',
                  outline: 'none',
                  transition: 'border-color 0.15s',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#2a3140' }}
                onBlur={(e) => { e.currentTarget.style.borderColor = '#1c2028' }}
              />
            </div>
          </div>

          {/* type filter pills */}
          {siteTypes.length > 0 && (
            <div className="flex items-center gap-1.5 mt-3 flex-wrap">
              {(['', ...siteTypes] as string[]).map((t) => {
                const active = t === '' ? !typeFilter : typeFilter === t
                return (
                  <button
                    key={t || '__all'}
                    onClick={() => setTypeFilter(t === '' ? null : typeFilter === t ? null : t)}
                    style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontWeight: 600,
                      fontSize: '11px',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      padding: '2px 10px',
                      borderRadius: '2px',
                      background: active ? 'rgba(255,255,255,0.07)' : 'transparent',
                      color: active ? '#e2e8f0' : '#475569',
                      border: `1px solid ${active ? '#2a3140' : '#1c2028'}`,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {t || 'ALL'}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* grid */}
      <div className="max-w-[1600px] mx-auto px-6 py-6">
        {loading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 16 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: '48px',
                fontWeight: 900,
                color: '#1c2028',
                letterSpacing: '0.1em',
              }}
            >
              //
            </div>
            <div
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: '12px',
                letterSpacing: '0.2em',
                color: '#334155',
                textTransform: 'uppercase',
                marginTop: '8px',
              }}
            >
              No sites found
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((site) => (
              <SiteCard key={site.siteId} site={site} onClick={() => navigate(`/sites/${site.siteId}`)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
