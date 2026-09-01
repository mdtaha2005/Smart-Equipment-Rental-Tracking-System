from sqlalchemy import Column, String, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.session import Base

class Operator(Base):
    __tablename__ = "operators"

    operator_id = Column(String(50), primary_key=True, index=True)
    operator_name = Column(String(255), nullable=False)
    status = Column(String(50), nullable=False, default="ACTIVE", index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    current_equipments = relationship("Equipment", back_populates="current_operator", foreign_keys="Equipment.current_operator_id")
    rentals = relationship("Rental", back_populates="operator")

    def __repr__(self):
        return f"<Operator(id='{self.operator_id}', name='{self.operator_name}', status='{self.status}')>"
