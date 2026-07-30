import jwt
from datetime import datetime, timedelta, timezone
from typing import Optional, List, Dict, Any
from fastapi import Depends, HTTPException, status, Query, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.config import settings

security_bearer = HTTPBearer(auto_error=False)

def create_signed_idp_token(
    user_id: str,
    email: str,
    name: str,
    allowed_products: List[str],
    role: str = "OPERATOR",
    expires_delta: Optional[timedelta] = None
) -> str:
    """
    Generates a signed authentication token as if issued by the corporate Identity Provider (IdP).
    """
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    payload = {
        "iss": "Internal-Enterprise-IdP",
        "sub": user_id,
        "email": email,
        "name": name,
        "products": allowed_products,
        "role": role,
        "exp": int(expire.timestamp()),
        "iat": int(datetime.now(timezone.utc).timestamp()),
        "token_type": "idp_sso"
    }
    encoded_jwt = jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def create_session_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    Creates an internal CRM session token once the IdP SSO token is validated.
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": int(expire.timestamp()), "token_type": "crm_session"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def decode_token(token: str) -> Dict[str, Any]:
    """
    Decodes and verifies a JWT token. Raises HTTPException if invalid or expired.
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token has expired. Please log in via IdP SSO link again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token signature or structure.",
            headers={"WWW-Authenticate": "Bearer"},
        )

def get_current_user(
    request: Request,
    token_param: Optional[str] = Query(None, alias="token"),
    auth_credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer)
) -> Dict[str, Any]:
    """
    FastAPI Dependency: Extracts and verifies current user identity either from:
    1. HTTP Bearer Header (`Authorization: Bearer <session_token>`)
    2. URL Query parameter (`?token=<idp_token>`)
    """
    token_to_verify = None
    
    if auth_credentials and auth_credentials.credentials:
        token_to_verify = auth_credentials.credentials
    elif token_param:
        token_to_verify = token_param
        
    if not token_to_verify:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please provide a valid IdP SSO token.",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    payload = decode_token(token_to_verify)
    return {
        "user_id": payload.get("sub"),
        "email": payload.get("email"),
        "name": payload.get("name"),
        "products": payload.get("products", []),
        "role": payload.get("role", "OPERATOR")
    }

def verify_product_permission(user: Dict[str, Any], product_id: str) -> bool:
    """
    Checks if the user has access to a specific product workspace.
    Admin roles implicitly have access to all products.
    """
    if user.get("role") == "ADMIN":
        return True
    user_products = [p.lower() for p in user.get("products", [])]
    return product_id.lower() in user_products or "*" in user_products

def require_product(product_id: str):
    """
    FastAPI Dependency Factory: Enforces product authorization on endpoints.
    Usage: `@router.get('/...', dependencies=[Depends(require_product('edupulse'))])`
    """
    def dependency(user: Dict[str, Any] = Depends(get_current_user)):
        if not verify_product_permission(user, product_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"User '{user.get('email')}' is not authorized to access product workspace '{product_id}'."
            )
        return user
    return dependency
