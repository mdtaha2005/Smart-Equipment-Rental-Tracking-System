import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(backend_dir))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

print("=" * 75)
print("COMPREHENSIVE 16-POINT PHASE 5 VERIFICATION SUITE")
print("=" * 75)

# 1. Backend Health Check
res = client.get("/api/health")
assert res.status_code == 200, f"Backend health failed: {res.text}"
assert res.json()["status"] == "healthy"
print("[1/16] [PASS] Backend Health Endpoint Verified (GET /api/health)")

# 2. Database Health Check
res = client.get("/api/health/db")
assert res.status_code == 200, f"Database health probe failed: {res.text}"
db_h = res.json()
assert db_h["status"] == "healthy"
assert db_h["row_counts"]["equipment"] >= 7
print(f"[2/16] [PASS] PostgreSQL Database Connection Verified (Latency: {db_h['latency_ms']}ms)")

# 3. Phase 2 APIs (Equipment, Sites, Operators, Rentals, Telemetry)
res_eq = client.get("/api/equipment")
res_sites = client.get("/api/sites")
res_ops = client.get("/api/operators")
res_rentals = client.get("/api/rentals")
assert res_eq.status_code == 200 and len(res_eq.json()) >= 7
assert res_sites.status_code == 200 and len(res_sites.json()) >= 6
assert res_ops.status_code == 200 and len(res_ops.json()) >= 6
assert res_rentals.status_code == 200 and len(res_rentals.json()) >= 7
print("[3/16] [PASS] Phase 2 Rental Operations & Directory APIs Verified")

# 4. Phase 3 Utilization Analytics
res_util = client.get("/api/analytics/utilization")
assert res_util.status_code == 200
utils = res_util.json()
assert len(utils) >= 7
print(f"[4/16] [PASS] Phase 3 Utilization Analytics Engine Verified ({len(utils)} machines evaluated)")

# 5. Phase 3 Anomaly Detection & Alerts
res_alerts = client.get("/api/alerts?resolved=false")
assert res_alerts.status_code == 200
alerts = res_alerts.json()
assert len(alerts) >= 1
print(f"[5/16] [PASS] Phase 3 Anomaly Alerts Engine Verified ({len(alerts)} active alerts tracked)")

# 6. Phase 4 ML Demand Forecast Generation & Matrix
res_matrix = client.get("/api/forecasts/matrix")
assert res_matrix.status_code == 200
matrix = res_matrix.json()
assert len(matrix) == 24  # 6 Texas sites x 4 machine types
print(f"[6/16] [PASS] Phase 4 Forecast Heatmap Matrix Verified ({len(matrix)} cells computed)")

# 7. Phase 4 Smart Recommendation Engine
res_recs = client.get("/api/recommendations")
assert res_recs.status_code == 200
recs = res_recs.json()
assert len(recs) >= 7
print(f"[7/16] [PASS] Phase 4 Smart Recommendations Verified ({len(recs)} active recommendations)")

# 8. Recommendation Acceptance (Human Decision Support - Non-mutation of equipment)
target_rec = recs[0]
res_patch = client.patch(f"/api/recommendations/{target_rec['recommendation_id']}", json={"status": "ACCEPTED"})
assert res_patch.status_code == 200
assert res_patch.json()["status"] == "ACCEPTED"

res_eq_check = client.get(f"/api/equipment/{target_rec['equipment_id']}")
assert res_eq_check.status_code == 200
assert res_eq_check.json()["current_site_id"] == target_rec["current_site_id"]
print(f"[8/16] [PASS] Recommendation ACCEPTED Verified: Equipment {target_rec['equipment_id']} site preserved at {target_rec['current_site_id']}")

# 9. Recommendation Dismissal
res_patch_dismiss = client.patch(f"/api/recommendations/{target_rec['recommendation_id']}", json={"status": "DISMISSED"})
assert res_patch_dismiss.status_code == 200
assert res_patch_dismiss.json()["status"] == "DISMISSED"
print("[9/16] [PASS] Recommendation DISMISSED Workflow Verified")

