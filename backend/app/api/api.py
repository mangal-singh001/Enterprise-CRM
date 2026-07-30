from fastapi import APIRouter
from app.api.v1 import auth, metadata, edupulse, cloudmetric, analytics

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(metadata.router, prefix="/metadata", tags=["Metadata Registry"])
api_router.include_router(edupulse.router, prefix="/edupulse", tags=["EduPulse Workspace"])
api_router.include_router(cloudmetric.router, prefix="/cloudmetric", tags=["CloudMetric Workspace"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Executive Analytics"])
