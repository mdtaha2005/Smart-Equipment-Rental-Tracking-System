from datetime import datetime, timezone, timedelta, date
from decimal import Decimal
from sqlalchemy.orm import Session
from app.db.session import SessionLocal, engine
from app.models.site import Site
from app.models.operator import Operator
from app.models.equipment import Equipment
from app.models.rental import Rental
from app.models.usage_log import UsageLog
from app.models.alert import Alert
from app.models.forecast import ForecastData
from app.models.recommendation import Recommendation

# Anchor reference date for reproducible seed generation
DEMO_REFERENCE_DATE = datetime(2026, 3, 1, 8, 0, 0, tzinfo=timezone.utc)

# 1. SITES SEED DATA (Prototype demo data for Caterpillar hackathon)
SITES_DATA = [
    {
        "site_id": "S001",
        "site_name": "Metro Highway Dallas",
        "location": "Dallas North, TX",
        "latitude": Decimal("32.776700"),
        "longitude": Decimal("-96.797000"),
    },
    {
        "site_id": "S002",
        "site_name": "Quarry Fort Worth",
        "location": "Fort Worth Quarry, TX",
        "latitude": Decimal("32.755500"),
        "longitude": Decimal("-97.330800"),
    },
    {
        "site_id": "S003",
        "site_name": "Commercial Austin",
        "location": "Austin Central Plaza, TX",
        "latitude": Decimal("30.267200"),
        "longitude": Decimal("-97.743100"),
    },
    {
        "site_id": "S004",
        "site_name": "Logistics San Antonio",
        "location": "San Antonio Logistics Park, TX",
        "latitude": Decimal("29.424100"),
        "longitude": Decimal("-98.493600"),
    },
    {
        "site_id": "S005",
        "site_name": "Wind Farm Abilene",
        "location": "Abilene Basin Energy Site, TX",
        "latitude": Decimal("32.448700"),
        "longitude": Decimal("-99.733100"),
    },
    {
        "site_id": "S006",
        "site_name": "Port Houston",
        "location": "Port Houston Industrial Terminal, TX",
        "latitude": Decimal("29.760400"),
        "longitude": Decimal("-95.369800"),
    }
]

# 2. OPERATORS SEED DATA (Challenge dataset)
OPERATORS_DATA = [
    {"operator_id": "OP101", "operator_name": "Marcus Vance", "status": "ACTIVE"},
    {"operator_id": "OP106", "operator_name": "Sarah Jenkins", "status": "ACTIVE"},
    {"operator_id": "OP114", "operator_name": "Carlos Rodriguez", "status": "ACTIVE"},
    {"operator_id": "OP203", "operator_name": "David Kim", "status": "ACTIVE"},
    {"operator_id": "OP301", "operator_name": "Elena Rostova", "status": "ACTIVE"},
    {"operator_id": "OP402", "operator_name": "Jackson Reed", "status": "ACTIVE"},
]

