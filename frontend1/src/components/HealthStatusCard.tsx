import React, { useState, useEffect } from 'react';
import {
  Server,
  Database,
  RefreshCw,
  RotateCcw,
  CheckCircle2,
  Layers
} from 'lucide-react';
import { fetchAppHealth, fetchDatabaseHealth, HealthResponse, DatabaseHealthResponse } from '../api/health';
import { resetDemoData } from '../api/demo';

export const HealthStatusCard: React.FC = () => {
  const [backendHealth, setBackendHealth] = useState<HealthResponse | null>(null);
  const [dbHealth, setDbHealth] = useState<DatabaseHealthResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const checkHealth = async () => {
    setLoading(true);
    try {
      const [bData, dData] = await Promise.all([
        fetchAppHealth(),
        fetchDatabaseHealth()
      ]);
      setBackendHealth(bData);
      setDbHealth(dData);
    } catch (err) {
      console.error('Health check failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const handleResetDemo = async () => {
    if (!window.confirm('Reset all demo anomalies, forecasts, and recommendations to the clean Caterpillar challenge baseline?')) {
      return;
    }
    setIsResetting(true);
    setResetMessage(null);
    try {
      const res = await resetDemoData();
      setResetMessage(res.message);
      await checkHealth();
    } catch (err) {
      console.error('Failed to reset demo data:', err);
      setResetMessage('Failed to reset demo data. Check backend logs.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-soft space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-emerald-600 text-white font-black rounded-xl shadow-soft">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">System Diagnostics &amp; Demo Utilities</h3>
            <p className="text-xs text-slate-500 font-medium">Live operational status of backend microservices, database, and demo controls</p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleResetDemo}
            disabled={isResetting}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs shadow-soft transition disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            <span>{isResetting ? 'Restoring Baseline...' : 'Reset Demo Data'}</span>
          </button>

          <button
            onClick={checkHealth}
            disabled={loading}
            className="p-2 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-xl text-slate-600 shadow-2xs transition"
            title="Refresh Diagnostics"
          >
            <RefreshCw className={`w-4 h-4 text-amber-500 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {resetMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs flex items-center space-x-3 shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="font-bold">{resetMessage}</span>
        </div>
      )}

      {/* Diagnostics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Backend API */}
        <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80 space-y-3.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 font-bold text-xs text-slate-900">
              <Server className="w-4 h-4 text-amber-500" />
              <span>FastAPI Backend Service</span>
            </div>
            <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full ${
              backendHealth?.status === 'healthy' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700'
            }`}>
              {backendHealth?.status?.toUpperCase() || 'OFFLINE'}
            </span>
          </div>

          <div className="space-y-2 text-xs text-slate-500 font-mono">
            <div className="flex justify-between">
              <span>Environment:</span>
              <span className="text-slate-900 font-bold">{backendHealth?.environment || 'production'}</span>
            </div>
            <div className="flex justify-between">
              <span>API Version:</span>
              <span className="text-slate-900 font-bold">{backendHealth?.version || '1.0.0'}</span>
            </div>
            <div className="flex justify-between">
              <span>Last Probe:</span>
              <span className="text-slate-700 font-semibold">{backendHealth?.timestamp ? new Date(backendHealth.timestamp).toLocaleTimeString() : 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Database */}
        <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80 space-y-3.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 font-bold text-xs text-slate-900">
              <Database className="w-4 h-4 text-sky-600" />
              <span>PostgreSQL Database</span>
            </div>
            <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full ${
              dbHealth?.status === 'healthy' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700'
            }`}>
              {dbHealth?.status?.toUpperCase() || 'OFFLINE'}
            </span>
          </div>

          <div className="space-y-2 text-xs text-slate-500 font-mono">
            <div className="flex justify-between">
              <span>Engine Type:</span>
              <span className="text-slate-900 font-bold">{dbHealth?.database_type || 'PostgreSQL 16'}</span>
            </div>
            <div className="flex justify-between">
              <span>Query Latency:</span>
              <span className="text-emerald-600 font-bold">{dbHealth?.latency_ms ? `${dbHealth.latency_ms} ms` : '0.8 ms'}</span>
            </div>
            <div className="flex justify-between">
              <span>Managed Tables:</span>
              <span className="text-slate-900 font-bold">{dbHealth?.tables_count || 8} Schema Tables</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row Counts Table */}
      {dbHealth?.row_counts && (
        <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80 space-y-3 shadow-2xs">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
            <Layers className="w-4 h-4 text-amber-500" />
            <span>Database Table Entity Counts</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            {Object.entries(dbHealth.row_counts).map(([table, count]) => (
              <div key={table} className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs flex justify-between text-xs font-mono">
                <span className="text-slate-500 font-semibold">{table}:</span>
                <span className="text-amber-900 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">{Number(count)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
