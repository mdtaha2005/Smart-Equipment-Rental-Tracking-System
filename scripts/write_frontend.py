import os

files = {}

# 1. frontend/src/api/health.ts
files['frontend/src/api/health.ts'] = '''import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface HealthResponse {
  status: string;
  database: string;
  timestamp: string;
  environment: string;
  version: string;
  tables?: Record<string, number>;
}

export interface DatabaseHealthResponse {
  status: string;
  database_type: string;
  latency_ms: number;
  timestamp: string;
  tables_count: number;
  table_names: string[];
  row_counts: Record<string, number>;
}

export const fetchAppHealth = async (): Promise<HealthResponse> => {
  const response = await axios.get<HealthResponse>(`${API_BASE_URL}/api/health`, {
    timeout: 5000
  });
  return response.data;
};

export const fetchDatabaseHealth = async (): Promise<DatabaseHealthResponse> => {
  const response = await axios.get<DatabaseHealthResponse>(`${API_BASE_URL}/api/health/db`, {
    timeout: 5000
  });
  return response.data;
};
'''

# 2. frontend/src/components/Header.tsx
files['frontend/src/components/Header.tsx'] = '''import React from 'react';
import { Activity, Layers, Server } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="border-b border-cat-border bg-cat-dark/95 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Title */}
        <div className="flex items-center space-x-3">
          <div className="bg-cat-yellow text-cat-dark font-black px-2.5 py-1 rounded tracking-wider flex items-center shadow-md">
            <span className="text-lg">CAT</span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-bold text-lg text-slate-100 tracking-tight">
                Smart Rental Tracking System
              </h1>
              <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs px-2 py-0.5 rounded font-mono font-medium">
                Phase 1: Foundation
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Caterpillar Hiring Hackathon Prototype • Core Infrastructure & Database
            </p>
          </div>
        </div>

        {/* System Meta Tags */}
        <div className="hidden md:flex items-center space-x-4 text-xs text-slate-300">
          <div className="flex items-center space-x-1.5 bg-cat-charcoal px-3 py-1.5 rounded-md border border-cat-border">
            <Server className="w-3.5 h-3.5 text-cat-yellow" />
            <span>FastAPI + SQLAlchemy</span>
          </div>
          <div className="flex items-center space-x-1.5 bg-cat-charcoal px-3 py-1.5 rounded-md border border-cat-border">
            <Layers className="w-3.5 h-3.5 text-sky-400" />
            <span>PostgreSQL 16</span>
          </div>
          <div className="flex items-center space-x-1.5 bg-cat-charcoal px-3 py-1.5 rounded-md border border-cat-border">
            <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Telemetry Ready</span>
          </div>
        </div>
      </div>
    </header>
  );
};
'''

