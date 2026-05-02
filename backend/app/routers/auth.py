import os
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.database import get_db
from app.core.security import verify_password, create_access_token, verify_google_token, ACCESS_TOKEN_EXPIRE_HOURS
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["auth"])

class GoogleLoginRequest(BaseModel):
    token: str

class DevLoginRequest(BaseModel):
    email: str

def _set_token_cookie(response: Response, token: str):
    """Set httpOnly cookie with the access token."""
    is_prod = os.getenv("ENV") == "production"
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        samesite="lax",
        secure=is_prod,
        max_age=ACCESS_TOKEN_EXPIRE_HOURS * 3600,
        path="/",
    )

@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db), response: Response = None):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or user.role not in ["evaluator", "admin"] or not user.hashed_password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
        
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is disabled")

    access_token = create_access_token(data={"sub": str(user.id), "role": user.role})
    _set_token_cookie(response, access_token)
    return {"message": "Login successful", "access_token": access_token, "token_type": "bearer"}

@router.post("/google")
def google_login(req: GoogleLoginRequest, db: Session = Depends(get_db), response: Response = None):
    idinfo = verify_google_token(req.token)
    if not idinfo or "email" not in idinfo:
        raise HTTPException(status_code=401, detail="Invalid Google token")
        
    email = idinfo["email"]
    
    user = db.query(User).filter(User.email == email).first()
    if not user or user.role != "scholar":
        raise HTTPException(status_code=403, detail="Not a registered scholar")
        
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is disabled")

    access_token = create_access_token(data={"sub": str(user.id), "role": user.role})
    _set_token_cookie(response, access_token)
    return {"message": "Login successful"}

@router.post("/dev-login")
def dev_login(req: DevLoginRequest, db: Session = Depends(get_db), response: Response = None):
    if os.getenv("ENV") != "development":
        raise HTTPException(status_code=404, detail="Not found")
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    access_token = create_access_token(data={"sub": str(user.id), "role": user.role})
    _set_token_cookie(response, access_token)
    return {"message": "Login successful"}

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(
        key="access_token",
        path="/",
    )
    return {"message": "Logged out successfully"}