# 10. Simulated Optical QR and Passive RFID Tag Resolution
res_qr = client.get("/api/equipment/tag/TAG-EQX1001-QR")
res_rfid = client.get("/api/equipment/tag/TAG-EQX1001-RFID")
assert res_qr.status_code == 200 and res_qr.json()["equipment_id"] == "EQX1001"
assert res_rfid.status_code == 200 and res_rfid.json()["equipment_id"] == "EQX1001"
print("[10/16] [PASS] Simulated QR and RFID Tag Resolution Verified (TAG-EQX1001-QR / RFID -> EQX1001)")

# 11. Demo Reset API
res_reset = client.post("/api/demo/reset")
assert res_reset.status_code == 200
reset_data = res_reset.json()
assert reset_data["status"] == "success"
assert reset_data["challenge_records_verified"] == True
print("[11/16] [PASS] Safe Demo Reset API Verified (POST /api/demo/reset restored baseline)")

# 12. Challenge Dataset Integrity Check
res_eqs = client.get("/api/equipment").json()
eq_map = {e["equipment_id"]: e for e in res_eqs}
assert eq_map["EQX1001"]["equipment_type"] == "Excavator" and eq_map["EQX1001"]["current_site_id"] == "S003"
assert eq_map["EQX1002"]["equipment_type"] == "Crane" and eq_map["EQX1002"]["current_site_id"] is None
assert eq_map["EQX1003"]["equipment_type"] == "Bulldozer" and eq_map["EQX1003"]["current_site_id"] == "S002"
assert eq_map["EQX1004"]["equipment_type"] == "Excavator" and eq_map["EQX1004"]["current_site_id"] == "S004"
assert eq_map["EQX1005"]["equipment_type"] == "Bulldozer" and eq_map["EQX1005"]["current_site_id"] == "S006"
assert eq_map["EQX1006"]["equipment_type"] == "Grader" and eq_map["EQX1006"]["current_site_id"] == "S001"
assert eq_map["EQX1007"]["equipment_type"] == "Excavator" and eq_map["EQX1007"]["current_site_id"] is None
print("[12/16] [PASS] Challenge Dataset Integrity Verified (EQX1001-EQX1007 exact matches)")

# 13. Dynamic Executive Summary Endpoint
res_exec = client.get("/api/demo/summary")
assert res_exec.status_code == 200
exec_s = res_exec.json()
assert exec_s["total_rented_equipment"] == 7
assert "rented machines are currently" in exec_s["summary_narrative"]
print(f"[13/16] [PASS] Dynamic Executive Summary API Verified: \"{exec_s['summary_narrative'][:65]}...\"")

# 14. Forecast Idempotency & Zero Duplication
res_fcst_1 = client.post("/api/forecasts/generate?horizon_days=7").json()
res_fcst_2 = client.post("/api/forecasts/generate?horizon_days=7").json()
assert res_fcst_1["forecasts_generated"] == res_fcst_2["forecasts_generated"]
print(f"[14/16] [PASS] Forecast Idempotency Verified ({res_fcst_2['forecasts_generated']} forecasts maintained without duplicate records)")

# 15. Recommendation Idempotency & Zero Duplication
res_rec_1 = client.post("/api/recommendations/generate").json()
res_rec_2 = client.post("/api/recommendations/generate").json()
assert res_rec_2["recommendations_created"] == 0
assert res_rec_2["total_active_recommendations"] == res_rec_1["total_active_recommendations"]
print(f"[15/16] [PASS] Recommendation Deduplication Verified (0 duplicates created on repeated execution)")

# 16. Alert Idempotency
res_alt_1 = client.post("/api/alerts/generate").json()
res_alt_2 = client.post("/api/alerts/generate").json()
assert res_alt_2["alerts_created"] == 0
print(f"[16/16] [PASS] Alert Generator Deduplication Verified (0 duplicate active alerts created)")

print("\n" + "=" * 75)
print(">>> ALL 16 PHASE 5 VERIFICATION CHECKS PASSED WITH 100% SUCCESS! <<<")
print("=" * 75)
