from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.session import Base

class Rental(Base):
    __tablename__ = "rentals"

    rental_id = Column(String(50), primary_key=True, index=True)
    equipment_id = Column(String(50), ForeignKey("equipment.equipment_id", ondelete="CASCADE"), nullable=False, index=True)
    site_id = Column(String(50), ForeignKey("sites.site_id", ondelete="SET NULL"), nullable=True, index=True)
    operator_id = Column(String(50), ForeignKey("operators.operator_id", ondelete="SET NULL"), nullable=True, index=True)
    checkout_date = Column(DateTime(timezone=True), nullable=False, index=True)
    expected_checkin_date = Column(DateTime(timezone=True), nullable=False)
    actual_checkin_date = Column(DateTime(timezone=True), nullable=True)
    status = Column(String(50), nullable=False, default="ACTIVE", index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    equipment = relationship("Equipment", back_populates="rentals")
    site = relationship("Site", back_populates="rentals")
    operator = relationship("Operator", back_populates="rentals")
    usage_logs = relationship("UsageLog", back_populates="rental", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Rental(id='{self.rental_id}', equipment='{self.equipment_id}', status='{self.status}')>"
