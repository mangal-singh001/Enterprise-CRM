from typing import List, Optional
from pydantic import BaseModel, EmailStr

class TokenVerifyRequest(BaseModel):
    token: str

class UserProfile(BaseModel):
    user_id: str
    email: str
    name: str
    products: List[str]
    role: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserProfile
