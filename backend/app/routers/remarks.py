from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, ConfigDict
from datetime import datetime
import uuid

from app.core.database import get_db
from app.core.dependencies import get_current_evaluator, get_current_scholar
from app.models.user import User
from app.models.scholar import Scholar
from app.models.pending_change import PendingChange
from app.models.evaluation_remark import EvaluationRemark

router = APIRouter(prefix="/remarks", tags=["remarks"])


class RemarkResponse(BaseModel):
    id: uuid.UUID
    pending_change_id: uuid.UUID
    evaluator_id: uuid.UUID
    scholar_id: uuid.UUID
    remark_text: str
    created_at: datetime
    evaluator_email: Optional[str] = None
    change_type: Optional[str] = None
    change_status: Optional[str] = None
    submitted_at: Optional[datetime] = None
    payload: Optional[Dict[str, Any]] = None
    model_config = ConfigDict(from_attributes=True)


class CreateRemarkRequest(BaseModel):
    pending_change_id: str
    remark_text: str


@router.get("/me", response_model=List[RemarkResponse])
def list_my_remarks(
    current_user: User = Depends(get_current_scholar),
    db: Session = Depends(get_db),
):
    scholar = db.query(Scholar).filter(Scholar.user_id == current_user.id).first()
    if not scholar:
        raise HTTPException(status_code=404, detail="Scholar profile not found")

    remarks = (
        db.query(
            EvaluationRemark.id,
            EvaluationRemark.pending_change_id,
            EvaluationRemark.evaluator_id,
            EvaluationRemark.scholar_id,
            EvaluationRemark.remark_text,
            EvaluationRemark.created_at,
            User.email.label("evaluator_email"),
            PendingChange.change_type.label("change_type"),
            PendingChange.status.label("change_status"),
            PendingChange.submitted_at.label("submitted_at"),
            PendingChange.payload.label("payload"),
        )
        .join(User, EvaluationRemark.evaluator_id == User.id)
        .join(PendingChange, EvaluationRemark.pending_change_id == PendingChange.id)
        .filter(EvaluationRemark.scholar_id == scholar.id)
        .order_by(EvaluationRemark.created_at.desc())
        .all()
    )

    return remarks


@router.get("/pending-change/{change_id}", response_model=List[RemarkResponse])
def list_remarks_for_change(
    change_id: str,
    current_user: User = Depends(get_current_evaluator),
    db: Session = Depends(get_db),
):
    remarks = (
        db.query(
            EvaluationRemark.id,
            EvaluationRemark.pending_change_id,
            EvaluationRemark.evaluator_id,
            EvaluationRemark.scholar_id,
            EvaluationRemark.remark_text,
            EvaluationRemark.created_at,
            User.email.label("evaluator_email"),
            PendingChange.change_type.label("change_type"),
            PendingChange.status.label("change_status"),
            PendingChange.submitted_at.label("submitted_at"),
            PendingChange.payload.label("payload"),
        )
        .join(User, EvaluationRemark.evaluator_id == User.id)
        .join(PendingChange, EvaluationRemark.pending_change_id == PendingChange.id)
        .filter(EvaluationRemark.pending_change_id == change_id)
        .order_by(EvaluationRemark.created_at.desc())
        .all()
    )

    return remarks


@router.post("/", response_model=RemarkResponse)
def create_remark(
    req: CreateRemarkRequest,
    current_user: User = Depends(get_current_evaluator),
    db: Session = Depends(get_db),
):
    change = db.query(PendingChange).filter(PendingChange.id == req.pending_change_id).first()
    if not change:
        raise HTTPException(status_code=404, detail="Pending change not found")

    remark = EvaluationRemark(
        pending_change_id=req.pending_change_id,
        evaluator_id=current_user.id,
        scholar_id=change.scholar_id,
        remark_text=req.remark_text,
    )
    db.add(remark)
    db.commit()
    db.refresh(remark)

    evaluator = db.query(User).filter(User.id == current_user.id).first()
    scholar = db.query(Scholar).filter(Scholar.id == change.scholar_id).first()

    return RemarkResponse(
        id=remark.id,
        pending_change_id=remark.pending_change_id,
        evaluator_id=remark.evaluator_id,
        scholar_id=remark.scholar_id,
        remark_text=remark.remark_text,
        created_at=remark.created_at,
        evaluator_email=evaluator.email if evaluator else None,
        change_type=change.change_type,
        change_status=change.status,
        submitted_at=change.submitted_at,
        payload=change.payload,
    )