# 3. frontend/src/components/PhaseNavigation.tsx
files['frontend/src/components/PhaseNavigation.tsx'] = '''import React from 'react';
import { Database, Truck, Calendar, Gauge, Cpu, Sparkles, CheckCircle2, Lock } from 'lucide-react';

interface PhaseItem {
  id: string;
  name: string;
  icon: React.ElementType;
  status: 'active' | 'upcoming';
  description: string;
}

const PHASES: PhaseItem[] = [
  {
    id: 'p1',
    name: '1. Foundation & DB',
    icon: Database,
    status: 'active',
    description: 'Schema, Alembic migrations, PostgreSQL seed data & health APIs'
  },
  {
    id: 'p2',
    name: '2. Fleet & Operators',
    icon: Truck,
    status: 'upcoming',
    description: 'Equipment inventory, site mapping & operator directory'
  },
  {
    id: 'p3',
    name: '3. Rental Lifecycle',
    icon: Calendar,
    status: 'upcoming',
    description: 'Check-in/out workflows, overdue tracking & duration management'
  },
  {
    id: 'p4',
    name: '4. Telemetry & Logs',
    icon: Gauge,
    status: 'upcoming',
    description: 'Engine vs idle hours, fuel monitoring & utilization rates'
  },
  {
    id: 'p5',
    name: '5. AI Forecasting & Alerts',
    icon: Cpu,
    status: 'upcoming',
    description: 'Anomaly detection, site demand prediction & smart allocation'
  }
];

export const PhaseNavigation: React.FC = () => {
  return (
    <div className="bg-cat-charcoal rounded-xl p-5 border border-cat-border shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cat-yellow" />
            System Architecture & Roadmap
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Modular multi-phase architecture designed for scalable equipment management
          </p>
        </div>
        <span className="text-xs font-mono bg-cat-yellow/10 text-cat-yellow border border-cat-yellow/30 px-2.5 py-1 rounded-md">
          Phase 1 Active
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {PHASES.map((phase) => {
          const Icon = phase.icon;
          const isActive = phase.status === 'active';

          return (
            <div
              key={phase.id}
              className={`p-3.5 rounded-lg border transition-all duration-200 flex flex-col justify-between ${
                isActive
                  ? 'bg-cat-slate/80 border-cat-yellow/50 ring-1 ring-cat-yellow/30 shadow-md'
                  : 'bg-cat-dark/50 border-cat-border/60 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`p-2 rounded-md ${
                      isActive ? 'bg-cat-yellow text-cat-dark' : 'bg-cat-charcoal text-slate-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  {isActive ? (
                    <span className="flex items-center text-[11px] font-medium text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Ready
                    </span>
                  ) : (
                    <span className="flex items-center text-[11px] text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded border border-slate-700/40">
                      <Lock className="w-3 h-3 mr-1" /> Soon
                    </span>
                  )}
                </div>
                <h3 className={`text-sm font-semibold ${isActive ? 'text-slate-100' : 'text-slate-300'}`}>
                  {phase.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {phase.description}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-cat-border/40 text-[11px]">
                {isActive ? (
                  <span className="text-cat-yellow font-medium">Currently Implemented</span>
                ) : (
                  <span className="text-slate-400">Scheduled for Phase {phase.id.replace('p', '')}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
'''

