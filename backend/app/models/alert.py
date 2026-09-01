from sqlalchemy import Column, String, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.session import Base

class Alert(Base):
    __tablename__ = "alerts"

    alert_id = Column(String(50), primary_key=True, index=True)
    equipment_id = Column(String(50), ForeignKey("equipment.equipment_id", ondelete="CASCADE"), nullable=False, index=True)
    alert_type = Column(String(100), nullable=False, index=True)
    severity = Column(String(50), nullable=False, default="MEDIUM", index=True)
    message = Column(Text, nullable=False)
    detected_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    resolved = Column(Boolean, default=False, nullable=False, index=True)
    resolved_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    equipment = relationship("Equipment", back_populates="alerts")

    def __repr__(self):
        return f"<Alert(id='{self.alert_id}', equipment='{self.equipment_id}', type='{self.alert_type}', resolved={self.resolved})>"
