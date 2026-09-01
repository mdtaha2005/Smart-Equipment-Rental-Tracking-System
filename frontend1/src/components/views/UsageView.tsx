import React, { useState, useEffect } from 'react';
import {
  Gauge,
  RefreshCw,
  Plus,
  Filter,
  AlertCircle,
  MapPin,
  Clock,
  Fuel,
  TrendingUp
} from 'lucide-react';
import { UsageLogResponse, fetchUsageLogs } from '../../api/usage';
import { EquipmentResponse, fetchEquipmentList } from '../../api/equipment';

interface UsageViewProps {
  onOpenLogUsage: (equipmentId?: string) => void;
  onNavigateToEquipment: (equipmentId: string) => void;
  refreshTrigger: number;
}

export const UsageView: React.FC<UsageViewProps> = ({
  onOpenLogUsage,
  onNavigateToEquipment,
  refreshTrigger
}) => {
  const [logs, setLogs] = useState<UsageLogResponse[]>([]);
  const [equipments, setEquipments] = useState<EquipmentResponse[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<string>('ALL');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [logsData, eqData] = await Promise.all([
        fetchUsageLogs({
          equipment_id: selectedEquipment !== 'ALL' ? selectedEquipment : undefined,
          limit: 100
        }),
        fetchEquipmentList()
      ]);
      setLogs(logsData);
      setEquipments(eqData);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch telemetry feed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedEquipment, refreshTrigger]);

  // Aggregate totals
  const totalEngine = logs.reduce((acc, curr) => acc + Number(curr.engine_hours), 0);
  const totalIdle = logs.reduce((acc, curr) => acc + Number(curr.idle_hours), 0);
  const totalFuel = logs.reduce((acc, curr) => acc + Number(curr.fuel_used), 0);
  const totalHours = totalEngine + totalIdle;
  const utilRate = totalHours > 0 ? ((totalEngine / totalHours) * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200/80">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5 tracking-tight">
            <Gauge className="w-5 h-5 text-amber-500" />
            Equipment Telemetry &amp; Usage Logs
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Immutable telematics feed capturing machine operating hours, standby ratios, and fuel burn
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => onOpenLogUsage(selectedEquipment !== 'ALL' ? selectedEquipment : undefined)}
            className="px-4 py-2 bg-cat-yellow hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-soft transition"
          >
            <Plus className="w-4 h-4" />
            <span>Record Telemetry</span>
          </button>
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-xl text-slate-600 shadow-2xs transition"
            title="Refresh Feed"
          >
            <RefreshCw className={`w-4 h-4 text-amber-500 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-center space-x-3 shadow-2xs">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {/* Aggregate Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-soft">
          <span className="text-xs text-slate-500 font-semibold flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-emerald-600" /> Total Engine Load
          </span>
          <span className="text-2xl font-black text-emerald-600 font-mono mt-1.5 block">
            {totalEngine.toFixed(1)} hrs
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block font-medium">Active work</span>
        </div>

        <div className="bg-white border border-amber-200/90 p-5 rounded-2xl shadow-soft">
          <span className="text-xs text-amber-900 font-semibold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-600" /> Standby Idle
          </span>
          <span className="text-2xl font-black text-amber-600 font-mono mt-1.5 block">
            {totalIdle.toFixed(1)} hrs
          </span>
          <span className="text-[11px] text-amber-800 mt-0.5 block font-medium">Idle time</span>
        </div>

        <div className="bg-white border border-sky-200/90 p-5 rounded-2xl shadow-soft">
          <span className="text-xs text-sky-900 font-semibold flex items-center gap-1.5">
            <Fuel className="w-3.5 h-3.5 text-sky-600" /> Fuel Burned
          </span>
          <span className="text-2xl font-black text-sky-600 font-mono mt-1.5 block">
            {totalFuel.toFixed(0)} L
          </span>
          <span className="text-[11px] text-sky-800 mt-0.5 block font-medium">Diesel consumption</span>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-soft">
          <span className="text-xs text-slate-500 font-semibold flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-slate-700" /> Operating Ratio
          </span>
          <span className="text-2xl font-black text-slate-900 font-mono mt-1.5 block">
            {utilRate}%
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block font-medium">Engine vs total</span>
        </div>
      </div>

      {/* Filter Selector */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <Filter className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-bold text-slate-900">Filter by Equipment Asset:</span>
        </div>
        <select
          value={selectedEquipment}
          onChange={(e) => setSelectedEquipment(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-amber-400 focus:bg-white font-medium transition"
        >
          <option value="ALL">All Equipment Assets ({equipments.length})</option>
          {equipments.map((eq) => (
            <option key={eq.equipment_id} value={eq.equipment_id}>
              {eq.equipment_id} &bull; {eq.equipment_type}
            </option>
          ))}
        </select>
      </div>

      {/* Telemetry Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200/80 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-5">Telemetry ID</th>
                <th className="py-3.5 px-4">Asset ID</th>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Contract ID</th>
                <th className="py-3.5 px-4">Engine (hrs)</th>
                <th className="py-3.5 px-4">Idle (hrs)</th>
                <th className="py-3.5 px-4">Fuel Burn (L)</th>
                <th className="py-3.5 px-5">GPS Telematics</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 bg-slate-50">
                    No telemetry records found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.usage_id} className="hover:bg-slate-50/80 transition">
                    <td className="py-4 px-5 font-mono text-slate-400">{log.usage_id}</td>
                    <td className="py-4 px-4 font-mono font-bold text-slate-900">
                      <button
                        onClick={() => onNavigateToEquipment(log.equipment_id)}
                        className="hover:text-amber-600 underline decoration-amber-300 transition"
                      >
                        #{log.equipment_id}
                      </button>
                    </td>
                    <td className="py-4 px-4 font-mono text-slate-600">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-4 px-4 font-mono text-slate-500">{log.rental_id || 'Direct'}</td>
                    <td className="py-4 px-4 font-mono font-bold text-emerald-600">{Number(log.engine_hours).toFixed(1)}</td>
                    <td className="py-4 px-4 font-mono font-bold text-amber-700">{Number(log.idle_hours).toFixed(1)}</td>
                    <td className="py-4 px-4 font-mono text-sky-700 font-bold">{Number(log.fuel_used).toFixed(1)}</td>
                    <td className="py-4 px-5 font-mono text-slate-500 text-[11px]">
                      {log.latitude && log.longitude ? (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-amber-500 flex-shrink-0" />
                          {Number(log.latitude).toFixed(4)}, {Number(log.longitude).toFixed(4)}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Site default</span>
                      )}
                    </td>
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
