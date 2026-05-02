from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime

from app.core.database import get_db
from app.core.dependencies import get_current_evaluator, get_current_user
from app.models.user import User
from app.models.submission_bin import SubmissionBin

router = APIRouter(prefix="/submission-bins", tags=["submission-bins"])


class SubmissionBinCreate(BaseModel):
    school_year: str
    semester: str


class SubmissionBinResponse(BaseModel):
    id: uuid.UUID
    created_by: Optional[uuid.UUID]
    school_year: str
    semester: str
    is_approved: bool
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


@router.post("/", response_model=SubmissionBinResponse)
def create_bin(
    req: SubmissionBinCreate,
    current_user: User = Depends(get_current_evaluator),
    db: Session = Depends(get_db)
):
    existing = db.query(SubmissionBin).filter(
        SubmissionBin.school_year == req.school_year,
        SubmissionBin.semester == req.semester
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="A bin for this semester already exists")

    bin_ = SubmissionBin(
        created_by=current_user.id,
        school_year=req.school_year,
        semester=req.semester,
        is_approved=False
    )
    db.add(bin_)
    db.commit()
    db.refresh(bin_)
    return bin_


@router.get("/", response_model=List[SubmissionBinResponse])
def list_bins(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Scholars see only active (non-approved) bins.
    Evaluators/admins see all bins.
    """
    query = db.query(SubmissionBin)
    if current_user.role == "scholar":
        query = query.filter(SubmissionBin.is_approved == False)
    return query.order_by(
        SubmissionBin.school_year.desc(),
        SubmissionBin.semester.desc()
    ).all()


@router.patch("/{bin_id}/approve", response_model=SubmissionBinResponse)
def approve_bin(
    bin_id: str,
    current_user: User = Depends(get_current_evaluator),
    db: Session = Depends(get_db)
):
    bin_ = db.query(SubmissionBin).filter(SubmissionBin.id == bin_id).first()
    if not bin_:
        raise HTTPException(status_code=404, detail="Submission bin not found")

    bin_.is_approved = True
    db.commit()
    db.refresh(bin_)
    return bin_


@router.patch("/{bin_id}/reopen", response_model=SubmissionBinResponse)
def reopen_bin(
    bin_id: str,
    current_user: User = Depends(get_current_evaluator),
    db: Session = Depends(get_db)
):
    bin_ = db.query(SubmissionBin).filter(SubmissionBin.id == bin_id).first()
    if not bin_:
        raise HTTPException(status_code=404, detail="Submission bin not found")

    bin_.is_approved = False
    db.commit()
    db.refresh(bin_)
    return bin_


@router.delete("/{bin_id}")
def delete_bin(
    bin_id: str,
    current_user: User = Depends(get_current_evaluator),
    db: Session = Depends(get_db)
):
    bin_ = db.query(SubmissionBin).filter(SubmissionBin.id == bin_id).first()
    if not bin_:
        raise HTTPException(status_code=404, detail="Submission bin not found")

    from app.models.document import Document
    db.query(Document).filter(Document.submission_bin_id == bin_.id).update(
        {"submission_bin_id": None}, synchronize_session=False
    )

    db.delete(bin_)
    db.commit()
    return {"message": "Bin deleted and documents unassigned"}
