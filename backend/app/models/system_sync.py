from sqlalchemy import Column, DateTime, String, func
from app.core.database import Base

class SystemSync(Base):
    __tablename__ = "system_sync"

    id = Column(String, primary_key=True, default="global")
    last_updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
