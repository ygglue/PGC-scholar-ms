from fastapi import APIRouter

router = APIRouter(prefix="/scholars", tags=["scholars"])

@router.get("/me")
def get_own_profile():
    return {"message": "Not implemented"}

@router.post("/me/update")
def request_profile_update():
    return {"message": "Not implemented", "changes": {}}

@router.get("/")
def list_scholars():
    return []

@router.get("/{scholar_id}")
def get_scholar(scholar_id: str):
    return {"id": scholar_id}

@router.patch("/{scholar_id}")
def edit_scholar(scholar_id: str):
    return {"message": "Scholar profile updated"}
