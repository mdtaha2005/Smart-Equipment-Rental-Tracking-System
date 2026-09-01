import React, { useState } from 'react';
import {
  QrCode,
  Radio,
  Search,
  MapPin,
  UserCheck,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Info
} from 'lucide-react';
import { EquipmentDetailResponse, scanEquipmentTag } from '../../api/equipment';
import { StatusBadge } from '../StatusBadge';

interface ScannerViewProps {
  onNavigateToEquipment: (equipmentId: string) => void;
  onOpenCheckout: (equipmentId: string) => void;
  onOpenCheckin: (rental: any) => void;
  onOpenLogUsage: (equipmentId: string) => void;
}

export const ScannerView: React.FC<ScannerViewProps> = ({
  onNavigateToEquipment,
  onOpenCheckout,
  onOpenCheckin,
  onOpenLogUsage
}) => {
  const [tagInput, setTagInput] = useState<string>('TAG-EQX1001-QR');
  const [scannedEquipment, setScannedEquipment] = useState<EquipmentDetailResponse | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const sampleTags = [
    'TAG-EQX1001-QR',
    'TAG-EQX1001-RFID',
    'EQX1002',
    'EQX1003',
    'TAG-EQX1004-QR',
    'EQX1005',
    'EQX1006',
    'TAG-EQX1007-RFID'
  ];

  const executeScan = async (tag: string) => {
    if (!tag.trim()) {
      setError('Please enter or select an equipment tag to simulate scanning.');
      return;
    }

    setIsScanning(true);
    setError(null);
    setScannedEquipment(null);

    // Simulate optical barcode / RFID transponder reading latency
    setTimeout(async () => {
      try {
        const data = await scanEquipmentTag(tag.trim().toUpperCase());
        setScannedEquipment(data);
      } catch (err: any) {
        setError(err?.response?.data?.detail || err?.message || `Tag "${tag}" could not be identified in the fleet database.`);
      } finally {
        setIsScanning(false);
      }
    }, 450);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeScan(tagInput);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-3 border-b border-slate-200/80">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-amber-500 text-slate-950 font-black rounded-xl shadow-soft">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              Equipment Identification &amp; Tag Scanner
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Simulated optical QR and passive RFID receiver for field check-in, check-out, and asset verification
            </p>
          </div>
        </div>
      </div>

      {/* Simulation Notice Banner */}
      <div className="p-4 bg-amber-50 border border-amber-200/90 rounded-2xl text-amber-900 text-xs flex items-start space-x-3 shadow-2xs">
        <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-bold text-amber-900">Software Simulation Mode (Caterpillar Challenge)</p>
          <p className="text-slate-600 text-[11px] leading-relaxed font-medium">
            This module simulates industrial optical QR codes and RFID transponders affixed to rented Caterpillar machines. Tag inputs are resolved through the live backend API (<code>GET /api/equipment/tag/&#123;tag_id&#125;</code>).
          </p>
        </div>
      </div>

      {/* Interactive Scanner Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-soft space-y-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Visual Scanner HUD */}
          <div className="w-48 h-48 bg-slate-50 rounded-2xl border-2 border-dashed border-amber-400 relative flex flex-col items-center justify-center p-4 overflow-hidden group shadow-2xs">
            {isScanning ? (
              <div className="absolute inset-0 bg-amber-500/10 flex flex-col items-center justify-center">
                <div className="w-full h-1 bg-amber-500 shadow-[0_0_12px_#FFCD11] animate-bounce" />
                <span className="text-xs font-mono font-bold text-amber-800 mt-4 animate-pulse">SCANNING TAG...</span>
              </div>
            ) : (
              <>
                <QrCode className="w-20 h-20 text-slate-400 group-hover:text-amber-500 transition duration-300" />
                <span className="text-[10px] text-slate-500 mt-2 font-mono font-bold uppercase tracking-wider">RFID / QR Active</span>
              </>
            )}
          </div>

          {/* Scanner Controls Form */}
          <div className="flex-1 w-full space-y-4">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>Simulated RFID / QR Tag Identifier:</span>
                  <span className="text-amber-700 text-[11px] font-mono font-semibold">Format: TAG-EQX1001-QR / EQX1001</span>
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value.toUpperCase())}
                      placeholder="e.g. TAG-EQX1001-QR"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-sm text-slate-900 font-mono font-semibold focus:outline-none focus:border-amber-400 focus:bg-white transition"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isScanning}
                    className="px-5 py-2.5 bg-cat-yellow hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-soft transition disabled:opacity-50"
                  >
                    <span>{isScanning ? 'Reading...' : 'Scan Tag'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </form>

            {/* Quick Sample Tags */}
            <div>
              <span className="text-[11px] text-slate-500 font-semibold block mb-1.5">Preset Demonstration Tags:</span>
              <div className="flex flex-wrap gap-1.5">
                {sampleTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      setTagInput(tag);
                      executeScan(tag);
                    }}
                    className={`text-xs font-mono font-semibold px-3 py-1.5 rounded-xl border transition ${
                      tagInput === tag
                        ? 'bg-cat-yellow text-slate-950 font-bold border-amber-400 shadow-soft'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-amber-400 hover:bg-white'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-center space-x-3 shadow-2xs">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {/* Identified Asset Intelligence Card */}
        {scannedEquipment && (
          <div className="mt-4 p-6 bg-gradient-to-br from-amber-50/40 via-white to-amber-50/20 border border-amber-300/80 rounded-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 shadow-soft">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-2xs">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                    <span className="font-mono text-amber-600">#{scannedEquipment.equipment_id}</span>
                    <span className="text-slate-600 font-semibold text-sm">({scannedEquipment.equipment_type})</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">Tag verified against rental telemetry database</p>
                </div>
              </div>
              <StatusBadge status={scannedEquipment.status} size="md" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-medium">
              <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
                <span className="text-slate-500 block text-[11px]">Current Location:</span>
                <span className="font-bold text-slate-900 flex items-center gap-1.5 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-500" />
                  {scannedEquipment.current_site?.site_name || scannedEquipment.site_name || 'In Yard (Unassigned)'}
                </span>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
                <span className="text-slate-500 block text-[11px]">Operator Assignment:</span>
                <span className="font-bold text-slate-900 flex items-center gap-1.5 mt-1">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  {scannedEquipment.current_operator?.operator_name || scannedEquipment.operator_name || 'None Assigned'}
                </span>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
                <span className="text-slate-500 block text-[11px]">Operating Utilization:</span>
                <span className="font-mono font-bold text-emerald-600 block mt-1">
                  {scannedEquipment.usage_summary?.utilization_rate || 0}%
                  <span className="text-slate-500 text-[10px] ml-1">({scannedEquipment.usage_summary ? Number(scannedEquipment.usage_summary.total_engine_hours).toFixed(1) : '0.0'}h)</span>
                </span>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
                <span className="text-slate-500 block text-[11px]">Idle Ratio:</span>
                <span className="font-mono font-bold text-amber-700 block mt-1">
                  {scannedEquipment.usage_summary ? Number(scannedEquipment.usage_summary.total_idle_hours).toFixed(1) : '0.0'} hrs
                  <span className="text-slate-500 text-[10px] ml-1">idle</span>
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2">
              {scannedEquipment.status === 'AVAILABLE' && (
                <button
                  onClick={() => onOpenCheckout(scannedEquipment.equipment_id)}
                  className="px-4 py-2 bg-cat-yellow hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-soft"
                >
                  Check Out Equipment
                </button>
              )}

              {scannedEquipment.status === 'RENTED' && scannedEquipment.active_rental && (
                <button
                  onClick={() => onOpenCheckin(scannedEquipment.active_rental)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition shadow-soft"
                >
                  Check In Machine
                </button>
              )}

              <button
                onClick={() => onOpenLogUsage(scannedEquipment.equipment_id)}
                className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 rounded-xl text-xs font-semibold shadow-2xs transition"
              >
                Log Telemetry
              </button>

              <button
                onClick={() => onNavigateToEquipment(scannedEquipment.equipment_id)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition shadow-soft flex items-center gap-1.5"
              >
                <span>Full Asset Profile</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
