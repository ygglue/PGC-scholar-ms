from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session
from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from datetime import date, datetime
import uuid

from app.core.database import get_db
from app.core.dependencies import get_current_scholar, get_current_evaluator
from app.core.storage import upload_avatar, delete_avatar
from app.models.user import User
from app.models.scholar import Scholar
from app.models.pending_change import PendingChange

router = APIRouter(prefix="/scholars", tags=["scholars"])

class ScholarUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    middle_name: Optional[str] = None
    date_of_birth: Optional[date] = None
    place_of_birth: Optional[str] = None
    sex: Optional[str] = None
    civil_status: Optional[str] = None
    religion: Optional[str] = None
    address: Optional[str] = None
    contact_number: Optional[str] = None
    batch_number: Optional[str] = None
    year_level: Optional[str] = None
    course: Optional[str] = None
    school: Optional[str] = None
    student_type: Optional[str] = None

class ScholarResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    batch_number: Optional[str]
    year_level: Optional[str]
    course: Optional[str]
    school: Optional[str]
    status: str
    student_type: str
    first_name: Optional[str]
    last_name: Optional[str]
    middle_name: Optional[str]
    date_of_birth: Optional[date]
    place_of_birth: Optional[str]
    sex: Optional[str]
    civil_status: Optional[str]
    religion: Optional[str]
    address: Optional[str]
    contact_number: Optional[str]
    avatar_url: Optional[str]
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

@router.get("/me", response_model=ScholarResponse)
def get_own_profile(current_user: User = Depends(get_current_scholar), db: Session = Depends(get_db)):
    scholar = db.query(Scholar).filter(Scholar.user_id == current_user.id).first()
    if not scholar:
        raise HTTPException(status_code=404, detail="Scholar profile not found")
    return scholar

@router.post("/me/avatar")
async def upload_scholar_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_scholar),
    db: Session = Depends(get_db)
):
    scholar = db.query(Scholar).filter(Scholar.user_id == current_user.id).first()
    if not scholar:
        raise HTTPException(status_code=404, detail="Scholar profile not found")

    if file.content_type not in ["image/jpeg", "image/png", "image/webp"]:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, or WebP images are allowed")

    file_bytes = await file.read()
    if len(file_bytes) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 5MB")

    try:
        public_url = upload_avatar(str(scholar.id), file_bytes)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    # Add timestamp to URL to bust browser cache
    import time
    public_url_with_cache_buster = f"{public_url}?t={int(time.time())}"
    
    scholar.avatar_url = public_url_with_cache_buster
    db.commit()
    
    return {"message": "Avatar uploaded successfully", "avatar_url": public_url_with_cache_buster}

@router.delete("/me/avatar")
def remove_scholar_avatar(
    current_user: User = Depends(get_current_scholar),
    db: Session = Depends(get_db)
):
    scholar = db.query(Scholar).filter(Scholar.user_id == current_user.id).first()
    if not scholar:
        raise HTTPException(status_code=404, detail="Scholar profile not found")
        
    if not scholar.avatar_url:
        raise HTTPException(status_code=400, detail="No avatar to delete")
        
    try:
        delete_avatar(str(scholar.id))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
    scholar.avatar_url = None
    db.commit()
    
    return {"message": "Avatar deleted successfully"}

@router.post("/me/update")
def request_profile_update(update_data: ScholarUpdate, current_user: User = Depends(get_current_scholar), db: Session = Depends(get_db)):
    scholar = db.query(Scholar).filter(Scholar.user_id == current_user.id).first()
    if not scholar:
        raise HTTPException(status_code=404, detail="Scholar profile not found")

    # Check for pending update
    existing_change = db.query(PendingChange).filter(
        PendingChange.scholar_id == scholar.id,
        PendingChange.status == "pending",
        PendingChange.change_type == "profile"
    ).first()
    if existing_change:
        raise HTTPException(status_code=409, detail="Already has a pending profile update")

    changes = {}
    update_dict = update_data.model_dump(exclude_unset=True)
    if not update_dict:
        raise HTTPException(status_code=400, detail="No changes detected")
        
    for key, value in update_dict.items():
        old_val = getattr(scholar, key)
        if isinstance(old_val, date):
            old_val = old_val.isoformat()
        if isinstance(value, date):
            value = value.isoformat()
            
        if str(old_val) != str(value):
            changes[key] = {"from": old_val, "to": value}
            
    if not changes:
         raise HTTPException(status_code=400, detail="No actual changes detected from current profile")

    pending_change = PendingChange(
        scholar_id=scholar.id,
        submitted_by=current_user.id,
        change_type="profile",
        payload=changes
    )
    db.add(pending_change)
    db.commit()
    
    return {"message": "Profile update submitted for review", "changes": changes}

@router.get("/", response_model=List[ScholarResponse])
def list_scholars(
    batch: Optional[str] = None,
    school: Optional[str] = None,
    course: Optional[str] = None,
    status: Optional[str] = None,
    student_type: Optional[str] = None,
    search: Optional[str] = None,
    updated_since: Optional[datetime] = Query(None),
    limit: Optional[int] = Query(200, ge=1, le=1000),
    offset: Optional[int] = Query(0, ge=0),
    current_user: User = Depends(get_current_evaluator), 
    db: Session = Depends(get_db)):
    
    query = db.query(Scholar)
    if batch: query = query.filter(Scholar.batch_number == batch)
    if school: query = query.filter(Scholar.school == school)
    if course: query = query.filter(Scholar.course == course)
    if status: query = query.filter(Scholar.status == status)
    if student_type: query = query.filter(Scholar.student_type == student_type)
    if updated_since: query = query.filter(Scholar.updated_at > updated_since)
    if search:
        query = query.filter(
            (Scholar.first_name.ilike(f"%{search}%")) | 
            (Scholar.last_name.ilike(f"%{search}%"))
        )
        
    return query.order_by(Scholar.last_name.asc(), Scholar.first_name.asc()).limit(limit).offset(offset).all()

@router.get("/{scholar_id}", response_model=ScholarResponse)
def get_scholar(scholar_id: str, current_user: User = Depends(get_current_evaluator), db: Session = Depends(get_db)):
    scholar = db.query(Scholar).filter(Scholar.id == scholar_id).first()
    if not scholar:
         raise HTTPException(status_code=404, detail="Scholar not found")
    return scholar

@router.patch("/{scholar_id}")
def edit_scholar(scholar_id: str, update_data: ScholarUpdate, current_user: User = Depends(get_current_evaluator), db: Session = Depends(get_db)):
    scholar = db.query(Scholar).filter(Scholar.id == scholar_id).first()
    if not scholar:
         raise HTTPException(status_code=404, detail="Scholar not found")
         
    update_dict = update_data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(scholar, key, value)
        
    db.commit()
    return {"message": "Scholar profile updated"}
