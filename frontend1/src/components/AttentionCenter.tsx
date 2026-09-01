import React, { useState } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  AlertCircle,
  CheckCircle2,
  ArrowUpRight,
  Zap
} from 'lucide-react';
import { AlertResponse, resolveAlert, generateAlerts } from '../api/alerts';

interface AttentionCenterProps {
  alerts: AlertResponse[];
  onAlertResolved: () => void;
  onNavigateToEquipment: (equipmentId: string) => void;
}

export const AttentionCenter: React.FC<AttentionCenterProps> = ({
  alerts,
  onAlertResolved,
  onNavigateToEquipment
}) => {
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);

  const activeAlerts = alerts.filter(a => !a.resolved);

  const handleResolve = async (alertId: string) => {
    setResolvingId(alertId);
    try {
      await resolveAlert(alertId);
      onAlertResolved();
    } catch (err) {
      console.error('Failed to resolve alert:', err);
    } finally {
      setResolvingId(null);
    }
  };

  const handleScanAnomalies = async () => {
    setIsScanning(true);
    try {
      await generateAlerts();
      onAlertResolved();
    } catch (err) {
      console.error('Failed to scan anomalies:', err);
    } finally {
      setIsScanning(false);
    }
  };

  const getSeverityBadge = (severity: string) => {
    const s = severity.toUpperCase();
    if (s === 'CRITICAL') {
      return (
        <span className="inline-flex items-center text-[10px] font-black px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-950 border border-rose-300">
          <ShieldAlert className="w-3.5 h-3.5 mr-1 text-rose-700 animate-pulse" />
          CRITICAL
        </span>
      );
    }
    if (s === 'HIGH') {
      return (
        <span className="inline-flex items-center text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-950 border border-amber-400">
          <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-800" />
          HIGH
        </span>
      );
    }
    if (s === 'MEDIUM') {
      return (
        <span className="inline-flex items-center text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-950 border border-sky-300">
          <AlertCircle className="w-3.5 h-3.5 mr-1 text-sky-700" />
          MEDIUM
        </span>
      );
    }
    return (
      <span className="inline-flex items-center text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800 border border-slate-300">
        LOW
      </span>
    );
  };

  return (
    <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-soft space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-amber-500 text-slate-950 font-black rounded-xl shadow-soft border border-slate-900">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <h3 className="text-base font-black text-slate-950 tracking-tight">
                Customer Attention Required
              </h3>
              <span className="bg-rose-100 text-rose-950 border border-rose-300 text-[11px] font-black px-3 py-0.5 rounded-full">
                {activeAlerts.length} Active Issue{activeAlerts.length === 1 ? '' : 's'}
              </span>
            </div>
            <p className="text-xs text-slate-600 font-semibold">
              Operational anomalies, unassigned machines, high idle waste, and rental contract alerts
            </p>
          </div>
        </div>

        <button
          onClick={handleScanAnomalies}
          disabled={isScanning}
          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-300 rounded-xl text-xs font-bold transition disabled:opacity-50 shadow-2xs"
        >
          <Zap className={`w-3.5 h-3.5 text-amber-600 ${isScanning ? 'animate-spin' : ''}`} />
          <span>{isScanning ? 'Scanning...' : 'Re-Evaluate Anomalies'}</span>
        </button>
      </div>

      {/* Alert Items List */}
      {activeAlerts.length === 0 ? (
        <div className="py-10 text-center text-slate-600 bg-emerald-50/50 rounded-2xl border-2 border-dashed border-emerald-300 flex flex-col items-center justify-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <p className="text-sm font-black text-slate-900">No active operational issues detected</p>
          <p className="text-xs text-slate-600 font-medium max-w-md">All rented equipment is operating within normal utilization and assignment parameters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeAlerts.map((alert) => (
            <div
              key={alert.alert_id}
              className="p-5 bg-slate-50 border-2 border-slate-200 hover:border-amber-400 hover:bg-white rounded-2xl flex flex-col justify-between space-y-3.5 transition duration-150 shadow-2xs group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getSeverityBadge(alert.severity)}
                    <button
                      onClick={() => onNavigateToEquipment(alert.equipment_id)}
                      className="font-mono font-black text-sm text-slate-950 hover:text-amber-800 flex items-center gap-1 transition"
                    >
                      <span>#{alert.equipment_id}</span>
                      <span className="text-slate-600 font-sans font-medium text-xs">({alert.equipment_type || 'Machine'})</span>
                    </button>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono font-bold">
                    {new Date(alert.detected_at).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-xs text-slate-900 leading-relaxed font-bold">
                  {alert.message}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-200 text-xs">
                <span className="text-xs text-slate-700 font-bold">
                  {alert.site_name ? `Site: ${alert.site_name}` : 'Site: Unassigned'}
                </span>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onNavigateToEquipment(alert.equipment_id)}
                    className="text-xs text-slate-800 hover:text-slate-950 font-bold px-3 py-1.5 rounded-xl bg-white border border-slate-300 flex items-center gap-1 shadow-2xs hover:bg-slate-100 transition"
                  >
                    <span>Inspect</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-600" />
                  </button>

                  <button
                    onClick={() => handleResolve(alert.alert_id)}
                    disabled={resolvingId === alert.alert_id}
                    className="text-xs text-emerald-950 hover:text-white font-black px-3.5 py-1.5 rounded-xl bg-emerald-100 hover:bg-emerald-700 border border-emerald-300 flex items-center gap-1 shadow-2xs transition disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 group-hover:text-white" />
                    <span>{resolvingId === alert.alert_id ? 'Resolving...' : 'Resolve'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
