from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from app.db.session import get_db
from app.models.site import Site
from app.models.equipment import Equipment
from app.schemas.site import SiteResponse

router = APIRouter(prefix="/sites", tags=["Site Management"])

@router.get("", response_model=List[SiteResponse], summary="List All Job Sites")
def list_sites(db: Session = Depends(get_db)):
    sites = db.query(Site).order_by(Site.site_id).all()
    results = []
    for site in sites:
        active_count = db.query(func.count(Equipment.equipment_id)).filter(Equipment.current_site_id == site.site_id).scalar() or 0
        resp = SiteResponse(
            site_id=site.site_id,
            site_name=site.site_name,
            location=site.location,
            latitude=site.latitude,
            longitude=site.longitude,
            created_at=site.created_at,
            active_equipment_count=active_count
        )
        results.append(resp)
    return results

@router.get("/{site_id}", response_model=SiteResponse, summary="Get Site Details")
def get_site(site_id: str, db: Session = Depends(get_db)):
    site = db.query(Site).filter(Site.site_id == site_id).first()
    if not site:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Site with ID '{site_id}' not found."
        )
    active_count = db.query(func.count(Equipment.equipment_id)).filter(Equipment.current_site_id == site.site_id).scalar() or 0
    return SiteResponse(
        site_id=site.site_id,
        site_name=site.site_name,
        location=site.location,
        latitude=site.latitude,
        longitude=site.longitude,
        created_at=site.created_at,
        active_equipment_count=active_count
    )
