from typing import List, Optional

from app.core.database import get_db
from app.core.dependencies import get_current_scholar, get_current_user
from app.models.announcement import Announcement
from app.models.user import User
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

router = APIRouter(prefix="/announcements", tags=["Announcements"])


class CreateAnnouncementRequest(BaseModel):
    title: str
    message: str
    type: str = "general"
    recipient_filter: Optional[dict] = None


@router.post("/")
def create_announcement(
    req: CreateAnnouncementRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new announcement (requires auth)"""
    announcement = Announcement(
        title=req.title,
        message=req.message,
        type=req.type,
        recipient_filter=req.recipient_filter,
        created_by=current_user.id,
    )
    db.add(announcement)
    db.commit()
    db.refresh(announcement)
    return {"id": str(announcement.id), "message": "Announcement created"}


@router.get("/")
def get_announcements(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
) -> List[dict]:
    """
    Get announcements. Returns all announcements for evaluators,
    or filtered announcements for scholars.
    """
    announcements = (
        db.query(Announcement).order_by(Announcement.created_at.desc()).all()
    )

    result = []
    for a in announcements:
        # If recipient_filter is set and user is a scholar, check if scholar matches
        if a.recipient_filter and hasattr(current_user, 'scholar_id') and current_user.scholar_id:
            # Need to get scholar info if user is a scholar
            from app.models.scholar import Scholar
            scholar = db.query(Scholar).filter(Scholar.id == current_user.scholar_id).first()
            if scholar:
                should_include = True
                rf = a.recipient_filter
                # Check batch
                if "batch" in rf and scholar.batch_number != rf["batch"]:
                    should_include = False
                # Check school
                if "school" in rf and scholar.school != rf["school"]:
                    should_include = False
                # Check status
                if "status" in rf and scholar.status != rf["status"]:
                    should_include = False

                if not should_include:
                    continue

        result.append(
            {
                "id": str(a.id),
                "title": a.title,
                "message": a.message,
                "type": a.type,
                "created_at": a.created_at.isoformat() if a.created_at else None,
                "created_by": str(a.created_by) if a.created_by else None,
            }
        )

    return result
