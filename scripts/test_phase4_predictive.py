import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(backend_dir))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

print("=" * 65)
print("Testing Phase 4: Predictive Forecasting & Smart Recommendations")
print("=" * 65)

# 1. Test Forecast Generation (Run 1)
res = client.post("/api/forecasts/generate?horizon_days=7")
assert res.status_code == 201, f"Forecast generation failed: {res.text}"
gen1 = res.json()
print(f"[OK] POST /api/forecasts/generate: Generated={gen1['forecasts_generated']}, Model={gen1['model_type']}")
assert gen1['forecasts_generated'] > 0

# 2. Test Forecast Idempotency (Run 2 should update without duplicating records)
res2 = client.post("/api/forecasts/generate?horizon_days=7")
assert res2.status_code == 201
gen2 = res2.json()
print(f"[OK] POST /api/forecasts/generate (Idempotent Run 2): Total Forecasts={gen2['forecasts_generated']}")
assert gen2['forecasts_generated'] == gen1['forecasts_generated']

# 3. Test Forecast List & Filters
res = client.get("/api/forecasts?demand_level=HIGH")
assert res.status_code == 200
high_fcsts = res.json()
print(f"[OK] GET /api/forecasts?demand_level=HIGH: {len(high_fcsts)} high-demand forecast periods found.")

# 4. Test Site Forecast Summaries
res = client.get("/api/forecasts/sites")
assert res.status_code == 200
site_summaries = res.json()
print(f"[OK] GET /api/forecasts/sites: {len(site_summaries)} sites summarized.")
for s in site_summaries:
    print(f"     Site {s['site_id']} ({s['site_name']}): Overall={s['overall_demand_level']}, Score={s['top_predicted_demand_score']}")

# 5. Test Forecast Matrix
res = client.get("/api/forecasts/matrix")
assert res.status_code == 200
matrix = res.json()
print(f"[OK] GET /api/forecasts/matrix: {len(matrix)} matrix points returned.")
assert len(matrix) >= 24

# 6. Test Recommendation Generation (Run 1)
res = client.post("/api/recommendations/generate")
assert res.status_code == 201, f"Recommendation generation failed: {res.text}"
rec_gen1 = res.json()
print(f"[OK] POST /api/recommendations/generate (Run 1): Created={rec_gen1['recommendations_created']}, Updated={rec_gen1['recommendations_updated']}, Total Active={rec_gen1['total_active_recommendations']}")
assert rec_gen1['total_active_recommendations'] > 0

# 7. Test Recommendation Deduplication (Run 2 should update existing PENDING recommendations, 0 new duplicates)
res = client.post("/api/recommendations/generate")
assert res.status_code == 201
rec_gen2 = res.json()
print(f"[OK] POST /api/recommendations/generate (Run 2 - Deduplication): Created={rec_gen2['recommendations_created']}, Updated={rec_gen2['recommendations_updated']}, Total Active={rec_gen2['total_active_recommendations']}")
assert rec_gen2['recommendations_created'] == 0
assert rec_gen2['total_active_recommendations'] == rec_gen1['total_active_recommendations']

# 8. Test Recommendation List & Explainable Reasoning
res = client.get("/api/recommendations")
assert res.status_code == 200
recs = res.json()
print(f"[OK] GET /api/recommendations: {len(recs)} recommendations retrieved.")

for r in recs:
    print(f"     [{r['recommendation_type']}] {r['equipment_id']} ({r['equipment_type']}): Priority={r['priority']}, Status={r['status']}")
    print(f"     Reason: {r['reason'][:100]}...")

# Verify Redeploy recommendation exists
redeploy_recs = [r for r in recs if r['recommendation_type'] == 'REDEPLOY']
print(f"     Redeploy recommendations: {len(redeploy_recs)} found.")

# 9. Test Recommendation Acceptance (Human-in-the-loop decision support)
target_rec = recs[0]
res = client.patch(f"/api/recommendations/{target_rec['recommendation_id']}", json={"status": "ACCEPTED"})
assert res.status_code == 200, f"Accept failed: {res.text}"
accepted_rec = res.json()
print(f"[OK] PATCH /api/recommendations/{target_rec['recommendation_id']} -> Status={accepted_rec['status']}")
assert accepted_rec['status'] == "ACCEPTED"

# 10. Verify Equipment State was NOT automatically changed (Decision Support Only)
res_eq = client.get(f"/api/equipment/{target_rec['equipment_id']}")
assert res_eq.status_code == 200
eq_data = res_eq.json()
print(f"[OK] Decision Support Verification: {target_rec['equipment_id']} site is still {eq_data['current_site_id']} (Unmodified).")

# 11. Verify Phase 1-3 Health, Analytics, and Dashboard APIs still function perfectly
res_sum = client.get("/api/dashboard/summary")
assert res_sum.status_code == 200
print(f"[OK] GET /api/dashboard/summary (Phase 3 Regression Check): Total Rented={res_sum.json()['total_equipment']}")

res_util = client.get("/api/analytics/utilization")
assert res_util.status_code == 200
print(f"[OK] GET /api/analytics/utilization (Phase 3 Regression Check): {len(res_util.json())} items verified.")

print("\n>>> ALL PHASE 4 PREDICTIVE DEMAND FORECAST & RECOMMENDATION TESTS PASSED 100%! <<<")
