from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.api.v1 import api_v1_router
from app.db.session import engine
from sqlalchemy import text
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("cat_rental_app")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup verification
    logger.info("Starting up Smart Rental Tracking System backend...")
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        logger.info("Successfully connected to PostgreSQL database.")
    except Exception as e:
        logger.warning(f"Database connection during startup check: {e}")
    yield
    # Shutdown
    logger.info("Shutting down Smart Rental Tracking System backend...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Smart Rental Tracking System API - Caterpillar Hiring Hackathon (Phase 1 Foundation)",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else [settings.CORS_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(api_v1_router)

@app.get("/", tags=["Root"])
def root():
    return {
        "message": "Welcome to Smart Rental Tracking System API",
        "system": "Caterpillar Hackathon Prototype",
        "phase": "Phase 1 - Foundation & Database",
        "docs": "/docs",
        "health": "/api/health"
    }
