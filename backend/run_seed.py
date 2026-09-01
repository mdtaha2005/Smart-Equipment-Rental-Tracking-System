import sys
import os
from pathlib import Path

# Add backend directory to python path
backend_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_dir))

from app.db.seed import seed_database
from app.db.session import SessionLocal
from sqlalchemy import text

def main():
    print("=" * 60)
    print("Smart Rental Tracking System - Database Seeder")
    print("=" * 60)
    
    db = SessionLocal()
    try:
        # Check connection
        db.execute(text("SELECT 1"))
        print("[OK] Connected to database.")
    except Exception as e:
        print(f"[ERROR] Database connection failed: {e}")
        sys.exit(1)
        
    try:
        stats = seed_database(db)
        print("\nSeeding summary:")
        print(f"  Sites:        {stats['sites_created']} created, {stats['sites_existing']} already existed")
        print(f"  Operators:    {stats['operators_created']} created, {stats['operators_existing']} already existed")
        print(f"  Equipment:    {stats['equipment_created']} created, {stats['equipment_existing']} already existed")
        print(f"  Rentals:      {stats['rentals_created']} created, {stats['rentals_existing']} already existed")
        print(f"  Usage Logs:   {stats['usage_logs_created']} created, {stats['usage_logs_existing']} already existed")
        print("\n[SUCCESS] Database seed is up to date and verified.")
    except Exception as e:
        print(f"[ERROR] Seeding encountered an error: {e}")
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    main()
