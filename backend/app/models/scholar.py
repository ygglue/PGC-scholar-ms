import uuid
from sqlalchemy import Column, String, Date, Text, func, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base

class Scholar(Base):
    __tablename__ = "scholars"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False)
    batch_number = Column(String, nullable=True)
    year_level = Column(String, nullable=True)
    course = Column(String, nullable=True)
    school = Column(String, nullable=True)
    status = Column(String, default="active") # active, inactive, graduate
    student_type = Column(String, default="regular") # regular, irregular
    date_enrolled = Column(Date, nullable=True)
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    middle_name = Column(String, nullable=True)
    date_of_birth = Column(Date, nullable=True)
    place_of_birth = Column(String, nullable=True)
    sex = Column(String, nullable=True)
    civil_status = Column(String, nullable=True)
    religion = Column(String, nullable=True)
    address = Column(Text, nullable=True)
    contact_number = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", backref="scholar")
