import React, { useState, useEffect } from 'react';
import {
  Calendar,
  RefreshCw,
  Plus,
  AlertCircle,
  MapPin,
  UserCheck,
  ShieldAlert
} from 'lucide-react';
import { RentalResponse, fetchRentals } from '../../api/rentals';
import { StatusBadge } from '../StatusBadge';

interface RentalsViewProps {
  onOpenCheckout: () => void;
  onOpenCheckin: (rental: RentalResponse) => void;
  onNavigateToEquipment: (equipmentId: string) => void;
  refreshTrigger: number;
}

export const RentalsView: React.FC<RentalsViewProps> = ({
  onOpenCheckout,
  onOpenCheckin,
  onNavigateToEquipment,
  refreshTrigger
}) => {
  const [rentals, setRentals] = useState<RentalResponse[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadRentals = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchRentals({
        status: statusFilter !== 'ALL' ? statusFilter : undefined
      });
      setRentals(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load rental contracts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRentals();
  }, [statusFilter, refreshTrigger]);

  const now = new Date();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200/80">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5 tracking-tight">
            <Calendar className="w-5 h-5 text-amber-500" />
            Customer Rental Contracts &amp; Return Tracking
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Active and completed equipment rental agreements for your construction projects
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={onOpenCheckout}
            className="px-4 py-2 bg-cat-yellow hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-soft transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Check-Out</span>
          </button>
          <button
            onClick={loadRentals}
            disabled={loading}
            className="p-2 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-xl text-slate-600 shadow-2xs transition"
            title="Refresh Rentals"
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

      {/* Filter Tabs */}
      <div className="flex items-center space-x-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80 w-fit text-xs">
        {['ALL', 'ACTIVE', 'COMPLETED', 'OVERDUE'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-4 py-1.5 rounded-xl font-bold transition-all duration-150 ${
              statusFilter === st
                ? 'bg-white text-slate-900 shadow-soft'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Rentals Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200/80 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-5">Contract ID</th>
                <th className="py-3.5 px-4">Rented Equipment</th>
                <th className="py-3.5 px-4">Job Site</th>
                <th className="py-3.5 px-4">Operator</th>
                <th className="py-3.5 px-4">Checkout Date</th>
                <th className="py-3.5 px-4">Expected Return</th>
                <th className="py-3.5 px-4">Actual Return</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {rentals.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 bg-slate-50">
                    No rental records found matching status {statusFilter}.
                  </td>
                </tr>
              ) : (
                rentals.map((r) => {
                  const isOverdue = r.status === 'ACTIVE' && new Date(r.expected_checkin_date) < now;

                  return (
                    <tr key={r.rental_id} className="hover:bg-slate-50/80 transition">
                      <td className="py-4 px-5 font-mono font-bold text-amber-900">{r.rental_id}</td>
                      <td className="py-4 px-4">
                        <button
                          onClick={() => onNavigateToEquipment(r.equipment_id)}
                          className="font-mono font-bold text-slate-900 hover:text-amber-600 underline decoration-amber-300 transition"
                        >
                          #{r.equipment_id}
                        </button>
                        <span className="text-slate-500 text-[10px] block">{r.equipment_type || 'Machine'}</span>
                      </td>
                      <td className="py-4 px-4">
                        {r.site_name ? (
                          <span className="text-slate-800 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                            {r.site_name}
                          </span>
                        ) : (
                          <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-md text-[11px]">
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {r.operator_name ? (
                          <span className="text-slate-800 flex items-center gap-1.5">
                            <UserCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                            {r.operator_name}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">None</span>
                        )}
                      </td>
                      <td className="py-4 px-4 font-mono text-slate-600">{new Date(r.checkout_date).toLocaleDateString()}</td>
                      <td className="py-4 px-4 font-mono">
                        <span className={isOverdue ? 'text-rose-700 font-bold flex items-center gap-1 bg-rose-50 px-2 py-0.5 rounded-md' : 'text-slate-800 font-semibold'}>
                          {isOverdue && <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />}
                          {new Date(r.expected_checkin_date).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-mono text-slate-500">
                        {r.actual_checkin_date ? new Date(r.actual_checkin_date).toLocaleDateString() : '--'}
                      </td>
                      <td className="py-4 px-4">
                        <StatusBadge status={isOverdue ? 'OVERDUE' : r.status} />
                      </td>
                      <td className="py-4 px-5 text-right">
                        {r.status === 'ACTIVE' && (
                          <button
                            onClick={() => onOpenCheckin(r)}
                            className="text-[11px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-xl transition shadow-soft"
                          >
                            Check In
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
