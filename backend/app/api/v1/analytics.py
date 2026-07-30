from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.session import get_db
from app.core.security import get_current_user
from app.models.edupulse import SubscriptionPlan, MessageTemplate
from app.models.cloudmetric import ClientSite
from app.models.audit import AuditLog

router = APIRouter()

@router.get("/dashboard-summary")
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Returns aggregate executive dashboard metrics across all authorized products.
    """
    plans_count = db.query(func.count(SubscriptionPlan.id)).scalar() or 0
    templates_count = db.query(func.count(MessageTemplate.id)).scalar() or 0
    sites_count = db.query(func.count(ClientSite.id)).scalar() or 0
    active_sites_count = db.query(func.count(ClientSite.id)).filter(ClientSite.status == "Active").scalar() or 0
    total_quota = db.query(func.sum(ClientSite.daily_quota)).scalar() or 0
    
    # Recent audit logs
    recent_audits = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(10).all()
    
    return {
        "metrics": {
            "edupulse": {
                "total_plans": plans_count,
                "total_templates": templates_count,
            },
            "cloudmetric": {
                "total_sites": sites_count,
                "active_sites": active_sites_count,
                "total_daily_quota": total_quota,
            }
        },
        "recent_activities": [a.to_dict() for a in recent_audits]
    }

@router.get("/audit-logs")
def list_audit_logs(
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Returns recent system audit log activities for governance.
    """
    audits = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit).all()
    return [a.to_dict() for a in audits]
