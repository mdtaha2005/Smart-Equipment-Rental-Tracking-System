from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from app.schemas.site import SiteSimple
from app.schemas.operator import OperatorSimple

class RentalBase(BaseModel):
    equipment_id: str
    site_id: Optional[str] = None
    operator_id: Optional[str] = None
    checkout_date: datetime
    expected_checkin_date: datetime

class RentalCreate(RentalBase):
    pass

class RentalCheckoutRequest(BaseModel):
    equipment_id: str
    site_id: str
    operator_id: Optional[str] = None
    checkout_date: Optional[datetime] = None
    expected_checkin_date: datetime

class RentalCheckinRequest(BaseModel):
    actual_checkin_date: Optional[datetime] = None
    engine_hours: Optional[Decimal] = Field(None, ge=0)
    idle_hours: Optional[Decimal] = Field(None, ge=0)
    fuel_used: Optional[Decimal] = Field(None, ge=0)

class RentalResponse(BaseModel):
    rental_id: str
    equipment_id: str
    equipment_type: Optional[str] = None
    site_id: Optional[str] = None
    site_name: Optional[str] = None
    operator_id: Optional[str] = None
    operator_name: Optional[str] = None
    checkout_date: datetime
    expected_checkin_date: datetime
    actual_checkin_date: Optional[datetime] = None
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class RentalDetailResponse(RentalResponse):
    site: Optional[SiteSimple] = None
    operator: Optional[OperatorSimple] = None
