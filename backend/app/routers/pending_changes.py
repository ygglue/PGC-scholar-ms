from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict
from datetime import datetime, timezone, timedelta
import uuid

from app.core.database import get_db
from app.core.dependencies import get_current_evaluator
from app.models.user import User
from app.models.scholar import Scholar
from app.models.pending_change import PendingChange
from app.models.academic_record import AcademicRecord

router = APIRouter(prefix="/pending-changes", tags=["pending-changes"])

class PendingChangeResponse(BaseModel):
    id: uuid.UUID
    scholar_id: uuid.UUID
    submitted_by: uuid.UUID
    reviewed_by: Optional[uuid.UUID]
    claimed_by: Optional[uuid.UUID]
    change_type: str
    payload: Dict[str, Any]
    status: str
    submitted_at: datetime
    evaluator_note: Optional[str]
    model_config = ConfigDict(from_attributes=True)

class ReviewRequest(BaseModel):
    status: str # approved, rejected, more_info
    evaluator_note: Optional[str] = None

@router.get("/", response_model=List[PendingChangeResponse])
def list_pending_changes(
    status: Optional[str] = "pending",
    change_type: Optional[str] = None,
    current_user: User = Depends(get_current_evaluator),
    db: Session = Depends(get_db)):
    
    query = db.query(PendingChange)
    if status: query = query.filter(PendingChange.status == status)
    if change_type: query = query.filter(PendingChange.change_type == change_type)
    
    return query.order_by(PendingChange.submitted_at.desc()).all()

@router.post("/{change_id}/claim")
def claim_change(change_id: str, current_user: User = Depends(get_current_evaluator), db: Session = Depends(get_db)):
    change = db.query(PendingChange).filter(PendingChange.id == change_id).first()
    if not change:
        raise HTTPException(status_code=404, detail="Pending change not found")
        
    if change.status != "pending":
        raise HTTPException(status_code=400, detail="Submission is no longer pending")
        
    now = datetime.now(timezone.utc)
    
    # Check claim expiration logic
    if change.claimed_by and change.claimed_by != current_user.id:
        if change.claimed_at:
            claimed_at = change.claimed_at
            if claimed_at.tzinfo is None:
                 claimed_at = claimed_at.replace(tzinfo=timezone.utc)
            if now < claimed_at + timedelta(minutes=30):
                 raise HTTPException(status_code=409, detail="Being reviewed by another evaluator")
                 
    change.claimed_by = current_user.id
    change.claimed_at = now
    db.commit()
    
    return {"claimed": True}

@router.post("/{change_id}/review")
def review_change(
    change_id: str, 
    req: ReviewRequest, 
    current_user: User = Depends(get_current_evaluator), 
    db: Session = Depends(get_db)):
    
    if req.status not in ["approved", "rejected", "more_info"]:
        raise HTTPException(status_code=400, detail="Invalid status")
        
    change = db.query(PendingChange).filter(PendingChange.id == change_id).first()
    if not change:
        raise HTTPException(status_code=404, detail="Pending change not found")
        
    if change.status != "pending":
         raise HTTPException(status_code=400, detail="Submission already reviewed")

    # Finalize state metadata
    change.status = req.status
    change.evaluator_note = req.evaluator_note
    change.reviewed_by = current_user.id
    change.reviewed_at = datetime.now(timezone.utc)
    
    # Release evaluator claim
    change.claimed_by = None
    change.claimed_at = None
    
    if req.status == "approved":
        if change.change_type == "profile":
            scholar = db.query(Scholar).filter(Scholar.id == change.scholar_id).first()
            if scholar:
                for key, vals in change.payload.items():
                    if isinstance(vals, dict) and "to" in vals:
                        setattr(scholar, key, vals["to"])
        elif change.change_type == "documents":
            doc_id = change.payload.get("document_id")
            if doc_id:
                from app.models.document import Document
                doc = db.query(Document).filter(Document.id == doc_id).first()
                if doc:
                    doc.is_verified = True

    # Grades status syncs across all outcomes (approved, rejected, more_info)
    if change.change_type == "grades":
        record_id = change.payload.get("academic_record_id")
        if record_id:
            record = db.query(AcademicRecord).filter(AcademicRecord.id == record_id).first()
            if record:
                if req.status == "approved":
                    record.submission_status = "approved"
                else:
                    record.submission_status = "rejected" # Maps rejected/more_info
                record.reviewed_by = current_user.id
                record.reviewed_at = datetime.now(timezone.utc)

    db.commit()
    return {"message": f"Submission {req.status}"}
