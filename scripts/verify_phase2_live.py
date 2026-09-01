import urllib.request
import json

print('====================================================')
print('Phase 2 Full Stack End-to-End Live Verification')
print('====================================================')

# 1. Test Dashboard Summary Endpoint
res = urllib.request.urlopen('http://localhost:8000/api/dashboard/summary')
summary = json.loads(res.read().decode('utf-8'))
print(f"[1] GET /api/dashboard/summary: Total Assets={summary['total_equipment']}, Rented={summary['rented']}, Available={summary['available']}, Total Engine Hrs={summary['total_engine_hours']}")

# 2. Test Equipment List Endpoint
res = urllib.request.urlopen('http://localhost:8000/api/equipment')
eq_list = json.loads(res.read().decode('utf-8'))
print(f"[2] GET /api/equipment: Retrieved {len(eq_list)} equipment items")

# 3. Test Equipment Tag Scanner Endpoint
res = urllib.request.urlopen('http://localhost:8000/api/equipment/tag/EQX1001')
tag_res = json.loads(res.read().decode('utf-8'))
print(f"[3] GET /api/equipment/tag/EQX1001: Tag resolved to {tag_res['equipment_id']} ({tag_res['equipment_type']}) at {tag_res.get('site_name')}")

# 4. Test Rentals Endpoint
res = urllib.request.urlopen('http://localhost:8000/api/rentals')
rentals = json.loads(res.read().decode('utf-8'))
print(f"[4] GET /api/rentals: Retrieved {len(rentals)} rental contracts")

# 5. Test Frontend HTML
fe_res = urllib.request.urlopen('http://localhost:5173/')
print(f"[5] Frontend Dev Server (HTTP {fe_res.status}): Ready on port 5173")

print("\n>>> FULL STACK INTEGRATION VERIFIED WITH 100% OPERATIONAL SUCCESS! <<<")
