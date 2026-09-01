import React, { useState, useEffect } from 'react';
import { X, Gauge, Fuel, Clock, MapPin, AlertCircle, ArrowRight } from 'lucide-react';
import { EquipmentResponse } from '../../api/equipment';
import { createUsageLog } from '../../api/usage';

interface LogUsageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  preselectedEquipment?: EquipmentResponse | null;
  equipments: EquipmentResponse[];
}

export const LogUsageModal: React.FC<LogUsageModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  preselectedEquipment,
  equipments
}) => {
  const [equipmentId, setEquipmentId] = useState<string>('');
  const [timestamp, setTimestamp] = useState<string>('');
  const [engineHours, setEngineHours] = useState<string>('3.5');
  const [idleHours, setIdleHours] = useState<string>('1.0');
  const [fuelUsed, setFuelUsed] = useState<string>('40.0');
  const [latitude, setLatitude] = useState<string>('');
  const [longitude, setLongitude] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (preselectedEquipment) {
        setEquipmentId(preselectedEquipment.equipment_id);
      } else if (equipments.length > 0) {
        setEquipmentId(equipments[0].equipment_id);
      }
      setTimestamp(new Date().toISOString().slice(0, 16));
    }
  }, [isOpen, preselectedEquipment, equipments]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!equipmentId) {
      setError('Please select an equipment asset.');
      return;
    }

    const eng = parseFloat(engineHours);
    const idl = parseFloat(idleHours);
    const fuel = parseFloat(fuelUsed);

    if (isNaN(eng) || eng < 0 || isNaN(idl) || idl < 0 || isNaN(fuel) || fuel < 0) {
      setError('Engine hours, idle hours, and fuel used must be valid non-negative numbers.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const isoTimestamp = new Date(timestamp).toISOString();

      await createUsageLog({
        equipment_id: equipmentId,
        timestamp: isoTimestamp,
        engine_hours: eng,
        idle_hours: idl,
        fuel_used: fuel,
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined
      });

      onSuccess(`Telemetry logged for ${equipmentId}: ${eng} hrs engine, ${idl} hrs idle, ${fuel} L fuel.`);
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to record telemetry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white border border-slate-200/90 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-sky-600 text-white font-black rounded-xl shadow-soft">
              <Gauge className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Log Equipment Telemetry</h3>
              <p className="text-xs text-slate-500 font-medium">Record machine engine, idle hours, and fuel consumption</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span className="font-semibold">{error}</span>
            </div>
          )}

          {/* Equipment Asset */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Equipment Asset
            </label>
            <select
              value={equipmentId}
              onChange={(e) => setEquipmentId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-amber-400 focus:bg-white transition"
              disabled={!!preselectedEquipment}
            >
              {equipments.map((eq) => (
                <option key={eq.equipment_id} value={eq.equipment_id}>
                  {eq.equipment_id} &bull; {eq.equipment_type} ({eq.status})
                </option>
              ))}
            </select>
          </div>

          {/* Log Timestamp */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              Log Date &amp; Time
            </label>
            <input
              type="datetime-local"
              value={timestamp}
              onChange={(e) => setTimestamp(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-amber-400 focus:bg-white transition"
              required
            />
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-3 gap-3">
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
                required
              />
            </div>

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
                required
              />
            </div>

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
                required
              />
            </div>
          </div>

          {/* Optional GPS */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-[11px] text-slate-500 mb-1 font-semibold flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-600" /> Latitude (Optional)
              </label>
              <input
                type="number"
                step="0.000001"
                placeholder="e.g. 30.2672"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono font-semibold focus:outline-none focus:border-amber-400 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-500 mb-1 font-semibold flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-600" /> Longitude (Optional)
              </label>
              <input
                type="number"
                step="0.000001"
                placeholder="e.g. -97.7431"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono font-semibold focus:outline-none focus:border-amber-400 focus:bg-white transition"
              />
            </div>
          </div>

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
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs transition disabled:opacity-50 shadow-soft"
            >
              <span>{loading ? 'Submitting Telemetry...' : 'Record Telemetry'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
