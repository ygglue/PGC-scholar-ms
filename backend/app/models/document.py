import uuid
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, func, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    scholar_id = Column(UUID(as_uuid=True), ForeignKey("scholars.id"), nullable=False)
    academic_record_id = Column(UUID(as_uuid=True), ForeignKey("academic_records.id"), nullable=True)
    doc_type = Column(String, nullable=False) # COR, ROG, explanation_letter, completion_form, other
    file_name = Column(String, nullable=False)
    storage_path = Column(Text, nullable=False)
    file_size = Column(Integer, nullable=True)
    mime_type = Column(String, nullable=True)
    is_verified = Column(Boolean, default=False)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())

    scholar = relationship("Scholar", backref="documents")
    academic_record = relationship("AcademicRecord", backref="documents")
