import React, { useState, useEffect } from 'react';
import {
  Truck,
  Search,
  Plus,
  RefreshCw,
  ArrowUpRight,
  MapPin,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import { EquipmentResponse, fetchEquipmentList } from '../../api/equipment';
import { fetchSites, SiteResponse } from '../../api/sites';
import { StatusBadge } from '../StatusBadge';

interface FleetViewProps {
  onNavigateToEquipment: (equipmentId: string) => void;
  onOpenCheckout: (equipment?: EquipmentResponse) => void;
  onOpenLogUsage: (equipment?: EquipmentResponse) => void;
  onOpenCreateEquipment: () => void;
  refreshTrigger: number;
}

export const FleetView: React.FC<FleetViewProps> = ({
  onNavigateToEquipment,
  onOpenCheckout,
  onOpenLogUsage,
  onOpenCreateEquipment,
  refreshTrigger
}) => {
  const [equipmentList, setEquipmentList] = useState<EquipmentResponse[]>([]);
  const [sites, setSites] = useState<SiteResponse[]>([]);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [siteFilter, setSiteFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadFleet = async () => {
    setLoading(true);
    setError(null);
    try {
      const [eqData, siteData] = await Promise.all([
        fetchEquipmentList({
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
          equipment_type: typeFilter !== 'ALL' ? typeFilter : undefined,
          site_id: siteFilter !== 'ALL' ? siteFilter : undefined,
          search: search.trim() ? search.trim() : undefined
        }),
        fetchSites()
      ]);
      setEquipmentList(eqData);
      setSites(siteData);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch customer equipment inventory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFleet();
  }, [statusFilter, typeFilter, siteFilter, refreshTrigger]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadFleet();
  };

  const machineTypes = ['Excavator', 'Bulldozer', 'Crane', 'Grader'];

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200/80">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5 tracking-tight">
            <Truck className="w-5 h-5 text-amber-500" />
            Your Rented Equipment Directory
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Full directory of machinery rented by your organization across Texas construction sites
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={onOpenCreateEquipment}
            className="px-4 py-2 bg-cat-yellow hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-soft transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Asset</span>
          </button>
          <button
            onClick={loadFleet}
            disabled={loading}
            className="p-2 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-xl text-slate-600 shadow-2xs transition"
            title="Refresh Directory"
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

      {/* Filter & Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <form onSubmit={handleSearchSubmit} className="sm:col-span-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search ID or Type..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:bg-white transition"
              />
            </div>
            <button
              type="submit"
              className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition"
            >
              Search
            </button>
          </form>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-400 focus:bg-white transition"
            >
              <option value="ALL">All Statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="RENTED">Rented (On Site)</option>
              <option value="UNASSIGNED">Unassigned (In Yard)</option>
              <option value="OVERDUE">Overdue</option>
              <option value="MAINTENANCE">Maintenance</option>
            </select>
          </div>

          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-400 focus:bg-white transition"
            >
              <option value="ALL">All Equipment Types</option>
              {machineTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={siteFilter}
              onChange={(e) => setSiteFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-400 focus:bg-white transition"
            >
              <option value="ALL">All Job Sites</option>
              {sites.map((s) => (
                <option key={s.site_id} value={s.site_id}>{s.site_id}: {s.site_name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Equipment Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200/80 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-5">Asset ID</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Job Site</th>
                <th className="py-3.5 px-4">Operator</th>
                <th className="py-3.5 px-4">Engine / Idle Hrs</th>
                <th className="py-3.5 px-4">Fuel Burn</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {equipmentList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 bg-slate-50">
                    No equipment matched the specified filters.
                  </td>
                </tr>
              ) : (
                equipmentList.map((eq) => (
                  <tr key={eq.equipment_id} className="hover:bg-slate-50/80 transition">
                    <td className="py-4 px-5 font-mono font-bold text-slate-900 flex items-center space-x-1.5">
                      <span className="text-amber-500 font-black">#</span>
                      <span>{eq.equipment_id}</span>
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-800">{eq.equipment_type}</td>
                    <td className="py-4 px-4">
                      <StatusBadge status={eq.status} />
                    </td>
                    <td className="py-4 px-4">
                      {eq.site_name ? (
                        <span className="text-slate-800 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                          {eq.site_name}
                        </span>
                      ) : (
                        <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-md text-[11px]">
                          Unassigned (In Yard)
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {eq.operator_name ? (
                        <span className="text-slate-800 flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                          {eq.operator_name}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-4 px-4 font-mono">
                      <span className="text-slate-900 font-bold">{eq.usage_summary ? Number(eq.usage_summary.total_engine_hours).toFixed(1) : '0.0'}h</span>
                      <span className="text-slate-500 text-[10px] ml-1.5">/ {eq.usage_summary ? Number(eq.usage_summary.total_idle_hours).toFixed(1) : '0.0'}h idle</span>
                    </td>
                    <td className="py-4 px-4 font-mono text-sky-700 font-bold">
                      {eq.usage_summary ? Number(eq.usage_summary.total_fuel_used).toFixed(0) : '0'} L
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {eq.status === 'AVAILABLE' && (
                          <button
                            onClick={() => onOpenCheckout(eq)}
                            className="text-[11px] text-slate-950 bg-cat-yellow hover:bg-amber-400 font-bold px-2.5 py-1 rounded-lg shadow-2xs transition"
                          >
                            Check Out
                          </button>
                        )}
                        <button
                          onClick={() => onOpenLogUsage(eq)}
                          className="text-[11px] text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/90 shadow-2xs transition"
                        >
                          Log
                        </button>
                        <button
                          onClick={() => onNavigateToEquipment(eq.equipment_id)}
                          className="text-[11px] text-amber-900 hover:text-slate-950 font-bold bg-amber-100 hover:bg-cat-yellow px-3 py-1 rounded-lg border border-amber-300 flex items-center gap-1 shadow-2xs transition"
                        >
                          <span>Inspect</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </div>
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
