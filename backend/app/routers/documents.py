from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel, ConfigDict
from typing import Optional, List
import uuid
import datetime

from app.core.database import get_db
from app.core.dependencies import get_current_scholar, get_current_evaluator
from app.core.storage import upload_document as supabase_upload, create_signed_url
from app.models.user import User
from app.models.scholar import Scholar
from app.models.document import Document
from app.models.submission_bin import SubmissionBin
from app.models.pending_change import PendingChange

router = APIRouter(prefix="/documents", tags=["documents"])

ALLOWED_DOC_TYPES = ["COR", "ROG", "explanation_letter", "completion_form", "other"]
ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "application/pdf"]
MAX_FILE_SIZE = 1 * 1024 * 1024  # 1MB


class BinInfoResponse(BaseModel):
    id: uuid.UUID
    school_year: str
    semester: str
    model_config = ConfigDict(from_attributes=True)


class DocumentResponse(BaseModel):
    id: uuid.UUID
    scholar_id: uuid.UUID
    academic_record_id: Optional[uuid.UUID]
    submission_bin_id: Optional[uuid.UUID]
    submission_bin: Optional[BinInfoResponse]
    doc_type: str
    file_name: str
    is_verified: bool
    uploaded_at: datetime.datetime
    updated_at: datetime.datetime
    model_config = ConfigDict(from_attributes=True)


@router.get("/", response_model=List[DocumentResponse])
def list_documents(
    updated_since: Optional[datetime.datetime] = Query(None),
    current_user: User = Depends(get_current_evaluator),
    db: Session = Depends(get_db)
):
    query = db.query(Document)
    if updated_since:
        query = query.filter(Document.updated_at > updated_since)
    return query.all()


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    doc_type: str = Form(...),
    submission_bin_id: Optional[str] = Form(None),
    academic_record_id: Optional[str] = Form(None),
    current_user: User = Depends(get_current_scholar),
    db: Session = Depends(get_db)):

    if doc_type not in ALLOWED_DOC_TYPES:
        raise HTTPException(status_code=400, detail="Invalid doc type")

    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(status_code=400, detail="Invalid file type")

    file_bytes = await file.read()
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 1MB)")

    scholar = db.query(Scholar).filter(Scholar.user_id == current_user.id).first()
    if not scholar:
        raise HTTPException(status_code=404, detail="Scholar not found")

    # Validate submission_bin_id if provided
    bin_uuid = None
    if submission_bin_id:
        bin_ = db.query(SubmissionBin).filter(SubmissionBin.id == submission_bin_id).first()
        if not bin_:
            raise HTTPException(status_code=404, detail="Submission bin not found")
        bin_uuid = bin_.id

    new_doc_id = uuid.uuid4()
    storage_path = f"scholars/{scholar.id}/{doc_type}/{new_doc_id}_{file.filename}"

    try:
        supabase_upload(path=storage_path, file_bytes=file_bytes, content_type=file.content_type)
    except Exception as e:
        print(f"Supabase Upload Exception: {e}")
        raise HTTPException(status_code=500, detail="Upload to Supabase Storage failed")

    acad_rec_uuid = uuid.UUID(academic_record_id) if academic_record_id else None

    document = Document(
        id=new_doc_id,
        scholar_id=scholar.id,
        academic_record_id=acad_rec_uuid,
        submission_bin_id=bin_uuid,
        doc_type=doc_type,
        file_name=file.filename,
        storage_path=storage_path,
        file_size=len(file_bytes),
        mime_type=file.content_type
    )
    db.add(document)

    # Create PendingChange for evaluator review queue
    pending_change = PendingChange(
        scholar_id=scholar.id,
        submitted_by=current_user.id,
        change_type="documents",
        payload={"document_id": str(new_doc_id), "doc_type": doc_type}
    )
    db.add(pending_change)

    db.commit()

    return {"message": "Document uploaded successfully", "document_id": str(new_doc_id), "file_name": file.filename}