# 3. EQUIPMENT SEED DATA (Exact challenge records)
# CRITICAL: EQX1002 and EQX1007 retain NULL site and operator assignments
EQUIPMENT_DATA = [
    {
        "equipment_id": "EQX1001",
        "equipment_type": "Excavator",
        "status": "RENTED",
        "current_site_id": "S003",
        "current_operator_id": "OP101",
        "engine_hours_day": Decimal("1.50"),
        "idle_hours_day": Decimal("10.00"),
        "rental_days": 15
    },
    {
        "equipment_id": "EQX1002",
        "equipment_type": "Crane",
        "status": "UNASSIGNED",
        "current_site_id": None,
        "current_operator_id": None,
        "engine_hours_day": Decimal("0.00"),
        "idle_hours_day": Decimal("11.00"),
        "rental_days": 20
    },
    {
        "equipment_id": "EQX1003",
        "equipment_type": "Bulldozer",
        "status": "RENTED",
        "current_site_id": "S002",
        "current_operator_id": "OP203",
        "engine_hours_day": Decimal("7.50"),
        "idle_hours_day": Decimal("0.50"),
        "rental_days": 25
    },
    {
        "equipment_id": "EQX1004",
        "equipment_type": "Excavator",
        "status": "RENTED",
        "current_site_id": "S004",
        "current_operator_id": "OP106",
        "engine_hours_day": Decimal("2.00"),
        "idle_hours_day": Decimal("9.00"),
        "rental_days": 10
    },
    {
        "equipment_id": "EQX1005",
        "equipment_type": "Bulldozer",
        "status": "RENTED",
        "current_site_id": "S006",
        "current_operator_id": "OP301",
        "engine_hours_day": Decimal("8.00"),
        "idle_hours_day": Decimal("0.00"),
        "rental_days": 30
    },
    {
        "equipment_id": "EQX1006",
        "equipment_type": "Grader",
        "status": "RENTED",
        "current_site_id": "S001",
        "current_operator_id": "OP114",
        "engine_hours_day": Decimal("3.00"),
        "idle_hours_day": Decimal("6.00"),
        "rental_days": 18
    },
    {
        "equipment_id": "EQX1007",
        "equipment_type": "Excavator",
        "status": "UNASSIGNED",
        "current_site_id": None,
        "current_operator_id": None,
        "engine_hours_day": Decimal("0.00"),
        "idle_hours_day": Decimal("12.00"),
        "rental_days": 12
    }
]

