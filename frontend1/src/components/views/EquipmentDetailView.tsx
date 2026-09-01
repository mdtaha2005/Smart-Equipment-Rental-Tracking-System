import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Gauge,
  Clock,
  MapPin,
  UserCheck,
  RefreshCw,
  AlertCircle,
  PlusCircle,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Sparkles
} from 'lucide-react';
import { EquipmentPerformance, fetchEquipmentPerformance } from '../../api/analytics';
import { RecommendationResponse, fetchRecommendations, updateRecommendationStatus } from '../../api/recommendations';
import { StatusBadge } from '../StatusBadge';
import { RentalResponse } from '../../api/rentals';

interface EquipmentDetailViewProps {
  equipmentId: string;
  onBack: () => void;
  onOpenCheckout: (equipmentId: string) => void;
  onOpenCheckin: (rental: RentalResponse) => void;
  onOpenLogUsage: (equipmentId: string) => void;
  refreshTrigger: number;
}

export const EquipmentDetailView: React.FC<EquipmentDetailViewProps> = ({
  equipmentId,
  onBack,
  onOpenCheckout,
  onOpenCheckin,
  onOpenLogUsage,
  refreshTrigger
}) => {
  const [perf, setPerf] = useState<EquipmentPerformance | null>(null);
  const [recs, setRecs] = useState<RecommendationResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [perfData, recsData] = await Promise.all([
        fetchEquipmentPerformance(equipmentId),
        fetchRecommendations({ equipment_id: equipmentId })
      ]);
      setPerf(perfData);
      setRecs(recsData);
    } catch (err: any) {
      setError(err?.message || `Failed to fetch intelligence details for ${equipmentId}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [equipmentId, refreshTrigger]);

  const handleRecStatus = async (recId: string, status: 'ACCEPTED' | 'DISMISSED') => {
    try {
      await updateRecommendationStatus(recId, status);
      loadData();
    } catch (err) {
      console.error('Failed to update recommendation status:', err);
    }
  };

  if (loading && !perf) {
    return (
      <div className="p-16 text-center text-slate-600 flex flex-col items-center justify-center space-y-4 bg-white rounded-3xl border-2 border-slate-200 shadow-soft">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-slate-950 shadow-soft">
          <RefreshCw className="w-6 h-6 animate-spin text-amber-700" />
        </div>
        <div>
          <h4 className="text-base font-black text-slate-950">Aggregating Asset Telemetry</h4>
          <p className="text-xs text-slate-600 font-semibold mt-1">
            Computing machine operating efficiency, idle ratios, and predictive recommendations for #{equipmentId}...
          </p>
        </div>
      </div>
    );
  }

  if (error || !perf) {
    return (
      <div className="space-y-4">
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-2 text-xs text-slate-950 hover:text-black font-black bg-cat-yellow px-4 py-2 rounded-xl border border-slate-900 shadow-2xs transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Equipment Directory</span>
        </button>
        <div className="p-5 bg-rose-50 border-2 border-rose-300 rounded-2xl text-rose-950 text-xs flex items-center space-x-3 shadow-2xs">
          <AlertCircle className="w-5 h-5 text-rose-700 flex-shrink-0" />
          <span className="font-black">{error || 'Asset intelligence record not found'}</span>
        </div>
      </div>
    );
  }

  const activeRec = recs.find((r) => r.status === 'PENDING') || recs[0];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-slate-200">
        <div className="flex items-center space-x-3.5">
          <button
            onClick={onBack}
            className="p-2.5 bg-white hover:bg-slate-100 text-slate-800 border-2 border-slate-300 rounded-xl text-xs transition shadow-2xs font-bold"
            title="Back to directory"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2.5">
              <h2 className="text-2xl font-black text-slate-950 tracking-tight flex items-center gap-1.5">
                <span className="text-amber-600 font-mono font-black">#</span>{perf.equipment_id}
              </h2>
              <span className="text-base font-bold text-slate-700">({perf.equipment_type})</span>
              <StatusBadge status={perf.status} size="md" />
            </div>
            <p className="text-xs text-slate-600 mt-0.5 font-bold">
              Customer Rented Machine Intelligence &bull; Deployed at {perf.site_name || 'Unassigned Site'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2.5">
          {perf.status === 'AVAILABLE' && (
            <button
              onClick={() => onOpenCheckout(perf.equipment_id)}
              className="px-4 py-2 bg-cat-yellow hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-soft transition border border-slate-900"
            >
              <span>+ Check Out Asset</span>
            </button>
          )}

          {perf.status === 'RENTED' && perf.rental_id && (
            <button
              onClick={() => onOpenCheckin({
                rental_id: perf.rental_id!,
                equipment_id: perf.equipment_id,
                equipment_type: perf.equipment_type,
                site_name: perf.site_name,
                checkout_date: perf.checkout_date?.toString() || '',
                expected_checkin_date: perf.expected_return?.toString() || '',
                status: 'ACTIVE',
                created_at: '',
                updated_at: ''
              })}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-black rounded-xl text-xs flex items-center gap-1.5 shadow-soft transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Check In Return</span>
            </button>
          )}

          <button
            onClick={() => onOpenLogUsage(perf.equipment_id)}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-900 border-2 border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition"
          >
            <Gauge className="w-4 h-4 text-sky-700" />
            <span>Log Telemetry</span>
          </button>

          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 bg-white hover:bg-slate-100 border-2 border-slate-300 rounded-xl text-slate-800 shadow-2xs transition"
            title="Refresh Asset Details"
          >
            <RefreshCw className={`w-4 h-4 text-amber-700 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 4-STAGE NARRATIVE HIERARCHY */}

      {/* 1. WHAT IS THIS MACHINE DOING? */}
      <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-soft space-y-5">
        <div className="flex items-center space-x-3 pb-3 border-b-2 border-slate-100">
          <span className="w-7 h-7 rounded-full bg-cat-yellow text-slate-950 font-black text-xs flex items-center justify-center shadow-2xs border border-slate-900">
            1
          </span>
          <h3 className="text-sm font-black text-slate-950 uppercase tracking-wider">
            What is this machine doing? (Current Operating State)
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-300 shadow-2xs">
            <span className="text-xs text-slate-600 font-bold block">Total Engine Load</span>
            <span className="text-2xl font-black text-emerald-800 font-mono mt-1 block">
              {Number(perf.total_engine_hours).toFixed(1)} hrs
            </span>
            <span className="text-xs text-slate-600 mt-1 block font-semibold">Avg: {perf.avg_engine_hours_day}h / day</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-300 shadow-2xs">
            <span className="text-xs text-slate-600 font-bold block">Total Standby Idle</span>
            <span className="text-2xl font-black text-amber-800 font-mono mt-1 block">
              {Number(perf.total_idle_hours).toFixed(1)} hrs
            </span>
            <span className="text-xs text-slate-600 mt-1 block font-semibold">Avg: {perf.avg_idle_hours_day}h / day</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-300 shadow-2xs">
            <span className="text-xs text-slate-600 font-bold block">Utilization Rate</span>
            <span className="text-2xl font-black text-slate-950 font-mono mt-1 block">
              {perf.utilization_rate}%
            </span>
            <span className="text-xs text-slate-600 mt-1 block font-semibold">Active Operating Ratio</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-300 shadow-2xs">
            <span className="text-xs text-slate-600 font-bold block">Idle Standby Ratio</span>
            <span className="text-2xl font-black text-rose-800 font-mono mt-1 block">
              {perf.idle_percentage}%
            </span>
            <span className="text-xs text-slate-600 mt-1 block font-semibold">Rental Budget Waste</span>
          </div>
        </div>

        {/* Deployment Context */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-300">
            <span className="text-slate-600 block text-xs font-bold">Deployed Job Site</span>
            <span className="font-black text-slate-950 flex items-center gap-1.5 mt-1 text-sm">
              <MapPin className="w-4 h-4 text-amber-600" />
              {perf.site_name || 'Unassigned (In Yard)'}
            </span>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-300">
            <span className="text-slate-600 block text-xs font-bold">Assigned Operator</span>
            <span className="font-black text-slate-950 flex items-center gap-1.5 mt-1 text-sm">
              <UserCheck className="w-4 h-4 text-emerald-700" />
              {perf.operator_name || 'None Assigned'}
            </span>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-300">
            <span className="text-slate-600 block text-xs font-bold">Rental Contract Return</span>
            <span className="font-mono font-black text-amber-950 block mt-1 text-sm">
              {perf.expected_return ? new Date(perf.expected_return).toLocaleDateString() : 'Active Rental'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. WHY DOES IT MATTER? */}
      <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-soft space-y-4">
        <div className="flex items-center space-x-3 pb-3 border-b-2 border-slate-100">
          <span className="w-7 h-7 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-2xs border border-slate-900">
            2
          </span>
          <h3 className="text-sm font-black text-slate-950 uppercase tracking-wider">
            Why does it matter? (Operational Anomalies &amp; Business Value)
          </h3>
        </div>

        {/* Explainable Business Insights Banner */}
        <div className="p-5 bg-gradient-to-r from-amber-100/70 via-white to-amber-50/50 border-2 border-amber-300 rounded-2xl flex items-start space-x-3.5 shadow-2xs">
          <Lightbulb className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-black text-amber-950 uppercase tracking-wider">
              Rental Value &amp; Telematics Assessment
            </h4>
            <p className="text-xs text-slate-900 mt-1.5 leading-relaxed font-bold">
              {perf.business_insight}
            </p>
          </div>
        </div>

        {/* Attention / Active Anomalies */}
        {perf.active_anomalies.length > 0 && (
          <div className="p-5 bg-amber-50 border-2 border-amber-300 rounded-2xl space-y-2 text-xs shadow-2xs">
            <div className="flex items-center space-x-2 text-amber-950 font-black text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
              <span>Active Operational Anomalies Detected on this Machine</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-900 text-xs font-bold">
              {perf.active_anomalies.map((anom, idx) => (
                <li key={idx}>{anom}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* 3. WHAT COULD HAPPEN NEXT? Daily Telemetry Chart */}
      <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-soft space-y-5">
        <div className="flex items-center space-x-3 pb-3 border-b-2 border-slate-100">
          <span className="w-7 h-7 rounded-full bg-sky-600 text-white font-black text-xs flex items-center justify-center shadow-2xs">
            3
          </span>
          <h3 className="text-sm font-black text-slate-950 uppercase tracking-wider">
            What could happen next? (Predictive Trend &amp; Telemetry Feed)
          </h3>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <p className="text-xs text-slate-700 font-bold">
            Daily engine operating hours vs idle standby recorded across the 15-day rental window
          </p>
          <div className="flex items-center space-x-3 text-xs font-bold">
            <span className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-emerald-600" />
              <span className="text-slate-900">Productive Engine Load</span>
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="text-slate-900">Standby Idle Waste</span>
            </span>
          </div>
        </div>

        {perf.daily_trend.length === 0 ? (
          <p className="text-xs text-slate-600 py-6 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 font-bold">
            No daily telemetry points available.
          </p>
        ) : (
          <div className="space-y-2.5 pt-2">
            {perf.daily_trend.map((pt) => {
              const eng = pt.engine_hours;
              const idl = pt.idle_hours;
              const maxVal = Math.max(eng + idl, 14.0);
              const engPct = (eng / maxVal) * 100;
              const idlPct = (idl / maxVal) * 100;

              return (
                <div key={pt.date} className="flex items-center space-x-3 text-xs font-semibold">
                  <span className="w-24 font-mono text-slate-700 text-xs font-bold">{pt.date}</span>
                  <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden flex border border-slate-300 p-0.5 gap-0.5">
                    <div style={{ width: `${engPct}%` }} className="bg-emerald-600 rounded-l-full" title={`Engine: ${eng} hrs`} />
                    <div style={{ width: `${idlPct}%` }} className="bg-amber-500 rounded-r-full" title={`Idle: ${idl} hrs`} />
                  </div>
                  <span className="w-32 text-right font-mono text-xs text-slate-950 font-black">
                    {eng.toFixed(1)}e / {idl.toFixed(1)}i ({pt.utilization_rate}%)
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. WHAT SHOULD THE MANAGER CONSIDER? */}
      <div className="bg-white p-6 rounded-2xl border-2 border-amber-300 shadow-soft space-y-5">
        <div className="flex items-center space-x-3 pb-3 border-b-2 border-slate-100">
          <span className="w-7 h-7 rounded-full bg-emerald-700 text-white font-black text-xs flex items-center justify-center shadow-2xs">
            4
          </span>
          <h3 className="text-sm font-black text-slate-950 uppercase tracking-wider">
            What should the manager consider? (Smart Decision Support)
          </h3>
        </div>

        {activeRec ? (
          <div className="p-6 bg-gradient-to-br from-slate-50 to-white border-2 border-amber-300 rounded-2xl space-y-4 shadow-soft">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-amber-600" />
                <h4 className="text-xs font-black text-amber-950 uppercase tracking-wider">
                  Recommendation: {activeRec.recommendation_type}
                </h4>
              </div>
              <span className={`text-xs font-mono font-black px-3 py-1 rounded-full ${
                activeRec.priority === 'HIGH' ? 'bg-amber-200 text-amber-950 border border-amber-400' : 'bg-slate-200 text-slate-900'
              }`}>
                {activeRec.priority} Strength
              </span>
            </div>

            <p className="text-xs text-slate-950 leading-relaxed bg-amber-50/70 p-4 rounded-xl border border-amber-200 font-bold">
              {activeRec.reason}
            </p>

            <div className="flex items-center justify-between pt-1 text-xs">
              {activeRec.expected_utilization_gain ? (
                <span className="text-xs font-black text-emerald-950 bg-emerald-100 border border-emerald-300 px-3.5 py-1.5 rounded-xl shadow-2xs">
                  +{activeRec.expected_utilization_gain}% Est. Utilization Gain
                </span>
              ) : (
                <span className="text-xs text-slate-700 font-bold">Human Decision Support</span>
              )}

              {activeRec.status === 'PENDING' ? (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleRecStatus(activeRec.recommendation_id, 'ACCEPTED')}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-black rounded-xl text-xs flex items-center gap-1.5 shadow-soft transition"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Accept Recommendation</span>
                  </button>
                  <button
                    onClick={() => handleRecStatus(activeRec.recommendation_id, 'DISMISSED')}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition border border-slate-300"
                  >
                    Dismiss
                  </button>
                </div>
              ) : (
                <span className="text-xs font-black text-emerald-950 bg-emerald-100 border border-emerald-400 px-3.5 py-1 rounded-xl shadow-2xs">
                  Manager Decision: {activeRec.status}
                </span>
              )}
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-700 font-bold italic bg-slate-50 p-4 rounded-xl border border-slate-200">
            No active recommendations for this machine at this time. Telemetrics indicate regular operation.
          </p>
        )}
      </div>

      {/* Telemetry Logs Feed */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-soft overflow-hidden">
        <div className="px-6 py-5 border-b-2 border-slate-200 flex items-center justify-between bg-slate-50">
          <h3 className="text-sm font-black text-slate-950 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            Recent Telemetry Ingestion Feed
          </h3>
          <button
            onClick={() => onOpenLogUsage(perf.equipment_id)}
            className="text-xs bg-slate-950 hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl font-bold transition shadow-2xs flex items-center gap-1"
          >
            <PlusCircle className="w-4 h-4 text-cat-yellow" />
            <span>Add Log</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-800 font-medium">
            <thead className="bg-slate-100 text-slate-900 font-black border-b-2 border-slate-200 uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Log ID</th>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Engine (hrs)</th>
                <th className="py-3.5 px-4">Idle (hrs)</th>
                <th className="py-3.5 px-4">Fuel (L)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {perf.recent_logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500 font-bold">
                    No telemetry logs recorded.
                  </td>
                </tr>
              ) : (
                perf.recent_logs.map((log) => (
                  <tr key={log.usage_id} className="hover:bg-slate-50 transition">
                    <td className="py-4 px-4 font-mono text-slate-600 font-bold">{log.usage_id}</td>
                    <td className="py-4 px-4 font-mono text-slate-900 font-bold">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-4 px-4 font-mono font-black text-emerald-800">{Number(log.engine_hours).toFixed(1)}</td>
                    <td className="py-4 px-4 font-mono font-black text-amber-800">{Number(log.idle_hours).toFixed(1)}</td>
                    <td className="py-4 px-4 font-mono font-black text-sky-800">{Number(log.fuel_used).toFixed(1)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
