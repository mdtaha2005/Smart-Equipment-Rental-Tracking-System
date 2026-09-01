from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.session import get_db
from app.schemas.alert import AlertResponse, AlertGenerationSummary
from app.services.alert_service import (
    generate_alerts,
    list_alerts,
    get_alert,
    resolve_alert
)

router = APIRouter(prefix="/alerts", tags=["Customer Alerts & Attention"])

@router.get("", response_model=List[AlertResponse])
def get_alerts_endpoint(
    equipment_id: Optional[str] = Query(None, description="Filter by equipment ID"),
    severity: Optional[str] = Query(None, description="Filter by severity (LOW, MEDIUM, HIGH, CRITICAL)"),
    alert_type: Optional[str] = Query(None, description="Filter by alert type"),
    resolved: Optional[bool] = Query(None, description="Filter by resolved status"),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """
    Retrieve customer alerts with optional filtering by severity, resolution state, and equipment.
    """
    return list_alerts(
        db=db,
        equipment_id=equipment_id,
        severity=severity,
        alert_type=alert_type,
        resolved=resolved,
        limit=limit,
        offset=offset
    )

@router.post("/generate", response_model=AlertGenerationSummary, status_code=status.HTTP_201_CREATED)
def trigger_alert_generation_endpoint(
    db: Session = Depends(get_db)
):
    """
    Idempotent alert evaluation engine: analyzes current telemetry, rental states, and unassigned assets.
    Guarantees no duplicate active alerts.
    """
    return generate_alerts(db)

@router.get("/{alert_id}", response_model=AlertResponse)
def get_single_alert_endpoint(
    alert_id: str,
    db: Session = Depends(get_db)
):
    """
    Retrieve details of a single alert by ID.
    """
    return get_alert(db, alert_id)

@router.patch("/{alert_id}/resolve", response_model=AlertResponse)
def resolve_alert_endpoint(
    alert_id: str,
    db: Session = Depends(get_db)
):
    """
    Mark an active alert as resolved without deleting its historical audit record.
    """
    return resolve_alert(db, alert_id)