# 4. frontend/src/components/HealthStatusCard.tsx
files['frontend/src/components/HealthStatusCard.tsx'] = '''import React, { useState, useEffect } from 'react';
import {
  Server,
  Database,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  TableProperties,
  Info
} from 'lucide-react';
import { fetchAppHealth, fetchDatabaseHealth, HealthResponse, DatabaseHealthResponse } from '../api/health';

export const HealthStatusCard: React.FC = () => {
  const [appHealth, setAppHealth] = useState<HealthResponse | null>(null);
  const [dbHealth, setDbHealth] = useState<DatabaseHealthResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const checkHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const [appRes, dbRes] = await Promise.all([
        fetchAppHealth(),
        fetchDatabaseHealth()
      ]);
      setAppHealth(appRes);
      setDbHealth(dbRes);
      setLastRefreshed(new Date());
    } catch (err: any) {
      setError(err?.message || 'Failed to connect to backend server. Make sure FastAPI is running on port 8000.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
    // Refresh every 15 seconds
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Diagnostics Card */}
      <div className="bg-cat-charcoal rounded-xl border border-cat-border p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-cat-border gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-slate-100">System Diagnostics & Health Check</h2>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                Live Connection
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Real-time monitoring of FastAPI backend services, PostgreSQL database engine, and schema integrity
            </p>
          </div>

          <button
            onClick={checkHealth}
            disabled={loading}
            className="inline-flex items-center justify-center space-x-2 bg-cat-slate hover:bg-slate-700 text-slate-100 px-4 py-2 rounded-lg border border-cat-border text-xs font-medium transition disabled:opacity-50 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cat-yellow ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Testing...' : 'Ping Services'}</span>
          </button>
        </div>

        {error && (
          <div className="mt-5 p-4 bg-red-950/60 border border-red-800/80 rounded-lg text-red-200 flex items-start space-x-3 text-xs">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-300">Connection Error</p>
              <p className="mt-0.5 text-slate-300">{error}</p>
              <p className="mt-2 text-slate-400">
                Ensure PostgreSQL is running (<code className="text-red-300 bg-red-950 px-1 py-0.5 rounded">docker compose up -d</code>) and FastAPI is active (<code className="text-red-300 bg-red-950 px-1 py-0.5 rounded">uvicorn app.main:app --port 8000</code>).
              </p>
            </div>
          </div>
        )}

        {/* Status Panels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
          {/* Backend Status */}
          <div className="bg-cat-dark/70 rounded-lg p-4 border border-cat-border">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-amber-500/10 text-cat-yellow rounded-md border border-amber-500/20">
                  <Server className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-100">FastAPI Backend</h3>
                  <p className="text-[11px] text-slate-400">REST API Gateway</p>
                </div>
              </div>
              <div className="flex items-center space-x-1.5">
                {appHealth?.status === 'healthy' ? (
                  <span className="flex items-center text-xs font-semibold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-md border border-emerald-800/60">
                    <CheckCircle className="w-3.5 h-3.5 mr-1" /> Operational
                  </span>
                ) : (
                  <span className="flex items-center text-xs font-semibold text-amber-400 bg-amber-950/80 px-2.5 py-1 rounded-md border border-amber-800/60">
                    <AlertCircle className="w-3.5 h-3.5 mr-1" /> Checking...
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-300 pt-2 border-t border-cat-border/40">
              <div className="flex justify-between">
                <span className="text-slate-400">API Endpoint:</span>
                <span className="font-mono text-slate-200">GET /api/health</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Environment:</span>
                <span className="font-mono uppercase text-slate-200">{appHealth?.environment || 'development'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Version:</span>
                <span className="font-mono text-cat-yellow">v{appHealth?.version || '1.0.0'}</span>
              </div>
            </div>
          </div>

          {/* Database Status */}
          <div className="bg-cat-dark/70 rounded-lg p-4 border border-cat-border">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-sky-500/10 text-sky-400 rounded-md border border-sky-500/20">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-100">PostgreSQL Database</h3>
                  <p className="text-[11px] text-slate-400">SQLAlchemy 2.x + Alembic</p>
                </div>
              </div>
              <div className="flex items-center space-x-1.5">
                {dbHealth?.status === 'healthy' ? (
                  <span className="flex items-center text-xs font-semibold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-md border border-emerald-800/60">
                    <CheckCircle className="w-3.5 h-3.5 mr-1" /> Connected
                  </span>
                ) : (
                  <span className="flex items-center text-xs font-semibold text-rose-400 bg-rose-950/80 px-2.5 py-1 rounded-md border border-rose-800/60">
                    <AlertCircle className="w-3.5 h-3.5 mr-1" /> Offline
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-300 pt-2 border-t border-cat-border/40">
              <div className="flex justify-between">
                <span className="text-slate-400">Database Engine:</span>
                <span className="font-mono text-slate-200">{dbHealth?.database_type || 'PostgreSQL 16'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Query Latency:</span>
                <span className="font-mono text-emerald-400">{dbHealth ? `${dbHealth.latency_ms} ms` : '--'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Schema Tables:</span>
                <span className="font-mono text-sky-400">{dbHealth?.tables_count ?? 8} / 8 Entities Initialized</span>
              </div>
            </div>
          </div>
        </div>

        {/* Database Tables & Seed Statistics */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <TableProperties className="w-4 h-4 text-cat-yellow" />
              Database Entities & Seed Records (Phase 1)
            </h3>
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Last checked: {lastRefreshed.toLocaleTimeString()}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
            {[
              { name: 'equipment', label: 'Equipment', count: dbHealth?.row_counts?.equipment ?? 7, icon: '🚜', desc: 'EQX1001-1007' },
              { name: 'sites', label: 'Sites', count: dbHealth?.row_counts?.sites ?? 6, icon: '📍', desc: 'S001-S006' },
              { name: 'operators', label: 'Operators', count: dbHealth?.row_counts?.operators ?? 6, icon: '👷', desc: 'OP101-402' },
              { name: 'rentals', label: 'Rentals', count: dbHealth?.row_counts?.rentals ?? 7, icon: '📋', desc: 'Durations mapped' },
              { name: 'usage_logs', label: 'Usage Logs', count: dbHealth?.row_counts?.usage_logs ?? 130, icon: '📊', desc: 'Telemetry' },
              { name: 'alerts', label: 'Alerts', count: dbHealth?.row_counts?.alerts ?? 0, icon: '⚠️', desc: 'Phase 5 Ready' },
              { name: 'forecast_data', label: 'Forecasts', count: dbHealth?.row_counts?.forecast_data ?? 0, icon: '📈', desc: 'Phase 5 Ready' },
              { name: 'recommendations', label: 'Recommends', count: dbHealth?.row_counts?.recommendations ?? 0, icon: '💡', desc: 'Phase 5 Ready' }
            ].map((table) => (
              <div
                key={table.name}
                className="bg-cat-slate/60 p-3 rounded-lg border border-cat-border flex flex-col justify-between hover:border-cat-yellow/40 transition"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-base">{table.icon}</span>
                    <span className="text-xs font-mono font-bold text-cat-yellow bg-cat-dark px-1.5 py-0.5 rounded border border-cat-border">
                      {table.count}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-200 mt-2 truncate">{table.label}</p>
                  <p className="text-[10px] text-slate-400 truncate">{table.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Caterpillar Challenge Seed Dataset Verification */}
        <div className="mt-6 p-4 bg-cat-slate/40 border border-cat-border rounded-lg">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-cat-yellow flex-shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-semibold text-slate-200">Caterpillar Hackathon Dataset Integrity</p>
              <p className="text-slate-300 leading-relaxed">
                7 benchmark equipment units seeded (<code className="text-cat-yellow font-mono">EQX1001</code> to <code className="text-cat-yellow font-mono">EQX1007</code>). Units <code className="text-amber-300 font-mono">EQX1002</code> and <code className="text-amber-300 font-mono">EQX1007</code> have strictly preserved <code className="text-amber-300 font-mono">NULL</code> site/operator assignments for subsequent anomaly detection algorithms.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
'''

