from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.database import get_db
from app.core.security import verify_password, create_access_token, verify_google_token
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["auth"])

class GoogleLoginRequest(BaseModel):
    token: str

@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or user.role not in ["evaluator", "admin"] or not user.hashed_password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
        
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is disabled")

    access_token = create_access_token(data={"sub": str(user.id), "role": user.role})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/google")
def google_login(req: GoogleLoginRequest, db: Session = Depends(get_db)):
    idinfo = verify_google_token(req.token)
    if not idinfo or "email" not in idinfo:
        raise HTTPException(status_code=401, detail="Invalid Google token")
        
    email = idinfo["email"]
    
    # Check if a user with this email exists
    user = db.query(User).filter(User.email == email).first()
    if not user or user.role != "scholar":
        raise HTTPException(status_code=403, detail="Not a registered scholar")
        
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is disabled")

    access_token = create_access_token(data={"sub": str(user.id), "role": user.role})
    return {"access_token": access_token, "token_type": "bearer"}

import os

class DevLoginRequest(BaseModel):
    email: str

@router.post("/dev-login")
def dev_login(req: DevLoginRequest, db: Session = Depends(get_db)):
    if os.getenv("ENV") != "development":
        raise HTTPException(status_code=404, detail="Not found")
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    access_token = create_access_token(data={"sub": str(user.id), "role": user.role})
    return {"access_token": access_token, "token_type": "bearer"}
