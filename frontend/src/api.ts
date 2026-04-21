const BASE = '/api'

export interface Site {
  siteId: number
  site: string
  region: string
  country: string
  siteType: string
  status: number
  snowSiteName: string
  siteChampionName: string
  siteChampionEmail: string
  address: string
  pentestStatus: number | null
  tabletopStatus: number | null
  networkCount: number
}

export interface SiteDetail extends Site {
  siteManagerName: string
  siteSize: string
  fsreSiteID: number | null
  pentestDate: string
  idStatus: number | null
  idDate: string
  edrStatus: number | null
  edrDate: string
  tabletopDate: string
}

export async function fetchSite(siteId: number): Promise<SiteDetail> {
  const res = await fetch(`${BASE}/sites/${siteId}`)
  if (!res.ok) throw new Error('Failed to fetch site')
  return res.json()
}

export interface EnterpriseNetwork {
  cidrNetwork: string
  networkName: string
  hostCount: number
  disposition: number | null
  monitoring: number | null
  description: string
  networkAdded: string | null
}

export interface OTAsset {
  deviceId: string
  ipAddress: string
  macAddress: string
  lastSeen: string | null
  networkName: string
  cidrNetwork: string
  hostname: string
  category: string
  profile: string
  profileType: string
  riskLevel: string
  confidenceScore: number | null
}

export async function fetchSiteAssets(siteId: number): Promise<OTAsset[]> {
  const res = await fetch(`${BASE}/sites/${siteId}/assets`)
  if (!res.ok) throw new Error('Failed to fetch assets')
  return res.json()
}

export async function fetchSiteNetworks(siteId: number): Promise<EnterpriseNetwork[]> {
  const res = await fetch(`${BASE}/sites/${siteId}/networks`)
  if (!res.ok) throw new Error('Failed to fetch networks')
  return res.json()
}

export async function fetchSites(): Promise<Site[]> {
  const res = await fetch(`${BASE}/sites`)
  if (!res.ok) throw new Error('Failed to fetch sites')
  return res.json()
}

export interface Column {
  name: string
  type: string
}

export interface TableData {
  total: number
  columns: string[]
  rows: Record<string, unknown>[]
}

export async function fetchTables(): Promise<string[]> {
  const res = await fetch(`${BASE}/tables`)
  if (!res.ok) throw new Error('Failed to fetch tables')
  const data = await res.json()
  return data.tables
}

export async function fetchTableSchema(table: string): Promise<Column[]> {
  const res = await fetch(`${BASE}/tables/${encodeURIComponent(table)}/schema`)
  if (!res.ok) throw new Error('Failed to fetch schema')
  return res.json()
}

export async function fetchTableData(
  table: string,
  offset: number,
  limit: number,
): Promise<TableData> {
  const res = await fetch(
    `${BASE}/tables/${encodeURIComponent(table)}/data?offset=${offset}&limit=${limit}`,
  )
  if (!res.ok) throw new Error('Failed to fetch data')
  return res.json()
}
