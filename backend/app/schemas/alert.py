from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

class AlertBase(BaseModel):
    equipment_id: str
    alert_type: str
    severity: str
    message: str

class AlertCreate(AlertBase):
    pass

class AlertResponse(AlertBase):
    alert_id: str
    equipment_type: Optional[str] = None
    site_name: Optional[str] = None
    detected_at: datetime
    resolved: bool
    resolved_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class AlertGenerationSummary(BaseModel):
    alerts_created: int
    alerts_skipped: int
    total_active_alerts: int
    alerts: List[AlertResponse] = []
