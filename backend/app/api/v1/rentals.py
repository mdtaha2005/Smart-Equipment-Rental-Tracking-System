from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional

from app.db.session import get_db
from app.models.rental import Rental
from app.schemas.rental import (
    RentalResponse,
    RentalDetailResponse,
    RentalCheckoutRequest,
    RentalCheckinRequest,
    RentalCreate
)
from app.services.rental_service import checkout_equipment, checkin_equipment
from app.schemas.site import SiteSimple
from app.schemas.operator import OperatorSimple

router = APIRouter(prefix="/rentals", tags=["Rental Operations"])

def _map_rental_response(r: Rental) -> RentalResponse:
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

@router.get("", response_model=List[RentalResponse], summary="List Rental Records")
def list_rentals(
    status: Optional[str] = Query(None, description="Filter by status (ACTIVE, COMPLETED, OVERDUE, CANCELLED)"),
    equipment_id: Optional[str] = Query(None, description="Filter by equipment ID"),
    site_id: Optional[str] = Query(None, description="Filter by site ID"),
    operator_id: Optional[str] = Query(None, description="Filter by operator ID"),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    query = db.query(Rental)
    if status:
        query = query.filter(Rental.status == status.upper())
    if equipment_id:
        query = query.filter(Rental.equipment_id == equipment_id)
    if site_id:
        query = query.filter(Rental.site_id == site_id)
    if operator_id:
        query = query.filter(Rental.operator_id == operator_id)

    rentals = query.order_by(desc(Rental.checkout_date)).offset(offset).limit(limit).all()
    return [_map_rental_response(r) for r in rentals]

@router.get("/{rental_id}", response_model=RentalDetailResponse, summary="Get Rental Details")
def get_rental(rental_id: str, db: Session = Depends(get_db)):
    rental = db.query(Rental).filter(Rental.rental_id == rental_id).first()
    if not rental:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Rental with ID '{rental_id}' not found."
        )

    base = _map_rental_response(rental)
    return RentalDetailResponse(
        **base.model_dump(),
        site=SiteSimple.model_validate(rental.site) if rental.site else None,
        operator=OperatorSimple.model_validate(rental.operator) if rental.operator else None
    )

@router.post("/checkout", response_model=RentalResponse, status_code=status.HTTP_201_CREATED, summary="Check Out Equipment")
def create_checkout(payload: RentalCheckoutRequest, db: Session = Depends(get_db)):
    rental = checkout_equipment(db, payload)
    return _map_rental_response(rental)

@router.post("", response_model=RentalResponse, status_code=status.HTTP_201_CREATED, summary="Create Rental (Alias for Check-out)")
def create_rental(payload: RentalCheckoutRequest, db: Session = Depends(get_db)):
    rental = checkout_equipment(db, payload)
    return _map_rental_response(rental)

@router.post("/{rental_id}/check-in", response_model=RentalResponse, summary="Check In Equipment")
def create_checkin(rental_id: str, payload: RentalCheckinRequest, db: Session = Depends(get_db)):
    rental = checkin_equipment(db, rental_id, payload)
    return _map_rental_response(rental)
