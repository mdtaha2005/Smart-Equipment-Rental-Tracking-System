from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.session import get_db
from app.schemas.recommendation import (
    RecommendationResponse,
    RecommendationStatusUpdate,
    RecommendationGenerationSummary
)
from app.services.recommendation_service import (
    generate_recommendations,
    list_recommendations,
    get_recommendation,
    update_recommendation_status
)

router = APIRouter(prefix="/recommendations", tags=["Smart Equipment Recommendations"])

@router.get("", response_model=List[RecommendationResponse])
def get_recommendations_endpoint(
    equipment_id: Optional[str] = Query(None, description="Filter by equipment ID"),
    status: Optional[str] = Query(None, description="Filter by status (PENDING, ACCEPTED, DISMISSED)"),
    priority: Optional[str] = Query(None, description="Filter by priority (LOW, MEDIUM, HIGH, CRITICAL)"),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """
    Query smart equipment recommendations for customer rental optimization.
    """
    return list_recommendations(
        db=db,
        equipment_id=equipment_id,
        status=status,
        priority=priority,
        limit=limit,
        offset=offset
    )

@router.post("/generate", response_model=RecommendationGenerationSummary, status_code=status.HTTP_201_CREATED)
def generate_recommendations_endpoint(
    db: Session = Depends(get_db)
):
    """
    Idempotent recommendation engine:
    Cross-references underutilized rented machinery with site demand forecasts to produce explainable actions.
    """
    return generate_recommendations(db)

@router.get("/{recommendation_id}", response_model=RecommendationResponse)
def get_single_recommendation_endpoint(
    recommendation_id: str,
    db: Session = Depends(get_db)
):
    """
    Retrieve an individual recommendation by ID.
    """
    rec = get_recommendation(db, recommendation_id)
    if not rec:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Recommendation with ID '{recommendation_id}' not found."
        )
    return rec

@router.patch("/{recommendation_id}", response_model=RecommendationResponse)
def update_recommendation_endpoint(
    recommendation_id: str,
    payload: RecommendationStatusUpdate,
    db: Session = Depends(get_db)
):
    """
    Record customer manager decision (ACCEPT or DISMISS) without automatically relocating equipment.
    """
    valid_statuses = ["ACCEPTED", "DISMISSED", "PENDING"]
    norm_status = payload.status.upper()
    if norm_status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Status must be one of {valid_statuses}."
        )

    rec = update_recommendation_status(db, recommendation_id, norm_status)
    if not rec:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Recommendation with ID '{recommendation_id}' not found."
        )
    return rec
