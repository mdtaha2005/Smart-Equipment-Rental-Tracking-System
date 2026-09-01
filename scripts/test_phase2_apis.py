import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(backend_dir))

from fastapi.testclient import TestClient
from app.main import app
from datetime import datetime, timezone, timedelta

client = TestClient(app)

print("=" * 60)
print("Testing Phase 2 Backend APIs & Business Workflows")
print("=" * 60)

# 1. Test Equipment Fleet List
res = client.get("/api/equipment")
assert res.status_code == 200, f"Equipment list failed: {res.text}"
equipments = res.json()
print(f"[OK] GET /api/equipment: {len(equipments)} items returned.")
assert len(equipments) == 7

# 2. Test Equipment Detail
res = client.get("/api/equipment/EQX1001")
assert res.status_code == 200, f"EQX1001 detail failed: {res.text}"
eq1 = res.json()
print(f"[OK] GET /api/equipment/EQX1001: Type={eq1['equipment_type']}, Status={eq1['status']}, Site={eq1['site_name']}")
assert eq1['active_rental'] is not None
assert len(eq1['recent_usage_logs']) > 0

# 3. Test Simulated QR/RFID Scanner Endpoint
res = client.get("/api/equipment/tag/EQX1001")
assert res.status_code == 200, f"Tag scan failed: {res.text}"
tag_eq = res.json()
print(f"[OK] GET /api/equipment/tag/EQX1001: Identified {tag_eq['equipment_id']} ({tag_eq['equipment_type']})")
assert tag_eq['equipment_id'] == "EQX1001"

# 4. Test Sites
res = client.get("/api/sites")
assert res.status_code == 200
sites = res.json()
print(f"[OK] GET /api/sites: {len(sites)} sites returned.")
assert len(sites) == 6

# 5. Test Operators
res = client.get("/api/operators")
assert res.status_code == 200
ops = res.json()
print(f"[OK] GET /api/operators: {len(ops)} operators returned.")
assert len(ops) == 6

# 6. Test Rentals
res = client.get("/api/rentals")
assert res.status_code == 200
rentals = res.json()
print(f"[OK] GET /api/rentals: {len(rentals)} rentals returned.")
assert len(rentals) >= 7

# 7. Test Telemetry Logs
res = client.get("/api/usage?limit=5")
assert res.status_code == 200
logs = res.json()
print(f"[OK] GET /api/usage: {len(logs)} logs returned.")

# 8. Test Dashboard Summary
res = client.get("/api/dashboard/summary")
assert res.status_code == 200
summary = res.json()
print(f"[OK] GET /api/dashboard/summary: Total={summary['total_equipment']}, Active Rentals={summary['active_rentals']}, Total Engine Hrs={summary['total_engine_hours']}, Avg Util={summary['average_utilization_pct']}%")

# 9. Test Business Rule: Conflict when renting already rented equipment
conflict_payload = {
    "equipment_id": "EQX1001",
    "site_id": "S001",
    "operator_id": "OP402",
    "expected_checkin_date": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat()
}
res = client.post("/api/rentals/checkout", json=conflict_payload)
print(f"[OK] Checkout Conflict Test: Status = {res.status_code} (Expected 409)")
assert res.status_code == 409

# 10. Test Check-in Workflow on EQX1004 (Rental duration 10 days)
active_rnts = [r for r in rentals if r['equipment_id'] == 'EQX1004' and r['status'] == 'ACTIVE']
if active_rnts:
    rnt4 = active_rnts[0]
    checkin_payload = {
        "actual_checkin_date": datetime.now(timezone.utc).isoformat(),
        "engine_hours": "3.5",
        "idle_hours": "1.0",
        "fuel_used": "35.0"
    }
    res = client.post(f"/api/rentals/{rnt4['rental_id']}/check-in", json=checkin_payload)
    assert res.status_code == 200, f"Check-in failed: {res.text}"
    print(f"[OK] Check-in Test: Rental {rnt4['rental_id']} completed. EQX1004 is now AVAILABLE.")

    res = client.get("/api/equipment/EQX1004")
    eq4 = res.json()
    assert eq4['status'] == "AVAILABLE"
    assert eq4['current_site_id'] is None
    assert eq4['current_operator_id'] is None

    # 11. Test Check-out Workflow on EQX1004
    checkout_payload = {
        "equipment_id": "EQX1004",
        "site_id": "S005",
        "operator_id": "OP402",
        "checkout_date": datetime.now(timezone.utc).isoformat(),
        "expected_checkin_date": (datetime.now(timezone.utc) + timedelta(days=14)).isoformat()
    }
    res = client.post("/api/rentals/checkout", json=checkout_payload)
    assert res.status_code == 201, f"Checkout failed: {res.text}"
    new_rental = res.json()
    print(f"[OK] Checkout Test: Created new rental {new_rental['rental_id']} for EQX1004.")

    res = client.get("/api/equipment/EQX1004")
    eq4_updated = res.json()
    assert eq4_updated['status'] == "RENTED"
    assert eq4_updated['current_site_id'] == "S005"
    assert eq4_updated['current_operator_id'] == "OP402"

# 12. Test Negative Usage Validation
bad_usage_payload = {
    "equipment_id": "EQX1004",
    "timestamp": datetime.now(timezone.utc).isoformat(),
    "engine_hours": "-5.0",
    "idle_hours": "2.0",
    "fuel_used": "20.0"
}
res = client.post("/api/usage", json=bad_usage_payload)
print(f"[OK] Negative Usage Validation: Status = {res.status_code} (Expected 422)")
assert res.status_code == 422

# 13. Test Valid Usage Logging
valid_usage = {
    "equipment_id": "EQX1004",
    "timestamp": datetime.now(timezone.utc).isoformat(),
    "engine_hours": "5.0",
    "idle_hours": "1.5",
    "fuel_used": "95.0"
}
res = client.post("/api/usage", json=valid_usage)
assert res.status_code == 201
print(f"[OK] Valid Usage Logging: Status = 201 Created (ID: {res.json()['usage_id']})")

print("\n>>> ALL PHASE 2 BACKEND APIS & BUSINESS RULES VERIFIED WITH 100% SUCCESS! <<<")
