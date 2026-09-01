from sqlalchemy.orm import Session
from sqlalchemy import func, desc, or_
from typing import List, Optional
from decimal import Decimal
from datetime import datetime, timezone
import statistics

from app.models.equipment import Equipment
from app.models.site import Site
from app.models.operator import Operator
from app.models.rental import Rental
from app.models.usage_log import UsageLog
from app.models.alert import Alert
from app.schemas.analytics import (
    EquipmentUtilization,
    SiteAnalytics,
    DailyUsagePoint,
    EquipmentPerformance
)
from app.schemas.usage import UsageLogResponse

def calculate_utilization_metrics(engine_hrs: Decimal, idle_hrs: Decimal) -> tuple[float, float, Decimal]:
    total_usage = engine_hrs + idle_hrs
    total_f = float(total_usage)
    if total_f <= 0.0:
        return 0.0, 0.0, total_usage
    
    eng_f = float(engine_hrs)
    idl_f = float(idle_hrs)
    util_rate = round((eng_f / total_f) * 100.0, 1)
    idle_pct = round((idl_f / total_f) * 100.0, 1)
    return util_rate, idle_pct, total_usage

def generate_business_insight(eq_id: str, eq_type: str, util_rate: float, idle_pct: float, total_engine: Decimal, total_idle: Decimal, site_name: Optional[str], is_unassigned: bool) -> str:
    if is_unassigned or not site_name:
        return f"{eq_id} ({eq_type}) is currently unassigned with no active job site or certified operator, despite accumulating standby idle hours."
    
    if total_engine == 0 and total_idle > 0:
        return f"{eq_id} has 0 operating engine hours while logging {total_idle} idle hours at {site_name}. Immediate investigation recommended."

    if idle_pct >= 75.0:
        return f"{eq_id} is spending {idle_pct}% of rental time idling ({total_idle} idle hrs vs {total_engine} engine hrs). Consider downsizing or pausing rental contract to save costs."
    elif idle_pct >= 60.0:
        return f"{eq_id} has moderate-high idle time ({idle_pct}%). Review site {site_name} staging and dispatch workflows to boost machine utilization."
    elif util_rate >= 80.0:
        return f"{eq_id} has outstanding utilization ({util_rate}% active engine load). Operating at peak efficiency on {site_name}."
    else:
        return f"{eq_id} is operating within normal rental utilization parameters ({util_rate}% engine load, {idle_pct}% idle) at {site_name}."

def get_fleet_utilization(
    db: Session,
    equipment_id: Optional[str] = None,
    equipment_type: Optional[str] = None,
    site_id: Optional[str] = None,
    rental_id: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None
) -> List[EquipmentUtilization]:
    query = db.query(Equipment)
    if equipment_id:
        query = query.filter(Equipment.equipment_id == equipment_id)
    if equipment_type:
        query = query.filter(func.lower(Equipment.equipment_type) == equipment_type.lower())
    if site_id:
        query = query.filter(Equipment.current_site_id == site_id)

    equipments = query.order_by(Equipment.equipment_id).all()
    results = []

    for eq in equipments:
        usage_query = db.query(
            func.coalesce(func.sum(UsageLog.engine_hours), 0),
            func.coalesce(func.sum(UsageLog.idle_hours), 0),
            func.coalesce(func.sum(UsageLog.fuel_used), 0)
        ).filter(UsageLog.equipment_id == eq.equipment_id)

        if rental_id:
            usage_query = usage_query.filter(UsageLog.rental_id == rental_id)
        if start_date:
            usage_query = usage_query.filter(UsageLog.timestamp >= start_date)
        if end_date:
            usage_query = usage_query.filter(UsageLog.timestamp <= end_date)

        engine_sum, idle_sum, fuel_sum = usage_query.first()
        eng_dec = Decimal(str(engine_sum))
        idl_dec = Decimal(str(idle_sum))
        fuel_dec = Decimal(str(fuel_sum))

        util_rate, idle_pct, total_usage = calculate_utilization_metrics(eng_dec, idl_dec)
        
        site_name = eq.current_site.site_name if eq.current_site else None
        operator_name = eq.current_operator.operator_name if eq.current_operator else None
        is_unassigned = eq.status == "UNASSIGNED" or (eq.current_site_id is None and eq.current_operator_id is None)

        insight = generate_business_insight(
            eq.equipment_id, eq.equipment_type, util_rate, idle_pct, eng_dec, idl_dec, site_name, is_unassigned
        )

        results.append(EquipmentUtilization(
            equipment_id=eq.equipment_id,
            equipment_type=eq.equipment_type,
            site_id=eq.current_site_id,
            site_name=site_name,
            operator_id=eq.current_operator_id,
            operator_name=operator_name,
            rental_status=eq.status,
            engine_hours=eng_dec,
            idle_hours=idl_dec,
            total_usage_hours=total_usage,
            fuel_used=fuel_dec,
            utilization_rate=util_rate,
            idle_percentage=idle_pct,
            insight_summary=insight
        ))

    return results

def get_equipment_utilization_single(db: Session, equipment_id: str) -> Optional[EquipmentUtilization]:
    results = get_fleet_utilization(db, equipment_id=equipment_id)
    return results[0] if results else None

