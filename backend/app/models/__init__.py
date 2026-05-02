from app.models.user import User
from app.models.scholar import Scholar
from app.models.academic_record import AcademicRecord
from app.models.prospectus_grade import ProspectusGrade
from app.models.document import Document
from app.models.program_history import ProgramHistory
from app.models.pending_change import PendingChange
from app.models.announcement import Announcement
from app.models.announcement_receipt import AnnouncementReceipt
from app.models.submission_bin import SubmissionBin

# Expose models so alembic can pick them up when importing app.models
__all__ = [
    "User",
    "Scholar",
    "AcademicRecord",
    "ProspectusGrade",
    "Document",
    "ProgramHistory",
    "PendingChange",
    "Announcement",
    "AnnouncementReceipt",
]
