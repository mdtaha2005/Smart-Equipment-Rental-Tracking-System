from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from app.schemas.site import SiteSimple
from app.schemas.operator import OperatorSimple
from app.schemas.rental import RentalResponse
from app.schemas.usage import UsageLogResponse

class EquipmentBase(BaseModel):
    equipment_id: str
    equipment_type: str
    status: str = "AVAILABLE"
    current_site_id: Optional[str] = None
    current_operator_id: Optional[str] = None

class EquipmentCreate(EquipmentBase):
    pass

class EquipmentUpdate(BaseModel):
    equipment_type: Optional[str] = None
    status: Optional[str] = None
    current_site_id: Optional[str] = None
    current_operator_id: Optional[str] = None

class EquipmentUsageSummary(BaseModel):
    total_engine_hours: Decimal = Decimal("0.0")
    total_idle_hours: Decimal = Decimal("0.0")
    total_fuel_used: Decimal = Decimal("0.0")
    utilization_rate: Optional[float] = None
    last_log_timestamp: Optional[datetime] = None

class EquipmentResponse(BaseModel):
    equipment_id: str
    equipment_type: str
    status: str
    current_site_id: Optional[str] = None
    current_operator_id: Optional[str] = None
    site_name: Optional[str] = None
    operator_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    usage_summary: Optional[EquipmentUsageSummary] = None

    model_config = ConfigDict(from_attributes=True)

class EquipmentDetailResponse(EquipmentResponse):
    current_site: Optional[SiteSimple] = None
    current_operator: Optional[OperatorSimple] = None
    active_rental: Optional[RentalResponse] = None
    recent_usage_logs: List[UsageLogResponse] = []
    rental_history: List[RentalResponse] = []
