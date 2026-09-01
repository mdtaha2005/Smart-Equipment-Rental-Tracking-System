from sqlalchemy import Column, String, DateTime, Date, Numeric, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.session import Base

class ForecastData(Base):
    __tablename__ = "forecast_data"

    forecast_id = Column(String(50), primary_key=True, index=True)
    site_id = Column(String(50), ForeignKey("sites.site_id", ondelete="CASCADE"), nullable=False, index=True)
    equipment_type = Column(String(100), nullable=False, index=True)
    forecast_date = Column(Date, nullable=False, index=True)
    predicted_demand = Column(Numeric(8, 2), nullable=False)
    confidence = Column(Numeric(5, 4), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    site = relationship("Site", back_populates="forecast_data")

    def __repr__(self):
        return f"<ForecastData(id='{self.forecast_id}', site='{self.site_id}', type='{self.equipment_type}', date='{self.forecast_date}')>"
