import React, { useState } from 'react';
import { X, CheckCircle2, Gauge, Fuel, Clock, AlertCircle, ArrowRight } from 'lucide-react';
import { RentalResponse, checkinRental } from '../../api/rentals';

interface CheckinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  rental: RentalResponse | null;
}

export const CheckinModal: React.FC<CheckinModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  rental
}) => {
  const [engineHours, setEngineHours] = useState<string>('4.0');
  const [idleHours, setIdleHours] = useState<string>('1.0');
  const [fuelUsed, setFuelUsed] = useState<string>('45.0');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !rental) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const actualCheckinIso = new Date().toISOString();

      await checkinRental(rental.rental_id, {
        actual_checkin_date: actualCheckinIso,
        engine_hours: engineHours ? parseFloat(engineHours) : undefined,
        idle_hours: idleHours ? parseFloat(idleHours) : undefined,
        fuel_used: fuelUsed ? parseFloat(fuelUsed) : undefined
      });

      onSuccess(`Equipment ${rental.equipment_id} checked in successfully! Contract ${rental.rental_id} completed.`);
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Check-in request failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white border border-slate-200/90 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-600 text-white font-black rounded-xl shadow-soft">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Equipment Check-In</h3>
              <p className="text-xs text-slate-500 font-medium">Complete rental contract and record final return telemetry</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span className="font-semibold">{error}</span>
            </div>
          )}

          {/* Rental Contract Summary Card */}
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2 text-xs font-medium">
            <div className="flex justify-between">
              <span className="text-slate-500">Contract ID:</span>
              <span className="font-mono font-bold text-amber-900">{rental.rental_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Equipment:</span>
              <span className="font-bold text-slate-900">{rental.equipment_id} ({rental.equipment_type || 'Machine'})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Deployed Site:</span>
              <span className="text-slate-800 font-semibold">{rental.site_name || rental.site_id || 'Unassigned'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Checkout Date:</span>
              <span className="text-slate-700">{new Date(rental.checkout_date).toLocaleDateString()}</span>
            </div>
          </div>

          <p className="text-xs font-bold text-slate-800 pt-1">
            Optional Final Return Telemetry (Hours &amp; Fuel):
          </p>

          <div className="grid grid-cols-3 gap-3">
            {/* Engine Hours */}
            <div>
              <label className="block text-[11px] text-slate-500 mb-1 font-semibold flex items-center gap-1">
                <Gauge className="w-3 h-3 text-emerald-600" /> Engine (hrs)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={engineHours}
                onChange={(e) => setEngineHours(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono font-semibold focus:outline-none focus:border-amber-400 focus:bg-white transition"
              />
            </div>

            {/* Idle Hours */}
            <div>
              <label className="block text-[11px] text-slate-500 mb-1 font-semibold flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-600" /> Idle (hrs)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={idleHours}
                onChange={(e) => setIdleHours(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono font-semibold focus:outline-none focus:border-amber-400 focus:bg-white transition"
              />
            </div>

            {/* Fuel Used */}
            <div>
              <label className="block text-[11px] text-slate-500 mb-1 font-semibold flex items-center gap-1">
                <Fuel className="w-3 h-3 text-sky-600" /> Fuel (L)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={fuelUsed}
                onChange={(e) => setFuelUsed(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono font-semibold focus:outline-none focus:border-amber-400 focus:bg-white transition"
              />
            </div>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed bg-emerald-50/60 p-3 rounded-xl border border-emerald-100 font-medium">
            Checking in will transition the machine to <strong className="text-emerald-700">AVAILABLE</strong>, mark contract <strong className="text-slate-800">COMPLETED</strong>, and clear current job site assignments while preserving complete historical telemetry.
          </p>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition disabled:opacity-50 shadow-soft"
            >
              <span>{loading ? 'Processing Return...' : 'Complete Check-In'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
