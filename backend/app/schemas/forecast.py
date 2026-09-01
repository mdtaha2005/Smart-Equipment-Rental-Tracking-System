from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict
from datetime import date, datetime
from decimal import Decimal

class ForecastBase(BaseModel):
    site_id: str
    equipment_type: str
    forecast_date: date
    predicted_demand: float
    demand_level: str
    confidence: Optional[float] = None

class ForecastResponse(ForecastBase):
    forecast_id: str
    site_name: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class SiteForecastSummary(BaseModel):
    site_id: str
    site_name: str
    location: str
    overall_demand_level: str
    top_predicted_demand_score: float
    equipment_type_forecasts: Dict[str, str]

class ForecastMatrixPoint(BaseModel):
    site_id: str
    site_name: str
    equipment_type: str
    demand_score: float
    demand_level: str
    active_equipment_count: int

class ForecastGenerationSummary(BaseModel):
    forecasts_generated: int
    sites_evaluated: int
    horizon_days: int
    model_type: str
    timestamp: datetime
    forecasts: List[ForecastResponse] = []
