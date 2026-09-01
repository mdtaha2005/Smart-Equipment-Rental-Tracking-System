import React, { useState, useEffect } from 'react';
import { X, Calendar, Truck, MapPin, User, AlertCircle, ArrowRight } from 'lucide-react';
import { EquipmentResponse } from '../../api/equipment';
import { SiteResponse, fetchSites } from '../../api/sites';
import { OperatorResponse, fetchOperators } from '../../api/operators';
import { checkoutRental } from '../../api/rentals';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  preselectedEquipment?: EquipmentResponse | null;
  availableEquipments: EquipmentResponse[];
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  preselectedEquipment,
  availableEquipments
}) => {
  const [equipmentId, setEquipmentId] = useState<string>('');
  const [siteId, setSiteId] = useState<string>('');
  const [operatorId, setOperatorId] = useState<string>('');
  const [expectedReturnDate, setExpectedReturnDate] = useState<string>('');
  const [sites, setSites] = useState<SiteResponse[]>([]);
  const [operators, setOperators] = useState<OperatorResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (preselectedEquipment) {
        setEquipmentId(preselectedEquipment.equipment_id);
      } else if (availableEquipments.length > 0) {
        setEquipmentId(availableEquipments[0].equipment_id);
      } else {
        setEquipmentId('');
      }

      // Default expected return: 14 days from today
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 14);
      setExpectedReturnDate(defaultDate.toISOString().split('T')[0]);

      loadDropdownData();
    }
  }, [isOpen, preselectedEquipment, availableEquipments]);

  const loadDropdownData = async () => {
    try {
      const [sitesData, operatorsData] = await Promise.all([
        fetchSites(),
        fetchOperators()
      ]);
      setSites(sitesData);
      if (sitesData.length > 0) setSiteId(sitesData[0].site_id);
      setOperators(operatorsData.filter(op => op.status === 'ACTIVE'));
    } catch (err: any) {
      setError('Failed to load sites or operators from server.');
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!equipmentId) {
      setError('Please select an equipment unit.');
      return;
    }
    if (!siteId) {
      setError('Please select a destination job site.');
      return;
    }
    if (!expectedReturnDate) {
      setError('Please specify an expected return date.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const checkoutIso = new Date().toISOString();
      const expectedCheckinIso = new Date(expectedReturnDate + 'T18:00:00Z').toISOString();

      await checkoutRental({
        equipment_id: equipmentId,
        site_id: siteId,
        operator_id: operatorId ? operatorId : null,
        checkout_date: checkoutIso,
        expected_checkin_date: expectedCheckinIso
      });

      onSuccess(`Equipment ${equipmentId} successfully checked out!`);
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Check-out request failed.');
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
            <div className="p-2.5 bg-cat-yellow text-slate-950 font-black rounded-xl shadow-soft">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Equipment Check-Out</h3>
              <p className="text-xs text-slate-500 font-medium">Initiate new rental contract and assign deployment site</p>
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

          {/* Equipment Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-amber-500" />
              Select Equipment Asset
            </label>
            <select
              value={equipmentId}
              onChange={(e) => setEquipmentId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-amber-400 focus:bg-white transition"
              disabled={!!preselectedEquipment}
            >
              {preselectedEquipment ? (
                <option value={preselectedEquipment.equipment_id}>
                  {preselectedEquipment.equipment_id} &bull; {preselectedEquipment.equipment_type} ({preselectedEquipment.status})
                </option>
              ) : availableEquipments.length > 0 ? (
                availableEquipments.map((eq) => (
                  <option key={eq.equipment_id} value={eq.equipment_id}>
                    {eq.equipment_id} &bull; {eq.equipment_type} ({eq.status})
                  </option>
                ))
              ) : (
                <option value="">No available equipment found</option>
              )}
            </select>
          </div>

          {/* Site Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-sky-600" />
              Destination Job Site
            </label>
            <select
              value={siteId}
              onChange={(e) => setSiteId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-amber-400 focus:bg-white transition"
            >
              {sites.map((s) => (
                <option key={s.site_id} value={s.site_id}>
                  {s.site_id}: {s.site_name} ({s.location})
                </option>
              ))}
            </select>
          </div>

          {/* Operator Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-600" />
              Assigned Operator (Optional)
            </label>
            <select
              value={operatorId}
              onChange={(e) => setOperatorId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-amber-400 focus:bg-white transition"
            >
              <option value="">-- No operator assigned (Autonomous / Site Driver) --</option>
              {operators.map((op) => (
                <option key={op.operator_id} value={op.operator_id}>
                  {op.operator_id}: {op.operator_name} (Active)
                </option>
              ))}
            </select>
          </div>

          {/* Expected Return Date */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-500" />
              Expected Return Date
            </label>
            <input
              type="date"
              value={expectedReturnDate}
              onChange={(e) => setExpectedReturnDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-amber-400 focus:bg-white transition"
              required
            />
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
              disabled={loading || (!equipmentId && !preselectedEquipment)}
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-cat-yellow hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition disabled:opacity-50 shadow-soft"
            >
              <span>{loading ? 'Processing Checkout...' : 'Confirm Check-Out'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