def get_site_analytics(db: Session) -> List[SiteAnalytics]:
    sites = db.query(Site).order_by(Site.site_id).all()
    results = []

    for site in sites:
        assigned_eqs = db.query(Equipment.equipment_id).filter(Equipment.current_site_id == site.site_id).all()
        eq_ids = [e[0] for e in assigned_eqs]
        eq_count = len(eq_ids)

        active_rentals = db.query(func.count(Rental.rental_id)).filter(
            Rental.site_id == site.site_id,
            Rental.status == "ACTIVE"
        ).scalar() or 0

        if eq_ids:
            engine_sum, idle_sum, fuel_sum = db.query(
                func.coalesce(func.sum(UsageLog.engine_hours), 0),
                func.coalesce(func.sum(UsageLog.idle_hours), 0),
                func.coalesce(func.sum(UsageLog.fuel_used), 0)
            ).filter(UsageLog.equipment_id.in_(eq_ids)).first()
        else:
            engine_sum, idle_sum, fuel_sum = 0, 0, 0

        eng_dec = Decimal(str(engine_sum))
        idl_dec = Decimal(str(idle_sum))
        fuel_dec = Decimal(str(fuel_sum))

        util_rate, _, _ = calculate_utilization_metrics(eng_dec, idl_dec)

        results.append(SiteAnalytics(
            site_id=site.site_id,
            site_name=site.site_name,
            location=site.location,
            equipment_count=eq_count,
            active_rentals=active_rentals,
            total_engine_hours=eng_dec,
            total_idle_hours=idl_dec,
            total_fuel_used=fuel_dec,
            average_utilization=util_rate
        ))

    return results

def get_daily_usage_trend(db: Session, equipment_id: str) -> List[DailyUsagePoint]:
    logs = db.query(UsageLog).filter(
        UsageLog.equipment_id == equipment_id
    ).order_by(UsageLog.timestamp.asc()).all()

    # Group by date string YYYY-MM-DD
    grouped = {}
    for log in logs:
        d_str = log.timestamp.strftime("%Y-%m-%d")
        if d_str not in grouped:
            grouped[d_str] = {"engine": 0.0, "idle": 0.0, "fuel": 0.0}
        grouped[d_str]["engine"] += float(log.engine_hours)
        grouped[d_str]["idle"] += float(log.idle_hours)
        grouped[d_str]["fuel"] += float(log.fuel_used)

    points = []
    for d_str, val in sorted(grouped.items()):
        total = val["engine"] + val["idle"]
        u_rate = round((val["engine"] / total) * 100.0, 1) if total > 0 else 0.0
        points.append(DailyUsagePoint(
            date=d_str,
            engine_hours=round(val["engine"], 2),
            idle_hours=round(val["idle"], 2),
            fuel_used=round(val["fuel"], 2),
            utilization_rate=u_rate
        ))

    return points

def get_equipment_performance(db: Session, equipment_id: str) -> Optional[EquipmentPerformance]:
    eq = db.query(Equipment).filter(Equipment.equipment_id == equipment_id).first()
    if not eq:
        return None

    util_info = get_equipment_utilization_single(db, equipment_id)
    if not util_info:
        return None

    daily_points = get_daily_usage_trend(db, equipment_id)

    # Calculate average daily hours
    days_count = len(daily_points)
    avg_eng = round(float(util_info.engine_hours) / days_count, 1) if days_count > 0 else 0.0
    avg_idl = round(float(util_info.idle_hours) / days_count, 1) if days_count > 0 else 0.0

    highest_eng = max(daily_points, key=lambda p: p.engine_hours) if daily_points else None
    highest_idl = max(daily_points, key=lambda p: p.idle_hours) if daily_points else None

    # Active rental
    active_rental = db.query(Rental).filter(
        Rental.equipment_id == equipment_id,
        Rental.status == "ACTIVE"
    ).order_by(desc(Rental.checkout_date)).first()

    # Active unresolved alerts
    active_alerts = db.query(Alert).filter(
        Alert.equipment_id == equipment_id,
        Alert.resolved == False
    ).all()
    anomaly_messages = [a.message for a in active_alerts]

    # Recent 15 logs
    recent_logs = db.query(UsageLog).filter(
        UsageLog.equipment_id == equipment_id
    ).order_by(desc(UsageLog.timestamp)).limit(15).all()

    return EquipmentPerformance(
        equipment_id=eq.equipment_id,
        equipment_type=eq.equipment_type,
        status=eq.status,
        site_id=eq.current_site_id,
        site_name=eq.current_site.site_name if eq.current_site else None,
        operator_id=eq.current_operator_id,
        operator_name=eq.current_operator.operator_name if eq.current_operator else None,
        rental_id=active_rental.rental_id if active_rental else None,
        checkout_date=active_rental.checkout_date if active_rental else None,
        expected_return=active_rental.expected_checkin_date if active_rental else None,
        total_engine_hours=util_info.engine_hours,
        total_idle_hours=util_info.idle_hours,
        total_fuel_used=util_info.fuel_used,
        utilization_rate=util_info.utilization_rate,
        idle_percentage=util_info.idle_percentage,
        avg_engine_hours_day=avg_eng,
        avg_idle_hours_day=avg_idl,
        highest_engine_day=highest_eng,
        highest_idle_day=highest_idl,
        business_insight=util_info.insight_summary,
        active_anomalies=anomaly_messages,
        daily_trend=daily_points,
        recent_logs=[UsageLogResponse.model_validate(l) for l in recent_logs]
    )
