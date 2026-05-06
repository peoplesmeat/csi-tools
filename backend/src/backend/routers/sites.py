import json
from fastapi import APIRouter
from sqlalchemy import func, select, case, text
from sqlalchemy.orm import Session
from backend.database import get_engine
from backend.models import ISCSite, ISCEnterpriseNetwork

router = APIRouter(prefix="/api/sites", tags=["sites"])


@router.get("/{site_id}")
def site_detail(site_id: int):
    with Session(get_engine()) as session:
        s = session.query(ISCSite).filter(ISCSite.siteId == site_id).first()
        if not s:
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="Site not found")
        return {
            "siteId": s.siteId,
            "site": s.site or "",
            "region": s.region or "",
            "country": s.country or "",
            "siteType": s.siteType or "",
            "siteSize": s.siteSize or "",
            "fsreSiteID": s.fsreSiteID,
            "status": s.status or 0,
            "snowSiteName": s.snowSiteName or "",
            "siteManagerName": s.siteManagerName or "",
            "siteChampionName": s.siteChampionName or "",
            "siteChampionEmail": s.siteChampionEmail or "",
            "address": s.address or "",
            "pentestStatus": s.pentestStatus,
            "pentestDate": s.pentestDate or "",
            "idStatus": s.idStatus,
            "idDate": s.idDate or "",
            "edrStatus": s.edrStatus,
            "edrDate": s.edrDate or "",
            "tabletopStatus": s.tabletopStatus,
            "tabletopDate": s.tabletopDate or "",
        }


@router.get("/{site_id}/assets")
def site_assets(site_id: int):
    sql = text("""
        SELECT ASSETS.deviceId, ASSETS.ipAddress, ASSETS.macAddress,
               ASSETS.lastSeen, ASSETS.lastUpdated, ASSETS.deviceJson,
               NETS.networkName, NETS.cidrNetwork
        FROM ISC_Sites SITES
        INNER JOIN ISC_EnterpriseNetworks NETS ON SITES.siteId = NETS.siteId
        INNER JOIN ISC_OTAssetsPA ASSETS
            ON ASSETS.ipInt >= NETS.networkInt
            AND ASSETS.ipInt <= NETS.networkInt + NETS.hostCount
        WHERE SITES.siteId = :site_id
        ORDER BY NETS.networkName, ASSETS.ipAddress
    """)
    with get_engine().connect() as conn:
        rows = conn.execute(sql, {"site_id": site_id}).fetchall()
    assets = []
    for r in rows:
        device_data = {}
        if r.deviceJson:
            try:
                device_data = json.loads(r.deviceJson)
            except (ValueError, TypeError):
                pass
        assets.append({
            "deviceId": r.deviceId,
            "ipAddress": r.ipAddress or "",
            "macAddress": r.macAddress or "",
            "lastSeen": r.lastSeen.isoformat() if r.lastSeen else None,
            "networkName": r.networkName or "",
            "cidrNetwork": r.cidrNetwork or "",
            "hostname": device_data.get("hostname") or "",
            "category": device_data.get("category") or "",
            "profile": device_data.get("profile") or "",
            "profileType": device_data.get("profile_type") or "",
            "riskLevel": device_data.get("risk_level") or "",
            "confidenceScore": device_data.get("confidence_score"),
        })
    return assets


@router.get("/{site_id}/networks")
def site_networks(site_id: int):
    with Session(get_engine()) as session:
        network_order = case(
            (ISCEnterpriseNetwork.networkName.like('GPN%'), 1),
            (ISCEnterpriseNetwork.networkName.like('OMN%'), 2),
            (ISCEnterpriseNetwork.networkName.like('PCN%'), 3),
            else_=4,
        )
        networks = (
            session.query(ISCEnterpriseNetwork)
            .filter(ISCEnterpriseNetwork.siteId == site_id)
            .order_by(network_order, ISCEnterpriseNetwork.networkName)
            .all()
        )
        return [
            {
                "cidrNetwork": n.cidrNetwork,
                "networkName": n.networkName or "",
                "hostCount": n.hostCount or 0,
                "disposition": n.disposition,
                "monitoring": n.monitoring,
                "description": n.description or "",
                "networkAdded": n.networkAdded.isoformat() if n.networkAdded else None,
            }
            for n in networks
        ]


@router.get("")
def list_sites():
    network_count = (
        select(func.count())
        .where(ISCEnterpriseNetwork.siteId == ISCSite.siteId)
        .correlate(ISCSite)
        .scalar_subquery()
    )

    with Session(get_engine()) as session:
        sites = (
            session.query(
                ISCSite.siteId,
                ISCSite.site,
                ISCSite.region,
                ISCSite.country,
                ISCSite.siteType,
                ISCSite.status,
                ISCSite.snowSiteName,
                ISCSite.siteChampionName,
                ISCSite.siteChampionEmail,
                ISCSite.address,
                ISCSite.pentestStatus,
                ISCSite.tabletopStatus,
                network_count.label("networkCount"),
            )
            .order_by(ISCSite.site)
            .all()
        )
        return [
            {
                "siteId": s.siteId,
                "site": s.site or "",
                "region": s.region or "",
                "country": s.country or "",
                "siteType": s.siteType or "",
                "status": s.status or 0,
                "snowSiteName": s.snowSiteName or "",
                "siteChampionName": s.siteChampionName or "",
                "siteChampionEmail": s.siteChampionEmail or "",
                "address": s.address or "",
                "pentestStatus": s.pentestStatus,
                "tabletopStatus": s.tabletopStatus,
                "networkCount": s.networkCount or 0,
            }
            for s in sites
        ]
