import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.security import create_signed_idp_token

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "online"

def test_sso_token_verification_success():
    # Generate test signed IdP token
    token = create_signed_idp_token(
        user_id="usr_123",
        email="test.ops@company.com",
        name="Test Ops User",
        allowed_products=["edupulse", "cloudmetric"],
        role="OPERATOR"
    )
    
    response = client.post("/api/v1/auth/verify-token", json={"token": token})
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "test.ops@company.com"
    assert "edupulse" in data["user"]["products"]

def test_unauthorized_product_access():
    # User only authorized for edupulse
    token = create_signed_idp_token(
        user_id="usr_edupulse_only",
        email="edu.only@company.com",
        name="Edu Only",
        allowed_products=["edupulse"],
        role="OPERATOR"
    )
    
    verify_res = client.post("/api/v1/auth/verify-token", json={"token": token})
    session_token = verify_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {session_token}"}
    
    # EduPulse endpoint should succeed
    res_edu = client.get("/api/v1/edupulse/plans", headers=headers)
    assert res_edu.status_code == 200
    
    # CloudMetric endpoint should fail with 403 Forbidden
    res_cm = client.get("/api/v1/cloudmetric/sites", headers=headers)
    assert res_cm.status_code == 403
