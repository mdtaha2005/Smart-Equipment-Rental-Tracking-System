import os

files = {}

# 1. backend/app/schemas/site.py
files['backend/app/schemas/site.py'] = '''from pydantic import BaseModel, ConfigDict
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
'''

# 2. backend/app/schemas/operator.py
files['backend/app/schemas/operator.py'] = '''from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class OperatorBase(BaseModel):
    operator_id: str
    operator_name: str
    status: str = "ACTIVE"

class OperatorCreate(OperatorBase):
    pass

class OperatorResponse(OperatorBase):
    created_at: datetime
    assigned_equipment_id: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class OperatorSimple(BaseModel):
    operator_id: str
    operator_name: str
    status: str

    model_config = ConfigDict(from_attributes=True)
'''

# 3. backend/app/schemas/usage.py
files['backend/app/schemas/usage.py'] = '''from pydantic import BaseModel, Field, ConfigDict
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
'''

# 4. backend/app/schemas/rental.py
files['backend/app/schemas/rental.py'] = '''from pydantic import BaseModel, Field, ConfigDict
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
'''

# 5. backend/app/schemas/equipment.py
files['backend/app/schemas/equipment.py'] = '''from pydantic import BaseModel, ConfigDict
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
'''

# 6. backend/app/schemas/dashboard.py
files['backend/app/schemas/dashboard.py'] = '''from pydantic import BaseModel
from typing import Dict, List, Optional
from decimal import Decimal

class DashboardSummaryResponse(BaseModel):
    total_equipment: int
    available: int
    rented: int
    overdue: int
    unassigned: int
    maintenance: int
    active_rentals: int
    total_sites: int
    total_operators: int
    total_engine_hours: Decimal
    total_idle_hours: Decimal
    total_fuel_used: Decimal
    average_utilization_pct: float
    equipment_by_type: Dict[str, int]
    equipment_by_status: Dict[str, int]
'''

# 7. Update backend/app/schemas/__init__.py
files['backend/app/schemas/__init__.py'] = '''from app.schemas.health import HealthResponse, DatabaseHealthResponse, TableCountInfo
from app.schemas.site import SiteBase, SiteCreate, SiteResponse, SiteSimple
from app.schemas.operator import OperatorBase, OperatorCreate, OperatorResponse, OperatorSimple
from app.schemas.usage import UsageLogBase, UsageLogCreate, UsageLogResponse
from app.schemas.rental import (
    RentalBase,
    RentalCreate,
    RentalCheckoutRequest,
    RentalCheckinRequest,
    RentalResponse,
    RentalDetailResponse,
)
from app.schemas.equipment import (
    EquipmentBase,
    EquipmentCreate,
    EquipmentUpdate,
    EquipmentResponse,
    EquipmentDetailResponse,
    EquipmentUsageSummary,
)
from app.schemas.dashboard import DashboardSummaryResponse

__all__ = [
    "HealthResponse",
    "DatabaseHealthResponse",
    "TableCountInfo",
    "SiteBase",
    "SiteCreate",
    "SiteResponse",
    "SiteSimple",
    "OperatorBase",
    "OperatorCreate",
    "OperatorResponse",
    "OperatorSimple",
    "UsageLogBase",
    "UsageLogCreate",
    "UsageLogResponse",
    "RentalBase",
    "RentalCreate",
    "RentalCheckoutRequest",
    "RentalCheckinRequest",
    "RentalResponse",
    "RentalDetailResponse",
    "EquipmentBase",
    "EquipmentCreate",
    "EquipmentUpdate",
    "EquipmentResponse",
    "EquipmentDetailResponse",
    "EquipmentUsageSummary",
    "DashboardSummaryResponse",
]
'''

for path, content in files.items():
    os.makedirs(os.path.dirname(path) if os.path.dirname(path) else '.', exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

print("All Pydantic schemas created successfully.")
