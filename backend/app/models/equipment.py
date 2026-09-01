from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.session import Base

class Equipment(Base):
    __tablename__ = "equipment"

    equipment_id = Column(String(50), primary_key=True, index=True)
    equipment_type = Column(String(100), nullable=False, index=True)
    status = Column(String(50), nullable=False, default="AVAILABLE", index=True)
    current_site_id = Column(String(50), ForeignKey("sites.site_id", ondelete="SET NULL"), nullable=True, index=True)
    current_operator_id = Column(String(50), ForeignKey("operators.operator_id", ondelete="SET NULL"), nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    current_site = relationship("Site", back_populates="current_equipments", foreign_keys=[current_site_id])
    current_operator = relationship("Operator", back_populates="current_equipments", foreign_keys=[current_operator_id])
    rentals = relationship("Rental", back_populates="equipment", cascade="all, delete-orphan")
    usage_logs = relationship("UsageLog", back_populates="equipment", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="equipment", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="equipment", cascade="all, delete-orphan", foreign_keys="Recommendation.equipment_id")

    def __repr__(self):
        return f"<Equipment(id='{self.equipment_id}', type='{self.equipment_type}', status='{self.status}')>"
