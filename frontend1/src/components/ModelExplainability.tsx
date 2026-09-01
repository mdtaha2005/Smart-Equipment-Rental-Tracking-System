import React, { useState } from 'react';
import { Info, ChevronDown, ChevronUp, Cpu, Database, Compass, Sliders, Sparkles } from 'lucide-react';

export const ModelExplainability: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-soft space-y-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left text-xs font-bold text-slate-800 hover:text-amber-600 transition"
      >
        <div className="flex items-center space-x-2.5">
          <div className="w-6 h-6 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600">
            <Info className="w-4 h-4" />
          </div>
          <span className="text-slate-900 font-extrabold">
            How This Predictive Demand &amp; Decision Support Model Works
          </span>
        </div>
        <div className="flex items-center space-x-2 text-slate-400 text-xs font-normal">
          <span>{isOpen ? 'Collapse Pipeline' : 'Inspect Mathematical Architecture'}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="pt-3 text-xs text-slate-600 space-y-4 border-t border-slate-100 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-2 font-extrabold text-amber-800">
                <Database className="w-4 h-4 text-amber-500" />
                <span>1. Telemetry Ingestion</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                Ingests historical daily engine/idle hours, rental contracts, and site allocation records from the PostgreSQL database.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-2 font-extrabold text-sky-800">
                <Cpu className="w-4 h-4 text-sky-600" />
                <span>2. Random Forest Model</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                Fits a deterministic Random Forest Regressor on rolling engine load, site utilization intensity, and day-of-week seasonality.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-2 font-extrabold text-emerald-800">
                <Compass className="w-4 h-4 text-emerald-600" />
                <span>3. Demand Classification</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                Maps continuous predicted intensity scores to transparent operational levels: HIGH (&ge;0.65), MEDIUM (0.35&ndash;0.64), LOW (&lt;0.35).
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-2 font-extrabold text-indigo-800">
                <Sliders className="w-4 h-4 text-indigo-600" />
                <span>4. Explainable Actions</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                Compares underutilized machinery with high-demand sites to generate natural-language recommendations with human Accept/Dismiss control.
              </p>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 bg-amber-50/60 p-3.5 rounded-xl border border-amber-200/80 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Human-in-the-Loop Safeguard:</strong> This platform operates in decision support mode. Accepting a redeployment recommendation registers the manager's intent and guides field operations; it does not mutate physical telemetry until logistical dispatch is confirmed.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
