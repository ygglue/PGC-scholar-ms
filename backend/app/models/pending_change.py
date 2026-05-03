import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.core.database import Base

class PendingChange(Base):
    __tablename__ = "pending_changes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    scholar_id = Column(UUID(as_uuid=True), ForeignKey("scholars.id"), nullable=False)
    submitted_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    reviewed_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    claimed_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    claimed_at = Column(DateTime(timezone=True), nullable=True)
    assigned_to = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    change_type = Column(String, nullable=False) # profile, grades, documents
    payload = Column(JSONB, nullable=False)
    status = Column(String, default="pending") # pending, approved, rejected, more_info
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    evaluator_note = Column(Text, nullable=True)

    scholar = relationship("Scholar", backref="pending_changes")
    submitter = relationship("User", foreign_keys=[submitted_by])
    reviewer = relationship("User", foreign_keys=[reviewed_by])
    claimer = relationship("User", foreign_keys=[claimed_by])
    assignee = relationship("User", foreign_keys=[assigned_to])
