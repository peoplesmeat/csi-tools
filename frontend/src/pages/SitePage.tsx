import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { fetchSite, fetchSiteNetworks, fetchSiteAssets, type SiteDetail, type EnterpriseNetwork, type OTAsset } from '../api'

const mono: React.CSSProperties = { fontFamily: "'JetBrains Mono', monospace" }
const condensed: React.CSSProperties = { fontFamily: "'Barlow Condensed', sans-serif" }
const sans: React.CSSProperties = { fontFamily: "'Barlow', sans-serif" }

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ ...condensed, fontWeight: 700, fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#334155', marginBottom: '4px' }}>
      {children}
    </div>
  )
}

function Value({ children, mono: useMono }: { children: React.ReactNode; mono?: boolean }) {
  return (
    <div style={{ ...(useMono ? mono : sans), fontSize: '13px', color: '#94a3b8' }}>
      {children || <span style={{ color: '#1e2a38' }}>—</span>}
    </div>
  )
}

const STATUS_LABEL: Record<number, { text: string; color: string }> = {
  0: { text: 'Not Started', color: '#334155' },
  1: { text: 'Complete',    color: '#22c55e' },
  2: { text: 'In Progress', color: '#f59e0b' },
  3: { text: 'Scheduled',   color: '#3b82f6' },
}

function StatusBadge({ status, date, completeIfSet }: { status: number | null; date: string; completeIfSet?: boolean }) {
  if (status === null) return <span style={{ ...mono, fontSize: '12px', color: '#1e2a38' }}>—</span>
  const cfg = completeIfSet && status
    ? STATUS_LABEL[1]
    : STATUS_LABEL[status] ?? { text: `Status ${status}`, color: '#64748b' }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span style={{
        ...condensed, fontWeight: 700, fontSize: '11px', letterSpacing: '0.1em',
        textTransform: 'uppercase', color: cfg.color,
        background: `${cfg.color}18`, border: `1px solid ${cfg.color}44`,
        padding: '2px 8px', borderRadius: '2px',
      }}>
        {cfg.text}
      </span>
      {date && <span style={{ ...mono, fontSize: '11px', color: '#475569' }}>{date}</span>}
    </div>
  )
}

