from fastapi import APIRouter
from app.api.v1.health import router as health_router
from app.api.v1.equipment import router as equipment_router
from app.api.v1.sites import router as sites_router
from app.api.v1.operators import router as operators_router
from app.api.v1.rentals import router as rentals_router
from app.api.v1.usage import router as usage_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.analytics import router as analytics_router
from app.api.v1.alerts import router as alerts_router
from app.api.v1.forecasts import router as forecasts_router
from app.api.v1.recommendations import router as recommendations_router
from app.api.v1.demo import router as demo_router

api_router = APIRouter(prefix="/api")

api_router.include_router(health_router)
api_router.include_router(dashboard_router)
api_router.include_router(equipment_router)
api_router.include_router(sites_router)
api_router.include_router(operators_router)
api_router.include_router(rentals_router)
api_router.include_router(usage_router)
api_router.include_router(analytics_router)
api_router.include_router(alerts_router)
api_router.include_router(forecasts_router)
api_router.include_router(recommendations_router)
api_router.include_router(demo_router)

api_v1_router = api_router
