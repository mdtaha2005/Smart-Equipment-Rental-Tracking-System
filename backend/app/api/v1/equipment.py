from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, or_
from typing import List, Optional
from datetime import datetime, timezone
from decimal import Decimal

from app.db.session import get_db
from app.models.equipment import Equipment
from app.models.site import Site
from app.models.operator import Operator
from app.models.rental import Rental
from app.models.usage_log import UsageLog
from app.schemas.equipment import (
    EquipmentResponse,
    EquipmentDetailResponse,
    EquipmentCreate,
    EquipmentUpdate,
    EquipmentUsageSummary
)
from app.schemas.site import SiteSimple
from app.schemas.operator import OperatorSimple
from app.schemas.rental import RentalResponse
from app.schemas.usage import UsageLogResponse

router = APIRouter(prefix="/equipment", tags=["Equipment Management"])

def _build_usage_summary(db: Session, equipment_id: str) -> EquipmentUsageSummary:
    total_engine = db.query(func.coalesce(func.sum(UsageLog.engine_hours), 0)).filter(UsageLog.equipment_id == equipment_id).scalar()
    total_idle = db.query(func.coalesce(func.sum(UsageLog.idle_hours), 0)).filter(UsageLog.equipment_id == equipment_id).scalar()
    total_fuel = db.query(func.coalesce(func.sum(UsageLog.fuel_used), 0)).filter(UsageLog.equipment_id == equipment_id).scalar()
    last_log = db.query(UsageLog.timestamp).filter(UsageLog.equipment_id == equipment_id).order_by(desc(UsageLog.timestamp)).first()

    total_op = float(total_engine) + float(total_idle)
    utilization_rate = round((float(total_engine) / total_op) * 100, 1) if total_op > 0 else 0.0

    return EquipmentUsageSummary(
        total_engine_hours=Decimal(str(total_engine)),
        total_idle_hours=Decimal(str(total_idle)),
        total_fuel_used=Decimal(str(total_fuel)),
        utilization_rate=utilization_rate,
        last_log_timestamp=last_log[0] if last_log else None
    )

def _build_equipment_response(db: Session, eq: Equipment) -> EquipmentResponse:
    site_name = eq.current_site.site_name if eq.current_site else None
    operator_name = eq.current_operator.operator_name if eq.current_operator else None
    usage_sum = _build_usage_summary(db, eq.equipment_id)

    return EquipmentResponse(
        equipment_id=eq.equipment_id,
        equipment_type=eq.equipment_type,
        status=eq.status,
        current_site_id=eq.current_site_id,
        current_operator_id=eq.current_operator_id,
        site_name=site_name,
        operator_name=operator_name,
        created_at=eq.created_at,
        updated_at=eq.updated_at,
        usage_summary=usage_sum
    )

@router.get("", response_model=List[EquipmentResponse], summary="List Equipment Fleet")
def list_equipment(
    status: Optional[str] = Query(None, description="Filter by status (AVAILABLE, RENTED, OVERDUE, MAINTENANCE, UNASSIGNED)"),
    equipment_type: Optional[str] = Query(None, description="Filter by equipment type"),
    site_id: Optional[str] = Query(None, description="Filter by current site ID"),
    operator_id: Optional[str] = Query(None, description="Filter by current operator ID"),
    search: Optional[str] = Query(None, description="Search by ID or type"),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    query = db.query(Equipment)

    if status:
        query = query.filter(Equipment.status == status.upper())
    if equipment_type:
        query = query.filter(func.lower(Equipment.equipment_type) == equipment_type.lower())
    if site_id:
        query = query.filter(Equipment.current_site_id == site_id)
    if operator_id:
        query = query.filter(Equipment.current_operator_id == operator_id)
    if search:
        search_pattern = f"%{search.lower()}%"
        query = query.filter(
            or_(
                func.lower(Equipment.equipment_id).like(search_pattern),
                func.lower(Equipment.equipment_type).like(search_pattern)
            )
        )

    equipments = query.order_by(Equipment.equipment_id).offset(offset).limit(limit).all()
    return [_build_equipment_response(db, eq) for eq in equipments]

@router.get("/tag/{tag_id}", response_model=EquipmentDetailResponse, summary="Simulated QR/RFID Tag Scan")
def scan_equipment_tag(tag_id: str, db: Session = Depends(get_db)):
    import re
    cleaned = tag_id.strip().upper()
    # Direct match check
    eq = db.query(Equipment).filter(Equipment.equipment_id == cleaned).first()
    if eq:
        return get_equipment(equipment_id=eq.equipment_id, db=db)
    
    # Extract EQX pattern (e.g. TAG-EQX1001-QR -> EQX1001)
    match = re.search(r'(EQX\d+)', cleaned)
    if match:
        extracted_id = match.group(1)
        eq = db.query(Equipment).filter(Equipment.equipment_id == extracted_id).first()
        if eq:
            return get_equipment(equipment_id=extracted_id, db=db)

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Scanned tag '{tag_id}' did not match any registered equipment asset."
    )

