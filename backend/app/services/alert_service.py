from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import HTTPException, status
import uuid

from app.models.alert import Alert
from app.models.equipment import Equipment
from app.schemas.alert import AlertResponse, AlertGenerationSummary
from app.services.anomaly_service import detect_all_anomalies

def _map_alert_response(alert: Alert) -> AlertResponse:
    site_name = None
    if alert.equipment and alert.equipment.current_site:
        site_name = alert.equipment.current_site.site_name

    return AlertResponse(
        alert_id=alert.alert_id,
        equipment_id=alert.equipment_id,
        equipment_type=alert.equipment.equipment_type if alert.equipment else None,
        site_name=site_name,
        alert_type=alert.alert_type,
        severity=alert.severity,
        message=alert.message,
        detected_at=alert.detected_at,
        resolved=alert.resolved,
        resolved_at=alert.resolved_at
    )

def generate_alerts(db: Session) -> AlertGenerationSummary:
    """
    Idempotent alert generation:
    1. Evaluates all rule/statistical anomalies.
    2. Queries existing unresolved alerts to deduplicate.
    3. Adds only new alerts, guaranteeing zero duplicate active alerts.
    """
    detected_anomalies = detect_all_anomalies(db)
    created_count = 0
    skipped_count = 0

    for item in detected_anomalies:
        eq_id = item["equipment_id"]
        al_type = item["alert_type"]

        # Check for existing unresolved alert of same type for this machine
        existing = db.query(Alert).filter(
            Alert.equipment_id == eq_id,
            Alert.alert_type == al_type,
            Alert.resolved == False
        ).first()

        if existing:
            skipped_count += 1
        else:
            alert_id = f"ALT-{eq_id}-{al_type[:4]}-{uuid.uuid4().hex[:4].upper()}"
            new_alert = Alert(
                alert_id=alert_id,
                equipment_id=eq_id,
                alert_type=al_type,
                severity=item["severity"],
                message=item["message"],
                detected_at=datetime.now(timezone.utc),
                resolved=False,
                resolved_at=None
            )
            db.add(new_alert)
            created_count += 1

    db.commit()

    active_alerts = db.query(Alert).filter(Alert.resolved == False).order_by(desc(Alert.detected_at)).all()
    return AlertGenerationSummary(
        alerts_created=created_count,
        alerts_skipped=skipped_count,
        total_active_alerts=len(active_alerts),
        alerts=[_map_alert_response(a) for a in active_alerts]
    )

def list_alerts(
    db: Session,
    equipment_id: Optional[str] = None,
    severity: Optional[str] = None,
    alert_type: Optional[str] = None,
    resolved: Optional[bool] = None,
    limit: int = 100,
    offset: int = 0
) -> List[AlertResponse]:
    query = db.query(Alert)
    if equipment_id:
        query = query.filter(Alert.equipment_id == equipment_id)
    if severity:
        query = query.filter(Alert.severity == severity.upper())
    if alert_type:
        query = query.filter(Alert.alert_type == alert_type.upper())
    if resolved is not None:
        query = query.filter(Alert.resolved == resolved)

    alerts = query.order_by(desc(Alert.detected_at)).offset(offset).limit(limit).all()
    return [_map_alert_response(a) for a in alerts]

def get_alert(db: Session, alert_id: str) -> AlertResponse:
    alert = db.query(Alert).filter(Alert.alert_id == alert_id).first()
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Alert with ID '{alert_id}' not found."
        )
    return _map_alert_response(alert)

def resolve_alert(db: Session, alert_id: str) -> AlertResponse:
    alert = db.query(Alert).filter(Alert.alert_id == alert_id).first()
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Alert with ID '{alert_id}' not found."
        )

    alert.resolved = True
    alert.resolved_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(alert)
    return _map_alert_response(alert)
