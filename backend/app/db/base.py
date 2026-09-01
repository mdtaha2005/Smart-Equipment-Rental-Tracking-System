# Import Base and all models so Alembic can discover them for migrations
from app.db.session import Base
from app.models.site import Site
from app.models.operator import Operator
from app.models.equipment import Equipment
from app.models.rental import Rental
from app.models.usage_log import UsageLog
from app.models.alert import Alert
from app.models.forecast import ForecastData
from app.models.recommendation import Recommendation

__all__ = [
    "Base",
    "Site",
    "Operator",
    "Equipment",
    "Rental",
    "UsageLog",
    "Alert",
    "ForecastData",
    "Recommendation"
]
