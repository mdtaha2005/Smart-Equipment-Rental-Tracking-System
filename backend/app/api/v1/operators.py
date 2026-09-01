from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.models.operator import Operator
from app.models.equipment import Equipment
from app.schemas.operator import OperatorResponse

router = APIRouter(prefix="/operators", tags=["Operator Management"])

@router.get("", response_model=List[OperatorResponse], summary="List All Certified Operators")
def list_operators(db: Session = Depends(get_db)):
    operators = db.query(Operator).order_by(Operator.operator_id).all()
    results = []
    for op in operators:
        assigned_eq = db.query(Equipment.equipment_id).filter(Equipment.current_operator_id == op.operator_id).first()
        results.append(OperatorResponse(
            operator_id=op.operator_id,
            operator_name=op.operator_name,
            status=op.status,
            created_at=op.created_at,
            assigned_equipment_id=assigned_eq[0] if assigned_eq else None
        ))
    return results

@router.get("/{operator_id}", response_model=OperatorResponse, summary="Get Operator Details")
def get_operator(operator_id: str, db: Session = Depends(get_db)):
    op = db.query(Operator).filter(Operator.operator_id == operator_id).first()
    if not op:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Operator with ID '{operator_id}' not found."
        )
    assigned_eq = db.query(Equipment.equipment_id).filter(Equipment.current_operator_id == op.operator_id).first()
    return OperatorResponse(
        operator_id=op.operator_id,
        operator_name=op.operator_name,
        status=op.status,
        created_at=op.created_at,
        assigned_equipment_id=assigned_eq[0] if assigned_eq else None
    )
