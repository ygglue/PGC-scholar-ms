from sqlalchemy import event, func
from app.models.scholar import Scholar
from app.models.academic_record import AcademicRecord
from app.models.document import Document
from app.models.pending_change import PendingChange
from app.models.submission_bin import SubmissionBin
from app.models.system_sync import SystemSync

# List of models that should trigger a global sync update
TRACKED_MODELS = [Scholar, AcademicRecord, Document, PendingChange, SubmissionBin]

from sqlalchemy.dialects.postgresql import insert

def update_system_sync(mapper, connection, target):
    """
    Updates the last_updated_at timestamp in the system_sync table 
    for the specific resource table name.
    """
    table = SystemSync.__table__
    resource_id = target.__table__.name
    
    # Use UPSERT (INSERT ON CONFLICT)
    stmt = insert(table).values(id=resource_id, last_updated_at=func.now())
    stmt = stmt.on_conflict_do_update(
        index_elements=['id'],
        set_={'last_updated_at': func.now()}
    )
    connection.execute(stmt)

def register_event_listeners():
    for model in TRACKED_MODELS:
        event.listen(model, "after_insert", update_system_sync)
        event.listen(model, "after_update", update_system_sync)
        event.listen(model, "after_delete", update_system_sync)
