import uuid
from sqlalchemy import Column, Text, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base


class EvaluationRemark(Base):
    __tablename__ = "evaluation_remarks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    pending_change_id = Column(UUID(as_uuid=True), ForeignKey("pending_changes.id"), nullable=False)
    evaluator_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    scholar_id = Column(UUID(as_uuid=True), ForeignKey("scholars.id"), nullable=False)
    remark_text = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    pending_change = relationship("PendingChange", backref="evaluation_remarks")
    evaluator = relationship("User", foreign_keys=[evaluator_id])
    scholar = relationship("Scholar", foreign_keys=[scholar_id])
