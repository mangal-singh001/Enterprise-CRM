from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, field_validator

# Subscription Plan Schemas
class SubscriptionPlanBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, example="Enterprise Tier")
    price: float = Field(..., ge=0, example=199.99)
    billing_cycle: str = Field("Monthly", example="Monthly")
    features: Optional[Dict[str, Any]] = Field(default_factory=dict, example={"max_students": 1000, "custom_domain": True})

    @field_validator("billing_cycle")
    @classmethod
    def validate_billing_cycle(cls, v: str) -> str:
        allowed = ["Monthly", "Quarterly", "Yearly", "Custom"]
        if v not in allowed:
            raise ValueError(f"Billing cycle must be one of {allowed}")
        return v

class SubscriptionPlanCreate(SubscriptionPlanBase):
    pass

class SubscriptionPlanUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = None
    billing_cycle: Optional[str] = None
    features: Optional[Dict[str, Any]] = None

class SubscriptionPlanResponse(SubscriptionPlanBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Message Template Schemas
class MessageTemplateBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, example="Welcome Email Template")
    channel: str = Field(..., example="Email")
    configuration: Dict[str, Any] = Field(..., example={"subject": "Welcome!", "html_body": "<h1>Hi {{name}}</h1>"})

    @field_validator("channel")
    @classmethod
    def validate_channel(cls, v: str) -> str:
        allowed = ["Email", "SMS", "WhatsApp", "Push"]
        if v not in allowed:
            raise ValueError(f"Channel must be one of {allowed}")
        return v

    @field_validator("configuration")
    @classmethod
    def validate_configuration_for_channel(cls, v: Dict[str, Any], info) -> Dict[str, Any]:
        # Validate that configuration contains expected channel-specific fields if channel is provided
        channel = info.data.get("channel")
        if channel == "Email":
            if "subject" not in v and "html_body" not in v and "text_body" not in v:
                # Provide defaults if missing
                v.setdefault("subject", "Default Subject")
                v.setdefault("html_body", "<p>Hello</p>")
        elif channel == "SMS":
            if "message_text" not in v and "sender_id" not in v:
                v.setdefault("message_text", "Default SMS text")
                v.setdefault("sender_id", "EDUPULSE")
        return v

class MessageTemplateCreate(MessageTemplateBase):
    pass

class MessageTemplateUpdate(BaseModel):
    name: Optional[str] = None
    channel: Optional[str] = None
    configuration: Optional[Dict[str, Any]] = None

class MessageTemplateResponse(MessageTemplateBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
