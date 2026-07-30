from fastapi import APIRouter, Depends, HTTPException, status
from app.core.security import decode_token, create_session_token, get_current_user
from app.schemas.auth import TokenVerifyRequest, TokenResponse, UserProfile

router = APIRouter()

@router.post("/verify-token", response_model=TokenResponse)
def verify_sso_token(payload: TokenVerifyRequest):
    """
    Exchanges a signed IdP SSO token (from ?token=...) for a secure internal CRM session token.
    """
    token_claims = decode_token(payload.token)
    
    user_id = token_claims.get("sub")
    email = token_claims.get("email")
    name = token_claims.get("name", email.split("@")[0] if email else "Employee")
    products = token_claims.get("products", [])
    role = token_claims.get("role", "OPERATOR")
    
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="IdP Token missing required user email claim."
        )
        
    session_data = {
        "sub": user_id or email,
        "email": email,
        "name": name,
        "products": products,
        "role": role
    }
    
    access_token = create_session_token(session_data)
    
    return TokenResponse(
        access_token=access_token,
        user=UserProfile(
            user_id=user_id or email,
            email=email,
            name=name,
            products=products,
            role=role
        )
    )

@router.get("/me", response_model=UserProfile)
def get_user_profile(current_user: dict = Depends(get_current_user)):
    """
    Returns authenticated employee identity and authorized product scopes.
    """
    return UserProfile(
        user_id=current_user["user_id"],
        email=current_user["email"],
        name=current_user["name"],
        products=current_user["products"],
        role=current_user["role"]
    )