@router.get("/{equipment_id}", response_model=EquipmentDetailResponse, summary="Get Equipment Details")
def get_equipment(equipment_id: str, db: Session = Depends(get_db)):
    eq = db.query(Equipment).filter(Equipment.equipment_id == equipment_id).first()
    if not eq:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Equipment with ID '{equipment_id}' was not found in the fleet."
        )

    base_resp = _build_equipment_response(db, eq)

    active_rental = db.query(Rental).filter(
        Rental.equipment_id == equipment_id,
        Rental.status == "ACTIVE"
    ).order_by(desc(Rental.checkout_date)).first()

    recent_logs = db.query(UsageLog).filter(
        UsageLog.equipment_id == equipment_id
    ).order_by(desc(UsageLog.timestamp)).limit(15).all()

    rental_history = db.query(Rental).filter(
        Rental.equipment_id == equipment_id
    ).order_by(desc(Rental.checkout_date)).all()

    def _map_rental(r: Rental) -> RentalResponse:
        return RentalResponse(
            rental_id=r.rental_id,
            equipment_id=r.equipment_id,
            equipment_type=r.equipment.equipment_type if r.equipment else None,
            site_id=r.site_id,
            site_name=r.site.site_name if r.site else None,
            operator_id=r.operator_id,
            operator_name=r.operator.operator_name if r.operator else None,
            checkout_date=r.checkout_date,
            expected_checkin_date=r.expected_checkin_date,
            actual_checkin_date=r.actual_checkin_date,
            status=r.status,
            created_at=r.created_at,
            updated_at=r.updated_at
        )

    return EquipmentDetailResponse(
        **base_resp.model_dump(),
        current_site=SiteSimple.model_validate(eq.current_site) if eq.current_site else None,
        current_operator=OperatorSimple.model_validate(eq.current_operator) if eq.current_operator else None,
        active_rental=_map_rental(active_rental) if active_rental else None,
        recent_usage_logs=[UsageLogResponse.model_validate(l) for l in recent_logs],
        rental_history=[_map_rental(r) for r in rental_history]
    )

@router.post("", response_model=EquipmentResponse, status_code=status.HTTP_201_CREATED, summary="Add New Equipment")
def create_equipment(payload: EquipmentCreate, db: Session = Depends(get_db)):
    existing = db.query(Equipment).filter(Equipment.equipment_id == payload.equipment_id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Equipment with ID '{payload.equipment_id}' already exists in fleet."
        )

    if payload.current_site_id:
        if not db.query(Site).filter(Site.site_id == payload.current_site_id).first():
            raise HTTPException(status_code=404, detail=f"Site '{payload.current_site_id}' not found.")

    if payload.current_operator_id:
        if not db.query(Operator).filter(Operator.operator_id == payload.current_operator_id).first():
            raise HTTPException(status_code=404, detail=f"Operator '{payload.current_operator_id}' not found.")

    eq = Equipment(
        equipment_id=payload.equipment_id.upper(),
        equipment_type=payload.equipment_type,
        status=payload.status.upper(),
        current_site_id=payload.current_site_id,
        current_operator_id=payload.current_operator_id,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    db.add(eq)
    db.commit()
    db.refresh(eq)
    return _build_equipment_response(db, eq)

@router.patch("/{equipment_id}", response_model=EquipmentResponse, summary="Update Equipment")
def update_equipment(equipment_id: str, payload: EquipmentUpdate, db: Session = Depends(get_db)):
    eq = db.query(Equipment).filter(Equipment.equipment_id == equipment_id).first()
    if not eq:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Equipment with ID '{equipment_id}' not found."
        )

    if payload.equipment_type is not None:
        eq.equipment_type = payload.equipment_type
    if payload.status is not None:
        eq.status = payload.status.upper()
    if payload.current_site_id is not None:
        if payload.current_site_id != "" and not db.query(Site).filter(Site.site_id == payload.current_site_id).first():
            raise HTTPException(status_code=404, detail=f"Site '{payload.current_site_id}' not found.")
        eq.current_site_id = payload.current_site_id if payload.current_site_id != "" else None
    if payload.current_operator_id is not None:
        if payload.current_operator_id != "" and not db.query(Operator).filter(Operator.operator_id == payload.current_operator_id).first():
            raise HTTPException(status_code=404, detail=f"Operator '{payload.current_operator_id}' not found.")
        eq.current_operator_id = payload.current_operator_id if payload.current_operator_id != "" else None

    eq.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(eq)
    return _build_equipment_response(db, eq)
