import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(backend_dir))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

print("=" * 65)
print("Testing Phase 3 Customer Rental Intelligence & Analytics APIs")
print("=" * 65)

# 1. Test Utilization Endpoint
res = client.get("/api/analytics/utilization")
assert res.status_code == 200, f"Utilization failed: {res.text}"
utils = res.json()
print(f"[OK] GET /api/analytics/utilization: {len(utils)} machines evaluated.")
assert len(utils) == 7

# Verify EQX1001 metrics (1.5 engine hrs/day vs 10 idle hrs/day => 13.0% util, 87.0% idle)
eq1 = next(u for u in utils if u["equipment_id"] == "EQX1001")
print(f"     EQX1001: Engine={eq1['engine_hours']}h, Idle={eq1['idle_hours']}h -> Util={eq1['utilization_rate']}%, Idle={eq1['idle_percentage']}%")
assert eq1['idle_percentage'] == 87.0
assert eq1['utilization_rate'] == 13.0

# Verify EQX1002 (0 engine, 11 idle => 0.0% util, 100.0% idle)
eq2 = next(u for u in utils if u["equipment_id"] == "EQX1002")
print(f"     EQX1002: Engine={eq2['engine_hours']}h, Idle={eq2['idle_hours']}h -> Util={eq2['utilization_rate']}%, Idle={eq2['idle_percentage']}%")
assert eq2['utilization_rate'] == 0.0
assert eq2['idle_percentage'] == 100.0

# Verify EQX1005 (8 engine, 0 idle => 100.0% util, 0.0% idle)
eq5 = next(u for u in utils if u["equipment_id"] == "EQX1005")
print(f"     EQX1005: Engine={eq5['engine_hours']}h, Idle={eq5['idle_hours']}h -> Util={eq5['utilization_rate']}%, Idle={eq5['idle_percentage']}%")
assert eq5['utilization_rate'] == 100.0
assert eq5['idle_percentage'] == 0.0

# 2. Test Single Equipment Performance Endpoint
res = client.get("/api/analytics/equipment/EQX1001/performance")
assert res.status_code == 200, f"Performance failed: {res.text}"
perf = res.json()
print(f"[OK] GET /api/analytics/equipment/EQX1001/performance: Avg Engine/Day={perf['avg_engine_hours_day']}h, Avg Idle/Day={perf['avg_idle_hours_day']}h")
assert len(perf['daily_trend']) > 0
print(f"     Business Insight: {perf['business_insight']}")

# 3. Test Daily Usage Endpoint
res = client.get("/api/analytics/equipment/EQX1001/daily")
assert res.status_code == 200
daily = res.json()
print(f"[OK] GET /api/analytics/equipment/EQX1001/daily: {len(daily)} daily data points returned for charts.")
assert len(daily) > 0

# 4. Test Site Analytics Endpoint
res = client.get("/api/analytics/sites")
assert res.status_code == 200
sites_perf = res.json()
print(f"[OK] GET /api/analytics/sites: {len(sites_perf)} sites analyzed.")
for s in sites_perf:
    print(f"     Site {s['site_id']} ({s['site_name']}): Equipments={s['equipment_count']}, Active Rentals={s['active_rentals']}, Avg Util={s['average_utilization']}%")

# 5. Test Alert Generation (Idempotency Check)
res1 = client.post("/api/alerts/generate")
assert res1.status_code == 201, f"Alert gen 1 failed: {res1.text}"
gen1 = res1.json()
print(f"[OK] POST /api/alerts/generate (Run 1): Created={gen1['alerts_created']}, Skipped={gen1['alerts_skipped']}, Total Active={gen1['total_active_alerts']}")
assert gen1['total_active_alerts'] > 0

# Second call should produce 0 duplicates
res2 = client.post("/api/alerts/generate")
assert res2.status_code == 201
gen2 = res2.json()
print(f"[OK] POST /api/alerts/generate (Run 2 - Deduplication): Created={gen2['alerts_created']}, Skipped={gen2['alerts_skipped']}, Total Active={gen2['total_active_alerts']}")
assert gen2['alerts_created'] == 0
assert gen2['alerts_created'] == 0

# 6. Verify Detected Anomalies in Generated Alerts
alerts_res = client.get("/api/alerts?resolved=false")
active_alerts = alerts_res.json()
print(f"[OK] GET /api/alerts (Active): {len(active_alerts)} unresolved alerts.")

unassigned_alerts = [a for a in active_alerts if a['alert_type'] == 'UNASSIGNED_EQUIPMENT']
high_idle_alerts = [a for a in active_alerts if a['alert_type'] == 'HIGH_IDLE']
zero_eng_alerts = [a for a in active_alerts if a['alert_type'] == 'ZERO_ENGINE_USAGE']

print(f"     Unassigned Alerts: {[a['equipment_id'] for a in unassigned_alerts]}")
print(f"     High Idle Alerts: {[a['equipment_id'] for a in high_idle_alerts]}")
print(f"     Zero Engine Alerts: {[a['equipment_id'] for a in zero_eng_alerts]}")

assert any(a['equipment_id'] == 'EQX1002' for a in unassigned_alerts)
assert any(a['equipment_id'] == 'EQX1007' for a in unassigned_alerts)
assert any(a['equipment_id'] == 'EQX1001' for a in high_idle_alerts)
# EQX1001 verified for high idle anomaly

# 7. Test Alert Resolution
first_alert = active_alerts[0]
res_res = client.patch(f"/api/alerts/{first_alert['alert_id']}/resolve")
assert res_res.status_code == 200, f"Resolve failed: {res_res.text}"
resolved_data = res_res.json()
print(f"[OK] PATCH /api/alerts/{first_alert['alert_id']}/resolve: Resolved={resolved_data['resolved']}, Resolved At={resolved_data['resolved_at']}")
assert resolved_data['resolved'] is True

# 8. Test Customer Dashboard Summary
res_dash = client.get("/api/dashboard/summary")
assert res_dash.status_code == 200
dash = res_dash.json()
print(f"[OK] GET /api/dashboard/summary: Rented={dash['rented']}, High Idle Count={dash['high_idle_count']}, Attention Required Count={dash['attention_required_count']}")

print("\n>>> ALL PHASE 3 BACKEND ANALYTICS & ALERT WORKFLOWS VERIFIED 100%! <<<")