# 5. frontend/src/App.tsx
files['frontend/src/App.tsx'] = '''import React from 'react';
import { Header } from './components/Header';
import { HealthStatusCard } from './components/HealthStatusCard';
import { PhaseNavigation } from './components/PhaseNavigation';
import { Terminal, Database, Code, ShieldCheck } from 'lucide-react';

export const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0F141A] text-slate-100 flex flex-col">
      {/* Top Header */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Banner Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cat-dark via-cat-charcoal to-cat-slate border border-cat-border p-6 sm:p-8 shadow-2xl">
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-cat-yellow/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center space-x-2 bg-cat-yellow/10 border border-cat-yellow/30 text-cat-yellow px-3 py-1 rounded-full text-xs font-semibold mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Phase 1 Verified Foundation</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Smart Rental Tracking System
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-300 leading-relaxed">
              Industrial fleet telematics and rental tracking platform engineered for high-durability construction assets. Ready with PostgreSQL schema, Alembic migrations, idempotent seeding, and FastAPI diagnostics.
            </p>
          </div>
        </div>

        {/* Phase Navigation Roadmap */}
        <PhaseNavigation />

        {/* Live Diagnostics Card */}
        <HealthStatusCard />

        {/* Technical Architecture Quick Reference */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-cat-charcoal p-5 rounded-xl border border-cat-border shadow-md">
            <div className="flex items-center space-x-2 mb-2 text-cat-yellow">
              <Database className="w-4 h-4" />
              <h3 className="text-sm font-bold text-slate-100">8 Relational Entities</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Equipped with normalized schema for Equipment, Sites, Operators, Rentals, Usage Telemetry, Alerts, Demand Forecasting, and Relocation Recommendations.
            </p>
          </div>

          <div className="bg-cat-charcoal p-5 rounded-xl border border-cat-border shadow-md">
            <div className="flex items-center space-x-2 mb-2 text-sky-400">
              <Code className="w-4 h-4" />
              <h3 className="text-sm font-bold text-slate-100">FastAPI + Pydantic</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              High-performance asynchronous Python backend with type validation, CORS security, database connection pooling, and live health diagnostics.
            </p>
          </div>

          <div className="bg-cat-charcoal p-5 rounded-xl border border-cat-border shadow-md">
            <div className="flex items-center space-x-2 mb-2 text-emerald-400">
              <Terminal className="w-4 h-4" />
              <h3 className="text-sm font-bold text-slate-100">Idempotent Seeding</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Deterministic seeding preserving exact challenge parameters, rental durations, and simulated daily telemetry without risk of duplication.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-cat-border bg-cat-dark py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <div>
            <span>Smart Rental Tracking System • Built for Caterpillar Hiring Hackathon</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>React 18</span>
            <span>•</span>
            <span>FastAPI</span>
            <span>•</span>
            <span>PostgreSQL 16</span>
            <span>•</span>
            <span>Tailwind CSS</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
'''

for path, content in files.items():
    os.makedirs(os.path.dirname(path) if os.path.dirname(path) else '.', exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Clean frontend files written successfully.")
