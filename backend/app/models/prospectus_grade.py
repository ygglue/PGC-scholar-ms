import uuid
from sqlalchemy import Column, String, Numeric, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base

class ProspectusGrade(Base):
    __tablename__ = "prospectus_grades"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    academic_record_id = Column(UUID(as_uuid=True), ForeignKey("academic_records.id", ondelete="CASCADE"), nullable=False)
    subject_code = Column(String, nullable=True)
    subject_name = Column(String, nullable=False)
    units = Column(Numeric(4, 1), nullable=True)
    grade = Column(String, nullable=True)
    status = Column(String, nullable=True) # passed, failed, INC, unposted

    academic_record = relationship("AcademicRecord", backref="prospectus_grades")
