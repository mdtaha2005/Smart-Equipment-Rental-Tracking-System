import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(backend_dir))

from app.db.session import SessionLocal
from app.db.seed import seed_database
from app.models.alert import Alert
from app.models.forecast import ForecastData
from app.models.recommendation import Recommendation
from app.services.alert_service import generate_alerts
from app.services.forecast_service import generate_forecasts
from app.services.recommendation_service import generate_recommendations

def reset_demo():
    print("=" * 66)
    print("RESTORING DEMO DATABASE TO CLEAN CATERPILLAR CHALLENGE BASELINE")
    print("=" * 66)
    db = SessionLocal()
    try:
        print("[1/4] Clearing transient alerts, forecasts, and recommendations...")
        db.query(Alert).delete()
        db.query(Recommendation).delete()
        db.query(ForecastData).delete()
        db.commit()

        print("[2/4] Verifying and reseeding challenge dataset...")
        stats = seed_database(db, reset_existing=True)
        print(f"      Restored: Sites={stats['sites_created']+stats['sites_existing']}, "
              f"Operators={stats['operators_created']+stats['operators_existing']}, "
              f"Equipment={stats['equipment_created']+stats['equipment_existing']}, "
              f"Rentals={stats['rentals_created']+stats['rentals_existing']}, "
              f"UsageLogs={stats['usage_logs_created']+stats['usage_logs_existing']}")

        print("[3/4] Generating baseline operational alerts...")
        a_stats = generate_alerts(db)
        print(f"      Generated {a_stats.alerts_created} active alerts across fleet.")

        print("[4/4] Retraining ML demand forecast model and generating recommendations...")
        f_stats = generate_forecasts(db, horizon_days=7)
        r_stats = generate_recommendations(db)
        print(f"      Generated {f_stats.forecasts_generated} forecasts and {r_stats.total_active_recommendations} recommendations.")

        print("\n>>> DEMO BASELINE STATE SUCCESSFULLY RESTORED AND READY! <<<")
    except Exception as e:
        db.rollback()
        print(f"[ERROR] Failed to reset demo database: {e}")
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    reset_demo()
