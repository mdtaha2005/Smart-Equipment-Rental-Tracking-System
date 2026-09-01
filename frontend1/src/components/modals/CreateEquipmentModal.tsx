import React, { useState } from 'react';
import { X, Plus, Truck, AlertCircle, ArrowRight } from 'lucide-react';
import { createEquipment } from '../../api/equipment';

interface CreateEquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export const CreateEquipmentModal: React.FC<CreateEquipmentModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [equipmentId, setEquipmentId] = useState<string>('');
  const [equipmentType, setEquipmentType] = useState<string>('Excavator');
  const [statusVal, setStatusVal] = useState<string>('AVAILABLE');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!equipmentId.trim()) {
      setError('Equipment ID is required (e.g. EQX1008).');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formattedId = equipmentId.trim().toUpperCase();
      await createEquipment({
        equipment_id: formattedId,
        equipment_type: equipmentType,
        status: statusVal
      });

      onSuccess(`New equipment ${formattedId} (${equipmentType}) added to fleet!`);
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to create equipment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white border border-slate-200/90 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-cat-yellow text-slate-950 font-black rounded-xl shadow-soft">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Add Equipment Asset</h3>
              <p className="text-xs text-slate-500 font-medium">Register new machine to the tracking system</p>
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

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Equipment ID / Tag
            </label>
            <input
              type="text"
              placeholder="e.g. EQX1008"
              value={equipmentId}
              onChange={(e) => setEquipmentId(e.target.value.toUpperCase())}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono font-semibold focus:outline-none focus:border-amber-400 focus:bg-white transition"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-amber-500" />
              Equipment Classification
            </label>
            <select
              value={equipmentType}
              onChange={(e) => setEquipmentType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-amber-400 focus:bg-white transition"
            >
              <option value="Excavator">Excavator</option>
              <option value="Bulldozer">Bulldozer</option>
              <option value="Crane">Crane</option>
              <option value="Grader">Grader</option>
              <option value="Wheel Loader">Wheel Loader</option>
              <option value="Compactor">Compactor</option>
              <option value="Backhoe">Backhoe</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Initial Operational Status
            </label>
            <select
              value={statusVal}
              onChange={(e) => setStatusVal(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-amber-400 focus:bg-white transition"
            >
              <option value="AVAILABLE">AVAILABLE (Ready for rental)</option>
              <option value="UNASSIGNED">UNASSIGNED (In yard)</option>
              <option value="MAINTENANCE">MAINTENANCE (Servicing)</option>
            </select>
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
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-cat-yellow hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition disabled:opacity-50 shadow-soft"
            >
              <span>{loading ? 'Creating...' : 'Add Equipment'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