function Collapsible({ label, count, children, defaultOpen = true, grow = false }: {
  label: string
  count?: number
  children: React.ReactNode
  defaultOpen?: boolean
  grow?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={grow ? { flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' } : {}}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          width: '100%', background: 'none', border: 'none',
          borderBottom: '1px solid #1c2028',
          padding: '6px 0 8px', marginBottom: open ? '16px' : '0',
          cursor: 'pointer', textAlign: 'left', flexShrink: 0,
        }}
      >
        <span style={{ ...condensed, fontWeight: 700, fontSize: '11px', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#475569' }}>
          {label}
        </span>
        {count !== undefined && (
          <span style={{ ...mono, fontSize: '10px', color: '#334155' }}>{count}</span>
        )}
        <span style={{ marginLeft: 'auto', ...mono, fontSize: '11px', color: '#334155', transition: 'transform 0.15s', display: 'inline-block', transform: open ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
          ▾
        </span>
      </button>
      {open && (
        <div style={grow ? { flex: 1, minHeight: 0, overflowY: 'auto' } : {}}>
          {children}
        </div>
      )}
    </div>
  )
}

function SectionDivider({ label, count }: { label: string; count: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 0 6px' }}>
      <span style={{ ...condensed, fontWeight: 700, fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#334155' }}>
        {label}
      </span>
      <span style={{ ...mono, fontSize: '10px', color: '#1e2a38' }}>{count}</span>
      <div style={{ flex: 1, height: '1px', background: '#1c2028' }} />
    </div>
  )
}

function NetworkRow({ n }: { n: EnterpriseNetwork }) {
  const monitored = n.monitoring === 1
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '12px',
      padding: '10px 14px', background: '#0e1117',
      border: '1px solid #1c2028', borderRadius: '2px',
    }}>
      <div style={{
        width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0,
        background: monitored ? '#22c55e' : '#1e2a38',
        boxShadow: monitored ? '0 0 6px #22c55e88' : 'none',
      }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
          {n.networkName && (
            <span style={{ ...sans, fontWeight: 600, fontSize: '13px', color: '#e2e8f0' }}>{n.networkName}</span>
          )}
          <span style={{ ...mono, fontSize: '12px', color: '#475569' }}>{n.cidrNetwork}</span>
        </div>
        {n.description && (
          <div style={{ ...sans, fontSize: '11px', color: '#475569', marginTop: '2px' }}>{n.description}</div>
        )}
      </div>
      {n.hostCount > 0 && (
        <span style={{ ...mono, fontSize: '11px', color: '#334155', flexShrink: 0 }}>
          {n.hostCount.toLocaleString()} hosts
        </span>
      )}
    </div>
  )
}

function NetworkSections({ networks }: { networks: EnterpriseNetwork[] }) {
  const gpn   = networks.filter((n) => n.networkName?.startsWith('GPN'))
  const pcn   = networks.filter((n) => n.networkName?.startsWith('PCN'))
  const other = networks.filter((n) => !n.networkName?.startsWith('GPN') && !n.networkName?.startsWith('PCN'))

  return (
    <div>
      {gpn.length > 0 && (
        <>
          <SectionDivider label="GPN" count={gpn.length} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {gpn.map((n) => <NetworkRow key={n.cidrNetwork} n={n} />)}
          </div>
        </>
      )}
      {other.length > 0 && (
        <>
          <SectionDivider label="Other" count={other.length} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {other.map((n) => <NetworkRow key={n.cidrNetwork} n={n} />)}
          </div>
        </>
      )}
      {pcn.length > 0 && (
        <>
          <SectionDivider label="PCN" count={pcn.length} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {pcn.map((n) => <NetworkRow key={n.cidrNetwork} n={n} />)}
          </div>
        </>
      )}
    </div>
  )
}

export default function SitePage() {
  const { siteId } = useParams<{ siteId: string }>()
  const navigate = useNavigate()
  const [site, setSite] = useState<SiteDetail | null>(null)
  const [networks, setNetworks] = useState<EnterpriseNetwork[]>([])
  const [assets, setAssets] = useState<OTAsset[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!siteId) return
    const id = Number(siteId)
    Promise.all([fetchSite(id), fetchSiteNetworks(id), fetchSiteAssets(id)])
      .then(([s, n, a]) => { setSite(s); setNetworks(n); setAssets(a) })
      .finally(() => setLoading(false))
  }, [siteId])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#080a0d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ ...mono, fontSize: '12px', color: '#334155' }}>Loading…</span>
      </div>
    )
  }

  if (!site) return null

  return (
    <div style={{ height: '100vh', background: '#080a0d', ...sans, display: 'flex', flexDirection: 'column' }}>
      {/* header */}
      <div style={{ borderBottom: '1px solid #1c2028', padding: '16px 32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            ...mono, fontSize: '11px', color: '#475569',
            background: 'transparent', border: '1px solid #1c2028',
            borderRadius: '2px', padding: '4px 10px', cursor: 'pointer',
          }}
        >
          ← back
        </button>
        <div style={{ ...condensed, fontWeight: 900, fontSize: '22px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#e2e8f0' }}>
          {site.site}
        </div>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginLeft: '4px' }}>
          {[site.region, site.country, site.siteType].filter(Boolean).map((v) => (
            <span key={v} style={{
              ...condensed, fontWeight: 600, fontSize: '11px', letterSpacing: '0.1em',
              textTransform: 'uppercase', color: '#475569',
              background: 'rgba(148,163,184,0.07)', border: '1px solid #1c2028',
              padding: '2px 8px', borderRadius: '2px',
            }}>{v}</span>
          ))}
        </div>
      </div>

      {/* body */}
      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', flex: 1, minHeight: 0 }}>

        {/* left: site info + security */}
        <div style={{ borderRight: '1px solid #1c2028', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '32px', overflowY: 'auto' }}>

          <Collapsible label="Site Info">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div><Label>Snow Site Name</Label><Value mono>{site.snowSiteName}</Value></div>
              <div><Label>Region</Label><Value>{site.region}</Value></div>
              <div><Label>Country</Label><Value>{site.country}</Value></div>
              <div><Label>Site Type</Label><Value>{site.siteType}</Value></div>
              <div><Label>Site Size</Label><Value>{site.siteSize}</Value></div>
              <div><Label>FSRE Site ID</Label><Value mono>{site.fsreSiteID ?? ''}</Value></div>
              <div><Label>Site Manager</Label><Value>{site.siteManagerName}</Value></div>
              <div><Label>Site Champion</Label><Value>{site.siteChampionName}</Value></div>
              <div><Label>Champion Email</Label><Value mono>{site.siteChampionEmail}</Value></div>
              <div><Label>Address</Label><Value>{site.address}</Value></div>
            </div>
          </Collapsible>

          <Collapsible label="Security Assessments">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <Label>Pentest</Label>
                <StatusBadge status={site.pentestStatus} date={site.pentestDate} completeIfSet />
              </div>
              <div>
                <Label>Tabletop Exercise</Label>
                <StatusBadge status={site.tabletopStatus} date={site.tabletopDate} completeIfSet />
              </div>
              <div>
                <Label>Identity (ID)</Label>
                <StatusBadge status={site.idStatus} date={site.idDate} />
              </div>
              <div>
                <Label>EDR</Label>
                <StatusBadge status={site.edrStatus} date={site.edrDate} />
              </div>
            </div>
          </Collapsible>
        </div>

        {/* right: networks + assets */}
        <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '24px', overflow: 'hidden' }}>
          <Collapsible label="Enterprise Networks" count={networks.length}>
          {networks.length === 0 ? (
            <div style={{ ...condensed, fontSize: '12px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#1e2a38' }}>
              No networks
            </div>
          ) : (
            <NetworkSections networks={networks} />
          )}
          </Collapsible>

          <Collapsible label="OT Assets" count={assets.length} grow>
            {assets.length === 0 ? (
              <div style={{ ...condensed, fontSize: '12px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#1e2a38' }}>
                No assets
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingRight: '4px' }}>
                {assets.map((a) => <AssetRow key={a.deviceId} a={a} />)}
              </div>
            )}
          </Collapsible>
        </div>
      </div>
    </div>
  )
}

