from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.api.v1 import api_v1_router
from app.db.session import engine, SessionLocal
from app.db.base import Base
from app.db.seed import seed_database_data
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("cat_rental_app")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup verification & auto-initialization
    logger.info("Starting up Smart Rental Tracking System backend...")
    try:
        # Automatically create tables in PostgreSQL if not present
        Base.metadata.create_all(bind=engine)
        logger.info("Database schema tables verified/created successfully.")

        # Auto-seed database if empty
        db = SessionLocal()
        try:
            from app.models.equipment import Equipment
            count = db.query(Equipment).count()
            if count == 0:
                logger.info("Database is empty. Auto-seeding Caterpillar demo data...")
                seed_database_data(db)
                logger.info("Auto-seeding complete.")
            else:
                logger.info(f"Database already contains {count} equipment records.")
        finally:
            db.close()
    except Exception as e:
        logger.warning(f"Database initialization check: {e}")
    yield
    # Shutdown
    logger.info("Shutting down Smart Rental Tracking System backend...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Smart Rental Tracking System API - Caterpillar Hiring Hackathon",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration - completely unrestricted for cloud production (Vercel, Render, Localhost)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_origin_regex=".*",
    allow_credentials=False,
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
        "phase": "Phase 5 - Verified Ready",
        "docs": "/docs",
        "health": "/api/health"
    }
