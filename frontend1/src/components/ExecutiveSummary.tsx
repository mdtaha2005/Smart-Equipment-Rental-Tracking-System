import React from 'react';
import { FileText, TrendingUp, AlertTriangle, ArrowRightLeft, MapPin } from 'lucide-react';
import { ExecutiveSummaryResponse } from '../api/demo';

interface ExecutiveSummaryProps {
  summary: ExecutiveSummaryResponse | null;
  loading?: boolean;
}

export const ExecutiveSummary: React.FC<ExecutiveSummaryProps> = ({ summary, loading }) => {
  if (loading || !summary) {
    return (
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-soft animate-pulse">
        <div className="h-4 bg-slate-300 rounded w-1/4 mb-3" />
        <div className="h-3 bg-slate-200 rounded w-3/4" />
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-amber-100/60 via-white to-amber-50/40 border-2 border-amber-300 rounded-2xl p-6 shadow-soft space-y-4">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-cat-yellow text-black font-black rounded-xl shadow-soft border border-slate-900">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-amber-950">
              Executive Rental Intelligence
            </h3>
            <span className="text-[11px] text-slate-700 font-semibold">Real-time operational snapshot generated from active fleet telematics</span>
          </div>
        </div>
        <span className="text-[10px] font-black bg-amber-200 text-amber-950 border border-amber-400 px-3 py-1 rounded-full shadow-2xs">
          Dynamic Telemetry Analysis
        </span>
      </div>

      {/* Narrative Quote Box */}
      <p className="text-xs sm:text-sm text-slate-900 leading-relaxed font-bold bg-white p-4 rounded-xl border border-amber-200 shadow-2xs">
        &ldquo;{summary.summary_narrative}&rdquo;
      </p>

      {/* 4 Mini Stat Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-xs">
        <div className="bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <span className="text-slate-600 text-[11px] font-bold flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-amber-600" /> Active Sites
          </span>
          <span className="font-black text-slate-950 font-mono text-sm">{summary.deployed_sites_count} Sites</span>
        </div>

        <div className="bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <span className="text-slate-600 text-[11px] font-bold flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-700" /> Avg Utilization
          </span>
          <span className="font-black text-emerald-800 font-mono text-sm">{summary.average_utilization_pct}%</span>
        </div>

        <div className="bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <span className="text-slate-600 text-[11px] font-bold flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-700" /> Attention Items
          </span>
          <span className="font-black text-rose-800 font-mono text-sm">{summary.attention_required_count} Alerts</span>
        </div>

        <div className="bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <span className="text-slate-600 text-[11px] font-bold flex items-center gap-1.5">
            <ArrowRightLeft className="w-4 h-4 text-amber-700" /> Redeploy Opts
          </span>
          <span className="font-black text-amber-950 font-mono text-sm">{summary.redeploy_candidate_count} Assets</span>
        </div>
      </div>
    </div>
  );
};
