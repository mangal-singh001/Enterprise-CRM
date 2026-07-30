from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.security import get_current_user, require_product
from app.models.edupulse import SubscriptionPlan, MessageTemplate
from app.models.audit import AuditLog
from app.schemas.edupulse import (
    SubscriptionPlanCreate, SubscriptionPlanUpdate, SubscriptionPlanResponse,
    MessageTemplateCreate, MessageTemplateUpdate, MessageTemplateResponse
)

router = APIRouter(dependencies=[Depends(require_product("edupulse"))])

# ----------------------------
# 1. SUBSCRIPTION PLANS CRUD
# ----------------------------

@router.get("/plans", response_model=List[SubscriptionPlanResponse])
def list_subscription_plans(
    q: Optional[str] = Query(None, description="Search by plan name"),
    billing_cycle: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(SubscriptionPlan)
    if q:
        query = query.filter(SubscriptionPlan.name.ilike(f"%{q}%"))
    if billing_cycle:
        query = query.filter(SubscriptionPlan.billing_cycle == billing_cycle)
    return query.order_by(SubscriptionPlan.id.desc()).all()

@router.get("/plans/{plan_id}", response_model=SubscriptionPlanResponse)
def get_subscription_plan(plan_id: int, db: Session = Depends(get_db)):
    plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subscription plan not found")
    return plan

@router.post("/plans", response_model=SubscriptionPlanResponse, status_code=status.HTTP_201_CREATED)
def create_subscription_plan(
    payload: SubscriptionPlanCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    plan = SubscriptionPlan(
        name=payload.name,
        price=payload.price,
        billing_cycle=payload.billing_cycle,
        features=payload.features or {}
    )
    db.add(plan)
    db.commit()
    db.refresh(plan)

    # Audit log
    audit = AuditLog(
        product_id="edupulse",
        entity_id="subscription_plans",
        action="CREATE",
        record_id=str(plan.id),
        performed_by=current_user["email"],
        changes={"name": plan.name, "price": plan.price, "billing_cycle": plan.billing_cycle}
    )
    db.add(audit)
    db.commit()

    return plan

@router.put("/plans/{plan_id}", response_model=SubscriptionPlanResponse)
def update_subscription_plan(
    plan_id: int,
    payload: SubscriptionPlanUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subscription plan not found")

    changes = {}
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if value is not None:
            old_val = getattr(plan, field)
            if old_val != value:
                changes[field] = {"old": old_val, "new": value}
                setattr(plan, field, value)

    db.commit()
    db.refresh(plan)

    if changes:
        audit = AuditLog(
            product_id="edupulse",
            entity_id="subscription_plans",
            action="UPDATE",
            record_id=str(plan.id),
            performed_by=current_user["email"],
            changes=changes
        )
        db.add(audit)
        db.commit()

    return plan

@router.delete("/plans/{plan_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_subscription_plan(
    plan_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subscription plan not found")

    plan_name = plan.name
    db.delete(plan)
    db.commit()

    audit = AuditLog(
        product_id="edupulse",
        entity_id="subscription_plans",
        action="DELETE",
        record_id=str(plan_id),
        performed_by=current_user["email"],
        changes={"deleted_name": plan_name}
    )
    db.add(audit)
    db.commit()
    return None


# ----------------------------
# 2. MESSAGE TEMPLATES CRUD
# ----------------------------

@router.get("/templates", response_model=List[MessageTemplateResponse])
def list_message_templates(
    q: Optional[str] = Query(None, description="Search by template name"),
    channel: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(MessageTemplate)
    if q:
        query = query.filter(MessageTemplate.name.ilike(f"%{q}%"))
    if channel:
        query = query.filter(MessageTemplate.channel == channel)
    return query.order_by(MessageTemplate.id.desc()).all()

@router.get("/templates/{template_id}", response_model=MessageTemplateResponse)
def get_message_template(template_id: int, db: Session = Depends(get_db)):
    tpl = db.query(MessageTemplate).filter(MessageTemplate.id == template_id).first()
    if not tpl:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message template not found")
    return tpl

@router.post("/templates", response_model=MessageTemplateResponse, status_code=status.HTTP_201_CREATED)
def create_message_template(
    payload: MessageTemplateCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    tpl = MessageTemplate(
        name=payload.name,
        channel=payload.channel,
        configuration=payload.configuration
    )
    db.add(tpl)
    db.commit()
    db.refresh(tpl)

    audit = AuditLog(
        product_id="edupulse",
        entity_id="message_templates",
        action="CREATE",
        record_id=str(tpl.id),
        performed_by=current_user["email"],
        changes={"name": tpl.name, "channel": tpl.channel}
    )
    db.add(audit)
    db.commit()

    return tpl

@router.put("/templates/{template_id}", response_model=MessageTemplateResponse)
def update_message_template(
    template_id: int,
    payload: MessageTemplateUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    tpl = db.query(MessageTemplate).filter(MessageTemplate.id == template_id).first()
    if not tpl:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message template not found")

    changes = {}
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if value is not None:
            old_val = getattr(tpl, field)
            if old_val != value:
                changes[field] = {"old": old_val, "new": value}
                setattr(tpl, field, value)

    db.commit()
    db.refresh(tpl)

    if changes:
        audit = AuditLog(
            product_id="edupulse",
            entity_id="message_templates",
            action="UPDATE",
            record_id=str(tpl.id),
            performed_by=current_user["email"],
            changes=changes
        )
        db.add(audit)
        db.commit()

    return tpl

@router.delete("/templates/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_message_template(
    template_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    tpl = db.query(MessageTemplate).filter(MessageTemplate.id == template_id).first()
    if not tpl:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message template not found")

    tpl_name = tpl.name
    db.delete(tpl)
    db.commit()

    audit = AuditLog(
        product_id="edupulse",
        entity_id="message_templates",
        action="DELETE",
        record_id=str(template_id),
        performed_by=current_user["email"],
        changes={"deleted_name": tpl_name}
    )
    db.add(audit)
    db.commit()
    return None
