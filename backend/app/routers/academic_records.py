from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel, ConfigDict
import uuid
from datetime import datetime

from app.core.database import get_db
from app.core.dependencies import get_current_scholar, get_current_evaluator
from app.models.user import User
from app.models.scholar import Scholar
from app.models.academic_record import AcademicRecord
from app.models.prospectus_grade import ProspectusGrade
from app.models.pending_change import PendingChange

router = APIRouter(prefix="/academic-records", tags=["academic-records"])

class GradeInput(BaseModel):
    subject_code: Optional[str] = None
    subject_name: str
    units: Optional[float] = None
    grade: Optional[str] = None
    status: Optional[str] = None # passed, failed, INC, unposted

class GradeSubmitRequest(BaseModel):
    school_year: str
    semester: str # 1st, 2nd, summer
    student_type: str = "regular"
    remarks_status: Optional[str] = None
    unposted_count: str = "0"
    inc_count: str = "0"
    failed_count: str = "0"
    grades: List[GradeInput]

class ProspectusGradeResponse(BaseModel):
    id: uuid.UUID
    academic_record_id: uuid.UUID
    subject_code: Optional[str]
    subject_name: str
    units: Optional[float]
    grade: Optional[str]
    status: Optional[str]
    model_config = ConfigDict(from_attributes=True)

class AcademicRecordResponse(BaseModel):
    id: uuid.UUID
    scholar_id: uuid.UUID
    reviewed_by: Optional[uuid.UUID]
    school_year: str
    semester: str
    student_type: str
    remarks_status: Optional[str]
    unposted_count: str
    inc_count: str
    failed_count: str
    submission_status: str
    submitted_at: Optional[datetime]
    reviewed_at: Optional[datetime]
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

@router.get("/", response_model=List[AcademicRecordResponse])
def list_academic_records(
    updated_since: Optional[datetime] = Query(None),
    current_user: User = Depends(get_current_evaluator),
    db: Session = Depends(get_db)
):
    query = db.query(AcademicRecord)
    if updated_since:
        query = query.filter(AcademicRecord.updated_at > updated_since)
    return query.all()

@router.get("/me", response_model=List[AcademicRecordResponse])
def get_own_records(current_user: User = Depends(get_current_scholar), db: Session = Depends(get_db)):
    scholar = db.query(Scholar).filter(Scholar.user_id == current_user.id).first()
    if not scholar:
        raise HTTPException(status_code=404, detail="Scholar not found")
        
    records = db.query(AcademicRecord).filter(
        AcademicRecord.scholar_id == scholar.id
    ).order_by(AcademicRecord.school_year.desc(), AcademicRecord.semester.desc()).all()
    return records

@router.post("/me/submit")
def submit_grades(req: GradeSubmitRequest, current_user: User = Depends(get_current_scholar), db: Session = Depends(get_db)):
    scholar = db.query(Scholar).filter(Scholar.user_id == current_user.id).first()
    if not scholar:
        raise HTTPException(status_code=404, detail="Scholar not found")

    # Check for existing pending submission for this semester
    existing_record = db.query(AcademicRecord).filter(
        AcademicRecord.scholar_id == scholar.id,
        AcademicRecord.school_year == req.school_year,
        AcademicRecord.semester == req.semester,
        AcademicRecord.submission_status == "pending"
    ).first()
    if existing_record:
        raise HTTPException(status_code=409, detail="Already has a pending submission for this semester")
        
    record = AcademicRecord(
        scholar_id=scholar.id,
        school_year=req.school_year,
        semester=req.semester,
        student_type=req.student_type,
        remarks_status=req.remarks_status,
        unposted_count=req.unposted_count,
        inc_count=req.inc_count,
        failed_count=req.failed_count,
        submission_status="pending",
        submitted_at=datetime.utcnow()
    )
    db.add(record)
    db.flush()

    for g in req.grades:
        grade_row = ProspectusGrade(
            academic_record_id=record.id,
            subject_code=g.subject_code,
            subject_name=g.subject_name,
            units=g.units,
            grade=g.grade,
            status=g.status
        )
        db.add(grade_row)

    payload = {
        "academic_record_id": str(record.id),
        "school_year": req.school_year,
        "semester": req.semester,
        "remarks_status": req.remarks_status,
        "grade_count": len(req.grades)
    }
    pending_change = PendingChange(
        scholar_id=scholar.id,
        submitted_by=current_user.id,
        change_type="grades",
        payload=payload
    )
    db.add(pending_change)
    db.commit()

    return {"message": "Grades submitted for review", "record_id": str(record.id)}

@router.get("/scholar/{scholar_id}", response_model=List[AcademicRecordResponse])
def get_scholar_records(scholar_id: str, current_user: User = Depends(get_current_evaluator), db: Session = Depends(get_db)):
    records = db.query(AcademicRecord).filter(
        AcademicRecord.scholar_id == scholar_id
    ).order_by(AcademicRecord.school_year.desc(), AcademicRecord.semester.desc()).all()
    return records

@router.get("/{record_id}/grades", response_model=List[ProspectusGradeResponse])
def get_record_grades(record_id: str, current_user: User = Depends(get_current_evaluator), db: Session = Depends(get_db)):
    grades = db.query(ProspectusGrade).filter(ProspectusGrade.academic_record_id == record_id).all()
    return grades
