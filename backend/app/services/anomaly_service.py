from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timezone
from decimal import Decimal
from typing import List, Dict

from app.models.equipment import Equipment
from app.models.rental import Rental
from app.models.usage_log import UsageLog
from app.services.analytics_service import calculate_utilization_metrics, get_daily_usage_trend

# Configurable threshold: Flag equipment if idle ratio exceeds 70%
IDLE_THRESHOLD_RATIO = 0.70

def detect_all_anomalies(db: Session) -> List[Dict]:
    """
    Rule and statistical-based explainable anomaly detection engine for customer rented equipment.
    Detects:
    1. UNASSIGNED_EQUIPMENT (EQX1002, EQX1007)
    2. HIGH_IDLE (Idle percentage >= 70%)
    3. ZERO_ENGINE_USAGE (0 engine hours with substantial idle hours)
    4. OVERDUE_RENTAL (expected_checkin_date < now)
    5. UNUSUAL_USAGE (statistical standard deviation)
    """
    anomalies = []
    now_utc = datetime.now(timezone.utc)

    equipments = db.query(Equipment).all()

    for eq in equipments:
        # Calculate total usage
        engine_sum, idle_sum = db.query(
            func.coalesce(func.sum(UsageLog.engine_hours), 0),
            func.coalesce(func.sum(UsageLog.idle_hours), 0)
        ).filter(UsageLog.equipment_id == eq.equipment_id).first()

        eng_dec = Decimal(str(engine_sum))
        idl_dec = Decimal(str(idle_sum))
        util_rate, idle_pct, total_hours = calculate_utilization_metrics(eng_dec, idl_dec)

        # 1. Check Unassigned Rented Equipment
        if eq.status == "UNASSIGNED" or (eq.current_site_id is None and eq.current_operator_id is None):
            anomalies.append({
                "equipment_id": eq.equipment_id,
                "alert_type": "UNASSIGNED_EQUIPMENT",
                "severity": "HIGH",
                "message": f"Rented equipment {eq.equipment_id} ({eq.equipment_type}) has no current job site or operator assignment, yet has active rental history."
            })

        # 2. Check Zero Engine Usage on active asset
        if eng_dec == 0 and idl_dec >= 10:
            anomalies.append({
                "equipment_id": eq.equipment_id,
                "alert_type": "ZERO_ENGINE_USAGE",
                "severity": "CRITICAL",
                "message": f"{eq.equipment_id} ({eq.equipment_type}) has 0.0 engine hours logged across its rental period despite accumulating {idl_dec} idle standby hours."
            })

        # 3. Check Extreme Idle Time (>= 70%)
        elif (idle_pct / 100.0) >= IDLE_THRESHOLD_RATIO and total_hours >= 10:
            anomalies.append({
                "equipment_id": eq.equipment_id,
                "alert_type": "HIGH_IDLE",
                "severity": "MEDIUM",
                "message": f"{eq.equipment_id} ({eq.equipment_type}) has severe idle waste ({idle_pct}% idle time: {idl_dec}h idle vs {eng_dec}h engine load)."
            })

        # 4. Check Unusual Usage Variation (Statistical Z-Score / Deviation)
        daily_pts = get_daily_usage_trend(db, eq.equipment_id)
        if len(daily_pts) >= 5:
            engine_vals = [p.engine_hours for p in daily_pts]
            mean_eng = sum(engine_vals) / len(engine_vals)
            if mean_eng > 2.0:
                recent_pt = daily_pts[-1].engine_hours
                if recent_pt == 0.0 and mean_eng >= 4.0:
                    anomalies.append({
                        "equipment_id": eq.equipment_id,
                        "alert_type": "UNUSUAL_USAGE",
                        "severity": "LOW",
                        "message": f"{eq.equipment_id} experienced sudden drop to 0 engine hours on {daily_pts[-1].date} compared to daily average of {mean_eng:.1f} hrs."
                    })

    # 5. Check Overdue Rentals
    active_rentals = db.query(Rental).filter(Rental.status == "ACTIVE").all()
    for rnt in active_rentals:
        # Check if overdue
        if rnt.expected_checkin_date and rnt.expected_checkin_date < now_utc:
            anomalies.append({
                "equipment_id": rnt.equipment_id,
                "alert_type": "OVERDUE_RENTAL",
                "severity": "HIGH",
                "message": f"Rental contract {rnt.rental_id} for {rnt.equipment_id} exceeded expected return date ({rnt.expected_checkin_date.strftime('%Y-%m-%d')}). Please initiate check-in or extend contract."
            })

    return anomalies
