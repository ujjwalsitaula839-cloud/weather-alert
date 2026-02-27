from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

# Registration Schema
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    phone_number: str
    city: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    phone_number: Optional[str]
    city: Optional[str]
    rain_threshold_mm: float
    alerts_enabled: bool

    class Config:
        orm_mode = True # For Pydantic v1. For v2, use model_config = {'from_attributes': True}
        from_attributes = True

class UserUpdatePreferences(BaseModel):
    city: Optional[str] = None
    phone_number: Optional[str] = None
    rain_threshold_mm: Optional[float] = None
    alerts_enabled: Optional[bool] = None
