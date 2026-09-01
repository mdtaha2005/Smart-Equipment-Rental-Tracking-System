from sqlalchemy import Column, String, DateTime, Text, Numeric, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.session import Base

class Recommendation(Base):
    __tablename__ = "recommendations"

    recommendation_id = Column(String(50), primary_key=True, index=True)
    equipment_id = Column(String(50), ForeignKey("equipment.equipment_id", ondelete="CASCADE"), nullable=False, index=True)
    current_site_id = Column(String(50), ForeignKey("sites.site_id", ondelete="SET NULL"), nullable=True, index=True)
    recommended_site_id = Column(String(50), ForeignKey("sites.site_id", ondelete="SET NULL"), nullable=True, index=True)
    reason = Column(Text, nullable=False)
    expected_utilization_gain = Column(Numeric(8, 2), nullable=True)
    priority = Column(String(50), nullable=False, default="MEDIUM", index=True)
    status = Column(String(50), nullable=False, default="PENDING", index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    equipment = relationship("Equipment", back_populates="recommendations", foreign_keys=[equipment_id])
    current_site = relationship("Site", back_populates="current_recommendations", foreign_keys=[current_site_id])
    recommended_site = relationship("Site", back_populates="recommended_recommendations", foreign_keys=[recommended_site_id])

    def __repr__(self):
        return f"<Recommendation(id='{self.recommendation_id}', equipment='{self.equipment_id}', status='{self.status}')>"
