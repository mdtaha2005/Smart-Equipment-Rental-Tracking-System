from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from app.db.session import get_db
from app.schemas.forecast import (
    ForecastResponse,
    SiteForecastSummary,
    ForecastMatrixPoint,
    ForecastGenerationSummary
)
from app.services.forecast_service import (
    generate_forecasts,
    list_forecasts,
    get_site_forecast_summaries,
    get_site_forecast_matrix
)

router = APIRouter(prefix="/forecasts", tags=["Predictive Demand Forecasting"])

@router.get("", response_model=List[ForecastResponse])
def get_forecasts_endpoint(
    site_id: Optional[str] = Query(None, description="Filter by site ID"),
    equipment_type: Optional[str] = Query(None, description="Filter by equipment type"),
    demand_level: Optional[str] = Query(None, description="Filter by demand level (LOW, MEDIUM, HIGH)"),
    start_date: Optional[date] = Query(None, description="Start date"),
    end_date: Optional[date] = Query(None, description="End date"),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """
    Retrieve predictive demand forecast records.
    """
    return list_forecasts(
        db=db,
        site_id=site_id,
        equipment_type=equipment_type,
        demand_level=demand_level,
        start_date=start_date,
        end_date=end_date,
        limit=limit,
        offset=offset
    )

@router.get("/sites", response_model=List[SiteForecastSummary])
def get_site_forecast_summaries_endpoint(
    db: Session = Depends(get_db)
):
    """
    Retrieve aggregated predictive demand summaries across all customer job sites.
    """
    return get_site_forecast_summaries(db)

@router.get("/matrix", response_model=List[ForecastMatrixPoint])
def get_forecast_matrix_endpoint(
    db: Session = Depends(get_db)
):
    """
    Retrieve Site x Equipment Type predictive demand matrix for heatmap visualization.
    """
    return get_site_forecast_matrix(db)

@router.get("/{site_id}", response_model=List[ForecastResponse])
def get_single_site_forecasts_endpoint(
    site_id: str,
    db: Session = Depends(get_db)
):
    """
    Retrieve forecast records for a specific construction job site.
    """
    fcsts = list_forecasts(db, site_id=site_id)
    if not fcsts:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No forecast records found for site '{site_id}'."
        )
    return fcsts

@router.post("/generate", response_model=ForecastGenerationSummary, status_code=status.HTTP_201_CREATED)
def generate_forecasts_endpoint(
    horizon_days: int = Query(7, ge=1, le=30, description="Forecast horizon in days (e.g. 7, 14, 30)"),
    db: Session = Depends(get_db)
):
    """
    Idempotent ML-assisted demand forecasting engine:
    Retrains Random Forest regressor on latest telematics and persists demand predictions.
    """
    return generate_forecasts(db, horizon_days=horizon_days)
