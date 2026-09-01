from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.db.session import get_db
from app.schemas.analytics import (
    EquipmentUtilization,
    SiteAnalytics,
    DailyUsagePoint,
    EquipmentPerformance
)
from app.services.analytics_service import (
    get_fleet_utilization,
    get_equipment_utilization_single,
    get_site_analytics,
    get_daily_usage_trend,
    get_equipment_performance
)

router = APIRouter(prefix="/analytics", tags=["Customer Analytics"])

@router.get("/utilization", response_model=List[EquipmentUtilization])
def get_utilization_endpoint(
    equipment_id: Optional[str] = Query(None, description="Filter by equipment ID"),
    equipment_type: Optional[str] = Query(None, description="Filter by equipment type"),
    site_id: Optional[str] = Query(None, description="Filter by site ID"),
    rental_id: Optional[str] = Query(None, description="Filter by rental contract ID"),
    start_date: Optional[datetime] = Query(None, description="Filter logs starting from"),
    end_date: Optional[datetime] = Query(None, description="Filter logs ending at"),
    db: Session = Depends(get_db)
):
    """
    Retrieve deterministic utilization rates and idle percentages for customer-rented equipment.
    """
    return get_fleet_utilization(
        db=db,
        equipment_id=equipment_id,
        equipment_type=equipment_type,
        site_id=site_id,
        rental_id=rental_id,
        start_date=start_date,
        end_date=end_date
    )

@router.get("/utilization/{equipment_id}", response_model=EquipmentUtilization)
def get_single_utilization_endpoint(
    equipment_id: str,
    db: Session = Depends(get_db)
):
    """
    Retrieve utilization information for an individual equipment asset.
    """
    data = get_equipment_utilization_single(db, equipment_id)
    if not data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Equipment '{equipment_id}' not found in fleet."
        )
    return data

@router.get("/sites", response_model=List[SiteAnalytics])
def get_site_analytics_endpoint(
    db: Session = Depends(get_db)
):
    """
    Calculate site-by-site machine deployment count, engine/idle hours, and average operating utilization.
    """
    return get_site_analytics(db)

@router.get("/equipment/{equipment_id}/performance", response_model=EquipmentPerformance)
def get_equipment_performance_endpoint(
    equipment_id: str,
    db: Session = Depends(get_db)
):
    """
    Comprehensive equipment performance analysis, highest usage days, daily trend, and explainable business insights.
    """
    perf = get_equipment_performance(db, equipment_id)
    if not perf:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Performance metrics for equipment '{equipment_id}' could not be computed."
        )
    return perf

@router.get("/equipment/{equipment_id}/daily", response_model=List[DailyUsagePoint])
def get_daily_usage_trend_endpoint(
    equipment_id: str,
    db: Session = Depends(get_db)
):
    """
    Daily aggregated telemetry history for chart visualization.
    """
    return get_daily_usage_trend(db, equipment_id)
