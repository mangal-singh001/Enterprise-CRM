import secrets
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.security import get_current_user, require_product
from app.models.cloudmetric import ClientSite
from app.models.audit import AuditLog
from app.schemas.cloudmetric import (
    ClientSiteCreate, ClientSiteUpdate, ClientSiteResponse
)

router = APIRouter(dependencies=[Depends(require_product("cloudmetric"))])

@router.get("/sites", response_model=List[ClientSiteResponse])
def list_client_sites(
    q: Optional[str] = Query(None, description="Search domain or API key"),
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db)
):
    query = db.query(ClientSite)
    if q:
        query = query.filter(
            (ClientSite.domain_name.ilike(f"%{q}%")) | (ClientSite.api_key.ilike(f"%{q}%"))
        )
    if status_filter:
        query = query.filter(ClientSite.status == status_filter)
    return query.order_by(ClientSite.id.desc()).all()

@router.get("/sites/{site_id}", response_model=ClientSiteResponse)
def get_client_site(site_id: int, db: Session = Depends(get_db)):
    site = db.query(ClientSite).filter(ClientSite.id == site_id).first()
    if not site:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Client site not found")
    return site

@router.post("/sites", response_model=ClientSiteResponse, status_code=status.HTTP_201_CREATED)
def create_client_site(
    payload: ClientSiteCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # Check domain uniqueness
    existing_domain = db.query(ClientSite).filter(ClientSite.domain_name == payload.domain_name).first()
    if existing_domain:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Client site with domain '{payload.domain_name}' already exists."
        )

    site = ClientSite(
        domain_name=payload.domain_name,
        api_key=payload.api_key,
        status=payload.status,
        daily_quota=payload.daily_quota
    )
    db.add(site)
    db.commit()
    db.refresh(site)

    audit = AuditLog(
        product_id="cloudmetric",
        entity_id="client_sites",
        action="CREATE",
        record_id=str(site.id),
        performed_by=current_user["email"],
        changes={"domain_name": site.domain_name, "daily_quota": site.daily_quota, "status": site.status}
    )
    db.add(audit)
    db.commit()

    return site

@router.put("/sites/{site_id}", response_model=ClientSiteResponse)
def update_client_site(
    site_id: int,
    payload: ClientSiteUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    site = db.query(ClientSite).filter(ClientSite.id == site_id).first()
    if not site:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Client site not found")

    changes = {}
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if value is not None:
            old_val = getattr(site, field)
            if old_val != value:
                changes[field] = {"old": old_val, "new": value}
                setattr(site, field, value)

    db.commit()
    db.refresh(site)

    if changes:
        audit = AuditLog(
            product_id="cloudmetric",
            entity_id="client_sites",
            action="UPDATE",
            record_id=str(site.id),
            performed_by=current_user["email"],
            changes=changes
        )
        db.add(audit)
        db.commit()

    return site

@router.delete("/sites/{site_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_client_site(
    site_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    site = db.query(ClientSite).filter(ClientSite.id == site_id).first()
    if not site:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Client site not found")

    domain = site.domain_name
    db.delete(site)
    db.commit()

    audit = AuditLog(
        product_id="cloudmetric",
        entity_id="client_sites",
        action="DELETE",
        record_id=str(site_id),
        performed_by=current_user["email"],
        changes={"deleted_domain": domain}
    )
    db.add(audit)
    db.commit()
    return None

@router.post("/generate-api-key")
def generate_random_api_key():
    """
    Helper utility to generate secure API keys for CloudMetric sites.
    """
    random_hex = secrets.token_hex(16)
    return {"api_key": f"cm_live_{random_hex}"}
