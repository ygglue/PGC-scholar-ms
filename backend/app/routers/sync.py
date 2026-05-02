from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.system_sync import SystemSync

router = APIRouter(prefix="/sync", tags=["Sync"])

@router.get("/last-changed")
def get_last_changed(db: Session = Depends(get_db)):
    sync = db.query(SystemSync).filter(SystemSync.id == "global").first()
    if not sync:
        return {"last_updated_at": None}
    return {"last_updated_at": sync.last_updated_at}