def seed_database(db: Session = None, reset_existing: bool = False) -> dict:
    """
    Seed database with deterministic, idempotent seed data.
    """
    is_local_session = False
    if db is None:
        db = SessionLocal()
        is_local_session = True

    stats = {
        "sites_created": 0,
        "sites_existing": 0,
        "operators_created": 0,
        "operators_existing": 0,
        "equipment_created": 0,
        "equipment_existing": 0,
        "rentals_created": 0,
        "rentals_existing": 0,
        "usage_logs_created": 0,
        "usage_logs_existing": 0,
    }

    try:
        # 1. Seed Sites
        for site_info in SITES_DATA:
            existing = db.query(Site).filter(Site.site_id == site_info["site_id"]).first()
            if not existing:
                site = Site(
                    site_id=site_info["site_id"],
                    site_name=site_info["site_name"],
                    location=site_info["location"],
                    latitude=site_info["latitude"],
                    longitude=site_info["longitude"],
                    created_at=DEMO_REFERENCE_DATE - timedelta(days=60)
                )
                db.add(site)
                stats["sites_created"] += 1
            else:
                stats["sites_existing"] += 1
        db.flush()

        # 2. Seed Operators
        for op_info in OPERATORS_DATA:
            existing = db.query(Operator).filter(Operator.operator_id == op_info["operator_id"]).first()
            if not existing:
                operator = Operator(
                    operator_id=op_info["operator_id"],
                    operator_name=op_info["operator_name"],
                    status=op_info["status"],
                    created_at=DEMO_REFERENCE_DATE - timedelta(days=60)
                )
                db.add(operator)
                stats["operators_created"] += 1
            else:
                stats["operators_existing"] += 1
        db.flush()

        # 3. Seed Equipment
        for eq_info in EQUIPMENT_DATA:
            existing = db.query(Equipment).filter(Equipment.equipment_id == eq_info["equipment_id"]).first()
            if not existing:
                equipment = Equipment(
                    equipment_id=eq_info["equipment_id"],
                    equipment_type=eq_info["equipment_type"],
                    status=eq_info["status"],
                    current_site_id=eq_info["current_site_id"],
                    current_operator_id=eq_info["current_operator_id"],
                    created_at=DEMO_REFERENCE_DATE - timedelta(days=60),
                    updated_at=DEMO_REFERENCE_DATE
                )
                db.add(equipment)
                stats["equipment_created"] += 1
            else:
                if reset_existing:
                    existing.equipment_type = eq_info["equipment_type"]
                    existing.status = eq_info["status"]
                    existing.current_site_id = eq_info["current_site_id"]
                    existing.current_operator_id = eq_info["current_operator_id"]
                    existing.updated_at = DEMO_REFERENCE_DATE
                stats["equipment_existing"] += 1
        db.flush()

        # 4. Seed Rentals
        # Rental dates are demo dates consistently derived from supplied rental_days duration
        for eq_info in EQUIPMENT_DATA:
            rental_id = f"RNT-{eq_info['equipment_id']}-01"
            existing = db.query(Rental).filter(Rental.rental_id == rental_id).first()
            
            rental_days = eq_info["rental_days"]
            checkout_date = DEMO_REFERENCE_DATE - timedelta(days=rental_days)
            expected_checkin_date = checkout_date + timedelta(days=rental_days + 10)
            
            if not existing:
                rental = Rental(
                    rental_id=rental_id,
                    equipment_id=eq_info["equipment_id"],
                    site_id=eq_info["current_site_id"],
                    operator_id=eq_info["current_operator_id"],
                    checkout_date=checkout_date,
                    expected_checkin_date=expected_checkin_date,
                    actual_checkin_date=None,
                    status="ACTIVE",
                    created_at=checkout_date,
                    updated_at=DEMO_REFERENCE_DATE
                )
                db.add(rental)
                stats["rentals_created"] += 1
            else:
                if reset_existing:
                    existing.site_id = eq_info["current_site_id"]
                    existing.operator_id = eq_info["current_operator_id"]
                    existing.actual_checkin_date = None
                    existing.status = "ACTIVE"
                    existing.updated_at = DEMO_REFERENCE_DATE
                stats["rentals_existing"] += 1
        db.flush()

        # 5. Seed Historical Usage Logs (Telemetry)
        # Daily synthetic usage logs reflecting the exact engine & idle hours per day from challenge
        site_map = {s["site_id"]: s for s in SITES_DATA}
        
        for eq_info in EQUIPMENT_DATA:
            rental_id = f"RNT-{eq_info['equipment_id']}-01"
            rental_days = eq_info["rental_days"]
            site_info = site_map.get(eq_info["current_site_id"]) if eq_info["current_site_id"] else None
            
            for day_idx in range(rental_days):
                usage_id = f"USG-{eq_info['equipment_id']}-{day_idx+1:03d}"
                existing = db.query(UsageLog).filter(UsageLog.usage_id == usage_id).first()
                if not existing:
                    log_date = (DEMO_REFERENCE_DATE - timedelta(days=rental_days)) + timedelta(days=day_idx, hours=12)
                    
                    engine_hrs = eq_info["engine_hours_day"]
                    idle_hrs = eq_info["idle_hours_day"]
                    # Realistic synthetic fuel calculation: ~18.5 L/hr under load + ~3.2 L/hr idle
                    fuel_used = Decimal(str(round(float(engine_hrs) * 18.5 + float(idle_hrs) * 3.2, 2)))

                    usage_log = UsageLog(
                        usage_id=usage_id,
                        equipment_id=eq_info["equipment_id"],
                        rental_id=rental_id,
                        timestamp=log_date,
                        engine_hours=engine_hrs,
                        idle_hours=idle_hrs,
                        fuel_used=fuel_used,
                        latitude=site_info["latitude"] if site_info else None,
                        longitude=site_info["longitude"] if site_info else None,
                        created_at=log_date
                    )
                    db.add(usage_log)
                    stats["usage_logs_created"] += 1
                else:
                    stats["usage_logs_existing"] += 1

        db.commit()
        return stats
    except Exception as e:
        db.rollback()
        raise e
    finally:
        if is_local_session:
            db.close()

if __name__ == "__main__":
    print("Seeding database with Caterpillar challenge dataset...")
    result = seed_database()
    print("\n--- Seed Completed Successfully ---")
    for k, v in result.items():
        print(f"  {k}: {v}")
