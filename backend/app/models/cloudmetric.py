from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime
from app.db.base import Base

class ClientSite(Base):
    __tablename__ = "cloudmetric_client_sites"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    domain_name = Column(String(255), nullable=False, unique=True, index=True)
    api_key = Column(String(255), nullable=False, unique=True)
    status = Column(String(50), nullable=False, default="Active") # Active, Suspended, Maintenance
    daily_quota = Column(Integer, nullable=False, default=10000)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "id": self.id,
            "domain_name": self.domain_name,
            "api_key": self.api_key,
            "status": self.status,
            "daily_quota": self.daily_quota,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
