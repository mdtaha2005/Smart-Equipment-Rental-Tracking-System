from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.db.session import get_db
from app.schemas.demo import DemoResetResponse, ExecutiveSummaryResponse
from app.db.seed import seed_database
from app.models.alert import Alert
from app.models.forecast import ForecastData
from app.models.recommendation import Recommendation
from app.models.equipment import Equipment
from app.services.analytics_service import get_fleet_utilization
from app.services.forecast_service import generate_forecasts
from app.services.recommendation_service import generate_recommendations
from app.services.alert_service import generate_alerts

router = APIRouter(prefix="/demo", tags=["Demo Mode & Utilities"])

@router.post("/reset", response_model=DemoResetResponse, summary="Reset Demo Data to Clean Baseline")
def reset_demo_data_endpoint(db: Session = Depends(get_db)):
    """
    Safely resets demo environment to the baseline Caterpillar challenge dataset.
    Cleans up transient test anomalies/recommendations and re-executes idempotent seed data.
    """
    try:
        # Clear generated alerts, recommendations, and forecast data for clean state
        db.query(Alert).delete()
        db.query(Recommendation).delete()
        db.query(ForecastData).delete()
        db.commit()

        # Re-execute baseline seed data
        seed_stats = seed_database(db, reset_existing=True)

        # Regenerate fresh baseline alerts, forecasts, and recommendations
        generate_alerts(db)
        generate_forecasts(db, horizon_days=7)
        generate_recommendations(db)

        # Verify challenge equipment integrity
        eq_count = db.query(Equipment).filter(
            Equipment.equipment_id.in_(["EQX1001", "EQX1002", "EQX1003", "EQX1004", "EQX1005", "EQX1006", "EQX1007"])
        ).count()

        return DemoResetResponse(
            status="success",
            message="Demonstration database successfully reset to clean baseline Caterpillar challenge state.",
            timestamp=datetime.now(timezone.utc),
            entities_restored=seed_stats,
            challenge_records_verified=(eq_count == 7)
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to reset demo baseline: {str(e)}"
        )

@router.get("/summary", response_model=ExecutiveSummaryResponse, summary="Dynamic Executive Summary")
def get_executive_summary_endpoint(db: Session = Depends(get_db)):
    """
    Dynamically generates a natural-language executive summary for the customer rental manager.
    """
    fleet_utils = get_fleet_utilization(db)
    active_alerts = db.query(Alert).filter(Alert.resolved == False).all()
    active_recs = db.query(Recommendation).filter(Recommendation.status == "PENDING").all()

    total_eq = len(fleet_utils)
    deployed_sites = len(set(item.site_id for item in fleet_utils if item.site_id is not None))
    
    if total_eq > 0:
        avg_util = round(sum(item.utilization_rate for item in fleet_utils) / total_eq, 1)
    else:
        avg_util = 0.0

    high_idle_cnt = sum(1 for item in fleet_utils if item.idle_percentage >= 70.0)
    attention_cnt = len(active_alerts)
    redeploy_cnt = sum(1 for r in active_recs if "REDEPLOY" in (r.reason or "").upper() or (r.recommended_site_id and r.current_site_id != r.recommended_site_id))

    # Construct dynamic natural-language narrative
    narrative = (
        f"{total_eq} rented machines are currently under management across {deployed_sites} Texas job sites. "
        f"Average fleet utilization is {avg_util}%. "
        f"{attention_cnt} operational alert{'s require' if attention_cnt != 1 else ' requires'} manager attention. "
        f"{redeploy_cnt} machine{' is' if redeploy_cnt == 1 else 's are'} candidate{'s' if redeploy_cnt != 1 else ''} for redeployment to eliminate idle rental waste."
    )

    return ExecutiveSummaryResponse(
        total_rented_equipment=total_eq,
        deployed_sites_count=deployed_sites,
        average_utilization_pct=avg_util,
        high_idle_count=high_idle_cnt,
        attention_required_count=attention_cnt,
        redeploy_candidate_count=redeploy_cnt,
        summary_narrative=narrative
    )
