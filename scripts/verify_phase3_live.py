import urllib.request
import json

print("=" * 65)
print("Phase 3 Full-Stack Live Integration Verification")
print("=" * 65)

# 1. Utilization API
res = urllib.request.urlopen("http://localhost:8000/api/analytics/utilization")
util_data = json.loads(res.read().decode("utf-8"))
print(f"[1] GET /api/analytics/utilization: {len(util_data)} equipment assets analyzed")
for u in util_data[:3]:
    print(f"    - {u['equipment_id']} ({u['equipment_type']}): Util={u['utilization_rate']}%, Idle={u['idle_percentage']}% | {u['insight_summary']}")

# 2. Site Analytics API
res = urllib.request.urlopen("http://localhost:8000/api/analytics/sites")
sites_data = json.loads(res.read().decode("utf-8"))
print(f"[2] GET /api/analytics/sites: {len(sites_data)} sites analyzed")
for s in sites_data:
    print(f"    - {s['site_name']}: Machines={s['equipment_count']}, Active={s['active_rentals']}, Avg Util={s['average_utilization']}%")

# 3. Equipment Performance API
res = urllib.request.urlopen("http://localhost:8000/api/analytics/equipment/EQX1001/performance")
perf_data = json.loads(res.read().decode("utf-8"))
print(f"[3] GET /api/analytics/equipment/EQX1001/performance:")
print(f"    - Engine Total={perf_data['total_engine_hours']}h, Idle Total={perf_data['total_idle_hours']}h")
print(f"    - Avg Daily Engine={perf_data['avg_engine_hours_day']}h, Avg Daily Idle={perf_data['avg_idle_hours_day']}h")
print(f"    - Daily Trend Data Points={len(perf_data['daily_trend'])}")

# 4. Daily Usage Trend API
res = urllib.request.urlopen("http://localhost:8000/api/analytics/equipment/EQX1001/daily")
daily_data = json.loads(res.read().decode("utf-8"))
print(f"[4] GET /api/analytics/equipment/EQX1001/daily: {len(daily_data)} chart points returned")

# 5. Customer Alerts API
res = urllib.request.urlopen("http://localhost:8000/api/alerts?resolved=false")
alerts_data = json.loads(res.read().decode("utf-8"))
print(f"[5] GET /api/alerts?resolved=false: {len(alerts_data)} active unresolved alerts")
for a in alerts_data[:3]:
    print(f"    - [{a['severity']}] {a['equipment_id']} ({a['alert_type']}): {a['message']}")

# 6. Customer Dashboard Summary
res = urllib.request.urlopen("http://localhost:8000/api/dashboard/summary")
summary_data = json.loads(res.read().decode("utf-8"))
print(f"[6] GET /api/dashboard/summary:")
print(f"    - Total Rented={summary_data['total_equipment']}, Active Rentals={summary_data['active_rentals']}")
print(f"    - High Idle Machines={summary_data['high_idle_count']}, Attention Required Count={summary_data['attention_required_count']}")
print(f"    - Avg Fleet Utilization={summary_data['average_utilization_pct']}%")

# 7. Frontend UI HTML
fe_res = urllib.request.urlopen("http://localhost:5173/")
print(f"[7] Frontend Web App (HTTP {fe_res.status}): Ready on port 5173")

print("\n>>> PHASE 3 FULL-STACK LIVE VERIFICATION COMPLETED WITH 100% SUCCESS! <<<")
