from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from decimal import Decimal

from app.db.session import get_db
from app.models.equipment import Equipment
from app.models.rental import Rental
from app.models.site import Site
from app.models.operator import Operator
from app.models.usage_log import UsageLog
from app.models.alert import Alert
from app.schemas.dashboard import DashboardSummaryResponse
from app.services.analytics_service import get_fleet_utilization

router = APIRouter(prefix="/dashboard", tags=["Customer Dashboard"])

@router.get("/summary", response_model=DashboardSummaryResponse)
def get_dashboard_summary(db: Session = Depends(get_db)):
    """
    Real-time Customer Rental Operations Summary:
    Calculates active customer rentals, high idle machines, unassigned anomalies, and overall utilization.
    """
    total_eq = db.query(func.count(Equipment.equipment_id)).scalar() or 0
    available_count = db.query(func.count(Equipment.equipment_id)).filter(Equipment.status == "AVAILABLE").scalar() or 0
    rented_count = db.query(func.count(Equipment.equipment_id)).filter(Equipment.status == "RENTED").scalar() or 0
    unassigned_count = db.query(func.count(Equipment.equipment_id)).filter(Equipment.status == "UNASSIGNED").scalar() or 0
    overdue_count = db.query(func.count(Equipment.equipment_id)).filter(Equipment.status == "OVERDUE").scalar() or 0
    maintenance_count = db.query(func.count(Equipment.equipment_id)).filter(Equipment.status == "MAINTENANCE").scalar() or 0

    active_rentals = db.query(func.count(Rental.rental_id)).filter(Rental.status == "ACTIVE").scalar() or 0
    total_sites = db.query(func.count(Site.site_id)).scalar() or 0
    total_operators = db.query(func.count(Operator.operator_id)).scalar() or 0

    # Total Telemetry Totals
    engine_sum, idle_sum, fuel_sum = db.query(
        func.coalesce(func.sum(UsageLog.engine_hours), 0),
        func.coalesce(func.sum(UsageLog.idle_hours), 0),
        func.coalesce(func.sum(UsageLog.fuel_used), 0)
    ).first()

    total_engine_dec = Decimal(str(engine_sum))
    total_idle_dec = Decimal(str(idle_sum))
    total_fuel_dec = Decimal(str(fuel_sum))

    total_hours = float(total_engine_dec + total_idle_dec)
    avg_util = round((float(total_engine_dec) / total_hours) * 100.0, 1) if total_hours > 0 else 0.0

    # Count high idle equipment (idle ratio >= 70%)
    fleet_utils = get_fleet_utilization(db)
    high_idle_cnt = sum(1 for u in fleet_utils if u.idle_percentage >= 70.0)

    # Active unresolved alerts
    attention_required_cnt = db.query(func.count(Alert.alert_id)).filter(Alert.resolved == False).scalar() or 0

    # Equipment by Type
    by_type_rows = db.query(
        Equipment.equipment_type,
        func.count(Equipment.equipment_id)
    ).group_by(Equipment.equipment_type).all()
    eq_by_type = {row[0]: row[1] for row in by_type_rows}

    # Equipment by Status
    eq_by_status = {
        "AVAILABLE": available_count,
        "RENTED": rented_count,
        "UNASSIGNED": unassigned_count,
        "OVERDUE": overdue_count,
        "MAINTENANCE": maintenance_count
    }

    return DashboardSummaryResponse(
        total_equipment=total_eq,
        rented=rented_count,
        available=available_count,
        unassigned=unassigned_count,
        overdue=overdue_count,
        maintenance=maintenance_count,
        active_rentals=active_rentals,
        total_sites=total_sites,
        total_operators=total_operators,
        total_engine_hours=total_engine_dec,
        total_idle_hours=total_idle_dec,
        total_fuel_used=total_fuel_dec,
        average_utilization_pct=avg_util,
        high_idle_count=high_idle_cnt,
        attention_required_count=attention_required_cnt,
        equipment_by_type=eq_by_type,
        equipment_by_status=eq_by_status
    )
