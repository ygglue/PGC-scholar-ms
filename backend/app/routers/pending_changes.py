from fastapi import APIRouter

router = APIRouter(prefix="/pending-changes", tags=["pending-changes"])

@router.get("/")
def list_pending_changes():
    return []

@router.post("/{change_id}/claim")
def claim_change(change_id: str):
    return {"claimed": True}

@router.post("/{change_id}/review")
def review_change(change_id: str):
    return {"message": "Submission reviewed"}
