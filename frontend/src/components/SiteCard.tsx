import type { Site } from '../api'

interface TypeConfig {
  color: string
  bg: string
}

const TYPE_CONFIG: Record<string, TypeConfig> = {
  'PLANT':       { color: '#22c55e', bg: 'rgba(34,197,94,0.10)' },
  'OFFICE':      { color: '#3b82f6', bg: 'rgba(59,130,246,0.10)' },
  'DATA CENTER': { color: '#a855f7', bg: 'rgba(168,85,247,0.10)' },
  'LAB':         { color: '#f59e0b', bg: 'rgba(245,158,11,0.10)' },
  'JV':          { color: '#06b6d4', bg: 'rgba(6,182,212,0.10)' },
}

function typeConfig(siteType: string): TypeConfig {
  return TYPE_CONFIG[siteType] ?? { color: '#64748b', bg: 'rgba(100,116,139,0.10)' }
}

export default function SiteCard({ site, onClick }: { site: Site; onClick?: () => void }) {
  const cfg = typeConfig(site.siteType)
  const active = site.status === 1

  return (
    <div
      className="group relative overflow-hidden transition-all duration-150"
      style={{
        background: '#0e1117',
        border: '1px solid #1c2028',
        borderRadius: '2px',
        cursor: onClick ? 'pointer' : 'default',
      }}
      onClick={onClick}
      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = '#2a3140' }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = '#1c2028' }}
    >
      {/* type accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px] transition-all duration-150 group-hover:w-1"
        style={{ background: cfg.color }}
      />

      <div className="pl-4 pr-3 pt-3.5 pb-3.5">
        {/* site name + status */}
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3
            className="leading-tight"
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              fontSize: '15px',
              letterSpacing: '0.04em',
              color: '#e2e8f0',
              textTransform: 'uppercase',
            }}
          >
            {site.site}
          </h3>
          <div
            className="mt-1 shrink-0 rounded-full"
            style={{
              width: '6px',
              height: '6px',
              background: active ? '#22c55e' : '#334155',
              boxShadow: active ? '0 0 6px #22c55e88' : 'none',
            }}
          />
        </div>

        {/* meta rows */}
        <div className="mb-3 space-y-1">
          {site.snowSiteName && (
            <div className="truncate" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: '#94a3b8' }}>
              {site.snowSiteName}
            </div>
          )}
          {site.siteChampionName && (
            <div className="truncate" style={{ fontFamily: "'Barlow', sans-serif", fontSize: '13px', color: '#94a3b8' }}>
              {site.siteChampionName}
              {site.siteChampionEmail && (
                <span style={{ color: '#64748b' }}> · {site.siteChampionEmail}</span>
              )}
            </div>
          )}
          {site.address && (
            <div className="truncate" style={{ fontFamily: "'Barlow', sans-serif", fontSize: '12px', color: '#64748b' }}>
              {site.address}
            </div>
          )}
        </div>

        {/* badges */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {site.region && (
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '10px',
                color: '#64748b',
                background: 'rgba(148,163,184,0.07)',
                border: '1px solid rgba(148,163,184,0.12)',
                padding: '1px 6px',
                borderRadius: '2px',
                letterSpacing: '0.06em',
              }}
            >
              {site.region}
            </span>
          )}
          {site.siteType && (
            <span
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 600,
                fontSize: '10px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: cfg.color,
                background: cfg.bg,
                border: `1px solid ${cfg.color}33`,
                padding: '1px 6px',
                borderRadius: '2px',
              }}
            >
              {site.siteType}
            </span>
          )}
          {site.networkCount > 0 && (
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '10px',
                color: '#94a3b8',
                background: 'rgba(148,163,184,0.07)',
                border: '1px solid rgba(148,163,184,0.12)',
                padding: '1px 6px',
                borderRadius: '2px',
                letterSpacing: '0.04em',
              }}
            >
              {site.networkCount} {site.networkCount === 1 ? 'network' : 'networks'}
            </span>
          )}
          {site.pentestStatus ? (
            <span
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700,
                fontSize: '10px',
                letterSpacing: '0.1em',
                color: '#f97316',
                background: 'rgba(249,115,22,0.10)',
                border: '1px solid rgba(249,115,22,0.25)',
                padding: '1px 6px',
                borderRadius: '2px',
              }}
            >
              PENTEST
            </span>
          ) : null}
          {site.tabletopStatus ? (
            <span
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700,
                fontSize: '10px',
                letterSpacing: '0.1em',
                color: '#06b6d4',
                background: 'rgba(6,182,212,0.10)',
                border: '1px solid rgba(6,182,212,0.25)',
                padding: '1px 6px',
                borderRadius: '2px',
              }}
            >
              EXERCISE COMPLETE
            </span>
          ) : null}
        </div>
      </div>
    </div>
  )
}
