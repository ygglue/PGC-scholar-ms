import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base

class SubmissionBin(Base):
    __tablename__ = "submission_bins"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    school_year = Column(String, nullable=False)
    semester = Column(String, nullable=False)
    is_approved = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    creator = relationship("User")
