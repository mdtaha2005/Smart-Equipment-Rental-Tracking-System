from sqlalchemy import Column, String, DateTime, Numeric, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.session import Base

class UsageLog(Base):
    __tablename__ = "usage_logs"

    usage_id = Column(String(50), primary_key=True, index=True)
    equipment_id = Column(String(50), ForeignKey("equipment.equipment_id", ondelete="CASCADE"), nullable=False, index=True)
    rental_id = Column(String(50), ForeignKey("rentals.rental_id", ondelete="SET NULL"), nullable=True, index=True)
    timestamp = Column(DateTime(timezone=True), nullable=False, index=True)
    engine_hours = Column(Numeric(8, 2), nullable=False)
    idle_hours = Column(Numeric(8, 2), nullable=False)
    fuel_used = Column(Numeric(8, 2), nullable=False)
    latitude = Column(Numeric(10, 6), nullable=True)
    longitude = Column(Numeric(10, 6), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    equipment = relationship("Equipment", back_populates="usage_logs")
    rental = relationship("Rental", back_populates="usage_logs")

    def __repr__(self):
        return f"<UsageLog(id='{self.usage_id}', equipment='{self.equipment_id}', engine_hours={self.engine_hours}, idle_hours={self.idle_hours})>"
