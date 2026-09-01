from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime
from decimal import Decimal

class SiteBase(BaseModel):
    site_id: str
    site_name: str
    location: str
    latitude: Optional[Decimal] = None
    longitude: Optional[Decimal] = None

class SiteCreate(SiteBase):
    pass

class SiteResponse(SiteBase):
    created_at: datetime
    active_equipment_count: Optional[int] = 0

    model_config = ConfigDict(from_attributes=True)

class SiteSimple(BaseModel):
    site_id: str
    site_name: str
    location: str

    model_config = ConfigDict(from_attributes=True)
