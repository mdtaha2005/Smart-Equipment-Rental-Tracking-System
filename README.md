# Smart Rental Tracking System
### *Customer Rental Intelligence & Decision Support Platform*
**Caterpillar Hiring Hackathon Solution — Production Ready**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110.0-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.2.0-61DAFB.svg?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1.svg?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.1-38B2AC.svg?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-1.4.0-F7931E.svg?logo=scikit-learn&logoColor=white)](https://scikit-learn.org)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg?logo=docker&logoColor=white)](https://www.docker.com)

---

## 1. Product Identity & Problem Statement

### Who is this application for?
This platform is built specifically for the **Customer / Rental Operations Manager** whose organization rents Caterpillar heavy machinery across Texas construction sites, quarries, and industrial facilities.

> **Important Distinction:** This is **NOT** a Caterpillar internal fleet logistics manager. It is a **Customer Intelligence Platform** designed to help equipment renters eliminate idle waste, forecast job site equipment requirements, and maximize the return on every rental dollar.

---

### The Core Problem
Organizations renting heavy machinery experience substantial budget leakage due to:
* **Silent Idle Accumulation:** Machines sit idle on job sites accumulating rental duration costs without productive engine work.
* **Yard Overlooks:** Rented machines remain unassigned without job site or operator allocation.
* **Unbalanced Site Demand:** One job site suffers equipment shortages while matching machines idle at another nearby project.
* **Lack of Decision Support:** Managers lack data-driven guidance on whether to **redeploy**, **retain**, **downsize**, or **return** rented assets.

---

### The Customer Decision Loop
```
  TRACK        -->      ANALYZE       -->      DETECT       -->      PREDICT       -->     RECOMMEND     -->    DECIDE
(Telemetry)        (Utilization)         (Anomalies)           (ML Forecast)        (Explainability)       (Human Action)
```

---

## 2. Key Features & Capabilities

| Feature | Description | Business Impact |
|---|---|---|
| **Dynamic Executive Summary** | Live, natural-language operational snapshot computed on-the-fly from active fleet telematics. | Instant visibility into active sites, average utilization, and redeployment candidates. |
| **Predictive Demand Matrix** | 6 x 4 interactive heatmap predicting machine demand across Texas job sites (7–30 day horizon). | Prevents site bottlenecks and aligns rental contracts with projected workload. |
| **Explainable Smart Recommendations** | Data-driven decision engine evaluating cross-site opportunities with calculated utilization gains. | Direct rental budget optimization with human-in-the-loop decision recording. |
| **Operational Attention Center** | Real-time anomaly detection identifying >= 70% idle waste, unassigned machinery, and overdue contracts. | Rapid issue mitigation with prioritized severity badges and one-click resolution. |
| **4-Stage Narrative Asset Profiling** | Answers: *What is this machine doing?* -> *Why does it matter?* -> *What could happen next?* -> *What should the manager consider?* | Clear context translating telemetry into actionable business decisions. |
| **Simulated QR & RFID Scanner** | Software-only digital transponder & optical barcode recognition (`TAG-EQX1001-QR` -> `EQX1001`). | Rapid field check-in/out without physical hardware constraints. |
| **Safe Demo Baseline Reset** | One-click API and UI utility to reset ephemeral data back to the clean Caterpillar challenge dataset. | Flawless, repeatable live hackathon presentations. |

---

## 3. System Architecture

```
                                  +-------------------------------------------------------+
                                  |              REACT + VITE + TAILWIND CSS              |
                                  |      (Customer Rental Intelligence UI Dashboard)      |
                                  +---------------------------+---------------------------+
                                                              | REST (JSON / CORS)
                                                              v
                                  +-------------------------------------------------------+
                                  |                    FASTAPI BACKEND                    |
                                  |     (Routers, Validation, Business Services, ML)      |
                                  +-------------+---------------------------+-------------+
                                                |                           |
                       +------------------------+                           +------------------------+
                       |                                                                             |
                       v                                                                             v
+-----------------------------------------------+                         +-----------------------------------------------+
|              POSTGRESQL DATABASE              |                         |             SCIKIT-LEARN ML ENGINE            |
|   (8 Entities, Telemetry, Forecasts, Recs)    |                         |    (RandomForestRegressor Demand Pipeline)    |
+-----------------------------------------------+                         +-----------------------------------------------+
```

### Database Entities (PostgreSQL 16)
1. **`equipment`**: Rented machines (`EQX1001`–`EQX1007`), types (Excavator, Bulldozer, Crane, Grader), status, current site, operator.
2. **`sites`**: 6 Texas job sites (`S001` Metro Highway Dallas, `S002` Quarry Fort Worth, `S003` Commercial Austin, `S004` Logistics San Antonio, `S005` Wind Farm Abilene, `S006` Port Houston).
3. **`operators`**: Certified operators (`OP101`–`OP402`).
4. **`rentals`**: Customer rental contracts, checkout/expected return dates, active status.
5. **`usage_logs`**: Daily telematics logs capturing engine operating hours, idle standby hours, fuel burn, and GPS coordinates.
6. **`alerts`**: Operational anomaly alerts (`HIGH_IDLE`, `UNASSIGNED_EQUIPMENT`, `ZERO_ENGINE_USAGE`, `OVERDUE_RENTAL`).
7. **`forecast_data`**: ML demand prediction scores and categorical levels (`LOW`, `MEDIUM`, `HIGH`).
8. **`recommendations`**: Explainable actions (`REDEPLOY`, `RETURN_OR_DOWNSIZE`, `ASSIGN`, `RETAIN`, `MONITOR`) with human decision states (`PENDING`, `ACCEPTED`, `DISMISSED`).

---

## 4. Machine Learning & Predictive Analytics

### Model Architecture
* **Algorithm:** `RandomForestRegressor(n_estimators=50, max_depth=5, random_state=42)` from Scikit-Learn.
* **Training Data:** Historical engine and idle telemetry, active equipment allocation density, and site workload intensity.

### Feature Engineering
$$\mathbf{X} = \left[ \text{Site\_Idx}, \text{Type\_Idx}, \text{DayOfWeek}, \text{RollingEngineAvg}_{7d}, \text{RollingIdleAvg}_{7d}, \text{ActiveDensity}, \text{SiteUtilization} \right]$$

### Demand Classification
$$\text{Demand Level} = \begin{cases} \mathbf{HIGH} & \text{Demand Score} \ge 0.65 \\[4pt] \mathbf{MEDIUM} & 0.35 \le \text{Demand Score} < 0.65 \\[4pt] \mathbf{LOW} & \text{Demand Score} < 0.35 \end{cases}$$

### Cross-Site Redeployment Logic
$$\text{If } \text{Utilization}(e) < 40\% \text{ and } \exists \, s \neq \text{CurrentSite}(e) \text{ where } \text{Demand}(s, \text{Type}(e)) == \mathbf{HIGH}:$$
$$\Longrightarrow \text{Trigger } \mathbf{REDEPLOY}(e \rightarrow s) \text{ with } \Delta\text{Util} = \text{Score}(s) \times 40\%$$

---

## 5. Caterpillar Challenge Dataset Baseline

The platform seeds and validates the exact Caterpillar challenge dataset:

| Equipment ID | Machine Type | Job Site | Assigned Operator | Engine Hrs/Day | Idle Hrs/Day | Utilization % | Baseline Status |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `EQX1001` | Excavator | `S003` (Commercial Austin) | `OP101` (Marcus Vance) | 1.5 | 10.0 | 13.0% | `RENTED` |
| `EQX1002` | Crane | *None (In Yard)* | *None Assigned* | 0.0 | 11.0 | 0.0% | `UNASSIGNED` |
| `EQX1003` | Bulldozer | `S002` (Quarry Fort Worth) | `OP203` (David Kim) | 7.5 | 0.5 | 93.8% | `RENTED` |
| `EQX1004` | Excavator | `S004` (Logistics San Antonio) | `OP106` (Sarah Jenkins) | 2.0 | 9.0 | 18.2% | `RENTED` |
| `EQX1005` | Bulldozer | `S006` (Port Houston) | `OP301` (Elena Rostova) | 8.0 | 0.0 | 100.0% | `RENTED` |
| `EQX1006` | Grader | `S001` (Metro Highway Dallas) | `OP114` (Carlos Rodriguez) | 3.0 | 6.0 | 33.3% | `RENTED` |
| `EQX1007` | Excavator | *None (In Yard)* | *None Assigned* | 0.0 | 12.0 | 0.0% | `UNASSIGNED` |

---

## 6. 10-Step Presentation Walkthrough

Follow this sequence for live evaluator presentations:

1. **Dashboard Initialization:** Open Customer Rental Dashboard; observe the **Executive Summary** and top 5 KPI cards.
2. **Inspect EQX1001:** Notice `EQX1001` (Excavator at Commercial Austin) operating at only 13.0% utilization with 87.0% idle waste (150 idle hrs vs 22.5 engine hrs).
3. **Attention Required Center:** Review the `HIGH_IDLE` anomaly alert generated for `EQX1001`.
4. **Asset Narrative Breakdown:** Click `EQX1001`; explore the 4-stage narrative hierarchy and 15-day daily telemetry trend.
5. **Demand Forecast Execution:** Click **[ Generate Forecast ]**; the backend retrains the Random Forest model on live telematics.
6. **Review Heatmap Matrix:** Inspect the 6 x 4 heatmap; observe `S002` (Quarry Fort Worth) showing `HIGH` excavator demand.
7. **Trigger Recommendations:** Click **[ Generate Recommendations ]** to evaluate cross-site opportunities.
8. **Inspect Redeployment Rationale:** Read the explainable card: *"Consider redeploying EQX1001 from Commercial Austin to Quarry Fort Worth to satisfy high site demand and eliminate idle waste (+24% Est. Util Gain)"*.
9. **Decision Recording:** Click **[ Accept ]** on the recommendation; the decision status transitions to `ACCEPTED`.
10. **Verify Safe Non-Mutation:** Verify that the physical machine assignment remains unchanged until the rental manager dispatches the physical logistics.

---

## 7. Quickstart & Local Setup

### Prerequisites
* Python 3.11+
* Node.js 18+ & npm
* PostgreSQL 16 (or Docker)

---

### Method A: Docker Compose (Recommended 1-Liner)
```bash
docker compose up --build
```
* **Frontend Web Application:** [http://localhost:3000](http://localhost:3000)
* **Interactive API Docs (Swagger):** [http://localhost:8000/docs](http://localhost:8000/docs)

---

### Method B: Manual Local Development

#### 1. Start PostgreSQL
```bash
docker compose up -d postgres
```

#### 2. Backend Setup
```bash
cd backend
python -m venv venv

# Windows:
.\venv\Scripts\activate
# Linux / macOS:
source venv/bin/activate

pip install -r requirements.txt
alembic upgrade head
python -m app.db.seed
uvicorn app.main:app --reload --port 8000
```

#### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
* Access the frontend dev server at [http://localhost:5173](http://localhost:5173).

---

## 8. REST API Reference

| Method | Endpoint | Description |
|:---:|---|---|
| `GET` | `/api/health` | Backend service health probe. |
| `GET` | `/api/health/db` | PostgreSQL connection latency and table counts. |
| `GET` | `/api/demo/summary` | Dynamic natural-language executive summary. |
| `POST` | `/api/demo/reset` | Safe demo baseline reset to challenge dataset. |
| `GET` | `/api/equipment` | Filterable equipment inventory directory. |
| `GET` | `/api/equipment/{id}` | Detailed asset profile with telemetry summary. |
| `GET` | `/api/equipment/tag/{tag_id}` | Optical QR and RFID simulated tag lookup. |
| `POST` | `/api/rentals/checkout` | Check out equipment to a job site and operator. |
| `POST` | `/api/rentals/{id}/check-in` | Check in equipment and close rental contract. |
| `POST` | `/api/usage` | Ingest engine and idle telemetry logs. |
| `GET` | `/api/analytics/utilization` | Fleet utilization rates and idle waste percentages. |
| `GET` | `/api/analytics/equipment/{id}/performance` | 4-stage asset performance with business insight. |
| `GET` | `/api/alerts` | Query active or resolved operational alerts. |
| `POST` | `/api/alerts/generate` | Run idempotent anomaly detection pipeline. |
| `PATCH` | `/api/alerts/{id}/resolve` | Mark operational alert as resolved. |
| `GET` | `/api/forecasts/matrix` | 6 x 4 Site x Machine Type demand matrix. |
| `POST` | `/api/forecasts/generate` | Train Random Forest model and forecast demand. |
| `GET` | `/api/recommendations` | Explainable recommendations sorted by priority. |
| `POST` | `/api/recommendations/generate` | Run cross-site recommendation pipeline. |
| `PATCH` | `/api/recommendations/{id}` | Accept or dismiss recommendation (Human-in-the-loop). |

---

## 9. Environment Variables Configuration

Copy `.env.example` to `.env`:
```ini
# PostgreSQL Database Connection
DATABASE_URL=postgresql://cat_user:cat_password@localhost:5432/cat_rental_db

# Backend Configuration
ENVIRONMENT=development
PROJECT_NAME="Smart Rental Tracking System"
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000

# Allowed CORS Origins (Comma-separated)
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173

# Frontend API Gateway URL (Vite build)
VITE_API_BASE_URL=http://localhost:8000
```

---

## 10. Automated Verification & Quality Assurance

Run all test suites to verify end-to-end functionality:

```bash
# Phase 2: Operations, Check-in/out, Telemetry & QR/RFID
python scripts/test_phase2_apis.py

# Phase 3: Analytics, Utilization & Anomaly Alert Pipelines
python scripts/test_phase3_analytics.py

# Phase 4: Machine Learning Forecasts & Explainable Recommendations
python scripts/test_phase4_predictive.py

# Phase 5: Comprehensive 16-Point Final Test Suite
python scripts/test_phase5_final.py

# Live Presentation 10-Step Walkthrough Verification
python scripts/verify_final_demo.py
```

### Verification Results Matrix
| Test Suite | Result | Coverage Details |
|---|:---:|---|
| `test_phase2_apis.py` | **100% PASS** | Check-in/out lifecycle, conflict handling, usage logging, QR/RFID tag resolution. |
| `test_phase3_analytics.py` | **100% PASS** | Utilization calculation, zero-division safety, anomaly detection, alert deduplication. |
| `test_phase4_predictive.py` | **100% PASS** | Random Forest model training, demand scoring, recommendation engine, decision recording. |
| `test_phase5_final.py` | **100% PASS** | 16-point verification (health, data integrity, safe reset, idempotency, non-mutation). |
| `verify_final_demo.py` | **100% PASS** | 10-step hackathon demo presentation walkthrough executed with 0 errors. |
| `npm run build` | **100% PASS** | TypeScript + Vite production bundle compiled in 4.16s (0 errors, 0 warnings). |

---

## 11. Team & Project Information
* **Hackathon:** Caterpillar Hiring Hackathon
* **Project Name:** Smart Rental Tracking System
* **Track:** Heavy Equipment Rental Telematics & Predictive Intelligence
* **Status:** Complete, Verified, and Production-Ready
