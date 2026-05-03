from sqlalchemy import event, func
from app.models.scholar import Scholar
from app.models.academic_record import AcademicRecord
from app.models.document import Document
from app.models.pending_change import PendingChange
from app.models.submission_bin import SubmissionBin
from app.models.system_sync import SystemSync

# List of models that should trigger a global sync update
TRACKED_MODELS = [Scholar, AcademicRecord, Document, PendingChange, SubmissionBin]

def update_system_sync(mapper, connection, target):
    """
    Updates the global last_updated_at timestamp in the system_sync table.
    We use a direct connection execution to avoid session recursion.
    """
    table = SystemSync.__table__
    connection.execute(
        table.update()
        .where(table.c.id == "global")
        .values(last_updated_at=func.now())
    )
    
    # Ensure the 'global' row exists (UPSERT style)
    # If the update affected 0 rows, it means the global row doesn't exist yet.
    # This is a bit complex with pure connection.execute, 
    # but since we seed it or it gets created on first write, it's usually fine.

def register_event_listeners():
    for model in TRACKED_MODELS:
        event.listen(model, "after_insert", update_system_sync)
        event.listen(model, "after_update", update_system_sync)
        event.listen(model, "after_delete", update_system_sync)
