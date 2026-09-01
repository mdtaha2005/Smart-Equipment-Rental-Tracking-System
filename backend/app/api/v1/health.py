from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
import time
from datetime import datetime, timezone
from app.db.session import get_db
from app.schemas.health import HealthResponse, DatabaseHealthResponse
from app.core.config import settings

router = APIRouter(prefix="/health", tags=["Health & Diagnostics"])

MANAGED_TABLES = [
    "sites",
    "operators",
    "equipment",
    "rentals",
    "usage_logs",
    "alerts",
    "forecast_data",
    "recommendations"
]

@router.get("", response_model=HealthResponse, summary="Application Health Check")
def health_check(db: Session = Depends(get_db)):
    """
    Basic application health check.
    Validates backend availability and verifies database connectivity.
    """
    db_status = "healthy"
    table_counts = {}
    try:
        # Quick ping
        db.execute(text("SELECT 1"))
        for table in MANAGED_TABLES:
            try:
                res = db.execute(text(f"SELECT COUNT(*) FROM {table}")).scalar()
                table_counts[table] = res
            except Exception:
                table_counts[table] = 0
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    return HealthResponse(
        status="healthy",
        database="healthy" if "unhealthy" not in db_status else "unhealthy",
        timestamp=datetime.now(timezone.utc).isoformat(),
        environment=settings.ENVIRONMENT,
        version="1.0.0",
        tables=table_counts if db_status == "healthy" else None
    )

@router.get("/db", response_model=DatabaseHealthResponse, summary="Database Connection & Schema Diagnostics")
def database_health_check(db: Session = Depends(get_db)):
    """
    Deep database health check.
    Measures round-trip latency, validates tables, and returns exact row counts.
    """
    start_time = time.perf_counter()
    try:
        # Execute test query and measure latency
        db.execute(text("SELECT 1"))
        latency_ms = round((time.perf_counter() - start_time) * 1000, 2)
        
        # Verify managed tables and fetch counts
        row_counts = {}
        found_tables = []
        for table in MANAGED_TABLES:
            try:
                count = db.execute(text(f"SELECT COUNT(*) FROM {table}")).scalar()
                row_counts[table] = count
                found_tables.append(table)
            except Exception:
                pass

        return DatabaseHealthResponse(
            status="healthy",
            database_type="PostgreSQL",
            latency_ms=latency_ms,
            timestamp=datetime.now(timezone.utc).isoformat(),
            tables_count=len(found_tables),
            table_names=found_tables,
            row_counts=row_counts
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Database connection failed: {str(e)}"
        )
