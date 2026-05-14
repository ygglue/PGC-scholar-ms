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
from app.models.system_sync import SystemSync
from app.models.evaluation_remark import EvaluationRemark

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
    "SubmissionBin",
    "SystemSync",
    "EvaluationRemark",
]
