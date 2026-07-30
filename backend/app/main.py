from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging

from app.core.config import settings
from app.api.api import api_router
from app.db.base import Base
from app.db.session import engine, SessionLocal
from app.models.edupulse import SubscriptionPlan, MessageTemplate
from app.models.cloudmetric import ClientSite
from app.models.audit import AuditLog

# Initialize database tables automatically
Base.metadata.create_all(bind=engine)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    description="Unified Internal Enterprise CRM Platform API for managing multi-product operations (EduPulse & CloudMetric)."
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def seed_initial_data_if_empty():
    """
    Auto-seeds sample operational data if running for the first time.
    """
    db = SessionLocal()
    try:
        # 1. Seed EduPulse Subscription Plans
        if db.query(SubscriptionPlan).count() == 0:
            logger.info("Seeding initial EduPulse Subscription Plans...")
            plans = [
                SubscriptionPlan(
                    name="Starter Tier",
                    price=29.99,
                    billing_cycle="Monthly",
                    features={"max_students": 100, "email_support": True, "custom_branding": False}
                ),
                SubscriptionPlan(
                    name="Professional Tier",
                    price=89.99,
                    billing_cycle="Monthly",
                    features={"max_students": 500, "email_support": True, "custom_branding": True, "analytics": "Basic"}
                ),
                SubscriptionPlan(
                    name="Enterprise Annual Tier",
                    price=899.00,
                    billing_cycle="Yearly",
                    features={"max_students": 5000, "dedicated_account_manager": True, "custom_branding": True, "analytics": "Advanced", "sso_integration": True}
                )
            ]
            db.add_all(plans)

        # 2. Seed EduPulse Message Templates
        if db.query(MessageTemplate).count() == 0:
            logger.info("Seeding initial EduPulse Message Templates...")
            templates = [
                MessageTemplate(
                    name="Student Welcome Email",
                    channel="Email",
                    configuration={
                        "subject": "Welcome to EduPulse!",
                        "html_body": "<h2>Welcome {{student_name}}!</h2><p>Your portal activation link is ready.</p>",
                        "sender_email": "notifications@edupulse.io"
                    }
                ),
                MessageTemplate(
                    name="Payment Due SMS Alert",
                    channel="SMS",
                    configuration={
                        "message_text": "EduPulse Alert: Your monthly invoice of ${{amount}} is due on {{due_date}}.",
                        "sender_id": "EDUPULSE"
                    }
                ),
                MessageTemplate(
                    name="Grade Report WhatsApp",
                    channel="WhatsApp",
                    configuration={
                        "template_name": "term_grade_report_v1",
                        "language": "en_US",
                        "header_text": "Official Semester Report Card"
                    }
                )
            ]
            db.add_all(templates)

        # 3. Seed CloudMetric Client Sites
        if db.query(ClientSite).count() == 0:
            logger.info("Seeding initial CloudMetric Client Sites...")
            sites = [
                ClientSite(
                    domain_name="analytics.acme-corp.com",
                    api_key="cm_live_7f8a9b0c1d2e3f4a5b6c",
                    status="Active",
                    daily_quota=50000
                ),
                ClientSite(
                    domain_name="dash.fintech-global.io",
                    api_key="cm_live_1a2b3c4d5e6f7g8h9i0j",
                    status="Active",
                    daily_quota=150000
                ),
                ClientSite(
                    domain_name="api.legacy-partner.net",
                    api_key="cm_live_9z8y7x6w5v4u3t2s1r0q",
                    status="Suspended",
                    daily_quota=5000
                )
            ]
            db.add_all(sites)

        db.commit()
    except Exception as e:
        logger.error(f"Error seeding initial database: {e}")
        db.rollback()
    finally:
        db.close()

# Exception Handlers
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global unhandled exception on {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An unexpected server error occurred. Please contact IT ops."}
    )

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "title": settings.PROJECT_NAME,
        "status": "online",
        "docs_url": "/docs",
        "api_v1": settings.API_V1_STR
    }
