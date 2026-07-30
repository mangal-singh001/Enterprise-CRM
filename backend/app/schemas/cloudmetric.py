from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field, field_validator

class ClientSiteBase(BaseModel):
    domain_name: str = Field(..., min_length=3, max_length=255, example="api.analytics-client.com")
    api_key: str = Field(..., min_length=8, max_length=255, example="cm_live_9f8a7b6c5d4e3f2a1b")
    status: str = Field("Active", example="Active")
    daily_quota: int = Field(10000, ge=100, example=50000)

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        allowed = ["Active", "Suspended", "Maintenance"]
        if v not in allowed:
            raise ValueError(f"Status must be one of {allowed}")
        return v

class ClientSiteCreate(ClientSiteBase):
    pass

class ClientSiteUpdate(BaseModel):
    domain_name: Optional[str] = None
    api_key: Optional[str] = None
    status: Optional[str] = None
    daily_quota: Optional[int] = None

class ClientSiteResponse(ClientSiteBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
