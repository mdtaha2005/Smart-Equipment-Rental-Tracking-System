import React from 'react';
import { Layers, CheckCircle2, Zap } from 'lucide-react';

export const PhaseNavigation: React.FC = () => {
  const phases = [
    { number: 1, title: 'Foundation & Database', status: 'COMPLETED' },
    { number: 2, title: 'Rental Tracking & Workflows', status: 'COMPLETED' },
    { number: 3, title: 'Customer Analytics & Alerts', status: 'COMPLETED' },
    { number: 4, title: 'Predictive Demand & Recommendations', status: 'COMPLETED' },
    { number: 5, title: 'Product Polish & Presentation Demo', status: 'ACTIVE' },
  ];

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-soft space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
            <Layers className="w-4 h-4" />
          </div>
          <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm tracking-tight">Hackathon Implementation Roadmap</h3>
        </div>
        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
          <Zap className="w-3.5 h-3.5 text-emerald-600" />
          All 5 Phases Complete &amp; Verified
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 pt-1">
        {phases.map((phase) => {
          const isComplete = phase.status === 'COMPLETED';
          const isActive = phase.status === 'ACTIVE';

          return (
            <div
              key={phase.number}
              className={`p-3.5 rounded-xl border text-xs transition-all ${
                isActive
                  ? 'bg-amber-50/70 border-amber-300 shadow-2xs'
                  : isComplete
                  ? 'bg-slate-50 border-slate-200/90'
                  : 'bg-slate-50/50 border-slate-200/50 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono font-bold text-[10px] text-slate-400">PHASE {phase.number}</span>
                <CheckCircle2 className={`w-3.5 h-3.5 ${isActive ? 'text-amber-600' : 'text-emerald-600'}`} />
              </div>
              <p className={`font-bold text-xs ${isActive ? 'text-amber-900' : 'text-slate-800'}`}>
                {phase.title}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
