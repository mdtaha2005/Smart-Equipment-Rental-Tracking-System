from sqlalchemy import Column, String, Numeric, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.session import Base

class Site(Base):
    __tablename__ = "sites"

    site_id = Column(String(50), primary_key=True, index=True)
    site_name = Column(String(255), nullable=False)
    location = Column(String(255), nullable=False)
    latitude = Column(Numeric(10, 6), nullable=True)
    longitude = Column(Numeric(10, 6), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    current_equipments = relationship("Equipment", back_populates="current_site", foreign_keys="Equipment.current_site_id")
    rentals = relationship("Rental", back_populates="site")
    forecast_data = relationship("ForecastData", back_populates="site", cascade="all, delete-orphan")
    current_recommendations = relationship("Recommendation", back_populates="current_site", foreign_keys="Recommendation.current_site_id")
    recommended_recommendations = relationship("Recommendation", back_populates="recommended_site", foreign_keys="Recommendation.recommended_site_id")

    def __repr__(self):
        return f"<Site(id='{self.site_id}', name='{self.site_name}')>"
