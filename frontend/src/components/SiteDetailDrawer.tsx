import { useEffect, useState } from 'react'
import { fetchSiteNetworks, type EnterpriseNetwork, type Site } from '../api'

interface Props {
  site: Site | null
  onClose: () => void
}

export default function SiteDetailDrawer({ site, onClose }: Props) {
  const [networks, setNetworks] = useState<EnterpriseNetwork[]>([])
  const [loading, setLoading] = useState(false)
  const open = site !== null

  useEffect(() => {
    if (!site) return
    setNetworks([])
    setLoading(true)
    fetchSiteNetworks(site.siteId)
      .then(setNetworks)
      .finally(() => setLoading(false))
  }, [site?.siteId])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <>
      {/* backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 40,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(2px)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 0.2s',
        }}
      />

      {/* drawer */}
      <div
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 50,
          width: '520px', maxWidth: '100vw',
          background: '#0e1117',
          borderLeft: '1px solid #1c2028',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.25s cubic-bezier(0.4,0,0.2,1)',
          display: 'flex', flexDirection: 'column',
          fontFamily: "'Barlow', sans-serif",
        }}
      >
        {site && (
          <>
            {/* header */}
            <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #1c2028', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                <div>
                  <div
                    style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontWeight: 800,
                      fontSize: '20px',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      color: '#e2e8f0',
                    }}
                  >
                    {site.site}
                  </div>
                  {site.snowSiteName && (
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: '#475569', marginTop: '4px' }}>
                      {site.snowSiteName}
                    </div>
                  )}
                </div>
                <button
                  onClick={onClose}
                  style={{
                    background: 'transparent',
                    border: '1px solid #1c2028',
                    borderRadius: '2px',
                    color: '#475569',
                    cursor: 'pointer',
                    padding: '4px 8px',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '12px',
                    flexShrink: 0,
                    marginTop: '2px',
                  }}
                >
                  ESC
                </button>
              </div>

              {/* site meta */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
                {[site.region, site.country, site.siteType].filter(Boolean).map((v) => (
                  <span key={v} style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 600, fontSize: '11px', letterSpacing: '0.1em',
                    textTransform: 'uppercase', color: '#64748b',
                    background: 'rgba(148,163,184,0.07)', border: '1px solid #1c2028',
                    padding: '2px 8px', borderRadius: '2px',
                  }}>{v}</span>
                ))}
              </div>
            </div>

            {/* networks section */}
            <div style={{ padding: '16px 24px 8px', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700, fontSize: '13px', letterSpacing: '0.12em',
                  textTransform: 'uppercase', color: '#94a3b8',
                }}>
                  Enterprise Networks
                </span>
                {!loading && (
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: '#334155' }}>
                    {networks.length}
                  </span>
                )}
              </div>
            </div>

            {/* network list */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px 24px' }}>
              {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} style={{
                      height: '52px', borderRadius: '2px', background: '#141820',
                      border: '1px solid #1c2028', animation: 'pulse 1.5s infinite',
                    }} />
                  ))}
                </div>
              ) : networks.length === 0 ? (
                <div style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: '12px', letterSpacing: '0.15em', textTransform: 'uppercase',
                  color: '#334155', textAlign: 'center', paddingTop: '40px',
                }}>
                  No networks found
                </div>
              ) : (
                <NetworkSections networks={networks} />
              )}
            </div>
          </>
        )}
      </div>
    </>
  )
}

function SectionLabel({ label, count }: { label: string; count: number }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '8px',
      padding: '10px 0 6px',
    }}>
      <span style={{
        fontFamily: "'Barlow Condensed', sans-serif",
        fontWeight: 700, fontSize: '11px', letterSpacing: '0.14em',
        textTransform: 'uppercase', color: '#334155',
      }}>
        {label}
      </span>
      <span style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '10px', color: '#1e2a38',
      }}>
        {count}
      </span>
      <div style={{ flex: 1, height: '1px', background: '#1c2028' }} />
    </div>
  )
}

function NetworkSections({ networks }: { networks: EnterpriseNetwork[] }) {
  const gpn = networks.filter((n) => n.networkName?.startsWith('GPN'))
  const pcn = networks.filter((n) => n.networkName?.startsWith('PCN'))
  const other = networks.filter((n) => !n.networkName?.startsWith('GPN') && !n.networkName?.startsWith('PCN'))

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {gpn.length > 0 && (
        <>
          <SectionLabel label="GPN" count={gpn.length} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {gpn.map((n) => <NetworkRow key={n.cidrNetwork} network={n} />)}
          </div>
        </>
      )}
      {other.length > 0 && (
        <>
          <SectionLabel label="Other" count={other.length} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {other.map((n) => <NetworkRow key={n.cidrNetwork} network={n} />)}
          </div>
        </>
      )}
      {pcn.length > 0 && (
        <>
          <SectionLabel label="PCN" count={pcn.length} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {pcn.map((n) => <NetworkRow key={n.cidrNetwork} network={n} />)}
          </div>
        </>
      )}
    </div>
  )
}

function NetworkRow({ network: n }: { network: EnterpriseNetwork }) {
  const monitored = n.monitoring === 1

  return (
    <div
      style={{
        background: '#141820',
        border: '1px solid #1c2028',
        borderRadius: '2px',
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}
    >
      {/* monitoring indicator */}
      <div style={{
        width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0,
        background: monitored ? '#22c55e' : '#334155',
        boxShadow: monitored ? '0 0 6px #22c55e88' : 'none',
      }} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
          {n.networkName && (
            <span style={{
              fontFamily: "'Barlow', sans-serif",
              fontWeight: 600,
              fontSize: '13px', color: '#e2e8f0',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {n.networkName}
            </span>
          )}
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '12px', color: '#475569',
          }}>
            {n.cidrNetwork}
          </span>
        </div>
        {n.description && (
          <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: '11px', color: '#475569', marginTop: '2px' }}>
            {n.description}
          </div>
        )}
      </div>

      {n.hostCount > 0 && (
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '11px', color: '#475569', flexShrink: 0,
        }}>
          {n.hostCount.toLocaleString()} hosts
        </span>
      )}
    </div>
  )
}
