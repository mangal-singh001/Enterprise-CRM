from datetime import datetime, timezone
import json
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, JSON
from app.db.base import Base

class SubscriptionPlan(Base):
    __tablename__ = "edupulse_subscription_plans"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False, index=True)
    price = Column(Float, nullable=False, default=0.0)
    billing_cycle = Column(String(50), nullable=False, default="Monthly") # Monthly, Quarterly, Yearly
    features = Column(JSON, nullable=True) # Structured configuration dictionary
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "price": self.price,
            "billing_cycle": self.billing_cycle,
            "features": self.features or {},
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class MessageTemplate(Base):
    __tablename__ = "edupulse_message_templates"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False, index=True)
    channel = Column(String(50), nullable=False, default="Email") # Email, SMS, WhatsApp, Push
    configuration = Column(JSON, nullable=False) # Dynamic config based on channel
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "channel": self.channel,
            "configuration": self.configuration or {},
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
