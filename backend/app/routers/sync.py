from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from app.core.database import get_db
from app.models.system_sync import SystemSync

router = APIRouter(prefix="/sync", tags=["Sync"])

@router.get("/last-changed")
def get_last_changed(resource: str = "global", db: Session = Depends(get_db)):
    sync = db.query(SystemSync).filter(SystemSync.id == resource).first()
    if not sync:
        # Initialize if missing so the client has a starting point
        sync = SystemSync(id=resource, last_updated_at=datetime.now(timezone.utc))
        db.add(sync)
        db.commit()
    return {"last_updated_at": sync.last_updated_at}
