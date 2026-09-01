from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from typing import List, Optional
from datetime import datetime, timezone
from decimal import Decimal
import uuid

from app.models.equipment import Equipment
from app.models.site import Site
from app.models.recommendation import Recommendation
from app.schemas.recommendation import (
    RecommendationResponse,
    RecommendationGenerationSummary
)
from app.services.analytics_service import get_fleet_utilization
from app.services.forecast_service import train_and_predict_demand_model, _classify_demand

def _infer_recommendation_type(reason: str, rec: Recommendation) -> str:
    r_upper = (reason or "").upper()
    if rec.current_site_id and rec.recommended_site_id and rec.current_site_id != rec.recommended_site_id:
        return "REDEPLOY"
    if "REDEPLOY" in r_upper:
        return "REDEPLOY"
    if "RETURN" in r_upper or "DOWNSIZE" in r_upper:
        return "RETURN_OR_DOWNSIZE"
    if "ASSIGN" in r_upper:
        return "ASSIGN"
    if "RETAIN" in r_upper:
        return "RETAIN"
    return "MONITOR"

def _map_recommendation_response(rec: Recommendation) -> RecommendationResponse:
    eq_type = rec.equipment.equipment_type if rec.equipment else None
    cur_site = rec.current_site.site_name if rec.current_site else "Unassigned (In Yard)"
    rec_site = rec.recommended_site.site_name if rec.recommended_site else None
    rec_type = _infer_recommendation_type(rec.reason, rec)

    gain = float(rec.expected_utilization_gain) if rec.expected_utilization_gain is not None else None

    return RecommendationResponse(
        recommendation_id=rec.recommendation_id,
        equipment_id=rec.equipment_id,
        equipment_type=eq_type,
        current_site_id=rec.current_site_id,
        current_site_name=cur_site,
        recommended_site_id=rec.recommended_site_id,
        recommended_site_name=rec_site,
        recommendation_type=rec_type,
        reason=rec.reason,
        expected_utilization_gain=gain,
        priority=rec.priority,
        status=rec.status,
        created_at=rec.created_at
    )

