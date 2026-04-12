from fastapi import APIRouter

router = APIRouter(prefix="/documents", tags=["documents"])

@router.post("/upload")
def upload_document():
    return {"message": "Document uploaded successfully"}

@router.get("/me")
def get_own_documents():
    return []

@router.get("/{document_id}/view")
def view_document_scholar(document_id: str):
    return {"url": "https://...", "expires_in": 120}

@router.get("/{document_id}/view-evaluator")
def view_document_evaluator(document_id: str):
    return {"url": "https://...", "expires_in": 120}

@router.patch("/{document_id}/verify")
def verify_document(document_id: str):
    return {"message": "Document verified"}

@router.get("/scholar/{scholar_id}")
def get_scholar_documents(scholar_id: str):
    return []
