from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException, status
import uuid

from app.models.equipment import Equipment
from app.models.site import Site
from app.models.operator import Operator
from app.models.rental import Rental
from app.models.usage_log import UsageLog
from app.schemas.rental import RentalCheckoutRequest, RentalCheckinRequest

def checkout_equipment(db: Session, request: RentalCheckoutRequest) -> Rental:
    equipment = db.query(Equipment).filter(Equipment.equipment_id == request.equipment_id).first()
    if not equipment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Equipment with ID '{request.equipment_id}' not found."
        )

    active_rental = db.query(Rental).filter(
        Rental.equipment_id == request.equipment_id,
        Rental.status == "ACTIVE"
    ).first()

    if equipment.status == "RENTED" or active_rental:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Equipment '{request.equipment_id}' is already actively rented. Check it in before creating a new rental."
        )

    site = db.query(Site).filter(Site.site_id == request.site_id).first()
    if not site:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Site with ID '{request.site_id}' not found."
        )

    operator = None
    if request.operator_id:
        operator = db.query(Operator).filter(Operator.operator_id == request.operator_id).first()
        if not operator:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Operator with ID '{request.operator_id}' not found."
            )
        if operator.status != "ACTIVE":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Operator '{request.operator_id}' ({operator.operator_name}) is currently INACTIVE."
            )

    checkout_dt = request.checkout_date or datetime.now(timezone.utc)
    if request.expected_checkin_date < checkout_dt:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Expected check-in date cannot precede checkout date."
        )

    count_rentals = db.query(func.count(Rental.rental_id)).filter(Rental.equipment_id == request.equipment_id).scalar() or 0
    rental_id = f"RNT-{request.equipment_id}-{count_rentals + 1:02d}"
    if db.query(Rental).filter(Rental.rental_id == rental_id).first():
        short_suffix = uuid.uuid4().hex[:6].upper()
        rental_id = f"RNT-{request.equipment_id}-{short_suffix}"

    try:
        rental = Rental(
            rental_id=rental_id,
            equipment_id=request.equipment_id,
            site_id=request.site_id,
            operator_id=request.operator_id,
            checkout_date=checkout_dt,
            expected_checkin_date=request.expected_checkin_date,
            actual_checkin_date=None,
            status="ACTIVE",
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        db.add(rental)

        equipment.status = "RENTED"
        equipment.current_site_id = request.site_id
        equipment.current_operator_id = request.operator_id
        equipment.updated_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(rental)
        return rental
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Checkout transaction failed: {str(e)}"
        )

def checkin_equipment(db: Session, rental_id: str, request: RentalCheckinRequest) -> Rental:
    rental = db.query(Rental).filter(Rental.rental_id == rental_id).first()
    if not rental:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Rental record '{rental_id}' not found."
        )

    if rental.status != "ACTIVE":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Rental '{rental_id}' is not ACTIVE (current status: {rental.status})."
        )

    equipment = db.query(Equipment).filter(Equipment.equipment_id == rental.equipment_id).first()
    if not equipment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Associated equipment '{rental.equipment_id}' not found."
        )

    actual_dt = request.actual_checkin_date or datetime.now(timezone.utc)

    try:
        rental.actual_checkin_date = actual_dt
        rental.status = "COMPLETED"
        rental.updated_at = datetime.now(timezone.utc)

        equipment.status = "AVAILABLE"
        equipment.current_site_id = None
        equipment.current_operator_id = None
        equipment.updated_at = datetime.now(timezone.utc)

        if request.engine_hours is not None or request.idle_hours is not None or request.fuel_used is not None:
            engine_hrs = request.engine_hours or Decimal("0.0")
            idle_hrs = request.idle_hours or Decimal("0.0")
            fuel_used = request.fuel_used or Decimal("0.0")

            usage_count = db.query(func.count(UsageLog.usage_id)).filter(UsageLog.equipment_id == equipment.equipment_id).scalar() or 0
            usage_id = f"USG-{equipment.equipment_id}-{usage_count + 1:03d}"
            if db.query(UsageLog).filter(UsageLog.usage_id == usage_id).first():
                short_suffix = uuid.uuid4().hex[:6].upper()
                usage_id = f"USG-{equipment.equipment_id}-{short_suffix}"

            usage_log = UsageLog(
                usage_id=usage_id,
                equipment_id=equipment.equipment_id,
                rental_id=rental.rental_id,
                timestamp=actual_dt,
                engine_hours=engine_hrs,
                idle_hours=idle_hrs,
                fuel_used=fuel_used,
                created_at=datetime.now(timezone.utc)
            )
            db.add(usage_log)

        db.commit()
        db.refresh(rental)
        return rental
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Check-in transaction failed: {str(e)}"
        )
