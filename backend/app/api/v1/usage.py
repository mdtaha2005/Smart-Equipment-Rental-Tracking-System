from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from typing import List, Optional
from datetime import datetime, timezone
import uuid

from app.db.session import get_db
from app.models.usage_log import UsageLog
from app.models.equipment import Equipment
from app.models.rental import Rental
from app.schemas.usage import UsageLogResponse, UsageLogCreate

router = APIRouter(prefix="/usage", tags=["Telemetry & Usage Logs"])

@router.get("", response_model=List[UsageLogResponse], summary="Query Usage Telemetry Logs")
def list_usage_logs(
    equipment_id: Optional[str] = Query(None, description="Filter by equipment ID"),
    rental_id: Optional[str] = Query(None, description="Filter by rental ID"),
    start_date: Optional[datetime] = Query(None, description="Filter logs starting from timestamp"),
    end_date: Optional[datetime] = Query(None, description="Filter logs up to timestamp"),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    query = db.query(UsageLog)
    if equipment_id:
        query = query.filter(UsageLog.equipment_id == equipment_id)
    if rental_id:
        query = query.filter(UsageLog.rental_id == rental_id)
    if start_date:
        query = query.filter(UsageLog.timestamp >= start_date)
    if end_date:
        query = query.filter(UsageLog.timestamp <= end_date)

    logs = query.order_by(desc(UsageLog.timestamp)).offset(offset).limit(limit).all()
    return [UsageLogResponse.model_validate(l) for l in logs]

@router.post("", response_model=UsageLogResponse, status_code=status.HTTP_201_CREATED, summary="Log Equipment Telemetry")
def record_usage_log(payload: UsageLogCreate, db: Session = Depends(get_db)):
    equipment = db.query(Equipment).filter(Equipment.equipment_id == payload.equipment_id).first()
    if not equipment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Equipment '{payload.equipment_id}' not found."
        )

    if payload.rental_id:
        rental = db.query(Rental).filter(Rental.rental_id == payload.rental_id).first()
        if not rental:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Rental '{payload.rental_id}' not found."
            )

    count_logs = db.query(func.count(UsageLog.usage_id)).filter(UsageLog.equipment_id == payload.equipment_id).scalar() or 0
    usage_id = f"USG-{payload.equipment_id}-{count_logs + 1:03d}"
    if db.query(UsageLog).filter(UsageLog.usage_id == usage_id).first():
        short_suffix = uuid.uuid4().hex[:6].upper()
        usage_id = f"USG-{payload.equipment_id}-{short_suffix}"

    log = UsageLog(
        usage_id=usage_id,
        equipment_id=payload.equipment_id,
        rental_id=payload.rental_id,
        timestamp=payload.timestamp or datetime.now(timezone.utc),
        engine_hours=payload.engine_hours,
        idle_hours=payload.idle_hours,
        fuel_used=payload.fuel_used,
        latitude=payload.latitude,
        longitude=payload.longitude,
        created_at=datetime.now(timezone.utc)
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return UsageLogResponse.model_validate(log)
