import sys
import os
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(backend_dir))

from app.db.session import SessionLocal, engine
from sqlalchemy import text, inspect

def verify():
    print("=" * 60)
    print("Smart Rental Tracking System - Database Verification")
    print("=" * 60)

    inspector = inspect(engine)
    tables = inspector.get_table_names()
    print(f"Discovered Tables in PostgreSQL ({len(tables)}):", tables)

    required_tables = [
        "sites",
        "operators",
        "equipment",
        "rentals",
        "usage_logs",
        "alerts",
        "forecast_data",
        "recommendations"
    ]

    for t in required_tables:
        assert t in tables, f"Missing required table: {t}"
        fks = inspector.get_foreign_keys(t)
        referred = [f"{fk['constrained_columns']} -> {fk['referred_table']}.{fk['referred_columns']}" for fk in fks]
        print(f"  [OK] Table: {t:18} | FKs: {referred}")

    db = SessionLocal()
    try:
        # Check Equipment Table & NULL preservation
        print("\nEquipment Records:")
        eq_rows = db.execute(text("SELECT equipment_id, equipment_type, status, current_site_id, current_operator_id FROM equipment ORDER BY equipment_id")).fetchall()
        for r in eq_rows:
            print(f"  {r[0]} | {r[1]:10} | Status: {r[2]:11} | Site: {str(r[3]):5} | Operator: {str(r[4]):5}")
            if r[0] in ["EQX1002", "EQX1007"]:
                assert r[3] is None, f"{r[0]} current_site_id must be NULL!"
                assert r[4] is None, f"{r[0]} current_operator_id must be NULL!"

        # Check Sites
        site_count = db.execute(text("SELECT COUNT(*) FROM sites")).scalar()
        print(f"\nTotal Sites: {site_count} (Expected 6)")
        assert site_count == 6

        # Check Operators
        op_count = db.execute(text("SELECT COUNT(*) FROM operators")).scalar()
        print(f"Total Operators: {op_count} (Expected 6)")
        assert op_count == 6

        # Check Rentals
        rental_count = db.execute(text("SELECT COUNT(*) FROM rentals")).scalar()
        print(f"Total Rentals: {rental_count} (Expected 7)")
        assert rental_count == 7

        # Check Usage Logs
        usage_count = db.execute(text("SELECT COUNT(*) FROM usage_logs")).scalar()
        print(f"Total Usage Logs: {usage_count} (Expected 130)")
        assert usage_count == 130

        print("\n[PASSED] All database tables, FKs, constraints, and data integrity checks verified successfully!")
    finally:
        db.close()

if __name__ == "__main__":
    verify()