@router.get("/me", response_model=List[DocumentResponse])
def get_own_documents(current_user: User = Depends(get_current_scholar), db: Session = Depends(get_db)):
    scholar = db.query(Scholar).filter(Scholar.user_id == current_user.id).first()
    if not scholar:
        raise HTTPException(status_code=404, detail="Scholar not found")

    return db.query(Document).filter(Document.scholar_id == scholar.id).order_by(Document.uploaded_at.desc()).all()


@router.get("/{document_id}/view")
def view_document_scholar(document_id: str, current_user: User = Depends(get_current_scholar), db: Session = Depends(get_db)):
    scholar = db.query(Scholar).filter(Scholar.user_id == current_user.id).first()
    if not scholar:
        raise HTTPException(status_code=404, detail="Scholar not found")

    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    if document.scholar_id != scholar.id:
        raise HTTPException(status_code=403, detail="Document does not belong to this scholar")

    try:
        signed_url = create_signed_url(path=document.storage_path, expires_in=120)
        return {"url": signed_url, "expires_in": 120, "file_name": document.file_name}
    except Exception as e:
        print(f"Supabase Sign Exception: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate signed URL. Is Supabase configured?")


@router.get("/{document_id}/view-evaluator")
def view_document_evaluator(document_id: str, current_user: User = Depends(get_current_evaluator), db: Session = Depends(get_db)):
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    try:
        signed_url = create_signed_url(path=document.storage_path, expires_in=120)
        return {"url": signed_url, "expires_in": 120, "file_name": document.file_name}
    except Exception as e:
        print(f"Supabase Sign Exception: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate signed URL. Is Supabase configured?")


@router.patch("/{document_id}/verify")
def verify_document(document_id: str, current_user: User = Depends(get_current_evaluator), db: Session = Depends(get_db)):
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    document.is_verified = True
    db.commit()
    return {"message": "Document verified"}


@router.delete("/{document_id}")
def delete_document_record(
    document_id: str,
    current_user: User = Depends(get_current_scholar),
    db: Session = Depends(get_db)
):
    scholar = db.query(Scholar).filter(Scholar.user_id == current_user.id).first()
    if not scholar:
        raise HTTPException(status_code=404, detail="Scholar not found")

    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    if document.scholar_id != scholar.id:
        raise HTTPException(status_code=403, detail="Document does not belong to this scholar")

    # Remove from Supabase Storage first
    try:
        from app.core.storage import delete_document as supabase_delete
        supabase_delete(path=document.storage_path)
    except Exception as e:
        print(f"Storage deletion failed (continuing): {e}")

    db.delete(document)
    db.commit()
    return {"message": "Document deleted"}


@router.get("/bin/{bin_id}", response_model=List[DocumentResponse])
def get_bin_documents(
    bin_id: str,
    current_user: User = Depends(get_current_evaluator),
    db: Session = Depends(get_db)
):
    """Get all documents submitted to a specific submission bin (evaluator only)."""
    return db.query(Document).filter(
        Document.submission_bin_id == bin_id
    ).order_by(Document.uploaded_at.desc()).all()


@router.get("/scholar/{scholar_id}", response_model=List[DocumentResponse])
def get_scholar_documents(
    scholar_id: str,
    school_year: Optional[str] = None,
    semester: Optional[str] = None,
    current_user: User = Depends(get_current_evaluator),
    db: Session = Depends(get_db)
):
    query = db.query(Document).filter(Document.scholar_id == scholar_id)

    if school_year or semester:
        query = query.join(SubmissionBin, Document.submission_bin_id == SubmissionBin.id, isouter=True)
        if school_year:
            query = query.filter(SubmissionBin.school_year == school_year)
        if semester:
            query = query.filter(SubmissionBin.semester == semester)

    return query.order_by(Document.uploaded_at.desc()).all()
