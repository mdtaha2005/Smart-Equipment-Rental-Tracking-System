import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(backend_dir))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

print("\n" + "=" * 75)
print("COMPREHENSIVE FULL-STACK LIVE VERIFICATION: PHASES 1 -> 4")
print("=" * 75)

# ----------------------------------------------------
# 1. PHASE 1 REGRESSION: Health & Database Entities
# ----------------------------------------------------
res_health = client.get("/api/health/db")
assert res_health.status_code == 200
h_data = res_health.json()
print(f"[Phase 1] Database Health: Status={h_data['status']}, Type={h_data['database_type']}, Latency={h_data['latency_ms']}ms")
assert h_data['status'] == 'healthy'
assert h_data['row_counts']['equipment'] >= 7
assert h_data['row_counts']['sites'] >= 6
assert h_data['row_counts']['usage_logs'] >= 100

# ----------------------------------------------------
# 2. PHASE 2 REGRESSION: Workflows & QR Scanning
# ----------------------------------------------------
res_tag = client.get("/api/equipment/tag/TAG-EQX1001-QR")
assert res_tag.status_code == 200
assert res_tag.json()['equipment_id'] == "EQX1001"
print(f"[Phase 2] QR/RFID Tag Resolution: TAG-EQX1001-QR -> {res_tag.json()['equipment_id']} ({res_tag.json()['equipment_type']})")

# ----------------------------------------------------
# 3. PHASE 3 REGRESSION: Customer Analytics & Alerts
# ----------------------------------------------------
res_util = client.get("/api/analytics/utilization")
assert res_util.status_code == 200
utils = res_util.json()
print(f"[Phase 3] Utilization Engine: {len(utils)} rented machines evaluated.")

res_alerts = client.get("/api/alerts?resolved=false")
assert res_alerts.status_code == 200
alerts = res_alerts.json()
print(f"[Phase 3] Anomaly Alerts: {len(alerts)} active operational anomalies tracked.")

# ----------------------------------------------------
# 4. PHASE 4 VERIFICATION: Predictive Demand Forecasting
# ----------------------------------------------------
res_fcst_gen = client.post("/api/forecasts/generate?horizon_days=7")
assert res_fcst_gen.status_code == 201
f_gen = res_fcst_gen.json()
print(f"[Phase 4] ML Demand Forecast Generation: {f_gen['forecasts_generated']} forecasts generated using {f_gen['model_type']}.")

res_matrix = client.get("/api/forecasts/matrix")
assert res_matrix.status_code == 200
matrix = res_matrix.json()
print(f"[Phase 4] Forecast Heatmap Matrix: {len(matrix)} Site x MachineType demand points computed.")
assert len(matrix) == 24  # 6 sites * 4 machine types

res_sites_fcst = client.get("/api/forecasts/sites")
assert res_sites_fcst.status_code == 200
sites_fcst = res_sites_fcst.json()
print(f"[Phase 4] Site Demand Summaries: {len(sites_fcst)} Texas construction sites analyzed.")
for s in sites_fcst:
    print(f"         Site {s['site_id']} ({s['site_name']}): Demand Level={s['overall_demand_level']}, Score={s['top_predicted_demand_score']}")

# ----------------------------------------------------
# 5. PHASE 4 VERIFICATION: Smart Recommendation Engine
# ----------------------------------------------------
res_rec_gen = client.post("/api/recommendations/generate")
assert res_rec_gen.status_code == 201
r_gen = res_rec_gen.json()
print(f"[Phase 4] Recommendation Generation: {r_gen['total_active_recommendations']} active explainable recommendations generated.")

res_recs = client.get("/api/recommendations")
assert res_recs.status_code == 200
recs = res_recs.json()
print(f"[Phase 4] Total Recommendations Retrieved: {len(recs)}")

# Inspect specific explainable recommendation behaviors
for r in recs:
    print(f"         [{r['recommendation_type']}] {r['equipment_id']} -> Current: {r['current_site_name']}, Target: {r['recommended_site_name'] or 'N/A'}")
    print(f"           Priority: {r['priority']}, Gain: {r['expected_utilization_gain']}%, Status: {r['status']}")
    print(f"           Reasoning: {r['reason'][:110]}...")

# ----------------------------------------------------
# 6. PHASE 4 VERIFICATION: Decision Support & Idempotency
# ----------------------------------------------------
pending_rec = next((r for r in recs if r['status'] == 'PENDING'), None)
if pending_rec:
    # Accept recommendation
    res_patch = client.patch(
        f"/api/recommendations/{pending_rec['recommendation_id']}",
        json={"status": "ACCEPTED"}
    )
    assert res_patch.status_code == 200
    assert res_patch.json()['status'] == "ACCEPTED"
    print(f"[Phase 4] Decision Support: Recommendation {pending_rec['recommendation_id']} successfully updated to ACCEPTED.")

    # Verify equipment was NOT mutated automatically
    res_eq = client.get(f"/api/equipment/{pending_rec['equipment_id']}")
    assert res_eq.status_code == 200
    assert res_eq.json()['current_site_id'] == pending_rec['current_site_id']
    print(f"[Phase 4] Non-mutation Verified: Equipment {pending_rec['equipment_id']} assignment intact at {pending_rec['current_site_id']}.")

# Test Idempotent Generator Execution (Second Run should update without uncontrolled growth)
res_rec_gen_2 = client.post("/api/recommendations/generate")
assert res_rec_gen_2.status_code == 201
r_gen_2 = res_rec_gen_2.json()
assert r_gen_2['recommendations_created'] == 0
print(f"[Phase 4] Recommendation Deduplication & Idempotency Verified (0 new duplicates created on subsequent run).")

print("\n" + "=" * 75)
print(">>> ALL PHASES (1, 2, 3, 4) VERIFIED AND OPERATIONAL WITH 100% SUCCESS! <<<")
print("=" * 75)
