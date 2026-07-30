from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, JSON
from app.db.base import Base

class AuditLog(Base):
    __tablename__ = "crm_audit_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    product_id = Column(String(50), nullable=False, index=True)
    entity_id = Column(String(50), nullable=False, index=True)
    action = Column(String(50), nullable=False) # CREATE, UPDATE, DELETE
    record_id = Column(String(100), nullable=False)
    performed_by = Column(String(255), nullable=False) # User email or ID
    changes = Column(JSON, nullable=True) # Details of modified fields
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "id": self.id,
            "product_id": self.product_id,
            "entity_id": self.entity_id,
            "action": self.action,
            "record_id": self.record_id,
            "performed_by": self.performed_by,
            "changes": self.changes or {},
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
        }
