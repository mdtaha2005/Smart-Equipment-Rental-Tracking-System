from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime
from decimal import Decimal

class UsageLogBase(BaseModel):
    equipment_id: str
    rental_id: Optional[str] = None
    timestamp: datetime
    engine_hours: Decimal = Field(..., ge=0, description="Engine operating hours (non-negative)")
    idle_hours: Decimal = Field(..., ge=0, description="Idle operating hours (non-negative)")
    fuel_used: Decimal = Field(..., ge=0, description="Fuel used in liters/gallons (non-negative)")
    latitude: Optional[Decimal] = None
    longitude: Optional[Decimal] = None

class UsageLogCreate(UsageLogBase):
    pass

class UsageLogResponse(UsageLogBase):
    usage_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