const RISK_COLOR: Record<string, string> = {
  Low:      '#22c55e',
  Medium:   '#f59e0b',
  High:     '#ef4444',
  Critical: '#dc2626',
}

function AssetRow({ a }: { a: OTAsset }) {
  const riskColor = RISK_COLOR[a.riskLevel] ?? '#475569'
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '140px 1fr auto',
      alignItems: 'center',
      gap: '12px',
      padding: '9px 14px',
      background: '#0e1117',
      border: '1px solid #1c2028',
      borderRadius: '2px',
    }}>
      <span style={{ ...mono, fontSize: '12px', color: '#e2e8f0' }}>{a.ipAddress}</span>
      <div style={{ minWidth: 0 }}>
        {a.hostname && (
          <div style={{ ...sans, fontSize: '12px', color: '#94a3b8', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {a.hostname}
          </div>
        )}
        <div style={{ display: 'flex', gap: '6px', marginTop: a.hostname ? '2px' : '0', flexWrap: 'wrap' }}>
          {a.profile && (
            <span style={{ ...sans, fontSize: '11px', color: '#64748b' }}>
              {a.profile}
            </span>
          )}
          {a.profileType && (
            <span style={{
              ...condensed, fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em',
              textTransform: 'uppercase', color: '#475569',
              background: 'rgba(148,163,184,0.07)', border: '1px solid #1c2028',
              padding: '1px 5px', borderRadius: '2px',
            }}>
              {a.profileType}
            </span>
          )}
        </div>
      </div>
      {a.riskLevel && (
        <span style={{
          ...condensed, fontWeight: 700, fontSize: '10px', letterSpacing: '0.1em',
          textTransform: 'uppercase', color: riskColor,
          background: `${riskColor}18`, border: `1px solid ${riskColor}44`,
          padding: '2px 8px', borderRadius: '2px', flexShrink: 0,
        }}>
          {a.riskLevel}
        </span>
      )}
    </div>
  )
}
