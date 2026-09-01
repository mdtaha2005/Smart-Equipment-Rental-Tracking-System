from pydantic import BaseModel, ConfigDict
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
