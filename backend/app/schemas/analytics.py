from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime, date
from decimal import Decimal
from app.schemas.usage import UsageLogResponse

class EquipmentUtilization(BaseModel):
    equipment_id: str
    equipment_type: str
    site_id: Optional[str] = None
    site_name: Optional[str] = None
    operator_id: Optional[str] = None
    operator_name: Optional[str] = None
    rental_status: str
    engine_hours: Decimal
    idle_hours: Decimal
    total_usage_hours: Decimal
    fuel_used: Decimal
    utilization_rate: float
    idle_percentage: float
    insight_summary: str

    model_config = ConfigDict(from_attributes=True)

class SiteAnalytics(BaseModel):
    site_id: str
    site_name: str
    location: str
    equipment_count: int
    active_rentals: int
    total_engine_hours: Decimal
    total_idle_hours: Decimal
    total_fuel_used: Decimal
    average_utilization: float

    model_config = ConfigDict(from_attributes=True)

class DailyUsagePoint(BaseModel):
    date: str
    engine_hours: float
    idle_hours: float
    fuel_used: float
    utilization_rate: float

class EquipmentPerformance(BaseModel):
    equipment_id: str
    equipment_type: str
    status: str
    site_id: Optional[str] = None
    site_name: Optional[str] = None
    operator_id: Optional[str] = None
    operator_name: Optional[str] = None
    rental_id: Optional[str] = None
    checkout_date: Optional[datetime] = None
    expected_return: Optional[datetime] = None
    total_engine_hours: Decimal
    total_idle_hours: Decimal
    total_fuel_used: Decimal
    utilization_rate: float
    idle_percentage: float
    avg_engine_hours_day: float
    avg_idle_hours_day: float
    highest_engine_day: Optional[DailyUsagePoint] = None
    highest_idle_day: Optional[DailyUsagePoint] = None
    business_insight: str
    active_anomalies: List[str] = []
    daily_trend: List[DailyUsagePoint] = []
    recent_logs: List[UsageLogResponse] = []
