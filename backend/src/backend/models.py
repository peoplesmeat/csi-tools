from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, SmallInteger, Boolean
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


class ISCSite(Base):
    __tablename__ = "ISC_Sites"

    siteId = Column(Integer, primary_key=True)
    site = Column(String(128))
    fsreSiteID = Column(Integer)
    company = Column(String(32))
    region = Column(String(8))
    country = Column(String(32))
    siteType = Column(String(16))
    siteSize = Column(String(16))
    recordCreated = Column(DateTime)
    recordUpdated = Column(DateTime)
    ttl = Column(SmallInteger)
    status = Column(SmallInteger)
    snowSiteName = Column(String(128))
    ot = Column(Boolean)
    primaryBusiness = Column(String(64))
    businesses = Column(String(128))
    disposition = Column(SmallInteger)
    siteManagerName = Column(String(128))
    siteChampionName = Column(String(128))
    siteChampionEmail = Column(String(128))
    address = Column(String)
    pentestStatus = Column(SmallInteger)
    pentestDate = Column(String(16))
    idStatus = Column(SmallInteger)
    idDate = Column(String(16))
    edrStatus = Column(SmallInteger)
    edrDate = Column(String(16))
    tabletopStatus = Column(SmallInteger)
    tabletopDate = Column(String(16))


class ISCEnterpriseNetwork(Base):
    __tablename__ = "ISC_EnterpriseNetworks"

    cidrNetwork = Column(String(32), primary_key=True)
    siteId = Column(SmallInteger)
    networkName = Column(String(64))
    networkInt = Column(Integer)
    hostCount = Column(Integer)
    disposition = Column(SmallInteger)
    monitoring = Column(SmallInteger)
    description = Column(String(64))
    networkAdded = Column(DateTime)


class ISCOTAsset(Base):
    __tablename__ = "ISC_OTAssetsPA"

    deviceId = Column(String(64), primary_key=True)
    ipAddress = Column(String(64))
    ipInt = Column(Integer)
    macAddress = Column(String(32))
    lastSeen = Column(DateTime)
    lastUpdated = Column(DateTime)
    deviceJson = Column(String)
