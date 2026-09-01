from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime
from decimal import Decimal

class RecommendationBase(BaseModel):
    equipment_id: str
    current_site_id: Optional[str] = None
    recommended_site_id: Optional[str] = None
    reason: str
    expected_utilization_gain: Optional[float] = None
    priority: str
    status: str

class RecommendationResponse(RecommendationBase):
    recommendation_id: str
    equipment_type: Optional[str] = None
    current_site_name: Optional[str] = None
    recommended_site_name: Optional[str] = None
    recommendation_type: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class RecommendationStatusUpdate(BaseModel):
    status: str

class RecommendationGenerationSummary(BaseModel):
    recommendations_created: int
    recommendations_updated: int
    total_active_recommendations: int
    recommendations: List[RecommendationResponse] = []