def generate_recommendations(db: Session) -> RecommendationGenerationSummary:
    fleet_utils = get_fleet_utilization(db)
    demand_predictions = train_and_predict_demand_model(db)
    sites = db.query(Site).all()
    site_dict = {s.site_id: s.site_name for s in sites}

    created_count = 0
    updated_count = 0
    generated_records = []

    for item in fleet_utils:
        eq_id = item.equipment_id
        eq_type = item.equipment_type
        cur_site_id = item.site_id
        cur_site_name = item.site_name or "Unassigned (In Yard)"
        util = item.utilization_rate
        idle_pct = item.idle_percentage

        # Find alternate site with highest predicted demand for this equipment type
        best_target_site_id = None
        best_target_score = 0.0

        for s_id, type_scores in demand_predictions.items():
            if s_id != cur_site_id:
                score = type_scores.get(eq_type, 0.0)
                if score > best_target_score:
                    best_target_score = score
                    best_target_site_id = s_id

        target_site_name = site_dict.get(best_target_site_id, "High Demand Job Site") if best_target_site_id else None
        target_demand_level = _classify_demand(best_target_score)

        rec_type = "MONITOR"
        priority = "LOW"
        reason = ""
        gain = None
        target_site = None

        # 1. Unassigned in Yard
        if cur_site_id is None or item.rental_status == "UNASSIGNED":
            rec_type = "ASSIGN"
            priority = "HIGH"
            target_site = best_target_site_id if best_target_score >= 0.40 else None
            reason = (
                f"{eq_id} ({eq_type}) is currently rented but unassigned without a job site or certified operator, "
                f"accumulating standby idle hours. Consider assigning to {target_site_name or 'an active project site'} or completing return check-in."
            )

        # 2. Redeploy: Underutilized machine where another site has higher demand
        elif (util < 40.0 or idle_pct >= 70.0) and best_target_site_id and best_target_score >= 0.35:
            rec_type = "REDEPLOY"
            priority = "HIGH" if target_demand_level == "HIGH" else "MEDIUM"
            target_site = best_target_site_id
            gain = round(max((best_target_score * 100.0) - util, 15.0), 1)
            reason = (
                f"{eq_id} ({eq_type}) is currently operating at {util:.1f}% utilization at {cur_site_name}, "
                f"with {idle_pct:.1f}% of recorded time idle. {target_site_name} has {target_demand_level} predicted demand "
                f"for {eq_type.lower()}s. Consider redeploying this machine from {cur_site_name} to {target_site_name} to satisfy project requirements and eliminate idle rental waste."
            )

        # 3. Return or Downsize: Severe idle waste and no high demand elsewhere
        elif idle_pct >= 75.0:
            rec_type = "RETURN_OR_DOWNSIZE"
            priority = "MEDIUM"
            reason = (
                f"{eq_id} ({eq_type}) has spent {idle_pct:.1f}% of its rental period idling at {cur_site_name} ({item.idle_hours} idle hrs vs {item.engine_hours} engine hrs). "
                f"With no immediate high-demand redeployment opportunities, consider returning or downsizing to save rental budget."
            )

        # 4. Retain: Peak productivity
        elif util >= 80.0 and cur_site_id:
            rec_type = "RETAIN"
            priority = "LOW"
            reason = (
                f"{eq_id} ({eq_type}) is performing at peak efficiency ({util:.1f}% active engine load) at {cur_site_name}. "
                f"Retain deployment through current project phase."
            )

        # 5. Monitor: Normal parameters
        else:
            rec_type = "MONITOR"
            priority = "LOW"
            reason = (
                f"{eq_id} ({eq_type}) is operating within acceptable utilization bounds ({util:.1f}% util, {idle_pct:.1f}% idle) at {cur_site_name}. "
                f"Continue monitoring telematics."
            )

        # Check existing active (PENDING or ACCEPTED) recommendation for this machine
        existing_rec = db.query(Recommendation).filter(
            Recommendation.equipment_id == eq_id,
            Recommendation.status.in_(["PENDING", "ACCEPTED"])
        ).first()

        gain_dec = Decimal(str(gain)) if gain is not None else None

        if existing_rec:
            existing_rec.current_site_id = cur_site_id
            existing_rec.recommended_site_id = target_site
            existing_rec.reason = reason
            existing_rec.expected_utilization_gain = gain_dec
            existing_rec.priority = priority
            updated_count += 1
            generated_records.append(existing_rec)
        else:
            rec_id = f"REC-{eq_id}-{rec_type[:3].upper()}-{uuid.uuid4().hex[:4].upper()}"
            new_rec = Recommendation(
                recommendation_id=rec_id,
                equipment_id=eq_id,
                current_site_id=cur_site_id,
                recommended_site_id=target_site,
                reason=reason,
                expected_utilization_gain=gain_dec,
                priority=priority,
                status="PENDING"
            )
            db.add(new_rec)
            created_count += 1
            generated_records.append(new_rec)

    db.commit()

    all_active = db.query(Recommendation).filter(
        Recommendation.status.in_(["PENDING", "ACCEPTED"])
    ).order_by(desc(Recommendation.created_at)).all()

    return RecommendationGenerationSummary(
        recommendations_created=created_count,
        recommendations_updated=updated_count,
        total_active_recommendations=len(all_active),
        recommendations=[_map_recommendation_response(r) for r in all_active]
    )

def list_recommendations(
    db: Session,
    equipment_id: Optional[str] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    limit: int = 100,
    offset: int = 0
) -> List[RecommendationResponse]:
    query = db.query(Recommendation)
    if equipment_id:
        query = query.filter(Recommendation.equipment_id == equipment_id)
    if status:
        query = query.filter(Recommendation.status == status.upper())
    if priority:
        query = query.filter(Recommendation.priority == priority.upper())

    recs = query.order_by(desc(Recommendation.created_at)).offset(offset).limit(limit).all()
    return [_map_recommendation_response(r) for r in recs]

def get_recommendation(db: Session, rec_id: str) -> Optional[RecommendationResponse]:
    rec = db.query(Recommendation).filter(Recommendation.recommendation_id == rec_id).first()
    return _map_recommendation_response(rec) if rec else None

def update_recommendation_status(db: Session, rec_id: str, new_status: str) -> Optional[RecommendationResponse]:
    rec = db.query(Recommendation).filter(Recommendation.recommendation_id == rec_id).first()
    if not rec:
        return None

    rec.status = new_status.upper()
    db.commit()
    db.refresh(rec)
    return _map_recommendation_response(rec)
