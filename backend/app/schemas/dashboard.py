from pydantic import BaseModel
from typing import Dict, List, Optional
from decimal import Decimal

class DashboardSummaryResponse(BaseModel):
    total_equipment: int
    rented: int
    available: int
    unassigned: int
    overdue: int
    maintenance: int
    active_rentals: int
    total_sites: int
    total_operators: int
    total_engine_hours: Decimal
    total_idle_hours: Decimal
    total_fuel_used: Decimal
    average_utilization_pct: float
    high_idle_count: int
    attention_required_count: int
    equipment_by_type: Dict[str, int]
    equipment_by_status: Dict[str, int]
