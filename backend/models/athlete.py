from sqlalchemy import Column, Integer, String, Boolean, DateTime, func
from database import Base
from sqlalchemy.orm import relationship

class Athlete(Base):
    __tablename__ = "athletes"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    profile = relationship("AthleteProfile", back_populates="athlete", uselist=False)
