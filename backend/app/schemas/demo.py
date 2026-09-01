from pydantic import BaseModel
from typing import Dict, Any, List
from datetime import datetime

class DemoResetResponse(BaseModel):
    status: str
    message: str
    timestamp: datetime
    entities_restored: Dict[str, int]
    challenge_records_verified: bool

class ExecutiveSummaryResponse(BaseModel):
    total_rented_equipment: int
    deployed_sites_count: int
    average_utilization_pct: float
    high_idle_count: int
    attention_required_count: int
    redeploy_candidate_count: int
    summary_narrative: str
